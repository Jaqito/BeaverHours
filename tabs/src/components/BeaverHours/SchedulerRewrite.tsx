import React from "react";
import {
  createContext,
  useContext,
  // useRef,
  useState,
} from "react";

const ScheduleContext = createContext({
  state: {},
  setSchedule: (scheduleUpdate: any) => {},
});

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
  const [state, setState] = useState({
    Sunday: {} as DaySchedule,
    Monday: {} as DaySchedule,
    Tuesday: {} as DaySchedule,
    Wednesday: {} as DaySchedule,
    Thursday: {} as DaySchedule,
    Friday: {} as DaySchedule,
    Saturday: {} as DaySchedule,
  } as OfficeHoursSchedule);

  const updater = (scheduleUpdate: any) => {
    setState({ ...state, scheduleUpdate });
  };

  const scheduleUpdater = { state: state, setSchedule: updater };

  return (
    <ScheduleContext.Provider value={scheduleUpdater}>
      <form onSubmit={HandleSubmit}>
        <GenerateWeekTable />
        <input type="submit" value="submit" />
      </form>
    </ScheduleContext.Provider>
  );
}

export function GenerateWeekTable() {
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
          onChange={HandleChange}
        ></input>
      </td>
      <td>
        <input
          type="time"
          name={name + "-endAt"}
          onChange={HandleChange}
        ></input>
      </td>
      <td>
        <input
          type="number"
          name={name + "-repeated"}
          min={1}
          onChange={HandleChange}
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

export function HandleChange(event: any) {
  event.persist();
  const scheduleUpdater = useContext(ScheduleContext);

  var splitname = event.target.name.split("-");
  var dayOfWeek = splitname[0];
  var fieldname = splitname[1];
  if (fieldname === "startAt") {
    console.log("edited startAt for" + dayOfWeek);
    scheduleUpdater.setSchedule({
      startAt: event.target.value,
    });
    // this.setState((state) => {
    //     return {
    //         [dayOfWeek]: {
    //         startAt: event.target.value,
    //         endAt: state[dayOfWeek]?.endAt,
    //         repeated: state[dayOfWeek]?.repeated,
    //         },
    //     };
    // });
  } else if (fieldname === "endAt") {
    console.log("edited endAt for" + dayOfWeek);
    scheduleUpdater.setSchedule({
      endAt: event.target.value,
    });
    // this.setState((state) => {
    //     return {
    //         [dayOfWeek]: {
    //         startAt: state[dayOfWeek]?.startAt,
    //         endAt: event.target.value,
    //         repeated: state[dayOfWeek]?.repeated,
    //         },
    //     };
    // });
  } else if (fieldname === "repeated") {
    console.log("edited repeated for" + dayOfWeek);
    scheduleUpdater.setSchedule({
      repeated: event.target.value,
    });
    // this.setState((state) => {
    //     return {
    //         [dayOfWeek]: {
    //         startAt: state[dayOfWeek]?.startAt,
    //         endAt: state[dayOfWeek]?.endAt,
    //         repeated: event.target.value,
    //         },
    //     };
    // });
  }
}

export function HandleSubmit(event: any) {
  const scheduleUpdater = useContext(ScheduleContext);
  console.log("A schedule was submitted:\n", scheduleUpdater.state);
  event.preventDefault();
}
