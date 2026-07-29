# Contributing to ProConnect Email Templates

> Guide for developers working on email templates

## 🚀 Development Process

### Setup Development Environment

```bash
# Start Storybook (uses Vite)
npm run storybook
```

## 📦 Package Architecture

```
src/
├── components/          # Reusable email components
│   ├── Html.tsx        # Base HTML wrapper
│   ├── Section.tsx     # Email section container
│   ├── Text.tsx        # Styled text component
│   └── ...
├── *.tsx               # Email template components
├── *.stories.tsx       # Storybook stories (test data)
├── *.test.tsx          # Snapshot tests
├── *.test.tsx.snapshot # Pretty HTML snapshots
├── test-utils.ts       # Shared testing utilities
└── index.ts            # Public API exports
```

Each email template follows this pattern: component + story + test files.

## 📧 Creating New Email Templates

### 1. Create Component Files

```bash
# Create component file
touch src/MyNewTemplate.tsx

# Create Storybook story
touch src/MyNewTemplate.stories.tsx

# Create test file
touch src/MyNewTemplate.test.tsx
```

### 2. Follow Component Pattern

```typescript
// 1. Component with typed props
export default function MyNewTemplate(props: Props) {
  return <Layout>...</Layout>
}


// 2. Storybook story with realistic data
import type { ComponentAnnotations, Renderer } from "@storybook/csf";
import MyNewTemplate, { type Props } from "./MyNewTemplate";

export default {
  title: "My New Template",
  render: MyNewTemplate,
  args: {
    /* ... realistic test data ... */
  } satisfies Props,
} as ComponentAnnotations<Renderer, Props>;

// 3. Snapshot test using story data
import { describe, it } from "node:test";
import { format } from "prettier";
import MyNewTemplate, { type Props } from "./MyNewTemplate.js";
import storyConfig from "./MyNewTemplate.stories.js";
import "./test-utils.js";

describe("MyNewTemplate", () => {
  it("should render", async (t) => {
    const props = storyConfig.args as Props;
    const rendered = (<MyNewTemplate {...props} />).toString();
    const formatted = await format(rendered, { parser: "html" });
    t.assert.snapshot(formatted);
  });
});
```

### 3. Development Workflow

```bash
# Start Storybook for visual development
npm run storybook
```

## 🧪 Updating Snapshots

When you modify a template component, the snapshot test will fail showing the differences. To update snapshots:

```bash
# Update all snapshots in the package
npm run test:unit -- --test-update-snapshots src/**/*.test.tsx

# Update specific component snapshot
npm run test:unit -- --test-update-snapshots src/MyNewTemplate.test.tsx
```

**When to update snapshots:**

- ✅ After intentional template changes (layout, content, styling)
- ✅ When adding new props or functionality
- ✅ After fixing bugs that affect HTML output

**Review checklist before updating:**

- 🔍 Verify changes are intentional and expected
- 🔍 Check HTML output renders correctly in email clients
- 🔍 Ensure accessibility is maintained
- 🔍 Confirm no unintended side effects

## 🚢 Testing Commands

```bash
# Run all email component tests
npm test

# Type check all files
npm run type-check

# Launch Storybook for visual testing
npm run storybook
```

## 🎨 Email Service Testing

For testing with real email service, use:

```bash
VITE_BREVO_API_KEY=xxx npm run storybook
```
