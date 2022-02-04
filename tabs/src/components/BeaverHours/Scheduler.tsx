import React from "react";
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

class ScheduleForm extends React.Component<{}, OfficeHoursSchedule> {
  constructor(props: any) {
    super(props);
    this.state = {
      Sunday: {} as DaySchedule,
      Monday: {} as DaySchedule,
      Tuesday: {} as DaySchedule,
      Wednesday: {} as DaySchedule,
      Thursday: {} as DaySchedule,
      Friday: {} as DaySchedule,
      Saturday: {} as DaySchedule,
    } as OfficeHoursSchedule;

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event: any) {
    event.persist();
    var splitname = event.target.name.split("-");
    var dayOfWeek = splitname[0];
    var fieldname = splitname[1];
    if (fieldname === "startAt") {
      console.log("edited startAt for" + dayOfWeek);
      this.setState((state) => {
        return {
          [dayOfWeek]: {
            startAt: event.target.value,
            endAt: state[dayOfWeek]?.endAt,
            repeated: state[dayOfWeek]?.repeated,
          },
        };
      });
    } else if (fieldname === "endAt") {
      console.log("edited endAt for" + dayOfWeek);
      this.setState((state) => {
        return {
          [dayOfWeek]: {
            startAt: state[dayOfWeek]?.startAt,
            endAt: event.target.value,
            repeated: state[dayOfWeek]?.repeated,
          },
        };
      });
    } else if (fieldname === "repeated") {
      console.log("edited repeated for" + dayOfWeek);
      this.setState((state) => {
        return {
          [dayOfWeek]: {
            startAt: state[dayOfWeek]?.startAt,
            endAt: state[dayOfWeek]?.endAt,
            repeated: event.target.value,
          },
        };
      });
    }
  }

  handleSubmit(event: any) {
    console.log("A schedule was submitted:\n", this.state);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        {this.genereateWeekTable()}
        <input type="submit" value="Submit" />
      </form>
    );
  }

  genereateWeekTable() {
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
          {this.newRow("Sunday")}
          {this.newRow("Monday")}
          {this.newRow("Tuesday")}
          {this.newRow("Wednesday")}
          {this.newRow("Thursday")}
          {this.newRow("Friday")}
          {this.newRow("Saturday")}
        </tbody>
      </table>
    );
  }

  newRow(name: string) {
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

  addRow(name: string) {
    this.newRow(name);
  }
}
