import { AWSRegion, awsRegions } from './aws';
import { AzureRegion, azureRegions } from './azure';
import { CloudProvider, CloudRegion } from './common';

// Convert AWS regions to CloudRegion type
const awsCloudRegions: CloudRegion[] = awsRegions.map(region => ({
  ...region,
  provider: 'aws'
}));

// Convert Azure regions to CloudRegion type
const azureCloudRegions: CloudRegion[] = azureRegions.map(region => ({
  ...region,
  provider: 'azure'
}));

// Get regions based on selected provider
export const getRegionsByProvider = (provider: CloudProvider): CloudRegion[] => {
  return provider === 'aws' ? awsCloudRegions : azureCloudRegions;
};

// Get all regions across all providers
export const getAllRegions = (): CloudRegion[] => {
  return [...awsCloudRegions, ...azureCloudRegions];
}; 