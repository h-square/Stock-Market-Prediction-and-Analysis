import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

class Header extends Component{
  constructor() {
    super();
    this.state = {
      username : '',
      login : false
    }
  }

  componentDidMount(){
    axios.get('/user')
      .then(res=>{
        console.log(res);
        if(res.data.status==='OK'){
          this.setState({
            username : res.data.user.name,
            login : true
          })
        }
        else{
          this.setState({
            username : '',
            login : false
          })
        }
      })
      .catch(err=>{
        console.log(err);
      })
  }
  //console.log(this.props)
  render(){
    //console.log(this.props)
    let sidebar=(this.state.login)?(
      <div>
        <ul>
          <li><Link to='./'>Home</Link></li>
          <li><Link to='./discussion'>Discussion</Link></li>
          <li><Link to='./support'>Support</Link></li>
          <li><Link to='/logout'>Logout</Link></li>
        </ul>
      </div>
    ):(
      <div>
        <ul>
          <li><Link to='./'>Home</Link></li>
          <li><Link to='./support'>Support</Link></li>
          <li><Link to='./login'>Login / Signup</Link></li>
        </ul>
      </div>
    )
    return(
        <header className='navbar'>
            <Link to='./' id="logo" >
              <span className='smap'>SMAP</span> 
            </Link> 
            <nav>
              {sidebar}
            </nav>
        </header>
    );
  }
}

export default Header;