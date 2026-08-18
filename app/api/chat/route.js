export const dynamic = "force-dynamic";

/**
 * The browser never calls n8n directly. It posts here, and this route
 * forwards the message to the n8n webhook server side. That keeps the
 * webhook URL out of the page source and avoids browser CORS errors.
 */
export async function POST(request) {
  const url = process.env.N8N_WEBHOOK_URL;

  if (!url) {
    return Response.json(
      { error: "N8N_WEBHOOK_URL is not set. Add it to .env.local and restart the server." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return Response.json({ error: "Send a JSON body with a message field." }, { status: 400 });
  }

  const message = (body.message || "").toString().trim();
  const sessionId = (body.sessionId || "web-visitor").toString();

  if (!message) {
    return Response.json({ error: "Type a question first." }, { status: 400 });
  }

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId }),
      cache: "no-store",
    });

    const raw = await upstream.text();

    if (!upstream.ok) {
      return Response.json(
        {
          error:
            "The assistant workflow returned an error. Check that the ACP - Customer Support Agent workflow is active in n8n.",
        },
        { status: 502 }
      );
    }

    // n8n returns { reply: "..." } from the Respond to Webhook node.
    // Fall back gracefully if the shape differs.
    let reply = "";
    try {
      const parsed = JSON.parse(raw);
      reply = parsed.reply || parsed.output || parsed.text || "";
    } catch (e) {
      reply = raw;
    }

    if (!reply) {
      reply =
        "I could not find an answer for that. Please contact the Admissions Office at admissions@acp.edu.ng.";
    }

    return Response.json({ reply });
  } catch (err) {
    return Response.json(
      { error: "Could not reach the assistant workflow. Check the webhook URL and try again." },
      { status: 502 }
    );
  }
}
