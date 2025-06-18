import React, { useState } from 'react';

const LayoutHeader = ({ currentPage, onNavigate, userRole, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Ver Clientes', page: 'list', roles: ['admin', 'cashier'] },
    { name: 'Registrar Cliente', page: 'add', roles: ['admin'] },
    { name: 'Eliminar Clientes', page: 'delete', roles: ['admin'] },
    { name: 'Asignar Equipo', page: 'assignEquipment', roles: ['admin'] }, // Nueva opción en el menú
    { name: 'Ajustes', page: 'settings', roles: ['admin'] },
    { name: 'Exportar/Importar', page: 'excel', roles: ['admin'] },
    { name: 'Facturar Mensual', page: 'bill', roles: ['admin'] },
  ];

  const handleNavigateClick = (page) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-black text-white p-4 shadow-lg relative z-10">
      <nav className="container mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-bold">CONEXION</h1>
        <div className="flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>

          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-20">
              {navItems.map((item) => (
                (item.roles.includes(userRole)) && (
                  <button
                    key={item.page}
                    onClick={() => handleNavigateClick(item.page)}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                      currentPage === item.page ? 'bg-gray-700' : ''
                    }`}
                  >
                    {item.name}
                  </button>
                )
              ))}
              <button
                onClick={onLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors border-t border-gray-700 mt-1 pt-2"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default LayoutHeader;