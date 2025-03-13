export interface AWSRegion {
  name: string;
  code: string;
  location: {
    lat: number;
    lng: number;
  };
  availabilityZones: number;
  launched: number;
  isLocalZone?: boolean;
}

export const awsRegions: AWSRegion[] = [
  // Main regions
  {
    name: "US East (N. Virginia)",
    code: "us-east-1",
    location: { lat: 38.9519, lng: -77.4480 },
    availabilityZones: 6,
    launched: 2006
  },
  {
    name: "US East (Ohio)",
    code: "us-east-2",
    location: { lat: 40.4173, lng: -82.9071 },
    availabilityZones: 3,
    launched: 2016
  },
  {
    name: "US West (N. California)",
    code: "us-west-1",
    location: { lat: 37.7749, lng: -122.4194 },
    availabilityZones: 3,
    launched: 2009
  },
  {
    name: "US West (Oregon)",
    code: "us-west-2",
    location: { lat: 45.5155, lng: -122.6789 },
    availabilityZones: 4,
    launched: 2011
  },
  {
    name: "Asia Pacific (Tokyo)",
    code: "ap-northeast-1",
    location: { lat: 35.6762, lng: 139.6503 },
    availabilityZones: 4,
    launched: 2011
  },
  {
    name: "Asia Pacific (Seoul)",
    code: "ap-northeast-2",
    location: { lat: 37.5665, lng: 126.9780 },
    availabilityZones: 4,
    launched: 2016
  },
  {
    name: "Asia Pacific (Osaka)",
    code: "ap-northeast-3",
    location: { lat: 34.6937, lng: 135.5022 },
    availabilityZones: 3,
    launched: 2018
  },
  {
    name: "Asia Pacific (Singapore)",
    code: "ap-southeast-1",
    location: { lat: 1.3521, lng: 103.8198 },
    availabilityZones: 3,
    launched: 2010
  },
  {
    name: "Asia Pacific (Sydney)",
    code: "ap-southeast-2",
    location: { lat: -33.8688, lng: 151.2093 },
    availabilityZones: 3,
    launched: 2012
  },
  {
    name: "Asia Pacific (Jakarta)",
    code: "ap-southeast-3",
    location: { lat: -6.2088, lng: 106.8456 },
    availabilityZones: 3,
    launched: 2021
  },
  {
    name: "Asia Pacific (Melbourne)",
    code: "ap-southeast-4",
    location: { lat: -37.8136, lng: 144.9631 },
    availabilityZones: 3,
    launched: 2023
  },
  {
    name: "Asia Pacific (Malaysia)",
    code: "ap-southeast-5",
    location: { lat: 3.1390, lng: 101.6869 },
    availabilityZones: 3,
    launched: 2024
  },
  {
    name: "Asia Pacific (Thailand)",
    code: "ap-southeast-7",
    location: { lat: 13.7563, lng: 100.5018 },
    availabilityZones: 3,
    launched: 2024
  },
  {
    name: "Asia Pacific (Mumbai)",
    code: "ap-south-1",
    location: { lat: 19.0760, lng: 72.8777 },
    availabilityZones: 3,
    launched: 2016
  },
  {
    name: "Asia Pacific (Hyderabad)",
    code: "ap-south-2",
    location: { lat: 17.3850, lng: 78.4867 },
    availabilityZones: 3,
    launched: 2022
  },
  {
    name: "Asia Pacific (Hong Kong)",
    code: "ap-east-1",
    location: { lat: 22.3193, lng: 114.1694 },
    availabilityZones: 3,
    launched: 2019
  },
  {
    name: "Europe (Ireland)",
    code: "eu-west-1",
    location: { lat: 53.3498, lng: -6.2603 },
    availabilityZones: 3,
    launched: 2007
  },
  {
    name: "Europe (London)",
    code: "eu-west-2",
    location: { lat: 51.5074, lng: -0.1278 },
    availabilityZones: 3,
    launched: 2016
  },
  {
    name: "Europe (Paris)",
    code: "eu-west-3",
    location: { lat: 48.8566, lng: 2.3522 },
    availabilityZones: 3,
    launched: 2017
  },
  {
    name: "Europe (Stockholm)",
    code: "eu-north-1",
    location: { lat: 59.3293, lng: 18.0686 },
    availabilityZones: 3,
    launched: 2018
  },
  {
    name: "Europe (Milan)",
    code: "eu-south-1",
    location: { lat: 45.4642, lng: 9.1900 },
    availabilityZones: 3,
    launched: 2020
  },
  {
    name: "Europe (Spain)",
    code: "eu-south-2",
    location: { lat: 40.4168, lng: -3.7038 },
    availabilityZones: 3,
    launched: 2022
  },
  {
    name: "Europe (Frankfurt)",
    code: "eu-central-1",
    location: { lat: 50.1109, lng: 8.6821 },
    availabilityZones: 3,
    launched: 2014
  },
  {
    name: "Europe (Zurich)",
    code: "eu-central-2",
    location: { lat: 47.3769, lng: 8.5417 },
    availabilityZones: 3,
    launched: 2022
  },
  {
    name: "Middle East (Bahrain)",
    code: "me-south-1",
    location: { lat: 26.0667, lng: 50.5577 },
    availabilityZones: 3,
    launched: 2019
  },
  {
    name: "Middle East (UAE)",
    code: "me-central-1",
    location: { lat: 25.2048, lng: 55.2708 },
    availabilityZones: 3,
    launched: 2022
  },
  {
    name: "South America (São Paulo)",
    code: "sa-east-1",
    location: { lat: -23.5505, lng: -46.6333 },
    availabilityZones: 3,
    launched: 2011
  },
  {
    name: "Canada (Central)",
    code: "ca-central-1",
    location: { lat: 45.5017, lng: -73.5673 },
    availabilityZones: 3,
    launched: 2016
  },
  {
    name: "Canada West (Calgary)",
    code: "ca-west-1",
    location: { lat: 51.0447, lng: -114.0719 },
    availabilityZones: 3,
    launched: 2023
  },
  {
    name: "Africa (Cape Town)",
    code: "af-south-1",
    location: { lat: -33.9249, lng: 18.4241 },
    availabilityZones: 3,
    launched: 2020
  },
  {
    name: "Israel (Tel Aviv)",
    code: "il-central-1",
    location: { lat: 32.0853, lng: 34.7818 },
    availabilityZones: 3,
    launched: 2023
  },
  {
    name: "Mexico (Central)",
    code: "mx-central-1",
    location: { lat: 19.4326, lng: -99.1332 },
    availabilityZones: 3,
    launched: 2023
  },
  
  // Local Zones - US
  {
    name: "US East (Atlanta)",
    code: "us-east-1-atl-2a",
    location: { lat: 33.7490, lng: -84.3880 },
    availabilityZones: 1,
    launched: 2020,
    isLocalZone: true
  },
  {
    name: "US East (Boston)",
    code: "us-east-1-bos-1a",
    location: { lat: 42.3601, lng: -71.0589 },
    availabilityZones: 1,
    launched: 2020,
    isLocalZone: true
  },
  {
    name: "US East (Chicago)",
    code: "us-east-1-chi-2a",
    location: { lat: 41.8781, lng: -87.6298 },
    availabilityZones: 1,
    launched: 2020,
    isLocalZone: true
  },
  {
    name: "US East (Dallas)",
    code: "us-east-1-dfw-2a",
    location: { lat: 32.7767, lng: -96.7970 },
    availabilityZones: 1,
    launched: 2020,
    isLocalZone: true
  },
  {
    name: "US East (Houston)",
    code: "us-east-1-iah-2a",
    location: { lat: 29.7604, lng: -95.3698 },
    availabilityZones: 1,
    launched: 2020,
    isLocalZone: true
  },
  {
    name: "US East (Kansas City)",
    code: "us-east-1-mci-1a",
    location: { lat: 39.0997, lng: -94.5786 },
    availabilityZones: 1,
    launched: 2021,
    isLocalZone: true
  },
  {
    name: "US East (Miami)",
    code: "us-east-1-mia-2a",
    location: { lat: 25.7617, lng: -80.1918 },
    availabilityZones: 1,
    launched: 2020,
    isLocalZone: true
  },
  {
    name: "US East (Minneapolis)",
    code: "us-east-1-msp-1a",
    location: { lat: 44.9778, lng: -93.2650 },
    availabilityZones: 1,
    launched: 2021,
    isLocalZone: true
  },
  {
    name: "US East (New York)",
    code: "us-east-1-nyc-2a",
    location: { lat: 40.7128, lng: -74.0060 },
    availabilityZones: 1,
    launched: 2020,
    isLocalZone: true
  },
  {
    name: "US East (Philadelphia)",
    code: "us-east-1-phl-1a",
    location: { lat: 39.9526, lng: -75.1652 },
    availabilityZones: 1,
    launched: 2020,
    isLocalZone: true
  },
  {
    name: "US West (Denver)",
    code: "us-west-2-den-1a",
    location: { lat: 39.7392, lng: -104.9903 },
    availabilityZones: 1,
    launched: 2020,
    isLocalZone: true
  },
  {
    name: "US West (Honolulu)",
    code: "us-west-2-hnl-1a",
    location: { lat: 21.3099, lng: -157.8581 },
    availabilityZones: 1,
    launched: 2021,
    isLocalZone: true
  },
  {
    name: "US West (Las Vegas)",
    code: "us-west-2-las-1a",
    location: { lat: 36.1699, lng: -115.1398 },
    availabilityZones: 1,
    launched: 2021,
    isLocalZone: true
  },
  {
    name: "US West (Los Angeles)",
    code: "us-west-2-lax-1a",
    location: { lat: 34.0522, lng: -118.2437 },
    availabilityZones: 1,
    launched: 2020,
    isLocalZone: true
  },
  {
    name: "US West (Phoenix)",
    code: "us-west-2-phx-2a",
    location: { lat: 33.4484, lng: -112.0740 },
    availabilityZones: 1,
    launched: 2020,
    isLocalZone: true
  },
  {
    name: "US West (Portland)",
    code: "us-west-2-pdx-1a",
    location: { lat: 45.5051, lng: -122.6750 },
    availabilityZones: 1,
    launched: 2021,
    isLocalZone: true
  },
  {
    name: "US West (Seattle)",
    code: "us-west-2-sea-1a",
    location: { lat: 47.6062, lng: -122.3321 },
    availabilityZones: 1,
    launched: 2021,
    isLocalZone: true
  },
  
  // Local Zones - International
  {
    name: "Auckland",
    code: "ap-southeast-2-akl-1a",
    location: { lat: -36.8485, lng: 174.7633 },
    availabilityZones: 1,
    launched: 2022,
    isLocalZone: true
  },
  {
    name: "Bangkok",
    code: "ap-southeast-1-bkk-1a",
    location: { lat: 13.7563, lng: 100.5018 },
    availabilityZones: 1,
    launched: 2022,
    isLocalZone: true
  },
  {
    name: "Buenos Aires",
    code: "us-east-1-bue-1a",
    location: { lat: -34.6037, lng: -58.3816 },
    availabilityZones: 1,
    launched: 2022,
    isLocalZone: true
  },
  {
    name: "Copenhagen",
    code: "eu-north-1-cph-1a",
    location: { lat: 55.6761, lng: 12.5683 },
    availabilityZones: 1,
    launched: 2022,
    isLocalZone: true
  },
  {
    name: "Delhi",
    code: "ap-south-1-del-1a",
    location: { lat: 28.6139, lng: 77.2090 },
    availabilityZones: 1,
    launched: 2022,
    isLocalZone: true
  },
  {
    name: "Hamburg",
    code: "eu-central-1-ham-1a",
    location: { lat: 53.5511, lng: 9.9937 },
    availabilityZones: 1,
    launched: 2022,
    isLocalZone: true
  },
  {
    name: "Helsinki",
    code: "eu-north-1-hel-1a",
    location: { lat: 60.1699, lng: 24.9384 },
    availabilityZones: 1,
    launched: 2022,
    isLocalZone: true
  },
  {
    name: "Kolkata",
    code: "ap-south-1-ccu-1a",
    location: { lat: 22.5726, lng: 88.3639 },
    availabilityZones: 1,
    launched: 2022,
    isLocalZone: true
  },
  {
    name: "Lagos",
    code: "af-south-1-los-1a",
    location: { lat: 6.5244, lng: 3.3792 },
    availabilityZones: 1,
    launched: 2022,
    isLocalZone: true
  },
  {
    name: "Lima",
    code: "us-east-1-lim-1a",
    location: { lat: -12.0464, lng: -77.0428 },
    availabilityZones: 1,
    launched: 2022,
    isLocalZone: true
  },
  {
    name: "Manila",
    code: "ap-southeast-1-mnl-1a",
    location: { lat: 14.5995, lng: 120.9842 },
    availabilityZones: 1,
    launched: 2022,
    isLocalZone: true
  },
  {
    name: "Muscat",
    code: "me-south-1-mct-1a",
    location: { lat: 23.5880, lng: 58.3829 },
    availabilityZones: 1,
    launched: 2022,
    isLocalZone: true
  },
  {
    name: "Perth",
    code: "ap-southeast-2-per-1a",
    location: { lat: -31.9505, lng: 115.8605 },
    availabilityZones: 1,
    launched: 2022,
    isLocalZone: true
  },
  {
    name: "Querétaro",
    code: "us-east-1-qro-1a",
    location: { lat: 20.5881, lng: -100.3899 },
    availabilityZones: 1,
    launched: 2022,
    isLocalZone: true
  },
  {
    name: "Santiago",
    code: "us-east-1-scl-1a",
    location: { lat: -33.4489, lng: -70.6693 },
    availabilityZones: 1,
    launched: 2022,
    isLocalZone: true
  },
  {
    name: "Taipei",
    code: "ap-northeast-1-tpe-1a",
    location: { lat: 25.0330, lng: 121.5654 },
    availabilityZones: 1,
    launched: 2022,
    isLocalZone: true
  },
  {
    name: "Warsaw",
    code: "eu-central-1-waw-1a",
    location: { lat: 52.2297, lng: 21.0122 },
    availabilityZones: 1,
    launched: 2022,
    isLocalZone: true
  }
]; 