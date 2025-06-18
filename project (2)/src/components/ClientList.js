import React, { useState } from 'react';
import ClientCard from './ClientCard';

const ClientList = ({ clients, onPay, onAbono, onEdit, onUpdateBalance, onDelete, onRemovePayment, onShowReceipt, userRole }) => {
  const [selectedPlace, setSelectedPlace] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todos');

  const uniquePlaces = ['Todos', ...new Set(clients.map(client => client.place).filter(Boolean))];
  const uniqueStatuses = ['Todos', 'Al día', 'Pendiente', 'Suspendido'];

  const searchedClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cedula.includes(searchTerm) ||
    client.phone.includes(searchTerm) ||
    client.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.place.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredByPlaceClients = selectedPlace === 'Todos'
    ? searchedClients
    : searchedClients.filter(client => client.place === selectedPlace);

  const finalFilteredClients = selectedStatus === 'Todos'
    ? filteredByPlaceClients
    : filteredByPlaceClients.filter(client => client.status === selectedStatus);

  const clientsByPlace = finalFilteredClients.reduce((acc, client) => {
    const place = client.place || 'Sin lugar';
    if (!acc[place]) {
      acc[place] = [];
    }
    acc[place].push(client);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-grow">
          <label htmlFor="search-input" className="block text-lg font-medium text-gray-700 mb-2">
            Búsqueda:
          </label>
          <input
            type="text"
            id="search-input"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
          />
        </div>
        <div>
          <label htmlFor="place-filter" className="block text-lg font-medium text-gray-700 mb-2">
            Filtrar por Lugar:
          </label>
          <select
            id="place-filter"
            value={selectedPlace}
            onChange={(e) => setSelectedPlace(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
          >
            {uniquePlaces.map((place) => (
              <option key={place} value={place}>
                {place}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status-filter" className="block text-lg font-medium text-gray-700 mb-2">
            Filtrar por Estado:
          </label>
          <select
            id="status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
          >
            {uniqueStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {Object.keys(clientsByPlace).length === 0 && (
        <p className="text-center text-gray-500 text-xl mt-8">No hay clientes para mostrar con estos filtros.</p>
      )}

      {Object.keys(clientsByPlace).map((place) => (
        <div key={place} className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b-2 border-gray-300 pb-2">
            Lugar: {place}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientsByPlace[place].map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onPay={onPay}
                onAbono={onAbono}
                onEdit={userRole === 'admin' ? onEdit : null}
                onUpdateBalance={userRole === 'admin' ? onUpdateBalance : null}
                onDelete={userRole === 'admin' ? onDelete : null}
                onRemovePayment={userRole === 'admin' ? onRemovePayment : null} // Pasar la función
                onShowReceipt={onShowReceipt} // Pasar la función
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientList;