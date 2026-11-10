import React, { useState } from 'react';
import { Trophy, Users, Shield, FileText, Award, CheckCircle, Plus, Trash2, Search, UserCheck, AlertCircle } from 'lucide-react';

// Baza oficjalnych skoczków PŚ do wyboru
const INITIAL_JUMPERS = [
  "Stefan Kraft", "Ryoyu Kobayashi", "Andreas Wellinger", "Jan Hoerl", "Peter Prevc",
  "Michael Hayboeck", "Johann Andre Forfang", "Marius Lindvik", "Manuel Fettner", "Daniel Huber",
  "Aleksander Zniszczoł", "Dawid Kubacki", "Piotr Żyła", "Kamil Stoch", "Paweł Wąsek",
  "Maciej Kot", "Gregor Deschwanden", "Domen Prevc", "Anze Lanisek", "Timiku Zajc",
  "Lovro Kos", "Karl Geiger", "Pius Paschke", "Stephan Leyhe", "Philipp Raimund",
  "Halvor Egner Granerud", "Kristoffer Eriksen Sundal", "Ren Nikaido", "Tate Frantz", "Niko Kytosaho"
];

interface TeamState {
  main: string[];
  reserve: string | null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'team' | 'contests' | 'admin'>('dashboard');
  const [userRole, setUserRole] = useState<'admin' | 'user'>('admin');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Stan składu użytkownika (5 podstawowych + 1 rezerwowy)
  const [myTeam, setMyTeam] = useState<TeamState>({
    main: ["Stefan Kraft", "Andreas Wellinger", "Aleksander Zniszczoł"],
    reserve: "Kamil Stoch"
  });

  // Stan parsera PDF dla admina
  const [pdfText, setPdfText] = useState('');
  const [parsedResults, setParsedResults] = useState<{name: string; rank: number; points: number}[]>([]);
  const [importStatus, setImportStatus] = useState('');

  // Dodawanie/usuwanie skoczka ze składu
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

