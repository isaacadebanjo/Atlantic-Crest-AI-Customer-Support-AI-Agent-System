export const dynamic = "force-dynamic";

export async function POST(request) {
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return Response.json(
      { error: "ADMIN_PASSWORD is not set. Add it to .env.local and restart the server." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return Response.json({ error: "Enter your password." }, { status: 400 });
  }

  if ((body.password || "") !== expected) {
    return Response.json({ error: "That password is not correct." }, { status: 401 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": "acp_admin=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800",
    },
  });
}

export async function DELETE() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": "acp_admin=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
    },
  });
}
