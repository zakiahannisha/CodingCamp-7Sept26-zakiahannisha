# Implementation Plan: To-do-List Life Dashboard

## Overview

Build a zero-dependency, client-side SPA consisting of a single `index.html`, one `css/style.css`, and one `js/app.js`. The app delivers four widgets — Greeting, Focus Timer, To-Do List, and Quick Links — all persisted via `localStorage`. Tasks are ordered by dependency: scaffold → HTML → CSS → JS sections in sequence → wiring → smoke testing.

---

## Tasks

- [~] 1. Project scaffolding — create directory structure and entry point
  - Create `css/` directory and empty `css/style.css` file
  - Create `js/` directory and empty `js/app.js` file
  - Create `index.html` in the project root with correct `<!DOCTYPE html>` boilerplate, `<link rel="stylesheet" href="css/style.css">`, and `<script src="js/app.js"></script>`
  - Verify the file opens via `file://` protocol in a browser without console errors
  - _Requirements: 14.2, 14.3, 14.4, 14.6_

- [x] 2. HTML structure — widget sections and all required IDs
  - [x] 2.1 Implement `<head>` metadata and charset/viewport declarations
    - Add `<meta charset="UTF-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1.0">`, and `<title>Life Dashboard</title>`
    - Confirm no `<style>` blocks exist anywhere in the HTML file
    - _Requirements: 14.1, 14.2_

  - [x] 2.2 Implement Greeting Widget HTML section
    - Add `<section id="greeting-widget" class="widget">` containing `<div id="greeting-message">`, `<div id="clock-display">`, and `<div id="date-display">`
    - _Requirements: 1.1, 1.2, 2.1_

  - [x] 2.3 Implement Focus Timer Widget HTML section
    - Add `<section id="timer-widget" class="widget">` with `<h2>Focus Timer</h2>`, `<div id="timer-display">25:00</div>`, and `<div id="timer-controls">` containing `<button id="btn-start">`, `<button id="btn-stop" disabled>`, `<button id="btn-reset">`
    - _Requirements: 3.1, 4.1_

  - [x] 2.4 Implement To-Do List Widget HTML section
    - Add `<section id="todo-widget" class="widget">` with input area (`#todo-input` maxlength 500, `#btn-add-task`, `#todo-input-error` with `aria-live="polite"`) and `<ul id="todo-list">`
    - _Requirements: 5.1, 5.6_

  - [x] 2.5 Implement Quick Links Widget HTML section
    - Add `<section id="quicklinks-widget" class="widget">` with `#link-label-input` (maxlength 100), `#link-url-input` (type="url", maxlength 2048), `#btn-add-link`, `#quicklinks-error` with `aria-live="polite"`, and `<ul id="quicklinks-list">`
    - _Requirements: 11.1, 10.4_

- [x] 3. CSS foundation — custom properties, reset, typography, and responsive grid
  - [x] 3.1 Implement CSS custom properties and box-model reset
    - Define `:root` custom properties: `--color-bg`, `--color-surface`, `--color-primary`, `--color-text`, `--color-muted`, `--color-error`, `--color-success`, `--radius`, `--shadow`, `--spacing-sm`, `--spacing-md`, `--spacing-lg`
    - Add `*, *::before, *::after { box-sizing: border-box; }` and `max-width: 100%` on all elements to prevent horizontal overflow
    - _Requirements: 15.4_

  - [x] 3.2 Implement base typography and fluid font sizing
    - Set `body { font-size: clamp(12px, 1.5vw, 16px); }` to ensure minimum 12px body font
    - Set `h2` at `1.5rem` and label/sub-heading elements at `1.125rem`, ensuring heading text is at least 4px larger than label text and label text is at least 2px larger than body text
    - _Requirements: 15.3, 15.4_

  - [x] 3.3 Implement responsive dashboard grid layout
    - Apply `display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; padding: 1.5rem;` to `.dashboard`
    - Add media query breakpoints: 2-column grid at `>= 768px`, 1-column at `< 768px`
    - Verify no horizontal scrolling occurs at any viewport width from 320px to 1920px
    - _Requirements: 15.4_

