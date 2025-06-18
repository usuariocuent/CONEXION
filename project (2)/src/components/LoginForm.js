import React, { useState } from 'react';
import { users } from '../mock/users';

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const foundUser = users.find(
      (user) => user.username === username && user.password === password
    );

    if (foundUser) {
      onLogin(foundUser);
    } else {
      setError('Usuario o contraseña incorrectos. ¡Intenta de nuevo, campeón!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-500 scale-95 hover:scale-100">
        <h2 className="text-4xl font-extrabold mb-8 text-center text-white drop-shadow-lg">
          Bienvenido
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-5 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            required
          />
          {error && <p className="text-red-400 text-center text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Entrar
          </button>
        </form>
        <div className="mt-8 text-center text-gray-300">
          <p className="text-sm">Usa 'admin' / 'admin123' o 'empleado' / 'empleado123'</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;