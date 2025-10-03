//

export class ChangeView extends HTMLElement {
  static tag = "x-change-view" as const;
  static {
    customElements.define(this.tag, this);
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.#render();

    this.#inputs.forEach((element) => {
      element.addEventListener("click", () => {
        this.#view = element.value as "desktop" | "html";
      });
    });
  }
  #render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = (
      <ChangeViewUI view={ChangeView.current} />
    ).toString();
  }

  //

  static get current(): "desktop" | "html" {
    const view = new URLSearchParams(location.search).get("view");
    return view === "html" ? view : "desktop";
  }

  set #view(value: "desktop" | "html") {
    const url = new URL(location.href);
    url.searchParams.set("view", value);
    window.location.href = url.toString();
  }

  //

  get #inputs() {
    if (!this.shadowRoot) throw new Error("ShadowRoot not found");
    return this.shadowRoot.querySelectorAll("button");
  }
}

function ChangeViewUI({ view }: { view: string }) {
  return (
    <nav>
      <button disabled={view === "desktop"} value="desktop">
        Desktop
      </button>
      <button disabled={view === "html"} value="html">
        HTML
      </button>
    </nav>
  );
}
