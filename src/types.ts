export type ScreenType = 'landing' | 'map' | 'report' | 'tracking' | 'signin' | 'ops';

export type HazardSeverity = 'minor' | 'moderate' | 'dangerous';

export interface HazardTicket {
  id: string; // e.g. '#RW-4092'
  numericId: string;
  title: string;
  location: string;
  landmark: string;
  ward: string;
  coordinates: {
    lat: number;
    lng: number;
    str: string;
  };
  depthCm: number;
  severity: HazardSeverity;
  severityLabel: string;
  status: 'reported' | 'verified' | 'investigating' | 'dispatched' | 'repaired';
  statusLabel: string;
  reportedTimeAgo: string;
  reportedDate: string;
  corroborations: number;
  mergedCount: number;
  aiConfidence: number;
  imageUrl: string;
  lidarUrl?: string;
  environmentalTags: string[];
  assignedInspector?: string;
  assignedContractor?: string;
  workOrderId?: string;
  patchVolumeM3?: number;
  slaHoursTotal: number;
  slaHoursElapsed: number;
  notes?: string;
}

export type UserRole = 'commuter' | 'contractor' | 'dispatcher';
