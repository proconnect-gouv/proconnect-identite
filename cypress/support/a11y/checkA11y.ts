//

import type { NodeResult, Result, UnlabelledFrameSelector } from "axe-core";
import { config as hasPageTitleCheck } from "./checks/has-page-title";
import { config as pageTitleRule } from "./rules/page-title";

//

/**
 * add custom rules to our axe instance
 *
 * note: this is called automatically by `checkA11y`
 *
 * @param win window object of the current page
 */
const configureAxe = (win: Window) => {
  cy.configureAxe({
    checks: [hasPageTitleCheck("ProConnect", win)],
    rules: [pageTitleRule("ProConnect")],
  });
};

/**
 * custom `checkA11y` function to simplify a11y checks accross all tests:
 *
 * - automatically inject axe script in the page if needed (no need to call `cy.injectAxe()` anymore)
 * - calls the original cypress-axe `checkA11y` function to run the checks
 * - improve both UI logs and console logs
 * - removes default cypress-axe logs that are not as useful as ours
 */
export const checkA11y: Parameters<
  typeof Cypress.Commands.overwrite<"checkA11y">
>[1] = (
  originalCheckA11y,
  context,
  options,
  violationCallback,
  skipFailures = false,
) => {
  injectAxeIfNeeded();
  originalCheckA11y(
    context,
    options,
    (violations) => {
      // make sure any custom callback is still called
      if (violationCallback) {
        violationCallback(violations);
      }

      // display our custom logs that make it easier to understand issues, especially from the console
      displayViolations(violations);

      // then, remove items from violations array: purpose here is to prevent original `checkA11y` axe-core
      // function to generate Cypress.logs/assertions after our custom callback that does the same thing
      const violationsCount = violations.length;
      violations.splice(0, violations.length);

      // then, make an assertion if we don't want to skip failures.
      // cy.wrap is here to make sure our `displayViolations` logs are displayed before the assertion
      cy.wrap(violationsCount, { log: false }).then((count) => {
        if (!skipFailures) {
          assert.equal(
            count,
            0,
            `${count} accessibility violation${
              count === 1 ? "" : "s"
            } detected`,
          );
        }
      });
    },
    // do not use the default `skipFailures` behavior, we handle it ourselves above
    true,
  );
};

/**
 * inject Axe script in the page only if it's not already there
 */
const injectAxeIfNeeded = () => {
  cy.window({ log: false }).then((win) => {
    if (!win.axe) {
      cy.injectAxe();
      configureAxe(win);
    }
  });
};

/**
 * Display the accessibility violations in Cypress UI
 *
 * @param violations array of results returned by Axe
 * @link https://github.com/jonoliver/cypress-axe-demo/blob/after-a11y-fixes/cypress/support/commands.js
 */
const cypressLog = (violations: Result[]) => {
  violations.forEach((violation) => {
    const targets = violation.nodes.map(({ target }) => target);
    const domElements = Cypress.$(targets.join(","));
    const consoleProps = () => violation;
    const { help, helpUrl, impact } = violation;

    Cypress.log({
      $el: domElements,
      consoleProps,
      message: `[${help}](${helpUrl})`,
      name: `${impact} a11y issue`,
    });

    targets.forEach((target) => {
      const el = Cypress.$(target.join(","));
      Cypress.log({
        $el: el,
        consoleProps,
        message: getElementString(el.get(0), target),
        name: "dom element:",
      });
    });
  });
};

/**
 * Display the accessibility violation table in the terminal
 *
 * @param violations array of results returned by Axe
 * @link https://github.com/component-driven/cypress-axe#in-your-spec-file
 */
const terminalLog = (violations: Result[]) => {
  if (!violations?.length) {
    return;
  }

  const violationsCountMessage = `${violations.length} accessibility violation${
    violations.length > 1 ? "s" : ""
  } detected`;

  const logs = [violationsCountMessage];

  // api: https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#results-object
  violations.forEach(({ id, impact, nodes }, i) => {
    logs.push(`  ${i + 1}. [${id}] (${impact} issue):`);
    getTerminalViolationElements({ nodes }).forEach((el) =>
      logs.push(`     • ${el}`),
    );
  });
  logs.push("Help to resolve accessibility issues:");
  violations.forEach(({ id, help, helpUrl }, i) => {
    logs.push(`  ${i + 1}. [${id}]: ${help}`, `    ${helpUrl}`);
  });

  cy.task("log", logs.join("\n"), { log: false });
};

/**
 * Display the violations in both cypress and terminal logs
 *
 * Those custom logs help us understand better the location of the issues on the page
 * with our `getElementString` function
 *
 * @param violations array of results returned by Axe
 */
const displayViolations = (violations: Result[]) => {
  terminalLog(violations);
  cypressLog(violations);
};

const getTerminalViolationElements = ({ nodes }: { nodes: NodeResult[] }) => {
  const targets = nodes.map(({ target }) => target);
  const domElements = Cypress.$(targets.join(","));
  return domElements
    .map((i, el) => {
      return getElementString(el, targets[i]);
    })
    .get();
};

const getElementString = (
  el: HTMLElement,
  defaultSelector: UnlabelledFrameSelector,
) => {
  const selector = el.id ? `#${el.id}` : defaultSelector;
  if (el.textContent && !["html", "body"].includes(el.tagName.toLowerCase())) {
    let content = el.textContent.replace(/\n/g, " ").trim();
    content = content.length > 15 ? `${content.slice(0, 15)}…` : content;
    return `${selector} "${content}"`;
  }
  return selector;
};
