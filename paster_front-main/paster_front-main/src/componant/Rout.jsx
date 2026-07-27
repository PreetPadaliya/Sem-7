import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Loginc from "./Loginc";
import Home from "./Home";
import Page from "./Page";
import CollabNotes from "./Repid";

export default function Rout() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Loginc />} />
        <Route path="/home" element={<Home />} />
        <Route path="/page/:id" element={<Page />} />
        <Route path="/collab" element={<CollabNotes />} />
      </Routes>
    </BrowserRouter>
  );
}
