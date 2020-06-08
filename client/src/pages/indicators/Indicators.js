import React, {Component} from 'react';
import SearchStock from './SearchStock';
import './Indicators.css'
import Header from '../../Header'
class Indicators extends Component{
	render(){
		return(
			<body class='indicators'>
				<Header/>
				<br/>
				<br/>
				<br/>
				<br/>
      			<br/>
				<h1 class='heading'>Technical Indicators</h1>
				<SearchStock/>
			</body>
		)
	}
}

export default Indicators;