import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

const CHECK_EVERY_MS = 15000;

/** Polls GET /health. Returns "checking" | "online" | "offline". */
export function useBackendStatus() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    const check = () =>
      api
        .health()
        .then(() => active && setStatus("online"))
        .catch(() => active && setStatus("offline"));

    check();
    const timer = setInterval(check, CHECK_EVERY_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  return status;
}
