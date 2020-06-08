import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../Header';
import axios from 'axios';

class Home extends Component {
  constructor() {
    super();
    this.state = {
      login : false
    }
  }

  componentDidMount(){
    axios.get('/user')
      .then(res=>{
        //console.log(res);
        if(res.data.status==='OK'){
          this.setState({
            login : true
          })
        }
        else{
          this.setState({
            login : false
          })
        }
      })
      .catch(err=>{
        console.log(err);
      })
  }
  render() {
    let watchlist = this.state.login?(
      <li><Link to="./watchlist">Watchlist</Link></li>
    ) : (null)
    return (
      <div className="App">
        <div className="home">
          <Header/>
          <div className="wrapper">
            <div className="sidebar">
              <ul>
                <li><Link to='./reports'>Annual Reports</Link></li>
                <br/>
                <li><Link to='./indicators'>Technical Indicators</Link></li>
                <br/>
                <li><Link to='./optsim'>Option Simulator</Link></li>
                <br/>
                <li><Link to='./peercomp'>Peer Comparison</Link></li>
                <br/>
                <li><Link to='./dcf'>DCF and Stock Prediction</Link></li>
                <br/>
                {watchlist}
              </ul> 
            </div>
          </div>
        </div>
      </div>
    );
  }
}


export default Home;