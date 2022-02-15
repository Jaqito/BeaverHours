import { WeekTableRow } from "./WeekTableRow";

export function WeekTable() {
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
        {WeekTableRow({dayOfWeek : "Sunday"})}
        {WeekTableRow({dayOfWeek : "Monday"})}
        {WeekTableRow({dayOfWeek : "Tuesday"})}
        {WeekTableRow({dayOfWeek : "Wednesday"})}
        {WeekTableRow({dayOfWeek : "Thursday"})}
        {WeekTableRow({dayOfWeek : "Friday"})}
        {WeekTableRow({dayOfWeek : "Saturday"})}
      </tbody>
    </table>
  );
}