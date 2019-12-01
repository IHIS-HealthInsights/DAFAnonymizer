import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import AnonPreviewer from "./views/AnonPreviewer";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <Switch>
            <Route path="/">
              <AnonPreviewer />
            </Route>
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
