---
name: ui-walkthrough-presentation
description: Automates a complete presentation workflow for existing React applications. Inspects the source code, starts the local application, follows a user-provided UI walkthrough, interacts with the real browser, captures screenshots, and generates a polished, editable PowerPoint presentation with optional PDF export. Use when the user wants to demonstrate, document, present, or showcase an application's actual interface and user journey.
---

# UI Walkthrough Presentation

## 1. Mission

Create a polished, professional presentation that demonstrates an existing web application through its actual user interface.

The user provides a sequence of steps describing the intended walkthrough. Your job is to execute those steps in the running application, capture the relevant screens, understand what each screen demonstrates, and turn the results into a coherent presentation.

This is an execution task, not merely a slide-writing task.

The final deliverable should be ready to present to an audience without requiring the user to manually capture screenshots, arrange slides, or write all the explanations.

Prioritize:
1. Accuracy: show the real application and its actual capabilities.
2. Visual quality: make the presentation look intentionally designed.
3. Narrative: explain why each screen matters and how the workflow fits together.
4. Reliability: verify that the walkthrough and generated files work.
5. Reusability: keep the process repeatable across projects.

## 2. When to use this skill

Use this skill when the user wants to:
- Create a presentation from an existing React application.
- Demonstrate a product or prototype to judges, investors, customers, teammates, or stakeholders.
- Turn a written UI walkthrough into a PowerPoint.
- Capture screenshots of important application states automatically.
- Generate product-demo documentation from a running web application.
- Create an optional PDF version of a slide deck.
- Repeat the same process after updating the application's interface.

The application may use React, Vite, Next.js, React Router, or another web framework. Adapt the workflow to the repository rather than assuming a particular framework.

## 3. Operating principles

### Work with the existing application

- Inspect the existing codebase before making assumptions.
- Use the existing application and its actual UI.
- Do not rebuild the application just to create the presentation.
- Do not redesign, refactor, or modify application functionality as part of the task.
- Do not replace real screens with mockups when the actual screens can be captured.
- Do not alter application source files unless the user explicitly authorizes changes.
- Keep presentation-generation code and artifacts separate from the application code.

### Follow the user's walkthrough

- Preserve the order of the supplied steps.
- Treat the walkthrough as the primary source of truth for the intended user journey.
- Do not skip difficult steps silently.
- Do not invent successful outcomes when an interaction fails.
- If a step is ambiguous, inspect the source code and rendered interface before asking the user for clarification.
- Ask a concise question only when a missing detail prevents reliable execution.

### Never fabricate evidence

- Use screenshots captured from the actual running application.
- Do not fabricate UI screenshots or present generated illustrations as real application screens.
- Do not invent statistics, metrics, customer testimonials, features, or performance claims.
- Do not describe an operation as successful unless the resulting application state confirms it.
- If demo data is required, use existing seed data or clearly identified synthetic data.
- Distinguish between implemented features and planned or simulated functionality.

### Protect the user's project

- Do not delete files, overwrite unrelated work, or reset the repository.
- Do not commit or push changes to version control.
- Do not perform real purchases, payments, emails, external submissions, or other consequential actions.
- Do not expose credentials, API keys, tokens, private information, or environment-variable values in screenshots or presentation notes.
- Do not disable authentication or security protections to make the walkthrough easier.
- Ask before installing dependencies, changing configuration, or making persistent project changes.

## 4. Inputs and expected outputs

### Inputs

Look for the following files and information:

1. `package.json`: available scripts and dependencies.
2. `README.md`: project setup instructions, if present.
3. `walkthrough/walkthrough.md`: the user's intended walkthrough.
4. Relevant React components, routing definitions, and application configuration.
5. Existing test data, fixtures, or documented demo accounts, where available.
6. Optional presentation preferences, such as audience, duration, branding, and tone.

The user may provide walkthrough instructions directly in the conversation instead of using a Markdown file.

If no walkthrough exists, ask the user for the steps before performing browser automation.

### Default output structure

