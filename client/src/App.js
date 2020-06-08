import React from 'react';
import { Route, Switch, BrowserRouter } from 'react-router-dom';
import './App.css';
import Home from './pages/home/Home';
import Indicators from './pages/indicators/Indicators';
import Optsim from './pages/options/Optsim';
import Reports from './pages/reports/Reports';
import CookieTest from './pages/cookietest/Cookietest'
import Login from './pages/user/Login';
import UserHome from './pages/user/UserHome';
import Peer_comp from './pages/peer-comp/Peer_comp';
import Support from './pages/Help_page/Support';
import Logout from './pages/user/Logout';
import Watchlist from './pages/watchlist/Watchlist';
import Dcf from './pages/dcf/Dcf'
import Discussion from './pages/discussion_portal/Discussion'

function App(){
  return(
    <div className="App">
      <BrowserRouter>
        <div>
          <Switch>
            <Route exact path='/' component={Home}/>
            <Route path='/indicators' component={Indicators}/>
            <Route path='/optsim' component={Optsim}/>
            <Route path='/reports' component={Reports}/>
            <Route path='/cookietest' component={CookieTest}/>
            <Route path='/login' component={Login}/>
            <Route path='/user/home' component={UserHome}/>
            <Route path='/peercomp' component={Peer_comp}/>
            <Route path='/support' component={Support}/>
            <Route path='/watchlist' component={Watchlist}/>
            <Route path='/logout' component={Logout}/>
            <Route path='/dcf' component={Dcf}/>
            <Route path="/discussion" component={Discussion}/>
          </Switch>
        </div>
      </BrowserRouter>
    </div>
  );
}
/*class App extends Component {
  render() {
    const App = () => (
      <div>
        <Switch>
          <Route exact path='/' component={Home}/>
          <Route path='/indicators' component={Indicators}/>
          <Route path='/optsim' component={Optsim}/>
          <Route path='/reports' component={Reports}/>
          <Route path='/cookietest' component={CookieTest}/>
          <Route path='/login' component={Login}/>
          <Route path='/user/home' component={UserHome}/>
          <Route path='/peercomp' component={Peer_comp}/>
          <Route path='/support' component={Support}/>
          <Route path='/watchlist' component={Watchlist}/>
          <Route path='/logout' component={Logout}/>
          <Route path='/dcf' component={Dcf}/>
          <Route path="/discussion" component={Discussion}/>
        </Switch>
      </div>
    )
    return (
      <Switch>
        <Header/>
        <App/>
      </Switch>
    );
  }
}*/

export default App;