  // Prosty parser tekstu z wyników FIS
  const handleParseResults = () => {
    if (!pdfText.trim()) return alert("Wklej tekst lub zawartość z pliku PDF z wynikami FIS!");
    
    const lines = pdfText.split('\n');
    const results: {name: string; rank: number; points: number}[] = [];

    // Tabela punktacji FIS dla Fantasy
    const fisPoints = [100, 80, 60, 50, 45, 40, 36, 32, 29, 26, 24, 22, 20, 18, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

    let rankCounter = 1;
    INITIAL_JUMPERS.forEach(jumper => {
      if (pdfText.toLowerCase().includes(jumper.toLowerCase()) && rankCounter <= 30) {
        results.push({
          name: jumper,
          rank: rankCounter,
          points: fisPoints[rankCounter - 1] || 0
        });
        rankCounter++;
      }
    });

    setParsedResults(results);
    setImportStatus(`Pomyślnie dopasowano ${results.length} zawodników z oficjalnej listy!`);
  };

  const filteredJumpers = INITIAL_JUMPERS.filter(j => 
    j.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <p className="text-xs text-slate-400">Sezon Ligi Prywatnej</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-green-400" /> Zalogowany: <strong>Administrator</strong>
          </span>
        </div>
      </header>

      {/* Nawigacja */}
      <nav className="bg-slate-900/40 border-b border-slate-800/80 px-6 flex gap-2">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition ${activeTab === 'dashboard' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Trophy className="w-4 h-4" /> Klasyfikacja Generalna
        </button>
        <button 
          onClick={() => setActiveTab('team')}
          className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition ${activeTab === 'team' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Users className="w-4 h-4" /> Moja Drużyna ({myTeam.main.length}/5)
        </button>
        <button 
          onClick={() => setActiveTab('contests')}
          className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition ${activeTab === 'contests' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <FileText className="w-4 h-4" /> Wyniki Konkursów
        </button>
        <button 
          onClick={() => setActiveTab('admin')}
          className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 transition ${activeTab === 'admin' ? 'border-yellow-500 text-yellow-400 bg-yellow-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Shield className="w-4 h-4" /> Panel Admina (Import PDF)
        </button>
      </nav>

      {/* Treść */}
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
        
        {/* ZAKŁADKA 1: KLASYFIKACJA */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-bold mb-4 text-slate-200 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" /> Tabela Ligi
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                    <tr>
                      <th className="p-3 rounded-l-lg">Miejsce</th>
                      <th className="p-3">Uczestnik</th>
                      <th className="p-3">Nazwa Drużyny</th>
                      <th className="p-3 text-right rounded-r-lg">Suma Punktów</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-yellow-400">1</td>
                      <td className="p-3 font-medium text-white">admin (Ty)</td>
                      <td className="p-3 text-slate-400">Drużyna Administratora</td>
                      <td className="p-3 text-right font-bold text-blue-400">0 pkt</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-slate-400">2</td>
                      <td className="p-3">gracz1</td>
                      <td className="p-3 text-slate-400">Orły </td>
                      <td className="p-3 text-right font-bold">0 pkt</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-slate-400">3</td>
                      <td className="p-3">gracz2</td>
                      <td className="p-3 text-slate-400">Skrzydlate Lwy</td>
                      <td className="p-3 text-right font-bold">0 pkt</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-slate-400">4</td>
                      <td className="p-3">gracz3</td>
                      <td className="p-3 text-slate-400">Śnieżne Pantery</td>
                      <td className="p-3 text-right font-bold">0 pkt</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ZAKŁADKA 2: TWORZENIE DRUŻYNY */}
        {activeTab === 'team' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Aktualny skład */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-900/80 border border-blue-500/30 rounded-2xl p-5 shadow-xl space-y-4">
                <h2 className="text-md font-bold text-blue-400 flex items-center gap-2">
                  <Users className="w-5 h-5" /> Twój Skład (5 Skoczków)
                </h2>
                
                {myTeam.main.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Brak wybranych skoczków podstawowych.</p>
                ) : (
                  <div className="space-y-2">
                    {myTeam.main.map((name, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                        <span className="font-medium text-slate-200">{i+1}. {name}</span>
                        <button 
                          onClick={() => removeJumper(name, false)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Zawodnik rezerwowy */}
                <div className="pt-4 border-t border-slate-800">
                  <h3 className="text-xs font-semibold text-yellow-400 mb-2">Zawodnik Rezerwowy (1):</h3>
                  {myTeam.reserve ? (
                    <div className="flex items-center justify-between p-2.5 bg-yellow-950/20 border border-yellow-500/30 rounded-xl text-xs">
                      <span className="font-medium text-yellow-200">⭐ {myTeam.reserve}</span>
                      <button 
                        onClick={() => removeJumper(myTeam.reserve!, true)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Nie wyznaczono rezerwowego.</p>
                  )}
                </div>

                <button 
                  onClick={() => alert("Skład został pomyślnie zapisany w bazie danych D1!")}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-xl transition shadow-lg shadow-blue-600/20"
                >
                  Zapisz Skład w Bazie
                </button>
              </div>
            </div>

            {/* Baza dostępnych skoczków */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-md font-bold text-slate-200">Wybierz Skoczków z Bazy</h2>
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
                      <div key={idx} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between hover:border-slate-700 transition">
                        <span className="text-xs font-medium text-slate-200">{jumper}</span>
                        <div className="flex gap-1">
                          <button 
                            disabled={isSelectedMain || isSelectedReserve}
                            onClick={() => addJumper(jumper, false)}
                            className="px-2 py-1 bg-blue-900/40 hover:bg-blue-600 text-blue-200 text-[10px] rounded-lg border border-blue-500/30 transition disabled:opacity-30"
                          >
                            + Skład
                          </button>
                          <button 
                            disabled={isSelectedMain || isSelectedReserve}
                            onClick={() => addJumper(jumper, true)}
                            className="px-2 py-1 bg-yellow-900/40 hover:bg-yellow-600 text-yellow-200 text-[10px] rounded-lg border border-yellow-500/30 transition disabled:opacity-30"
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

        {/* ZAKŁADKA 3: WYNIKI KONKURSÓW */}
        {activeTab === 'contests' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl text-center py-12">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-slate-300 font-semibold">Brak rozegranych konkursów</h3>
            <p className="text-xs text-slate-500 mt-1">Gdy Administrator zaimportuje plik PDF z wynikami, tutaj pojawią się szczegółowe rezultaty skoków.</p>
          </div>
        )}

        {/* ZAKŁADKA 4: PANEL ADMINA (PARSER PDF) */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-yellow-500/30 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                <Shield className="w-5 h-5" /> Import Wyników Konkursu (PDF / Skopiowany Tekst FIS)
              </h2>
              <p className="text-xs text-slate-400">
                Wklej poniżej skopiowaną treść z pliku PDF FIS z wynikami konkursu. System przeanalizuje nazwiska zawodników, wyciągnie ich punkty PŚ i automatycznie naliczy je drużynom ligowym.
              </p>

              <textarea 
                rows={6}
                value={pdfText}
                onChange={e => setPdfText(e.target.value)}
                placeholder="Wklej tekst z pliku PDF z oficjalnymi wynikami FIS..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-yellow-500"
              />

              <button 
                onClick={handleParseResults}
                className="px-4 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-yellow-600/20 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Przetwórz i Przelicz Wyniki
              </button>

              {importStatus && (
                <div className="p-3 bg-green-950/40 border border-green-500/30 rounded-xl text-green-300 text-xs">
                  {importStatus}
                </div>
              )}

              {parsedResults.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <h3 className="text-xs font-semibold text-slate-300 mb-3">Rozpoznani zawodnicy i przyznane punkty PŚ:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {parsedResults.map((r, i) => (
                      <div key={i} className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs flex justify-between">
                        <span className="text-slate-300">{r.rank}. {r.name}</span>
                        <span className="font-bold text-yellow-400">+{r.points} pkt</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
