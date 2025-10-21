// src/components/LoginModal.jsx

import React, { useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: {
    _id: string;
    firstName: string;
    email: string;
    firebaseUID: string;
  }) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Lógica de autenticación simulada
    if (isRegister) {
      console.log('Registro intentado:', email, name);
      // Aquí iría la llamada a tu API de registro
      alert('Registro simulado exitoso. Por favor, inicia sesión.');
      setIsRegister(false);
    } else {
      console.log('Login intentado:', email);
      // Aquí iría la llamada a tu API de login

      // Simulación de éxito de login (usando los datos de Carlos)
      const mockUser = {
        _id: '68d57caf8bc7ee3421bdbca9',
        firstName: 'Carlos',
        email: email,
        firebaseUID: 'OPtAmEj9ztPdzqXipWEWVaPZK9B3',
      };

      onLogin(mockUser);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-sm w-full border-t-4 border-yellow-500">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          {isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-900 border-gray-600 text-white shadow-sm p-3"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-900 border-gray-600 text-white shadow-sm p-3"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-900 border-gray-600 text-white shadow-sm p-3"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-6 font-bold rounded-lg text-black bg-yellow-500 hover:bg-yellow-400 transition shadow-lg"
          >
            {isRegister ? 'Registrarse' : 'Entrar'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm text-gray-400 hover:text-yellow-500 transition"
          >
            {isRegister
              ? '¿Ya tienes cuenta? Inicia Sesión'
              : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold"
          title="Cerrar"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
