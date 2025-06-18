import React, { useState } from 'react';

const PublicQuery = ({ clients, onNavigateToLogin }) => {
  const [cedula, setCedula] = useState('');
  const [clientInfo, setClientInfo] = useState(null);
  const [message, setMessage] = useState('');

  const handleQuery = (e) => {
    e.preventDefault();
    const foundClient = clients.find(client => client.cedula === cedula);
    if (foundClient) {
      setClientInfo(foundClient);
      setMessage('');
    } else {
      setClientInfo(null);
      setMessage('¡Cédula no encontrada! Por favor, verifica el número.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white p-4">
      <h1 className="text-4xl font-extrabold mb-6 drop-shadow-lg">
        Consulta de Saldo
      </h1>
      <form onSubmit={handleQuery} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md space-y-6">
        <input
          type="text"
          placeholder="Ingresa número de Cédula"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
          className="w-full px-5 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg"
        >
          Consultar
        </button>
      </form>

      {message && <p className="text-red-300 mt-4 text-center">{message}</p>}

      {clientInfo && (
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mt-6 text-gray-800">
          <h3 className="text-2xl font-bold mb-4 text-center">Información del Cliente</h3>
          <p className="text-lg mb-2"><span className="font-semibold">Nombre:</span> {clientInfo.name} {clientInfo.lastName}</p>
          <p className="text-lg mb-2"><span className="font-semibold">Celular:</span> {clientInfo.phone}</p>
          <p className="text-lg mb-2"><span className="font-semibold">Saldo Actual:</span> ${clientInfo.balance.toLocaleString('es-CO')}</p>
          <p className="text-lg"><span className="font-semibold">Estado:</span> {clientInfo.status}</p>
        </div>
      )}

      <button
        onClick={onNavigateToLogin}
        className="mt-8 text-white text-lg hover:underline transition-colors duration-300"
      >
        Acceder al Sistema
      </button>
    </div>
  );
};

export default PublicQuery;