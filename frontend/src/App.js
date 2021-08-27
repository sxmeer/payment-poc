import logo from './logo.svg';
import './App.css';
import React from 'react';
import { loadScript } from './utils';

function App() {

  function displayRazorpay() {
    loadScript('https://checkout.razorpay.com/v1/checkout.js')
      .then(isLoaded => {
        if (!isLoaded) {
          // script did not load
          throw Error("Payment failed");
        } else {
          return fetch('http://localhost:5000/payment/amount', { method: 'POST' })
            .then((t) => t.json())
            .catch(err => { throw err });
        }
      })
      .then(data => {
        console.log(data);
        const options = {
          key: process.env.RAZORPAY_KEY_ID,
          currency: data.currency,
          amount: data.amount.toString(),
          order_id: data.id,
          handler: function (response) {
            //on success of payment
            console.log(response);
          },
          prefill: {
            name: "dummy name",
            email: 'dummyemail',
          },
          notes: {
            "billing_address": "dummy address"
          }
        }
        const paymentObject = new window.Razorpay(options)
        paymentObject.open()
      })
      .catch(err => {
        console.log(err);
      });
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <p
          className="App-link"
          onClick={displayRazorpay}>
          Donate $5
        </p>
      </header>
    </div>
  )
}

export default App;