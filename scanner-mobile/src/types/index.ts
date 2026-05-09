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

export interface PointCategory {
  name: string;
  maxPoints: number;
}

export interface Control {
  id: string;
  projectId: string;
  name: string;
  controlCode: string;
  displayText: string;
  hasPoints: boolean;
  pointsValue?: number;
  pointCategories?: PointCategory[];
  hasTimer: boolean;
  timerConfig?: {
    durationMinutes: number;
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
    action: string;
    timestamp: Timestamp;
  };
}

export type RootStackParamList = {
  Login: undefined;
  ProjectSelect: undefined;
  GroupRegistration: { projectId: string };
  Scan: { projectId: string };
  ManualCodeEntry: { projectId: string; group: Group };
  Timer: { control: Control; group: Group; projectId: string };
};
