import React, { Component } from "react";
import Button from "antd/es/button";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "./App.css";

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route path="/">
            <div className="App">
              <Button type="primary">Button</Button>
            </div>
          </Route>
        </Switch>
      </Router>
    );
  }
}

export default App;
