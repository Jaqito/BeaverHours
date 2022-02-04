import React from "react";
export function Scheduler() {
//   return genereateWeekTable();
    return <ScheduleForm />
}

interface DaySchedule {
    startAt?: string,
    endAt?: Date, 
    repeated?: number
}

interface OfficeHoursSchedule {
    [key: string]: DaySchedule | undefined,
    "Sunday"?: DaySchedule,
    "Monday"?: DaySchedule,
    "Tuesday"?: DaySchedule,
    "Wednesday"?: DaySchedule,
    "Thursday"?: DaySchedule,
    "Friday"?: DaySchedule,
    "Saturday"?: DaySchedule,
}

class ScheduleForm extends React.Component<{}, OfficeHoursSchedule> {
  constructor(props: any) {
    super(props);
    this.state = {
       "Sunday": {} as DaySchedule,
       "Monday": {} as DaySchedule,
       "Tuesday": {} as DaySchedule,
       "Wednesday": {} as DaySchedule,
       "Thursday": {} as DaySchedule,
       "Friday": {} as DaySchedule,
       "Saturday": {} as DaySchedule,
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
            // return {
            //     [dayOfWeek]: {startAt: event.target.value} as DaySchedule} as OfficeHoursSchedule
            // }
            // var currentState = state[dayOfWeek] as DaySchedule;
            // return Object.assign({
            //     dayOfWeek: {startAt: event.target.value} as DaySchedule
            // }, state[dayOfWeek]);
            return {
                [dayOfWeek]: Object.assign({startAt: event.target.value}, state[dayOfWeek])
            }
        });
    } else if (fieldname === "endAt") {
        console.log("edited endAt for" + dayOfWeek);
        // this.setState({[dayOfWeek]: {endAt: event.target.value} as DaySchedule} as OfficeHoursSchedule);
        this.setState((state) => {
            // return {
            //     [dayOfWeek]: {startAt: event.target.value} as DaySchedule} as OfficeHoursSchedule
            // }
            // var currentState = state[dayOfWeek] as DaySchedule;
            // return Object.assign(state, {
            //     [dayOfWeek]: {endAt: event.target.value} as DaySchedule
            // } as OfficeHoursSchedule);
            return {
                [dayOfWeek]: Object.assign({endAt: event.target.value}, state[dayOfWeek])
            }
        });
    } else if (fieldname === "repeated") {
        console.log("edited repeated for" + dayOfWeek);
        // this.setState({[dayOfWeek]: {repeated: event.target.value as DaySchedule} as OfficeHoursSchedule});
        this.setState((state) => {
            return {
                [dayOfWeek]: Object.assign({repeated: event.target.value}, state[dayOfWeek])
            }
        })
    }
  }

  handleSubmit(event: any) {
    // alert("A schedule was submitted: " + this.state);
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
          <input type="time" name={name + "-startAt"} onChange={this.handleChange}></input>
        </td>
        <td>
          <input type="time" name={name + "-endAt"} onChange={this.handleChange}></input>
        </td>
        <td>
          <input type="number" name={name + "-repeated"} min={1} onChange={this.handleChange}></input> weeks
        </td>
        {/* <td><input type="button" onClick={(e) => addRow(name)}>Add time</input></td> */}
      </tr>
    );
  }

  addRow(name: string) {
    this.newRow(name);
  }
}
