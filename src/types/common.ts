export type CloudProvider = 'aws' | 'azure';

export interface CloudRegion {
  name: string;
  code: string;
  location: {
    lat: number;
    lng: number;
  };
  availabilityZones: number;
  launched: number;
  isLocalZone?: boolean;
  provider: CloudProvider;
} 