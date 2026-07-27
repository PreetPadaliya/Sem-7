import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";

import Rout from "./componant/Rout.jsx";
import UsrProvider from "./componant/UsrProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <UsrProvider>
      <Rout />
    </UsrProvider>
  </>
);
