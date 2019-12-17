import React from "react";
import "./App.less";
import Navbar from "./components/navbar/Navbar";

function App() {
  return (
    <div className="app">
      <div className="container">
        <div className="gapper-header">
          <Navbar></Navbar>
        </div>
        <div style={{ backgroundColor: "#14202b" }}></div>
      </div>
    </div>
  );
}

export default App;
