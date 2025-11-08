import { useState, useRef, useEffect } from 'react';

const FiltrosExcel = ({ onDownload, personas, onCancel }) => {
  const [filtros, setFiltros] = useState({
    startDate: '',
    endDate: '',
    usuarioId: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredPersonas, setFilteredPersonas] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredPersonas(personas);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = personas.filter(persona => 
      persona.nombre.toLowerCase().includes(term) || 
      persona.cargo.toLowerCase().includes(term)
    );
    setFilteredPersonas(filtered);
  }, [searchTerm, personas]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownload = () => {
    if (filtros.startDate && !filtros.endDate) {
      alert('Por favor selecciona también la fecha fin');
      return;
    }
    if (!filtros.startDate && filtros.endDate) {
      alert('Por favor selecciona también la fecha inicio');
      return;
    }
    
    onDownload(filtros);
  };

  const limpiarFiltros = () => {
    setFiltros({
      startDate: '',
      endDate: '',
      usuarioId: ''
    });
    setSearchTerm('');
  };

  const selectPersona = (persona) => {
    setFiltros({...filtros, usuarioId: persona.id.toString()});
    setSearchTerm(`${persona.nombre} - ${persona.cargo}`);
    setShowDropdown(false);
  };

  const clearPersona = () => {
    setFiltros({...filtros, usuarioId: ''});
    setSearchTerm('');
  };

  const handleSearchFocus = () => {
    setShowDropdown(true);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      setFiltros({...filtros, usuarioId: ''});
    }
  };

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      margin: '20px 0',
      backgroundColor: '#f9f9f9',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ marginTop: 0, color: '#333', marginBottom: '20px' }}>
        📊 Descargar Reporte de Asistencia
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '15px',
        alignItems: 'end',
        marginBottom: '15px'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
            Fecha Inicio:
          </label>
          <input 
            type="date" 
            value={filtros.startDate}
            onChange={(e) => setFiltros({...filtros, startDate: e.target.value})}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
            Fecha Fin:
          </label>
          <input 
            type="date" 
            value={filtros.endDate}
            onChange={(e) => setFiltros({...filtros, endDate: e.target.value})}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555' }}>
            Usuario:
          </label>
          
          {/* Input de búsqueda */}
          <input 
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            placeholder="Buscar usuario..."
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          />

          {/* Dropdown de resultados */}
          {showDropdown && filteredPersonas.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderTop: 'none',
              borderRadius: '0 0 4px 4px',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              {filteredPersonas.map(persona => (
                <div
                  key={persona.id}
                  onClick={() => selectPersona(persona)}
                  style={{
                    padding: '10px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  {persona.nombre} - {persona.cargo}
                </div>
              ))}
            </div>
          )}

          {/* Usuario seleccionado */}
          {filtros.usuarioId && (
            <div style={{
              marginTop: '8px',
              padding: '6px 10px',
              backgroundColor: '#e8f5e8',
              border: '1px solid #4caf50',
              borderRadius: '4px',
              fontSize: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>
                <strong>Seleccionado:</strong> {personas.find(p => p.id == filtros.usuarioId)?.nombre}
              </span>
              <button 
                onClick={clearPersona}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  color: '#ff4444',
                  padding: '0 5px'
                }}
              >
                ×
              </button>
            </div>
          )}
        </div> 
      </div> 

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button 
          onClick={limpiarFiltros}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🧹 Limpiar
        </button>
        <button 
          onClick={onCancel}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ❌ Cancelar
        </button>
        <button 
          onClick={handleDownload}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          📥 Descargar Excel
        </button>
      </div>

      {(filtros.startDate || filtros.endDate || filtros.usuarioId) && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: '#e9ecef', 
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          <strong>Filtros activos:</strong>
          {filtros.startDate && ` Desde: ${filtros.startDate}`}
          {filtros.endDate && ` Hasta: ${filtros.endDate}`}
          {filtros.usuarioId && ` Usuario: ${personas.find(p => p.id == filtros.usuarioId)?.nombre}`}
        </div>
      )}
    </div>
  );
};

export default FiltrosExcel;