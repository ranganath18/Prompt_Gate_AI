/* Prompt Gate AI frontend (v2)
 *
 * Backend contract (unchanged):
 *   GET  /health        -> { status, message }
 *   POST /api/analyze   -> IngestionResult { intent, risk_profile, priority,
 *                          requires_action, summary, token_metadata }
 *   422 -> FastAPI validation (detail is a list) or empty message (detail is a string)
 *   502 -> schema failure (detail is an object) or LLM failure (detail is a string)
 */

const API_URL = "http://127.0.0.1:8000"; // change if your backend runs elsewhere
const MAX_CHARS = 5000;                  // must match IngestionRequest.message max_length
const REQUEST_TIMEOUT_MS = 30000;
const HEALTH_TIMEOUT_MS = 4000;
const HISTORY_KEY = "prompt-gate-ai:history";
const THEME_KEY = "prompt-gate-ai:theme";
const HISTORY_LIMIT = 6;

const $ = (id) => document.getElementById(id);

const el = {
  root: document.documentElement,
  message: $("message"),
  counter: $("counter"),
  clear: $("clear"),
  submit: $("submit"),
  theme: $("theme"),
  apiStatus: $("api-status"),
  apiStatusText: $("api-status-text"),
  result: $("result"),
  banner: $("banner"),
  bannerTitle: $("banner-title"),
  bannerDetail: $("banner-detail"),
  tabVisual: $("tab-visual"),
  tabJson: $("tab-json"),
  panelJson: $("panel-json"),
  copy: $("copy"),
  intentIcon: $("intent-icon"),
  fIntent: $("f-intent"),
  fSummary: $("f-summary"),
  fRisk: $("f-risk"),
  fPriority: $("f-priority"),
  fAction: $("f-action"),
  mRisk: $("m-risk"),
  mPriority: $("m-priority"),
  mAction: $("m-action"),
  fTokens: $("f-tokens"),
  fTokenNote: $("f-token-note"),
  errorList: $("error-list"),
  historyList: $("history-list"),
  historyEmpty: $("history-empty"),
  historyClear: $("history-clear"),
  toast: $("toast"),
  nodes: {
    message: { box: $("node-message"), sub: $("node-message-sub"), idle: "Your text goes in" },
    model: { box: $("node-model"), sub: $("node-model-sub"), idle: "Sorts the intent" },
    gate: { box: $("node-gate"), sub: $("node-gate-sub"), idle: "Checks the answer" },
  },
};

let lastJson = "";
let busy = false;
let toastTimer = null;

/* Static, trusted SVG markup (never built from user or model text) */
const SVG_OPEN =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
const ICONS = {
  greeting: SVG_OPEN + '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 10h.01M15 10h.01"/></svg>',
  order_tracking: SVG_OPEN + '<path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>',
  payment_issue: SVG_OPEN + '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></svg>',
  current_time: SVG_OPEN + '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  general_question: SVG_OPEN + '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7"/><path d="M12 17h.01"/></svg>',
  unknown: SVG_OPEN + '<circle cx="12" cy="12" r="9" stroke-dasharray="3 3"/><path d="M12 8v5M12 16h.01"/></svg>',
};

/* ---------- Helpers ---------- */

