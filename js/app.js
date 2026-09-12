/* js/app.js — To-do-List Life Dashboard */

/* =============================================================
   SECTION 1 — CONSTANTS & CONFIGURATION
   ============================================================= */

var STORAGE_KEY_TASKS  = "tasks";
var STORAGE_KEY_LINKS  = "quickLinks";

var TIMER_DURATION     = 25 * 60;   // 1500 seconds

var MAX_TASK_LENGTH    = 500;
var MAX_LABEL_LENGTH   = 100;
var MAX_URL_LENGTH     = 2048;

var DAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday"
];

var MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];

/* =============================================================
   SECTION 2 — UTILITY HELPERS
   ============================================================= */

/**
 * formatTime(date) — returns "HH:MM:SS" string with zero-padded parts.
 * e.g. new Date("2026-09-07T09:05:03") → "09:05:03"
 *
 * Requirements: 1.1
 *
 * @param {Date} date
 * @returns {string}
 */
function formatTime(date) {
  var hh = String(date.getHours()).padStart(2, "0");
  var mm = String(date.getMinutes()).padStart(2, "0");
  var ss = String(date.getSeconds()).padStart(2, "0");
  return hh + ":" + mm + ":" + ss;
}

/**
 * formatDate(date) — returns "Weekday, D Month YYYY" string.
 * The numeric day is NOT zero-padded.
 * e.g. new Date("2026-09-07") → "Monday, 7 September 2026"
 *
 * Requirements: 1.2
 *
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  var weekday = DAYS[date.getDay()];
  var day     = date.getDate();
  var month   = MONTHS[date.getMonth()];
  var year    = date.getFullYear();
  return weekday + ", " + day + " " + month + " " + year;
}

/**
 * getGreeting(date) — returns a time-based greeting string.
 *
 * Hour ranges:
 *   5–11  → "Good Morning"
 *   12–17 → "Good Afternoon"
 *   18–23 → "Good Evening"
 *   0–4   → "Good Evening"
 *
 * Returns "Good Day" when date is null, undefined, or when
 * getHours() cannot be called (invalid/unavailable clock).
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.6
 *
 * @param {Date|null|undefined} date
 * @returns {string}
 */
function getGreeting(date) {
  if (date === null || date === undefined) {
    return "Good Day";
  }
  try {
    var hour = date.getHours();
    if (hour >= 5 && hour <= 11) {
      return "Good Morning";
    } else if (hour >= 12 && hour <= 17) {
      return "Good Afternoon";
    } else {
      // covers 18–23 and 0–4
      return "Good Evening";
    }
  } catch (e) {
    return "Good Day";
  }
}

/**
 * formatTimer(seconds) — converts integer seconds [0–1500] to "MM:SS" string.
 *
 * Examples:
 *   formatTimer(1500) → "25:00"
 *   formatTimer(65)   → "01:05"
 *   formatTimer(0)    → "00:00"
 *
 * Requirements: 3.3
 *
 * @param {number} seconds - Integer in range [0, 1500]
 * @returns {string}
 */
function formatTimer(seconds) {
  var mins = Math.floor(seconds / 60);
  var secs = seconds % 60;
  var mm = mins < 10 ? "0" + mins : String(mins);
  var ss = secs < 10 ? "0" + secs : String(secs);
  return mm + ":" + ss;
}

/**
 * isValidTaskInput(str) — returns false for null, empty, or whitespace-only strings.
 *
 * Requirements: 5.6, 6.6
 *
 * @param {*} str
 * @returns {boolean}
 */
function isValidTaskInput(str) {
  if (str === null || str === undefined) return false;
  return typeof str === "string" && str.trim().length > 0;
}

/**
 * isValidURL(str) — returns true only when str starts with "http://" or "https://".
 *
 * Requirements: 10.6, 11.5
 *
 * @param {*} str
 * @returns {boolean}
 */
function isValidURL(str) {
  return typeof str === "string" &&
    (str.startsWith("http://") || str.startsWith("https://"));
}

/**
 * isValidLinkInput(label, url) — returns false when label is empty/whitespace,
 * URL is empty/whitespace, or URL fails isValidURL.
 *
 * Requirements: 11.4
 *
 * @param {*} label
 * @param {*} url
 * @returns {boolean}
 */
