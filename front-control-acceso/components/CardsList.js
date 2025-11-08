export default function CardsList({ cards }) {
  return (
    <div className="cards-list">
      {cards.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>
          No hay tarjetas registradas
        </div>
      ) : (
        cards.map((card, index) => (
          <div key={index} className="card-item">
            <span className="card-uid">{card.tarjetaAsignada}</span>
            <span className="card-name">{card.nombre}</span>
          </div>
        ))
      )}
    </div>
  );
}