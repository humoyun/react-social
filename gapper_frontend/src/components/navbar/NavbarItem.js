import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Icon } from "antd";

import "./NavbarItem.less";

export class Navbar extends Component {
  render() {
    return (
      <div className="navbar-item">
        <div className="item-box">
          <Icon type="home" />
          <span>Home</span>
        </div>
        <div className="item-box">Moments</div>
        <div key="3">
          <Icon type="notification" theme="filled" />
          <span>Notifications</span>
        </div>
        <div className="item-box">
          <Icon type="message" theme="filled" />
          <span>Messages</span>
        </div>
      </div>
    );
  }
}

export default Navbar;
