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
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (method === "OPTIONS") {
    return new Response(null, { headers: jsonHeaders });
  }

  try {
    // 1. Pobranie wszystkich użytkowników i ich drużyn z bazy D1
    if (path === "/api/users" && method === "GET") {
      const { results } = await db.prepare("SELECT id, username, role, team_name FROM users").all();
      return new Response(JSON.stringify({ users: results }), { headers: jsonHeaders });
    }

    // 2. Aktualizacja nazwy drużyny gracza
    if (path === "/api/user/update-team" && method === "POST") {
      const body: any = await context.request.json();
      if (!body.userId || !body.teamName) {
        return new Response(JSON.stringify({ error: 'Brak wymaganych danych' }), { status: 400, headers: jsonHeaders });
      }
      await db.prepare("UPDATE users SET team_name = ? WHERE id = ?").bind(body.teamName, body.userId).run();
      return new Response(JSON.stringify({ success: true }), { headers: jsonHeaders });
    }

    // 3. Admin: Edycja loginu i hasła użytkownika
    if (path === "/api/admin/update-credentials" && method === "POST") {
      const body: any = await context.request.json();
      if (!body.userId || !body.newUsername || !body.newPassword) {
        return new Response(JSON.stringify({ error: 'Wypełnij wszystkie pola credentials.' }), { status: 400, headers: jsonHeaders });
      }
      await db.prepare("UPDATE users SET username = ?, password_hash = ? WHERE id = ?")
        .bind(body.newUsername, body.newPassword, body.userId)
        .run();
      return new Response(JSON.stringify({ success: true, message: 'Dane logowania zostały zaktualizowane w bazie D1!' }), { headers: jsonHeaders });
    }

    return context.next();
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Błąd bazy danych: ' + (err.message || err) }), { status: 500, headers: jsonHeaders });
  }
};
