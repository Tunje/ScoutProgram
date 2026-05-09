import { Timestamp } from 'firebase/firestore';

export interface Project {
  id: string;
  name: string;
  createdAt: Timestamp;
  status: 'active' | 'archived';
}

export interface Group {
  id: string;
  projectId: string;
  name: string;
  kår: string;
  registrationCode: string;
  isClaimed: boolean;
  claimedBy?: string;
  claimedAt?: Timestamp;
  color?: string;
  createdAt: Timestamp;
}

export type ControlType = 'timer' | 'points' | 'display';

export interface Control {
  id: string;
  projectId: string;
  name: string;
  type: ControlType;
  displayText: string;
  pointsValue?: number;
  timerConfig?: {
    type: 'start' | 'stop' | 'checkpoint';
  };
  createdAt: Timestamp;
}

export interface Scan {
  id: string;
  projectId: string;
  groupId: string;
  controlId: string;
  scannedBy: string;
  scannedAt: Timestamp;
  pointsAwarded?: number;
  timerData?: {
    action: 'start' | 'stop' | 'checkpoint';
    timestamp: Timestamp;
  };
}

export interface TimerState {
  groupId: string;
  controlId: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  checkpoints: Timestamp[];
}