Keep generated files separate from the source application.

    presentation/
    ├── presentation.pptx
    ├── presentation.pdf
    ├── README.md
    ├── walkthrough-report.md
    ├── screenshots/
    │   ├── 01-opening.png
    │   ├── 02-dashboard.png
    │   └── ...
    └── assets/

Create only the outputs that are needed and supported.

The PowerPoint is the primary deliverable. The PDF is optional but preferred when PDF export is available.

Do not overwrite an existing presentation without inspecting it and obtaining permission if the overwrite would destroy user-created work.

## 5. Phase One: Inspect the project

Before launching anything:

1. Inspect the project root.
2. Read `package.json`.
3. Identify the framework and existing development scripts.
4. Inspect the README and relevant configuration files.
5. Identify the application's entry point and routing system.
6. Identify important pages and reusable UI components.
7. Determine whether the application requires a backend, authentication, environment variables, or external services.
8. Check which browser automation and presentation-generation tools are already installed.
9. Inspect existing output directories to avoid overwriting user files.

Do not recursively read every source file without a reason. Follow the relevant routes and components needed to understand the supplied walkthrough.

### Build a walkthrough map

Before interacting with the browser, establish a rough mapping between the user's steps and the application.

For each step, identify:

- Intended destination or current screen.
- Visible controls needed to proceed.
- Expected result.
- Relevant source components, when useful.
- Data or prerequisites required.
- Screenshot opportunity.

Use this map to plan the walkthrough, not to substitute source-code assumptions for actual browser verification.

If a route or control cannot be identified, inspect the rendered UI before concluding that the feature is unavailable.

## 6. Phase Two: Prepare the local environment

### Start the application

Use the existing package manager and development scripts.

For a typical Vite application, the command may be:

    npm run dev

However, inspect `package.json` first. Do not assume that every project uses Vite or that the default port is 5173.

Follow the project's documented setup when additional services are required.

### Server handling

- Check whether the application is already running before starting another instance.
- Use a terminal session that allows the development server to remain active.
- Identify the actual local URL from the server output.
- Wait until the application is responding before beginning the walkthrough.
- Check the browser console and server output for startup errors.
- Do not terminate unrelated processes.
- If the application fails to start, diagnose the error before attempting fixes.
- Ask permission before installing packages, changing environment variables, or altering project configuration.

If startup succeeds but the UI depends on an unavailable backend, document the limitation and determine whether an existing demo mode is available.

### Browser preparation

Use the browser automation capabilities available in the current IDE.

Preferred automation options:

1. Existing browser-agent tools provided by the IDE.
2. Playwright, if already available or explicitly approved for installation.
3. Another existing browser automation framework supported by the project.

Do not assume that the IDE's interactive browser and a separately launched Playwright browser share cookies, sessions, or state.

Use one browser session consistently for the walkthrough whenever possible.

Set a consistent desktop viewport, preferably 1440 × 900 pixels, unless the application or presentation requires another size.

Use a stable browser zoom and a clean application state.

Do not resize or manipulate the application merely to hide defects.

## 7. Phase Three: Read and interpret the walkthrough

Read the complete walkthrough before beginning.

The walkthrough may contain:
- Navigation instructions.
- Button clicks and form inputs.
- Expected results.
- Data-selection instructions.
- Waiting conditions.
- Screenshot requests.
- Notes about what to explain to the audience.

Follow these instructions in their original order.

### If the walkthrough is underspecified

Use the following priority:

1. Explicit user instructions.
2. Existing walkthrough documentation.
3. Visible labels and controls in the application.
4. Routing and component definitions in the source code.
5. Reasonable, reversible inferences.

Do not guess when the choice could lead to data loss, an external submission, a real transaction, or another consequential action.

For ordinary UI navigation, use the most likely intended control and verify the resulting state.

If multiple interpretations remain plausible, ask the user one focused question.

### Test data

Prefer:
1. Existing seeded demo data.
2. Existing fixtures or documented sample accounts.
3. Existing application-supported demo modes.
4. Synthetic data, if the application supports entering it safely.

Do not populate a real database with test data without permission.

