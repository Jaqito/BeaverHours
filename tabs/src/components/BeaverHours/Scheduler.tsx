// const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function Scheduler() {
    return genereateWeekTable();
}

function genereateWeekTable() {
    return (
        <table>
            <thead>
                <tr>
                    <th></th>
                    <th>
                        Start At:
                    </th>
                    <th>
                        End At:
                    </th>
                    <th>
                        Repeat for:
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th>Sunday</th>
                    <td><input type="text"></input></td>
                    <td><input type="time"></input></td>
                    <td><input type="number"></input> weeks</td>
                    <td><input type='button'>Add time</input></td>
                </tr>
                <tr>
                    <th>Monday</th>
                </tr>
                <tr>
                    <th>Tuesday</th>
                </tr>
                <tr>
                    <th>Wednesday</th>
                </tr>
                <tr>
                    <th>Thursday</th>
                </tr>
                <tr>
                    <th>Friday</th>
                </tr>
                <tr>
                    <th>Saturday</th>
                </tr>
            </tbody>
        </table>
    );
}
