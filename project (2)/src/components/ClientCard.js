import React, { useState } from 'react';

const ClientCard = ({ client, onPay, onAbono, onEdit, onUpdateBalance, onDelete, onRemovePayment, onShowReceipt }) => {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [editingBalance, setEditingBalance] = useState(false);
  const [newBalanceValue, setNewBalanceValue] = useState(client.balance);
  const [showPaymentsHistory, setShowPaymentsHistory] = useState(false);
  const [showModificationsHistory, setShowModificationsHistory] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const handlePay = (paymentType) => {
    if (paymentAmount > 0) {
      onAbono(client.id, parseFloat(paymentAmount), paymentType);
      setPaymentAmount('');
    } else {
      onPay(client.id, client.monthlyFee, paymentType);
    }
    setShowPaymentOptions(false);
  };

  const handleBalanceClick = () => {
    setEditingBalance(true);
    setNewBalanceValue(client.balance);
  };

  const handleBalanceChange = (e) => {
    setNewBalanceValue(parseFloat(e.target.value) || 0);
  };

  const handleBalanceSave = () => {
    onUpdateBalance(client.id, newBalanceValue);
    setEditingBalance(false);
  };

  const handleBalanceCancel = () => {
    setEditingBalance(false);
    setNewBalanceValue(client.balance);
  };

  const displayMonthlyFee = typeof client.monthlyFee === 'number' ? client.monthlyFee.toLocaleString('es-CO') : 'N/A';
  const displayBalance = typeof client.balance === 'number' ? client.balance.toLocaleString('es-CO') : 'N/A';

  const statusColor = client.balance === 0 ? 'text-green-500' :
                      client.balance > 0 ? 'text-red-500' :
                      'text-blue-500';

  const isSuspended = client.status === 'Suspendido';

  const today = new Date();
  const lastPayment = client.lastPaymentDate ? new Date(client.lastPaymentDate) : null;
  const nextPaymentDueDay = 5;
  const suspensionDay = 10;

  let showSuspensionWarning = false;
  if (client.balance > 0 && lastPayment) {
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const lastPaymentMonth = lastPayment.getMonth();
    const lastPaymentYear = lastPayment.getFullYear();

    if (lastPaymentYear < currentYear || (lastPaymentYear === currentYear && lastPaymentMonth < currentMonth) || (lastPaymentYear === currentYear && lastPaymentMonth === currentMonth && today.getDate() > nextPaymentDueDay)) {
      if (today.getDate() >= suspensionDay) {
        showSuspensionWarning = true;
      }
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-2xl font-bold text-gray-800">{client.name} {client.lastName}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          client.status === 'Al día' ? 'bg-green-100 text-green-800' :
          client.status === 'Pendiente' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {client.status}
        </span>
      </div>

      <div className="space-y-2 text-gray-700 text-sm">
        <p><span className="font-semibold">Tipo de Cliente:</span> {client.clientType}</p>
        <p><span className="font-semibold">Cédula:</span> {client.cedula}</p>
        <p><span className="font-semibold">Celular:</span> {client.phone}</p>
        <p><span className="font-semibold">Dirección:</span> {client.address}</p>
        <p><span className="font-semibold">Lugar:</span> {client.place}</p>
        <p><span className="font-semibold">Mensualidad:</span> ${displayMonthlyFee}</p>
        {client.comment && <p><span className="font-semibold">Comentario:</span> {client.comment}</p>}
        {client.mac && <p><span className="font-semibold">MAC:</span> {client.mac}</p>}
        {client.ip && <p><span className="font-semibold">IP:</span> {client.ip}</p>}
        {client.daysRemainingInMonth !== undefined && <p><span className="font-semibold">Días Restantes:</span> {client.daysRemainingInMonth}</p>}
      </div>
      
      <div className="flex items-center mt-4">
        <p className={`text-xl font-bold ${statusColor}`}>
          Saldo:
        </p>
        {editingBalance ? (
          <div className="flex items-center ml-2">
            <input
              type="number"
              value={newBalanceValue}
              onChange={handleBalanceChange}
              className="w-32 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            />
            <button
              onClick={handleBalanceSave}
              className="ml-2 bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors"
            >
              Guardar
            </button>
            <button
              onClick={handleBalanceCancel}
              className="ml-2 bg-gray-400 text-white px-3 py-1 rounded-md hover:bg-gray-500 transition-colors"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <span
            className={`text-xl font-bold ml-2 cursor-pointer hover:underline ${statusColor}`}
            onClick={onUpdateBalance ? handleBalanceClick : null}
          >
            ${displayBalance}
          </span>
        )}
      </div>

      {showSuspensionWarning && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm font-medium border border-red-200">
          ¡AVISO! Cliente con pago pendiente. ¡Suspender si no paga antes del día {suspensionDay}!
        </div>
      )}
      {isSuspended && (
        <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium border border-yellow-200">
          ¡AVISO! Cliente suspendido por falta de pago.
        </div>
      )}

      <div className="mt-6 flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Monto de abono"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
          />
          <button
            onClick={() => setShowPaymentOptions(!showPaymentOptions)}
            className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors font-semibold"
          >
            {paymentAmount > 0 ? 'Abonar' : 'Pagar Mes'}
          </button>
        </div>

        {showPaymentOptions && (
          <div className="flex space-x-2 mt-2">
            <button
              onClick={() => handlePay('Efectivo')}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Pago en Efectivo
            </button>
            <button
              onClick={() => handlePay('Transferencia')}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              Pago por Transferencia
            </button>
          </div>
        )}

        {onEdit && (
          <button
            onClick={() => onEdit(client)}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Modificar Cliente
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(client.id)}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Eliminar Cliente
          </button>
        )}
      </div>

      <div className="mt-6 flex justify-around space-x-2">
        {client.payments.length > 0 && (
          <button
            onClick={() => setShowPaymentsHistory(!showPaymentsHistory)}
            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-semibold"
          >
            {showPaymentsHistory ? 'Ocultar Historial de Pagos' : 'Ver Historial de Pagos'}
          </button>
        )}
        {client.modifications && client.modifications.length > 0 && (
          <button
            onClick={() => setShowModificationsHistory(!showModificationsHistory)}
            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-semibold"
          >
            {showModificationsHistory ? 'Ocultar Historial de Mods.' : 'Ver Historial de Mods.'}
          </button>
        )}
      </div>

      {showPaymentsHistory && client.payments.length > 0 && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h4 className="text-md font-semibold mb-2 text-gray-800">Historial de Pagos:</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            {client.payments.map((payment, index) => (
              <li key={index} className="bg-gray-50 p-2 rounded-md flex justify-between items-center">
                <div>
                  {new Date(payment.date).toLocaleString()} - <span className="font-medium">${payment.amount.toLocaleString('es-CO')}</span> ({payment.type}) - Realizado por: <span className="font-medium">{payment.by}</span>
                </div>
                <div className="flex space-x-2">
                  {onShowReceipt && (
                    <button
                      onClick={() => onShowReceipt(client, payment)}
                      className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 transition-colors text-xs"
                    >
                      Ver Recibo
                    </button>
                  )}
                  {onRemovePayment && (
                    <button
                      onClick={() => onRemovePayment(client.id, index)}
                      className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 transition-colors text-xs"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showModificationsHistory && client.modifications && client.modifications.length > 0 && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h4 className="text-md font-semibold mb-2 text-gray-800">Historial de Modificaciones:</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            {client.modifications.map((mod, index) => (
              <li key={index} className="bg-gray-50 p-2 rounded-md">
                {new Date(mod.date).toLocaleString()} - Modificado por: <span className="font-medium">{mod.by}</span> ({mod.type})
                {mod.details && <p className="text-xs text-gray-500 mt-1">Detalles: {mod.details}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ClientCard;