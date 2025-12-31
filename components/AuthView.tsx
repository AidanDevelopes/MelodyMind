
import React, { useState } from 'react';
import { Button } from './Button';
import { User } from '../types';

interface AuthViewProps {
  onLogin: (user: User) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const getUsers = (): User[] => {
    const saved = localStorage.getItem('melodyMind_users');
    return saved ? JSON.parse(saved) : [];
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem('melodyMind_users', JSON.stringify(users));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    const users = getUsers();

    if (isLogin) {
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid username or password');
      }
    } else {
      if (users.find(u => u.username === username)) {
        setError('Username already exists');
        return;
      }
      const newUser: User = { username, password, permanentPoints: 0 };
      saveUsers([...users, newUser]);
      onLogin(newUser);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-slate-800/50 rounded-3xl border border-slate-700 backdrop-blur-sm card-shadow space-y-8 mt-12">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-slate-400">
          {isLogin ? 'Sign in to save your progress' : 'Join the music trivia community'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase ml-1">Username</label>
          <input
            type="text"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
          <input
            type="password"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-rose-400 text-sm text-center">{error}</p>}

        <Button fullWidth type="submit" className="mt-4">
          {isLogin ? 'Login' : 'Sign Up'}
        </Button>
      </form>

      <div className="text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-slate-400 hover:text-purple-400 transition-colors"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
};
