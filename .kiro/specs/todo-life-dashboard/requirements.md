# Requirements Document

## Introduction

The To-do-List Life Dashboard is a client-side, single-page web application built with HTML, CSS, and Vanilla JavaScript. It serves as a personal productivity hub accessible directly in a modern web browser — requiring no backend server or installation. The dashboard consolidates four core widgets: a contextual greeting with live clock, a Focus Timer (Pomodoro-style), a persistent To-Do List, and a Quick Links launcher. All user data is persisted exclusively via the browser's Local Storage API.

---

## Glossary

- **Dashboard**: The single HTML page that hosts all four widgets.
- **Widget**: A self-contained section of the Dashboard (Greeting, Focus Timer, To-Do List, Quick Links).
- **Focus_Timer**: The 25-minute countdown timer widget.
- **Greeting_Widget**: The widget displaying the current time, date, and time-based greeting message.
- **Todo_List**: The widget that manages task creation, editing, completion, and deletion.
- **Task**: A single to-do item stored in the Todo_List, consisting of a text description and a completion status.
- **Quick_Links**: The widget that displays and manages user-defined shortcut buttons to external URLs.
- **Link**: A single Quick Links entry consisting of a label and a URL.
- **Local_Storage**: The browser's `localStorage` Web Storage API used for all client-side data persistence.
- **Storage_Manager**: The JavaScript module responsible for reading from and writing to Local_Storage.
- **Time_Of_Day**: One of three periods — Morning (05:00–11:59), Afternoon (12:00–17:59), Evening (18:00–04:59).
- **Tick**: A one-second interval event fired by the browser while the Focus_Timer is running.

---

## Requirements

---

### Requirement 1: Live Clock and Date Display

**User Story:** As a user, I want to see the current time and date at a glance, so that I can stay oriented without switching apps.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current time in HH:MM:SS 24-hour format, where HH is 00–23, MM is 00–59, and SS is 00–59, updating once per second based on the user's local system clock.
2. THE Greeting_Widget SHALL display the current date showing the full weekday name, numeric day (1–31), full month name, and 4-digit year (e.g., Monday, 7 September 2026), derived from the user's local system clock.
3. WHEN the Dashboard page is loaded, THE Greeting_Widget SHALL begin displaying and updating the time and date within 1 second of page load completion, without requiring any user interaction.
4. WHILE the Dashboard page is open, THE Greeting_Widget SHALL update the time display once per second, such that the displayed time never deviates from the user's local system clock by more than 1 second.
5. IF the user's local system clock is unavailable, THEN THE Greeting_Widget SHALL display a placeholder indicating that the time is unavailable instead of showing stale or incorrect values.

---

### Requirement 2: Time-Based Greeting

**User Story:** As a user, I want to see a greeting that reflects the time of day, so that the Dashboard feels personal and contextually aware.

#### Acceptance Criteria

1. WHEN the local time is Morning (05:00–11:59), THE Greeting_Widget SHALL display the message "Good Morning".
2. WHEN the local time is Afternoon (12:00–17:59), THE Greeting_Widget SHALL display the message "Good Afternoon".
3. WHEN the local time is Evening (18:00–23:59), THE Greeting_Widget SHALL display the message "Good Evening".
4. WHEN the local time is Night (00:00–04:59), THE Greeting_Widget SHALL display the message "Good Evening".
5. WHEN the system clock advances past a Time_Of_Day boundary, THE Greeting_Widget SHALL update the greeting message within one second without requiring a page reload.
6. IF the system clock is unavailable, THEN THE Greeting_Widget SHALL display "Good Day" as a fallback greeting.

---

### Requirement 3: Focus Timer — Countdown Operation

**User Story:** As a user, I want a 25-minute countdown timer, so that I can use the Pomodoro technique to maintain focused work sessions.

#### Acceptance Criteria

1. WHEN the Dashboard is loaded, THE Focus_Timer SHALL display an initial countdown value of 25:00 (twenty-five minutes and zero seconds).
2. WHEN the user activates the Start control, THE Focus_Timer SHALL begin counting down from the current displayed time at a rate of one second per Tick.
3. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL update the displayed time on every Tick in MM:SS format, where MM represents minutes (00–25) and SS represents seconds (00–59).
4. WHEN the countdown reaches 00:00, THE Focus_Timer SHALL stop counting down, display 00:00, and enter a Completed state in which no further Ticks are processed until the timer is reset.
5. WHEN the countdown reaches 00:00, THE Focus_Timer SHALL emit an audible alert lasting at least 1 second to notify the user that the session has ended.

