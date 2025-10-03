//

import { snapshot } from "node:test";

//

// Set up serializer to preserve raw HTML formatting
snapshot.setDefaultSnapshotSerializers([
  (value) => {
    // Return HTML strings as-is without JSON encoding
    if (typeof value === "string" && value.includes("<html>")) {
      return value;
    }
    // Default serialization for other values
    return JSON.stringify(value, null, 2);
  },
]);

//
