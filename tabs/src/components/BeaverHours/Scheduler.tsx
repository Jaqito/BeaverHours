import React from "react";
export function Scheduler() {
//   return genereateWeekTable();
    return <ScheduleForm />
}

class ScheduleForm extends React.Component<{}, {value: string}> {
  constructor(props: any) {
    super(props);
    this.state = { value: "" };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleSubmit(event) {
    alert("A name was submitted: " + this.state.value);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            value={this.state.value}
            onChange={this.handleChange}
          />
        </label>
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
          <input type="text"></input>
        </td>
        <td>
          <input type="time"></input>
        </td>
        <td>
          <input type="number" min={1}></input> weeks
        </td>
        {/* <td><input type="button" onClick={(e) => addRow(name)}>Add time</input></td> */}
      </tr>
    );
  }

  addRow(name: string) {
    this.newRow(name);
  }
}
