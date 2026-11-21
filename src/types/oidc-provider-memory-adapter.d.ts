declare module "oidc-provider/lib/adapters/memory_adapter.js" {
  import type { Adapter } from "oidc-provider";
  const MemoryAdapter: new (model: string) => Adapter;
  export default MemoryAdapter;
}
