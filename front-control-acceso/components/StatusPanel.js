export default function StatusPanel({ status }) {
  const statusInfo = {
    connected: {
      text: '🟢 Conectado al sistema RFID',
      className: 'status connected'
    },
    disconnected: {
      text: '🔴 Desconectado del servidor',
      className: 'status disconnected'
    }
  };

  const currentStatus = statusInfo[status] || statusInfo.disconnected;

  return (
    <div className={currentStatus.className}>
      <span className={`status-dot ${status}`}></span>
      {currentStatus.text}
    </div>
  );
}