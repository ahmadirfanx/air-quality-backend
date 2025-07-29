// src/shared/constants/index.ts (UPDATE existing file)
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const VALID_PARAMETERS = [
  'co',
  'nmhc',
  'benzene',
  'nox',
  'no2',
  'pt08_s1_co',
  'pt08_s2_nmhc',
  'pt08_s3_nox',
  'pt08_s4_no2',
  'pt08_s5_o3',
  'temperature',
  'relative_humidity',
  'absolute_humidity',
] as const;

export const PARAMETER_UNITS = {
  co: 'mg/m³',
  nmhc: 'µg/m³',
  benzene: 'µg/m³',
  nox: 'ppb',
  no2: 'µg/m³',
  temperature: '°C',
  relative_humidity: '%',
  absolute_humidity: 'g/m³',
} as const;

export const CACHE_KEYS = {
  AIR_QUALITY_DATA: 'air_quality_data',
  STATIONS: 'stations',
  USER_PREFERENCES: 'user_preferences',
} as const;

export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['text/csv', 'application/json'],
} as const;
