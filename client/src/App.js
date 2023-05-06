import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router,Switch, Route, Link} from "react-router-dom"
import Home from './Components/Home';
import StreamIp from './Components/StreamIp';
import Login from './Components/Login';
import Signup from './Components/Signup';
import AddIPCamera from './Components/AddIPCamera';
import OpenViduReact from './Components/OpenViduReact';
import React from 'react';
import Recordings from './Components/Recordings';
import IpCameraStreaming from './Components/IpCameraStreaming';
function App() {
  return (
    <div className="App">
        <Router>
        <Switch>
          <Route exact path="/">
              <Home/>
          </Route>
          <Route exact path="/stream">
              <StreamIp/>
          </Route>
          <Route exact path="/login">
              <Login/>
          </Route>
          <Route exact path="/signup">
              <Signup/>
          </Route>
          <Route exact path="/addCamera">
              <AddIPCamera/>
          </Route>
          <Route exact path="/streamOpenVidu">
              <OpenViduReact/>
          </Route>
          <Route exact path="/showRecordings">
              <Recordings/>
          </Route>
          <Route exact path="/ipcamstream">
              <IpCameraStreaming/>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
