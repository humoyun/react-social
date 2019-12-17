import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Icon } from "antd";
// Pages
import home from "../../views/Home";
import login from "../../views/Login";
import signup from "../../views/Signup";
import "./Navbar.less";

export class Navbar extends Component {
  render() {
    return (
      <div className="gapper-navbar">
        <div className="navbar-item">
          <div className="item-box">
            <Icon type="home" />
            <span>Home</span>
          </div>
          <div className="item-box">Moments</div>
          <div className="item-box">
            <Icon type="notification" theme="filled" />
            <span>Notifications</span>
          </div>
          <div className="item-box">
            <Icon type="message" theme="filled" />
            <span>Messages</span>
          </div>
        </div>

        <div className="navbar-item">
          <Icon
            type="twitter"
            style={{ color: "#2196f3", fontSize: "2.2em" }}
          />
        </div>
        <div className="navbar-item"></div>

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