---

### Requirement 4: Focus Timer — Controls

**User Story:** As a user, I want Start, Stop, and Reset controls for the Focus Timer, so that I can manage my work session manually.

#### Acceptance Criteria

1. THE Focus_Timer SHALL provide a Start control, a Stop control, and a Reset control.
2. WHEN the user activates the Stop control while the Focus_Timer is counting down, THE Focus_Timer SHALL pause the countdown and retain the current displayed time.
3. WHEN the user activates the Start control after a Stop, THE Focus_Timer SHALL resume the countdown from the retained displayed time.
4. WHEN the user activates the Reset control, THE Focus_Timer SHALL stop any active countdown and restore the displayed time to 25:00.
5. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL disable the Start control to prevent duplicate activations.
6. WHILE the Focus_Timer is stopped or reset, THE Focus_Timer SHALL disable the Stop control.
7. IF the Focus_Timer is in the Completed state (displaying 00:00) and the user activates the Start control, THEN THE Focus_Timer SHALL not begin counting down and SHALL remain in the Completed state until the Reset control is activated.
8. WHEN the user activates the Reset control while the Focus_Timer is counting down, THE Focus_Timer SHALL stop the countdown, restore the displayed time to 25:00, disable the Stop control, and enable the Start control.

---

### Requirement 5: To-Do List — Task Creation

**User Story:** As a user, I want to add tasks to my To-Do List, so that I can capture and track things I need to do.

#### Acceptance Criteria

1. THE Todo_List SHALL provide a text input field, accepting up to 500 characters, and an Add control for creating new Tasks.
2. WHEN the user submits a non-empty, non-whitespace-only text input via the Add control or the Enter key, THE Todo_List SHALL create a new Task with the trimmed input text and a default completion status of incomplete, then clear the input field.
3. WHEN a new Task is created, THE Todo_List SHALL append the Task to the displayed list within 100 milliseconds.
4. WHEN a new Task is created, THE Storage_Manager SHALL persist the updated Task list to Local_Storage.
5. IF Local_Storage is unavailable or the write operation fails, THEN THE Storage_Manager SHALL display an error message indicating the Task could not be saved, while retaining the newly created Task in the displayed list for the current session.
6. IF the user submits an empty or whitespace-only text input, THEN THE Todo_List SHALL reject the submission, display an inline error indication to the user, and retain focus on the input field without creating a Task.

---

### Requirement 6: To-Do List — Task Editing

**User Story:** As a user, I want to edit existing task text, so that I can correct or update a task without deleting and re-adding it.

#### Acceptance Criteria

1. THE Todo_List SHALL provide an Edit control for each Task in the displayed list.
2. WHEN the user activates the Edit control for a Task, THE Todo_List SHALL replace the Task's text display with an editable input field (accepting up to 500 characters) pre-populated with the current Task text.
3. WHEN the user confirms an edit with non-empty text via the Save control or the Enter key, THE Todo_List SHALL update the Task text to the new value and restore the display view.
4. WHEN the user confirms an edit, THE Storage_Manager SHALL persist the updated Task list to Local_Storage.
5. WHEN the user cancels an edit via the Cancel control or the Escape key, THE Todo_List SHALL discard the edit and restore the Task's original text without modifying Local_Storage.
6. IF the user confirms an edit with empty or whitespace-only text, THEN THE Todo_List SHALL reject the save, display an inline error indication, and retain the editable input field with focus.
7. IF the Local_Storage write operation fails when saving an edit, THEN THE Storage_Manager SHALL display an inline error message indicating the change could not be saved, and the Todo_List SHALL retain the updated text in the displayed list for the current session.

---

### Requirement 7: To-Do List — Task Completion

**User Story:** As a user, I want to mark tasks as done, so that I can track my progress and distinguish completed work from pending work.

#### Acceptance Criteria

1. THE Todo_List SHALL provide a completion toggle control (e.g., checkbox) for each Task, with each Task initialized to incomplete by default.
2. WHEN the user activates the completion toggle for an incomplete Task, THE Todo_List SHALL update the Task's completion status to complete and apply a visual distinction of strikethrough text and reduced opacity to the Task item.
3. WHEN the user activates the completion toggle for a complete Task, THE Todo_List SHALL update the Task's completion status to incomplete and remove the strikethrough and reduced-opacity visual distinction.
4. WHEN a Task's completion status changes, THE Storage_Manager SHALL persist the updated Task list to Local_Storage.
5. IF the Local_Storage write operation fails when persisting a completion status change, THEN THE Storage_Manager SHALL display an error message indicating the change could not be saved, while retaining the toggled state in the UI for the current session.

