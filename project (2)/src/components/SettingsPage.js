import React, { useState } from 'react';
import { users } from '../mock/users';

const SettingsPage = ({ currentUser, onUpdateUser, onCreateEmployee, onUpdateEmployee, onDeleteEmployee, onRegisterAdmin, onUpdatePaymentDays }) => {
  const [profileData, setProfileData] = useState({
    name: currentUser.name || '',
    lastName: currentUser.lastName || '',
    phone: currentUser.phone || '',
    email: currentUser.email || '',
  });
  const [employeeData, setEmployeeData] = useState({
    name: '',
    lastName: '',
    password: '',
    phone: '',
    email: '',
    permissions: {
      canViewClients: true, canAddClients: false, canEditClients: false, canDeleteClients: false,
      canUpdateBalance: false, canRemovePayments: false, canExportImport: false, canBillMonthly: false, canMakePayments: true,
    },
  });
  const [adminRegisterData, setAdminRegisterData] = useState({
    name: '',
    lastName: '',
    password: '',
    phone: '',
    email: '',
  });
  const [paymentDaysData, setPaymentDaysData] = useState(() => {
    const storedPaymentDays = JSON.parse(localStorage.getItem('paymentDays'));
    return storedPaymentDays || {
      nextPaymentDueDay: 5,
      suspensionDay: 10,
      billingDay: 1,
    };
  });
  const [monthlyFeeOptions, setMonthlyFeeOptions] = useState(() => {
    const storedOptions = JSON.parse(localStorage.getItem('monthlyFeeOptions'));
    return storedOptions || {
      A: 60000, B: 70000, C: 80000, D: 90000, E: 100000,
      F: 110000, G: 120000, H: 130000, I: 140000, J: 150000,
    };
  });
  const [backupEmail, setBackupEmail] = useState(() => localStorage.getItem('backupEmail') || ''); // Nuevo estado para el email de respaldo

  const [profileMessage, setProfileMessage] = useState('');
  const [employeeMessage, setEmployeeMessage] = useState('');
  const [adminRegisterMessage, setAdminRegisterMessage] = useState('');
  const [paymentDaysMessage, setPaymentDaysMessage] = useState('');
  const [feeOptionsMessage, setFeeOptionsMessage] = useState('');
  const [backupEmailMessage, setBackupEmailMessage] = useState(''); // Mensaje para el email de respaldo
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [adminLoginPassword, setAdminLoginPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

  useState(() => {
    if (currentUser.role === 'admin') {
      setHasAdminAccess(true);
    }
  }, [currentUser]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    onUpdateUser({ ...currentUser, ...profileData });
    setProfileMessage('¡Información de perfil actualizada con éxito!');
    setTimeout(() => setProfileMessage(''), 3000);
  };

  const handleEmployeeChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleEmployeePermissionChange = (e) => {
    const { name, checked } = e.target;
    setEmployeeData((prevData) => ({
      ...prevData,
      permissions: {
        ...prevData.permissions,
        [name]: checked,
      },
    }));
  };

  const handleCreateEmployeeSubmit = (e) => {
    e.preventDefault();
    if (!employeeData.name || !employeeData.lastName || !employeeData.password || !employeeData.phone || !employeeData.email) {
      setEmployeeMessage('¡Por favor, completa todos los campos para crear un empleado!');
      return;
    }
    const newEmployee = {
      username: employeeData.email.split('@')[0],
      password: employeeData.password,
      role: 'cashier',
      name: employeeData.name,
      lastName: employeeData.lastName,
      phone: employeeData.phone,
      email: employeeData.email,
      permissions: employeeData.permissions,
    };
    onCreateEmployee(newEmployee);
    setEmployeeMessage(`¡Empleado ${newEmployee.name} ${newEmployee.lastName} creado con éxito!`);
    setEmployeeData({
      name: '', lastName: '', password: '', phone: '', email: '',
      permissions: { canViewClients: true, canAddClients: false, canEditClients: false, canDeleteClients: false, canUpdateBalance: false, canRemovePayments: false, canExportImport: false, canBillMonthly: false, canMakePayments: true, },
    });
    setTimeout(() => setEmployeeMessage(''), 3000);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setEmployeeData({
      name: employee.name,
      lastName: employee.lastName,
      password: employee.password,
      phone: employee.phone,
      email: employee.email,
      permissions: employee.permissions || { canViewClients: true, canAddClients: false, canEditClients: false, canDeleteClients: false, canUpdateBalance: false, canRemovePayments: false, canExportImport: false, canBillMonthly: false, canMakePayments: true, },
    });
  };

  const handleUpdateEmployeeSubmit = (e) => {
    e.preventDefault();
    if (!employeeData.name || !employeeData.lastName || !employeeData.password || !employeeData.phone || !employeeData.email) {
      setEmployeeMessage('¡Por favor, completa todos los campos para actualizar el empleado!');
      return;
    }
    const updatedEmployee = {
      ...editingEmployee,
      name: employeeData.name,
      lastName: employeeData.lastName,
      password: employeeData.password,
      phone: employeeData.phone,
      email: employeeData.email,
      permissions: employeeData.permissions,
    };
    onUpdateEmployee(updatedEmployee);
    setEmployeeMessage(`¡Empleado ${updatedEmployee.name} ${updatedEmployee.lastName} actualizado con éxito!`);
    setEditingEmployee(null);
    setEmployeeData({
      name: '', lastName: '', password: '', phone: '', email: '',
      permissions: { canViewClients: true, canAddClients: false, canEditClients: false, canDeleteClients: false, canUpdateBalance: false, canRemovePayments: false, canExportImport: false, canBillMonthly: false, canMakePayments: true, },
    });
    setTimeout(() => setEmployeeMessage(''), 3000);
  };

  const handleDeleteEmployee = (employeeId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar a este empleado? ¡Esta acción no se puede deshacer!')) {
      onDeleteEmployee(employeeId);
      setEmployeeMessage('¡Empleado eliminado con éxito!');
      setTimeout(() => setEmployeeMessage(''), 3000);
    }
  };

  const handleAdminRegisterChange = (e) => {
    const { name, value } = e.target;
    setAdminRegisterData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleAdminRegisterSubmit = (e) => {
    e.preventDefault();
    if (!adminRegisterData.name || !adminRegisterData.lastName || !adminRegisterData.password || !adminRegisterData.phone || !adminRegisterData.email) {
      setAdminRegisterMessage('¡Por favor, completa todos los campos para registrar un administrador!');
      return;
    }
    const newAdmin = {
      username: adminRegisterData.email.split('@')[0],
      password: adminRegisterData.password,
      role: 'admin',
      name: adminRegisterData.name,
      lastName: adminRegisterData.lastName,
      phone: adminRegisterData.phone,
      email: adminRegisterData.email,
      permissions: {
        canViewClients: true, canAddClients: true, canEditClients: true, canDeleteClients: true,
        canUpdateBalance: true, canRemovePayments: true, canExportImport: true, canBillMonthly: true, canMakePayments: true,
      },
    };
    onRegisterAdmin(newAdmin);
    setAdminRegisterMessage(`¡Administrador ${newAdmin.name} ${newAdmin.lastName} creado con éxito!`);
    setAdminRegisterData({ name: '', lastName: '', password: '', phone: '', email: '' });
    setTimeout(() => setAdminRegisterMessage(''), 3000);
  };

  const handleEditAdmin = (adminUser) => {
    setEditingAdmin(adminUser);
    setAdminRegisterData({
      name: adminUser.name,
      lastName: adminUser.lastName,
      password: adminUser.password,
      phone: adminUser.phone,
      email: adminUser.email,
    });
  };

  const handleUpdateAdminSubmit = (e) => {
    e.preventDefault();
    if (!adminRegisterData.name || !adminRegisterData.lastName || !adminRegisterData.password || !adminRegisterData.phone || !adminRegisterData.email) {
      setAdminRegisterMessage('¡Por favor, completa todos los campos para actualizar el administrador!');
      return;
    }
    const updatedAdmin = {
      ...editingAdmin,
      name: adminRegisterData.name,
      lastName: adminRegisterData.lastName,
      password: adminRegisterData.password,
      phone: adminRegisterData.phone,
      email: adminRegisterData.email,
      permissions: {
        canViewClients: true, canAddClients: true, canEditClients: true, canDeleteClients: true,
        canUpdateBalance: true, canRemovePayments: true, canExportImport: true, canBillMonthly: true, canMakePayments: true,
      },
    };
    onUpdateEmployee(updatedAdmin);
    setAdminRegisterMessage(`¡Administrador ${updatedAdmin.name} ${updatedAdmin.lastName} actualizado con éxito!`);
    setEditingAdmin(null);
    setAdminRegisterData({ name: '', lastName: '', password: '', phone: '', email: '' });
    setTimeout(() => setAdminRegisterMessage(''), 3000);
  };

  const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    if (adminLoginPassword === currentUser.password) {
      setHasAdminAccess(true);
      setAdminLoginError('');
    } else {
      setAdminLoginError('Contraseña incorrecta. ¡Intenta de nuevo!');
    }
  };

  const handlePaymentDaysChange = (e) => {
    const { name, value } = e.target;
    setPaymentDaysData((prevData) => ({ ...prevData, [name]: parseInt(value) || 0 }));
  };

  const handlePaymentDaysSubmit = (e) => {
    e.preventDefault();
    if (paymentDaysData.nextPaymentDueDay <= 0 || paymentDaysData.nextPaymentDueDay > 31 ||
        paymentDaysData.suspensionDay <= 0 || paymentDaysData.suspensionDay > 31 ||
        paymentDaysData.billingDay <= 0 || paymentDaysData.billingDay > 30 ||
        paymentDaysData.suspensionDay <= paymentDaysData.nextPaymentDueDay) {
      setPaymentDaysMessage('¡Días de pago inválidos! Asegúrate que el día de suspensión sea mayor al día límite de pago y estén entre 1 y 30/31.');
      return;
    }
    onUpdatePaymentDays(paymentDaysData);
    setPaymentDaysMessage('¡Días de cobro actualizados con éxito!');
    setTimeout(() => setPaymentDaysMessage(''), 3000);
  };

  const handleMonthlyFeeOptionChange = (key, value) => {
    setMonthlyFeeOptions(prevOptions => ({
      ...prevOptions,
      [key]: parseFloat(value) || 0
    }));
  };

  const handleMonthlyFeeOptionsSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('monthlyFeeOptions', JSON.stringify(monthlyFeeOptions));
    setFeeOptionsMessage('¡Tarifas de mensualidad actualizadas con éxito!');
    setTimeout(() => setFeeOptionsMessage(''), 3000);
  };

  const handleBackupEmailChange = (e) => {
    setBackupEmail(e.target.value);
  };

  const handleBackupEmailSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('backupEmail', backupEmail);
    setBackupEmailMessage('¡Correo electrónico de respaldo guardado con éxito!');
    setTimeout(() => setBackupEmailMessage(''), 3000);
  };

  if (currentUser.role === 'admin' && !hasAdminAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleAdminLoginSubmit} className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-4 text-center">Acceso a Ajustes de Administrador</h2>
          <p className="text-gray-600 text-center mb-4">Ingresa tu contraseña de administrador para continuar.</p>
          <input
            type="password"
            placeholder="Contraseña de Administrador"
            value={adminLoginPassword}
            onChange={(e) => setAdminLoginPassword(e.target.value)}
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
            required
          />
          {adminLoginError && <p className="text-red-500 text-center mb-4">{adminLoginError}</p>}
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
            Acceder a Ajustes
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Ajustes</h2>

      {/* Mi Cuenta - Información del Perfil */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-2xl mx-auto">
        <h3 className="text-2xl font-semibold mb-4 text-gray-800">Mi Cuenta - Información del Perfil</h3>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Nombre:</label>
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleProfileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Apellido:</label>
            <input
              type="text"
              name="lastName"
              value={profileData.lastName}
              onChange={handleProfileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Número de Celular:</label>
            <input
              type="text"
              name="phone"
              value={profileData.phone}
              onChange={handleProfileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Correo Electrónico:</label>
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleProfileChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Estado (Rol):</label>
            <input
              type="text"
              value={currentUser.role === 'admin' ? 'Administrador' : 'Caja'}
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
              disabled
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Guardar Cambios del Perfil
          </button>
          {profileMessage && <p className="text-green-600 text-center mt-2">{profileMessage}</p>}
        </form>
      </div>

      {/* Modificar Días de Cobro (Solo para Administradores) */}
      {currentUser.role === 'admin' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Modificar Días de Cobro</h3>
          <form onSubmit={handlePaymentDaysSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Día Límite de Pago (1-31):</label>
              <input
                type="number"
                name="nextPaymentDueDay"
                value={paymentDaysData.nextPaymentDueDay}
                onChange={handlePaymentDaysChange}
                min="1"
                max="31"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Día de Suspensión (1-31):</label>
              <input
                type="number"
                name="suspensionDay"
                value={paymentDaysData.suspensionDay}
                onChange={handlePaymentDaysChange}
                min="1"
                max="31"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Día de Facturación Mensual (1-30):</label>
              <input
                type="number"
                name="billingDay"
                value={paymentDaysData.billingDay}
                onChange={handlePaymentDaysChange}
                min="1"
                max="30"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Guardar Días de Cobro
            </button>
            {paymentDaysMessage && <p className="text-green-600 text-center mt-2">{paymentDaysMessage}</p>}
          </form>
        </div>
      )}

      {/* Modificar Tarifas de Mensualidad (Solo para Administradores) */}
      {currentUser.role === 'admin' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Modificar Tarifas de Mensualidad</h3>
          <form onSubmit={handleMonthlyFeeOptionsSubmit} className="space-y-4">
            {Object.keys(monthlyFeeOptions).map(key => (
              <div key={key}>
                <label className="block text-gray-700 text-sm font-bold mb-2">Tarifa {key}:</label>
                <input
                  type="number"
                  name={key}
                  value={monthlyFeeOptions[key]}
                  onChange={(e) => handleMonthlyFeeOptionChange(key, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                  required
                />
              </div>
            ))}
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Guardar Tarifas
            </button>
            {feeOptionsMessage && <p className="text-green-600 text-center mt-2">{feeOptionsMessage}</p>}
          </form>
        </div>
      )}

      {/* Configurar Correo de Respaldo (Solo para Administradores) */}
      {currentUser.role === 'admin' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Configurar Correo de Respaldo</h3>
          <form onSubmit={handleBackupEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Correo Electrónico para Respaldo:</label>
              <input
                type="email"
                name="backupEmail"
                value={backupEmail}
                onChange={handleBackupEmailChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                placeholder="ejemplo@dominio.com"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Guardar Correo de Respaldo
            </button>
            {backupEmailMessage && <p className="text-green-600 text-center mt-2">{backupEmailMessage}</p>}
          </form>
        </div>
      )}

      {/* Crear/Modificar Empleado (Solo para Administradores) */}
      {currentUser.role === 'admin' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">
            {editingEmployee ? 'Modificar Empleado' : 'Crear Empleado (Caja)'}
          </h3>
          <form onSubmit={editingEmployee ? handleUpdateEmployeeSubmit : handleCreateEmployeeSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Nombre:</label>
              <input
                type="text"
                name="name"
                value={employeeData.name}
                onChange={handleEmployeeChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Apellido:</label>
              <input
                type="text"
                name="lastName"
                value={employeeData.lastName}
                onChange={handleEmployeeChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña:</label>
              <input
                type="password"
                name="password"
                value={employeeData.password}
                onChange={handleEmployeeChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Número de Celular:</label>
              <input
                type="text"
                name="phone"
                value={employeeData.phone}
                onChange={handleEmployeeChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Correo Electrónico:</label>
              <input
                type="email"
                name="email"
                value={employeeData.email}
                onChange={handleEmployeeChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                required
              />
            </div>
            {/* Opciones de Permisos para Empleados de Caja */}
            <div className="border border-gray-300 rounded-lg p-4 space-y-2">
              <h4 className="text-md font-semibold mb-2">Permisos del Empleado:</h4>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="canViewClients"
                  checked={employeeData.permissions?.canViewClients || false}
                  onChange={handleEmployeePermissionChange}
                  className="form-checkbox h-5 w-5 text-black"
                />
                <span className="ml-2 text-gray-700">Ver Clientes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="canMakePayments"
                  checked={employeeData.permissions?.canMakePayments || false}
                  onChange={handleEmployeePermissionChange}
                  className="form-checkbox h-5 w-5 text-black"
                />
                <span className="ml-2 text-gray-700">Realizar Pagos</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="canAddClients"
                  checked={employeeData.permissions?.canAddClients || false}
                  onChange={handleEmployeePermissionChange}
                  className="form-checkbox h-5 w-5 text-black"
                />
                <span className="ml-2 text-gray-700">Registrar Clientes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="canEditClients"
                  checked={employeeData.permissions?.canEditClients || false}
                  onChange={handleEmployeePermissionChange}
                  className="form-checkbox h-5 w-5 text-black"
                />
                <span className="ml-2 text-gray-700">Modificar Clientes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="canDeleteClients"
                  checked={employeeData.permissions?.canDeleteClients || false}
                  onChange={handleEmployeePermissionChange}
                  className="form-checkbox h-5 w-5 text-black"
                />
                <span className="ml-2 text-gray-700">Eliminar Clientes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="canUpdateBalance"
                  checked={employeeData.permissions?.canUpdateBalance || false}
                  onChange={handleEmployeePermissionChange}
                  className="form-checkbox h-5 w-5 text-black"
                />
                <span className="ml-2 text-gray-700">Modificar Saldo</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="canRemovePayments"
                  checked={employeeData.permissions?.canRemovePayments || false}
                  onChange={handleEmployeePermissionChange}
                  className="form-checkbox h-5 w-5 text-black"
                />
                <span className="ml-2 text-gray-700">Eliminar Pagos</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="canExportImport"
                  checked={employeeData.permissions?.canExportImport || false}
                  onChange={handleEmployeePermissionChange}
                  className="form-checkbox h-5 w-5 text-black"
                />
                <span className="ml-2 text-gray-700">Exportar/Importar Datos</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="canBillMonthly"
                  checked={employeeData.permissions?.canBillMonthly || false}
                  onChange={handleEmployeePermissionChange}
                  className="form-checkbox h-5 w-5 text-black"
                />
                <span className="ml-2 text-gray-700">Facturar Mensualmente</span>
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              {editingEmployee ? 'Guardar Cambios del Empleado' : 'Crear Empleado'}
            </button>
            {editingEmployee && (
              <button
                type="button"
                onClick={() => {
                  setEditingEmployee(null);
                  setEmployeeData({ name: '', lastName: '', password: '', phone: '', email: '', permissions: { canViewClients: true, canAddClients: false, canEditClients: false, canDeleteClients: false, canUpdateBalance: false, canRemovePayments: false, canExportImport: false, canBillMonthly: false, canMakePayments: true, }, });
                }}
                className="w-full bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition-colors mt-2"
              >
                Cancelar Edición
              </button>
            )}
            {employeeMessage && <p className="text-green-600 text-center mt-2">{employeeMessage}</p>}
          </form>
        </div>
      )}

      {/* Registrar/Modificar Administrador (Solo para Administradores) */}
      {currentUser.role === 'admin' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-2xl mx-auto">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">
            {editingAdmin ? 'Modificar Administrador' : 'Registrar Nuevo Administrador'}
          </h3>
          <form onSubmit={editingAdmin ? handleUpdateAdminSubmit : handleAdminRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Nombre:</label>
              <input
                type="text"
                name="name"
                value={adminRegisterData.name}
                onChange={handleAdminRegisterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Apellido:</label>
              <input
                type="text"
                name="lastName"
                value={adminRegisterData.lastName}
                onChange={handleAdminRegisterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña:</label>
              <input
                type="password"
                name="password"
                value={adminRegisterData.password}
                onChange={handleAdminRegisterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Número de Celular:</label>
              <input
                type="text"
                name="phone"
                value={adminRegisterData.phone}
                onChange={handleAdminRegisterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Correo Electrónico (será el usuario):</label>
              <input
                type="email"
                name="email"
                value={adminRegisterData.email}
                onChange={handleAdminRegisterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              {editingAdmin ? 'Guardar Cambios del Administrador' : 'Registrar Administrador'}
            </button>
            {editingAdmin && (
              <button
                type="button"
                onClick={() => {
                  setEditingAdmin(null);
                  setAdminRegisterData({ name: '', lastName: '', password: '', phone: '', email: '' });
                }}
                className="w-full bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition-colors mt-2"
              >
                Cancelar Edición
              </button>
            )}
            {adminRegisterMessage && <p className="text-green-600 text-center mt-2">{adminRegisterMessage}</p>}
          </form>
        </div>
      )}

      {/* Información de Empleados Existentes (Solo para Administradores) */}
      {currentUser.role === 'admin' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-2xl mx-auto mt-8">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Información de Empleados</h3>
          {users.filter(user => user.role === 'cashier').length === 0 ? (
            <p className="text-gray-600">No hay empleados registrados aún.</p>
          ) : (
            <ul className="space-y-4">
              {users.filter(user => user.role === 'cashier').map((employee, index) => (
                <li key={index} className="border border-gray-200 p-4 rounded-lg bg-gray-50 flex justify-between items-center">
                  <div>
                    <p><span className="font-semibold">Usuario:</span> {employee.username}</p>
                    <p><span className="font-semibold">Nombre:</span> {employee.name} {employee.lastName}</p>
                    <p><span className="font-semibold">Celular:</span> {employee.phone}</p>
                    <p><span className="font-semibold">Correo:</span> {employee.email}</p>
                    <p><span className="font-semibold">Rol:</span> Caja</p>
                    <p className="text-xs text-gray-500 mt-1">Permisos: {Object.keys(employee.permissions || {}).filter(key => employee.permissions[key]).map(key => key.replace('can', '')).join(', ')}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditEmployee(employee)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors text-sm"
                    >
                      Modificar
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(employee.username)}
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Información de Administradores Existentes (Solo para Administradores) */}
      {currentUser.role === 'admin' && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-2xl mx-auto mt-8">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Información de Administradores</h3>
          {users.filter(user => user.role === 'admin').length === 0 ? (
            <p className="text-gray-600">No hay administradores registrados aún.</p>
          ) : (
            <ul className="space-y-4">
              {users.filter(user => user.role === 'admin').map((adminUser, index) => (
                <li key={index} className="border border-gray-200 p-4 rounded-lg bg-gray-50 flex justify-between items-center">
                  <div>
                    <p><span className="font-semibold">Usuario:</span> {adminUser.username}</p>
                    <p><span className="font-semibold">Nombre:</span> {adminUser.name} {adminUser.lastName}</p>
                    <p><span className="font-semibold">Celular:</span> {adminUser.phone}</p>
                    <p><span className="font-semibold">Correo:</span> {adminUser.email}</p>
                    <p><span className="font-semibold">Rol:</span> Administrador</p>
                  </div>
                  <div className="flex space-x-2">
                    {adminUser.username !== currentUser.username && (
                      <button
                        onClick={() => handleEditAdmin(adminUser)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors text-sm"
                      >
                        Modificar
                      </button>
                    )}
                    {adminUser.username !== currentUser.username && (
                      <button
                        onClick={() => handleDeleteEmployee(adminUser.username)}
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors text-sm"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SettingsPage;