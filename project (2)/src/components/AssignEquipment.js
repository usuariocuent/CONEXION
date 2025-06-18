import React, { useState, useEffect } from 'react';

const AssignEquipment = ({ clients, onAssignEquipment, onModifyEquipment, onNavigateBack }) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [mac, setMac] = useState('');
  const [ip, setIp] = useState('');
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [macError, setMacError] = useState('');
  const [ipError, setIpError] = useState('');
  const [searchName, setSearchName] = useState(''); // Nuevo estado para la búsqueda por nombre

  const unassignedClients = clients.filter(client => !client.mac && !client.ip);
  const assignedClients = clients.filter(client => client.mac || client.ip);

  // Clientes filtrados por búsqueda para la edición
  const filteredAssignedClients = assignedClients.filter(client =>
    client.name.toLowerCase().includes(searchName.toLowerCase()) ||
    client.lastName.toLowerCase().includes(searchName.toLowerCase())
  );

  useEffect(() => {
    if (isEditing && selectedClientId) {
      const clientToEdit = clients.find(client => client.id === selectedClientId);
      if (clientToEdit) {
        setMac(clientToEdit.mac || '');
        setIp(clientToEdit.ip || '');
      }
    } else {
      setMac('');
      setIp('');
    }
    setMacError('');
    setIpError('');
    setMessage('');
  }, [selectedClientId, isEditing, clients]);

  const handleMacChange = (e) => {
    const newMac = e.target.value;
    setMac(newMac);
    const existingMacClient = clients.find(client => client.mac === newMac && client.id !== selectedClientId);
    if (existingMacClient) {
      setMacError('¡Esta MAC ya está asignada a otro cliente!');
    } else {
      setMacError('');
    }
  };

  const handleIpChange = (e) => {
    const newIp = e.target.value;
    setIp(newIp);
    const existingIpClient = clients.find(client => client.ip === newIp && client.id !== selectedClientId);
    if (existingIpClient) {
      setIpError('¡Esta IP ya está asignada a otro cliente!');
    } else {
      setIpError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const existingMacClient = clients.find(client => client.mac === mac && client.id !== selectedClientId);
    if (existingMacClient) {
      setMacError('¡Esta MAC ya está asignada a otro cliente!');
      return;
    } else {
      setMacError('');
    }

    const existingIpClient = clients.find(client => client.ip === ip && client.id !== selectedClientId);
    if (existingIpClient) {
      setIpError('¡Esta IP ya está asignada a otro cliente!');
      return;
    } else {
      setIpError('');
    }

    if (!selectedClientId || !mac || !ip) {
      setMessage('¡Por favor, selecciona un cliente e ingresa la MAC y la IP!');
      return;
    }
    if (macError || ipError) {
      setMessage('¡Corrige los errores de MAC/IP antes de continuar!');
      return;
    }

    if (isEditing) {
      onModifyEquipment(selectedClientId, mac, ip);
      setMessage('¡Equipo modificado con éxito!');
    } else {
      onAssignEquipment(selectedClientId, mac, ip);
      setMessage('¡Equipo asignado con éxito!');
    }
    setSelectedClientId('');
    setMac('');
    setIp('');
    setIsEditing(false);
    setSearchName(''); // Limpiar búsqueda al enviar
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {isEditing ? 'Modificar Equipo de Cliente' : 'Asignar Equipo a Cliente'}
      </h2>

      <div className="flex justify-center mb-4 space-x-4">
        <button
          onClick={() => { setIsEditing(false); setSelectedClientId(''); setSearchName(''); }}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            !isEditing ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Asignar Nuevo
        </button>
        <button
          onClick={() => { setIsEditing(true); setSelectedClientId(''); setSearchName(''); }}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            isEditing ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Modificar Existente
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isEditing && (
          <div>
            <label htmlFor="search-name" className="block text-gray-700 text-sm font-bold mb-2">
              Buscar Cliente por Nombre:
            </label>
            <input
              type="text"
              id="search-name"
              placeholder="Escribe el nombre o apellido"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
            />
          </div>
        )}
        <div>
          <label htmlFor="client-select" className="block text-gray-700 text-sm font-bold mb-2">
            Seleccionar Cliente:
          </label>
          <select
            id="client-select"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
            required
          >
            <option value="">-- Selecciona un cliente --</option>
            {isEditing ? (
              filteredAssignedClients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} {client.lastName} (Cédula: {client.cedula})
                </option>
              ))
            ) : (
              unassignedClients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} {client.lastName} (Cédula: {client.cedula})
                </option>
              ))
            )}
          </select>
          {isEditing && filteredAssignedClients.length === 0 && searchName && (
            <p className="text-sm text-gray-500 mt-2">No se encontraron clientes con ese nombre.</p>
          )}
          {isEditing && assignedClients.length === 0 && !searchName && (
            <p className="text-sm text-gray-500 mt-2">¡No hay clientes con equipo asignado para modificar!</p>
          )}
          {!isEditing && unassignedClients.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">¡Todos los clientes ya tienen un equipo asignado!</p>
          )}
        </div>
        <div>
          <label htmlFor="mac-input" className="block text-gray-700 text-sm font-bold mb-2">
            MAC:
          </label>
          <input
            type="text"
            id="mac-input"
            placeholder="Ej: AA:BB:CC:DD:EE:FF"
            value={mac}
            onChange={handleMacChange}
            className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition ${
              macError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'
            }`}
            required
          />
          {macError && <p className="text-red-500 text-sm mt-1">{macError}</p>}
        </div>
        <div>
          <label htmlFor="ip-input" className="block text-gray-700 text-sm font-bold mb-2">
            IP:
          </label>
          <input
            type="text"
            id="ip-input"
            placeholder="Ej: 192.168.1.1"
            value={ip}
            onChange={handleIpChange}
            className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition ${
              ipError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'
            }`}
            required
          />
          {ipError && <p className="text-red-500 text-sm mt-1">{ipError}</p>}
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
          disabled={!!macError || !!ipError || !selectedClientId}
        >
          {isEditing ? 'Guardar Cambios' : 'Asignar Equipo'}
        </button>
        {message && <p className="text-green-600 text-center mt-2">{message}</p>}
      </form>
      <button
        onClick={onNavigateBack}
        className="w-full mt-4 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
      >
        Volver al Menú Principal
      </button>
    </div>
  );
};

export default AssignEquipment;