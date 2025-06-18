import React, { useState, useEffect } from 'react';
import { getStorage, setStorage, removeStorage } from './utils/storage';
import { initialClients } from './mock/clients';
import { users } from './mock/users';
import ClientForm from './components/ClientForm';
import ClientList from './components/ClientList';
import LayoutHeader from './components/LayoutHeader';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import SettingsPage from './components/SettingsPage';
import PaymentReceipt from './components/PaymentReceipt';
import WelcomeScreen from './components/WelcomeScreen';
import PublicQuery from './components/PublicQuery';
import AssignEquipment from './components/AssignEquipment';

const App = () => {
  const [clients, setClients] = useState(() => getStorage('clients', initialClients));
  const [currentPage, setCurrentPage] = useState('welcome');
  const [editingClient, setEditingClient] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => getStorage('isLoggedIn', false));
  const [currentUser, setCurrentUser] = useState(() => getStorage('currentUser', null));
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [messageRecipient, setMessageRecipient] = useState('all');

  useEffect(() => {
    setStorage('clients', clients);
  }, [clients]);

  useEffect(() => {
    setStorage('isLoggedIn', isLoggedIn);
    setStorage('currentUser', currentUser);
  }, [isLoggedIn, currentUser]);

  const handleWelcomeEnter = () => {
    setCurrentPage('publicQuery');
  };

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    setCurrentPage('list');
  };

  const handleRegister = (newUser) => {
    if (newUser.role === 'admin' && users.filter(u => u.role === 'admin').length >= 3) {
      alert('¡Ya se ha alcanzado el límite de 3 administradores!');
      return;
    }
    if (users.some(u => u.username === newUser.username)) {
      alert('¡Ya existe un usuario con ese correo electrónico!');
      return;
    }

    users.push(newUser);
    alert(`Usuario ${newUser.username} registrado con éxito como ${newUser.role}. ¡Ahora inicia sesión!`);
    setCurrentPage('login');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    removeStorage('isLoggedIn');
    removeStorage('currentUser');
    setCurrentPage('login');
    setEditingClient(null);
  };

  const handleAddClient = (newClientData) => {
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysInMonth = lastDayOfMonth;
    const daysRemaining = lastDayOfMonth - today.getDate() + 1;

    const monthlyFeeOptions = JSON.parse(localStorage.getItem('monthlyFeeOptions')) || { A: 60000 };
    const assignedMonthlyFee = monthlyFeeOptions[newClientData.monthlyFeeIdentifier] || 0;

    const initialBalance = (assignedMonthlyFee / daysInMonth) * daysRemaining;

    const newClient = {
      id: Date.now().toString(),
      ...newClientData,
      balance: initialBalance,
      status: initialBalance > 0 ? 'Pendiente' : 'Al día',
      lastPaymentDate: new Date().toISOString(),
      payments: [],
      modifications: [{ date: new Date().toISOString(), by: currentUser.username, type: 'Creación de Cliente' }],
      daysRemainingInMonth: daysRemaining,
      mac: null,
      ip: null,
    };
    setClients((prevClients) => [...prevClients, newClient]);
    setCurrentPage('list');
  };

  const handleUpdateClient = (updatedClientData) => {
    setClients((prevClients) =>
      prevClients.map((client) => {
        if (client.id === updatedClientData.id) {
          const changes = [];
          let newMonthlyFee = client.monthlyFee;

          if (updatedClientData.monthlyFeeIdentifier !== client.monthlyFeeIdentifier) {
            const monthlyFeeOptions = JSON.parse(localStorage.getItem('monthlyFeeOptions')) || { A: 60000 };
            newMonthlyFee = monthlyFeeOptions[updatedClientData.monthlyFeeIdentifier] || 0;

            if (client.balance <= 0) {
              const today = new Date();
              const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
              const daysInMonth = lastDayOfMonth;
              const daysRemaining = lastDayOfMonth - today.getDate() + 1;
              updatedClientData.balance = (newMonthlyFee / daysInMonth) * daysRemaining;
              updatedClientData.status = updatedClientData.balance > 0 ? 'Pendiente' : 'Al día';
            }
            changes.push(`Mensualidad: '${client.monthlyFeeIdentifier}' ($${client.monthlyFee.toLocaleString('es-CO')}) -> '${updatedClientData.monthlyFeeIdentifier}' ($${newMonthlyFee.toLocaleString('es-CO')})`);
          }

          for (const key in updatedClientData) {
            if (updatedClientData[key] !== client[key] && key !== 'modifications' && key !== 'monthlyFee' && key !== 'balance' && key !== 'status') {
              changes.push(`${key}: '${client[key]}' -> '${updatedClientData[key]}'`);
            }
          }
          
          const modificationEntry = {
            date: new Date().toISOString(),
            by: currentUser.username,
            type: 'Modificación de Cliente',
            details: changes.length > 0 ? changes.join(', ') : 'Sin cambios específicos',
          };
          return {
            ...updatedClientData,
            monthlyFee: newMonthlyFee,
            modifications: [...(client.modifications || []), modificationEntry],
          };
        }
        return client;
      })
    );
    setEditingClient(null);
    setCurrentPage('list');
  };

  const handleAssignEquipment = (clientId, mac, ip) => {
    setClients(prevClients => prevClients.map(client => {
      if (client.id === clientId) {
        const modificationEntry = {
          date: new Date().toISOString(),
          by: currentUser.username,
          type: 'Asignación de Equipo',
          details: `MAC: ${mac}, IP: ${ip}`,
        };
        return {
          ...client,
          mac: mac,
          ip: ip,
          modifications: [...(client.modifications || []), modificationEntry],
        };
      }
      return client;
    }));
    setCurrentPage('list');
  };

  const handleModifyEquipment = (clientId, mac, ip) => {
    setClients(prevClients => prevClients.map(client => {
      if (client.id === clientId) {
        const oldMac = client.mac;
        const oldIp = client.ip;
        const modificationEntry = {
          date: new Date().toISOString(),
          by: currentUser.username,
          type: 'Modificación de Equipo',
          details: `MAC: ${oldMac} -> ${mac}, IP: ${oldIp} -> ${ip}`,
        };
        return {
          ...client,
          mac: mac,
          ip: ip,
          modifications: [...(client.modifications || []), modificationEntry],
        };
      }
      return client;
    }));
    setCurrentPage('list');
  };

  const handleDeleteClient = (clientId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar a este cliente? ¡Esta acción no se puede deshacer!')) {
      setClients((prevClients) => prevClients.filter((client) => client.id !== clientId));
    }
  };

  const handleDeleteAllClients = () => {
    if (window.confirm('¡ADVERTENCIA! ¿Estás ABSOLUTAMENTE seguro de que quieres eliminar a TODOS los clientes? ¡Esta acción no se puede deshacer!')) {
      setClients([]);
      alert('¡Todos los clientes han sido eliminados!');
    }
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setCurrentPage('add');
  };

  const handleUpdateBalance = (clientId, newBalance) => {
    setClients((prevClients) =>
      prevClients.map((client) => {
        if (client.id === clientId) {
          const oldBalance = client.balance;
          const newStatus = newBalance <= 0 ? 'Al día' : 'Pendiente';
          const modificationEntry = {
            date: new Date().toISOString(),
            by: currentUser.username,
            type: 'Actualización de Saldo Manual',
            details: `Saldo: $${oldBalance.toLocaleString('es-CO')} -> $${newBalance.toLocaleString('es-CO')}`,
          };
          return {
            ...client,
            balance: newBalance,
            status: newStatus,
            modifications: [...(client.modifications || []), modificationEntry],
          };
        }
        return client;
      })
    );
  };

  const handlePay = (clientId, monthlyFee, paymentType) => {
    setClients((prevClients) =>
      prevClients.map((client) => {
        if (client.id === clientId) {
          const newBalance = client.balance - monthlyFee;
          const newStatus = newBalance <= 0 ? 'Al día' : 'Pendiente';
          const paymentRecord = {
            amount: monthlyFee,
            date: new Date().toISOString(),
            type: paymentType,
            by: currentUser.username,
          };
          
          setReceiptData({ client: { ...client, balance: newBalance }, payment: paymentRecord });
          setShowReceipt(true);

          const modificationEntry = {
            date: new Date().toISOString(),
            by: currentUser.username,
            type: `Pago de Mensualidad (${paymentType})`,
            details: `Monto: $${monthlyFee.toLocaleString('es-CO')}, Saldo anterior: $${client.balance.toLocaleString('es-CO')}, Nuevo saldo: $${newBalance.toLocaleString('es-CO')}`,
          };

          return {
            ...client,
            balance: newBalance,
            status: newStatus,
            lastPaymentDate: new Date().toISOString(),
            payments: [...client.payments, paymentRecord],
            modifications: [...(client.modifications || []), modificationEntry],
          };
        }
        return client;
      })
    );
  };

  const handleAbono = (clientId, amount, paymentType) => {
    setClients((prevClients) =>
      prevClients.map((client) => {
        if (client.id === clientId) {
          const newBalance = client.balance - amount;
          const newStatus = newBalance <= 0 ? 'Al día' : 'Pendiente';
          const paymentRecord = {
            amount: amount,
            date: new Date().toISOString(),
            type: paymentType,
            by: currentUser.username,
          };

          setReceiptData({ client: { ...client, balance: newBalance }, payment: paymentRecord });
          setShowReceipt(true);

          const modificationEntry = {
            date: new Date().toISOString(),
            by: currentUser.username,
            type: `Abono de Saldo (${paymentType})`,
            details: `Monto: $${amount.toLocaleString('es-CO')}, Saldo anterior: $${client.balance.toLocaleString('es-CO')}, Nuevo saldo: $${newBalance.toLocaleString('es-CO')}`,
          };

          return {
            ...client,
            balance: newBalance,
            status: newStatus,
            lastPaymentDate: new Date().toISOString(),
            payments: [...client.payments, paymentRecord],
            modifications: [...(client.modifications || []), modificationEntry],
          };
        }
        return client;
      })
    );
  };

  const handleRemovePayment = (clientId, paymentIndex) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este pago?')) {
      setClients(prevClients => prevClients.map(client => {
        if (client.id === clientId) {
          const removedPayment = client.payments[paymentIndex];
          const newPayments = client.payments.filter((_, idx) => idx !== paymentIndex);
          const newBalance = client.balance + removedPayment.amount;
          const newStatus = newBalance <= 0 ? 'Al día' : 'Pendiente';

          const modificationEntry = {
            date: new Date().toISOString(),
            by: currentUser.username,
            type: 'Eliminación de Pago',
            details: `Pago de $${removedPayment.amount.toLocaleString('es-CO')} (${removedPayment.type}) eliminado. Saldo anterior: $${client.balance.toLocaleString('es-CO')}, Nuevo saldo: $${newBalance.toLocaleString('es-CO')}`,
          };

          return {
            ...client,
            payments: newPayments,
            balance: newBalance,
            status: newStatus,
            modifications: [...(client.modifications || []), modificationEntry],
          };
        }
        return client;
      }));
      alert('¡Pago eliminado con éxito!');
    }
  };

  const handleShowReceipt = (client, payment) => {
    setReceiptData({ client, payment });
    setShowReceipt(true);
  };

  const handleUpdateUser = (updatedUserData) => {
    const userIndex = users.findIndex(u => u.username === updatedUserData.username);
    if (userIndex !== -1) {
      users[userIndex] = updatedUserData;
    }
    setCurrentUser(updatedUserData);
    alert('¡Tu perfil ha sido actualizado!');
  };

  const handleCreateEmployee = (newEmployeeData) => {
    const existingUser = users.find(u => u.username === newEmployeeData.username);
    if (existingUser) {
      alert('¡Ya existe un usuario con ese correo electrónico!');
      return;
    }
    users.push(newEmployeeData);
    alert(`¡Empleado ${newEmployeeData.name} creado con éxito!`);
  };

  const handleUpdateEmployee = (updatedEmployeeData) => {
    const userIndex = users.findIndex(u => u.username === updatedEmployeeData.username);
    if (userIndex !== -1) {
      users[userIndex] = updatedEmployeeData;
      alert(`¡Empleado ${updatedEmployeeData.name} actualizado con éxito!`);
    } else {
      alert('¡Error al actualizar empleado!');
    }
  };

  const handleDeleteEmployee = (username) => {
    const initialLength = users.length;
    const updatedUsers = users.filter(user => user.username !== username);
    users.splice(0, users.length, ...updatedUsers);
    if (users.length < initialLength) {
      alert(`¡Usuario ${username} eliminado con éxito!`);
    } else {
      alert('¡Error al eliminar usuario!');
    }
  };

  const handleRegisterAdmin = (newAdminData) => {
    if (users.filter(u => u.role === 'admin').length >= 3) {
      alert('¡Ya se ha alcanzado el límite de 3 administradores!');
      return;
    }
    if (users.some(u => u.username === newAdminData.username)) {
      alert('¡Ya existe un usuario con ese correo electrónico!');
      return;
    }
    users.push(newAdminData);
    alert(`¡Administrador ${newAdminData.name} creado con éxito!`);
  };

  const handleUpdatePaymentDays = (newDays) => {
    localStorage.setItem('paymentDays', JSON.stringify(newDays));
    alert('¡Días de cobro actualizados y guardados!');
  };

  const handleExportClientsToCsv = () => {
    const headers = [
      "ID", "Tipo de Cliente", "Nombre", "Apellido", "Cédula", "Celular", "Dirección", "Lugar", 
      "Mensualidad (Identificador)", "Mensualidad (Valor)", "Saldo Actual", "Estado", "Comentario", 
      "Último Pago (Fecha)", "Historial de Pagos (Fecha - Monto - Tipo - Por)", 
      "Historial de Modificaciones (Fecha - Por - Tipo - Detalles)", "Días Restantes en el Mes",
      "MAC", "IP"
    ];
    const rows = clients.map(client => {
      const paymentsHistory = client.payments.map(p => 
        `${new Date(p.date).toLocaleString('es-CO')} - $${p.amount.toLocaleString('es-CO')} (${p.type}) - Por: ${p.by || 'N/A'}`
      ).join('; ');
      
      const modificationsHistory = client.modifications.map(m =>
        `${new Date(m.date).toLocaleString('es-CO')} - Por: ${m.by || 'N/A'} (${m.type})${m.details ? ' - ' + m.details : ''}`
      ).join('; ');

      return [
        client.id,
        client.clientType,
        client.name,
        client.lastName,
        client.cedula,
        client.phone,
        client.address,
        client.place,
        client.monthlyFeeIdentifier,
        client.monthlyFee,
        client.balance,
        client.status,
        client.comment,
        client.lastPaymentDate ? new Date(client.lastPaymentDate).toLocaleDateString('es-CO') : '',
        paymentsHistory,
        modificationsHistory,
        client.daysRemainingInMonth || 'N/A',
        client.mac || '',
        client.ip || ''
      ];
    });

    const escapeCsvValue = (value) => {
      if (value === null || value === undefined) return '';
      let stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.map(escapeCsvValue).join(",") + "\n" 
      + rows.map(row => row.map(escapeCsvValue).join(",")).join("\n");

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "clientes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('¡Clientes exportados a clientes.csv!');
  };

  const handleImportClients = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      if (lines.length <= 1) {
        alert('¡El archivo CSV está vacío o solo tiene encabezados!');
        return;
      }
      const importedClients = [];
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        
        const newClient = {
          id: values[headers.indexOf("ID")] || Date.now().toString() + i,
          clientType: values[headers.indexOf("Tipo de Cliente")] || 'Normal',
          name: values[headers.indexOf("Nombre")] || '',
          lastName: values[headers.indexOf("Apellido")] || '',
          cedula: values[headers.indexOf("Cédula")] || '',
          phone: values[headers.indexOf("Celular")] || '',
          address: values[headers.indexOf("Dirección")] || '',
          place: values[headers.indexOf("Lugar")] || '',
          monthlyFeeIdentifier: values[headers.indexOf("Mensualidad (Identificador)")] || 'A',
          monthlyFee: parseFloat(values[headers.indexOf("Mensualidad (Valor)")]) || 0,
          balance: parseFloat(values[headers.indexOf("Saldo Actual")]) || 0,
          status: values[headers.indexOf("Estado")] || 'Al día',
          comment: values[headers.indexOf("Comentario")] || '',
          lastPaymentDate: values[headers.indexOf("Último Pago (Fecha)")] ? new Date(values[headers.indexOf("Último Pago (Fecha)")]).toISOString() : new Date().toISOString(),
          payments: [],
          modifications: [{ date: new Date().toISOString(), by: currentUser.username, type: 'Importación' }],
          daysRemainingInMonth: parseInt(values[headers.indexOf("Días Restantes en el Mes")]) || 0,
          mac: values[headers.indexOf("MAC")] || null,
          ip: values[headers.indexOf("IP")] || null,
        };
        importedClients.push(newClient);
      }
      setClients(prevClients => [...prevClients, ...importedClients]);
      alert(`¡Se importaron ${importedClients.length} clientes nuevos!`);
      setCurrentPage('list');
    };
    reader.readAsText(file);
  };

  const handleBillClientsMonthly = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const billingDay = JSON.parse(localStorage.getItem('paymentDays'))?.billingDay || 1;

    if (today.getDate() !== billingDay) {
      alert(`¡Hoy no es el día de facturación! El día de facturación configurado es el ${billingDay} de cada mes.`);
      return;
    }

    let billedCount = 0;
    const updatedClients = clients.map(client => {
      const lastPaymentDate = client.lastPaymentDate ? new Date(client.lastPaymentDate) : null;
      const alreadyBilledThisMonth = lastPaymentDate && 
                                     lastPaymentDate.getMonth() === currentMonth && 
                                     lastPaymentDate.getFullYear() === currentYear;

      if (client.balance === 0 && client.monthlyFee > 0 && !alreadyBilledThisMonth) {
        billedCount++;
        const newBalance = client.balance + client.monthlyFee;
        const newStatus = newBalance > 0 ? 'Pendiente' : 'Al día';

        return {
          ...client,
          balance: newBalance,
          status: newStatus,
          modifications: [
            ...(client.modifications || []),
            { date: new Date().toISOString(), by: currentUser.username, type: 'Facturación Mensual' },
          ],
        };
      }
      return client;
    });
    setClients(updatedClients);
    alert(`¡Se facturaron ${billedCount} clientes mensualmente!`);
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) {
      alert('¡Escribe un mensaje antes de enviar!');
      return;
    }

    let recipients = [];
    if (messageRecipient === 'all') {
      recipients = clients.map(c => c.phone).filter(Boolean);
    } else if (messageRecipient === 'pending') {
      recipients = clients.filter(c => c.balance > 0).map(c => c.phone).filter(Boolean);
    } else if (messageRecipient === 'alDia') {
      recipients = clients.filter(c => c.balance <= 0).map(c => c.phone).filter(Boolean);
    }

    if (recipients.length === 0) {
      alert('¡No hay clientes para enviar el mensaje con los filtros seleccionados!');
      return;
    }

    const confirmSend = window.confirm(`¿Estás seguro de enviar este mensaje a ${recipients.length} clientes?`);
    if (confirmSend) {
      recipients.forEach(phone => {
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;
        window.open(whatsappUrl, '_blank');
      });
      alert('¡Mensajes enviados (se abrieron nuevas pestañas de WhatsApp)!');
      setMessageText('');
    }
  };

  const renderPage = () => {
    if (currentPage === 'welcome') {
      return <WelcomeScreen onEnter={handleWelcomeEnter} />;
    }

    if (currentPage === 'publicQuery') {
      return <PublicQuery clients={clients} onNavigateToLogin={() => setCurrentPage('login')} />;
    }

    if (!isLoggedIn) {
      return <LoginForm onLogin={handleLogin} />;
    }

    const existingClientCedulas = clients.map(client => client.cedula);

    if (currentPage === 'list') {
      return (
        <ClientList
          clients={clients}
          onPay={handlePay}
          onAbono={handleAbono}
          onEdit={currentUser && currentUser.role === 'admin' ? handleEditClient : null}
          onUpdateBalance={currentUser && currentUser.role === 'admin' ? handleUpdateBalance : null}
          onDelete={currentUser && currentUser.role === 'admin' ? handleDeleteClient : null}
          onRemovePayment={currentUser && currentUser.role === 'admin' ? handleRemovePayment : null}
          onShowReceipt={handleShowReceipt}
          userRole={currentUser ? currentUser.role : null}
        />
      );
    } else if (currentPage === 'add') {
      if (currentUser && currentUser.role === 'admin') {
        return <ClientForm onAddClient={handleAddClient} onUpdateClient={handleUpdateClient} editingClient={editingClient} existingClientCedulas={existingClientCedulas} currentUser={currentUser} clientCount={clients.length} />;
      } else {
        return <p className="text-center text-red-500 text-xl mt-8">¡Acceso denegado! Solo los administradores pueden agregar o modificar clientes.</p>;
      }
    } else if (currentPage === 'delete') {
      if (currentUser && currentUser.role === 'admin') {
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Eliminar Clientes</h2>
            <p className="mb-4 text-gray-600">Selecciona un cliente de la lista para eliminarlo permanentemente.</p>
            <ClientList
              clients={clients}
              onPay={() => {}}
              onAbono={() => {}}
              onEdit={null}
              onUpdateBalance={null}
              onDelete={handleDeleteClient}
              userRole={currentUser ? currentUser.role : null}
            />
            <button
              onClick={handleDeleteAllClients}
              className="w-full mt-6 bg-red-700 text-white py-2 rounded-lg hover:bg-red-800 transition-colors font-semibold"
            >
              Eliminar TODOS los Clientes
            </button>
          </div>
        );
      } else {
        return <p className="text-center text-red-500 text-xl mt-8">¡Acceso denegado! Solo los administradores pueden eliminar clientes.</p>;
      }
    } else if (currentPage === 'settings') {
      if (currentUser && currentUser.role === 'admin') {
        return <SettingsPage currentUser={currentUser} onUpdateUser={handleUpdateUser} onCreateEmployee={handleCreateEmployee} onUpdateEmployee={handleUpdateEmployee} onDeleteEmployee={handleDeleteEmployee} onRegisterAdmin={handleRegisterAdmin} onUpdatePaymentDays={handleUpdatePaymentDays} />;
      } else {
        return <p className="text-center text-red-500 text-xl mt-8">¡Acceso denegado! Solo los administradores pueden acceder a los ajustes.</p>;
      }
    } else if (currentPage === 'excel') {
      if (currentUser && currentUser.role === 'admin') {
        return (
          <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">Exportar/Importar Clientes</h2>
            <p className="mb-4 text-gray-600 text-center">Maneja tus datos de clientes con archivos CSV.</p>
            <button
              onClick={handleExportClientsToCsv}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors mb-4"
            >
              Exportar Clientes a CSV
            </button>
            <label htmlFor="import-csv" className="block text-center bg-blue-600 text-white py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
              Importar Clientes desde CSV
              <input
                type="file"
                id="import-csv"
                accept=".csv"
                onChange={handleImportClients}
                className="hidden"
              />
            </label>
            <p className="text-sm text-gray-500 text-center mt-2">Asegúrate de que el archivo CSV tenga el formato correcto.</p>
          </div>
        );
      } else {
        return <p className="text-center text-red-500 text-xl mt-8">¡Acceso denegado! Solo los administradores pueden exportar/importar datos.</p>;
      }
    } else if (currentPage === 'bill') {
      if (currentUser && currentUser.role === 'admin') {
        return (
          <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">Facturación Mensual</h2>
            <p className="mb-4 text-gray-600 text-center">
              Haz clic para facturar la mensualidad a todos los clientes que no tengan saldo pendiente o que no hayan sido facturados este mes.
            </p>
            <button
              onClick={handleBillClientsMonthly}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Facturar Mensualidad a Clientes
            </button>
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">Información de Facturación:</h3>
              <p className="text-gray-700">Día de Facturación Configurado: <span className="font-semibold">{JSON.parse(localStorage.getItem('paymentDays'))?.billingDay || 1}</span> de cada mes.</p>
              <p className="text-gray-700">Clientes con Saldo Pendiente: <span className="font-semibold">{clients.filter(c => c.balance > 0).length}</span></p>
              <p className="text-gray-700">Clientes con Saldo a Favor: <span className="font-semibold">{clients.filter(c => c.balance < 0).length}</span></p>
              <p className="text-gray-700">Clientes al Día (Saldo 0): <span className="font-semibold">{clients.filter(c => c.balance === 0).length}</span></p>
            </div>

            {/* Sección de Envío de Mensajes */}
            <div className="mt-8 border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">Enviar Mensaje a Clientes (WhatsApp)</h3>
              <textarea
                placeholder="Escribe tu mensaje aquí..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition resize-none mb-3"
              ></textarea>
              <select
                value={messageRecipient}
                onChange={(e) => setMessageRecipient(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition mb-3"
              >
                <option value="all">Todos los Clientes</option>
                <option value="pending">Clientes con Saldo Pendiente</option>
                <option value="alDia">Clientes al Día (Saldo 0 o a Favor)</option>
              </select>
              <button
                onClick={handleSendMessage}
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                Enviar Mensaje por WhatsApp
              </button>
            </div>
          </div>
        );
      } else {
        return <p className="text-center text-red-500 text-xl mt-8">¡Acceso denegado! Solo los administradores pueden facturar clientes.</p>;
      }
    } else if (currentPage === 'assignEquipment') {
      if (currentUser && currentUser.role === 'admin') {
        return <AssignEquipment clients={clients} onAssignEquipment={handleAssignEquipment} onModifyEquipment={handleModifyEquipment} onNavigateBack={() => setCurrentPage('list')} />;
      } else {
        return <p className="text-center text-red-500 text-xl mt-8">¡Acceso denegado! Solo los administradores pueden asignar equipos.</p>;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {isLoggedIn && <LayoutHeader currentPage={currentPage} onNavigate={setCurrentPage} userRole={currentUser ? currentUser.role : null} onLogout={handleLogout} />}
      <main className="container mx-auto py-8">
        {renderPage()}
        {showReceipt && receiptData && (
          <PaymentReceipt
            client={receiptData.client}
            payment={receiptData.payment}
            onClose={() => setShowReceipt(false)}
          />
        )}
      </main>
    </div>
  );
};

export default App;