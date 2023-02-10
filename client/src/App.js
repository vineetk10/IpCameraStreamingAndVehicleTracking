import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router,Switch, Route, Link} from "react-router-dom"
import Home from './Components/Home';
import StreamIp from './Components/StreamIp';
import Login from './Components/Login';
import Signup from './Components/Signup';
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
        </Switch>
      </Router>
    </div>
  );
}

export default App;
