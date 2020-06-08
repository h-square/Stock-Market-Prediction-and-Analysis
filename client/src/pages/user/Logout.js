import React, { Component } from 'react';
import axios from 'axios';

class Logout extends Component{
    constructor() {
        super();
        this.state = {
          logout : false
        }
    }
    componentDidMount(){
        axios.get('/user/logout')
            .then(res=>{
                if(res.data.status ==='OK'){
                    console.log('logout');
                    this.setState({
                        logout : true
                    })
                }
                //console.log(res);
            })
            .catch(err=>{
                console.log(err);
            })
    }
    render(){
        let gohome = this.state.logout?(this.props.history.push('/')):(null);
        return(
            <div>
                {gohome}
            </div>
        );
    }
}

  
export default Logout;
