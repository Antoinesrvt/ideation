// Status colors type
export type ValidationStatus = 'validated' | 'invalidated' | 'in-progress' | 'untested';

// Connection type
export type Connection = {
  from: string;
  to: string;
  validationStatus: ValidationStatus;
};

// Segment type
export type Segment = {
  id: string;
  name: string;
  validationStatus: ValidationStatus;
};

// Circle data type
export type CircleData = {
  id: string;
  name: string;
  radius: number;
  segments: Segment[];
};

// Type for combined segment and circle
export type SegmentWithCircle = {
  segment: Segment;
  circle: CircleData;
}; 