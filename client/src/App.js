import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router,Switch, Route, Link} from "react-router-dom"
import Home from './Components/Home';
import StreamIp from './Components/StreamIp';
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
        </Switch>
      </Router>
    </div>
  );
}

export default App;