function isValidLinkInput(label, url) {
  if (!label || typeof label !== "string" || label.trim().length === 0) return false;
  if (!url || typeof url !== "string" || url.trim().length === 0) return false;
  return isValidURL(url.trim());
}

/* =============================================================
   SECTION 3 — STORAGE MANAGER
   ============================================================= */

/**
 * loadTasks() — reads task array from localStorage.
 *
 * Returns [] when the key is absent, the stored value is not valid JSON,
 * or the parsed value is not an array.
 *
 * Requirements: 9.1, 9.3, 9.4
 *
 * @returns {Array}
 */
function loadTasks() {
  var raw = localStorage.getItem(STORAGE_KEY_TASKS);
  if (raw === null) return [];
  try {
    var parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Corrupted task data discarded:", e);
    return [];
  }
}

/**
 * loadLinks() — reads quick-link array from localStorage.
 *
 * Returns [] when the key is absent, the stored value is not valid JSON,
 * or the parsed value is not an array.
 *
 * Requirements: 10.1, 13.2, 13.3
 *
 * @returns {Array}
 */
function loadLinks() {
  var raw = localStorage.getItem(STORAGE_KEY_LINKS);
  if (raw === null) return [];
  try {
    var parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Corrupted link data discarded:", e);
    return [];
  }
}

/**
 * saveTasks(tasks) — serializes and writes the task array to localStorage.
 *
 * Throws an Error on write failure so the calling widget function
 * can catch it and surface an inline error to the user.
 *
 * Requirements: 5.4, 6.4, 7.4, 8.4, 9.5, 9.6, 9.7
 *
 * @param {Array} tasks
 */
function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  } catch (e) {
    throw new Error("Storage unavailable: " + e.message);
  }
}

/**
 * saveLinks(links) — serializes and writes the link array to localStorage.
 *
 * Throws an Error on write failure so the calling widget function
 * can catch it and surface an inline error to the user.
 *
 * Requirements: 13.1
 *
 * @param {Array} links
 */
function saveLinks(links) {
  try {
    localStorage.setItem(STORAGE_KEY_LINKS, JSON.stringify(links));
  } catch (e) {
    throw new Error("Storage unavailable: " + e.message);
  }
}

/* =============================================================
   SECTION 4 — STATE STORE
   ============================================================= */

/**
 * state — single source of truth for all runtime data.
 *
 * Shape:
 *   tasks   {Array}   — task objects loaded from / persisted to localStorage
 *   links   {Array}   — quick-link objects loaded from / persisted to localStorage
 *   timer   {Object}  — Pomodoro timer sub-state:
 *     status           {string}      "Idle" | "Running" | "Paused"
 *     remainingSeconds {number}      Countdown value in seconds [0–1500]
 *     intervalId       {number|null} Return value of setInterval, or null when
 *                                    no interval is active
 *
 * MUTATION RULE:
 *   All reads and writes to this object MUST go through the widget functions:
 *     initGreeting, initTimer, initTodoList, initQuickLinks
 *   and their associated action functions (e.g. addTask, deleteTask, toggleTask,
 *   editTask, addLink, deleteLink, startTimer, pauseTimer, resetTimer).
 *
 *   Direct external mutation of `state` from outside these widget functions
 *   is strictly forbidden — doing so bypasses persistence, DOM sync, and
 *   validation logic.
 *
 * Requirements: 9.1, 13.2
 */
var state = {
  tasks: [],
  links: [],
  timer: {
    status: "Idle",
    remainingSeconds: TIMER_DURATION,   // 1500 seconds = 25 minutes
    intervalId: null
  }
};

/* =============================================================
   SECTION 5 — GREETING WIDGET
   ============================================================= */

/**
 * renderGreeting() — reads the current system clock and updates the three
 * greeting-widget DOM elements.
 *
 * Success path (clock available):
 *   #clock-display   ← formatTime(date)  e.g. "14:32:07"
 *   #date-display    ← formatDate(date)  e.g. "Monday, 7 September 2026"
 *   #greeting-message← getGreeting(date) e.g. "Good Afternoon"
 *
 * Failure path (new Date() throws or clock is otherwise unavailable):
 *   #clock-display   ← "Time unavailable"
 *   #date-display    ← "Time unavailable"
 *   #greeting-message← "Good Day"
 *
 * Requirements: 1.1, 1.2, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */
