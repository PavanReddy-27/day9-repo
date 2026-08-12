// src/config/attendance.ts

/**
 * ==========================================
 * Workforce Analytics
 * Attendance / Geofence Configuration
 * ==========================================
 */

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface OfficeLocation extends GeoCoordinates {
  id: string;
  name: string;
}

const envNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && value !== undefined && value !== "" ? parsed : fallback;
};

/**
 * Configured office locations used for geofencing on Office check-ins.
 * Override via VITE_OFFICE_LATITUDE / VITE_OFFICE_LONGITUDE / VITE_OFFICE_NAME
 * env vars for deployment-specific coordinates instead of editing this file.
 */
export const OFFICE_LOCATIONS: OfficeLocation[] = [
  {
    id: "HYD",
    name: "Hyderabad",
    latitude: envNumber(import.meta.env.VITE_OFFICE_LATITUDE as string | undefined, 17.3850),
    longitude: envNumber(import.meta.env.VITE_OFFICE_LONGITUDE as string | undefined, 78.4867),
  },
  {
    id: "VSP",
    name: "Visakhapatnam",
    latitude: 17.6868,
    longitude: 83.2185,
  },
  {
    id: "CHN",
    name: "Chennai",
    latitude: 13.0827,
    longitude: 80.2707,
  },
  {
    id: "BLR",
    name: "Bengaluru",
    latitude: 12.9716,
    longitude: 77.5946,
  },
  {
    id: "KOC",
    name: "Kochi",
    latitude: 9.9312,
    longitude: 76.2673,
  },
];

export const DEFAULT_OFFICE_ID = OFFICE_LOCATIONS[0].id;

export const getOfficeLocation = (officeId: string = DEFAULT_OFFICE_ID): OfficeLocation => {
  return OFFICE_LOCATIONS.find((office) => office.id === officeId) ?? OFFICE_LOCATIONS[0];
};

/** Maximum allowed distance (meters) from the office for an on-site check-in. */
export const GEOFENCE_RADIUS_METERS = envNumber(
  import.meta.env.VITE_GEOFENCE_RADIUS_METERS as string | undefined,
  500
);

/**
 * GPS readings with a wider accuracy radius (meters) than this are rejected as unreliable.
 * Desktop/laptop browsers resolve location via WiFi positioning rather than a GPS chip and
 * commonly report 100-500m accuracy, so this is set high enough to accept typical desktop
 * readings while still rejecting clearly broken/IP-based location data.
 */
export const MAX_GPS_ACCURACY_METERS = envNumber(
  import.meta.env.VITE_MAX_GPS_ACCURACY_METERS as string | undefined,
  100000
);

/** Haversine distance in meters between two coordinates. */
export const getDistanceMeters = (a: GeoCoordinates, b: GeoCoordinates): number => {
  const R = 6371e3;
  const φ1 = (a.latitude * Math.PI) / 180;
  const φ2 = (b.latitude * Math.PI) / 180;
  const Δφ = ((b.latitude - a.latitude) * Math.PI) / 180;
  const Δλ = ((b.longitude - a.longitude) * Math.PI) / 180;
  const h = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

export const isWithinGeofence = (
  location: GeoCoordinates,
  officeId: string = DEFAULT_OFFICE_ID,
  radiusMeters: number = GEOFENCE_RADIUS_METERS
): boolean => {
  return getDistanceMeters(location, getOfficeLocation(officeId)) <= radiusMeters;
};
