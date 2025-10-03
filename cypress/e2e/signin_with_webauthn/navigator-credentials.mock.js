Object.defineProperty(navigator, "credentials", {
  configurable: true,
  value: {
    create: async (options) => window.top.navigator.credentials.create(options),
    get: async (options) => {
      if (options?.mediation === "conditional") return null;
      const serialized = JSON.parse(
        JSON.stringify(options, (k, v) =>
          k === "signal" || v instanceof AbortSignal
            ? undefined
            : ArrayBuffer.isView(v) || v instanceof ArrayBuffer
              ? Array.from(new Uint8Array(v))
              : v,
        ),
      );
      if (serialized.publicKey) {
        if (serialized.publicKey.challenge) {
          serialized.publicKey.challenge = new Uint8Array(
            serialized.publicKey.challenge,
          );
        }
        if (serialized.publicKey.allowCredentials) {
          serialized.publicKey.allowCredentials =
            serialized.publicKey.allowCredentials.map((c) => ({
              ...c,
              id: new Uint8Array(c.id),
            }));
        }
      }
      return await window.top.navigator.credentials.get(serialized);
    },
  },
});
