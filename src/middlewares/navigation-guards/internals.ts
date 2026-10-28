import { getTrustedReferrerPathFromRequest } from "@proconnect-gouv/proconnect.core/security";
import { AuthorizationRequestLastHaltEnum } from "@proconnect-gouv/proconnect.identite/types";
import * as Sentry from "@sentry/node";
import type { Request, RequestHandler } from "express";
import { match, P } from "ts-pattern";
import { HOST } from "../../config/env";
import { context } from "../../connectors/context";
import {
  log_event,
  logger,
  logger_group,
  logger_group_end,
  track,
} from "../../services/log";
import { oidcProviderAdapterFactory } from "../../services/oidc-provider-adapter";

const { oidc_clients } = context.repository;

export type RequestContext = { req: Request };

export type HaltTo = {
  type: "halt-to";
  url: string;
  trace: Pass[];
};

export type ContinueTo = {
  type: "continue-to";
  url: string;
  trace: Pass[];
};

export type Send = { type: "send" };

export class Pass<
  TContext extends object = object,
  TCode extends string = string,
> {
  readonly type = "next" as const;
  constructor(
    public readonly code: TCode,
    public readonly data: TContext,
    public readonly trace: Pass[] = [],
  ) {}

  // The guard allows passage to the user.
  pass = <TNewCode extends string>(code: TNewCode) => {
    return new Pass(code, this.data, [...this.trace, this]);
  };

  // The guard halts the user and redirects to the page that should enable the user to comply with the requirements.
  haltTo = (url: string): HaltTo => {
    return { type: "halt-to", url, trace: [...this.trace, this] };
  };

  // The guard redirects to the next page of an ongoing compliance process.
  continueTo = (url: string): ContinueTo => {
    return { type: "continue-to", url, trace: this.trace };
  };

  // The guard sends a response to a HEAD request. This should not be its responsibility.
  // He has trained hard to become a navigation guard, and this mere task is not worthy of his time.
  send = (): Send => {
    return { type: "send" };
  };

  extends = <TAdditions extends object>(values: TAdditions) => {
    return new Pass(
      this.code,
      { ...this.data, ...values } as TContext & TAdditions,
      this.trace,
    );
  };

  static is_passing(result: GuardResult<string, object>): result is Pass {
    return result.type === "next";
  }
}

export type GuardResult<TCode extends string, TData extends object> =
  | Pass<TData, TCode>
  | HaltTo
  | ContinueTo
  | Send;

export function createGuardMiddleware(
  fn: (
    context: Pass<RequestContext, "incoming_request">,
  ) => GuardResult<string, object> | Promise<GuardResult<string, object>>,
): RequestHandler {
  return async (req, res, next) => {
    logger_group("👮‍", req.method, req.originalUrl, fn.name);

    const result = await fn(new Pass("incoming_request", { req }));

    const event = match(result)
      .with({ type: "next" }, ({ trace, code }) =>
        [trace.map(({ code }) => code).join("\n -> "), "\n => pass", code].join(
          " ",
        ),
      )
      .with(
        { type: P.union("halt-to", "continue-to") },
        ({ type, trace, url }) =>
          [
            trace.map(({ code }) => code).join("\n -> "),
            `\n => ${type}`,
            url,
          ].join(" "),
      )
      .with({ type: "send" }, () => ["SEND"].join(" "))
      .exhaustive();
    logger.debug(event);
    logger.trace(result);
    logger_group_end();

    return match(result)
      .with({ type: "next" }, () => next())
      .with({ type: "halt-to" }, async ({ trace, url }) => {
        req.session.redirectTo ??= getTrustedReferrerPathFromRequest(req, HOST);
        logger.debug("💾 save", req.session.redirectTo);
        await recordHalt({
          guard: fn.name,
          last_passed_check: trace.at(-1)?.code,
          req,
          url,
        });
        return res.redirect(url);
      })
      .with({ type: "continue-to" }, ({ url }) => res.redirect(url))
      .with({ type: "send" }, () => res.send())
      .exhaustive();
  };
}

async function recordHalt({
  guard,
  last_passed_check,
  req,
  url,
}: {
  guard: string;
  last_passed_check: string | undefined;
  req: Request;
  url: string;
}) {
  const { interactionCid: cid, interactionId, prompt, user } = req.session;
  log_event("navigation_guard.halted", {
    acr: prompt?.details["acr"],
    cid,
    guard,
    last_passed_check,
    prompt_reasons: prompt?.reasons,
    url,
    user_id: user?.id,
  });
  if (cid === undefined || interactionId === undefined) {
    return;
  }

  const step = new URL(url, HOST).pathname
    .replace(/^\/users\//, "")
    .replaceAll("-", "_");
  const last_halt = AuthorizationRequestLastHaltEnum.safeParse(step);
  if (!last_halt.success) {
    track("navigation_guard.halt.unknown", { cid, guard, url });
    return;
  }

  try {
    const interaction =
      await oidcProviderAdapterFactory("Interaction").find(interactionId);
    if (interaction === undefined) {
      return;
    }

    await oidc_clients.updateAuthorizationRequestLastHalt({
      interaction_cid: cid,
      last_halt: last_halt.data,
    });
  } catch (error) {
    logger.error(error);
    Sentry.captureException(error);
  }
}
