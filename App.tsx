
import React, { useState, useEffect, useCallback } from 'react';
import { User, QuizConfig, Question } from './types';
import { SetupView } from './components/SetupView';
import { TriviaView } from './components/TriviaView';
import { AuthView } from './components/AuthView';
import { generateTriviaQuestions } from './geminiService';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const session = localStorage.getItem('melodyMind_session');
    return session ? JSON.parse(session) : null;
  });

  const [gameState, setGameState] = useState<'IDLE' | 'LOADING' | 'PLAYING' | 'SUMMARY'>('IDLE');
  const [currentConfig, setCurrentConfig] = useState<QuizConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionScore, setSessionScore] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('melodyMind_session', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('melodyMind_session');
    }
  }, [currentUser]);

  const updatePersistentPoints = useCallback((change: number) => {
    if (!currentUser) return;
    const newPoints = Math.max(0, currentUser.permanentPoints + change);
    const usersJson = localStorage.getItem('melodyMind_users');
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    const updatedUsers = users.map(u => u.username === currentUser.username ? { ...u, permanentPoints: newPoints } : u);
    localStorage.setItem('melodyMind_users', JSON.stringify(updatedUsers));
    setCurrentUser(prev => prev ? { ...prev, permanentPoints: newPoints } : null);
  }, [currentUser]);

  const handleStartQuiz = async (config: QuizConfig) => {
    setGameState('LOADING');
    setError(null);
    setCurrentConfig(config);
    setSessionScore(0);
    try {
      const generated = await generateTriviaQuestions(config);
      if (generated.length === 0) throw new Error("Generation failed");
      setQuestions(generated);
      setGameState('PLAYING');
    } catch (err) {
      setError("Failed to sync with the music database. Try adjusting your filters.");
      setGameState('IDLE');
    }
  };

  const handleCorrectAnswer = (spentPoints: number) => {
    setSessionScore(prev => prev + 1);
    const bonus = spentPoints > 0 ? (spentPoints + 3) : 1;
    updatePersistentPoints(bonus);
  };

  const calculateFinalPoints = () => {
    if (!currentConfig) return 0;
    const isPerfect = sessionScore === questions.length;
    if (isPerfect) {
      if (questions.length >= 50) return Math.floor(sessionScore * 0.5);
      return Math.floor(sessionScore * 0.2);
    }
    return 0;
  };

  const handleFinish = () => {
    const extra = calculateFinalPoints();
    if (extra > 0) updatePersistentPoints(extra);
    setGameState('SUMMARY');
  };

  if (!currentUser) return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="p-8 flex justify-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 music-gradient rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 3v9.13a4.5 4.5 0 102 3.87V7.951l8-1.6V15.13a4.5 4.5 0 102 3.87V3z"/></svg>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white">MelodyMind</h1>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center px-4">
        <AuthView onLogin={setCurrentUser} />
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-600/30 rounded-full blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 bg-slate-950/60 backdrop-blur-xl border-b border-white/5 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setGameState('IDLE')}>
            <div className="w-8 h-8 music-gradient rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 3v9.13a4.5 4.5 0 102 3.87V7.951l8-1.6V15.13a4.5 4.5 0 102 3.87V3z"/></svg>
            </div>
            <h1 className="text-xl font-black tracking-tighter hidden sm:block">MelodyMind</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">Vault Balance</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white">{currentUser.permanentPoints.toLocaleString()}</span>
                <span className="text-purple-400 text-xs font-bold">PTS</span>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-white/10" />
            <button 
              onClick={() => setCurrentUser(null)} 
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition-all text-slate-300 hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="relative flex-grow container mx-auto px-6 py-12 max-w-7xl">
        {gameState === 'IDLE' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-4">
              <h2 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter">
                The Ultimate <br />
                <span className="bg-clip-text text-transparent music-gradient">Musical IQ Test</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg md:text-xl font-medium">
                Sync your knowledge with our global music database. Earn points, use power-ups, and climb the leaderboard.
              </p>
              {error && <div className="max-w-md mx-auto p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-sm font-bold flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {error}
              </div>}
            </div>
            <SetupView onStart={handleStartQuiz} />
          </div>
        )}

        {gameState === 'PLAYING' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <TriviaView 
              questions={questions} 
              format={currentConfig?.format!}
              currentUser={currentUser}
              onQuestionCorrect={handleCorrectAnswer}
              onFinish={handleFinish}
              onExit={() => setGameState('IDLE')}
            />
          </div>
        )}

        {gameState === 'SUMMARY' && (
          <div className="max-w-2xl mx-auto p-12 bg-slate-900/60 rounded-[40px] border border-white/5 backdrop-blur-xl text-center space-y-10 animate-in zoom-in-95 duration-500">
            <div>
              <h2 className="text-sm font-black uppercase text-slate-500 tracking-[0.3em] mb-4">Performance Report</h2>
              <h3 className="text-5xl font-black">Session Complete</h3>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-12">
              <div className="relative group">
                <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative w-40 h-40 rounded-full border-8 border-slate-800 flex flex-col items-center justify-center">
                  <p className="text-4xl font-black text-white">{Math.round((sessionScore / questions.length) * 100)}%</p>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-1">Accuracy</p>
                </div>
              </div>
              
              <div className="text-left space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Questions Passed</p>
                  <p className="text-3xl font-black">{sessionScore} <span className="text-slate-600 text-lg">/ {questions.length}</span></p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Bonus Multiplier</p>
                  <p className={`text-3xl font-black ${sessionScore === questions.length ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {sessionScore === questions.length ? (questions.length >= 50 ? 'x1.50' : 'x1.20') : 'None'}
                  </p>
                </div>
              </div>
            </div>

            {sessionScore === questions.length && (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl animate-bounce">
                <p className="text-emerald-400 font-black flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" /></svg>
                  PERFECT PERFORMANCE!
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button fullWidth onClick={() => setGameState('IDLE')} className="py-5">Return to Stage</Button>
              <Button variant="secondary" fullWidth onClick={() => handleStartQuiz(currentConfig!)} className="py-5 bg-slate-800 border-slate-700">Remix Session</Button>
            </div>
          </div>
        )}

        {gameState === 'LOADING' && (
          <div className="flex flex-col items-center justify-center min-h-[500px] animate-in fade-in duration-500">
            <div className="relative">
              <div className="w-32 h-32 border-[12px] border-slate-900 border-t-purple-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-400 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
            </div>
            <div className="mt-12 text-center space-y-4">
              <p className="text-2xl font-black tracking-tight">Syncing Music Database</p>
              <div className="flex gap-2 justify-center">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce delay-75" />
                <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce delay-150" />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-300" />
              </div>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest pt-4">Tuning the algorithm...</p>
            </div>
          </div>
        )}
      </main>
      
      <footer className="py-8 px-6 text-center border-t border-white/5 bg-slate-950/40">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">© 2024 MelodyMind Global · Professional Music Intelligence</p>
      </footer>
    </div>
  );
};

export default App;
