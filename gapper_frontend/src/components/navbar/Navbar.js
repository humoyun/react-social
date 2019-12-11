import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Icon } from "antd";
// Pages
import home from "../../views/home";
import login from "../../views/login";
import signup from "../../views/signup";
import "./Navbar.less";

export class Navbar extends Component {
  render() {
    return (
      <div className="gapper-navbar">
        <div key="1">
          <Icon type="home" />
          <span>Home</span>
        </div>
        <div key="2">Moments</div>
        <div key="3">
          <Icon type="notification" theme="filled" />
          <span>Notifications</span>
        </div>
        <div key="4">
          <Icon type="message" theme="filled" />
          <span>Messages</span>
        </div>

        {/* <Content style={{ padding: "0 50px" }}>
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>List</Breadcrumb.Item>
            <Breadcrumb.Item>App</Breadcrumb.Item>
          </Breadcrumb>
          <div style={{ background: "#fff", padding: 24, minHeight: 280 }}>
            <Router>
              <Switch>
                <Route exact path="/" component={home}></Route>
                <Route exact path="/login" component={login}></Route>
                <Route exact path="/signup" component={signup}></Route>
              </Switch>
            </Router>
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Ant Design ©2018 Created by Ant UED
        </Footer> */}
      </div>
    );
  }
}

export default Navbar;
