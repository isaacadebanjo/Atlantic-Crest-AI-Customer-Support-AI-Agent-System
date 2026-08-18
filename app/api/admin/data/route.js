import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

function signedIn() {
  return cookies().get("acp_admin")?.value === "1";
}

async function supa(path) {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!base || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env.local.");
  }

  const res = await fetch(base.replace(/\/$/, "") + "/rest/v1/" + path, {
    headers: {
      apikey: key,
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error("Supabase request failed: " + detail.slice(0, 200));
  }

  return res.json();
}

export async function GET() {
  if (!signedIn()) {
    return Response.json({ error: "Sign in to view this." }, { status: 401 });
  }

  try {
    // Each row is one chunk of a source document. Group them so staff see
    // documents, which is what they actually think in, not raw chunks.
    const chunks = await supa("acp_knowledge_base?select=id,metadata");
    const contacts = await supa("contacts?select=*&order=created_at.desc");

    const grouped = new Map();
    for (const row of chunks) {
      const meta = row.metadata || {};
      const name = meta.source || meta.file || meta.title || "Untitled document";
      grouped.set(name, (grouped.get(name) || 0) + 1);
    }

    const documents = Array.from(grouped, ([name, chunkCount]) => ({ name, chunkCount })).sort(
      (a, b) => a.name.localeCompare(b.name)
    );

    const byRole = {};
    for (const c of contacts) {
      const r = c.role || "unspecified";
      byRole[r] = (byRole[r] || 0) + 1;
    }

    return Response.json({
      documents,
      contacts,
      stats: {
        documents: documents.length,
        chunks: chunks.length,
        contacts: contacts.length,
        byRole,
      },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