- [x] 4. CSS widget styles — cards, states, and component-specific rules
  - [x] 4.1 Implement `.widget` card base styles
    - Apply background (`--color-surface`), `border-radius: var(--radius)`, `box-shadow: var(--shadow)`, and padding to `.widget`
    - _Requirements: 15.3_

  - [x] 4.2 Implement completed task visual distinction
    - Add `.task-item.completed .task-text { text-decoration: line-through; opacity: 0.5; }` to fulfill the strikethrough and reduced-opacity requirement
    - _Requirements: 7.2, 7.3_

  - [x] 4.3 Implement error state and inline error styles
    - Style `.error` elements: default `display: none`, visible state with `color: var(--color-error)`, readable font size
    - Ensure `.error` is hidden when empty and visible when populated
    - _Requirements: 5.5, 5.6, 6.6, 6.7, 7.5, 8.5, 11.4, 11.5, 11.6, 12.5_

  - [x] 4.4 Implement Focus Timer widget-specific styles
    - Style `#timer-display` with prominent font size for the countdown readout
    - Style `#timer-controls` as a flex row with consistent button spacing
    - Style disabled button state with reduced opacity to give clear visual feedback
    - _Requirements: 4.5, 4.6_

  - [x] 4.5 Implement To-Do List widget-specific styles
    - Style `#todo-input-area` as a flex row; style `.task-item` with flex layout showing checkbox, text, and action buttons
    - Style edit mode: inline input field replaces task text span
    - _Requirements: 5.1, 6.2_

  - [x] 4.6 Implement Quick Links widget-specific styles
    - Style `#quicklinks-input-area` for two-input + button layout
    - Style `.link-item` and `.link-button` as accessible, visually distinct link cards
    - Style `.empty-state` message for when no links exist
    - _Requirements: 10.4, 11.2_

- [x] 5. JS Section 1 — Constants & Configuration
  - Add all constants to the top of `js/app.js`:
    - `STORAGE_KEY_TASKS = "tasks"`, `STORAGE_KEY_LINKS = "quickLinks"`
    - `TIMER_DURATION = 25 * 60` (1500 seconds)
    - `MAX_TASK_LENGTH = 500`, `MAX_LABEL_LENGTH = 100`, `MAX_URL_LENGTH = 2048`
    - `DAYS` array (`["Sunday","Monday",…,"Saturday"]`) and `MONTHS` array (`["January","February",…,"December"]`)
  - _Requirements: 14.3_

- [x] 6. JS Section 2 — Utility Helper functions
  - [x] 6.1 Implement `formatTime(date)` and `formatDate(date)`
    - `formatTime` pads hours, minutes, seconds to 2 digits → `"HH:MM:SS"`
    - `formatDate` constructs `"Weekday, D Month YYYY"` from the `DAYS` and `MONTHS` arrays
    - _Requirements: 1.1, 1.2_

  - [ ]* 6.2 Write property tests for `formatTime` and `formatDate`
    - **Property 1: Time formatter produces valid HH:MM:SS strings**
    - **Validates: Requirements 1.1**
    - **Property 2: Date formatter includes all four required components**
    - **Validates: Requirements 1.2**

  - [x] 6.3 Implement `getGreeting(date)`
    - Map hour 5–11 → `"Good Morning"`, 12–17 → `"Good Afternoon"`, 18–23 and 0–4 → `"Good Evening"`; return `"Good Day"` when `date` is null/unavailable
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6_

  - [ ]* 6.4 Write property test for `getGreeting`
    - **Property 3: Greeting maps every hour to the correct message**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

  - [x] 6.5 Implement `formatTimer(seconds)`
    - Convert integer seconds (0–1500) to `"MM:SS"` string with zero-padding
    - _Requirements: 3.3_

  - [ ]* 6.6 Write property test for `formatTimer`
    - **Property 4: Timer formatter produces valid MM:SS strings**
    - **Validates: Requirements 3.3**

  - [x] 6.7 Implement `isValidTaskInput(str)`, `isValidURL(str)`, and `isValidLinkInput(label, url)`
    - `isValidTaskInput`: return `false` for `null`, empty, or whitespace-only strings
    - `isValidURL`: return `true` only when `str` starts with `"http://"` or `"https://"`
    - `isValidLinkInput`: return `false` when label is empty/whitespace, URL is empty/whitespace, or URL fails `isValidURL`
    - _Requirements: 5.6, 6.6, 10.6, 11.4, 11.5_

  - [ ]* 6.8 Write property tests for `isValidTaskInput`, `isValidURL`, and `isValidLinkInput`
    - **Property 8: Whitespace-only and empty strings are invalid task input**
    - **Validates: Requirements 5.6, 6.6**
    - **Property 12: Strings not starting with http:// or https:// are invalid URLs**
    - **Validates: Requirements 10.6, 11.5**
    - **Property 14: Empty or whitespace label or URL is invalid link input**
    - **Validates: Requirements 11.4**

