/**
 * check the page title is not the default website's one
 */
const hasPageTitle = (
  _ruleNode: any,
  {
    defaultTitle,
    win,
  }: {
    defaultTitle: string;
    win: Window;
  },
) => {
  /**
   * so, to get the document title, we rely on the passed `window` object given when we instantiate axe-core.
   * It's a bit hacky, on paper we should just use `cy.title()` but the axe-core way of handling
   * async checks doesn't play well with Cypress async stuff.
   *
   * Trying to set this check as async (by doing `const done = this.async()` and tell calling `done(result)`)
   * and then calling `cy.title()` just doesn't work.
   * So we have this way of accessing what we want instead.
   *
   * (and before you ask, we have to do this because just accessing `document.title`
   * uses a cypress modified title, not the real one)
   */
  const title = win.document.title;
  return title !== defaultTitle && title.includes(defaultTitle);
};

export const config = (defaultTitle: string, win: Window) => ({
  id: "mcp-has-page-title",
  evaluate: hasPageTitle,
  options: {
    defaultTitle,
    win,
  },
});
