import React, { useState } from 'react';
import { Trophy, Users, Shield, FileText, Award, CheckCircle, Trash2, Search, UserCheck, Edit3, ChevronDown, ChevronUp, Star } from 'lucide-react';

// Szeroka baza zawodników Pucharu Świata
const INITIAL_JUMPERS = [
  // Polska
  "Aleksander Zniszczoł", "Dawid Kubacki", "Piotr Żyła", "Kamil Stoch", "Paweł Wąsek", 
  "Maciej Kot", "Kacper Tomasiak", "Klemens Joniak", "Jakub Wolny", "Andrzej Stękała", "Klemens Murańka",
  // Austria
  "Stefan Kraft", "Jan Hoerl", "Daniel Tschofenig", "Manuel Fettner", "Daniel Huber", 
  "Michael Hayboeck", "Stephan Embacher", "Jonas Schuster", "Maximilian Ortner",
  // Niemcy
  "Andreas Wellinger", "Philipp Raimund", "Karl Geiger", "Pius Paschke", "Stephan Leyhe", 
  "Felix Hoffmann", "Constantin Schmid", "Martin Hamann",
  // Norwegia
  "Johann Andre Forfang", "Marius Lindvik", "Kristoffer Eriksen Sundal", "Halvor Egner Granerud", 
  "Benjamin Østvold", "Robin Pedersen",
  // Słowenia
  "Peter Prevc", "Domen Prevc", "Anze Lanisek", "Timi Zajc", "Lovro Kos", "Ziga Jelar",
  // Japonia
  "Ryoyu Kobayashi", "Ren Nikaido", "Naoki Nakamura", "Junshiro Kobayashi", "Keiichi Sato",
  // Inne nacje
  "Gregor Deschwanden", "Killian Peier", "Simon Ammann", "Niko Kytosaho", "Kasperi Valto", 
  "Giovanni Bresadola", "Alex Insam", "Tate Frantz", "Kevin Bickner", "Vladimir Zografski", "Roman Koudelka"
];

interface JumperScore {
  name: string;
  points: number;
}

interface LeagueUser {
  id: string;
  username: string;
  teamName: string;
  mainJumpers: JumperScore[];
  reserveJumper: JumperScore | null;
  totalPoints: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'team' | 'settings' | 'contests' | 'admin'>('dashboard');
  const [expandedUser, setExpandedUser] = useState<string | null>('u-1'); // Domyślnie rozwinięty pierwszy wiersz
  
  const [currentUser] = useState({
    username: 'admin',
    role: 'admin',
  });

  // Przykładowe dane ligowe (gotowe pod podgląd punktów zawodników)
  const [leagueUsers, setLeagueUsers] = useState<LeagueUser[]>([
    {
      id: 'u-1',
      username: 'admin (Ty)',
      teamName: 'Drużyna Administratora',
      mainJumpers: [
        { name: 'Stefan Kraft', points: 100 },
        { name: 'Andreas Wellinger', points: 80 },
        { name: 'Aleksander Zniszczoł', points: 36 },
        { name: 'Dawid Kubacki', points: 20 },
        { name: 'Kamil Stoch', points: 15 }
      ],
      reserveJumper: { name: 'Piotr Żyła', points: 12 },
      totalPoints: 251
    },
    {
      id: 'u-2',
      username: 'gracz1',
      teamName: 'Orły Narciarskie',
      mainJumpers: [
        { name: 'Ryoyu Kobayashi', points: 60 },
        { name: 'Jan Hoerl', points: 50 },
        { name: 'Marius Lindvik', points: 45 },
        { name: 'Peter Prevc', points: 40 },
        { name: 'Johann Andre Forfang', points: 26 }
      ],
      reserveJumper: { name: 'Manuel Fettner', points: 18 },
      totalPoints: 221
    },
    {
      id: 'u-3',
      username: 'gracz2',
      teamName: 'Śnieżne Pantery',
      mainJumpers: [
        { name: 'Pius Paschke', points: 29 },
        { name: 'Karl Geiger', points: 24 },
        { name: 'Gregor Deschwanden', points: 22 },
        { name: 'Halvor Egner Granerud', points: 14 },
        { name: 'Paweł Wąsek', points: 10 }
      ],
      reserveJumper: { name: 'Lovro Kos', points: 8 },
      totalPoints: 99
    }
  ]);

