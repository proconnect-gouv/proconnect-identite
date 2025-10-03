/**
 * this is basically the document-title rule, except with a custom check that verifies we don't just have "ProConnect" as title
 *
 * @link https://github.com/dequelabs/axe-core/blob/develop/lib/rules/document-title.json
 */
export const config = (defaultTitle: string) => ({
  id: "mcp-page-title",
  impact: "serious",
  selector: "html",
  matches: "is-initiator-matches",
  metadata: {
    description:
      "Ensures each HTML document contains a specific <title> element and the website's name",
    help: `<title> should describe page content and include "${defaultTitle}"`,
    helpUrl:
      "https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#8.6",
  },
  any: ["mcp-has-page-title"],
});
