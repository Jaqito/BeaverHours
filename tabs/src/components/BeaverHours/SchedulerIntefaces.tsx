export interface DaySchedule {
  startAt?: string;
  endAt?: string;
  repeated?: number;
}

export interface OfficeHoursSchedule {
  [key: string]: DaySchedule | undefined;
  Sunday?: DaySchedule;
  Monday?: DaySchedule;
  Tuesday?: DaySchedule;
  Wednesday?: DaySchedule;
  Thursday?: DaySchedule;
  Friday?: DaySchedule;
  Saturday?: DaySchedule;
}

export interface WeekTableRowProps {
    dayOfWeek: string;
}