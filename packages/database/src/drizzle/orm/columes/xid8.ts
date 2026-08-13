import { customType } from "drizzle-orm/pg-core";

export const xid8 = (name: string) =>
  customType<{ data: string; driverData: string }>({
    dataType() {
      // ← emitted into SQL
      return "xid8";
    },
    toDriver(value) {
      // Drizzle → PG
      return value;
    },
    fromDriver(value) {
      // PG → Drizzle (node-pg already returns xid8 as a string)
      return value;
    },
  })(name);
