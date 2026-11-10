import { Hono } from 'hono';

export interface Env {
  DB: D1Database;
  ENVIRONMENT: string;
}

const app = new Hono<{ Bindings: Env }>();

app.get('/api/health', (c) => {
  return c.json({ status: 'ok', message: 'Skoki Fantasy API działa poprawnie!' });
});

// Setup Check / Initialization Status
app.get('/api/setup-status', async (c) => {
  const { results } = await c.env.DB.prepare("SELECT value FROM system_settings WHERE key = 'is_configured'").all();
  const configured = results.length > 0 && results[0].value === 'true';
  return c.json({ configured });
});

// Initial Setup Wizard Endpoint
app.post('/api/setup', async (c) => {
  const { results } = await c.env.DB.prepare("SELECT value FROM system_settings WHERE key = 'is_configured'").all();
  if (results.length > 0 && results[0].value === 'true') {
    return c.json({ error: 'Kreator konfiguracji został już zamknięty.' }, 403);
  }

  const body = await c.req.json();
  // body: admin, users (array of 3), jumpers (initial seed)
  const db = c.env.DB;

  try {
    // 1. Create admin user
    await db.prepare("INSERT INTO users (id, username, password_hash, role, team_name) VALUES (?, ?, ?, 'admin', ?)")
      .bind('u-admin', body.admin.username, body.admin.passwordHash, body.admin.teamName || 'Admin Team')
      .run();

    // 2. Create 3 regular users
    for (let i = 0; i < body.users.length; i++) {
      const u = body.users[i];
      await db.prepare("INSERT INTO users (id, username, password_hash, role, team_name) VALUES (?, ?, ?, 'user', ?)")
        .bind(`u-user-${i+1}`, u.username, u.passwordHash, u.teamName)
        .run();
    }

    // 3. Mark configured
    await db.prepare("INSERT OR REPLACE INTO system_settings (key, value) VALUES ('is_configured', 'true')").run();

    return c.json({ success: true, message: 'Konfiguracja zakończona pomyślnie!' });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Test Reset Endpoint (Strictly TEST environment only)
app.post('/api/test-reset', async (c) => {
  const body = await c.req.json();
  if (body.confirmText !== 'RESET TEST') {
    return c.json({ error: 'Nieprawidłowy tekst potwierdzenia.' }, 400);
  }

  const db = c.env.DB;
  await db.batch([
    db.prepare("DELETE FROM fantasy_team_results WHERE environment = 'TEST'"),
    db.prepare("DELETE FROM contest_results WHERE environment = 'TEST'"),
    db.prepare("DELETE FROM contest_roster_snapshots WHERE environment = 'TEST'"),
    db.prepare("DELETE FROM contests WHERE environment = 'TEST'"),
    db.prepare("DELETE FROM import_logs WHERE environment = 'TEST'"),
    db.prepare("DELETE FROM roster_change_logs WHERE environment = 'TEST'")
  ]);

  return c.json({ success: true, message: 'Środowisko TEST zostało zresetowane.' });
});

export default app;
