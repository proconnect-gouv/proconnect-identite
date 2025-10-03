//

export default function LogoutPage({ redirect_url }: LogoutPageProps) {
  return `
  <html color-mode="user">
    <meta http-equiv="refresh" content="1; url=${redirect_url}" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🇫🇷</text></svg>">
    <link rel="stylesheet" href="https://unpkg.com/mvp.css"/>
    <title>Déconnexion 🎭 FranceConnect 🎭</title>
    <header>
      <section>
        <h1>🎭 FranceConnect 🎭</h1>
      </section>
    </header>

    <header>
      <h2>Déconnexion en cours...</h2>
    </header>
    <blockquote>
      <div id="loading"></div>
    </blockquote>

    <style>
      /* from https://codepen.io/mandelid/pen/kNBYLJ*/

      #loading {
        animation: spin 1s ease-in-out infinite;
        -webkit-animation: spin 1s ease-in-out infinite;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: #fff;
        height: 50px;
        margin: 0 auto;
        width: 50px;
      }

      @keyframes spin {
        to { -webkit-transform: rotate(360deg); }
      }
      @-webkit-keyframes spin {
        to { -webkit-transform: rotate(360deg); }
      }
    <style/>
  </html>
  `;
}

type LogoutPageProps = {
  redirect_url: string;
};
