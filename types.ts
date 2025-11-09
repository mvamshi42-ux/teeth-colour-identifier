export interface Patient {
  id: string;
  name: string;
  notes?: string;
}

export interface HistoryRecord {
  id: string;
  patientId: string;
  imageBase64: string;
  analysis: string;
  shade: string;
  timestamp: number;
  visitDate: string;
}

export type View = 'DASHBOARD' | 'PATIENT_LIST' | 'PATIENT_DETAIL' | 'SINGLE_ANALYSIS' | 'COMPARE_ANALYSIS' | 'HISTORY_COMPARISON';