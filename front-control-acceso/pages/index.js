import { useEffect, useState } from 'react';
import Head from 'next/head';
import { socketService } from '../lib/socket';
import { useSocket } from '../hooks/useSocket';
import { useCards } from '../hooks/useCards';
import { useExport } from '../hooks/useExport';
import { handleRFIDEvent } from '../utils/eventHandlers';
import StatusPanel from '../components/StatusPanel';
import EventLog from '../components/EventLog';
import CardsList from '../components/CardsList';
import PersonaSelectionPanel from '../components/PersonaSelectionPanel';
import FiltrosExcel from '../components/FiltrosExcel';

export default function Home() {
  const {
    connectionStatus,
    events,
    pendingRegistration,
    setPendingRegistration,
    addEvent,
    clearEvents
  } = useSocket();

  const {
    cards,
    loadCards,
    handleAssignCard
  } = useCards(addEvent);

  const {
    downloadExcel
  } = useExport(addEvent);

  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    const socket = socketService.connect();
    
    socket.on('rfid_event', (event) => {
      handleRFIDEvent(event, addEvent, setPendingRegistration, loadCards, cards);
    });

    return () => {
      socket.off('rfid_event');
    };
  }, [addEvent, setPendingRegistration, loadCards, cards]);

  const cancelRegistration = () => {
    setPendingRegistration(null);
    addEvent('info', 'Registro cancelado');
  };

  const handleBotonPrincipal = () => {
    if (mostrarFiltros) {
      setMostrarFiltros(false);
    } else {
      loadCards()
      setMostrarFiltros(true);
    }
  };

  return (
    <div>
      <Head>
        <title>Sistema RFID - Control de Acceso</title>
        <meta name="description" content="Sistema de control de acceso con RFID" />
      </Head>

      <div className="container">
        <div className="panel">
          <h1>🔐 Sistema de Control de Acceso RFID</h1>
          <StatusPanel status={connectionStatus} />
        </div>

        {pendingRegistration && (
          <PersonaSelectionPanel
            uid={pendingRegistration}  
            onAssign={handleAssignCard}
            onCancel={cancelRegistration}
          />
        )}

        <div className="panel">
          <h2>📝 Eventos en Tiempo Real</h2>
          <div className="controls">
            <button className="btn btn-primary" onClick={clearEvents}>
              🧹 Limpiar Eventos
            </button>
            <button className="btn btn-secondary" onClick={loadCards}>
              🔄 Actualizar Tarjetas
            </button>
            <button 
              className="btn btn-success" 
              onClick={handleBotonPrincipal}
              style={{
                backgroundColor: mostrarFiltros ? '#6c757d' : '#28a745'
              }}
            >
              {mostrarFiltros ? '❌ Ocultar Filtros' : '📊 Descargar Excel'}
            </button>
          </div>

          {mostrarFiltros && (
            <FiltrosExcel 
              onDownload={(filtros) => {
                console.log('📤 Filtros enviados:', filtros);
                downloadExcel(filtros);
                setMostrarFiltros(false);
              }}
              onCancel={() => {
                console.log('❌ Filtros cancelados');
                setMostrarFiltros(false);
              }}
              personas={cards}
            />
          )}

          <EventLog events={events} />
        </div>

        <div className="panel">
          <h2>💳 Tarjetas Registradas ({cards.length})</h2>
          <CardsList cards={cards} />
        </div>
      </div>
    </div>
  );
}