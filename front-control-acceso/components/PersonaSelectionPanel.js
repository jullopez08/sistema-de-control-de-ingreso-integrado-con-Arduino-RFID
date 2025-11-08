import { useState, useEffect } from 'react';

export default function PersonaSelectionPanel({ uid, onAssign, onCancel }) {
  const [personas, setPersonas] = useState([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPersonasSinTarjeta();
  }, []);

  const loadPersonasSinTarjeta = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/personas/sin-tarjeta');
      const data = await response.json();
      setPersonas(data);
    } catch (error) {
      console.error('Error cargando personas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = () => {
    if (!selectedPersonaId) {
      alert('Por favor seleccione una persona');
      return;
    }
    onAssign(uid, parseInt(selectedPersonaId));
  };

  if (loading) {
    return (
      <div className="panel registration-panel">
        <h2>Asignar Tarjeta a Persona</h2>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Cargando personas disponibles...
        </div>
      </div>
    );
  }

  return (
    <div className="panel registration-panel">
      <h2>Asignar Tarjeta a Persona</h2>
      
      <div style={{ 
        background: 'white', 
        padding: '15px', 
        borderRadius: '5px', 
        marginBottom: '15px' 
      }}>
        <p><strong>UID de la Tarjeta:</strong> {uid}</p>
        <p><strong>Seleccione la persona:</strong></p>
      </div>

      <div className="form-group">
        <select
          value={selectedPersonaId}
          onChange={(e) => setSelectedPersonaId(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '2px solid #e0e0e0',
            borderRadius: '5px',
            fontSize: '14px'
          }}
        >
          <option value="">-- Seleccione una persona --</option>
          {personas.map(persona => (
            <option key={persona.id} value={persona.id}>
              {persona.nombre} - {persona.cargo} ({persona.tipo})
            </option>
          ))}
        </select>
      </div>

      {personas.length === 0 && (
        <div style={{ 
          background: '#fff3cd', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '15px',
          border: '1px solid #ffeaa7'
        }}>
          No hay personas disponibles sin tarjeta asignada.
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          className="btn btn-success" 
          onClick={handleAssign}
          disabled={!selectedPersonaId || personas.length === 0}
        >
          Asignar Tarjeta
        </button>
        <button className="btn btn-danger" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
}