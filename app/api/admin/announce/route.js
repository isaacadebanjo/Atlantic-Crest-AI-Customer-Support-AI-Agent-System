import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

function signedIn() {
  return cookies().get("acp_admin")?.value === "1";
}

export async function POST(request) {
  if (!signedIn()) {
    return Response.json({ error: "Sign in to send announcements." }, { status: 401 });
  }

  const url = process.env.N8N_BROADCAST_WEBHOOK_URL;

  if (!url) {
    return Response.json(
      {
        error:
          "No broadcast webhook is configured. In n8n, replace the Manual Trigger on ACP - Announcement Broadcast with a Webhook Trigger, then put its Production URL in N8N_BROADCAST_WEBHOOK_URL.",
      },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return Response.json({ error: "Fill in the announcement first." }, { status: 400 });
  }

  const subject = (body.subject || "").trim();
  const announcementText = (body.message || "").trim();
  const targetRole = body.targetRole || "all";

  if (!subject || !announcementText) {
    return Response.json({ error: "A subject and a message are both required." }, { status: 400 });
  }

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, announcementText, targetRole }),
      cache: "no-store",
    });

    if (!upstream.ok) {
      return Response.json(
        { error: "The broadcast workflow returned an error. Check its execution log in n8n." },
        { status: 502 }
      );
    }

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: "Could not reach the broadcast workflow." }, { status: 502 });
  }
}
