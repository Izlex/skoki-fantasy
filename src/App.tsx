import React, { useState, useEffect } from 'react';
import { Trophy, Users, Shield, FileText, Award, CheckCircle, Trash2, Search, UserCheck, Edit3, ChevronDown, ChevronUp, Star, LogIn, LogOut, Sliders, Key, RotateCcw, Send } from 'lucide-react';

// PEŁNA LISTA SKOCZKÓW Z OFICJALNYCH KADR (ZGODNA Z GRAFIKĄ)
const INITIAL_JUMPERS = [
  // Austria
  "Clemens Aigner", "Stephan Embacher", "Lukas Haagen", "Jan Hoerl", "Stefan Kraft", 
  "Maximilian Ortner", "Jonas Schuster", "Julian Smid", "Simon Steinberger", "Daniel Tschofenig",
  // Bułgaria
  "Wladimir Zografski",
  // Czechy
  "Roman Koudelka",
  // Estonia
  "Artti Aigro", "Kaimar Vagul",
  // Finlandia
  "Antti Aalto", "Niko Kytosaho", "Jarkko Maatta", "Eetu Nousiainen", "Vilho Palosaari", "Kasperi Valto",
  // Francja
  "Jules Chervet", "Valentin Foubert", "Enzo Milesi",
  // Japonia
  "Ryoyu Kobayashi", "Tomofumi Naito", "Naoki Nakamura", "Ren Nikaido", "Yuto Nakamura", "Yukiya Sato",
  // Kazachstan
  "Ilia Mizernykh", "Danil Wasiliew",
  // Niemcy
  "Ben Bayer", "Karl Geiger", "Felix Hoffmann", "Pius Paschke", "Philipp Raimund", 
  "Luca Roth", "Constantin Schmid", "Max Unglaube", "Andreas Wellinger",
  // Norwegia
  "Johann Andre Forfang", "Halvor Egner Granerud", "Bendik Jakobsen Heggli", "Isak Andreas Langmo", 
  "Marius Lindvik", "Benjamin Oestvold", "Robin Pedersen", "Kristoffer Eriksen Sundal",
  // Polska
  "Klemens Joniak", "Maciej Kot", "Dawid Kubacki", "Kacper Tomasiak", "Paweł Wąsek", 
  "Jakub Wolny", "Aleksander Zniszczoł", "Piotr Żyła",
  // Słowacja
  "Hektor Kapustik",
  // Słowenia
  "Enej Faletic", "Ziga Jancar", "Ziga Jelar", "Lovro Kos", "Anze Lanisek", "Rok Oblak", "Domen Prevc", "Timi Zajc",
  // Szwajcaria
  "Simon Ammann", "Gregor Deschwanden", "Sandro Hauswirth", "Remo Imhof", "Juri Kesseli", "Killian Peier", "Felix Trunz",
  // Turcja
  "Fatih Arda Ipcioglu",
  // Ukraina
  "Witalij Kaliniczenko", "Jewhen Marusiak",
  // USA
  "Kevin Bickner", "Jason Colby", "Tate Frantz", "Henry Loher",
  // Włochy
  "Giovanni Bresadola", "Francisco Cecon", "Alex Insam"
];

const FIS_POINTS_MAP: Record<number, number> = {
  1: 100, 2: 80, 3: 60, 4: 50, 5: 45, 6: 40, 7: 36, 8: 32, 9: 29, 10: 26,
  11: 24, 12: 22, 13: 20, 14: 18, 15: 16, 16: 15, 17: 14, 18: 13, 19: 12, 20: 11,
  21: 10, 22: 9, 23: 8, 24: 7, 25: 6, 26: 5, 27: 4, 28: 3, 29: 2, 30: 1
};