function renderGreeting() {
  var clockEl    = document.getElementById("clock-display");
  var dateEl     = document.getElementById("date-display");
  var greetingEl = document.getElementById("greeting-message");

  try {
    var date = new Date();
    // Verify the Date is valid before using it
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    if (clockEl)    clockEl.textContent    = formatTime(date);
    if (dateEl)     dateEl.textContent     = formatDate(date);
    if (greetingEl) greetingEl.textContent = getGreeting(date);
  } catch (e) {
    if (clockEl)    clockEl.textContent    = "Time unavailable";
    if (dateEl)     dateEl.textContent     = "Time unavailable";
    if (greetingEl) greetingEl.textContent = "Good Day";
  }
}

/**
 * initGreeting() — immediately renders the greeting widget and then
 * schedules it to refresh once per second so the clock never falls
 * more than 1 second behind the system clock.
 *
 * Requirements: 1.3, 1.4, 2.5
 */
function initGreeting() {
  renderGreeting();
  setInterval(renderGreeting, 1000);
}

/* =============================================================
   SECTION 6 — FOCUS TIMER WIDGET
   ============================================================= */

/**
 * renderTimer() — updates the timer display and button disabled states
 * based on the current timer state machine status.
 *
 * Button state invariant (Property 6):
 *   "Running"           → Start disabled, Stop enabled,  Reset enabled
 *   "Idle" | "Paused"  → Start enabled,  Stop disabled, Reset enabled
 *   "Completed"        → Start disabled, Stop disabled,  Reset enabled
 *
 * Requirements: 3.1, 3.3, 4.5, 4.6
 */
function renderTimer() {
  var displayEl = document.getElementById("timer-display");
  var btnStart  = document.getElementById("btn-start");
  var btnStop   = document.getElementById("btn-stop");
  var btnReset  = document.getElementById("btn-reset");

  if (displayEl) {
    displayEl.textContent = formatTimer(state.timer.remainingSeconds);
  }

  if (!btnStart || !btnStop || !btnReset) return;

  var status = state.timer.status;

  if (status === "Running") {
    btnStart.disabled = true;
    btnStop.disabled  = false;
    btnReset.disabled = false;
  } else if (status === "Completed") {
    btnStart.disabled = true;
    btnStop.disabled  = true;
    btnReset.disabled = false;
  } else {
    // "Idle" or "Paused"
    btnStart.disabled = false;
    btnStop.disabled  = true;
    btnReset.disabled = false;
  }
}

/**
 * startTimer() — transitions the timer from Idle or Paused to Running
 * and begins the 1-second countdown interval.
 *
 * Guard: does nothing if status is already "Running" or "Completed".
 *
 * Each tick decrements remainingSeconds by 1. When it reaches 0,
 * completeTimer() is called instead of another decrement.
 *
 * Requirements: 3.2, 4.3, 4.7
 */
function startTimer() {
  var status = state.timer.status;
  if (status === "Running" || status === "Completed") return;

  state.timer.status = "Running";
  renderTimer();

  state.timer.intervalId = setInterval(function () {
    if (state.timer.remainingSeconds <= 0) {
      completeTimer();
      return;
    }
    state.timer.remainingSeconds -= 1;
    if (state.timer.remainingSeconds === 0) {
      completeTimer();
    } else {
      renderTimer();
    }
  }, 1000);
}

/**
 * stopTimer() — pauses the running timer.
 *
 * Clears the countdown interval and transitions status to "Paused".
 *
 * Requirements: 4.2
 */
function stopTimer() {
  if (state.timer.intervalId !== null) {
    clearInterval(state.timer.intervalId);
    state.timer.intervalId = null;
  }
  state.timer.status = "Paused";
  renderTimer();
}

/**
 * resetTimer() — returns the timer to its initial Idle state.
 *
 * Clears any active interval, restores remainingSeconds to TIMER_DURATION
 * (1500 s = 25:00), and sets status back to "Idle".
 * Safe to call from any status (including Idle — effectively a no-op).
 *
 * Requirements: 3.4, 3.5, 4.4, 4.8
 */
