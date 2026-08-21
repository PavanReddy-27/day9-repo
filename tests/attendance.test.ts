import { describe, it, expect } from 'vitest';

// Placeholder for the actual distance calculation function
// You would import this from your backend utils
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

describe('Geofence Boundary Tests', () => {
  const officeLocation = { lat: 37.7749, lng: -122.4194 };
  const allowedRadiusMeters = 200;

  it('should pass within the allowed radius', () => {
    const checkInLocation = { lat: 37.7750, lng: -122.4195 }; // Very close
    const distance = getDistance(officeLocation.lat, officeLocation.lng, checkInLocation.lat, checkInLocation.lng);
    const isWithinGeofence = distance <= allowedRadiusMeters;
    
    expect(isWithinGeofence).toBe(true);
  });

  it('should fail outside the allowed radius', () => {
    const checkInLocation = { lat: 34.0522, lng: -118.2437 }; // Far away
    const distance = getDistance(officeLocation.lat, officeLocation.lng, checkInLocation.lat, checkInLocation.lng);
    const isWithinGeofence = distance <= allowedRadiusMeters;
    
    expect(isWithinGeofence).toBe(false);
  });
});
