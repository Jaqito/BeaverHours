import React from "react";
import { Welcome } from "./sample/Welcome";
import { Scheduler } from "./BeaverHours/Scheduler";

var showFunction = Boolean(process.env.REACT_APP_FUNC_NAME);

export default function Tab() {
  return (
    <div>
      {/* <Welcome showFunction={showFunction} /> */}
      <Scheduler />
    </div>
  );
}
