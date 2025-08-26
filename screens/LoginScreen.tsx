
import React, { useState, useEffect } from 'react';
import PataSlime from '../components/PataSlime';

interface LoginScreenProps {
  onLogin: (username: string) => void;
  pataBackground: string | null;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, pataBackground }) => {
  // Helper to get users from localStorage
  const getUsers = () => {
    const users = localStorage.getItem('pata_users');
    return users ? JSON.parse(users) : [];
  };

  // Set initial mode: 'register' if no users exist (first-time user), 'login' otherwise.
  // Using a function for lazy initialization to avoid running this on every render.
  const [mode, setMode] = useState<'login' | 'register'>(() => {
    return getUsers().length > 0 ? 'login' : 'register';
  });

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const savedCreds = localStorage.getItem('pata_credentials');
    if (savedCreds) {
      const { username, password } = JSON.parse(savedCreds);
      setUsername(username);
      setPassword(password);
    }
  }, []);

  // Helper to save users to localStorage
  const saveUsers = (users: any[]) => {
    localStorage.setItem('pata_users', JSON.stringify(users));
  };

  const validatePassword = (pass: string) => {
    const hasNumber = /\d/.test(pass);
    const hasLetter = /[a-zA-Z]/.test(pass);
    return pass.length >= 6 && hasNumber && hasLetter;
  };

  const handleRegister = () => {
    if (!username || !password || !confirmPassword) {
      setError('所有字段都不能为空');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    if (!validatePassword(password)) {
      setError('密码必须至少6位，且包含字母和数字');
      return;
    }

    const users = getUsers();
    const existingUser = users.find((user: any) => user.username === username);

    if (existingUser) {
      setError('该用户名已被注册');
      return;
    }

    const newUser = { username, password };
    saveUsers([...users, newUser]);
    
    setSuccess('注册成功！现在可以登录了。');
    setError('');
    setConfirmPassword('');
    setMode('login');
  };

  const handleLoginAttempt = () => {
    if (!username || !password) {
      setError('用户名和密码不能为空');
      return;
    }

    const users = getUsers();
    const foundUser = users.find((user: any) => user.username === username && user.password === password);

    if (foundUser) {
      setError('');
      setSuccess('');
      // Always save credentials now since logout is removed
      localStorage.setItem('pata_credentials', JSON.stringify({ username, password }));
      onLogin(username);
    } else {
      setError('用户名或密码错误');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (mode === 'login') {
      handleLoginAttempt();
    } else {
      handleRegister();
    }
  };

  const toggleMode = () => {
    setMode(prevMode => prevMode === 'login' ? 'register' : 'login');
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 bg-slate-100">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          {mode === 'login' ? '欢迎回来' : '创建新账户'}
        </h1>
        <p className="text-slate-500">
          {mode === 'login' ? '你的朋友Pata想你啦！' : '加入我们，和Pata一起成长吧！'}
        </p>
      </div>
      
      <PataSlime size="md" background={pataBackground} />

      <form onSubmit={handleSubmit} className="w-full max-w-sm mt-8">
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:outline-none transition text-slate-800"
            aria-label="用户名"
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:outline-none transition text-slate-800"
            aria-label="密码"
          />
          {mode === 'register' && (
            <input
              type="password"
              placeholder="确认密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-400 focus:outline-none transition animate-fade-in-up text-slate-800"
              aria-label="确认密码"
            />
          )}
        </div>

        {error && <p className="text-rose-500 text-sm text-center mt-4">{error}</p>}
        {success && <p className="text-green-500 text-sm text-center mt-4">{success}</p>}

        <button
          type="submit"
          className="w-full mt-6 py-3 bg-violet-500 text-white font-bold rounded-xl hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-transform transform hover:scale-105"
        >
          {mode === 'login' ? '登录' : '注册'}
        </button>

        <div className="text-center mt-6">
          <button type="button" onClick={toggleMode} className="font-medium text-sm text-violet-500 hover:underline">
            {mode === 'login' ? '还没有账户？去注册' : '已经有账户了？去登录'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginScreen;