# AGENT.md — Engineering Rules for Resilia

This file defines the permanent engineering principles, rules, and operational guidelines for the **Resilia** project.

---

## 1. Think Before Coding

* **State assumptions out loud** before implementing any non-trivial change.
* If a request is ambiguous, **ask instead of guessing**.
* If a simpler approach exists, **push back and explain why**.
* **Stop when confused.** Explicitly state what is unclear rather than silently choosing an arbitrary interpretation and continuing.
* Before coding, identify:
  * What is being requested.
  * What is explicitly not being requested.
  * What files are likely to change.
  * How the result will be verified.
* **Do not invent requirements.**

---

## 2. Simplicity First

* Write the **minimum code** that solves the problem.
* Do not introduce speculative abstractions.
* Do not add flexibility that nobody asked for.
* Do not create:
  * Unnecessary services
  * Unnecessary repositories
  * Unnecessary providers / notifiers
  * Unnecessary managers
  * Unnecessary base classes
  * Unnecessary generic components
  * Premature design systems
  * Premature state-management architecture
* Use the simplest appropriate mechanisms for the current stack (e.g. plain React components, local state, hooks, and small reusable UI helpers) unless the application actually requires something more sophisticated.
* Senior Engineer Test:
  > *Would a senior engineer look at this and consider it unnecessarily complicated?*
  > If yes, simplify it.

---

## 3. Surgical Changes

* Touch only what the task requires.
* Do not improve neighboring code without cause.
* Do not refactor unrelated code.
* Do not rename things merely for consistency.
* Do not "clean up" existing code unless the task directly requires it.
* Every changed line must be traceable to the current request.
* If you discover an unrelated improvement, note it separately instead of implementing it.

---

## 4. Goal-Driven Execution

* Turn vague instructions into verifiable targets before writing code.
* For UI work, define concrete acceptance criteria before implementation.
* For every screen (starting with the landing/primary flow), verify:
  * The application builds and runs successfully in the browser.
  * The screen layout faithfully matches the supplied design.
  * Text, spacing, hierarchy, colors, buttons, and interactive elements match the design.
  * The screen scales cleanly across common desktop and tablet sizes.
  * There are no layout overflow, clipping, or broken responsive issues.
  * Navigation infrastructure supports adding future screens incrementally without rewrites.
  * Prefer measurable verification over subjective statements like "looks good."

---

## 5. Architecture & Organization

* Keep the architecture intentionally small and modular:
  ```text
  src/
    App.tsx
    main.tsx
    pages/
      Login/
      Resident/
      Authority/
      Simulation/
    components/
    auth/
    hooks/
    simulation/
    data/
    utils/
  ```
* Do not create folders merely because they might be useful someday.
* Future screens will be added screen-by-screen under `src/pages/<screen_name>/`.

---

## 6. Navigation

* Set up simple, decoupled navigation suitable for incremental screen additions.
* Keep navigation concerns distinct from visual widget implementations.
* The landing screen is the initial route (`/`).
* Do not add complex third-party routing frameworks unless explicitly requested.

---

## 7. Frontend Compatibility & Responsiveness

* Keep the browser build configuration valid, modern, and lean.
* Support common desktop and tablet screen sizes gracefully using responsive layout primitives (`LayoutBuilder`, `Flex`, `Stack`, `Padding`, `Grid`, `Responsive` patterns where needed).
* Avoid platform-specific bloat.

---

## 8. Screen Design Source of Truth

* The graphic/UI design provided by the user is the **visual source of truth**.
* Analyze design hierarchy, typography, colors, padding, cards, icons, and interactive states before implementing.
* Do not redesign or alter styling based on personal preference.
* Do not add UI elements not present in the design unless necessary for basic functionality.

---

## 9. Assets Management

* Store assets in structured subdirectories under `assets/` (e.g. `assets/images/`, `assets/icons/`).
* Register all assets in `pubspec.yaml`.
* Use provided assets directly rather than recreating them with approximations.
* If an asset is missing, do not invent one silently; inform the user and agree on a fallback.

---

## 10. Dependencies

* Keep dependencies to a strict minimum.
* Before adding a package, check whether Dart/Flutter standard libraries already provide what is needed.
* Add third-party packages only when they provide unmistakable, indispensable value.

---

## 11. Implementation Workflow

Follow this 6-step sequence for every task:
1. **Understand**: Restate the task in technical terms.
2. **Inspect**: Inspect relevant code, configuration, and assets.
3. **Plan**: Define the smallest implementation that satisfies the request.
4. **Implement**: Make surgical, clean changes.
5. **Verify**: Run relevant checks (`flutter analyze`, `flutter test`, Android build).
6. **Report**: State what changed, what was verified, assumptions made, and any remaining questions.

---

## 12. Do Not Build Ahead

* Resilia is developed **screen by screen**.
* Do not implement future placeholder screens until specifically requested.
* Focus all engineering effort on making the **current target screen excellent**.

---

## 13. Keep `README.md` Updated

The root `README.md` is the project's living documentation.

After completing a task, determine whether the change contains **significant information that a developer working on the project should know**.

If it does, append a concise entry to the root `README.md`.

Document significant changes such as:

* New screens or major UI flows.
* Important architectural decisions.
* New dependencies or technologies.
* Changes to navigation or application structure.
* New configuration or environment requirements.
* Important setup or build instructions.
* New assets or significant asset-handling changes.
* Important technical limitations or known issues.
* Changes that affect how future developers should work with the project.

Do **not** document trivial implementation details, routine bug fixes, formatting changes, or obvious code changes.

### Rules

* **Append; do not rewrite history.**
* Preserve all existing `README.md` content.
* Do not remove or silently modify previous entries.
* Keep entries concise and factual.
* Include the date of the change when appropriate.
* Explain **what changed and why**, not every implementation detail.
* Do not duplicate information that is already clearly documented elsewhere.
* If the change is not significant enough to be useful to another developer, do not modify `README.md`.

A suitable format is:

```markdown
## Change Log

### 2026-08-28 — Home Screen

- Added the initial Resilia screen flow based on the provided UI design.
- Added the initial screen/navigation structure so additional screens can be introduced incrementally.
- Added the required frontend assets and responsive layout configuration.
```

If a `## Change Log` section already exists, append the new entry to it rather than creating another one.

Before finishing the task, explicitly check whether the change warrants a `README.md` update.

