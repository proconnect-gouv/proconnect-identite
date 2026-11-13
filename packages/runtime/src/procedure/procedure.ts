//

import type {
  ActivityTargets,
  Actor,
  ContextMap,
  RuntimeContext,
} from "#src/activity";
import type { IdentiteTransaction } from "#src/database";
import { insertActivity } from "#src/journal";
import * as z from "zod";

//

type ActivityContext = ContextMap[string];

type SchemaMap = Record<string, z.ZodType<ActivityContext>>;

type Journal<Outcome> = { outcome: Outcome; targets: ActivityTargets };

type Result<Outcome> = { kind: string; journal?: Journal<Outcome> };

type Mutation<Inputs, Private, Returned> = (args: {
  actor: Actor;
  inputs: Inputs;
  private: Private;
  tx: IdentiteTransaction;
}) => Promise<Returned>;

// What the runtime needs from any procedure, whatever its types: the schemas
// it publishes and a runner that parses the call, then mutates inside `tx`.
type Leaf = {
  context: z.ZodType<ActivityContext>;
  inputs: z.ZodType;
  outcome: z.ZodType;
  prepare: (
    raw: unknown,
    actor: Actor,
  ) => (tx: IdentiteTransaction) => Promise<{
    journal?: { context: ActivityContext; targets: ActivityTargets };
    returned: object;
  }>;
};

export type Procedure<
  Inputs,
  Private,
  Outcome,
  Returned extends Result<Outcome>,
> = Leaf & { mutation: Mutation<Inputs, Private, Returned> };

export type Procedures = { [key: string]: Procedures | Leaf };

export type Client<R> = {
  [Key in keyof R]: R[Key] extends {
    mutation: Mutation<infer Inputs, infer Private, infer Returned>;
  }
    ? {
        mutate: (
          inputs: CallArgument<Inputs> & CallArgument<Private>,
        ) => Promise<MutateResult<Returned>>;
      }
    : Client<R[Key]>;
};

type CallArgument<Schema> = [Schema] extends [Record<string, never>]
  ? unknown
  : Schema;

type MutateResult<Returned> = Returned extends { journal: unknown }
  ? Omit<Returned, "journal"> & { activity_id: number }
  : Returned;

export type ContextSchemasOf<
  R,
  Prefix extends string = "",
> = UnionToIntersection<
  {
    [Key in keyof R & string]: R[Key] extends { context: infer Schema }
      ? { [Action in `${Prefix}${Key}`]: Schema }
      : ContextSchemasOf<R[Key], `${Prefix}${Key}.`>;
  }[keyof R & string]
>;

type UnionToIntersection<Union> = (
  Union extends unknown ? (value: Union) => void : never
) extends (value: infer Intersection) => void
  ? Intersection
  : never;

export type Disjoint<A, B> = [Extract<keyof A, keyof B>] extends [never]
  ? unknown
  : { duplicate_action: Extract<keyof A, keyof B> };

// One flat call, split by schema: `inputs` is journaled as `context.inputs`,
// `private` (secrets, target ids) reaches the mutation and is never stored.
const noPrivate: z.ZodType<unknown> = z.object({});

export const procedure = {
  inputs: <Inputs>(inputs: z.ZodType<Inputs>) => ({
    outcome: <Outcome>(outcome: z.ZodType<Outcome>) =>
      withOutcome(inputs, noPrivate, outcome),
    private: <Private>(secret: z.ZodType<Private>) => {
      const shared = sharedKeys(inputs, secret);
      if (shared.length > 0) {
        throw new Error(`keys both journaled and private: ${shared}`);
      }
      return {
        outcome: <Outcome>(outcome: z.ZodType<Outcome>) =>
          withOutcome(inputs, secret, outcome),
      };
    },
  }),
};

function sharedKeys(a: z.ZodType, b: z.ZodType) {
  if (!(a instanceof z.ZodObject) || !(b instanceof z.ZodObject)) return [];
  return Object.keys(a.shape).filter((key) => key in b.shape);
}

