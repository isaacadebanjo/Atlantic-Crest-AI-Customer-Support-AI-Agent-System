"use client";

import { useEffect, useState } from "react";
import Crest from "../../components/Crest";

const TABS = ["Overview", "Knowledge base", "Contacts", "Announcements"];

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState("Overview");
  const [data, setData] = useState(null);
  const [dataError, setDataError] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const out = await res.json();
    if (!res.ok) {
      setLoginError(out.error || "Sign in failed.");
      return;
    }
    setAuthed(true);
  }

  async function signOut() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
    setData(null);
    setPassword("");
  }

  async function load() {
    setLoading(true);
    setDataError("");
    try {
      const res = await fetch("/api/admin/data");
      const out = await res.json();
      if (!res.ok) {
        setDataError(out.error || "Could not load data.");
      } else {
        setData(out);
      }
    } catch (e) {
      setDataError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authed) load();
  }, [authed]);

  if (!authed) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <Crest size={54} />
          <h1>Student Affairs</h1>
          <p>Sign in to manage the support assistant.</p>
          {loginError && <div className="notice bad">{loginError}</div>}
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") signIn();
              }}
              placeholder="Enter staff password"
            />
          </label>
          <button className="btn btn-wide" onClick={signIn} disabled={!password}>
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="admin-bar">
        <div className="admin-bar-inner">
          <Crest size={32} tone="#e8d5ab" />
          <div>
            <div className="brand-name">Atlantic Crest Polytechnic</div>
            <div className="brand-sub">Support assistant dashboard</div>
          </div>
          <button className="btn btn-ghost" style={{ marginLeft: "auto" }} onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={"tab" + (tab === t ? " on" : "")} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="admin-body">
        {dataError && <div className="notice bad">{dataError}</div>}
        {loading && !data && <div className="empty">Loading...</div>}

        {tab === "Overview" && data && <Overview data={data} onRefresh={load} />}
        {tab === "Knowledge base" && data && <KnowledgeBase data={data} />}
        {tab === "Contacts" && data && <Contacts data={data} />}
        {tab === "Announcements" && <Announcements data={data} />}
      </div>
    </>
  );
}

function Overview({ data, onRefresh }) {
  const s = data.stats;
  return (
    <>
      <div className="stat-grid">
        <div className="stat">
          <div className="stat-n">{s.documents}</div>
          <div className="stat-l">Documents in knowledge base</div>
        </div>
        <div className="stat">
          <div className="stat-n">{s.chunks}</div>
          <div className="stat-l">Searchable passages</div>
        </div>
        <div className="stat">
          <div className="stat-n">{s.contacts}</div>
          <div className="stat-l">Contacts captured</div>
        </div>
        <div className="stat">
          <div className="stat-n">{Object.keys(s.byRole).length}</div>
          <div className="stat-l">Audience groups</div>
        </div>
      </div>

      <div className="card">
        <h3>What the assistant is working from</h3>
        <p className="sub">
          The assistant only answers from the documents listed under Knowledge base. If an answer is
          wrong, the document is what needs correcting, not the assistant.
        </p>
        <button className="btn" onClick={onRefresh}>
          Refresh figures
        </button>
      </div>
    </>
  );
}

function KnowledgeBase({ data }) {
  if (!data.documents.length) {
    return (
      <div className="card">
        <div className="empty">
          <strong>No documents yet</strong>
          Run the ACP - KB Ingestion workflow in n8n to load the school documents. They will appear
          here once it finishes.
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Documents the assistant reads</h3>
      <p className="sub">
        Each document is split into passages so the assistant can find the exact part that answers a
        question. To update information, edit the document and re-run the ingestion workflow.
      </p>
      <table>
        <thead>
          <tr>
            <th>Document</th>
            <th>Passages</th>
          </tr>
        </thead>
        <tbody>
          {data.documents.map((d) => (
            <tr key={d.name}>
              <td className="mono">{d.name}</td>
              <td>
                <span className="pill">{d.chunkCount}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Contacts({ data }) {
  if (!data.contacts.length) {
    return (
      <div className="card">
        <div className="empty">
          <strong>No contacts yet</strong>
          When someone gives the assistant their email during a conversation, they appear here and
          can be included in announcements.
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3>Captured contacts</h3>
      <p className="sub">
        Collected by the assistant during conversations, for follow up and announcements.
      </p>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Role</th>
            <th>Channel</th>
            <th>Added</th>
          </tr>
        </thead>
        <tbody>
          {data.contacts.map((c) => (
            <tr key={c.id}>
              <td className="mono">{c.email}</td>
              <td>{c.name || "\u2014"}</td>
              <td>
                <span className="pill">{c.role || "unspecified"}</span>
              </td>
              <td>{c.source || "\u2014"}</td>
              <td className="mono">
                {c.created_at ? new Date(c.created_at).toLocaleDateString() : "\u2014"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Announcements({ data }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  const [state, setState] = useState({ kind: "", text: "" });
  const [sending, setSending] = useState(false);

  const byRole = data?.stats?.byRole || {};
  const total = data?.stats?.contacts || 0;
  const recipients = targetRole === "all" ? total : byRole[targetRole] || 0;

  async function sendIt() {
    setSending(true);
    setState({ kind: "", text: "" });
    try {
      const res = await fetch("/api/admin/announce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, targetRole }),
      });
      const out = await res.json();
      if (!res.ok) {
        setState({ kind: "bad", text: out.error || "The announcement was not sent." });
      } else {
        setState({
          kind: "good",
          text: "Announcement sent to " + recipients + " contact(s).",
        });
        setSubject("");
        setMessage("");
      }
    } catch (e) {
      setState({ kind: "bad", text: "Could not reach the server." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="card">
      <h3>Send an announcement</h3>
      <p className="sub">
        Goes by email to every contact in the audience you choose. Sending is handled by the
        broadcast workflow in n8n.
      </p>

      {state.text && <div className={"notice " + state.kind}>{state.text}</div>}

      <div className="row-2">
        <label className="field">
          <span>Subject</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Project defense schedule"
          />
        </label>
        <label className="field">
          <span>Audience &middot; {recipients} recipient(s)</span>
          <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
            <option value="all">Everyone</option>
            <option value="student">Students</option>
            <option value="parent">Parents</option>
            <option value="prospective">Prospective applicants</option>
          </select>
        </label>
      </div>

      <label className="field">
        <span>Message</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write the announcement as you want it to arrive in the inbox."
        />
      </label>

      <button
        className="btn"
        onClick={sendIt}
        disabled={sending || !subject.trim() || !message.trim()}
      >
        {sending ? "Sending..." : "Send announcement"}
      </button>
    </div>
  );
}