If an account or service is unavailable, do not fabricate a logged-in screen or claim that an inaccessible feature worked.

## 8. Phase Four: Execute the browser walkthrough

Execute the walkthrough step by step.

For each step:

### A. Navigate

- Open the initial application URL.
- Follow the required navigation.
- Interact with actual buttons, links, menus, tabs, and forms.
- Prefer accessible locators such as roles, labels, and visible text.
- Use stable test IDs or selectors when appropriate.
- Avoid brittle selectors tied to generated CSS class names unless necessary.

### B. Verify

After each significant interaction:

- Wait for the expected UI state.
- Confirm the intended page, dialog, or result is visible.
- Check whether loading indicators have finished.
- Verify important displayed values when the task depends on them.
- Check for obvious error messages or broken UI states.

Prefer explicit conditions over arbitrary fixed delays.

For example, wait for the result panel to become visible instead of waiting five seconds regardless of the application's state.

### C. Recover

If an interaction fails:

1. Inspect the current screenshot.
2. Check visible controls and page state.
3. Review relevant application code if needed.
4. Try a reasonable alternative locator or navigation path.
5. Retry only when doing so is safe.

Do not repeatedly click controls that may trigger duplicate operations.

If the intended state cannot be reached, record the failure and continue only if subsequent steps remain meaningful.

### D. Capture

Capture screenshots at meaningful moments, not after every trivial click.

Good screenshot opportunities include:

- The opening or landing screen.
- The primary dashboard.
- A major feature's input state.
- A meaningful intermediate state.
- The result of an important action.
- A comparison or analysis screen.
- A final outcome.

Capture the actual browser viewport or a suitable full-page screenshot, depending on the layout.

Prefer viewport screenshots for slides that explain a specific screen. Use full-page captures when the full page adds meaningful context.

Save each screenshot with a sequential, descriptive filename.

Examples:

    01-opening.png
    02-main-dashboard.png
    03-feature-input.png
    04-analysis-running.png
    05-analysis-results.png
    06-final-summary.png

Use PNG for UI screenshots when practical.

Ensure screenshots are:
- Legible at presentation size.
- Free of browser developer tools and unrelated windows.
- Free of accidental hover states that obscure content.
- Free of unnecessary personal data.
- Captured at consistent dimensions when possible.

Do not remove important UI information simply to make the screenshot look cleaner.

### E. Record evidence

For each completed step, record:

- The action performed.
- The expected state.
- The observed result.
- The screenshot filename.
- Any limitations or deviations.

Maintain this information for the final walkthrough report.

## 9. Phase Five: Plan the presentation narrative

Do not simply paste screenshots onto slides.

Create a coherent story based on the actual user journey.

Unless the user specifies another structure, use the following outline:

### Opening

Introduce the application and its purpose.

Explain the problem it addresses and the main outcome the audience will see.

Use the actual product name and verified information from the repository or user instructions.

### Context

Explain the starting point of the workflow.

Show the initial screen or dashboard and identify the relevant information.

### Main workflow

Present the key user actions in chronological order.

Each slide should explain the important action, the visible result, and why it matters.

Combine closely related screens when doing so improves clarity.

### Key results

Show the most meaningful result screens.

Explain what the results represent, based only on verified application behavior.

If a result is illustrative or uses synthetic data, label it appropriately.

### Closing

Summarize the demonstrated value of the application.

End with a strong, relevant final screen or result.

Do not invent a roadmap, business impact, market size, customer adoption, or future capability.

### Adapt to the audience

If the audience is specified, adapt the language and emphasis.

Examples:

- Hackathon judges: problem, implementation, key interaction, results, and differentiation.
- Investors: problem, product workflow, value proposition, and verified traction.
- Customers: usability, important features, and practical benefits.
- Technical reviewers: architecture where relevant, implementation details, and demonstrated behavior.
- Internal teams: workflow, functionality, limitations, and next steps.

Do not overload a product-demo presentation with source-code details unless the audience needs them.

## 10. Phase Six: Design the slides

