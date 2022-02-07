import React from "react";
import { createContext, Dispatch, useContext, useState } from "react";

const ScheduleContext = createContext({
  state: {} as OfficeHoursSchedule,
  updateSchedule: (newSchedule: OfficeHoursSchedule) => {},
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
  const scheduler = useContext(ScheduleContext);

  const HandleChange = (event: any) => {
    event.persist();
    var splitname = event.target.name.split("-");
    var dayOfWeek = splitname[0];
    var fieldname = splitname[1];
    var newSchedule = {};
    if (fieldname === "startAt") {
      console.log("edited startAt for" + dayOfWeek);
      //   newSchedule = {
      //     [dayOfWeek]: {
      //       startAt: event.target.value,
      //       endAt: scheduler.state[dayOfWeek]?.endAt,
      //       repeated: scheduler.state[dayOfWeek]?.repeated,
      //     } as DaySchedule,
      //   };
      //   scheduler.updateSchedule({ ...scheduler.state, newSchedule });
      scheduler.updateSchedule({
        ...scheduler.state,
        [dayOfWeek]: {
          startAt: event.target.value,
          endAt: scheduler.state[dayOfWeek]?.endAt,
          repeated: scheduler.state[dayOfWeek]?.repeated,
        } as DaySchedule,
      });
    } else if (fieldname === "endAt") {
      console.log("edited endAt for" + dayOfWeek);
      //   newSchedule = {
      //     [dayOfWeek]: {
      //       startAt: scheduler.state[dayOfWeek]?.startAt,
      //       endAt: event.target.value,
      //       repeated: scheduler.state[dayOfWeek]?.repeated,
      //     } as DaySchedule,
      //   };
      //   scheduler.updateSchedule({ ...scheduler.state, newSchedule });
      scheduler.updateSchedule({
        ...scheduler.state,
        [dayOfWeek]: {
          startAt: scheduler.state[dayOfWeek]?.startAt,
          endAt: event.target.value,
          repeated: scheduler.state[dayOfWeek]?.repeated,
        } as DaySchedule,
      });
    } else if (fieldname === "repeated") {
      console.log("edited repeated for" + dayOfWeek);
      //   newSchedule = {
      // [dayOfWeek]: {
      //   startAt: scheduler.state[dayOfWeek]?.startAt,
      //   endAt: scheduler.state[dayOfWeek]?.endAt,
      //   repeated: event.target.value,
      // } as DaySchedule,
      //   };
      //   scheduler.updateSchedule({ ...scheduler.state, newSchedule });
      scheduler.updateSchedule({
        ...scheduler.state,
        [dayOfWeek]: {
          startAt: scheduler.state[dayOfWeek]?.startAt,
          endAt: scheduler.state[dayOfWeek]?.endAt,
          repeated: event.target.value,
        } as DaySchedule,
      });
    }
  };

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

// export function HandleChange(event: any) {
//   event.persist();
//   const scheduler = useContext(ScheduleContext);

//   var splitname = event.target.name.split("-");
//   var dayOfWeek = splitname[0];
//   var fieldname = splitname[1];
//   var newSchedule = {};
//   if (fieldname === "startAt") {
//     console.log("edited startAt for" + dayOfWeek);
//     newSchedule = {
//         [dayOfWeek]: {
//             startAt: event.target.value,
//             endAt: scheduler.state[dayOfWeek]?.endAt,
//             repeated: scheduler.state[dayOfWeek]?.repeated,
//         } as DaySchedule
//     };
//     scheduler.updateSchedule({...scheduler.state, newSchedule})
//   } else if (fieldname === "endAt") {
//     console.log("edited endAt for" + dayOfWeek);
//     newSchedule = {
//         [dayOfWeek]: {
//             startAt: scheduler.state[dayOfWeek]?.startAt,
//             endAt: event.target.value,
//             repeated: scheduler.state[dayOfWeek]?.repeated,
//         } as DaySchedule
//     };
//     scheduler.updateSchedule({...scheduler.state, newSchedule})
//   } else if (fieldname === "repeated") {
//     console.log("edited repeated for" + dayOfWeek);
//     newSchedule = {
//         [dayOfWeek]: {
//             startAt: scheduler.state[dayOfWeek]?.startAt,
//             endAt: scheduler.state[dayOfWeek]?.endAt,
//             repeated: event.target.value,
//         } as DaySchedule
//     };
//     scheduler.updateSchedule({...scheduler.state, newSchedule})
//   }
// }

// export function HandleSubmit(event: any) {
//   const scheduleUpdater = useContext(ScheduleContext);
//   console.log("A schedule was submitted:\n", scheduleUpdater.state);
//   event.preventDefault();
// }
