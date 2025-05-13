# @gouvfr-lasuite/proconnect.email

## Usage

```ts
import { DeleteFreeTotpMail } from "@gouvfr-lasuite/proconnect.email";

const transporter = nodemailer.createTransport({
  host: "smtp.example.com",
  port: 587,
  secure: false,
  auth: {
    user: "user@example.com",
    pass: "password",
  },
});

// [...]

const info = await transporter.sendMail({
  from: "user@example.com",
  to: "user@example.com",
  subject: "[ProConnect] Delete free TOTP",
  html: DeleteFreeTotpMail({
    baseurl: my_host_name,
    email: user.email,
    userId: user.id,
  }),
});
```

## Development

```
# In this directory launch the dev server
$ npm run storybook

  VITE vX.Y.Z  ready in X ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help

```

If you want to test with a real email service, you can use the `VITE_BREVO_API_KEY` environment variable:

```
$ VITE_BREVO_API_KEY=xxx npm run storybook
```