function resetTimer() {
  if (state.timer.intervalId !== null) {
    clearInterval(state.timer.intervalId);
    state.timer.intervalId = null;
  }
  state.timer.remainingSeconds = TIMER_DURATION;
  state.timer.status = "Idle";
  renderTimer();
}

/**
 * completeTimer() — called when the countdown reaches 0.
 *
 * Clears the interval, sets status to "Completed", re-renders the timer
 * (which will show "00:00" and disable Start + Stop), then emits an
 * audible alert of at least 1 second using the Web Audio API.
 * Falls back gracefully if AudioContext is unavailable.
 *
 * Requirements: 3.4, 4.8
 */
function completeTimer() {
  if (state.timer.intervalId !== null) {
    clearInterval(state.timer.intervalId);
    state.timer.intervalId = null;
  }
  state.timer.remainingSeconds = 0;
  state.timer.status = "Completed";
  renderTimer();

  // Audible alert — synthesize a 1-second beep via Web Audio API
  try {
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) throw new Error("AudioContext not available");

    var ctx        = new AudioCtx();
    var oscillator = ctx.createOscillator();
    var gainNode   = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // 880 Hz sine wave (A5 note) — clearly audible alert tone
    oscillator.type      = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);

    // Ramp volume down over the last 0.1 s to avoid a click artefact
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.0);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 1.0);   // 1 second duration

    // Close the context after the beep finishes to free resources
    oscillator.onended = function () {
      ctx.close();
    };
  } catch (e) {
    // AudioContext unavailable (e.g. automated test environment) — fail silently
    console.warn("Timer beep unavailable:", e.message);
  }
}

/**
 * initTimer() — binds button event listeners and renders the initial state.
 *
 * Wires:
 *   #btn-start  → startTimer
 *   #btn-stop   → stopTimer
 *   #btn-reset  → resetTimer
 *
 * Calls renderTimer() so the display shows "25:00" and the correct
 * button disabled states are applied before the user interacts.
 *
 * Requirements: 3.1, 4.1
 */
function initTimer() {
  var btnStart = document.getElementById("btn-start");
  var btnStop  = document.getElementById("btn-stop");
  var btnReset = document.getElementById("btn-reset");

  if (btnStart) btnStart.addEventListener("click", startTimer);
  if (btnStop)  btnStop.addEventListener("click",  stopTimer);
  if (btnReset) btnReset.addEventListener("click",  resetTimer);

  renderTimer();
}

/* =============================================================
   SECTION 7 — TODO LIST WIDGET
   ============================================================= */

/**
 * editingTaskId — tracks which task (by id) is currently in inline-edit mode.
 * null means no task is being edited.
 */
var editingTaskId = null;

/* ── Error helpers ─────────────────────────────────────────── */

/**
 * showError(elementId, message) — displays an inline error message.
 *
 * Gets the element by ID, sets its textContent to message and makes
 * it visible by setting style.display to "block".
 *
 * Requirements: 5.5, 5.6, 6.6, 6.7, 7.5, 8.5
 *
 * @param {string} elementId
 * @param {string} message
 */
function showError(elementId, message) {
  var el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.style.display = "block";
  }
}

/**
 * clearError(elementId) — hides and clears an inline error message.
 *
 * Requirements: 5.5, 5.6, 6.6, 6.7, 7.5, 8.5
 *
 * @param {string} elementId
 */
function clearError(elementId) {
  var el = document.getElementById(elementId);
  if (el) {
    el.textContent = "";
    el.style.display = "none";
  }
}

/* ── Render ────────────────────────────────────────────────── */

/**
 * renderTodoList() — replaces #todo-list innerHTML with the current
 * state.tasks array.
 *
 * Each task renders as:
 *   <li class="task-item [completed]" data-task-id="…">
 *     <input type="checkbox" class="task-checkbox" …>
 *     <span class="task-text">…</span>   ← normal view
 *       OR
 *     <input class="task-edit-input" …>  ← edit view (when editingTaskId matches)
 *     <button class="btn-edit">Edit</button>
 *     <button class="btn-delete">Delete</button>
 *     <p class="error task-error" id="task-error-{id}"></p>
 *   </li>
 *
 * When a task is in edit mode the text span is replaced with an <input>
 * pre-populated with the current title, and the Edit button is replaced
 * with Save + Cancel buttons.
 *
 * Requirements: 5.3, 7.2, 7.3, 9.2
 */
