import { useState, useEffect, useCallback } from 'react';
import { socketService } from '../lib/socket';

export const useSocket = () => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [events, setEvents] = useState([]);
  const [pendingRegistration, setPendingRegistration] = useState(null);

  const addEvent = useCallback((type, message) => {
    const newEvent = {
      type,
      message,
      timestamp: new Date().toLocaleTimeString(),
      id: Date.now() + Math.random()
    };
    
    setEvents(prev => [newEvent, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    const socket = socketService.connect();

    const handleRegistrationPending = (data) => {
      let uid;
      if (typeof data === 'string') {
        uid = data;
      } else if (data && data.uid) {
        uid = typeof data.uid === 'string' ? data.uid : data.uid.uid || JSON.stringify(data);
      } else {
        uid = JSON.stringify(data);
      }
      
      setPendingRegistration(uid);
      addEvent('info', 'Tarjeta lista para asignar');
    };

    socket.on('connect', () => {
      setConnectionStatus('connected');
      addEvent('info', 'Conectado al sistema RFID - Listo para escanear tarjetas');
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
      addEvent('error', 'Desconectado del servidor');
    });

    
    socket.on('registration_pending', handleRegistrationPending);
    socket.on('system_status', (status) => addEvent('info', status.message));
    socket.on('system_error', (error) => addEvent('error', `Error: ${error.message}`));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('registration_pending');
      socket.off('system_status');
      socket.off('system_error');
    };
  }, [addEvent]);

  const clearEvents = useCallback(() => {
    setEvents([]);
    addEvent('info', 'Log de eventos limpiado');
  }, [addEvent]);

  return {
    connectionStatus,
    events,
    pendingRegistration,
    setPendingRegistration,
    addEvent,
    clearEvents
  };
};