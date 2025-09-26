import { customType } from "drizzle-orm/pg-core";

export const bytea = (name: string) =>
  customType<{ data: Uint8Array; driverData: Buffer }>({
    dataType() {
      // ← emitted into SQL
      return "bytea";
    },
    toDriver(value) {
      // Drizzle → PG
      return Buffer.isBuffer(value) ? value : Buffer.from(value);
    },
    fromDriver(value) {
      // PG → Drizzle
      return new Uint8Array(value); // node-pg gives Buffer
    },
  })(name);
