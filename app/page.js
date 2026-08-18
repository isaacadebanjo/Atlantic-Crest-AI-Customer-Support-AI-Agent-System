"use client";

import { useState } from "react";
import Crest from "../components/Crest";
import ChatWidget from "../components/ChatWidget";

const PROMPTS = [
  { tag: "Fees", text: "What are the ND fees for this session?" },
  { tag: "Admission", text: "What are the requirements to get into the ND programme?" },
  { tag: "Resumption", text: "When does second semester resume?" },
  { tag: "Policies", text: "What is the minimum attendance required to sit exams?" },
];

const FACTS = [
  { k: "7", v: "Departments" },
  { k: "ND & HND", v: "Programmes offered" },
  { k: "75%", v: "Attendance to sit exams" },
  { k: "24 / 7", v: "Support assistant" },
];

export default function Home() {
  const [pending, setPending] = useState("");

  return (
    <>
      <header className="masthead">
        <div className="masthead-inner">
          <div className="brand">
            <Crest size={38} tone="#e8d5ab" />
            <div>
              <div className="brand-name">Atlantic Crest Polytechnic</div>
              <div className="brand-sub">Knowledge &middot; Skill &middot; Service</div>
            </div>
          </div>
          <nav className="nav">
            <a href="#ask">Admissions</a>
            <a href="#ask">Fees</a>
            <a href="#ask">Academic calendar</a>
            <a href="/admin">Staff login</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="wrap">
          <div className="eyebrow">Student &amp; Applicant Support</div>
          <h1>
            Every question about this school, <em>answered the same way</em>, at any hour.
          </h1>
          <p>
            Fees, admission requirements, resumption dates and school policies. Ask in your own
            words and get the same answer the Admissions and Student Affairs offices would give
            you, without joining a queue or waiting for Monday morning.
          </p>
        </div>
      </section>

      <section className="ask" id="ask">
        <div className="wrap">
          <div className="section-head">
            <h2>Start with a common question</h2>
            <p>Or open the assistant and ask anything in your own words.</p>
          </div>
          <div className="prompt-grid">
            {PROMPTS.map((p) => (
              <button key={p.text} className="prompt" onClick={() => setPending(p.text)}>
                <span className="prompt-tag">{p.tag}</span>
                <span className="prompt-text">{p.text}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="facts">
        <div className="wrap">
          <div className="facts-grid">
            {FACTS.map((f) => (
              <div key={f.v}>
                <div className="fact-k">{f.k}</div>
                <div className="fact-v">{f.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="rule" />

      <footer className="wrap">
        <div className="foot">
          <span>Atlantic Crest Polytechnic &middot; Admissions Office, admissions@acp.edu.ng</span>
          <span>
            Also available on Telegram &middot; <a href="/admin">Staff login</a>
          </span>
        </div>
      </footer>

      <ChatWidget pending={pending} onConsumed={() => setPending("")} />
    </>
  );
}
