export interface RFIDEvent {
  type: string;
  message: string;
  timestamp: Date;
  raw: string;
}

export interface SerialPortConfig {
  port: string;
  baudRate: number;
}

export interface Card {
  uid: string;
  name: string;
}