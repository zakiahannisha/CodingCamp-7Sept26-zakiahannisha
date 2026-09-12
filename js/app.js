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
