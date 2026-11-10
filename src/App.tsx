import React, { useState } from 'react';
import { Trophy, Users, Shield, FileText, Award, CheckCircle, Trash2, Search, UserCheck, Edit3 } from 'lucide-react';

// Pełna, szeroka lista wszystkich skoczków startujących w Pucharze Świata
const INITIAL_JUMPERS = [
  // Polska
  "Aleksander Zniszczoł", "Dawid Kubacki", "Piotr Żyła", "Kamil Stoch", "Paweł Wąsek", 
  "Maciej Kot", "Kacper Tomasiak", "Klemens Joniak", "Jakub Wolny", "Andrzej Stękała", "Klemens Murańka",
  // Austria
  "Stefan Kraft", "Jan Hoerl", "Daniel Tschofenig", "Manuel Fettner", "Daniel Huber", 
  "Michael Hayboeck", "Stephan Embacher", "Jonas Schuster", "Maximilian Ortner", "Manuel Poppinger",
  // Niemcy
  "Andreas Wellinger", "Philipp Raimund", "Karl Geiger", "Pius Paschke", "Stephan Leyhe", 
  "Felix Hoffmann", "Constantin Schmid", "Martin Hamann", "Luca Roth", "David Siegel",
  // Norwegia
  "Johann Andre Forfang", "Marius Lindvik", "Kristoffer Eriksen Sundal", "Halvor Egner Granerud", 
  "Benjamin Østvold", "Robin Pedersen", "Sindre Ulven Jørgensen", "Bendik Jakobsen Heggli",
  // Słowenia
  "Peter Prevc", "Domen Prevc", "Anze Lanisek", "Timi Zajc", "Lovro Kos", 
  "Ziga Jelar", "Matija Vidic", "Rok Masle", "Maksim Bartolj",
  // Japonia
  "Ryoyu Kobayashi", "Ren Nikaido", "Naoki Nakamura", "Junshiro Kobayashi", 
  "Keiichi Sato", "Yumu Harada", "Tomofumi Naito", "Asahi Sakano",
  // Szwajcaria
  "Gregor Deschwanden", "Killian Peier", "Simon Ammann", "Remo Imhof", "Yanick Wasser",
  // Finlandia
  "Niko Kytosaho", "Kasperi Valto", "Antti Aalto", "Eetu Nousiainen", "Vilho Palosaari",
  // Włochy
  "Giovanni Bresadola", "Alex Insam", "Francesco Cecon", "Andrea Campregher",
  // USA i Kanada
  "Tate Frantz", "Kevin Bickner", "Decker Dean", "Erik Belshaw", "Mackenzie Boyd-Clowes", "Matthew Soukup",
  // Francja, Czechy, Bułgaria, Kazachstan, Rumunija
  "Valentin Foubert", "Roman Koudelka", "Radek Rýdl", "Vladimir Zografski", "Danil Vassilyev", "Svyatoslav Nazarenko", "Daniel Cacina"
];

interface TeamState {
  teamName: string;
  main: string[];
  reserve: string | null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'team' | 'settings' | 'contests' | 'admin'>('dashboard');
  
  const [currentUser, setCurrentUser] = useState({
    username: 'admin',
    role: 'admin',
  });

  const [myTeam, setMyTeam] = useState<TeamState>({
    teamName: 'Drużyna Administratora',
    main: ["Stefan Kraft", "Andreas Wellinger", "Aleksander Zniszczoł", "Dawid Kubacki", "Kamil Stoch"],
    reserve: "Piotr Żyła"
  });

  const [tempTeamName, setTempTeamName] = useState(myTeam.teamName);
  const [searchTerm, setSearchTerm] = useState('');
  const [pdfText, setPdfText] = useState('');
  const [parsedResults, setParsedResults] = useState<{name: string; rank: number; points: number}[]>([]);
  const [importStatus, setImportStatus] = useState('');

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
    alert("Nazwa drużyny została pomyślnie zaktualizowana!");
  };

  const handleParseResults = () => {
    if (!pdfText.trim()) return alert("Wklej tekst lub zawartość z pliku PDF z wynikami FIS!");
    const fisPoints = [100, 80, 60, 50, 45, 40, 36, 32, 29, 26, 24, 22, 20, 18, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
    let rankCounter = 1;
    const results: {name: string; rank: number; points: number}[] = [];

    INITIAL_JUMPERS.forEach(jumper => {
      if (pdfText.toLowerCase().includes(jumper.toLowerCase()) && rankCounter <= 30) {
        results.push({ name: jumper, rank: rankCounter, points: fisPoints[rankCounter - 1] || 0 });
        rankCounter++;
      }
    });

    setParsedResults(results);
    setImportStatus(`Pomyślnie dopasowano ${results.length} zawodników!`);
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
        
        {activeTab === 'dashboard' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-4 text-slate-200 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" /> Tabela Ligi
            </h2>
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="p-3 rounded-l-lg">Miejsce</th>
                  <th className="p-3">Uczestnik</th>
                  <th className="p-3">Nazwa Drużyny</th>
                  <th className="p-3 text-right rounded-r-lg">Punkty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3 font-bold text-yellow-400">1</td>
                  <td className="p-3 font-medium text-white">{currentUser.username}</td>
                  <td className="p-3 text-blue-400 font-medium">{myTeam.teamName}</td>
                  <td className="p-3 text-right font-bold text-blue-400">0 pkt</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

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
              onClick={handleParseResults}
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
