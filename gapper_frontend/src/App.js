import React from "react";
import "./App.less";
import Navbar from "./components/navbar/Navbar";
import { Layout } from "antd";
import { Rate } from "antd";

const { Header, Content } = Layout;

function App() {
  return (
    <div className="app">
      <Layout className="container">
        <Header className="gapper-header">
          <Navbar></Navbar>
        </Header>
        <Content style={{ backgroundColor: "#14202b" }}></Content>
      </Layout>
    </div>
  );
}

export default App;
