import React, { useRef } from 'react';

const PaymentReceipt = ({ client, payment, onClose }) => {
  const receiptRef = useRef();

  if (!client || !payment) return null;

  const serviceName = "Servicio de Internet";

  const handlePrint = () => {
    const printContent = receiptRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(`
      <html>
      <head>
        <title>Recibo de Pago</title>
        <style>
          body { font-family: sans-serif; margin: 20px; }
          .receipt-container { border: 1px solid #ccc; padding: 20px; border-radius: 8px; max-width: 400px; margin: 0 auto; }
          h2 { text-align: center; color: #333; margin-bottom: 20px; }
          .info-section { border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px; }
          .info-section p { margin: 5px 0; color: #555; font-size: 14px; }
          .info-section span { font-weight: bold; color: #333; }
          .amount-section { border-top: 1px solid #eee; padding-top: 10px; margin-top: 10px; }
          .amount-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .amount-row p { font-size: 16px; color: #333; }
          .amount-row .value { font-size: 20px; font-weight: bold; }
          .green-text { color: #22c55e; }
          .red-text { color: #ef4444; }
          .blue-text { color: #3b82f6; }
          .thank-you { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          ${printContent}
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    onClose();
  };

  const handleShare = async () => {
    // Generar un texto conciso para compartir con toda la información relevante
    const shareText = `¡Hola! Aquí está tu recibo de pago.\n\n` +
                      `Cliente: ${client.name} ${client.lastName}\n` +
                      `Cédula: ${client.cedula}\n` +
                      `Celular: ${client.phone}\n` +
                      `Dirección: ${client.address}\n` +
                      `Lugar: ${client.place}\n` +
                      `Servicio: ${serviceName}\n` +
                      `Mensualidad: $${client.monthlyFee.toLocaleString('es-CO')}\n` +
                      `Monto Pagado: $${payment.amount.toLocaleString('es-CO')}\n` +
                      `Forma de Pago: ${payment.type}\n` +
                      `Realizado por: ${payment.by}\n` +
                      `Saldo Actual: ${client.balance < 0 ? 'A favor $' + Math.abs(client.balance).toLocaleString('es-CO') : 'Pendiente $' + client.balance.toLocaleString('es-CO')}\n` +
                      `Estado del Cliente: ${client.status}\n` +
                      `Fecha del Pago: ${new Date(payment.date).toLocaleString('es-CO')}\n\n` +
                      `Tipo de Cliente: ${client.clientType}\n` + // Agregado
                      `MAC: ${client.mac || 'N/A'}\n` + // Agregado
                      `IP: ${client.ip || 'N/A'}\n` + // Agregado
                      `Días Restantes en el Mes: ${client.daysRemainingInMonth || 'N/A'}\n` + // Agregado
                      `¡Gracias por tu pago!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Recibo de Pago',
          text: shareText,
        });
        alert('¡Recibo compartido con éxito!');
      } catch (error) {
        console.error('Error al compartir:', error);
        alert('¡No se pudo compartir el recibo! Intenta de nuevo.');
      }
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('¡Recibo copiado al portapapeles! Puedes pegarlo donde quieras.');
      }).catch(err => {
        console.error('Error al copiar al portapapeles:', err);
        alert('Tu navegador no soporta la función de compartir ni copiar al portapapeles. Copia la información manualmente.');
      });
    }
  };

  const isBalancePositive = client.balance < 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-200 text-gray-700 rounded-full p-2 hover:bg-gray-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        <div ref={receiptRef} className="p-2">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Recibo de Pago</h2>
          
          <div className="border-b border-gray-200 pb-4 mb-4">
            <p className="text-gray-600 text-sm">Fecha y Hora: <span className="font-semibold text-gray-800">{new Date(payment.date).toLocaleString('es-CO')}</span></p>
            <p className="text-gray-600 text-sm">Forma de Pago: <span className="font-semibold text-gray-800">{payment.type}</span></p>
            <p className="text-gray-600 text-sm">Realizado por: <span className="font-semibold text-gray-800">{payment.by}</span></p>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Información del Cliente:</h3>
            <p className="text-gray-700"><span className="font-medium">Nombre:</span> {client.name} {client.lastName}</p>
            <p className="text-gray-700"><span className="font-medium">Cédula:</span> {client.cedula}</p>
            <p className="text-gray-700"><span className="font-medium">Celular:</span> {client.phone}</p>
            <p className="text-gray-700"><span className="font-medium">Servicio:</span> {serviceName}</p>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-lg font-semibold text-gray-800">Monto Pagado:</p>
              <p className="text-2xl font-bold text-green-600">${payment.amount.toLocaleString('es-CO')}</p>
            </div>
            
            {isBalancePositive ? (
              <div className="flex justify-between items-center">
                <p className="text-md font-semibold text-gray-800">Saldo a Favor:</p>
                <p className="text-xl font-bold text-blue-600">${Math.abs(client.balance).toLocaleString('es-CO')}</p>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <p className="text-md font-semibold text-gray-800">Saldo Pendiente:</p>
                <p className="text-xl font-bold text-red-600">${client.balance.toLocaleString('es-CO')}</p>
              </div>
            )}
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">¡Gracias por tu pago!</p>
        </div>

        <div className="flex justify-around mt-6 space-x-4">
          <button
            onClick={handlePrint}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Imprimir
          </button>
          <button
            onClick={handleShare}
            className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            Compartir
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceipt;