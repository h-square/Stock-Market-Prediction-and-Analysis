import React, {Component} from 'react';
import Button from '@material-ui/core/Button';
import Header from '../../Header';

const qs = require('querystring');

class Login extends Component {
    initialState = {
        name: '',
        email: '',
        password: '',
        password2: '',
        formTitle: 'Login',
        loginBtn: true,
        errors: '',
        redirectionToUserHome: false,
        redirectionTologin: false
    }

    constructor(props){
        super(props);
        this.state = this.initialState;
    }
      
    login = e => {
        e.preventDefault();
        let user = {
            email: this.state.email,
            password: this.state.password
        };

        fetch('/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: qs.stringify(user)
        })
        .then(res => {
            return res.json();
        })
        .then(res => {
            //console.log(res);
            if(res.status === "OK"){
                //console.log("redirection turned on!");
                //this.state.redirectionToUserHome = true;
                //this.state.errors = false;
                this.setState({
                    redirectionToUserHome:true,
                    redirectionTologin: false,
                    errors:false 
                })
                
                //this.props.changeLogin(!this.props.loggedin)
                this.props.history.push('/')
            } else {
                //this.state.redirectionToUserHome = false;
                //this.state.errors = res.status;
                this.setState({
                    redirectionToUserHome:false,
                    redirectionTologin: false,
                    errors:res.status
                })
                
            }
            this.forceUpdate();
        })
        .catch(err => {
            console.log(err);
        });
    }

    register = e => {
        e.preventDefault();
        let user = {
            name: this.state.name,
            email: this.state.email,
            password: this.state.password,
            password2: this.state.password2
        };

        fetch('/user/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: qs.stringify(user)
        })
        .then(res => {
            return res.json();
        })
        .then(res => {
            //console.log(res);
            if(res.status === "OK"){
                //console.log("redirection turned on!");
                //this.state.redirectionToUserHome = true;
                //this.state.errors = false;
                this.setState({
                    redirectionTologin:true,
                    redirectionToUserHome: false,
                    errors:false,
                    loginBtn:true,
                    name: '',
                    email: '',
                    password: '',
                    password2: ''
                })
                
                this.props.history.push('/')
            } else {
                //this.state.redirectionToUserHome = false;
                //this.state.errors = res.errors[0].msg;
                this.setState({
                    redirectionToUserHome:false,
                    redirectionTologin:false,
                    errors:res.errors[0].msg
                })
            }
            this.forceUpdate();
        })
        .catch(err => {
            console.log(err);
        });
    }

    getAction = action => {
        if(action === 'reg'){
            this.setState(this.initialState);
            this.setState({formTitle: 'Register New User', loginBtn: false});
        }else{
            this.setState(this.initialState);
            this.setState({formTitle: 'Login', loginBtn: true});
        }
    }

    handleChange = e => {
        this.setState({[e.target.name]: e.target.value});
    }

    render(){
        //console.log(this.props)
        let submitBtn = this.state.loginBtn ? 
            (//<input className="login-submit3" type="submit" onClick={this.login} value="Enter" />
                <center><Button align='center' variant="contained" color="primary" type="submit" onClick={this.login}>
                    Login
                </Button></center>
                
            ) : 
            (//<input className="login-submit2" type="submit" onClick={this.register} value="Register" />
                <div>
                    <center><Button align='center' variant="contained" color="primary" type="submit" onClick={this.register}>
                        SignUp
                    </Button></center>
                </div>
            );

        let login_register = this.state.loginBtn ?
            (<center>
                <br/>
                Not a user? &nbsp;&nbsp;
                <Button align='center' variant="contained" color="primary" type="submit" onClick={() => this.getAction('reg')}>Register</Button>
            </center>) : 
            (<div></div>)

        let login_from = this.state.loginBtn ?
            (<div className='stock-detail'>
                <div className='form-group'>
                    <label className='form-label'>E-mail&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</label><input className='form-input'type="text" 
                    value={this.state.email} 
                    onChange={this.handleChange} 
                    name="email" 
                    />
                </div>
                <div className='form-group'>
                    <label className='form-label'>Password&nbsp;:</label><input type="password" 
                    value={this.state.password} 
                    onChange={this.handleChange} 
                    name="password" 
                    className='form-input'
                    />
                </div>
            </div>) : 
            
            (<center>
                <div className='option-detail'>
                <div className='form-group'>
                    <label className='form-label'>Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</label><input type="text" 
                    value={this.state.name} 
                    onChange={this.handleChange} 
                    name="name" 
                    className='form-input'
                    />
                </div>
                <div className='form-group'>
                    <label className='form-label'>E-mail&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</label><input type="text" 
                    value={this.state.email} 
                    onChange={this.handleChange} 
                    name="email" 
                    className='form-input'/>
                </div>
                <div className='form-group'>
                    <label className='form-label'>Password&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</label><input type="password" 
                    value={this.state.password} 
                    onChange={this.handleChange} 
                    name="password" 
                    className='form-input'/>
                </div>
                <div className='form-group'>
                    <label className='form-label'>Re-Password&nbsp;&nbsp;:</label><input type="password" 
                    value={this.state.password2} 
                    onChange={this.handleChange} 
                    name="password2"
                    className='form-input' 
                    />
                </div>
            </div>
            </center>);


        let redirectButton = this.state.redirectionTologin ?
            (<center><h4 style={{color:'green'}}>Registered successfully!</h4></center>):null;
        let error_notification = this.state.errors ? 
            (<center><h2 style={{color:'red'}}>{this.state.errors}</h2></center>) : null;

        return(
            <div className="form_block">
                <Header/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <div>
                    {redirectButton}
                    <form>
                        <div className="form-row">
                            {login_from}
                            
                            <div className='form-group'>
                                {submitBtn}
                            </div>
                        </div>
                    </form>
                    {login_register}
                </div>
                <br/>
                
                {error_notification}
            </div>
           
        )
    }
}

export default Login;