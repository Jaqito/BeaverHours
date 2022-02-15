import { WeekTable } from "./WeekTable";
import { createContext, useState } from "react";
import { OfficeHoursSchedule, DaySchedule } from "./SchedulerIntefaces";

export const ScheduleContext = createContext({
  state: {} as OfficeHoursSchedule,
  updateSchedule: (newSchedule: OfficeHoursSchedule) => {},
});

export function ScheduleForm() {
  const [state, setSchedule] = useState({
    Sunday: {} as DaySchedule,
    Monday: {} as DaySchedule,
    Tuesday: {} as DaySchedule,
    Wednesday: {} as DaySchedule,
    Thursday: {} as DaySchedule,
    Friday: {} as DaySchedule,
    Saturday: {} as DaySchedule,
  } as OfficeHoursSchedule);

  const updateSchedule = (newSchedule: OfficeHoursSchedule) => {
    setSchedule(newSchedule);
  };
  const value = { state, updateSchedule };

  const HandleSubmit = (event: any) => {
    console.log("A schedule was submitted:\n", state);
    event.preventDefault();
  };

  return (
    <ScheduleContext.Provider value={value}>
      <form onSubmit={HandleSubmit}>
        <WeekTable />
        <input type="submit" value="submit" />
      </form>
    </ScheduleContext.Provider>
  );
}
