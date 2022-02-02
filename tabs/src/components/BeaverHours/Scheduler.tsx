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
                {newRow("Sunday")}
                {newRow("Monday")}
                {newRow("Tuesday")}
                {newRow("Wednesday")}
                {newRow("Thursday")}
                {newRow("Friday")}
                {newRow("Saturday")}
            </tbody>
        </table>
    );
}

function newRow(name: string) {
    return (
        <tr>
            <th>{name}</th>
            <td><input type="text"></input></td>
            <td><input type="time"></input></td>
            <td><input type="number" min={1}></input> weeks</td>
            {/* <td><input type="button" onClick={(e) => addRow(name)}>Add time</input></td> */}
        </tr>
    )
}

function addRow(name: string) {
    newRow(name);
}