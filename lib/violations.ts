export const RED_LIGHT = 'RED_LIGHT';
export const SPEEDING = 'SPEEDING';
export const PARKING = 'PARKING';
export const CROSSWALK = 'CROSSWALK';

export const ViolationLabels = {
  [RED_LIGHT]: 'Red Light',
  [SPEEDING]: 'Speeding',
  [PARKING]: 'Parking',
  [CROSSWALK]: 'Crosswalk',
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
