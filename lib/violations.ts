export const RED_LIGHT = 'RED_LIGHT';
export const SPEEDING = 'SPEEDING';
export const PARKING = 'PARKING';
export const CROSSWALK = 'CROSSWALK';
export const GEOFENCE = 'GEOFENCE_VIOLATION';
export const UNKNOWN = 'UNKNOWN';

export const ViolationLabels = {
  [RED_LIGHT]: 'violation.RED_LIGHT',
  [SPEEDING]: 'violation.SPEEDING',
  [PARKING]: 'violation.PARKING',
  [CROSSWALK]: 'violation.CROSSWALK',
  [GEOFENCE]: 'violation.GEOFENCE_VIOLATION',
  [UNKNOWN]: 'violation.UNKNOWN',
};

export const ViolationColors = (type: string) => {
  switch (type) {
    case SPEEDING:
      return 'red';
    case PARKING:
      return 'orange';
    case CROSSWALK:
      return 'green';
    default:
      return 'gray';
  }
};
