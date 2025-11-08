export const buscarPersonaPorEvento = async (mensaje, cards, addEvent) => {
  try {
    if (typeof mensaje !== 'string') {
      return;
    }

    const patrones = [
      /UID:([a-f0-9]+)/i,
      /([a-f0-9]{8})/i,
      /tarjeta[:\s]+([a-f0-9]+)/i,
    ];
    
    let uidExtraido = null;
    
    for (const patron of patrones) {
      const match = mensaje.match(patron);
      if (match && match[1]) {
        uidExtraido = match[1].toLowerCase();
        break;
      }
    }
    
    if (!uidExtraido && cards && cards.length > 0) {
      for (const card of cards) {
        if (card && card.name && typeof card.name === 'string') {
          const mensajeLower = mensaje.toLowerCase();
          const cardNameLower = card.name.toLowerCase();
          
          if (mensajeLower.includes(cardNameLower) || 
              cardNameLower.includes(mensajeLower)) {
            uidExtraido = card.uid;
            break;
          }
        }
      }
    }
    
    if (uidExtraido) {
      const response = await fetch(`http://localhost:3000/api/personas/por-tarjeta/${uidExtraido}`);
      
      if (response.ok) {
        const result = await response.json();
        
        if (result) {
          addEvent('persona_detectada', 
            `${result.nombre} - ${result.cargo} (${result.tipo || 'Usuario'})`
          );
        } else {
          addEvent('info', 'Tarjeta registrada en sistema');
        }
      } else {
        addEvent('error', 'Error al buscar persona por tarjeta');
      }
    } else if (mensaje.includes('Acceso') || mensaje.includes('Bienvenido')) {
      addEvent('access_info', mensaje);
    }
  } catch (error) {
    console.error('Error en buscarPersonaPorEvento:', error);
    addEvent('error', 'Error procesando evento RFID');
  }
};

export const handleRFIDEvent = (event, addEvent, setPendingRegistration, loadCards, cards) => {
  addEvent(event.type, event.message);

  if (event.type === 'double') {
    const uid = (typeof event.message === 'string') ? event.message : event.message.uid;
    setPendingRegistration(uid);
  } else if (event.type === 'success') {
    setPendingRegistration(null);
    loadCards();
  } else if (event.type === 'access') {
    buscarPersonaPorEvento(event.message, cards, addEvent);
  }
};