function withOutcome<Inputs, Private, Outcome>(
  inputs: z.ZodType<Inputs>,
  secret: z.ZodType<Private>,
  outcome: z.ZodType<Outcome>,
) {
  const context = z.object({ inputs, outcome });
  return {
    mutation: <Returned extends Result<Outcome>>(
      mutation: Mutation<Inputs, Private, Returned>,
    ): Procedure<Inputs, Private, Outcome, Returned> => ({
      context,
      inputs,
      mutation,
      outcome,
      prepare: (raw, actor) => {
        const parsed = inputs.parse(raw);
        const hidden = secret.parse(raw);
        return async (tx) => {
          const { journal, ...returned } = await mutation({
            actor,
            inputs: parsed,
            private: hidden,
            tx,
          });
          if (!journal) return { returned };
          return {
            journal: {
              context: context.parse({
                inputs: parsed,
                outcome: journal.outcome,
              }),
              targets: journal.targets,
            },
            returned,
          };
        };
      },
    }),
  };
}

export function contextSchemasOf<P extends Procedures>(
  procedures: P,
): ContextSchemasOf<P> {
  const schemas = leaves(procedures, []).map(([action, leaf]) => [
    action,
    leaf.context,
  ]);
  return Object.fromEntries(schemas) as ContextSchemasOf<P>;
}

export function mergeContextSchemas<A extends SchemaMap, B extends SchemaMap>(
  standalone: A,
  procedures: B & Disjoint<A, B>,
): A & B {
  for (const action of Object.keys(procedures)) {
    if (action in standalone) throw new Error(`duplicate action ${action}`);
  }
  return { ...standalone, ...procedures };
}

export function mergeProcedures<R extends Procedures, A extends Procedures>(
  runtime: R,
  app: A | undefined,
): R & A {
  return deepMerge(runtime, app ?? {}, []) as R & A;
}

function deepMerge(a: Procedures, b: Procedures, path: string[]): Procedures {
  const merged: Procedures = { ...a };
  for (const [key, node] of Object.entries(b)) {
    const existing = merged[key];
    if (!existing) {
      merged[key] = node;
      continue;
    }
    if (isLeaf(existing) || isLeaf(node)) {
      throw new Error(`duplicate action ${[...path, key].join(".")}`);
    }
    merged[key] = deepMerge(existing, node, [...path, key]);
  }
  return merged;
}

// An app-local procedure that writes a published action must be built from
// that action's `inputs` and `outcome` schemas, so the two cannot drift.
export function assertPublishedSchemas(
  app: Procedures | undefined,
  schemas: Record<string, z.ZodType>,
) {
  for (const [action, { inputs, outcome }] of leaves(app ?? {}, [])) {
    const published = schemas[action];
    if (!published) continue;
    const shape = published instanceof z.ZodObject ? published.shape : {};
    if (shape["inputs"] !== inputs || shape["outcome"] !== outcome) {
      throw new Error(
        `${action}: build the procedure from the published schema`,
      );
    }
  }
}

function isLeaf(node: Procedures | Leaf): node is Leaf {
  return "prepare" in node && typeof node["prepare"] === "function";
}

function leaves(procedures: Procedures, path: string[]): [string, Leaf][] {
  return Object.entries(procedures).flatMap(([key, node]) => {
    if (!isLeaf(node)) return leaves(node, [...path, key]);
    const leaf: [string, Leaf] = [[...path, key].join("."), node];
    return [leaf];
  });
}

export function bindProcedures<P extends Procedures>(
  procedures: P,
  { actor, app, db }: RuntimeContext,
  path: string[] = [],
): Client<P> {
  const entries = Object.entries(procedures).map(([key, node]) => {
    if (!isLeaf(node)) {
      return [key, bindProcedures(node, { actor, app, db }, [...path, key])];
    }
    const action = [...path, key].join(".");
    const mutate = async (raw: unknown) => {
      const run = node.prepare(raw, actor);
      return db.transaction(async (tx) => {
        const { journal, returned } = await run(tx);
        if (!journal) return returned;
        const { activity_id } = await insertActivity<ContextMap>(tx, {
          action,
          actor,
          app,
          context: journal.context,
          ...journal.targets,
        });
        return { ...returned, activity_id };
      });
    };
    return [key, { mutate }];
  });
  return Object.fromEntries(entries) as Client<P>;
}
