import React from "react";
import {
    createContext,
    useContext,
    useRef,
    useState
} from "react";

const ScheduleContext = createContext({});

export function Scheduler() {
  return <ScheduleForm />;
}

interface DaySchedule {
  startAt?: string;
  endAt?: string;
  repeated?: number;
}

interface OfficeHoursSchedule {
  [key: string]: DaySchedule | undefined;
  Sunday?: DaySchedule;
  Monday?: DaySchedule;
  Tuesday?: DaySchedule;
  Wednesday?: DaySchedule;
  Thursday?: DaySchedule;
  Friday?: DaySchedule;
  Saturday?: DaySchedule;
}

export function ScheduleForm() {
    const [schedule, setSchedule] = useState(
    {
      Sunday: {} as DaySchedule,
      Monday: {} as DaySchedule,
      Tuesday: {} as DaySchedule,
      Wednesday: {} as DaySchedule,
      Thursday: {} as DaySchedule,
      Friday: {} as DaySchedule,
      Saturday: {} as DaySchedule,
    } as OfficeHoursSchedule);

    return <ScheduleContext.Provider value={schedule}>
        <GenereateWeekTable />
    </ScheduleContext.Provider>
}

export function GenereateWeekTable() {
  return (
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Start At:</th>
          <th>End At:</th>
          <th>Repeat for:</th>
        </tr>
      </thead>
      <tbody>
        {NewRow("Sunday")}
        {NewRow("Monday")}
        {NewRow("Tuesday")}
        {NewRow("Wednesday")}
        {NewRow("Thursday")}
        {NewRow("Friday")}
        {NewRow("Saturday")}
      </tbody>
    </table>
  );
}

export function NewRow(name: string) {
  return (
    <tr>
      <th>{name}</th>
      <td>
        <input
          type="time"
          name={name + "-startAt"}
          onChange={this.handleChange}
        ></input>
      </td>
      <td>
        <input
          type="time"
          name={name + "-endAt"}
          onChange={this.handleChange}
        ></input>
      </td>
      <td>
        <input
          type="number"
          name={name + "-repeated"}
          min={1}
          onChange={this.handleChange}
        ></input>{" "}
        weeks
      </td>
      {/* <td><input type="button" onClick={(e) => addRow(name)}>Add time</input></td> */}
    </tr>
  );
}

export function AddRow(name: string) {
  return NewRow(name);
}
