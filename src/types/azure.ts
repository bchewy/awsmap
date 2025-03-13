export interface AzureRegion {
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

export const azureRegions: AzureRegion[] = [
  // Americas
  {
    name: "East US",
    code: "eastus",
    location: { lat: 37.3719, lng: -79.8164 },
    availabilityZones: 3,
    launched: 2014
  },
  {
    name: "East US 2",
    code: "eastus2",
    location: { lat: 36.6681, lng: -78.3889 },
    availabilityZones: 3,
    launched: 2014
  },
  {
    name: "South Central US",
    code: "southcentralus",
    location: { lat: 29.4167, lng: -98.5000 },
    availabilityZones: 3,
    launched: 2014
  },
  {
    name: "West US 2",
    code: "westus2",
    location: { lat: 47.233, lng: -119.852 },
    availabilityZones: 3,
    launched: 2016
  },
  {
    name: "West US 3",
    code: "westus3",
    location: { lat: 33.448, lng: -112.074 },
    availabilityZones: 3,
    launched: 2021
  },
  {
    name: "Central US",
    code: "centralus",
    location: { lat: 41.5908, lng: -93.6208 },
    availabilityZones: 3,
    launched: 2014
  },
  {
    name: "North Central US",
    code: "northcentralus",
    location: { lat: 41.8781, lng: -87.6298 },
    availabilityZones: 0,
    launched: 2014
  },
  {
    name: "West US",
    code: "westus",
    location: { lat: 37.78, lng: -122.42 },
    availabilityZones: 0,
    launched: 2014
  },
  {
    name: "Canada Central",
    code: "canadacentral",
    location: { lat: 43.653, lng: -79.383 },
    availabilityZones: 3,
    launched: 2016
  },
  {
    name: "Canada East",
    code: "canadaeast",
    location: { lat: 46.817, lng: -71.217 },
    availabilityZones: 0,
    launched: 2016
  },
  {
    name: "Brazil South",
    code: "brazilsouth",
    location: { lat: -23.55, lng: -46.633 },
    availabilityZones: 3,
    launched: 2014
  },
  {
    name: "Brazil Southeast",
    code: "brazilsoutheast",
    location: { lat: -22.90, lng: -43.17 },
    availabilityZones: 0,
    launched: 2021
  },
  
  // Europe
  {
    name: "North Europe",
    code: "northeurope",
    location: { lat: 53.3478, lng: -6.2597 },
    availabilityZones: 3,
    launched: 2014
  },
  {
    name: "West Europe",
    code: "westeurope",
    location: { lat: 52.3667, lng: 4.9000 },
    availabilityZones: 3,
    launched: 2014
  },
  {
    name: "UK South",
    code: "uksouth",
    location: { lat: 50.941, lng: -0.799 },
    availabilityZones: 3,
    launched: 2016
  },
  {
    name: "UK West",
    code: "ukwest",
    location: { lat: 53.427, lng: -3.084 },
    availabilityZones: 0,
    launched: 2016
  },
  {
    name: "France Central",
    code: "francecentral",
    location: { lat: 46.3772, lng: 2.3730 },
    availabilityZones: 3,
    launched: 2018
  },
  {
    name: "France South",
    code: "francesouth",
    location: { lat: 43.8345, lng: 2.1972 },
    availabilityZones: 0,
    launched: 2018
  },
  {
    name: "Germany West Central",
    code: "germanywestcentral",
    location: { lat: 50.110924, lng: 8.682127 },
    availabilityZones: 3,
    launched: 2019
  },
  {
    name: "Germany North",
    code: "germanynorth",
    location: { lat: 53.073635, lng: 8.806422 },
    availabilityZones: 0,
    launched: 2019
  },
  {
    name: "Norway East",
    code: "norwayeast",
    location: { lat: 59.913, lng: 10.752 },
    availabilityZones: 3,
    launched: 2019
  },
  {
    name: "Norway West",
    code: "norwaywest",
    location: { lat: 58.969975, lng: 5.733107 },
    availabilityZones: 0,
    launched: 2019
  },
  {
    name: "Switzerland North",
    code: "switzerlandnorth",
    location: { lat: 47.451542, lng: 8.564572 },
    availabilityZones: 3,
    launched: 2019
  },
  {
    name: "Switzerland West",
    code: "switzerlandwest",
    location: { lat: 46.204391, lng: 6.143158 },
    availabilityZones: 0,
    launched: 2019
  },
  {
    name: "Sweden Central",
    code: "swedencentral",
    location: { lat: 60.67488, lng: 17.14127 },
    availabilityZones: 3,
    launched: 2021
  },
  {
    name: "Poland Central",
    code: "polandcentral",
    location: { lat: 52.23, lng: 21.01 },
    availabilityZones: 0,
    launched: 2022
  },
  {
    name: "Italy North",
    code: "italynorth",
    location: { lat: 45.46, lng: 9.19 },
    availabilityZones: 0,
    launched: 2021
  },
  {
    name: "Spain Central",
    code: "spaincentral",
    location: { lat: 40.41, lng: -3.70 },
    availabilityZones: 3,
    launched: 2023
  },

  // Asia Pacific
  {
    name: "East Asia",
    code: "eastasia",
    location: { lat: 22.267, lng: 114.188 },
    availabilityZones: 0,
    launched: 2014
  },
  {
    name: "Southeast Asia",
    code: "southeastasia",
    location: { lat: 1.283, lng: 103.833 },
    availabilityZones: 3,
    launched: 2014
  },
  {
    name: "Australia East",
    code: "australiaeast",
    location: { lat: -33.86, lng: 151.2094 },
    availabilityZones: 3,
    launched: 2014
  },
  {
    name: "Australia Southeast",
    code: "australiasoutheast",
    location: { lat: -37.8136, lng: 144.9631 },
    availabilityZones: 0,
    launched: 2014
  },
  {
    name: "Australia Central",
    code: "australiacentral",
    location: { lat: -35.3075, lng: 149.1244 },
    availabilityZones: 0,
    launched: 2018
  },
  {
    name: "Australia Central 2",
    code: "australiacentral2",
    location: { lat: -35.3075, lng: 149.1244 },
    availabilityZones: 0,
    launched: 2018
  },
  {
    name: "Japan East",
    code: "japaneast",
    location: { lat: 35.68, lng: 139.77 },
    availabilityZones: 3,
    launched: 2014
  },
  {
    name: "Japan West",
    code: "japanwest",
    location: { lat: 34.6939, lng: 135.5022 },
    availabilityZones: 0,
    launched: 2014
  },
  {
    name: "Korea Central",
    code: "koreacentral",
    location: { lat: 37.5665, lng: 126.9780 },
    availabilityZones: 3,
    launched: 2017
  },
  {
    name: "Korea South",
    code: "koreasouth",
    location: { lat: 35.1796, lng: 129.0756 },
    availabilityZones: 0,
    launched: 2017
  },
  {
    name: "India Central",
    code: "centralindia",
    location: { lat: 18.5822, lng: 73.9197 },
    availabilityZones: 3,
    launched: 2015
  },
  {
    name: "India South",
    code: "southindia",
    location: { lat: 12.9822, lng: 80.1636 },
    availabilityZones: 0,
    launched: 2015
  },
  {
    name: "India West",
    code: "westindia",
    location: { lat: 19.088, lng: 72.868 },
    availabilityZones: 0,
    launched: 2015
  },
  {
    name: "China East",
    code: "chinaeast",
    location: { lat: 31.2304, lng: 121.4737 },
    availabilityZones: 0,
    launched: 2014
  },
  {
    name: "China North",
    code: "chinanorth",
    location: { lat: 39.9042, lng: 116.4074 },
    availabilityZones: 0,
    launched: 2014
  },
  {
    name: "China East 2",
    code: "chinaeast2",
    location: { lat: 31.2304, lng: 121.4737 },
    availabilityZones: 0,
    launched: 2018
  },
  {
    name: "China North 2",
    code: "chinanorth2",
    location: { lat: 39.9042, lng: 116.4074 },
    availabilityZones: 0,
    launched: 2018
  },
  {
    name: "China North 3",
    code: "chinanorth3",
    location: { lat: 40.1824, lng: 116.4142 },
    availabilityZones: 0,
    launched: 2022
  },
  {
    name: "China East 3",
    code: "chinaeast3",
    location: { lat: 31.2304, lng: 121.4737 },
    availabilityZones: 0,
    launched: 2022
  },
  {
    name: "Malaysia West",
    code: "malaysiawest",
    location: { lat: 3.139, lng: 101.6869 },
    availabilityZones: 0,
    launched: 2023
  },
  {
    name: "Indonesia Central",
    code: "indonesiacentral",
    location: { lat: -6.2088, lng: 106.8456 },
    availabilityZones: 0,
    launched: 2023
  },
  
  // Middle East and Africa
  {
    name: "UAE North",
    code: "uaenorth",
    location: { lat: 25.266666, lng: 55.316666 },
    availabilityZones: 3,
    launched: 2019
  },
  {
    name: "UAE Central",
    code: "uaecentral",
    location: { lat: 24.466667, lng: 54.366669 },
    availabilityZones: 0,
    launched: 2019
  },
  {
    name: "South Africa North",
    code: "southafricanorth",
    location: { lat: -25.73134, lng: 28.21837 },
    availabilityZones: 3,
    launched: 2019
  },
  {
    name: "South Africa West",
    code: "southafricawest",
    location: { lat: -33.9797, lng: 18.4655 },
    availabilityZones: 0,
    launched: 2019
  },
  {
    name: "Qatar Central",
    code: "qatarcentral",
    location: { lat: 25.3548, lng: 51.1839 },
    availabilityZones: 0,
    launched: 2022
  },
  {
    name: "Israel Central",
    code: "israelcentral",
    location: { lat: 31.0461, lng: 34.8516 },
    availabilityZones: 3,
    launched: 2023
  }
]; 