- [x] 7. JS Section 3 — Storage Manager
  - [x] 7.1 Implement `loadTasks()` and `loadLinks()`
    - Call `localStorage.getItem(key)`; return `[]` if result is `null`
    - `JSON.parse` inside `try/catch`; on error log to console and return `[]`
    - Validate the parsed result is an array; if not, return `[]`
    - _Requirements: 9.1, 9.3, 9.4, 10.1, 13.2, 13.3_

  - [x] 7.2 Implement `saveTasks(tasks)` and `saveLinks(links)`
    - Serialize with `JSON.stringify`, write with `localStorage.setItem` inside `try/catch`
    - On failure, throw an `Error` so calling widget functions can catch and surface it
    - _Requirements: 5.4, 6.4, 7.4, 8.4, 9.5, 9.6, 9.7, 13.1_

  - [ ]* 7.3 Write property tests for serialization round-trips
    - **Property 10: Task list serialization round-trip preserves all fields**
    - **Validates: Requirements 9.8, 9.6, 9.7**
    - **Property 11: Link list serialization round-trip preserves all fields**
    - **Validates: Requirements 13.5, 13.1, 13.2**

- [x] 8. JS Section 4 — State Store initialization
  - Define the `state` object at module scope:
    ```js
    var state = { tasks: [], links: [], timer: { status: "Idle", remainingSeconds: 1500, intervalId: null } };
    ```
  - Document that all widget mutations go through widget functions, never direct external mutation
  - _Requirements: 9.1, 13.2_

- [x] 9. JS Section 5 — Greeting Widget
  - [x] 9.1 Implement `renderGreeting()`
    - Call `new Date()` inside a `try/catch`; on failure set `#clock-display` and `#date-display` to unavailability placeholder and `#greeting-message` to `"Good Day"`
    - On success: set `#clock-display` using `formatTime`, `#date-display` using `formatDate`, `#greeting-message` using `getGreeting`
    - _Requirements: 1.1, 1.2, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 9.2 Implement `initGreeting()`
    - Call `renderGreeting()` immediately, then start a `setInterval(renderGreeting, 1000)` to update once per second
    - _Requirements: 1.3, 1.4, 2.5_