The default format is a 16:9 widescreen presentation.

Use a consistent visual system throughout the deck.

### Design requirements

- Establish a clear visual hierarchy.
- Use readable typography and consistent spacing.
- Keep slide titles concise.
- Use one primary message per slide.
- Use actual screenshots as the central visual evidence.
- Keep captions short and explanatory.
- Maintain consistent margins and alignment.
- Use restrained annotations, highlights, arrows, or callouts when they clarify the interface.
- Preserve the application's actual appearance.
- Keep colors and typography consistent with the product brand where appropriate.
- Use whitespace deliberately.
- Avoid unnecessary decoration, excessive gradients, and generic stock imagery.

A presentation should look designed for this specific application, not like a generic template with screenshots inserted.

### Screenshot placement

- Preserve the screenshot's aspect ratio.
- Avoid stretching or distorting the UI.
- Crop only when the cropped region remains accurate and useful.
- Do not crop away context that changes the meaning of the screen.
- Use callouts sparingly.
- Ensure annotations point to the correct UI elements.
- Use legible screenshots rather than tiny thumbnails.
- Prefer a large screenshot with a short explanation over a dense slide full of small screenshots.

When a full screenshot is too dense, create separate slides for different stages of the workflow.

### Text requirements

- Use short titles that communicate the slide's main point.
- Explain what the user does and what happens next.
- Explain the significance of a feature without repeating every visible label.
- Avoid long paragraphs.
- Avoid unsupported superlatives such as "best," "revolutionary," or "industry-leading."
- Do not claim that a feature is automated, intelligent, real-time, or production-ready unless the evidence supports the claim.

### Slide count and duration

Choose the slide count based on the walkthrough and the intended audience.

As a default:
- Short demo: 5–8 slides.
- Standard product presentation: 8–12 slides.
- Detailed technical walkthrough: 12–18 slides.

These are guidelines, not hard limits.

Do not force a fixed number of slides if doing so would omit an important step or create unnecessary repetition.

## 11. Phase Seven: Generate the PowerPoint

Prefer an editable PowerPoint file as the primary output.

Use an available presentation-generation tool or library.

For JavaScript and TypeScript projects, PptxGenJS is a suitable option.

Official documentation:
https://gitbrent.github.io/PptxGenJS/

For a typical PptxGenJS implementation:

1. Create a presentation with a 16:9 layout.
2. Define reusable slide-layout helpers.
3. Load the captured screenshots from disk.
4. Place screenshots with the correct aspect ratio.
5. Add titles, captions, annotations, and supporting text.
6. Apply consistent typography, margins, and spacing.
7. Add slide numbers when appropriate.
8. Write the resulting `.pptx` file to the presentation output directory.

Keep slide-generation code separate from the application's production source.

Use editable text and shapes wherever practical. Screenshots themselves will naturally remain images.

Do not render the entire presentation as one flattened image per slide unless the user explicitly requests that format.

### Dependency policy

Before installing a package:

- Check whether it is already available.
- Check the repository's existing package manager and dependency conventions.
- Ask permission before installing new dependencies or modifying package manifests.

Prefer a project-local script or an approved temporary environment.

Do not change the application's dependencies simply to create the presentation.

### Optional PDF export

If PDF export is requested or useful, generate it from the completed presentation using an available conversion tool.

Check whether a supported presentation renderer or office suite is available before choosing the conversion method.

Do not assume that renaming a `.pptx` file to `.pdf` creates a valid PDF.

If PDF conversion is unavailable, deliver the PowerPoint and clearly report that the PDF could not be generated.

## 12. Phase Eight: Quality assurance

Do not finish immediately after writing the PowerPoint file.

Validate both the content and the generated artifacts.

### Walkthrough validation

Confirm that:

- The initial application opened successfully.
- Each requested step was attempted.
- Successful steps reached the expected UI state.
- Screenshots correspond to the correct steps.
- Failures and deviations are documented.
- No unsupported feature claims were introduced.

### Screenshot validation

Check that:

- Images exist and are readable.
- The correct screenshots are associated with the correct slides.
- Important UI content is visible.
- There are no unintended blank or corrupted captures.
- No sensitive information is exposed.

### Presentation validation

Check that:

- The `.pptx` file exists and is non-empty.
- The presentation opens or can be parsed by an available validation tool.
- Slides use a consistent 16:9 layout unless otherwise requested.
- Titles and body text are not clipped.
- Images remain within slide boundaries.
- Text is legible.
- Annotations do not obscure important controls.
- No slides are unexpectedly blank.
- The opening and closing slides make sense.
- The slide order follows the walkthrough.
- The deck does not contain placeholder text or unfilled template elements.

If a slide renderer is available, render the presentation to images or PDF and inspect the resulting slides.

Fix layout problems before delivering the final files.

If a PDF was generated, validate it separately.

Do not claim that the presentation was visually inspected unless it was actually rendered and inspected.

## 13. Phase Nine: Documentation and delivery

Create `presentation/README.md` containing:

- The presentation's purpose.
- The main deliverables.
- The number of slides.
- The walkthrough used.
- The location of screenshots.
- Any dependencies or scripts required to regenerate the deck.
- Any limitations the user should know about.

Create `presentation/walkthrough-report.md` containing a step-by-step execution report.

For each step, record:
- Step number and description.
- Whether it succeeded.
- The resulting UI state.
- The corresponding screenshot.
- Any errors, deviations, or unresolved issues.

Keep reports factual and concise.

### Final response

When the task is complete, summarize:

1. The PowerPoint file location.
2. The PDF file location, if generated.
3. The screenshot directory.
4. Whether all walkthrough steps succeeded.
5. Any limitations or steps that need manual attention.

Provide direct links to files when the environment supports them.

Do not report success for files that were not actually created or validated.

## 14. Error handling

### The application does not start

Inspect the startup output, check the available scripts, and identify missing prerequisites.

Do not modify configuration or install dependencies without approval.

### The browser cannot access the application

Verify the URL and the server's status.

Check whether the browser agent and development server can access the same local environment.

Do not repeatedly launch duplicate servers.

### Authentication is required

Use an existing authorized session or documented demo account.

Ask the user for help if authentication is blocked.

Do not bypass authentication, extract credentials from unrelated files, or expose secrets in screenshots.

### A UI interaction fails

Inspect the current state and relevant source code.

Retry with a more reliable locator when safe.

Document unresolved failures.

### The UI depends on an unavailable backend

Determine whether an existing demo mode or seeded dataset can be used.

If no valid route exists, capture only the screens that can be reached and clearly report the limitation.

Do not replace failed backend results with fabricated screenshots.

### Screenshot capture fails

Try the available browser tool's native screenshot capability.

If browser automation is unavailable, explain the limitation and ask before switching to a different approach.

### Presentation generation fails

Inspect the generation error and validate the assets.

Fix the issue without changing the application itself.

If a particular output format cannot be produced, deliver the available valid artifacts and explain what remains incomplete.

## 15. Execution and approval policy

At the beginning of a new task:

1. Inspect the project and identify the relevant walkthrough.
2. Present a brief plan and any important prerequisites.
3. Identify required dependencies or configuration changes.
4. Ask permission before making persistent changes outside the approved output directory.

Once the walkthrough is understood and the required tools are available, execute the approved workflow without requesting confirmation for every ordinary browser click.

Do not pause for approval between routine navigation steps.

Ask for clarification only when blocked, when the next action is consequential, or when a material decision cannot be resolved safely.

## 16. Definition of done

The task is complete when:

- The existing application has been inspected.
- The user-provided walkthrough has been attempted in order.
- Actual UI screenshots have been captured for successful, meaningful states.
- The presentation tells a coherent story.
- An editable PowerPoint has been generated.
- The output has been validated to the extent supported by available tools.
- A walkthrough report documents failures and deviations.
- The user has been given the exact output locations.

If any requirement cannot be met, state precisely which requirement remains incomplete and why.

Never describe a partially completed workflow as fully successful.