function renderTodoList() {
  var listEl = document.getElementById("todo-list");
  if (!listEl) return;

  if (state.tasks.length === 0) {
    listEl.innerHTML = "";
    return;
  }

  var html = "";
  for (var i = 0; i < state.tasks.length; i++) {
    var task = state.tasks[i];
    var liClass = "task-item" + (task.completed ? " completed" : "");
    var isEditing = (editingTaskId === task.id);

    // Checkbox — checked reflects completion state
    var checkboxHtml = '<input type="checkbox" class="task-checkbox"' +
      (task.completed ? " checked" : "") +
      ' aria-label="Mark task complete">';

    var contentHtml;
    var actionHtml;

    if (isEditing) {
      // Edit mode: replace text span with an input field
      var escapedTitle = task.title
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      contentHtml = '<input type="text" class="task-edit-input"' +
        ' data-task-id="' + task.id + '"' +
        ' value="' + escapedTitle + '"' +
        ' maxlength="' + MAX_TASK_LENGTH + '"' +
        ' aria-label="Edit task text">';

      actionHtml =
        '<button class="btn-save" aria-label="Save task">Save</button>' +
        '<button class="btn-cancel" aria-label="Cancel edit">Cancel</button>';
    } else {
      // Normal view: show task text as a span
      var escapedText = task.title
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      contentHtml = '<span class="task-text">' + escapedText + '</span>';

      actionHtml =
        '<button class="btn-edit" aria-label="Edit task">Edit</button>' +
        '<button class="btn-delete" aria-label="Delete task">Delete</button>';
    }

    html +=
      '<li class="' + liClass + '" data-task-id="' + task.id + '">' +
        checkboxHtml +
        contentHtml +
        actionHtml +
        '<p class="error task-error" id="task-error-' + task.id + '" style="display:none;"></p>' +
      '</li>';
  }

  listEl.innerHTML = html;
}

/* ── Action functions ──────────────────────────────────────── */

/**
 * addTask(text) — creates a new Task and appends it to state.tasks.
 *
 * Validates input; shows inline error on failure.
 * On success: trims text, generates id, pushes to state, persists,
 * clears the input field, and re-renders.
 *
 * Requirements: 5.2, 5.3, 5.4, 5.5, 5.6
 *
 * @param {string} text - Raw value from the input field
 */
function addTask(text) {
  if (!isValidTaskInput(text)) {
    showError("todo-input-error", "Please enter a task.");
    var inputEl = document.getElementById("todo-input");
    if (inputEl) inputEl.focus();
    return;
  }

  clearError("todo-input-error");

  var task = {
    id:        String(Date.now() + Math.random()),
    title:     text.trim(),
    completed: false
  };

  state.tasks.push(task);

  // Clear the input field immediately
  var inputField = document.getElementById("todo-input");
  if (inputField) inputField.value = "";

  // Persist; keep task in state even if storage fails
  try {
    saveTasks(state.tasks);
  } catch (e) {
    showError("todo-input-error", "Task could not be saved.");
  }

  renderTodoList();
}

/**
 * startEditTask(id) — enters inline-edit mode for the given task.
 *
 * Sets editingTaskId and re-renders so the task row shows an input field.
 *
 * Requirements: 6.1, 6.2
 *
 * @param {string} id
 */
function startEditTask(id) {
  editingTaskId = id;
  renderTodoList();

  // Focus the edit input after render
  var editInput = document.querySelector(".task-edit-input[data-task-id='" + id + "']");
  if (editInput) {
    editInput.focus();
    // Move cursor to end of existing text
    var len = editInput.value.length;
    editInput.setSelectionRange(len, len);
  }
}

/**
 * editTask(id, newText) — saves inline-edit changes for the given task.
 *
 * Validates new text; shows per-item inline error on failure (keeping the
 * edit input open). On success: mutates title, clears editingTaskId,
 * persists, and re-renders.
 *
 * Requirements: 6.3, 6.4, 6.5, 6.6, 6.7
 *
 * @param {string} id
 * @param {string} newText - Current value from the edit input field
 */