---

### Requirement 8: To-Do List — Task Deletion

**User Story:** As a user, I want to delete tasks, so that I can remove items that are no longer relevant.

#### Acceptance Criteria

1. THE Todo_List SHALL provide a Delete control for each Task in the displayed list, visible at all times.
2. WHEN the user activates the Delete control for a Task, THE Todo_List SHALL display a confirmation prompt before removing the Task.
3. WHEN the user confirms the deletion, THE Todo_List SHALL remove the Task from the displayed list within 100 milliseconds.
4. WHEN a Task is deleted, THE Storage_Manager SHALL persist the updated Task list to Local_Storage.
5. IF the Local_Storage write operation fails after a Task deletion, THEN THE Storage_Manager SHALL display an error message indicating the deletion could not be saved, and the deleted Task SHALL remain removed from the displayed list for the current session.
6. WHEN the user cancels the deletion prompt, THE Todo_List SHALL retain the Task in the displayed list unchanged.

---

### Requirement 9: To-Do List — Data Persistence

**User Story:** As a user, I want my tasks to be saved automatically, so that my list survives page refreshes and browser restarts.

#### Acceptance Criteria

1. WHEN the Dashboard is loaded, THE Storage_Manager SHALL read the Task list from Local_Storage and restore it into the application state.
2. WHEN the Dashboard is loaded and the Task list has been restored from Local_Storage, THE Todo_List SHALL render all previously saved Tasks, preserving each Task's title and completion status.
3. IF no Task data exists in Local_Storage when the Dashboard loads, THEN THE Todo_List SHALL render an empty list with no error.
4. IF Local_Storage contains a value for the Task list key that is not valid JSON, THEN THE Storage_Manager SHALL discard the corrupted value, initialize the Task list to empty, and THE Todo_List SHALL render an empty list with no error.
5. WHEN a Task is added, edited, deleted, or its completion status is toggled, THE Storage_Manager SHALL write the updated Task list to Local_Storage before the next user interaction is processed.
6. THE Storage_Manager SHALL serialize the Task list as a JSON string before writing to Local_Storage.
7. THE Storage_Manager SHALL deserialize the JSON string from Local_Storage into a Task list when reading.
8. FOR ALL valid Task lists, serializing then deserializing SHALL produce a Task list where each Task's id, title, and completion status are identical to the original.

---

### Requirement 10: Quick Links — Display and Launch

**User Story:** As a user, I want to see my saved favorite websites as clickable buttons, so that I can navigate to them quickly from the Dashboard.

#### Acceptance Criteria

1. WHEN the Dashboard is loaded, THE Storage_Manager SHALL read the Link list from Local_Storage.
2. WHEN the Dashboard is loaded and the Link list is successfully read, THE Quick_Links SHALL render one button per saved Link, displaying the user-defined label (up to 50 characters) as the button text.
3. WHEN the user activates a Link button (via click or keyboard), THE Quick_Links SHALL open the associated URL in a new browser tab.
4. IF no Link data exists in Local_Storage when the Dashboard loads, THEN THE Quick_Links SHALL render an empty container with a message indicating no links have been saved, with no error thrown.
5. IF the Link list cannot be read from Local_Storage when the Dashboard loads, THEN THE Quick_Links SHALL render an empty container with an error message indicating the links could not be loaded.
6. IF the user activates a Link button whose associated URL is not a valid URL (does not begin with `http://` or `https://`), THEN THE Quick_Links SHALL not open a new tab and SHALL display an inline error message indicating the link is invalid.

---

### Requirement 11: Quick Links — Adding Links

**User Story:** As a user, I want to add new quick links, so that I can customize my Dashboard with my most-visited sites.

#### Acceptance Criteria

1. THE Quick_Links SHALL provide a label input field (accepting up to 100 characters), a URL input field (accepting up to 2048 characters), and an Add Link control.
2. WHEN the user submits a non-empty label and a valid URL via the Add Link control, THE Quick_Links SHALL create a new Link, render its button within 300 milliseconds, and clear both input fields.
3. WHEN a new Link is created, THE Storage_Manager SHALL persist the updated Link list to Local_Storage.
4. IF the user submits an empty label or an empty URL field, THEN THE Quick_Links SHALL reject the submission and retain focus on the first empty field without creating a Link.
5. IF the user submits a URL that does not begin with "http://" or "https://", THEN THE Quick_Links SHALL reject the submission and display an inline validation message indicating the URL format requirement.
6. IF the Local_Storage write operation fails after a Link is created, THEN THE Storage_Manager SHALL remove the newly rendered Link button, display an inline error message indicating the link could not be saved, and restore both input fields.

