export default function EventLog({ events }) {
  return (
    <div className="events-log">
      {events.length === 0 ? (
        <div className="event-item event-info">
          [00:00:00] Esperando eventos del RFID...
        </div>
      ) : (
        events.map(event => (
          <div key={event.id} className={`event-item event-${event.type}`}>
            [{event.timestamp}] { typeof event.message === 'string' ? event.message : JSON.stringify(event.message)}
          </div>
        ))
      )}
    </div>
  );
}
