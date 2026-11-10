import React, { useState, useEffect } from 'react';
import { Trophy, Users, Shield, FileText, Award, CheckCircle, Trash2, Search, UserCheck, Edit3, ChevronDown, ChevronUp, Star, LogIn, LogOut, Sliders, Key } from 'lucide-react';

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
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [loginInput, setLoginInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'team' | 'settings' | 'contests' | 'admin'>('dashboard');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // Zmiana 'admin' na 'Sylwek'
  const [usersDb, setUsersDb] = useState<UserAccount[]>([
    {
      id: 'u-admin',
      username: 'Sylwek',
      role: 'admin',
      teamName: 'Lotniki',
      mainJumpers: ['Stefan Kraft', 'Andreas Wellinger', 'Aleksander Zniszczoł', 'Dawid Kubacki', 'Kamil Stoch'],
      reserveJumper: 'Piotr Żyła',
      points: 251,
      jumperPoints: { 'Stefan Kraft': 100, 'Andreas Wellinger': 80, 'Aleksander Zniszczoł': 36, 'Dawid Kubacki': 20, 'Kamil Stoch': 15, 'Piotr Żyła': 12 }
    },
    {
      id: 'u-user-1',
      username: 'Klaudia',
      role: 'user',
      teamName: 'Słodziaki',
      mainJumpers: ['Ryoyu Kobayashi', 'Jan Hoerl', 'Marius Lindvik', 'Peter Prevc', 'Johann Andre Forfang'],
      reserveJumper: 'Manuel Fettner',
      points: 221,
      jumperPoints: { 'Ryoyu Kobayashi': 60, 'Jan Hoerl': 50, 'Marius Lindvik': 45, 'Peter Prevc': 40, 'Johann Andre Forfang': 26, 'Manuel Fettner': 18 }
    },
    {
      id: 'u-user-2',
      username: 'Artur',
      role: 'user',
      teamName: 'Śnieżne Pantery',
      mainJumpers: ['Pius Paschke', 'Karl Geiger', 'Gregor Deschwanden', 'Halvor Egner Granerud', 'Paweł Wąsek'],
      reserveJumper: 'Lovro Kos',
      points: 112,
      jumperPoints: { 'Pius Paschke': 29, 'Karl Geiger': 24, 'Gregor Deschwanden': 22, 'Halvor Egner Granerud': 14, 'Paweł Wąsek': 10, 'Lovro Kos': 8 }
    },
    {
      id: 'u-user-3',
      username: 'Filip',
      role: 'user',
      teamName: 'Skrzydlate Lwy',
      mainJumpers: ['Domen Prevc', 'Anze Lanisek', 'Michael Hayboeck', 'Timi Zajc', 'Maciej Kot'],
      reserveJumper: 'Kacper Tomasiak',
      points: 99,
      jumperPoints: { 'Domen Prevc': 35, 'Anze Lanisek': 30, 'Michael Hayboeck': 25, 'Timi Zajc': 15, 'Maciej Kot': 7, 'Kacper Tomasiak': 0 }
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [pdfText, setPdfText] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [recentContests, setRecentContests] = useState<{name: string; results: {name: string; rank: number; points: number}[]}[]>([]);

  const [selectedUserToEdit, setSelectedUserToEdit] = useState<string>('u-user-1');
  const [manualPointsAdd, setManualPointsAdd] = useState<string>('0');
  
  const [editUserTarget, setEditUserTarget] = useState<string>('u-user-1');
  const [newUsernameInput, setNewUsernameInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (data.users && data.users.length > 0) {
          setUsersDb(prev => prev.map(u => {
            const dbMatch = data.users.find((d: any) => d.id === u.id);
            return dbMatch ? { 
              ...u, 
              teamName: dbMatch.team_name || u.teamName, 
              username: dbMatch.username || u.username,
              points: dbMatch.points !== undefined ? dbMatch.points : u.points 
            } : u;
          }));
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

    const updated = usersDb.map(u => u.id === editUserTarget ? { ...u, username: newUsernameInput } : u);
    setUsersDb(updated);

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
        alert(`Zaktualizowano dane logowania w bazie D1! Nowy login: ${newUsernameInput}`);
        setNewUsernameInput('');
        setNewPasswordInput('');
      } else {
        alert("Błąd zapisu w bazie.");
      }
    } catch (err) {
      alert("Błąd połączenia z bazą D1.");
    }
  };

  const handleParseAndApplyResults = async () => {
    if (!pdfText.trim()) return alert("Wklej tekst wyników!");

    const fisPoints = [100, 80, 60, 50, 45, 40, 36, 32, 29, 26, 24, 22, 20, 18, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
    let rankCounter = 1;
    const parsed: {name: string; rank: number; points: number}[] = [];

    INITIAL_JUMPERS.forEach(jumper => {
      if (pdfText.toLowerCase().includes(jumper.toLowerCase()) && rankCounter <= 30) {
        parsed.push({ name: jumper, rank: rankCounter, points: fisPoints[rankCounter - 1] || 0 });
        rankCounter++;
      }
    });

    if (parsed.length === 0) return alert("Nie rozpoznano żadnego skoczka.");

    const updatedUsers = usersDb.map(user => {
      let totalMatchPoints = 0;
      const newJp = { ...user.jumperPoints };

      user.mainJumpers.forEach(jName => {
        const match = parsed.find(p => p.name === jName);
        const pts = match ? match.points : 0;
        newJp[jName] = (newJp[jName] || 0) + pts;
        totalMatchPoints += pts;
      });

      const newTotal = user.points + totalMatchPoints;
      return { ...user, points: newTotal, jumperPoints: newJp };
    });

    setUsersDb(updatedUsers
