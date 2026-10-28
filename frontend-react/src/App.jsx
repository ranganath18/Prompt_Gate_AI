import { Navigate, Route, Routes } from "react-router-dom";

import Landing from "./pages/Landing.jsx";
import Chat from "./pages/Chat.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      {/* One route for both a new chat (/chat) and a saved one (/chat/<session id>),
          so the page keeps its state when a new chat gets its id. */}
      <Route path="/chat/:sessionId?" element={<Chat />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
