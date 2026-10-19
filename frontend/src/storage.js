// Saves chats in the browser so they survive a page refresh.
const KEY = "prompt-gate-chat:v1";

export function loadChats() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveChats(chats) {
  try {
    localStorage.setItem(KEY, JSON.stringify(chats.slice(0, 50)));
  } catch {
    /* storage full or blocked: the app still works without saving */
  }
}
