var React = require('react');
var Component = React.Component;
var qs = require('querystring');
//var axios = require('axios');

class CookieTest extends Component {

	render() {
		return (
            <p>
                This is just a cookie test page.
            </p>
        );
    }
    

	componentDidMount(){
        console.log(`I'm in...!!`);
        fetch('/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: qs.stringify({
                email: 'bhargey@gmail.com',
                password: 'bhargey'
            })
        })
        .then(res => {
            console.log(res.status);
            return res.json();
        })
        .then(data => {
            console.log(data);
            console.log('accessing dashboard');
            return fetch('/dashboard', {
                method: 'GET',
                credentials: 'include'
            })
            .then(res => res.json())
        })
        .then(res => console.log(res))
        .then(() => {
            console.log('now calling logout!');
            return fetch('/user/logout', {
                method: 'GET',
                credentials: 'include'
            })
            .then(res => res.json())
        })
        .then(res => console.log(res))
        .then(() => {
            console.log('accessing dashboard');
            return fetch('/dashboard', {
                method: 'GET',
                credentials: 'include'
            })
            .then(res => res.json())
        })
        .then(res => console.log(res));
        
    }


    
}
export default CookieTest;