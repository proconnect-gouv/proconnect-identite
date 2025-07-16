# Contributing

Thank you for your interest in contributing! We welcome improvements, bug fixes, and new features. To keep our workflow smooth and consistent, please follow these guidelines.

---

## Branches

### Main branch

* The default development branch is `main`.

### Branch naming

* Use a descriptive name that recalls the purpose, for example:

  * `feature-add-authentication`
  * `fix-update-dependencies`
* Avoid generic names like `patch-1` or `branch123`.
* Feel free to choose any clear, concise format.

---

## Commits

### Scope

* Make small, focused commits (micro commits).
* Avoid touching too many files in a single commit.

### Message format

* Use [Gitmoji](https://gitmoji.dev/) for an emoji prefix (e.g., `✨`, `🐛`, `💄`).
* Write a short subject that clearly describes the change; it will appear in the changelog.

  * Example: `💄 change duplicate icon`

### Commit body

* Include detailed context or rationale here.
* Do **not** post PR details or discussion in external chat channels; document them in the commit instead.

---

## Pull Requests

### Labels

* GitHub will apply labels automatically.

### Content

* Keep PRs small and focused; ideally one commit per PR.
* PRs are merged into `main` using a **merge commit**.
* Clean up or squash commits before pushing (on macOS, you can use [GitUp](https://github.com/git-up/GitUp)).

### Title

* **Single-commit PR**: use the default commit message as the PR title.
* **Multi-commit PR**: craft a title following the commit message guidelines above.

### Description

* **Single-commit PR**: the default description is usually sufficient.
* **When needed**, add context, for example:

  * Database migrations to run: `npm run migrate`
  * This PR reverts #123.
* Link related Trello cards using the Trello Power-Up.
* Feel free to include illustrative GIFs to demonstrate changes.

---

## Questions or Help

If you need assistance, please open an issue or ask in our [community channel](https://tchap.gouv.fr/#/room/!kBghcRpyMNThkFQjdW:agent.dinum.tchap.gouv.fr?via=agent.dinum.tchap.gouv.fr&via=agent.finances.tchap.gouv.fr&via=agent.interieur.tchap.gouv.fr). We appreciate your contributions!