function editTask(id, newText) {
  if (!isValidTaskInput(newText)) {
    showError("task-error-" + id, "Task text cannot be empty.");
    var editInput = document.querySelector(".task-edit-input[data-task-id='" + id + "']");
    if (editInput) editInput.focus();
    return;
  }

  // Find and mutate the task
  for (var i = 0; i < state.tasks.length; i++) {
    if (state.tasks[i].id === id) {
      state.tasks[i].title = newText.trim();
      break;
    }
  }

  editingTaskId = null;

  try {
    saveTasks(state.tasks);
  } catch (e) {
    // Re-render first so the task-error element exists in DOM
    renderTodoList();
    showError("task-error-" + id, "Change could not be saved.");
    return;
  }

  renderTodoList();
}

/**
 * cancelEditTask() — discards any in-progress inline edit.
 *
 * Clears editingTaskId and re-renders without touching state.tasks.
 *
 * Requirements: 6.5
 */
function cancelEditTask() {
  editingTaskId = null;
  renderTodoList();
}

/**
 * toggleTask(id) — flips the completed status of the given task.
 *
 * Persists and re-renders. On storage failure shows a per-item error.
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 *
 * @param {string} id
 */
function toggleTask(id) {
  for (var i = 0; i < state.tasks.length; i++) {
    if (state.tasks[i].id === id) {
      state.tasks[i].completed = !state.tasks[i].completed;
      break;
    }
  }

  try {
    saveTasks(state.tasks);
  } catch (e) {
    renderTodoList();
    showError("task-error-" + id, "Status could not be saved.");
    return;
  }

  renderTodoList();
}

/**
 * deleteTask(id) — removes a task after the user confirms the deletion.
 *
 * Shows window.confirm; if the user cancels, does nothing.
 * On confirm: filters task out of state, persists, re-renders.
 * Storage failure: shows error on #todo-input-error; task stays removed
 * from state and UI for this session (per spec Req 8.5).
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 *
 * @param {string} id
 */
function deleteTask(id) {
  var confirmed = window.confirm("Delete this task?");
  if (!confirmed) return;

  state.tasks = state.tasks.filter(function (t) { return t.id !== id; });

  // If the deleted task was being edited, clear editing state
  if (editingTaskId === id) {
    editingTaskId = null;
  }

  try {
    saveTasks(state.tasks);
  } catch (e) {
    renderTodoList();
    showError("todo-input-error", "Deletion could not be saved.");
    return;
  }

  renderTodoList();
}

/* ── Init ──────────────────────────────────────────────────── */

/**
 * initTodoList() — renders the initial list and wires up all event listeners.
 *
 * Uses event delegation on #todo-list so dynamically created task rows
 * are handled without re-attaching listeners on every render.
 *
 * Delegated events on #todo-list:
 *   click  .task-checkbox  → toggleTask(taskId)
 *   click  .btn-edit       → startEditTask(taskId)
 *   click  .btn-save       → editTask(taskId, inputValue)
 *   click  .btn-cancel     → cancelEditTask()
 *   click  .btn-delete     → deleteTask(taskId)
 *   keydown .task-edit-input (Enter)  → editTask(taskId, inputValue)
 *   keydown .task-edit-input (Escape) → cancelEditTask()
 *
 * Direct bindings:
 *   #btn-add-task click → addTask(#todo-input value)
 *   #todo-input keydown (Enter) → addTask(input value)
 *
 * Requirements: 5.1, 9.1, 9.2, 9.3
 */
