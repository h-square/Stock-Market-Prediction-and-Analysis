import React from 'react';
import { Component } from 'react';
import axios from 'axios';
import Loading from '../../Images/Loading.gif';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Header from '../../Header'
import './Reports.css'

class Reports extends Component {
  constructor() {
    super();
    this.state = {
      symbol: '',
      year: '',
      showData: false,
      data: null,
      error: false,
      print: false
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    })
  }
  handleSubmit(e) {
    e.preventDefault();
    this.setState({
      showData:false,
      error:false,
      data: null,
      print: true
    })
    var sym=this.state.symbol.toUpperCase()
    axios.get(`/api/report/${sym}-${this.state.year}`)
      .then(res => {
        //console.log(res.data);
        if(res.data.status==='OK'){
          this.setState({
            symbol:'',
            year:'',
            data: res.data,
            showData: true,
            error: false,
            print: false
          })
        }
        else{
          this.setState({
            symbol:'',
            year:'',
            showData: false,
            error: true,
            print:false
          })
        }
      })
      .catch(err => {
        this.setState({
          symbol:'',
          year:'',
          showData: false,
          error: true,
          print:false
        })
      });
  }
  render() {
    
    // let dataMarkUp = this.state.data ? (
    //   this.state.data.map(dataitem => <div> {dataitem}</div>))
    //   : (<p> loading.. </p>)
    const StyledTableCell = withStyles((theme) => ({
      head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
      },
      body: {
        fontSize: 14,
      },
    }))(TableCell);
    
    const StyledTableRow = withStyles((theme) => ({
      root: {
        '&:nth-of-type(odd)': {
          backgroundColor: theme.palette.background.default,
        },
      },
    }))(TableRow);

    const dataDisplay=this.state.showData? (
      //console.log(this.state.data),
      <div className='container' id='content-area'>
        <br/>
        <center><Typography variant ='h4' className='red lighten-2' color='error'>
          {this.state.data.symbol} {this.state.data.year}
        </Typography></center>
        <section id="profit-loss">
          <div className="flex-row">
            <Typography variant='h4' color='primary'>
              Profit and Loss
              <Typography variant='body2' color='textSecondary'> Figures in Rs. Crores</Typography>
            </Typography>
          </div>
          <div className="flex-filler"></div>
          <TableContainer component={Paper} className="responsive holder" data-result-table>
            <Table className='striped responsive-text-nowrap' aria-label='simple table'>
              <TableBody>
                <StyledTableRow className='stripe highlight'>
                  <StyledTableCell>Sales</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.income_statement['Revenue']/10000000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell >Sales Growth%&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</StyledTableCell>
                  <StyledTableCell align='left'>{Math.round((this.state.data.income_statement['Revenue Growth']+Number.EPSILON)*10000)/10000}%</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell >Net Expenses</StyledTableCell>
                  <StyledTableCell align='left'>{(this.state.data.income_statement['R&D Expenses']+this.state.data.income_statement['SG&A Expense']+this.state.data.income_statement['Operating Expenses']+this.state.data.income_statement['Interest Expense']+this.state.data.income_statement['Income Tax Expense'])/10000000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>R&D Expenses</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.income_statement['R&D Expenses']/10000000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>SG&A Expenses</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.income_statement['SG&A Expense']/10000000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Operating Expenses</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.income_statement['Operating Expenses']/10000000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Interest Expenses</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.income_statement['Interest Expense']/10000000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell >Income Tax Expenses</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.income_statement['Income Tax Expense']/10000000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell >Operating Profit</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.income_statement['Operating Income']/10000000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell >Profit before Tax</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.income_statement['Earnings before Tax']/10000000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Net Profit</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.income_statement['Net Income']/10000000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Profit Margin</StyledTableCell>
                  <StyledTableCell align='left'>{Math.round((this.state.data.income_statement['Profit Margin']+Number.EPSILON)*10000)/10000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>EPS in Rs.</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.income_statement['EPS']}</StyledTableCell>
                </StyledTableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </section>
        <br/>
        <br/>
        <section id='balance-sheet'>
          <div className="flex-row">
          <Typography variant='h4' color='primary'>
              Balance Sheet
              <Typography variant='body2' color='textSecondary'> Figures in Rs. Crores</Typography>
            </Typography>
          </div>
          <TableContainer component={Paper} className="responsive holder" data-result-table>
            <Table className='striped'>
              <TableBody>
                <StyledTableRow>
                  <StyledTableCell>Total Shareholders Equity</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.balance_statement['Total shareholders equity']/10000000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Receivables</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.balance_statement['Receivables']/10000000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Inventories</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.balance_statement['Inventories']/10000000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Tax Liabilities</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.balance_statement['Tax Liabilities']/10000000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Total Liabilities</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.balance_statement['Total liabilities']/10000000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Short-Term Investments</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.balance_statement['Short-term investments']/10000000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Long-Term Investments</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.balance_statement['Long-term investments']/10000000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Investments</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.balance_statement['Investments']/10000000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Cash Equivalants</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.balance_statement['Cash and cash equivalents']/10000000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Goodwill and Intangible Assets</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.balance_statement['Goodwill and Intangible Assets']/10000000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Total Assets</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.balance_statement['Total assets']/10000000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Short Term Debt</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.balance_statement['Short-term debt']/10000000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Long Term Debt</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.balance_statement['Long-term debt']/10000000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Net Debt</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.balance_statement['Net Debt']/10000000}</StyledTableCell>
                </StyledTableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </section>
        <br/>
        <br/>
        <section id='cash-flows'>
          <div className="flex-row">
            <Typography variant='h4' color='primary'>
              Cash Flows
              <Typography variant='body2' color='textSecondary'> Figures in Rs. Crores</Typography>
            </Typography>
          </div>
          <TableContainer component={Paper} className="responsive holder" data-result-table>
            <Table className='striped'>
              <TableBody>
                <StyledTableRow>
                  <StyledTableCell>Cash from Operating Activity&nbsp;&nbsp;&nbsp;&nbsp;</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.cash_statement['Operating Cash Flow']/10000000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Cash from Investing Activity</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.cash_statement['Investing Cash flow']/10000000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Cash from Financial Activity</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.cash_statement['Financing Cash Flow']/10000000}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Net Cash Flow</StyledTableCell>
                  <StyledTableCell align='left'>{this.state.data.cash_statement['Net cash flow / Change in cash']/10000000}</StyledTableCell>
                </StyledTableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </section>
        <br/>
        <br/>
        <section id='ratios'>
          <div className="flex-row">
            <Typography variant='h4' color='primary'>
              Ratios
              <Typography variant='body2' color='textSecondary'> Figures in Rs. Crores</Typography>
            </Typography>
          </div>
          <TableContainer component={Paper} className="responsive holder" data-result-table>
            <Table className='striped'>
              <TableBody>
                <StyledTableRow>
                  <StyledTableCell>ROCE%</StyledTableCell>
                  <StyledTableCell align='left'>{Math.round((this.state.data.income_statement['EBIT']/(this.state.data.balance_statement['Total assets']-this.state.data.balance_statement['Total current liabilities']))*10000)/100}%</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>Debter Days&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</StyledTableCell>
                  <StyledTableCell align='left'>{Math.round((this.state.data.balance_statement['Receivables']/this.state.data.income_statement['Revenue'])*365*10000)/100}</StyledTableCell>
                </StyledTableRow>
                <StyledTableRow>
                  <StyledTableCell>ROE%</StyledTableCell>
                  <StyledTableCell align='left'>{Math.round((this.state.data.income_statement['Net Income']/(this.state.data.balance_statement['Total shareholders equity']))*10000)/100}%</StyledTableCell>
                </StyledTableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </section>
      </div>
    ):(
      this.state.print?(
      //console.log(this.state),
        <div>
          <center>
            <img src={Loading} alt="loading..." />
          </center>
        </div>
      ):(
          this.state.error?(
            <div>
              <Typography color='error' variant='h4' align='center'>Enter valid input!</Typography>
              <Typography variant='h4'>Check following details:</Typography>
              <ul className='collection'>
                <li className='collection-item'><Typography variant='h6'>Check whether the ticker symbol you have entered is valid or not</Typography></li>
                <li className='collection-item'><Typography variant='h6'>Check whether the year you have entered is valid or not!</Typography></li>
              </ul>
              <Typography variant='h6'>If you think this is a mistake then email us at <Typography color='primary' variant='caption' className='blue-text'>smap.help@gmail.com</Typography></Typography>
            </div>
          ):(
          
            <div>
              <br/>
              <Typography align='center' variant='h5'>Access the Annual reports by just one click!</Typography>
            </div>
          )
      )
      
    )
    
    /*let dataMarkUp = this.state.data ? (
      //console.log(this.state.data),
    <h3>{this.state.data.symbol} and {this.state.data.year}</h3>
    ) : <p>loading...</p>*/
    return (
      <div className='reports'>
        <Header/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <Typography align='center' color='primary' variant='h3'>
           Annual Report
        </Typography>
        <br/>
        <div className='row'>
          <form>
            <div className='form-row'>
              <div className='stock-detail'>
                <div className='form-group'>
                  <label className='form-label'>Ticker Symbol:</label>
                  <input className='form-input' type='text' name='symbol' onChange={this.handleChange} value={this.state.symbol} />
                </div>
                <div className='form-group'>
                  <label className='form-label'>Year&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</label>
                  <input className='form-input' type='text' name='year' onChange={this.handleChange} value={this.state.year} maxLength='4' />
                </div>
              </div>
            </div>
            <div className='form-row'>
            <center><Button align='center' variant="contained" color="primary" type="submit" name="action" onClick={this.handleSubmit}>
                Submit
            </Button></center>
            </div>
          </form>
        </div>
        
        {dataDisplay}
      </div>
    )
  }
}

export default Reports;