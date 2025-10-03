//

import type { Component, PropsWithChildren } from "@kitajs/html";
import { escapeHtml } from "@kitajs/html";
import type {
  ComponentAnnotations,
  Renderer,
  StoryAnnotations,
} from "@storybook/csf";
import { ChangeView } from "./ChangeView";
import { SendEmailFormWebComponent } from "./SendEmailFormWebComponent";

//

class NoFileException extends Error {}
class NoStoryMetaException extends Error {}
class VariantNotFoundException extends Error {}

//

document.getElementById("root")!.innerHTML = await Root();
window.addEventListener("hashchange", async () => {
  document.getElementById("root")!.innerHTML = await Root();
});

//

async function Root() {
  return (
    <AppContainer>
      <Navbar>
        <NavbarHeader>
          <h3>Email Templates</h3>
        </NavbarHeader>

        <StoriesList />
      </Navbar>
      <Main>
        <TitleHeader />
        <Preview />
        <SendEmail />
      </Main>
    </AppContainer>
  );
}

//

function StoriesList() {
  const stories = getStoriesFiles();
  return (
    <ul
      style={{
        listStyleType: "none",
        padding: 0,
      }}
    >
      {stories.map((value) => (
        <StoriesListItem value={value} />
      ))}
    </ul>
  );
}

function StoriesListItem({
  value: [file, story],
}: {
  value: [string, StoriesModule];
}) {
  const isActive = location.hash.slice(2).split("#")[0] === file;
  const { default: defaultStory, ...variantStories } = story;

  return (
    <li>
      <a
        style={{
          borderRight: isActive ? "2px solid #273142" : "2px solid transparent",
          color: "currentcolor",
          display: "block",
          padding: "10px",
          paddingLeft: "20px",
        }}
        href={`#/${file}`}
      >
        {defaultStory.title || file}
      </a>
      <VariantStoriesList value={{ file, stories: variantStories }} />
    </li>
  );
}

function VariantStoriesList({
  value: { file, stories },
}: {
  value: { file: string; stories: VariantStorie };
}) {
  const entries = Object.entries(stories) as [string, VariantStorie][];
  if (entries.length === 0) return null;
  return (
    <ul>
      {entries.map(([key, story]) => (
        <li>
          <StoryLink value={{ file, key }}>{story.name || key}</StoryLink>
        </li>
      ))}
    </ul>
  );
}

function StoryLink(
  props: PropsWithChildren<{ value: { file: string; key: string } }>,
) {
  const { children } = props;
  const { file, key } = props.value;
  const href = `#/${file}#${key}`;
  const isActive = location.hash === href;
  return (
    <a
      href={href}
      style={{
        borderRight: isActive ? "2px solid #273142" : "2px solid transparent",
        color: "currentcolor",
        display: "block",
      }}
    >
      {children}
    </a>
  );
}

async function TitleHeader() {
  const file = getFileNameFromLocation();

  if (!file) return <></>;
  const [story_err, story] = await getStory(file);
  if (story_err) return <></>;
  return (
    <header
      style={{
        backgroundColor: "#f0f0f0",
        borderBottom: "1px solid #e6ebf1",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px",
      }}
    >
      {story.default.title}

      <tag of={ChangeView.tag}></tag>
    </header>
  );
}

function Preview() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        overflowY: "auto",
      }}
    >
      <DesktopPreview />
      <HTMLPreview />
    </div>
  );
}

async function DesktopPreview() {
  if (ChangeView.current !== "desktop") return <></>;
  return (
    <iframe
      style={{
        border: 0,
        flexGrow: 1,
      }}
      srcdoc={await EmailContent()}
    ></iframe>
  );
}

async function HTMLPreview() {
  if (ChangeView.current !== "html") return <></>;
  const { format } = await import("prettier");
  const htmlParsers = await import("prettier/parser-html");
  const source = escapeHtml(await EmailContent());
  return (
    <textarea readonly style={{ height: "100%" }}>
      {format(source, {
        arrowParens: "always",
        bracketSameLine: false,
        bracketSpacing: true,
        embeddedLanguageFormatting: "auto",
        experimentalTernaries: false,
        htmlWhitespaceSensitivity: "css",
        insertPragma: false,
        jsxSingleQuote: false,
        parser: "html",
        plugins: [htmlParsers],
        printWidth: 80,
        proseWrap: "preserve",
        quoteProps: "as-needed",
        requirePragma: false,
        semi: true,
        singleAttributePerLine: false,
        singleQuote: false,
        tabWidth: 2,
        trailingComma: "all",
        useTabs: false,
        vueIndentScriptAndStyle: false,
      })}
    </textarea>
  );
}

