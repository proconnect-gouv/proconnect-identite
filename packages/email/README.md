# 📧 ProConnect Email Templates

> Email templates for the ProConnect identity platform.

## 📦 Installation

```bash
npm install @gouvfr-lasuite/proconnect.email
```

## 📧 Usage

```typescript
import { DeleteFreeTotpMail } from "@gouvfr-lasuite/proconnect.email";

const transporter = nodemailer.createTransporter({
  host: "smtp.example.com",
  port: 587,
  secure: false,
  auth: {
    user: "user@example.com",
    pass: "password",
  },
});

// Send email with template
const info = await transporter.sendMail({
  from: "user@example.com",
  to: "user@example.com",
  subject: "[ProConnect] Delete free TOTP",
  html: DeleteFreeTotpMail({
    baseurl: "https://identite.proconnect.gouv.fr",
    given_name: "Marie",
    family_name: "Dupont",
    support_email: "support@example.com",
  }),
});
```

## 📦 Available Templates

| Template                           | Purpose                            |
| ---------------------------------- | ---------------------------------- |
| `Add2fa`                           | 2FA activation confirmation        |
| `AddAccessKey`                     | API key creation notification      |
| `Delete2faProtection`              | 2FA removal warning                |
| `DeleteAccessKey`                  | API key deletion notice            |
| `DeleteAccount`                    | Account deletion confirmation      |
| `DeleteFreeTotpMail`               | TOTP removal notification          |
| `MagicLink`                        | Passwordless login link            |
| `ModerationProcessed`              | Organization moderation completion |
| `OfficialContactEmailVerification` | Official contact verification      |
| `ResetPassword`                    | Password reset instructions        |
| `UpdatePersonalDataMail`           | Profile update summary             |
| `VerifyEmail`                      | Email address verification         |
| `Welcome`                          | New user onboarding                |

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.