- [x] 10. JS Section 6 — Focus Timer Widget
  - [x] 10.1 Implement `renderTimer()`
    - Update `#timer-display` using `formatTimer(state.timer.remainingSeconds)`
    - Set `disabled` on `#btn-start`, `#btn-stop`, `#btn-reset` according to the state machine invariant (Property 6)
    - _Requirements: 3.1, 3.3, 4.5, 4.6_

  - [ ]* 10.2 Write property test for timer control disabled states
    - **Property 6: Timer control enabled/disabled states are an invariant of timer status**
    - **Validates: Requirements 4.5, 4.6**

  - [x] 10.3 Implement `startTimer()`
    - Guard: if `state.timer.status` is `"Running"` or `"Completed"`, do nothing
    - Set `status = "Running"`, start `setInterval` (1000ms), store `intervalId` in state
    - Each tick: decrement `remainingSeconds`; if it reaches 0, call `completeTimer()`
    - _Requirements: 3.2, 4.3, 4.7_

  - [ ]* 10.4 Write property test for timer tick decrement
    - **Property 5: Each timer tick decrements remaining seconds by exactly one**
    - **Validates: Requirements 3.2**

  - [x] 10.5 Implement `stopTimer()`, `resetTimer()`, and `completeTimer()`
    - `stopTimer`: clear interval, set `status = "Paused"`, call `renderTimer()`
    - `resetTimer`: clear interval, set `remainingSeconds = TIMER_DURATION`, `status = "Idle"`, `intervalId = null`, call `renderTimer()`
    - `completeTimer`: clear interval, set `status = "Completed"`, call `renderTimer()`, then emit an audible alert using `AudioContext` (synthesize a short beep) or `new Audio()` tone lasting at least 1 second
    - _Requirements: 3.4, 3.5, 4.2, 4.4, 4.8_

  - [x] 10.6 Implement `initTimer()`
    - Bind `#btn-start` → `startTimer`, `#btn-stop` → `stopTimer`, `#btn-reset` → `resetTimer`
    - Call `renderTimer()` to set initial display to `"25:00"` with correct button states
    - _Requirements: 3.1, 4.1_

- [x] 11. JS Section 7 — To-Do List Widget
  - [x] 11.1 Implement `showError(elementId, message)` and `clearError(elementId)` helpers
    - `showError`: get element by ID, set `textContent` and `style.display = "block"`
    - `clearError`: set `textContent = ""` and `style.display = "none"`
    - _Requirements: 5.5, 5.6, 6.6, 6.7, 7.5, 8.5_

  - [x] 11.2 Implement `renderTodoList()`
    - Replace `#todo-list` `innerHTML` with one `<li class="task-item">` per entry in `state.tasks`
    - Each item includes: checkbox (`.task-checkbox`), text span (`.task-text`), edit button (`.btn-edit`), delete button (`.btn-delete`), error paragraph (`.task-error`)
    - Apply `completed` class to the `<li>` when `task.completed === true`
    - _Requirements: 5.3, 7.2, 7.3, 9.2_

  - [x] 11.3 Implement `addTask(text)`
    - Validate with `isValidTaskInput`; on failure call `showError("todo-input-error", …)` and return
    - Create Task object: `{ id: String(Date.now() + Math.random()), title: text.trim(), completed: false }`
    - Push to `state.tasks`, clear input field, call `saveTasks` inside `try/catch` (on error show error message but keep task in state), call `renderTodoList()`
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 11.4 Write property test for `createTask` / `addTask` logic
    - **Property 7: Task creation produces a task with trimmed title and incomplete status**
    - **Validates: Requirements 5.2**

  - [x] 11.5 Implement `editTask(id, newText)` with inline editing flow
    - `renderTodoList` renders an editable `<input>` pre-populated with current title when task is in edit mode (track edit state via a module-level variable or a data attribute)
    - On Save/Enter: validate with `isValidTaskInput`; on failure show inline error; on success mutate `task.title`, call `saveTasks` (on error show per-item error), call `renderTodoList()`
    - On Cancel/Escape: discard changes, call `renderTodoList()` without mutating state
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [x] 11.6 Implement `toggleTask(id)`
    - Find task by `id`, flip `task.completed`, call `saveTasks` inside `try/catch` (on error show per-item error), call `renderTodoList()`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 11.7 Write property test for `toggleTask` involution
    - **Property 9: Task completion toggle is an involution (round-trip)**
    - **Validates: Requirements 7.2, 7.3**

  - [x] 11.8 Implement `deleteTask(id)` with confirmation prompt
    - Call `window.confirm("Delete this task?")`: if user cancels, do nothing
    - On confirm: remove from `state.tasks`, call `saveTasks` inside `try/catch` (on error show error, task remains removed from state), call `renderTodoList()`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [x] 11.9 Implement `initTodoList()`
    - Load `state.tasks` from storage (already done in bootstrap, but render from state)
    - Set up event delegation on `#todo-list` for click events (checkbox toggle, edit, save, cancel, delete) and keydown for Enter/Escape inside edit inputs
    - Bind `#btn-add-task` click and `#todo-input` Enter keydown to `addTask`
    - Call `renderTodoList()`
    - _Requirements: 5.1, 9.1, 9.2, 9.3_

