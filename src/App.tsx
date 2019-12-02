import React, { Component } from "react";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";

import DAFAAAnonymizer from "./views/DAFAAAnonymizer";

import "./App.css";

class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <Switch>
            <Route path="/">
              <DAFAAAnonymizer />
            </Route>
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
