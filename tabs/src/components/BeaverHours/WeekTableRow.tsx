import { DaySchedule, WeekTableRowProps } from "./SchedulerIntefaces";
import { ScheduleContext } from "./Scheduler";
import { useContext } from "react";

export const WeekTableRow: React.FC<WeekTableRowProps> = (props) => {
  const scheduler = useContext(ScheduleContext);

  const HandleChange = (event: any) => {
    event.persist();
    var splitname = event.target.name.split("-");
    var dayOfWeek = splitname[0];
    var fieldname = splitname[1];
    if (fieldname === "startAt") {
      console.log("edited startAt for" + dayOfWeek);
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
      <th>{props.dayOfWeek}</th>
      <td>
        <input
          type="time"
          name={props.dayOfWeek + "-startAt"}
          onChange={HandleChange}
        ></input>
      </td>
      <td>
        <input
          type="time"
          name={props.dayOfWeek + "-endAt"}
          onChange={HandleChange}
        ></input>
      </td>
      <td>
        <input
          type="number"
          name={props.dayOfWeek + "-repeated"}
          min={1}
          onChange={HandleChange}
        ></input>{" "}
        weeks
      </td>
    </tr>
  );
}