- [~] 12. JS Section 8 — Quick Links Widget
  - [-] 12.1 Implement `renderQuickLinks()`
    - Replace `#quicklinks-list` `innerHTML`
    - If `state.links` is empty, render `.empty-state` message
    - Otherwise render one `<li class="link-item">` per link: a button (`.link-button`) with `link.label` as text, and a delete button (`.btn-delete-link`)
    - _Requirements: 10.2, 10.4, 10.5, 12.4_

  - [ ]* 12.2 Write property test for `renderQuickLinks`
    - **Property 15: renderQuickLinks produces exactly one button per Link**
    - **Validates: Requirements 10.2**

  - [-] 12.3 Implement link button click handler for URL launching
    - On `.link-button` click: validate URL with `isValidURL`; if invalid show inline error and do NOT open a tab; if valid call `window.open(link.url, "_blank")`
    - _Requirements: 10.3, 10.6_

  - [-] 12.4 Implement `addLink(label, url)`
    - Validate with `isValidLinkInput`; on failure show field-specific error and return without creating a link
    - Create Link object: `{ id: String(Date.now() + Math.random()), label: label.trim(), url: url.trim() }`
    - Push to `state.links`, clear both input fields, call `saveLinks` inside `try/catch`
    - On storage failure (Req 11.6): rollback — remove the link from `state.links`, show `#quicklinks-error`, restore input fields
    - On success: call `renderQuickLinks()`
    - _Requirements: 11.2, 11.3, 11.4, 11.5, 11.6_

  - [ ]* 12.5 Write property test for `createLink` / `addLink` logic
    - **Property 13: Link creation produces a link with the provided label and URL**
    - **Validates: Requirements 11.2**

  - [-] 12.6 Implement `deleteLink(id)`
    - Remove from `state.links`, call `saveLinks` inside `try/catch`
    - On storage failure (Req 12.5): rollback — re-insert the link at its original index, show `#quicklinks-error`, call `renderQuickLinks()`
    - On success: call `renderQuickLinks()`
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [-] 12.7 Implement `initQuickLinks()`
    - Set up event delegation on `#quicklinks-list` for link button clicks and delete button clicks
    - Bind `#btn-add-link` click to `addLink` reading from `#link-label-input` and `#link-url-input`
    - Call `renderQuickLinks()`
    - _Requirements: 10.1, 10.2, 11.1, 13.2_

- [~] 13. JS Section 9 — App Bootstrap and wiring
  - Add `document.addEventListener("DOMContentLoaded", function() { … })` that:
    1. Calls `loadTasks()` and assigns result to `state.tasks`
    2. Calls `loadLinks()` and assigns result to `state.links`
    3. Calls `initGreeting()`
    4. Calls `initTimer()`
    5. Calls `initTodoList()`
    6. Calls `initQuickLinks()`
  - This is the final integration step — all sections must be implemented before this runs correctly
  - _Requirements: 9.1, 9.2, 10.1, 13.2, 14.3_