function humanize(value) {
  return String(value).replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

function levelFor(value) {
  return ["low", "medium", "high"].includes(value) ? value : "none";
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

async function fetchWithTimeout(url, options, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function toast(text) {
  el.toast.textContent = text;
  el.toast.dataset.show = "true";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.toast.dataset.show = "false"; }, 1800);
}

/* ---------- Theme ---------- */

el.theme.addEventListener("click", () => {
  const next = el.root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  el.root.setAttribute("data-theme", next);
  try { localStorage.setItem(THEME_KEY, next); } catch { /* ignore */ }
});

/* ---------- Pipeline + banner ---------- */

const NODE_WORDS = { idle: null, active: "Working…", pass: "Passed", fail: "Failed" };

function setPipeline(states) {
  Object.entries(el.nodes).forEach(([name, node]) => {
    const state = states[name] || "idle";
    node.box.dataset.state = state;
    node.sub.textContent = NODE_WORDS[state] || node.idle;
  });
}

function setBanner(state, title, detail) {
  el.banner.dataset.state = state;
  el.bannerTitle.textContent = title;
  el.bannerDetail.textContent = detail;
}

function setView(view) {
  el.result.dataset.view = view;
}

/* ---------- API health ---------- */

function setApiStatus(state, text) {
  el.apiStatus.dataset.state = state;
  el.apiStatusText.textContent = text;
}

async function checkHealth() {
  setApiStatus("checking", "Checking API");
  try {
    const res = await fetchWithTimeout(`${API_URL}/health`, {}, HEALTH_TIMEOUT_MS);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    setApiStatus("online", "API online");
  } catch {
    setApiStatus("offline", "API offline");
  }
}

/* ---------- Input ---------- */

function updateCounter() {
  const len = el.message.value.length;
  el.counter.textContent = `${len.toLocaleString()} / ${MAX_CHARS.toLocaleString()}`;
  el.counter.dataset.near = String(len >= MAX_CHARS * 0.9);
}

function setBusy(isBusy) {
  busy = isBusy;
  el.submit.disabled = isBusy;
  el.submit.textContent = isBusy ? "Analyzing…" : "Analyze message";
}

/* ---------- Rendering ---------- */

function fillMeter(meterEl, level) {
  meterEl.dataset.level = level;
}

function renderRecord(data) {
  const intent = data.intent;
  el.intentIcon.innerHTML = ICONS[intent] || ICONS.unknown; // trusted static markup
  el.fIntent.textContent = humanize(intent);
  el.fSummary.textContent = data.summary;

  el.fRisk.textContent = humanize(data.risk_profile);
  fillMeter(el.mRisk, levelFor(data.risk_profile));

  el.fPriority.textContent = humanize(data.priority);
  fillMeter(el.mPriority, levelFor(data.priority));

  const needsAction = Boolean(data.requires_action);
  el.fAction.textContent = needsAction ? "Needed" : "Not needed";
  el.mAction.dataset.level = needsAction ? "yes" : "no";
  el.mAction.textContent = needsAction ? "!" : "✓";

  const meta = data.token_metadata || {};
  el.fTokens.textContent =
    typeof meta.estimated_input_tokens === "number"
      ? meta.estimated_input_tokens.toLocaleString()
      : "—";
  el.fTokenNote.textContent = meta.note || "";
}

function showSuccess(data) {
  lastJson = JSON.stringify(data, null, 2);
  renderRecord(data);
  el.panelJson.querySelector("code").textContent = lastJson;
  el.copy.disabled = false;
  setView("result");
  setPipeline({ message: "pass", model: "pass", gate: "pass" });
  setBanner("pass", "Passed schema", "Every field and allowed value in the model's answer was valid.");
}

function showFailure(pipeline, title, detail, lines) {
  lastJson = "";
  el.panelJson.querySelector("code").textContent = "{}";
  el.copy.disabled = true;
  el.errorList.replaceChildren(
    ...lines.map((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      return li;
    })
  );
  setView(lines.length ? "error" : "empty");
  setPipeline(pipeline);
  setBanner("fail", title, detail);
}

/* ---------- Backend errors -> readable text ---------- */

function describeItem(item, dropBody) {
  const loc = Array.isArray(item.loc) ? item.loc.filter((p) => !(dropBody && p === "body")) : [];
  const field = loc.join(".");
  const msg = item.msg || JSON.stringify(item);
  return field ? `${field}: ${msg}` : String(msg);
}

function detailToLines(detail) {
  if (typeof detail === "string") return [detail];

  // FastAPI request validation: [{ loc: ["body","message"], msg, type }, ...]
  if (Array.isArray(detail)) return detail.map((item) => describeItem(item, true));

  // Schema failure from main.py: { error, validation_errors: [...] }
  if (detail && typeof detail === "object") {
    const lines = [];
    if (detail.error) lines.push(detail.error);
    if (Array.isArray(detail.validation_errors)) {
      detail.validation_errors.forEach((item) => lines.push(describeItem(item, false)));
    }
    return lines.length ? lines : [JSON.stringify(detail)];
  }
  return [];
}

function handleHttpError(status, body) {
  const detail = body && body.detail;
  const lines = detailToLines(detail);

  if (status === 422) {
    showFailure(
      { message: "fail" },
      "Message rejected (422)",
      "The backend did not accept this message. Details are below.",
      lines
    );
    return;
  }

  if (status === 502) {
    const schemaFailure = detail && typeof detail === "object" && !Array.isArray(detail);
    if (schemaFailure) {
      showFailure(
        { message: "pass", model: "pass", gate: "fail" },
        "Model output blocked (502)",
        "The model replied, but its answer did not match the schema, so the firewall rejected it.",
        lines
      );
    } else {
      showFailure(
        { message: "pass", model: "fail" },
        "Model request failed (502)",
        "The backend could not get an answer from the model. Check the API key, model name and network.",
        lines
      );
    }
    return;
  }

  showFailure(
    { message: "pass", model: "fail" },
    `Request failed (${status})`,
    "The backend returned an unexpected error. Check the backend terminal for logs.",
    lines
  );
}

/* ---------- History ---------- */

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(items) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  } catch { /* storage unavailable: history just won't persist */ }
}

function addHistory(message, data) {
  const items = loadHistory();
  items.unshift({ message, data, ts: Date.now() });
  saveHistory(items.slice(0, HISTORY_LIMIT));
  renderHistory();
}