interface UserAccount {
  id: string;
  username: string;
  role: 'admin' | 'user';
  teamName: string;
  mainJumpers: string[];
  reserveJumper: string | null;
  points: number;
  jumperPoints: Record<string, number>;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [loginInput, setLoginInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'team' | 'settings' | 'contests' | 'admin'>('dashboard');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const [usersDb, setUsersDb] = useState<UserAccount[]>([
    { id: 'u-admin', username: 'Sylwek', role: 'admin', teamName: 'Lotniki', mainJumpers: ['Stefan Kraft', 'Andreas Wellinger', 'Aleksander Zniszczoł', 'Dawid Kubacki', 'Kamil Stoch'], reserveJumper: 'Piotr Żyła', points: 0, jumperPoints: {} },
    { id: 'u-user-1', username: 'Klaudia', role: 'user', teamName: 'Słodziaki', mainJumpers: ['Ryoyu Kobayashi', 'Jan Hoerl', 'Marius Lindvik', 'Peter Prevc', 'Johann Andre Forfang'], reserveJumper: 'Manuel Fettner', points: 0, jumperPoints: {} },
    { id: 'u-user-2', username: 'Artur', role: 'user', teamName: 'Śnieżne Pantery', mainJumpers: ['Pius Paschke', 'Karl Geiger', 'Gregor Deschwanden', 'Halvor Egner Granerud', 'Paweł Wąsek'], reserveJumper: 'Lovro Kos', points: 0, jumperPoints: {} },
    { id: 'u-user-3', username: 'Filip', role: 'user', teamName: 'Skrzydlate Lwy', mainJumpers: ['Domen Prevc', 'Anze Lanisek', 'Michael Hayboeck', 'Timi Zajc', 'Maciej Kot'], reserveJumper: 'Kacper Tomasiak', points: 0, jumperPoints: {} }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  
  const [adminSelectedTeamId, setAdminSelectedTeamId] = useState<string>('');
  const [teamManualPositions, setTeamManualPositions] = useState<Record<string, string>>({});
  const [importStatus, setImportStatus] = useState('');

  const [selectedUserToEdit, setSelectedUserToEdit] = useState<string>('u-user-1');
  const [manualPointsAdd, setManualPointsAdd] = useState<string>('0');
  
  const [editUserTarget, setEditUserTarget] = useState<string>('u-user-1');
  const [newUsernameInput, setNewUsernameInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');

  useEffect(() => {
    if (usersDb.length > 0 && !adminSelectedTeamId) {
      setAdminSelectedTeamId(usersDb[0].id);
    }
  }, [usersDb]);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (data.users && data.users.length > 0) {
          const mapped = data.users.map((d: any) => {
            let parsedMain = [];
            let parsedJp = {};
            try {
              parsedMain = typeof d.main_jumpers === 'string' ? JSON.parse(d.main_jumpers) : (d.main_jumpers || []);
            } catch (e) { parsedMain = []; }

            try {
              parsedJp = typeof d.jumper_points === 'string' ? JSON.parse(d.jumper_points) : (d.jumper_points || {});
            } catch (e) { parsedJp = {}; }

            return {
              id: d.id,
              username: d.username,
              role: d.role,
              teamName: d.team_name || 'Moja Drużyna',
              points: d.points || 0,
              mainJumpers: parsedMain,
              reserveJumper: d.reserve_jumper || null,
              jumperPoints: parsedJp
            };
          });
          setUsersDb(mapped);
          if (mapped.length > 0 && !adminSelectedTeamId) {
            setAdminSelectedTeamId(mapped[0].id);
          }
          
          setCurrentUser(prev => {
            if (!prev) return null;
            const updatedFound = mapped.find((m: UserAccount) => m.id === prev.id);
            return updatedFound || prev;
          });
        }
      })
      .catch(() => console.log('Tryb offline'));
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const found = usersDb.find(u => u.username.toLowerCase() === loginInput.trim().toLowerCase());
    if (found) {
      setCurrentUser(found);
    } else {
      setLoginError('Nieprawidłowy login. Dostępne: Sylwek, Klaudia, Artur, Filip');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginInput('');
    setPassInput('');
  };

  const handleSaveMyTeamName = async (newName: string) => {
    if (!currentUser) return;
    const updated = usersDb.map(u => u.id === currentUser.id ? { ...u, teamName: newName } : u);
    setUsersDb(updated);
    setCurrentUser({ ...currentUser, teamName: newName });

    try {
      await fetch('/api/user/update-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, teamName: newName })
      });
      alert("Nazwa drużyny zapisana w bazie D1!");
    } catch (err) {
      alert("Zapisano lokalnie.");
    }
  };

  const handleAdminUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsernameInput || !newPasswordInput) return alert("Wprowadź nowy login i hasło!");

