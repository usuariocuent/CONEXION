import React from 'react';

const WelcomeScreen = ({ onEnter }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 text-white p-4">
      <h1 className="text-6xl font-extrabold mb-6 drop-shadow-lg animate-pulse">
        Bienvenido a CONEXION_PLUX
      </h1>
      <p className="text-xl text-center mb-10 max-w-md">
        Tu solución integral para la gestión de clientes y pagos de servicios de internet.
      </p>
      <button
        onClick={onEnter}
        className="bg-white text-blue-700 px-8 py-4 rounded-full text-2xl font-bold shadow-lg hover:bg-gray-100 hover:scale-105 transition-all duration-300 transform"
      >
        Ingresar
      </button>
    </div>
  );
};

export default WelcomeScreen;