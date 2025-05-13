import type { ErrorHandler } from "hono";

export default <ErrorHandler>((err, { json }) => {
  return json(
    {
      errors: [
        {
          code: "02003",
          title: "Entité non trouvée",
          detail: err.message,
          meta: {
            provider: "Infogreffe",
            provider_error: {
              code: "006",
              message: "DOSSIER NON TROUVE DANS LA BASE DE GREFFES",
            },
          },
        },
      ],
    },
    422,
  );
});