function initTodoList() {
  renderTodoList();

  var listEl    = document.getElementById("todo-list");
  var addBtn    = document.getElementById("btn-add-task");
  var todoInput = document.getElementById("todo-input");

  // ── Event delegation — clicks inside #todo-list ────────────
  if (listEl) {
    listEl.addEventListener("click", function (e) {
      var target = e.target;

      // Resolve the closest <li> to get the task id
      var li = target.closest ? target.closest("[data-task-id]") : null;
      if (!li) return;
      var taskId = li.getAttribute("data-task-id");
      if (!taskId) return;

      if (target.classList.contains("task-checkbox")) {
        toggleTask(taskId);

      } else if (target.classList.contains("btn-edit")) {
        startEditTask(taskId);

      } else if (target.classList.contains("btn-save")) {
        var editInput = li.querySelector(".task-edit-input");
        var newText = editInput ? editInput.value : "";
        editTask(taskId, newText);

      } else if (target.classList.contains("btn-cancel")) {
        cancelEditTask();

      } else if (target.classList.contains("btn-delete")) {
        deleteTask(taskId);
      }
    });

    // ── Event delegation — keydown inside edit inputs ──────────
    listEl.addEventListener("keydown", function (e) {
      var target = e.target;
      if (!target.classList.contains("task-edit-input")) return;

      var li = target.closest ? target.closest("[data-task-id]") : null;
      if (!li) return;
      var taskId = li.getAttribute("data-task-id");
      if (!taskId) return;

      if (e.key === "Enter") {
        e.preventDefault();
        editTask(taskId, target.value);
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelEditTask();
      }
    });
  }

  // ── Add task via button click ─────────────────────────────
  if (addBtn) {
    addBtn.addEventListener("click", function () {
      var val = todoInput ? todoInput.value : "";
      addTask(val);
    });
  }

  // ── Add task via Enter key in input field ─────────────────
  if (todoInput) {
    todoInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        addTask(todoInput.value);
      }
    });
  }
}

/* =============================================================
   SECTION 8 — QUICK LINKS WIDGET
   ============================================================= */

/**
 * renderQuickLinks() — replaces #quicklinks-list innerHTML with the
 * current state.links array.
 *
 * Empty state: a single <li class="empty-state"> with a message.
 * Non-empty: one <li class="link-item"> per link containing:
 *   - <button class="link-button" data-id="…">label</button>
 *   - <button class="btn-delete-link" data-id="…">Delete</button>
 *
 * Requirements: 10.2, 10.4, 10.5, 12.4
 */
function renderQuickLinks() {
  var listEl = document.getElementById("quicklinks-list");
  if (!listEl) return;

  if (state.links.length === 0) {
    listEl.innerHTML =
      '<li class="empty-state">No quick links saved yet.</li>';
    return;
  }

  var html = "";
  for (var i = 0; i < state.links.length; i++) {
    var link = state.links[i];

    // Escape label for safe insertion into HTML attribute and text content
    var escapedLabel = link.label
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    html +=
      '<li class="link-item">' +
        '<button class="link-button" data-id="' + link.id + '"' +
          ' aria-label="Open ' + escapedLabel + '">' +
          escapedLabel +
        '</button>' +
        '<button class="btn-delete-link" data-id="' + link.id + '"' +
          ' aria-label="Delete link ' + escapedLabel + '">Delete</button>' +
      '</li>';
  }

  listEl.innerHTML = html;
}

/**
 * openLink(id) — finds the link in state.links by id, validates the URL,
 * and opens it in a new tab.
 *
 * If the URL is invalid (not http:// or https://), shows an inline error
 * on #quicklinks-error and does NOT open a new tab.
 *
 * Requirements: 10.3, 10.6
 *
 * @param {string} id
 */
function openLink(id) {
  var link = null;
  for (var i = 0; i < state.links.length; i++) {
    if (state.links[i].id === id) {
      link = state.links[i];
      break;
    }
  }
  if (!link) return;

  if (!isValidURL(link.url)) {
    showError("quicklinks-error", "Invalid link: URL must start with http:// or https://");
    return;
  }

  window.open(link.url, "_blank");
}

/**
 * addLink(label, url) — validates inputs, creates a Link, persists it,
 * and re-renders.
 *
 * Validation failure: shows field-specific error, returns without creating.
 * Storage failure (Req 11.6): rolls back the link from state.links, shows
 * error on #quicklinks-error, and restores both input fields to the
 * supplied label and url values.
 *
 * Requirements: 11.2, 11.3, 11.4, 11.5, 11.6
 *
 * @param {string} label - Raw value from #link-label-input
 * @param {string} url   - Raw value from #link-url-input
 */
