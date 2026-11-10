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
    // 1. Status konfiguracji
    if (path === "/api/setup-status" && method === "GET") {
      const { results } = await db.prepare("SELECT value FROM system_settings WHERE key = 'is_configured'").all();
      const configured = results && results.length > 0 && results[0].value === 'true';
      return new Response(JSON.stringify({ configured }), { headers: jsonHeaders });
    }

    // 2. Kreator konfiguracji
    if (path === "/api/setup" && method === "POST") {
      const check = await db.prepare("SELECT value FROM system_settings WHERE key = 'is_configured'").all();
      if (check.results && check.results.length > 0 && check.results[0].value === 'true') {
        return new Response(JSON.stringify({ error: 'Kreator konfiguracji został już zamknięty.' }), { status: 403, headers: jsonHeaders });
      }

      const body: any = await context.request.json();
      if (!body || !body.admin || !body.users) {
        return new Response(JSON.stringify({ error: 'Nieprawidłowe dane w żądaniu.' }), { status: 400, headers: jsonHeaders });
      }

      await db.prepare("INSERT INTO users (id, username, password_hash, role, team_name) VALUES (?, ?, ?, 'admin', ?)")
        .bind('u-admin', body.admin.username, body.admin.passwordHash, body.admin.teamName || 'Admin Team')
        .run();

      for (let i = 0; i < body.users.length; i++) {
        const u = body.users[i];
        await db.prepare("INSERT INTO users (id, username, password_hash, role, team_name) VALUES (?, ?, ?, 'user', ?)")
          .bind(`u-user-${i+1}`, u.username, u.passwordHash, u.teamName)
          .run();
      }

      await db.prepare("INSERT OR REPLACE INTO system_settings (key, value) VALUES ('is_configured', 'true')").run();

      return new Response(JSON.stringify({ success: true, message: 'Konfiguracja zakończona pomyślnie!' }), { headers: jsonHeaders });
    }

    // 3. Reset testowy
    if (path === "/api/test-reset" && method === "POST") {
      const body: any = await context.request.json();
      if (body.confirmText !== 'RESET TEST') {
        return new Response(JSON.stringify({ error: 'Nieprawidłowy tekst potwierdzenia.' }), { status: 400, headers: jsonHeaders });
      }

      await db.batch([
        db.prepare("DELETE FROM fantasy_team_results WHERE environment = 'TEST'"),
        db.prepare("DELETE FROM contest_results WHERE environment = 'TEST'"),
        db.prepare("DELETE FROM contest_roster_snapshots WHERE environment = 'TEST'"),
        db.prepare("DELETE FROM contests WHERE environment = 'TEST'"),
        db.prepare("DELETE FROM import_logs WHERE environment = 'TEST'"),
        db.prepare("DELETE FROM roster_change_logs WHERE environment = 'TEST'")
      ]);

      return new Response(JSON.stringify({ success: true, message: 'Środowisko TEST zostało zresetowane.' }), { headers: jsonHeaders });
    }

    return context.next();

  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Błąd serwera: ' + (err.message || err) }), { status: 500, headers: jsonHeaders });
  }
};
