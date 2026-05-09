import { Timestamp } from 'firebase/firestore';

export interface Project {
  id: string;
  name: string;
  projectCode: string;
  createdAt: Timestamp;
}

export interface Group {
  id: string;
  projectId: string;
  name: string;
  kår: string;
  registrationCode: string;
  isClaimed: boolean;
  color: string;
  createdAt: Timestamp;
}

export interface Control {
  id: string;
  projectId: string;
  name: string;
  controlCode: string;
  displayText: string;
  hasPoints: boolean;
  pointsValue?: number;
  hasTimer: boolean;
  timerConfig?: {
    durationMinutes: number;
  };
  createdAt: Timestamp;
}

export type RootStackParamList = {
  Login: undefined;
  GroupRegistration: { projectId: string };
  Scan: { projectId: string };
  ManualCodeEntry: { projectId: string; group: Group };
  Timer: { control: Control; group: Group; projectId: string };
};