function addLink(label, url) {
  // Validate — isValidLinkInput covers empty label, empty URL, and invalid URL
  if (!isValidLinkInput(label, url)) {
    // Give a specific error message depending on which field is the problem
    if (!label || typeof label !== "string" || label.trim().length === 0) {
      showError("quicklinks-error", "Please enter a label.");
    } else if (!url || typeof url !== "string" || url.trim().length === 0) {
      showError("quicklinks-error", "Please enter a URL.");
    } else {
      showError("quicklinks-error", 'URL must start with "http://" or "https://".');
    }
    return;
  }

  clearError("quicklinks-error");

  var link = {
    id:    String(Date.now() + Math.random()),
    label: label.trim(),
    url:   url.trim()
  };

  state.links.push(link);

  // Clear input fields immediately (optimistic)
  var labelInput = document.getElementById("link-label-input");
  var urlInput   = document.getElementById("link-url-input");
  if (labelInput) labelInput.value = "";
  if (urlInput)   urlInput.value   = "";

  // Persist; rollback on failure (Req 11.6)
  try {
    saveLinks(state.links);
  } catch (e) {
    // Rollback: remove the link that was just pushed
    state.links = state.links.filter(function (l) { return l.id !== link.id; });
    // Restore input field values
    if (labelInput) labelInput.value = label;
    if (urlInput)   urlInput.value   = url;
    showError("quicklinks-error", "Link could not be saved.");
    renderQuickLinks();
    return;
  }

  renderQuickLinks();
}

/**
 * deleteLink(id) — removes a link from state.links, persists, and re-renders.
 *
 * Saves the link and its original index before removal so it can be
 * rolled back on storage failure.
 *
 * Storage failure (Req 12.5): re-inserts the link at its original index,
 * shows #quicklinks-error, and re-renders.
 *
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
 *
 * @param {string} id
 */
function deleteLink(id) {
  // Capture the link and its position for potential rollback
  var originalIndex = -1;
  var removedLink   = null;
  for (var i = 0; i < state.links.length; i++) {
    if (state.links[i].id === id) {
      originalIndex = i;
      removedLink   = state.links[i];
      break;
    }
  }
  if (originalIndex === -1) return; // Link not found; nothing to do

  // Remove from state
  state.links.splice(originalIndex, 1);

  try {
    saveLinks(state.links);
  } catch (e) {
    // Rollback: re-insert at original position
    state.links.splice(originalIndex, 0, removedLink);
    showError("quicklinks-error", "Deletion could not be saved.");
    renderQuickLinks();
    return;
  }

  renderQuickLinks();
}

/**
 * initQuickLinks() — sets up event delegation on #quicklinks-list and
 * wires the #btn-add-link button, then renders the initial state.
 *
 * Delegated events on #quicklinks-list:
 *   click .link-button      → openLink(id)
 *   click .btn-delete-link  → deleteLink(id)
 *
 * Direct binding:
 *   #btn-add-link click → addLink(labelInput.value, urlInput.value)
 *
 * Requirements: 10.1, 10.2, 11.1, 13.2
 */
function initQuickLinks() {
  var listEl     = document.getElementById("quicklinks-list");
  var addLinkBtn = document.getElementById("btn-add-link");
  var labelInput = document.getElementById("link-label-input");
  var urlInput   = document.getElementById("link-url-input");

  // ── Event delegation — clicks inside #quicklinks-list ─────
  if (listEl) {
    listEl.addEventListener("click", function (e) {
      var target = e.target;

      if (target.classList.contains("link-button")) {
        var linkId = target.getAttribute("data-id");
        if (linkId) openLink(linkId);

      } else if (target.classList.contains("btn-delete-link")) {
        var deleteId = target.getAttribute("data-id");
        if (deleteId) deleteLink(deleteId);
      }
    });
  }

  // ── Add link via button click ─────────────────────────────
  if (addLinkBtn) {
    addLinkBtn.addEventListener("click", function () {
      clearError("quicklinks-error");
      var lbl = labelInput ? labelInput.value : "";
      var url = urlInput   ? urlInput.value   : "";
      addLink(lbl, url);
    });
  }

  renderQuickLinks();
}

/* =============================================================
   SECTION 9 — APP BOOTSTRAP
   ============================================================= */

/**
 * init() — entry point called on DOMContentLoaded.
 *
 * Loads persisted data into state, then initialises every widget.
 *
 * Requirements: 9.1, 10.1, 10.5, 13.2
 */
document.addEventListener("DOMContentLoaded", function () {
  state.tasks = loadTasks();
  state.links = loadLinks();
  initGreeting();
  initTimer();
  initTodoList();
  initQuickLinks();
});
