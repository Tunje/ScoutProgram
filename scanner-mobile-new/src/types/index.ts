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

export type RootStackParamList = {
  Login: undefined;
  GroupRegistration: { projectId: string };
  Scan: { projectId: string };
  ManualCodeEntry: { projectId: string; group: Group };
  ControlDetail: { projectId: string; controlId: string; groupId: string };
  Timer: { control: Control; group: Group; projectId: string };
};
