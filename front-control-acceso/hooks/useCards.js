import { useState, useCallback } from 'react';

export const useCards = (addEvent) => {
  const [cards, setCards] = useState([]);

  const loadCards = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/api/personas/tarjetas-registradas');
      const data = await response.json();
      
      if (data.personas) {
        setCards(data.personas || []);
      } else {
        addEvent('error', 'Error cargando tarjetas');
      }
    } catch (error) {
      addEvent('error', 'Error de conexión al cargar tarjetas');
    }
  }, [addEvent]);

  const handleAssignCard = useCallback(async (uid, personaId) => {
    try {
      const response = await fetch('http://localhost:3000/api/personas/asignar-tarjeta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid, personaId })
      });

      const result = await response.json();
      
      if (result.success) {
        addEvent('success', 'Tarjeta asignada correctamente');
        loadCards();
        return true;
      } else {
        addEvent('error', `Error: ${result.message}`);
        return false;
      }
    } catch (error) {
      addEvent('error', 'Error de conexión al asignar tarjeta');
      return false;
    }
  }, [addEvent, loadCards]);

  return {
    cards,
    loadCards,
    handleAssignCard
  };
};
