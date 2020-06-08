import React, { Component } from 'react';
import Header from '../../Header';
import './Support.css'
class Support extends Component {
  render() {
    return (
      <div className="App">
        <body class="Support">
          <Header/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <h1 class="support-header" style={{color : "black"}} > Purpose of the website </h1>
          <hr width="35%" class="ruler"></hr>
          <br/>
          <p class="para"> 
          The main aim of this website is to help stock market investors and traders in making the trades by giving them 
          an easy to use tool to access and interpret data.  
          </p>
          <br/>
          <p class="para">
          The traders can view price movements, overlap them with other technical indicators such as SMA, EMA etc. The traders can view the annual report published by a company. Various options can also be simulated using an option simulator which calculates the payoff of the trader in various scenarios. They can also get some predictions regarding the stock price using the DCF and LSTM methods. 
          </p>
          <br/>
          <p class="para">
          The traders can register and maintain their watchlist. Every stock in the watchlist is monitored periodically by a server for price fluctuations and crossing a certain limit results in an e-mail notification to the user. The traders can also maintain a portfolio of their choice and share it with other users.
          </p>
          <br/>
          <p class="para">
          The traders can also take part in discussions regarding the market in a discussion forum. Users can post threads, comment on threads and upvote/downvote the threads. Admins can delete a thread if some abusive content is present in a comment/thread.     
          </p>
          <br/>
          <h1 class="support-header" style={{color : "black"}} > About Us </h1>
          <hr width="35%" class="ruler"></hr>
          <br/>
          <p class="para" style={{textDecoration: "underline"}}>Contact us at: smap.help@gmail.com </p>
          <br/>
          <p class="para">
              We are a bunch of students pursuing our B.Tech (ICT with minors in CS) from DA-IICT, Gandhinagar, Gujarat and have made this website as a part of a course project assigned to us.
          </p>
          <p class="paraimg">
              The website is developed and managed collectively by the following people:
              <br/>
            <section class="support-container">
                <div class="left-half">
                <article>
                <ul>
                    <li>Bhargey Mehta</li>
                    <li>Anirudh Beriya</li>
                    <li>Chintan Kaliyani</li>
                    <li>Dhruvil Sutariya</li>
                    <li>Dilip Valiya</li>
                    <li>Harsh Tank</li>
                </ul>
                </article>
                </div>
                <div class="right-half">
                <article>
                <ul>
                    <li>Husain Hirani</li>
                    <li>Jhanvi Chauhan</li>
                    <li>Kishan Kavathiya</li>
                    <li>Rag Patel</li>
                    <li>Rudra Patel</li>
                    <li>Romil Parikh</li>
                </ul>
                </article>                   
                </div>
            </section>
          </p>
        </body>
      </div>
    );
  }
}
export default Support;