function renderHistory() {
  const items = loadHistory();
  el.historyEmpty.hidden = items.length > 0;
  el.historyClear.hidden = items.length === 0;

  el.historyList.replaceChildren(
    ...items.map((item) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "history-item";
      btn.setAttribute("aria-label", `Reopen result: ${item.message}`);

      const top = document.createElement("span");
      top.className = "history-top";

      const ico = document.createElement("span");
      ico.className = "history-ico";
      ico.innerHTML = ICONS[item.data.intent] || ICONS.unknown; // trusted static markup

      const intent = document.createElement("span");
      intent.className = "history-intent";
      intent.textContent = humanize(item.data.intent);

      const time = document.createElement("span");
      time.className = "history-time";
      time.textContent = formatTime(item.ts);

      top.append(ico, intent, time);

      const msg = document.createElement("span");
      msg.className = "history-msg";
      msg.textContent = item.message;

      btn.append(top, msg);
      btn.addEventListener("click", () => {
        el.message.value = item.message;
        updateCounter();
        showSuccess(item.data);
        selectTab("visual");
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      li.append(btn);
      return li;
    })
  );
}

/* ---------- Tabs ---------- */

function selectTab(name) {
  const visual = name === "visual";
  el.result.dataset.tab = visual ? "visual" : "json";
  el.tabVisual.setAttribute("aria-selected", String(visual));
  el.tabJson.setAttribute("aria-selected", String(!visual));
  el.tabVisual.tabIndex = visual ? 0 : -1;
  el.tabJson.tabIndex = visual ? -1 : 0;
}

/* ---------- Main action ---------- */

async function analyze() {
  if (busy) return;

  const message = el.message.value.trim();
  if (!message) {
    setPipeline({ message: "fail" });
    setBanner("fail", "Message is empty", "Type a message or pick an example first.");
    el.message.focus();
    return;
  }
  if (message.length > MAX_CHARS) {
    setPipeline({ message: "fail" });
    setBanner("fail", "Message is too long", `Keep it under ${MAX_CHARS.toLocaleString()} characters.`);
    return;
  }

  setBusy(true);
  setView("loading");
  setPipeline({ message: "pass", model: "active", gate: "active" });
  setBanner("loading", "Analyzing…", "The model is sorting the message, then the schema gate checks its answer.");
  el.copy.disabled = true;

  try {
    const res = await fetchWithTimeout(
      `${API_URL}/api/analyze`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      },
      REQUEST_TIMEOUT_MS
    );

    let body = null;
    try { body = await res.json(); } catch { /* non-JSON response */ }

    if (!res.ok) {
      handleHttpError(res.status, body);
      return;
    }

    showSuccess(body);
    addHistory(message, body);
    setApiStatus("online", "API online");
  } catch (err) {
    if (err && err.name === "AbortError") {
      showFailure(
        { message: "pass", model: "fail" },
        "Request timed out",
        "The backend took longer than 30 seconds to answer.",
        ["Try again, or check the model provider's status."]
      );
    } else {
      showFailure(
        { message: "fail" },
        "Cannot reach the backend",
        `Nothing answered at ${API_URL}. Start the FastAPI server and try again.`,
        ["Run: uvicorn app.main:app --reload --port 8000"]
      );
      setApiStatus("offline", "API offline");
    }
  } finally {
    setBusy(false);
  }
}

/* ---------- Events ---------- */

el.message.addEventListener("input", updateCounter);

el.message.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    analyze();
  }
});

el.clear.addEventListener("click", () => {
  el.message.value = "";
  updateCounter();
  el.message.focus();
});

document.querySelectorAll(".example").forEach((btn) => {
  btn.addEventListener("click", () => {
    el.message.value = btn.dataset.message;
    updateCounter();
    el.message.focus();
  });
});

el.submit.addEventListener("click", analyze);
el.apiStatus.addEventListener("click", checkHealth);

el.tabVisual.addEventListener("click", () => selectTab("visual"));
el.tabJson.addEventListener("click", () => selectTab("json"));
[el.tabVisual, el.tabJson].forEach((tab) => {
  tab.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      const next = tab === el.tabVisual ? "json" : "visual";
      selectTab(next);
      (next === "visual" ? el.tabVisual : el.tabJson).focus();
    }
  });
});

el.copy.addEventListener("click", async () => {
  if (!lastJson) return;
  try {
    await navigator.clipboard.writeText(lastJson);
    toast("JSON copied to clipboard");
  } catch {
    toast("Copy failed. Select the JSON and copy it manually.");
  }
});

el.historyClear.addEventListener("click", () => {
  saveHistory([]);
  renderHistory();
});

/* ---------- Init ---------- */

updateCounter();
renderHistory();
checkHealth();
