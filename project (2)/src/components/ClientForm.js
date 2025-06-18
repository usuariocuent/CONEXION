import React, { useState, useEffect } from 'react';

const ClientForm = ({ onAddClient, onUpdateClient, editingClient, existingClientCedulas, currentUser, clientCount }) => {
  const [client, setClient] = useState({
    clientType: 'Normal',
    name: '',
    lastName: '',
    cedula: '',
    phone: '',
    address: '',
    comment: '',
    place: '',
    monthlyFeeIdentifier: 'A',
  });
  const [cedulaError, setCedulaError] = useState('');
  const [monthlyFeeOptions, setMonthlyFeeOptions] = useState({});

  useEffect(() => {
    if (editingClient) {
      setClient(editingClient);
    } else {
      setClient({
        clientType: 'Normal',
        name: '',
        lastName: '',
        cedula: '',
        phone: '',
        address: '',
        comment: '',
        place: '',
        monthlyFeeIdentifier: 'A',
      });
    }
    setCedulaError('');
  }, [editingClient]);

  useEffect(() => {
    const storedOptions = JSON.parse(localStorage.getItem('monthlyFeeOptions'));
    if (storedOptions) {
      setMonthlyFeeOptions(storedOptions);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClient((prevClient) => ({ ...prevClient, [name]: value }));

    if (name === 'cedula') {
      if (existingClientCedulas && existingClientCedulas.includes(value) && (!editingClient || editingClient.cedula !== value)) {
        setCedulaError('¡Esta cédula ya está registrada! Por favor, usa otra.');
      } else {
        setCedulaError('');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (cedulaError) { // No permitir enviar si hay error de cédula
      return;
    }

    if (existingClientCedulas && existingClientCedulas.includes(client.cedula) && (!editingClient || editingClient.cedula !== client.cedula)) {
      setCedulaError('¡Esta cédula ya está registrada! Por favor, usa otra.');
      return;
    }

    const monthlyFeeValue = monthlyFeeOptions[client.monthlyFeeIdentifier] || 0;

    if (editingClient) {
      const updatedClient = {
        ...client,
        monthlyFee: monthlyFeeValue, // Guardar el valor numérico
      };
      onUpdateClient(updatedClient); // onUpdateClient ahora maneja la adición de la modificación
    } else {
      const newClient = {
        ...client,
        monthlyFee: monthlyFeeValue, // Guardar el valor numérico
      };
      onAddClient(newClient);
    }
  };

  const formattedAbonadoNumber = String(clientCount + 1).padStart(4, '0');

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {editingClient ? 'Modificar Cliente' : 'Agregar Cliente'}
      </h2>
      {!editingClient && (
        <p className="text-lg font-semibold text-gray-700 mb-4 text-center">
          # Abonado: {formattedAbonadoNumber}
        </p>
      )}

      <div className="mb-4">
        <label htmlFor="clientType" className="block text-gray-700 text-sm font-bold mb-2">
          Tipo de Cliente:
        </label>
        <select
          id="clientType"
          name="clientType"
          value={client.clientType}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
          required
        >
          <option value="Normal">Normal</option>
          <option value="Exonerado">Exonerado</option>
          <option value="Comodato">Comodato</option>
        </select>
      </div>

      <input
        type="text"
        name="name"
        placeholder="Nombre"
        value={client.name}
        onChange={handleChange}
        className="w-full mt-3 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
        required
      />
      <input
        type="text"
        name="lastName"
        placeholder="Apellido"
        value={client.lastName}
        onChange={handleChange}
        className="w-full mt-3 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
        required
      />
      <input
        type="text"
        name="cedula"
        placeholder="Número de Cédula"
        value={client.cedula}
        onChange={handleChange}
        className={`w-full mt-3 px-4 py-2 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition ${
          cedulaError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-black'
        }`}
        required
      />
      {cedulaError && <p className="text-red-500 text-sm mt-1">{cedulaError}</p>}
      <input
        type="text"
        name="phone"
        placeholder="Celular"
        value={client.phone}
        onChange={handleChange}
        className="w-full mt-3 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
        required
      />
      <input
        type="text"
        name="address"
        placeholder="Dirección"
        value={client.address}
        onChange={handleChange}
        className="w-full mt-3 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
        required
      />
      <input
        type="text"
        name="place"
        placeholder="Lugar"
        value={client.place}
        onChange={handleChange}
        className="w-full mt-3 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
        required
      />
      
      <div className="mt-3">
        <label htmlFor="monthlyFeeIdentifier" className="block text-gray-700 text-sm font-bold mb-2">
          Mensualidad (Identificador):
        </label>
        <select
          id="monthlyFeeIdentifier"
          name="monthlyFeeIdentifier"
          value={client.monthlyFeeIdentifier}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
          required
        >
          {Object.keys(monthlyFeeOptions).map(key => (
            <option key={key} value={key}>
              {key} - ${monthlyFeeOptions[key].toLocaleString('es-CO')}
            </option>
          ))}
        </select>
      </div>

      <textarea
        name="comment"
        placeholder="Comentario"
        value={client.comment}
        onChange={handleChange}
        rows="3"
        className="w-full mt-3 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition resize-none"
      ></textarea>
      <button
        type="submit"
        className="w-full mt-4 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
        disabled={!!cedulaError}
      >
        {editingClient ? 'Guardar Cambios' : 'Agregar Cliente'}
      </button>
    </form>
  );
};

export default ClientForm;