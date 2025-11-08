export interface Persona {
  id: number;
  nombre: string;
  cargo: string;
  tipo: 'docente' | 'administrativo';
  tarjetaAsignada: string | null;
}

export interface AsignarTarjetaDto {
  personaId: number;
  uid: string;
}