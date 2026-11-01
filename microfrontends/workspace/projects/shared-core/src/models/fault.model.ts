export interface FaultAlarm {
  id: string;
  entity: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'WARNING';
  message: string;
  timestamp: string;
  ack: boolean;
}

