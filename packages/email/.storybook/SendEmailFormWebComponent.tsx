//

type SendEmailOptions = {
  sender: { name: string; email: string };
  to: {
    name: string;
    email: string;
  }[];
  subject: string;
  htmlContent: string;
};

//

export class SendEmailFormWebComponent extends HTMLElement {
  static tag = "x-send-email-form" as const;
  static {
    customElements.define(this.tag, this);
  }
  static BREVO_API_KEY = import.meta.env["VITE_BREVO_API_KEY"];

  //

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    if (!SendEmailFormWebComponent.BREVO_API_KEY) {
      console.warn(
        "No API key found for brevo, please set VITE_BREVO_API_KEY env variable if you want to test the email in a real email client environment",
      );
      return;
    }

    this.#render();

    this.#form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.submit(this.innerHTML);
    });
  }

  async submit(template: string) {
    const headers = new Headers();
    headers.append("accept", "application/json");
    headers.append("api-key", SendEmailFormWebComponent.BREVO_API_KEY);
    headers.append("content-type", "application/json");

    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers,
      body: JSON.stringify({
        htmlContent: template,
        sender: {
          name: "ProConnect",
          email: "nepasrepondre@email.moncomptepro.beta.gouv.fr",
        },
        subject: this.#object.value,
        to: [{ name: "Ike Proconnect", email: this.#to.value }],
      } as SendEmailOptions),
      redirect: "follow",
    });
  }

  //

  #render() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = (
      <details
        style={{
          backgroundColor: "white",
          boxShadow: "0px 2px 6px 0px rgba(0, 0, 18, 0.16)",
          position: "fixed",
          bottom: "8px",
          right: "8px",
        }}
      >
        <summary style={{ background: "gainsboro", padding: "8px" }}>
          📨
        </summary>

        <form
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "8px",
          }}
        >
          <label style={{ display: "flex", alignItems: "center" }}>
            <div style={{ marginRight: "8px" }}>To</div>
            <input
              name="to"
              value="ike.proconnect@yopmail.com"
              style={{ flexGrow: 1 }}
            />
          </label>
          <label style={{ display: "flex", alignItems: "center" }}>
            <div style={{ marginRight: "8px" }}>Subject</div>
            <input
              name="object"
              value="[Localhost] test email"
              style={{ flexGrow: 1 }}
            />
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "end",
              justifyContent: "space-between",
            }}
          >
            <p style={{ marginBottom: "0" }}>
              Powered by <a href="https://brevo.com">Brevo</a>
            </p>
            <button>Send</button>
          </div>
        </form>
      </details>
    ).toString();
  }

  get #form() {
    const element = this.shadowRoot?.querySelector("form");
    if (!element) throw new Error("No form found");
    return element;
  }
  get #to() {
    const element = this.shadowRoot?.querySelector("input[name=to]");
    if (!element) throw new Error("No input[name=to] found");
    return element as HTMLInputElement;
  }
  get #object() {
    const element = this.shadowRoot?.querySelector("input[name=object]");
    if (!element) throw new Error("No input[name=object] found");
    return element as HTMLInputElement;
  }
}