- [~] 14. Checkpoint — Ensure all core functionality works end-to-end
  - Ensure all tests pass (if test suite exists), ask the user if questions arise.
  - Open `index.html` via `file://` and verify: clock updates every second, greeting changes with time, timer counts down and beeps, tasks persist across refresh, links open in new tabs

- [ ]* 15. Write remaining property-based tests
  - [ ]* 15.1 Set up fast-check test environment
    - Install `fast-check` as a dev dependency and configure Vitest or Jest with `--run` flag for single execution
    - Create `tests/app.test.js` (or `.spec.js`) and import / expose the pure utility functions for testing

  - [ ]* 15.2 Write property tests for timer tick logic and serialization
    - **Property 5: Each timer tick decrements remaining seconds by exactly one**
    - **Validates: Requirements 3.2**
    - **Property 10: Task list serialization round-trip preserves all fields**
    - **Validates: Requirements 9.8, 9.6, 9.7**
    - **Property 11: Link list serialization round-trip preserves all fields**
    - **Validates: Requirements 13.5, 13.1, 13.2**

  - [ ]* 15.3 Write unit tests for Storage Manager error paths
    - Mock `localStorage.setItem` to throw `QuotaExceededError`; verify `saveTasks` / `saveLinks` propagate the error correctly
    - Test `loadTasks` / `loadLinks` with `null`, invalid JSON, and non-array values
    - _Requirements: 5.5, 9.3, 9.4, 13.3_

  - [ ]* 15.4 Write unit tests for timer state machine transitions
    - Test all state transitions: Idle → Running → Paused → Running → Completed → Idle
    - Test that Start is a no-op in Completed state (Req 4.7)
    - Test Reset from Running clears interval and restores 25:00 (Req 4.8)
    - _Requirements: 3.4, 4.2, 4.3, 4.4, 4.7, 4.8_

- [~] 16. Final checkpoint — Verify complete implementation
  - Ensure all tests pass (if test suite exists), ask the user if questions arise.
  - Confirm the file opens correctly via `file://` in Chrome, Firefox, Edge, and Safari with no console errors
  - Confirm all four widgets render, all `localStorage` paths work (add/edit/delete/toggle + refresh), and the responsive layout holds at 320px and 1920px viewports

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP. Core functionality does not depend on a test suite being in place.
- Each task references specific requirements for full traceability back to the requirements document.
- Checkpoints (tasks 14 and 16) are integration verification gates — do not skip them.
- Property tests (Properties 1–15) validate universal correctness guarantees defined in the design document. Each optional test sub-task references the property number and the requirement clauses it covers.
- The single-file JavaScript constraint (no `import`/`export`) means all functions are in global scope within `app.js`. Expose utility functions on a test-accessible namespace object if a test suite is added.
- The `addLink` rollback on storage failure (task 12.4) is the only case where in-memory state is rolled back after a write failure — all other storage failures use optimistic UI (state retained, error shown).

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "5"] },
    { "id": 1, "tasks": ["2.2", "2.3", "2.4", "2.5"] },
    { "id": 2, "tasks": ["3.1"] },
    { "id": 3, "tasks": ["3.2", "3.3", "4.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "4.4", "4.5", "4.6"] },
    { "id": 5, "tasks": ["6.1", "6.3", "6.5", "6.7", "7.1", "7.2", "8"] },
    { "id": 6, "tasks": ["6.2", "6.4", "6.6", "6.8", "7.3", "9.1", "10.1", "11.1", "11.2", "12.1"] },
    { "id": 7, "tasks": ["9.2", "10.3", "10.5", "10.6", "11.3", "11.5", "11.6", "11.8", "11.9", "12.3", "12.4", "12.6", "12.7"] },
    { "id": 8, "tasks": ["10.2", "10.4", "11.4", "11.7", "12.2", "12.5"] },
    { "id": 9, "tasks": ["13"] },
    { "id": 10, "tasks": ["15.1"] },
    { "id": 11, "tasks": ["15.2", "15.3", "15.4"] }
  ]
}
```