  const [myTeam, setMyTeam] = useState({
    teamName: 'Drużyna Administratora',
    main: ["Stefan Kraft", "Andreas Wellinger", "Aleksander Zniszczoł", "Dawid Kubacki", "Kamil Stoch"],
    reserve: "Piotr Żyła"
  });

  const [tempTeamName, setTempTeamName] = useState(myTeam.teamName);
  const [searchTerm, setSearchTerm] = useState('');
  const [pdfText, setPdfText] = useState('');
  const [importStatus, setImportStatus] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedUser(expandedUser === id ? null : id);
  };

  const addJumper = (name: string, isReserve: boolean) => {
    if (isReserve) {
      if (myTeam.reserve) return alert("Masz już wybranego skoczka rezerwowego!");
      if (myTeam.main.includes(name)) return alert("Ten skoczek jest już w składzie podstawowym!");
      setMyTeam({ ...myTeam, reserve: name });
    } else {
      if (myTeam.main.length >= 5) return alert("Możesz wybrać maksymalnie 5 skoczków podstawowych!");
      if (myTeam.main.includes(name)) return alert("Ten skoczek jest już w Twoim składzie!");
      if (myTeam.reserve === name) return alert("Ten skoczek jest już wyznaczony jako rezerwowy!");
      setMyTeam({ ...myTeam, main: [...myTeam.main, name] });
    }
  };

  const removeJumper = (name: string, isReserve: boolean) => {
    if (isReserve) {
      setMyTeam({ ...myTeam, reserve: null });
    } else {
      setMyTeam({ ...myTeam, main: myTeam.main.filter(n => n !== name) });
    }
  };

  const handleSaveTeamName = (e: React.FormEvent) => {
    e.preventDefault();
    setMyTeam({ ...myTeam, teamName: tempTeamName });
    alert("Nazwa drużyny została zaktualizowana!");
  };

  const filteredJumpers = INITIAL_JUMPERS.filter(j => j.toLowerCase().includes(searchTerm.toLowerCase()));

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
            <p className="text-xs text-slate-400">Liga Prywatna: <strong>{myTeam.teamName}</strong></p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-green-400" /> {currentUser.username} ({currentUser.role})
          </span>
        </div>
      </header>

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
          <Users className="w-4 h-4" /> Moja Drużyna ({myTeam.main.length}/5)
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
            <Shield className="w-4 h-4" /> Panel Admina (PDF)
          </button>
        )}
      </nav>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
        
        {/* ZAKŁADKA 1: KLASYFIKACJA Z ROZWIJANYM SKŁADEM DRUŻYNY */}
        {activeTab === 'dashboard' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" /> Klasyfikacja Generalna i Składy Drużyn
            </h2>
            <p className="text-xs text-slate-400 mb-4">Kliknij na drużynę, aby zobaczyć indywidualne punkty jej zawodników!</p>
            
            <div className="space-y-3">
              {leagueUsers.map((user, index) => {
                const isExpanded = expandedUser === user.id;

                return (
                  <div key={user.id} className="border border-slate-800 bg-slate-950/70 rounded-xl overflow-hidden transition">
                    {/* Główny wiersz drużyny */}
                    <div 
                      onClick={() => toggleExpand(user.id)}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-900/50 transition"
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-7 h-7 flex items-center justify-center font-bold text-xs rounded-lg ${index === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' : index === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-400/40' : index === 2 ? 'bg-amber-700/20 text-amber-500 border border-amber-600/40' : 'bg-slate-800 text-slate-400'}`}>
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="font-semibold text-sm text-slate-100">{user.teamName}</h3>
                          <p className="text-xs text-slate-400">Gracz: {user.username}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-base font-extrabold text-blue-400">{user.totalPoints} pkt</span>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                      </div>
                    </div>

                    {/* Szczegółowy podgląd skoczków i ich punktów po rozwinięciu */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 bg-slate-900/30 border-t border-slate-800/80 space-y-3">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pkt zawodników w tej drużynie:</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {user.mainJumpers.map((jumper, jIdx) => (
                            <div key={jIdx} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                              <span className="text-slate-300">{jIdx + 1}. {jumper.name}</span>
                              <span className="font-bold text-green-400">+{jumper.points} pkt</span>
                            </div>
                          ))}

                          {/* Rezerwowy */}
                          {user.reserveJumper && (
                            <div className="p-2.5 bg-yellow-950/20 border border-yellow-500/30 rounded-lg flex items-center justify-between text-xs">
                              <span className="text-yellow-200 flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {user.reserveJumper.name}
                              </span>
                              <span className="font-bold text-yellow-400">+{user.reserveJumper.points} pkt</span>
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
              <Edit3 className="w-5 h-5 text-blue-400" /> Edycja Nazwy Drużyny
            </h2>
            <p className="text-xs text-slate-400 mb-6">Wpisz nową nazwę, pod którą Twoja drużyna będzie widoczna w tabeli ligowej.</p>
            
            <form onSubmit={handleSaveTeamName} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nazwa Drużyny</label>
                <input 
                  type="text" 
                  value={tempTeamName}
                  onChange={e => setTempTeamName(e.target.value)}
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

        {/* WYBÓR DRUŻYNY */}
        {activeTab === 'team' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-900/80 border border-blue-500/30 rounded-2xl p-5 shadow-xl space-y-4">
                <h2 className="text-md font-bold text-blue-400 flex items-center gap-2">
                  <Users className="w-5 h-5" /> {myTeam.teamName}
                </h2>
                
                {myTeam.main.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Brak wybranych skoczków.</p>
                ) : (
                  <div className="space-y-2">
                    {myTeam.main.map((name, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                        <span className="font-medium text-slate-200">{i+1}. {name}</span>
                        <button onClick={() => removeJumper(name, false)} className="text-red-400 hover:text-red-300 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-slate-800">
                  <h3 className="text-xs font-semibold text-yellow-400 mb-2">Rezerwowy (1):</h3>
                  {myTeam.reserve ? (
                    <div className="flex items-center justify-between p-2.5 bg-yellow-950/20 border border-yellow-500/30 rounded-xl text-xs">
                      <span className="font-medium text-yellow-200">⭐ {myTeam.reserve}</span>
                      <button onClick={() => removeJumper(myTeam.reserve!, true)} className="text-red-400 hover:text-red-300 p-1">
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
                    const isSelectedMain = myTeam.main.includes(jumper);
                    const isSelectedReserve = myTeam.reserve === jumper;

                    return (
                      <div key={idx} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-200">{jumper}</span>
                        <div className="flex gap-1">
                          <button 
                            disabled={isSelectedMain || isSelectedReserve}
                            onClick={() => addJumper(jumper, false)}
                            className="px-2 py-1 bg-blue-900/40 hover:bg-blue-600 text-blue-200 text-[10px] rounded-lg border border-blue-500/30 disabled:opacity-30"
                          >
                            + Skład
                          </button>
                          <button 
                            disabled={isSelectedMain || isSelectedReserve}
                            onClick={() => addJumper(jumper, true)}
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

        {activeTab === 'admin' && currentUser.role === 'admin' && (
          <div className="bg-slate-900/60 border border-yellow-500/30 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
              <Shield className="w-5 h-5" /> Import Wyników Konkursu (PDF / Tekst)
            </h2>
            <textarea 
              rows={6}
              value={pdfText}
              onChange={e => setPdfText(e.target.value)}
              placeholder="Wklej tekst z pliku PDF z wynikami FIS..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-yellow-500"
            />
            <button 
              onClick={() => setImportStatus("Wyniki zostały przeanalizowane!")}
              className="px-4 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> Przetwórz i Przelicz Wyniki
            </button>
            {importStatus && <div className="p-3 bg-green-950/40 border border-green-500/30 rounded-xl text-green-300 text-xs">{importStatus}</div>}
          </div>
        )}
      </main>
    </div>
  );
}
