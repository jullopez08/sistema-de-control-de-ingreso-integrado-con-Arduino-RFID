import { useState } from 'react';

export default function RegistrationPanel({ uid, onRegister, onCancel }) {
  const [userName, setUserName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      onRegister(uid, userName.trim());
      setUserName('');
    } else {
      alert('Por favor ingrese un nombre para el usuario');
    }
  };

  return (
    <div className="panel registration-panel">
      <h2>🎯 Registrar Nueva Tarjeta</h2>
      
      <div style={{ 
        background: 'white', 
        padding: '15px', 
        borderRadius: '5px', 
        marginBottom: '15px' 
      }}>
        <p><strong>UID de la Tarjeta:</strong> {uid}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="userName">Nombre del Usuario:</label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Ej: Juan Pérez"
            maxLength={20}
            autoFocus
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button type="submit" className="btn btn-success">
            ✅ Registrar
          </button>
          <button type="button" className="btn btn-danger" onClick={onCancel}>
            ❌ Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}