    try {
      const res = await fetch('/api/admin/update-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editUserTarget,
          newUsername: newUsernameInput,
          newPassword: newPasswordInput
        })
      });
      if (res.ok) {
        alert(`Zaktualizowano dane logowania! Nowy login: ${newUsernameInput}`);
        setNewUsernameInput('');
        setNewPasswordInput('');
        window.location.reload();
      } else {
        alert("Błąd zapisu w bazie.");
      }
    } catch (err) {
      alert("Błąd połączenia z bazą D1.");
    }
  };

  const syncRosterToDb = async (updatedUser: UserAccount) => {
    try {
      await fetch('/api/user/update-roster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: updatedUser.id,
          mainJumpers: updatedUser.mainJumpers,
          reserveJumper: updatedUser.reserveJumper,
          jumperPoints: updatedUser.jumperPoints
        })
      });
    } catch (err) {
      console.log('Błąd zapisu składu');
    }
  };

  const handleAddJumper = (name: string, isReserve: boolean) => {
    if (!currentUser) return;

    for (const u of usersDb) {
      if (u.mainJumpers.includes(name) || u.reserveJumper === name) {
        if (u.id === currentUser.id) {
          return alert(`Ten skoczek jest już w Twoim składzie (${u.mainJumpers.includes(name) ? 'skład główny' : 'rezerwa'})!`);
        } else {
          return alert(`Ten skoczek został już wybrany przez drużynę "${u.teamName}" (${u.username})! W tej lidze skoczkowie nie mogą się dublować.`);
        }
      }
    }

    let updatedUser;
    if (isReserve) {
      if (currentUser.reserveJumper) return alert("Masz już rezerwowego!");
      updatedUser = { ...currentUser, reserveJumper: name };
    } else {
      if (currentUser.mainJumpers.length >= 5) return alert("Maksymalnie 5 skoczków w składzie głównym!");
      updatedUser = { ...currentUser, mainJumpers: [...currentUser.mainJumpers, name] };
    }

    setCurrentUser(updatedUser);
    setUsersDb(usersDb.map(u => u.id === currentUser.id ? updatedUser : u));
    syncRosterToDb(updatedUser);
  };

  const handleRemoveJumper = (name: string, isReserve: boolean) => {
    if (!currentUser) return;
    let updatedUser;
    if (isReserve) {
      updatedUser = { ...currentUser, reserveJumper: null };
    } else {
      updatedUser = { ...currentUser, mainJumpers: currentUser.mainJumpers.filter(j => j !== name) };
    }
    setCurrentUser(updatedUser);
    setUsersDb(usersDb.map(u => u.id === currentUser.id ? updatedUser : u));
    syncRosterToDb(updatedUser);
  };

  const handleApplyTeamManualContest = async () => {
    const targetUser = usersDb.find(u => u.id === adminSelectedTeamId);
    if (!targetUser) return alert("Wybierz drużynę!");

    let teamTotalPoints = 0;
    const newJp = { ...targetUser.jumperPoints };

    targetUser.mainJumpers.forEach(jName => {
      const posStr = teamManualPositions[jName];
      if (posStr !== undefined && posStr !== '') {
        const pos = parseInt(posStr, 10);
        if (!isNaN(pos) && pos > 0) {
          const earnedPts = FIS_POINTS_MAP[pos] || 0;
          newJp[jName] = (newJp[jName] || 0) + earnedPts;
        }
      }
      teamTotalPoints += (newJp[jName] || 0);
    });

    if (targetUser.reserveJumper) {
      const posStr = teamManualPositions[targetUser.reserveJumper];
      if (posStr !== undefined && posStr !== '') {
        const pos = parseInt(posStr, 10);
        if (!isNaN(pos) && pos > 0) {
          const earnedPts = FIS_POINTS_MAP[pos] || 0;
          newJp[targetUser.reserveJumper] = (newJp[targetUser.reserveJumper] || 0) + earnedPts;
        }
      }
    }

    const updatedUsers = usersDb.map(u => u.id === targetUser.id ? { ...u, points: teamTotalPoints, jumperPoints: newJp } : u);
    setUsersDb(updatedUsers);
    if (currentUser && currentUser.id === targetUser.id) {
      setCurrentUser(updatedUsers.find(u => u.id === currentUser.id) || currentUser);
    }

    try {
      await fetch('/api/admin/update-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetUser.id, points: teamTotalPoints, jumperPoints: newJp })
      });
      setImportStatus(`Sukces! Zaktualizowano punkty dla drużyny: ${targetUser.teamName}`);
      setTeamManualPositions({});
    } catch (err) {
      alert("Błąd zapisu punktów w bazie.");
    }
  };

  const handleManualPointsCorrection = async (userId: string, delta: number) => {
    const target = usersDb.find(u => u.id === userId);
    if (!target) return;
    const newPts = target.points + delta;

    const updated = usersDb.map(u => u.id === userId ? { ...u, points: newPts } : u);
    setUsersDb(updated);
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(updated.find(u => u.id === userId) || currentUser);
    }

    try {
      await fetch('/api/admin/update-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, points: newPts, jumperPoints: target.jumperPoints })
      });
      alert(`Zaktualizowano punkty w bazie do wartości: ${newPts}`);
    } catch (err) {
      alert("Błąd zapisu punktów.");
    }
  };

  const handleResetLeague = async () => {
    if (!window.confirm("Czy na pewno chcesz zresetować ligę? Wyczyszczone zostaną punkty i składy przed draftem!")) return;

    const resetUsers = usersDb.map(u => ({
      ...u,
      points: 0,
      mainJumpers: [],
      reserveJumper: null,
      jumperPoints: {}
    }));

    setUsersDb(resetUsers);
    if (currentUser) {
      setCurrentUser(resetUsers.find(u => u.id === currentUser.id) || null);
    }

    for (const u of resetUsers) {
      await fetch('/api/admin/update-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: u.id, points: 0, jumperPoints: {} })
      }).catch(() => {});
      await fetch('/api/user/update-roster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: u.id, mainJumpers: [], reserveJumper: null, jumperPoints: {} })
      }).catch(() => {});
    }

    alert("Dane ligi zostały pomyślnie zresetowane!");
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 backdrop-blur">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto text-blue-400">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <h1 className="text-xl font-bold">Skoki Fantasy PŚ</h1>
            <p className="text-xs text-slate-400">Panel Logowania Ligi</p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-xs">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Login (Sylwek, Klaudia, Artur, Filip)</label>
              <input 
                type="text" 
                value={loginInput}
                onChange={e => setLoginInput(e.target.value)}
                required
                placeholder="Wpisz login..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Hasło</label>
              <input 
                type="password" 
                value={passInput}
                onChange={e => setPassInput(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 font-bold text-xs rounded-xl transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Zaloguj do Ligi
            </button>
          </form>
        </div>
      </div>
    );
  }

  const sortedUsers = [...usersDb].sort((a, b) => b.points - a.points);
  const filteredJumpers = INITIAL_JUMPERS.filter(j => j.toLowerCase().includes(searchTerm.toLowerCase()));

  const selectedAdminTeam = usersDb.find(u => u.id === adminSelectedTeamId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
              Skoki Fantasy PŚ
            </h1>
            <p className="text-xs text-slate-400">Drużyna: <strong>{currentUser.teamName}</strong></p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-green-400" /> {currentUser.username} ({currentUser.role === 'admin' ? 'Admin' : 'Gracz'})
          </span>
          <button 
            onClick={handleLogout}
            className="p-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 rounded-lg text-red-300 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <nav className="bg-slate-900/40 border-b border-slate-800/80 px-6 flex gap-2 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'dashboard' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Trophy className="w-4 h-4" /> Klasyfikacja Generalna ({sortedUsers.length} Graczy)
        </button>
        <button 
          onClick={() => setActiveTab('team')}
          className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'team' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Users className="w-4 h-4" /> Moja Drużyna ({currentUser.mainJumpers.length}/5)
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'settings' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Edit3 className="w-4 h-4" /> Ustawienia Drużyny
        </button>
        <button 
          onClick={() => setActiveTab('contests')}
          className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'contests' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <FileText className="w-4 h-4" /> Klasyfikacja Fantasy
        </button>
        {currentUser.role === 'admin' && (
          <button 
            onClick={() => setActiveTab('admin')}
            className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'admin' ? 'border-yellow-500 text-yellow-400 bg-yellow-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <Shield className="w-4 h-4" /> Panel Sterowania Admina
          </button>
        )}
      </nav>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
        
        {activeTab === 'dashboard' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" /> Tabela Ligi
            </h2>
            
            <div className="space-y-3">
              {sortedUsers.map((user, index) => {
                const isExpanded = expandedUser === user.id;

                return (
                  <div key={user.id} className="border border-slate-800 bg-slate-950/70 rounded-xl overflow-hidden transition">
                    <div 
                      onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-900/50 transition"
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-7 h-7 flex items-center justify-center font-bold text-xs rounded-lg ${index === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' : index === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-400/40' : index === 2 ? 'bg-amber-700/20 text-amber-500 border border-amber-600/40' : 'bg-slate-800 text-slate-400'}`}>
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="font-bold text-sm text-white">{user.teamName}</h3>
                          <p className="text-xs text-slate-500">Gracz: {user.username}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-base font-extrabold text-blue-400">{user.points} pkt</span>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 bg-slate-900/30 border-t border-slate-800/80 space-y-3">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase">Skład i punkty zawodników w PŚ:</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {user.mainJumpers.map((jumperName, jIdx) => (
                            <div key={jIdx} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                              <span className="text-slate-300">{jIdx + 1}. {jumperName}</span>
                              <span className="font-bold text-green-400">{user.jumperPoints[jumperName] || 0} pkt</span>
                            </div>
                          ))}
                          {user.reserveJumper && (
                            <div className="p-2.5 bg-yellow-950/20 border border-yellow-500/30 rounded-lg flex items-center justify-between text-xs">
                              <span className="text-yellow-200 flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {user.reserveJumper} (Rezerwa)
                              </span>
                              <span className="font-bold text-yellow-400">{user.jumperPoints[user.reserveJumper] || 0} pkt</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-xl">
            <h2 className="text-lg font-bold mb-2 text-slate-200 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-400" /> Zmień Nazwę Swojej Drużyny
            </h2>
            <form onSubmit={e => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem('teamNameInput') as HTMLInputElement).value;
              handleSaveMyTeamName(input);
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nazwa Drużyny</label>
                <input 
                  type="text" 
                  name="teamNameInput"
                  defaultValue={currentUser.teamName}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <button 
                type="submit"
                className="py-2.5 px-5 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-xl transition shadow-lg shadow-blue-600/20"
              >
                Zapisz Nazwę w Bazie D1
              </button>
            </form>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-900/80 border border-blue-500/30 rounded-2xl p-5 shadow-xl space-y-4">
                <h2 className="text-md font-bold text-blue-400 flex items-center gap-2">
                  <Users className="w-5 h-5" /> {currentUser.teamName}
                </h2>
                
                {currentUser.mainJumpers.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Brak wybranych skoczków.</p>
                ) : (
                  <div className="space-y-2">
                    {currentUser.mainJumpers.map((name, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                        <span className="font-medium text-slate-200">{i+1}. {name}</span>
                        <button onClick={() => handleRemoveJumper(name, false)} className="text-red-400 hover:text-red-300 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-slate-800">
                  <h3 className="text-xs font-semibold text-yellow-400 mb-2">Rezerwowy (1):</h3>
                  {currentUser.reserveJumper ? (
                    <div className="flex items-center justify-between p-2.5 bg-yellow-950/20 border border-yellow-500/30 rounded-xl text-xs">
                      <span className="font-medium text-yellow-200">⭐ {currentUser.reserveJumper}</span>
                      <button onClick={() => handleRemoveJumper(currentUser.reserveJumper!, true)} className="text-red-400 hover:text-red-300 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Brak rezerwowego.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-md font-bold text-slate-200">Wybierz Skoczków ({INITIAL_JUMPERS.length})</h2>
                  <div className="relative w-64">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Szukaj..." 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[450px] overflow-y-auto pr-2">
                  {filteredJumpers.map((jumper, idx) => {
                    const isSelectedMain = currentUser.mainJumpers.includes(jumper);
                    const isSelectedReserve = currentUser.reserveJumper === jumper;

                    let takenByTeam: string | null = null;
                    for (const u of usersDb) {
                      if (u.mainJumpers.includes(jumper) || u.reserveJumper === jumper) {
                        takenByTeam = u.teamName;
                        break;
                      }
                    }

                    return (
                      <div key={idx} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-xs font-medium text-slate-200 block">{jumper}</span>
                          {takenByTeam && (
                            <span className="text-[10px] text-red-400 italic">Zajęty: {takenByTeam}</span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button 
                            disabled={isSelectedMain || isSelectedReserve || takenByTeam !== null}
                            onClick={() => handleAddJumper(jumper, false)}
                            className="px-2 py-1 bg-blue-900/40 hover:bg-blue-600 text-blue-200 text-[10px] rounded-lg border border-blue-500/30 disabled:opacity-30"
                          >
                            + Skład
                          </button>
                          <button 
                            disabled={isSelectedMain || isSelectedReserve || takenByTeam !== null}
                            onClick={() => handleAddJumper(jumper, true)}
                            className="px-2 py-1 bg-yellow-900/40 hover:bg-yellow-600 text-yellow-200 text-[10px] rounded-lg border border-yellow-500/30 disabled:opacity-30"
                          >
                            + Rezerwa
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RANKING FANTASY */}
        {activeTab === 'contests' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" /> Ranking Użytych Skoczków
                </h2>
                <p className="text-xs text-slate-400">Wyświetla zawodników z Waszych drużyn, posortowanych od najwyższej liczby punktów.</p>
              </div>
            </div>

            {(() => {
              interface FantasyJumper {
                name: string;
                pts: number;
                ownerTeam: string;
                ownerUser: string;
                isReserve: boolean;
              }

              const jumpersList: FantasyJumper[] = [];

              usersDb.forEach(u => {
                u.mainJumpers.forEach(j => {
                  jumpersList.push({
                    name: j,
                    pts: u.jumperPoints[j] || 0,
                    ownerTeam: u.teamName,
                    ownerUser: u.username,
                    isReserve: false
                  });
                });
                if (u.reserveJumper) {
                  jumpersList.push({
                    name: u.reserveJumper,
                    pts: u.jumperPoints[u.reserveJumper] || 0,
                    ownerTeam: u.teamName,
                    ownerUser: u.username,
                    isReserve: true
                  });
                }
              });

              jumpersList.sort((a, b) => b.pts - a.pts);

              if (jumpersList.length === 0) {
                return (
                  <div className="text-center py-12 text-slate-500 text-xs italic bg-slate-950/40 rounded-xl border border-slate-800">
                    Brak wybranych skoczków w drużynach.
                  </div>
                );
              }

              return (
                <div className="space-y-2 pt-2">
                  {jumpersList.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 bg-slate-950 border rounded-xl flex items-center justify-between transition ${item.isReserve ? 'border-yellow-500/20 bg-yellow-950/10' : 'border-slate-800'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 flex items-center justify-center font-bold text-xs rounded-lg ${idx === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : idx === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-400/30' : idx === 2 ? 'bg-amber-700/20 text-amber-500 border border-amber-600/30' : 'bg-slate-900 text-slate-400'}`}>
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-slate-200">{item.name}</span>
                            {item.isReserve && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-400 flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-yellow-400" /> Rezerwa
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Drużyna: <strong className="text-slate-400">{item.ownerTeam}</strong> ({item.ownerUser})
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-extrabold text-yellow-400">{item.pts} pkt</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'admin' && currentUser.role === 'admin' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-yellow-500/30 rounded-2xl p-6 shadow-xl space-y-6">
              <h2 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                <Shield className="w-5 h-5" /> Panel Sterowania Administratora
              </h2>

              <div className="bg-slate-950 p-5 border border-slate-800 rounded-xl space-y-4">
                <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <Key className="w-4 h-4 text-yellow-400" /> Zarządzanie Kontami (Edycja Loginu i Hasła w D1)
                </h3>
                <form onSubmit={handleAdminUpdateCredentials} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Wybierz Uczestnika</label>
                    <select 
                      value={editUserTarget}
                      onChange={e => setEditUserTarget(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    >
                      {usersDb.map(u => (
                        <option key={u.id} value={u.id}>{u.username} ({u.teamName})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Nowy Login</label>
                    <input 
                      type="text" 
                      value={newUsernameInput}
                      onChange={e => setNewUsernameInput(e.target.value)}
                      placeholder="Nowy login..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Nowe Hasło</label>
                    <input 
                      type="text" 
                      value={newPasswordInput}
                      onChange={e => setNewPasswordInput(e.target.value)}
                      placeholder="Nowe hasło..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div className="sm:col-span-3 pt-2">
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold text-xs rounded-lg transition"
                    >
                      Zapisz Nowy Login i Hasło w Bazie D1
                    </button>
                  </div>
                </form>
              </div>

              {/* RĘCZNE WPROWADZANIE POZYCJI Z WYBOREM DRUŻYNY */}
              <div className="bg-slate-950 p-5 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-yellow-400 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Ręczne Wprowadzanie Pozycji dla Drużyny
                    </h3>
                    <p className="text-[11px] text-slate-400">Wybierz drużynę z listy, wpisz zajęte przez nich pozycje (1-30), a system automatycznie doliczy punkty PŚ!</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Wybierz Drużynę</label>
                    <select 
                      value={adminSelectedTeamId}
                      onChange={e => {
                        setAdminSelectedTeamId(e.target.value);
                        setTeamManualPositions({});
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                    >
                      {usersDb.map(u => (
                        <option key={u.id} value={u.id}>{u.teamName} ({u.username})</option>
                      ))}
                    </select>
                  </div>

                  {selectedAdminTeam && (
                    <div className="space-y-3 pt-2">
                      {selectedAdminTeam.mainJumpers.length === 0 && !selectedAdminTeam.reserveJumper ? (
                        <p className="text-xs text-slate-500 italic p-3 bg-slate-900 rounded-xl">Ta drużyna nie ma jeszcze wybranych skoczków w składzie.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {selectedAdminTeam.mainJumpers.map((jName, idx) => (
                            <div key={idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                              <span className="text-slate-200 truncate">{idx + 1}. {jName}</span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] text-slate-400">Miejsce:</span>
                                <input 
                                  type="number" 
                                  min="1" 
                                  max="60"
                                  placeholder="np. 5"
                                  value={teamManualPositions[jName] || ''}
                                  onChange={e => setTeamManualPositions({ ...teamManualPositions, [jName]: e.target.value })}
                                  className="w-16 bg-slate-950 border border-slate-700 rounded-lg p-1 text-center text-xs text-white focus:outline-none focus:border-yellow-500 font-bold"
                                />
                              </div>
                            </div>
                          ))}

                          {selectedAdminTeam.reserveJumper && (
                            <div className="p-2.5 bg-yellow-950/20 border border-yellow-500/30 rounded-xl flex items-center justify-between gap-3 text-xs sm:col-span-2">
                              <span className="text-yellow-200 flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> Rezerwa: {selectedAdminTeam.reserveJumper}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] text-slate-400">Miejsce:</span>
                                <input 
                                  type="number" 
                                  min="1" 
                                  max="60"
                                  placeholder="np. 12"
                                  value={teamManualPositions[selectedAdminTeam.reserveJumper] || ''}
                                  onChange={e => setTeamManualPositions({ ...teamManualPositions, [selectedAdminTeam.reserveJumper!]: e.target.value })}
                                  className="w-16 bg-slate-950 border border-slate-700 rounded-lg p-1 text-center text-xs text-white focus:outline-none focus:border-yellow-500 font-bold"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <button 
                        onClick={handleApplyTeamManualContest}
                        className="w-full py-2.5 bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-yellow-600/20 mt-2"
                      >
                        <Send className="w-4 h-4" /> Zatwierdź Punkty dla {selectedAdminTeam.teamName}
                      </button>
                    </div>
                  )}
                </div>

                {importStatus && <div className="text-xs text-green-400 font-medium">{importStatus}</div>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-3">
                  <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-400" /> Korekta Punktów Drużyny w D1
                  </h3>
                  <select 
                    value={selectedUserToEdit}
                    onChange={e => setSelectedUserToEdit(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  >
                    {usersDb.map(u => (
                      <option key={u.id} value={u.id}>{u.teamName} ({u.username}) - {u.points} pkt</option>
                    ))}
                  </select>
                  <input 
                    type="number"
                    value={manualPointsAdd}
                    onChange={e => setManualPointsAdd(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                  <button 
                    onClick={() => {
                      const val = parseInt(manualPointsAdd);
                      if (isNaN(val)) return alert("Wpisz poprawną liczbę!");
                      handleManualPointsCorrection(selectedUserToEdit, val);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 font-bold text-xs rounded-xl transition"
                  >
                    Zapisz Korektę w Bazie
                  </button>
                </div>

                <div className="bg-red-950/20 p-4 border border-red-500/30 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-xs font-semibold text-red-300">Resetowanie / Czyszczenie Ligi</h3>
                    <p className="text-[11px] text-slate-400">Usuń punkty testowe i składy przed właściwym draftem.</p>
                  </div>
                  <button 
                    onClick={handleResetLeague}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" /> Resetuj Dane
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