async function EmailContent() {
  const [template_err, template] = await getStoryTemplate();
  if (template_err instanceof NoFileException) {
    return <Welcome />;
  } else if (template_err) {
    return (
      <ErrorSection>
        {template_err.name}
        <br />
        {template_err.message}
      </ErrorSection>
    );
  }
  return "<!doctype html>" + template;
}

//

async function SendEmail() {
  const [template_err, template] = await getStoryTemplate();
  if (template_err) return <></>;
  return <tag of={SendEmailFormWebComponent.tag}>{template}</tag>;
}

//

interface Meta extends ComponentAnnotations<Renderer> {
  render: Component;
}

type VariantStorie = StoryAnnotations<Renderer>;
type StoriesModule = {
  default: Meta;
} & Partial<Record<string, VariantStorie>>;

function getStoriesFiles() {
  return Object.entries(
    import.meta.glob("../src/**/*.stories.tsx", {
      eager: true,
    }),
  ) as [string, StoriesModule][];
}

async function getStory(
  file: string,
): Promise<[Error, null] | [null, StoriesModule]> {
  try {
    return [null, await import(/* @vite-ignore */ file)];
  } catch (e) {
    return [e as Error, null];
  }
}

function getFileNameFromLocation() {
  return location.hash.slice(2).split("#")[0];
}

function getVariantFromLocation() {
  return location.hash.slice(2).split("#")[1];
}

export async function getStoryTemplate(): Promise<
  [Error, null] | [null, string]
> {
  const file = getFileNameFromLocation();
  if (!file) return [new NoFileException(), null];

  const [story_err, story] = await getStory(file);
  if (story_err) return [story_err, null];

  const meta = story.default;
  if (!meta.render)
    return [
      new NoStoryMetaException(`"${file}" default might not be story...`),
      null,
    ];

  const variant = getVariantFromLocation();
  const variantAnnotation = story[variant];
  if (variant && !variantAnnotation) {
    return [
      new VariantNotFoundException(`Unknown variant "${variant}" in ${file}`),
      null,
    ];
  }

  const defaultArgs = meta.args || {};
  const args = { ...defaultArgs, ...variantAnnotation?.args };
  return [null, meta.render(args).toString()];
}

//

function AppContainer({ children }: PropsWithChildren) {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
      }}
    >
      {children}
    </div>
  );
}
function Navbar({ children }: PropsWithChildren) {
  return (
    <nav
      style={{
        minWidth: "250px",
        backgroundColor: "#f0f0f0",
        overflowY: "auto",
        borderRight: "1px solid #e6ebf1",
      }}
    >
      {children}
    </nav>
  );
}

function NavbarHeader({ children }: PropsWithChildren) {
  return <header style={{ margin: "20px" }}>{children}</header>;
}

function Main({ children }: PropsWithChildren) {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        overflowY: "auto",
      }}
    >
      {children}
    </main>
  );
}

function ErrorSection({ children }: PropsWithChildren) {
  return (
    <pre
      style={{
        backgroundColor: "black",
        color: "white",
        flexGrow: 1,
        margin: "0",
        overflowY: "auto",
        padding: "20px",
      }}
    >
      {children}
    </pre>
  );
}

function Welcome() {
  return (
    <html style={{ minHeight: "100vh", display: "flex" }}>
      <body style={{ margin: "0", display: "flex", flexGrow: 1 }}>
        <section
          style={{
            flexGrow: 1,
            backgroundColor: "black",
            color: "white",
            padding: "20px",
          }}
        >
          <h1>Welcome to the Email Template "Storybook"</h1>

          <p> 🫲 Click on a story to see it in action.</p>
        </section>
      </body>
    </html>
  );
}
