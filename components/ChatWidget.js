"use client";

import { useEffect, useRef, useState } from "react";
import Crest from "./Crest";

const GREETING =
  "Hello, and welcome to Atlantic Crest Polytechnic. I can help with school fees, admission requirements, resumption dates, and school policies. What would you like to know?";

const SUGGESTIONS = [
  "What are the ND fees?",
  "When does second semester resume?",
  "What are the admission requirements?",
  "What is the attendance policy?",
];

function newSessionId() {
  return "s_" + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

export default function ChatWidget({ pending, onConsumed }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ from: "bot", text: GREETING }]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const logRef = useRef(null);

  useEffect(() => {
    let id = null;
    try {
      id = window.localStorage.getItem("acp_session_id");
    } catch (e) {
      id = null;
    }
    if (!id) {
      id = newSessionId();
      try {
        window.localStorage.setItem("acp_session_id", id);
      } catch (e) {
        /* storage unavailable, session stays in memory only */
      }
    }
    setSessionId(id);
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages, busy, open]);

  async function send(text) {
    const question = (text || "").trim();
    if (!question || busy) return;

    setMessages((m) => [...m, { from: "me", text: question }]);
    setDraft("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, sessionId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((m) => [
          ...m,
          { from: "err", text: data.error || "The assistant could not be reached. Try again in a moment." },
        ]);
      } else {
        setMessages((m) => [...m, { from: "bot", text: data.reply }]);
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        { from: "err", text: "No connection to the assistant. Check your internet and try again." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  // a question clicked from the page opens the panel and asks it
  useEffect(() => {
    if (pending) {
      setOpen(true);
      send(pending);
      if (onConsumed) onConsumed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  if (!open) {
    return (
      <button className="launcher" onClick={() => setOpen(true)}>
        <Crest size={26} tone="#e8d5ab" />
        Ask Atlantic Crest
      </button>
    );
  }

  const showSuggestions = messages.length === 1 && !busy;

  return (
    <div className="panel" role="dialog" aria-label="Atlantic Crest Polytechnic support chat">
      <div className="panel-head">
        <Crest size={30} tone="#e8d5ab" />
        <div>
          <div className="panel-title">Atlantic Crest Support</div>
          <div className="panel-status">Answers from school records</div>
        </div>
        <button className="panel-close" onClick={() => setOpen(false)} aria-label="Close chat">
          &times;
        </button>
      </div>

      <div className="log" ref={logRef}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={"msg " + (m.from === "me" ? "me" : m.from === "err" ? "err" : "bot")}
          >
            {m.text}
          </div>
        ))}
        {busy && (
          <div className="msg bot">
            <span className="dots">
              <i />
              <i />
              <i />
            </span>
          </div>
        )}
      </div>

      {showSuggestions && (
        <div className="chips">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="chip" onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="composer">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send(draft);
          }}
          placeholder="Ask about fees, admission, resumption..."
          aria-label="Your question"
        />
        <button className="send" onClick={() => send(draft)} disabled={busy || !draft.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
