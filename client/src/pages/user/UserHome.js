import React,{Component} from 'react';
import {Link} from 'react-router-dom';

class UserHome extends Component{
    constructor(props){
        super(props);
        this.state = {
            user: null,
            loggedout: false
        };
    }

    componentDidMount(){
        fetch('/user', {
            method: 'GET',
            credentials: 'include'
        })
        .then(res => {
            console.log(res.status);
            return res.json();
        })
        .then(data => {
            console.log(data);
            return data.user;
        })
        .then(user => {
            //this.state.user = user;
            this.setState({
                user:user
            })
            console.log(user);
            this.forceUpdate();
        })
        .catch(err => {
            console.log(err);
        });
    };

    logout=(e)=>{
        fetch('/user/logout', {
            method: 'GET',
            credentials: 'include'
        })
        .then(res => {
            console.log(res.status);
            return res.json();
        })
        .then(res => {
            console.log(res);
            if(res.status === "OK"){
                //this.state.loggedout = true;
                //this.state.user = null;
                this.setState({
                    loggedout:true,
                    user:null
                })
            } else {
                //this.state.loggedout = false;
                this.setState({
                    loggedout:false
                })
            }
            this.forceUpdate();
        })
        .catch(err => {
            console.log(err);
        });
    }

    render(){
        if(this.state.user){
            return(
                <div className="col-md-6">
                <h1>You are home, {this.state.user.name}..!</h1>
                <Link to={"/user/watchlist"}><button variant="raised">View/Modify Watchlist</button></Link>
                <button onClick={this.logout}>Logout</button>
                </div>
            )
        } else if (this.state.loggedout){
            return(
                <div className="col-md-6">
                <h1>You logged out successfully!</h1>
                <Link to={"/login"}><button variant="raised">Return to login page</button></Link>
                </div>
            )
        } else {
            return(
                <div className="col-md-6">
                <h1>You are not logged in!</h1>
                <Link to={"/login"}><button variant="raised">Return to login page</button></Link>
                </div>
            )
        }
    }
}

export default UserHome;