---

### Requirement 12: Quick Links — Deleting Links

**User Story:** As a user, I want to remove quick links I no longer need, so that I can keep the Dashboard uncluttered.

#### Acceptance Criteria

1. THE Quick_Links SHALL provide a Delete control for each Link button in the displayed list, visible at all times.
2. WHEN the user activates the Delete control for a Link, THE Quick_Links SHALL remove the Link button from the display within 300 milliseconds.
3. WHEN a Link is deleted, THE Storage_Manager SHALL persist the updated Link list to Local_Storage.
4. WHEN the last Link is deleted, THE Quick_Links SHALL render the empty-state message as defined in Requirement 10, Criterion 4.
5. IF the Local_Storage write operation fails after a Link deletion, THEN THE Storage_Manager SHALL re-render the deleted Link button, display an inline error message indicating the deletion could not be saved, and restore the link list to its pre-deletion state.

---

### Requirement 13: Quick Links — Data Persistence

**User Story:** As a user, I want my quick links to be saved automatically, so that they are available every time I open the Dashboard.

#### Acceptance Criteria

1. WHEN a Link is added or deleted, THE Storage_Manager SHALL serialize the updated Link list as a JSON string and write it to Local_Storage under a fixed key (e.g., "quickLinks") before the next user interaction is processed.
2. WHEN the Dashboard is loaded, THE Storage_Manager SHALL read the value at the fixed "quickLinks" key from Local_Storage and deserialize it into a Link list.
3. IF the value at the "quickLinks" key is not valid JSON or is missing expected fields, THEN THE Storage_Manager SHALL discard the corrupted value, initialize the Link list to empty, and log an error to the browser console.
4. IF the Local_Storage write operation fails, THEN THE Storage_Manager SHALL not update the in-memory Link list to reflect a successful save and SHALL surface an error to the UI layer.
5. FOR ALL valid Link lists (lists where each entry has a non-empty label string and a URL string beginning with "http://" or "https://"), serializing then deserializing SHALL produce a Link list where each entry's label and URL are identical to the original.

---

### Requirement 14: Technical Constraints — Stack and Structure

**User Story:** As a developer, I want the project to follow a defined file structure and technology stack, so that the codebase stays clean, maintainable, and free of external dependencies.

#### Acceptance Criteria

1. THE Dashboard SHALL be implemented using HTML for structure, CSS for presentation, and Vanilla JavaScript for behavior, with no external URLs in `<script>`, `<link>`, or `<img>` tags and no bundled third-party library copies.
2. THE Dashboard SHALL contain exactly one CSS file located in the `css/` directory, with no `<style>` blocks in any HTML file.
3. THE Dashboard SHALL contain exactly one JavaScript file located in the `js/` directory, with no inline `<script>` blocks in any HTML file and no ES module `import`/`export` statements.
4. THE Dashboard SHALL have exactly one HTML entry-point file located in the project root directory.
5. THE Dashboard SHALL function correctly in the current stable releases of Chrome, Firefox, Edge, and Safari, meaning all UI elements render and all user interactions complete without browser console errors.
6. THE Dashboard SHALL be openable as a standalone file (via `file://` protocol) in Chrome, Firefox, Edge, and Safari without a local server.

---

### Requirement 15: Non-Functional — Performance and Visual Design

**User Story:** As a user, I want the Dashboard to load fast and feel responsive, so that it does not interrupt my workflow.

#### Acceptance Criteria

1. WHEN the Dashboard page is opened on a machine with at least a 2-core CPU, 4 GB RAM, and a stable network connection of 10 Mbps or more, THE Dashboard SHALL render all widgets and display the correct time within 2 seconds.
2. WHEN the user interacts with any Widget control (add, edit, delete, toggle, timer), THE Dashboard SHALL reflect the change in the UI within 100 milliseconds.
3. THE Dashboard SHALL apply a consistent visual hierarchy where heading text is at least 4px larger than label text, and label text is at least 2px larger than body text, across all Widgets.
4. WHEN the Dashboard is rendered at any viewport width between 320px and 1920px, THE Dashboard SHALL display all content without horizontal scrolling, without overlapping elements, and with a minimum body font size of 12px.
