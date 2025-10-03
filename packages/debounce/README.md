# 📦 @proconnect-gouv/proconnect.debounce

> ⚡ Typed Debounce API for ProConnect

## ⚙️ Installation

```bash
npm install @proconnect-gouv/proconnect.debounce
```

## 📖 Usage

### [Single Validation](https://developers.debounce.io/reference/single-validation)

```ts
import { singleValidationFactory } from "@proconnect-gouv/proconnect.debounce/api";

const singleValidation = singleValidationFactory(DEBOUNCE_API_KEY);

const response = await singleValidation("test@test.com");
```

## 📖 License

[MIT](./LICENSE.md)
