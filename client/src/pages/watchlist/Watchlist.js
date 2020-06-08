import React,{Fragment,Component} from 'react';
import Button from '@material-ui/core/Button'
import Header from '../../Header';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const qs = require('querystring');

class Watchlist extends Component{

    constructor(props){
        super(props);
        this.state = {
            searched_stock: null,
            stock_list : [],
            quotes: []
        };
    }
    
    componentDidMount(){

        let self=this;
        fetch('/user/watchlist',{
            method : 'GET',
            credentials : 'include'
        })
        .then(function(response){
            return response.json()
        })
        .then(function(data){
            let temp_quotes = [];
            //console.log(data['stocks'])
            self.setState({stock_list : data['stocks']})
            for(let i in self.state.stock_list)
            {
                //let self2 = self;
                temp_quotes[i]=fetch('/api/quote/'+self.state.stock_list[i],{
                    method : 'GET'
                })
                .then(function(data){
                    return  data.json()
                })
                
            }
            Promise.all(temp_quotes).then(function(data){
                console.log(data)
                self.setState({quotes : data})
            })
        });
    }

    handleChange = (e) => {
        this.setState({[e.target.name]: e.target.value})
        //console.log(this.state)
    }

    handleAdd = (e) => {
        let self=this;
        e.preventDefault();
        //console.log(typeof(this.state.searched_stock))
        let temp = {
            stocks : [this.state.searched_stock,'.']
        }
        console.log(qs.stringify(temp))
        fetch('/user/watchlist/add',{
            method : 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            credentials : 'include',
            body: qs.stringify(temp)
        })
        .then(res => {
            return res.json();
        })
        .then(res => {
            console.log(res);
            if(JSON.stringify(res.stocks) !== JSON.stringify(self.state.stock_list)){
                fetch('/api/quote/'+self.state.searched_stock,{
                    method : 'GET'
                })
                .then(function(data){
                    return data.json();
                })
                .then(quote => {
                    self.state.quotes.push(quote);
                })
                .then(() => {
                    self.setState({stock_list: res.stocks});
                });
            }
            
        })
    }

    handleRemove = (e) => {
        let self=this;
        e.preventDefault();
        let removedStock = e.target.name;
        let temp = {
            stocks : [removedStock,'.']
        }
        console.log(qs.stringify(temp))
        fetch('/user/watchlist/remove',{
            method : 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            credentials : 'include',
            body: qs.stringify(temp)
        })
        .then(res => {
            return res.json();
        })
        .then(res => {
            //console.log(data['stocks'])
            let new_list = self.state.quotes.filter(element => {
                console.log(element);
                return element.symbol !== removedStock;
            });
            self.setState({
                stock_list : res.stocks,
                quotes: new_list
            });
            
        })
    }

    render(){
        let element = null;
        if(this.state.stock_list.length===0)
        {
            element = (<center><br/><Typography variant='h6' style={{color:''}}>Watchlist is empty!</Typography></center>)
        }
        else
        {
            if(this.state.quotes.length===this.state.stock_list.length)
            {
                element = (
                    <div>
                        <br />
                        <Typography align='center' variant='h5'>Your Watchlist</Typography>
                        <br/>
                        <TableContainer component={Paper}>
                            <Table aria-label='simple table'>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Company</TableCell>
                                        <TableCell align='center'>open</TableCell>
                                        <TableCell align='center'>high</TableCell>
                                        <TableCell align='center'>low</TableCell>
                                        <TableCell align='center'>price</TableCell>
                                        <TableCell align='center'>volume</TableCell>
                                        <TableCell align='center'>lastTradingDay</TableCell>
                                        <TableCell align='center'>previousClose</TableCell>
                                        <TableCell align='center'>change</TableCell>
                                        <TableCell align='center'>changePercent</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {this.state.stock_list.map((inputField, index)=>(
                                            <Fragment key={`${inputField}~${index}`}>
                                                <TableRow>
                                                    <TableCell >{inputField}<button name={inputField} onClick={this.handleRemove}>-</button></TableCell>
                                                    <TableCell align='center'>{this.state.quotes[index]['open']}</TableCell>
                                                    <TableCell align='center'>{this.state.quotes[index]['high']}</TableCell>
                                                    <TableCell align='center'>{this.state.quotes[index]['low']}</TableCell>
                                                    <TableCell align='center'>{this.state.quotes[index]['price']}</TableCell>
                                                    <TableCell align='center'>{this.state.quotes[index]['volume']}</TableCell>
                                                    <TableCell align='center'>{this.state.quotes[index]['lastTradingDay']}</TableCell>
                                                    <TableCell align='center'>{this.state.quotes[index]['previousClose']}</TableCell>
                                                    <TableCell align='center'>{this.state.quotes[index]['change']}</TableCell>
                                                    <TableCell align='center'>{this.state.quotes[index]['changePercent']}</TableCell>
                                                </TableRow>
                                            </Fragment>
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                 )
            
            }
        }

        return (
            <div>
                <Header/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <form>
                    <div className='ind-detail'>
                        <label className='ind-label'>Ticker Symbol:</label>
                        <input className='ind-input' type="text" onChange={this.handleChange} placeholder='Enter Value' name='searched_stock' id="stock_input"/>
                    </div>
                    <br/>
                    <center><Button align='center' variant='contained' color='primary' onClick={this.handleAdd}>Add</Button></center>
                </form>
                {element}
            </div>
        )
    }
}

export default Watchlist;