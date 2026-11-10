import React, { useState, useEffect } from 'react';
import { Trophy, Users, Shield, FileText, Settings, Award, LogOut, CheckCircle, AlertTriangle, Upload, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'teams' | 'contests' | 'admin'>('dashboard');
  const [currentUser, setCurrentUser] = useState<{username: string; role: string; teamName: string} | null>({
    username: 'admin',
    role: 'admin',
    teamName: 'Drużyna Administratora'
  });
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState('');

  const handleTestReset = async () => {
    if (!window.confirm('Czy na pewno chcesz zresetować środowisko TEST? Ta operacja usunie testowe konkursy i wyniki.')) return;
    setResetLoading(true);
    setResetMsg('');
    try {
      const res = await fetch('/api/test-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmText: 'RESET TEST' })
      });
      const data = await res.json();
      if (res.ok) {
        setResetMsg('Środowisko TEST zostało pomyślnie zresetowane!');
      } else {
        setResetMsg('Błąd: ' + (data.error || 'Nie udało się zresetować.'));
      }
    } catch (err: any) {
      setResetMsg('Błąd połączenia: ' + err.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Pasek nawigacyjny */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <div>
            <h1 className="text-xl font-bold text-blue-400">Skoki Fantasy</h1>
            <p className="text-xs text-slate-400">Prywatna Liga Skoków Narciarskich</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs px-3 py-1 bg-blue-950/60 border border-blue-500/30 rounded-full text-blue-300">
            Zalogowany: <strong>{currentUser?.username}</strong> ({currentUser?.teamName})
          </span>
        </div>
      </header>

      {/* Zakładki */}
      <div className="bg-slate-900/30 border-b border-slate-800 px-6 flex gap-4">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`py-3 px-4 font-medium text-sm border-b-2 flex items-center gap-2 transition ${activeTab === 'dashboard' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          <Trophy className="w-4 h-4" /> Klasyfikacja
        </button>
        <button 
          onClick={() => setActiveTab('teams')}
          className={`py-3 px-4 font-medium text-sm border-b-2 flex items-center gap-2 transition ${activeTab === 'teams' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          <Users className="w-4 h-4" /> Składy Drużyn
        </button>
        <button 
          onClick={() => setActiveTab('contests')}
          className={`py-3 px-4 font-medium text-sm border-b-2 flex items-center gap-2 transition ${activeTab === 'contests' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          <FileText className="w-4 h-4" /> Konkursy i Wyniki
        </button>
        {currentUser?.role === 'admin' && (
          <button 
            onClick={() => setActiveTab('admin')}
            className={`py-3 px-4 font-medium text-sm border-b-2 flex items-center gap-2 transition ${activeTab === 'admin' ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            <Shield className="w-4 h-4" /> Panel Admina
          </button>
        )}
      </div>

      {/* Główna treść */}
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-4 text-slate-200 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" /> Klasyfikacja Generalna Ligi
              </h2>
              <div className="text-slate-400 text-sm py-8 text-center border border-dashed border-slate-800 rounded-xl">
                Brak rozegranych konkursów. Zaimportuj pierwszy plik PDF z wynikami w panelu administratora, aby wygenerować punkty!
              </div>
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4 text-slate-200">Składy Uczestników</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                <h3 className="font-semibold text-blue-400 mb-2">{currentUser?.teamName}</h3>
                <p className="text-xs text-slate-400">Właściciel: {currentUser?.username}</p>
                <div className="mt-4 text-sm text-slate-300">Skład nie został jeszcze uzupełniony zawodnikami.</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contests' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4 text-slate-200">Kalendarz i Wyniki Konkursów</h2>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-slate-400 text-sm text-center">
              Brak zaplanowanych lub zaimportowanych konkursów w tej lidze.
            </div>
          </div>
        )}

        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-yellow-500/30 rounded-2xl p-6 shadow-xl space-y-6">
              <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                <Shield className="w-6 h-6" /> Panel Zarządzania Administratora
              </h2>
              
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                <h3 className="font-semibold text-sm text-slate-300 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-400" /> Import Wyników Konkursu (PDF FIS)
                </h3>
                <p className="text-xs text-slate-400">
                  Wgraj oficjalny dokument PDF z wynikami konkursu FIS. System automatycznie sparsuje punkty i przeliczy wyniki drużynowe.
                </p>
                <input type="file" accept=".pdf" className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer" />
              </div>

              <div className="p-4 bg-red-950/30 border border-red-500/20 rounded-xl space-y-3">
                <h3 className="font-semibold text-sm text-red-300 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-red-400" /> Reset Środowiska Testowego
                </h3>
                <p className="text-xs text-slate-400">
                  Usuwa wyłącznie testowe konkursy i wyniki, pozwalając na ponowne testowanie bez utraty kont i składów.
                </p>
                {resetMsg && <div className="text-xs p-2 bg-slate-900 rounded text-slate-200">{resetMsg}</div>}
                <button 
                  onClick={handleTestReset}
                  disabled={resetLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-xs font-semibold rounded-lg transition disabled:opacity-50"
                >
                  {resetLoading ? 'Resetowanie...' : 'Wykonaj Reset Testowy (Wpisz: RESET TEST)'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
