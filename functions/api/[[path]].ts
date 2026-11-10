export interface Env {
  DB: D1Database;
  ENVIRONMENT: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const path = url.pathname;
  const method = context.request.method;
  const db = context.env.DB;

  const jsonHeaders = {
    "Content-Type": "application/json;charset=UTF-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (method === "OPTIONS") {
    return new Response(null, { headers: jsonHeaders });
  }

  try {
    // 1. Pobranie użytkowników, ich nazw drużyn oraz punktów
    if (path === "/api/users" && method === "GET") {
      const { results } = await db.prepare("SELECT id, username, role, team_name, points FROM users").all();
      return new Response(JSON.stringify({ users: results }), { headers: jsonHeaders });
    }

    // 2. Aktualizacja nazwy drużyny
    if (path === "/api/user/update-team" && method === "POST") {
      const body: any = await context.request.json();
      await db.prepare("UPDATE users SET team_name = ? WHERE id = ?").bind(body.teamName, body.userId).run();
      return new Response(JSON.stringify({ success: true }), { headers: jsonHeaders });
    }

    // 3. Admin: Korekta punktów lub zapis punktacji
    if (path === "/api/admin/update-points" && method === "POST") {
      const body: any = await context.request.json();
      if (!body.userId || typeof body.points !== 'number') {
        return new Response(JSON.stringify({ error: 'Nieprawidłowe dane' }), { status: 400, headers: jsonHeaders });
      }
      await db.prepare("UPDATE users SET points = ? WHERE id = ?").bind(body.points, body.userId).run();
      return new Response(JSON.stringify({ success: true }), { headers: jsonHeaders });
    }

    // 4. Admin: Zmiana loginu/hasła
    if (path === "/api/admin/update-credentials" && method === "POST") {
      const body: any = await context.request.json();
      await db.prepare("UPDATE users SET username = ?, password_hash = ? WHERE id = ?")
        .bind(body.newUsername, body.newPassword, body.userId)
        .run();
      return new Response(JSON.stringify({ success: true }), { headers: jsonHeaders });
    }

    return context.next();
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Błąd bazy: ' + err.message }), { status: 500, headers: jsonHeaders });
  }
};
