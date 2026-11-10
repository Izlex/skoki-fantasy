import React, { useState, useEffect } from 'react';
import { Trophy, Users, Shield, FileText, Settings, Award, LogOut, CheckCircle, AlertTriangle } from 'lucide-react';

export default function App() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Stany dla kreatora konfiguracji
  const [adminUser, setAdminUser] = useState('admin');
  const [adminPass, setAdminPass] = useState('');
  const [adminTeam, setAdminTeam] = useState('Drużyna Administratora');

  const [users, setUsers] = useState([
    { username: 'gracz1', password: '', teamName: 'Orły ' },
    { username: 'gracz2', password: '', teamName: 'Skrzydlate Lwy' },
    { username: 'gracz3', password: '', teamName: 'Śnieżne Pantery' }
  ]);

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    try {
      const res = await fetch('/api/setup-status');
      const data = await res.json();
      setConfigured(data.configured);
    } catch (e) {
      // Jeśli Worker dopiero wstaje, ustawiamy domyślnie nieskonfigurowany
      setConfigured(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin: { username: adminUser, passwordHash: adminPass, teamName: adminTeam },
          users: users.map(u => ({ username: u.username, passwordHash: u.password, teamName: u.teamName }))
        })
      });

      const data = await res.json();
      if (res.ok) {
        setConfigured(true);
      } else {
        setErrorMsg(data.error || 'Wystąpił błąd podczas konfiguracji.');
      }
    } catch (err: any) {
      setErrorMsg('Błąd połączenia z serwerem: ' + err.message);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Ładowanie aplikacji Skoki Fantasy...</div>;
  }

  // Jeśli aplikacja nie jest skonfigurowana, pokazujemy prawdziwy kreator
  if (!configured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-slate-800/90 backdrop-blur border border-blue-500/30 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold mb-2 text-blue-400 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" /> Kreator Konfiguracji Skoki Fantasy
          </h1>
          <p className="text-slate-300 mb-6 text-sm">
            Skonfiguruj konto Administratora oraz dokładnie 3 uczestników ligi. Po zatwierdzeniu kreator zostanie trwale zablokowany.
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleSetupSubmit} className="space-y-6">
            <div className="p-4 bg-blue-950/40 border border-blue-500/20 rounded-xl space-y-4">
              <h3 className="font-semibold text-blue-300 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" /> Konto Administratora
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Login Admina</label>
                  <input 
                    type="text" 
                    value={adminUser} 
                    onChange={e => setAdminUser(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Hasło</label>
                  <input 
                    type="password" 
                    value={adminPass} 
                    onChange={e => setAdminPass(e.target.value)}
                    placeholder="Wpisz hasło"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Nazwa Drużyny</label>
                  <input 
                    type="text" 
                    value={adminTeam} 
                    onChange={e => setAdminTeam(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900/40 border border-slate-700/55 rounded-xl space-y-4">
              <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" /> Konta 3 Uczestników Ligi
              </h3>
              
              {users.map((u, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-800 first:border-0 first:pt-0">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Login Uczestnika {index + 1}</label>
                    <input 
                      type="text" 
                      value={u.username} 
                      onChange={e => {
                        const newUsers = [...users];
                        newUsers[index].username = e.target.value;
                        setUsers(newUsers);
                      }}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Hasło</label>
                    <input 
                      type="password" 
                      value={u.password} 
                      onChange={e => {
                        const newUsers = [...users];
                        newUsers[index].password = e.target.value;
                        setUsers(newUsers);
                      }}
                      placeholder="Hasło"
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Nazwa Drużyny</label>
                    <input 
                      type="text" 
                      value={u.teamName} 
                      onChange={e => {
                        const newUsers = [...users];
                        newUsers[index].teamName = e.target.value;
                        setUsers(newUsers);
                      }}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" /> Zapisz Konfigurację i Uruchom Ligę
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-blue-400 flex items-center gap-3">
            <Trophy className="w-7 h-7 text-yellow-400" /> Skoki Fantasy - Panel Główny
          </h1>
          <span className="px-3 py-1 bg-green-900/40 border border-green-500/30 text-green-300 text-xs rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> System Aktywny i Skonfigurowany
          </span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <p className="text-slate-300">Baza danych i konfiguracja wstępna działają prawidłowo. Możesz teraz w pełni zarządzać ligą!</p>
        </div>
      </div>
    </div>
  );
}
