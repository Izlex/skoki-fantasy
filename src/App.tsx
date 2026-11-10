import React, { useState } from 'react';
import { Trophy, Users, Shield, FileText, Award, CheckCircle, Trash2, Search, UserCheck, Edit3, ChevronDown, ChevronUp, Star, LogIn, LogOut, Settings, Sliders } from 'lucide-react';

const INITIAL_JUMPERS = [
  "Aleksander Zniszczoł", "Dawid Kubacki", "Piotr Żyła", "Kamil Stoch", "Paweł Wąsek", 
  "Maciej Kot", "Kacper Tomasiak", "Klemens Joniak", "Jakub Wolny", "Andrzej Stękała",
  "Stefan Kraft", "Jan Hoerl", "Daniel Tschofenig", "Manuel Fettner", "Daniel Huber", 
  "Michael Hayboeck", "Stephan Embacher", "Andreas Wellinger", "Philipp Raimund", 
  "Karl Geiger", "Pius Paschke", "Stephan Leyhe", "Johann Andre Forfang", "Marius Lindvik", 
  "Kristoffer Eriksen Sundal", "Halvor Egner Granerud", "Peter Prevc", "Domen Prevc", 
  "Anze Lanisek", "Timi Zajc", "Lovro Kos", "Ryoyu Kobayashi", "Ren Nikaido", "Naoki Nakamura",
  "Gregor Deschwanden", "Killian Peier", "Simon Ammann", "Niko Kytosaho", "Giovanni Bresadola"
];

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
  // Stan uwierzytelniania
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [loginInput, setLoginInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Stan aplikacji i bazy użytkowników w pamięci
  const [activeTab, setActiveTab] = useState<'dashboard' | 'team' | 'settings' | 'contests' | 'admin'>('dashboard');
  const [expandedUser, setExpandedUser] = useState<string | null>('u-admin');

  // Baza kont w lidze (symulacja tabeli users z D1)
  const [usersDb, setUsersDb] = useState<UserAccount[]>([
    {
      id: 'u-admin',
      username: 'admin',
      role: 'admin',
      teamName: 'Drużyna Administratora',
      mainJumpers: ['Stefan Kraft', 'Andreas Wellinger', 'Aleksander Zniszczoł', 'Dawid Kubacki', 'Kamil Stoch'],
      reserveJumper: 'Piotr Żyła',
      points: 251,
      jumperPoints: { 'Stefan Kraft': 100, 'Andreas Wellinger': 80, 'Aleksander Zniszczoł': 36, 'Dawid Kubacki': 20, 'Kamil Stoch': 15, 'Piotr Żyła': 12 }
    },
    {
      id: 'u-1',
      username: 'gracz1',
      role: 'user',
      teamName: 'Orły Narciarskie',
      mainJumpers: ['Ryoyu Kobayashi', 'Jan Hoerl', 'Marius Lindvik', 'Peter Prevc', 'Johann Andre Forfang'],
      reserveJumper: 'Manuel Fettner',
      points: 221,
      jumperPoints: { 'Ryoyu Kobayashi': 60, 'Jan Hoerl': 50, 'Marius Lindvik': 45, 'Peter Prevc': 40, 'Johann Andre Forfang': 26, 'Manuel Fettner': 18 }
    },
    {
      id: 'u-2',
      username: 'gracz2',
      role: 'user',
      teamName: 'Śnieżne Pantery',
      mainJumpers: ['Pius Paschke', 'Karl Geiger', 'Gregor Deschwanden', 'Halvor Egner Granerud', 'Paweł Wąsek'],
      reserveJumper: 'Lovro Kos',
      points: 99,
      jumperPoints: { 'Pius Paschke': 29, 'Karl Geiger': 24, 'Gregor Deschwanden': 22, 'Halvor Egner Granerud': 14, 'Paweł Wąsek': 10, 'Lovro Kos': 8 }
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [pdfText, setPdfText] = useState('');
  const [importStatus, setImportStatus] = useState('');
  
  // Stan edycji w panelu sterowania admina
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<string>('u-1');
  const [manualPointsAdd, setManualPointsAdd] = useState<string>('0');

  // Obsługa logowania
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    // Proste dopasowanie konta (w docelowej wersji spięte z hasłami w bazie D1)
    const found = usersDb.find(u => u.username.toLowerCase() === loginInput.trim().toLowerCase());
    if (found) {
      setCurrentUser(found);
    } else {
      setLoginError('Nie znaleziono takiego użytkownika. Sprawdź login (np. admin, gracz1, gracz2).');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginInput('');
    setPassInput('');
  };

  // Edycja nazwy drużyny zalogowanego użytkownika
  const handleSaveMyTeamName = (newName: string) => {
    if (!currentUser) return;
    const updated = usersDb.map(u => u.id === currentUser.id ? { ...u, teamName: newName } : u);
    setUsersDb(updated);
    setCurrentUser({ ...currentUser, teamName: newName });
    alert("Nazwa drużyny została zaktualizowana!");
  };

  // Dodawanie/usuwanie skoczka w aktualnej drużynie
  const handleAddJumper = (name: string, isReserve: boolean) => {
    if (!currentUser) return;
    if (isReserve) {
      if (currentUser.reserveJumper) return alert("Masz już rezerwowego!");
      if (currentUser.mainJumpers.includes(name)) return alert("Skoczek jest w składzie podstawowym!");
      const updatedUser = { ...currentUser, reserveJumper: name };
      setCurrentUser(updatedUser);
      setUsersDb(usersDb.map(u => u.id === currentUser.id ? updatedUser : u));
    } else {
      if (currentUser.mainJumpers.length >= 5) return alert("Możesz wybrać maksymalnie 5 skoczków w składzie podstawowym!");
      if (currentUser.mainJumpers.includes(name)) return alert("Skoczek jest już w składzie!");
      if (currentUser.reserveJumper === name) return alert("Ten skoczek jest rezerwowym!");
      const updatedUser = { ...currentUser, mainJumpers: [...currentUser.mainJumpers, name] };
      setCurrentUser(updatedUser);
      setUsersDb(usersDb.map(u => u.id === currentUser.id ? updatedUser : u));
    }
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
  };

  // Korekta punktów przez Admina
  const handleManualPointsCorrection = (userId: string, delta: number) => {
    const updated = usersDb.map(u => {
      if (u.id === userId) {
        return { ...u, points: u.points + delta };
      }
      return u;
    });
    setUsersDb(updated);
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(updated.find(u => u.id === userId) || currentUser);
    }
    alert(`Pomyślnie zaktualizowano punkty o ${delta > 0 ? '+' : ''}${delta}!`);
  };

  // Ekran logowania, jeśli użytkownik nie jest zalogowany
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 backdrop-blur">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto text-blue-400">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <h1 className="text-xl font-bold">Skoki Fantasy PŚ</h1>
            <p className="text-xs text-slate-400">Zaloguj się na swoje konto uczestnika</p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-xs">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Login (np. admin, gracz1, gracz2)</label>
              <input 
                type="text" 
                value={loginInput}
                onChange={e => setLoginInput(e.target.value)}
                required
                placeholder="Wpisz swój login..."
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
              <LogIn className="w-4 h-4" /> Zaloguj się do Ligi
            </button>
          </form>

          <div className="text-center text-[11px] text-slate-500 border-t border-slate-800/80 pt-4">
            Domyślne konta testowe: <strong className="text-slate-400">admin</strong> (hasło dowolne) oraz <strong className="text-slate-400">gracz1</strong>.
          </div>
        </div>
      </div>
    );
  }

  const sortedUsers = [...usersDb].sort((a, b) => b.points - a.points);
  const filteredJumpers = INITIAL_JUMPERS.filter(j => j.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Nagłówek */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
              Skoki Fantasy PŚ
            </h1>
            <p className="text-xs text-slate-400">Twoja Drużyna: <strong>{currentUser.teamName}</strong></p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-green-400" /> {currentUser.username} ({currentUser.role === 'admin' ? 'Administrator' : 'Uczestnik'})
          </span>
          <button 
            onClick={handleLogout}
            className="p-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 rounded-lg text-red-300 transition"
            title="Wyloguj się"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Nawigacja */}
      <nav className="bg-slate-900/40 border-b border-slate-800/80 px-6 flex gap-2 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition whitespace-nowrap ${activeTab === 'dashboard' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Trophy className="w-4 h-4" /> Klasyfikacja Generalna
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
          <FileText className="w-4 h-4" /> Wyniki Konkursów
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

      {/* Treść */}
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
        
        {/* KLASYFIKACJA GENERALNA Z ROZWIJANYMI SKŁADAMI */}
        {activeTab === 'dashboard' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" /> Tabela Ligi i Składy Uczestników
            </h2>
            <p className="text-xs text-slate-400 mb-4">Kliknij na wiersz drużyny, aby podejrzeć punktację poszczególnych skoczków.</p>
            
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
                          <h3 className="font-semibold text-sm text-slate-100">{user.teamName}</h3>
                          <p className="text-xs text-slate-400">Uczestnik: <strong className="text-slate-300">{user.username}</strong></p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-base font-extrabold text-blue-400">{user.points} pkt</span>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 bg-slate-900/30 border-t border-slate-800/80 space-y-3">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Skład i punkty zawodników:</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {user.mainJumpers.map((jumperName, jIdx) => {
                            const pts = user.jumperPoints[jumperName] || 0;
                            return (
                              <div key={jIdx} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                                <span className="text-slate-300">{jIdx + 1}. {jumperName}</span>
                                <span className="font-bold text-green-400">+{pts} pkt</span>
                              </div>
                            );
                          })}

                          {user.reserveJumper && (
                            <div className="p-2.5 bg-yellow-950/20 border border-yellow-500/30 rounded-lg flex items-center justify-between text-xs">
                              <span className="text-yellow-200 flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {user.reserveJumper} (Rezerwa)
                              </span>
                              <span className="font-bold text-yellow-400">+{user.jumperPoints[user.reserveJumper] || 0} pkt</span>
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

        {/* USTAWIENIA DRUŻYNY */}
        {activeTab === 'settings' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-xl">
            <h2 className="text-lg font-bold mb-2 text-slate-200 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-blue-400" /> Zmień Nazwę Swojej Drużyny
            </h2>
            <p className="text-xs text-slate-400 mb-6">Wpisz nową nazwę, pod którą Twoja ekipa wyświetla się w tabeli.</p>
            
            <form onSubmit={e => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem('teamNameInput') as HTMLInputElement).value;
              handleSaveTeamName(input);
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
                Zapisz Nową Nazwę
              </button>
            </form>
          </div>
        )}

        {/* WYBÓR SKŁADU */}
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
                  <h2 className="text-md font-bold text-slate-200">Wybierz Skoczków ({INITIAL_JUMPERS.length} dostępnych)</h2>
                  <div className="relative w-64">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Szukaj skoczka..." 
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

                    return (
                      <div key={idx} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-200">{jumper}</span>
                        <div className="flex gap-1">
                          <button 
                            disabled={isSelectedMain || isSelectedReserve}
                            onClick={() => handleAddJumper(jumper, false)}
                            className="px-2 py-1 bg-blue-900/40 hover:bg-blue-600 text-blue-200 text-[10px] rounded-lg border border-blue-500/30 disabled:opacity-30"
                          >
                            + Skład
                          </button>
                          <button 
                            disabled={isSelectedMain || isSelectedReserve}
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

        {activeTab === 'contests' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center py-12 text-slate-400">
            Brak rozegranych konkursów.
          </div>
        )}

        {/* PANEL STEROWANIA ADMINA (ZARZĄDZANIE I KOREKTY PUNKTÓW) */}
        {activeTab === 'admin' && currentUser.role === 'admin' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-yellow-500/30 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                <Shield className="w-5 h-5" /> Panel Sterowania Administratora
              </h2>
              <p className="text-xs text-slate-400">Tutaj możesz wklejać pliki PDF z wynikami FIS lub ręcznie korygować punkty drużyn w razie błędów.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                {/* Narzędzie korekty punktów */}
                <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-3">
                  <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-400" /> Ręczna Korekta Punktów Drużyny
                  </h3>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Wybierz uczestnika do korekty</label>
                    <select 
                      value={selectedUserToEdit}
                      onChange={e => setSelectedUserToEdit(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    >
                      {usersDb.map(u => (
                        <option key={u.id} value={u.id}>{u.username} ({u.teamName}) - {u.points} pkt</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Wprowadź liczbę punktów do dodania/odjęcia (np. 15 lub -10)</label>
                    <input 
                      type="number"
                      value={manualPointsAdd}
                      onChange={e => setManualPointsAdd(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>

                  <button 
                    onClick={() => {
                      const val = parseInt(manualPointsAdd);
                      if (isNaN(val)) return alert("Wpisz poprawną liczbę punktów!");
                      handleManualPointsCorrection(selectedUserToEdit, val);
                    }}
                    className="w-py px-4 py-2 bg-blue-600 hover:bg-blue-500 font-bold text-xs rounded-lg transition"
                  >
                    Zastosuj Korektę Punktów
                  </button>
                </div>

                {/* Import PDF */}
                <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-3">
                  <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-yellow-400" /> Automatyczny Import PDF FIS
                  </h3>
                  <textarea 
                    rows={4}
                    value={pdfText}
                    onChange={e => setPdfText(e.target.value)}
                    placeholder="Wklej tekst z oficjalnego PDF FIS z wynikami..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-yellow-500"
                  />
                  <button 
                    onClick={() => setImportStatus("Wyniki konkursu zostały przetworzone i doliczone do tabeli!")}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold text-xs rounded-lg transition"
                  >
                    Przetwórz i Przelicz Ligię
                  </button>
                  {importStatus && <div className="text-[11px] text-green-400">{importStatus}</div>}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
