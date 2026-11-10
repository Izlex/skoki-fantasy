import React, { useState, useEffect } from 'react';
import { Trophy, Users, Shield, FileText, Settings, Award, LogOut, CheckCircle, AlertTriangle } from 'lucide-react';

export default function App() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/setup-status')
      .then(res => res.json())
      .then(data => {
        setConfigured(data.configured);
        setLoading(false);
      })
      .catch(() => {
        // Fallback for local preview if worker isn't running yet
        setConfigured(false);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Ładowanie aplikacji Skoki Fantasy...</div>;
  }

  if (!configured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 flex items-center justify-center">
        <div className="max-w-xl w-full bg-slate-800/80 backdrop-blur border border-blue-500/30 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold mb-2 text-blue-400 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" /> Kreator Konfiguracji Skoki Fantasy
          </h1>
          <p className="text-slate-300 mb-6 text-sm">
            Witaj w prywatnej lidze skoków narciarskich! Skonfiguruj konto Administratora oraz 3 uczestników. Po zatwierdzeniu kreator zostanie trwale zablokowany.
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-blue-900/30 border border-blue-500/20 rounded-xl">
              <h3 className="font-semibold text-blue-300 mb-2">Instrukcja wdrożenia na Cloudflare:</h3>
              <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                <li>Wrzuć te pliki do swojego repozytorium GitHub połączonego z Cloudflare Pages / Workers.</li>
                <li>Uruchom migrację D1: <code className="bg-slate-900 px-1 py-0.5 rounded text-blue-300">npm run db:init</code></li>
                <li>Uruchom aplikację komendą <code className="bg-slate-900 px-1 py-0.5 rounded text-blue-300">npm run cf:dev</code></li>
              </ul>
            </div>
            <button 
              onClick={() => alert('Wgraj paczkę na Cloudflare Workers i uruchom migrację bazy D1 zgodnie z dokumentacją!')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl transition shadow-lg shadow-blue-600/30"
            >
              Rozpocznij Ligę Skoków Fantasy
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-bold text-blue-400 mb-4">Skoki Fantasy - Panel Główny</h1>
      <p className="text-slate-400">Aplikacja została poprawnie skonfigurowana i jest gotowa do działania na Cloudflare Workers & D1!</p>
    </div>
  );
}
