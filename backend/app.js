const express = require("express");
const app = express();
const shortid = require('shortid');
const Razorpay = require('razorpay');
const cors = require('cors');
const crypto = require('crypto');
const log = console.log;

app.use(cors())
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.get("/", (req, res, next) => {
  res.status(200).json({
    message: "Server is up and running"
  });
});

app.post('/payment/order/create', (req, res) => {
  log("/payment/order/create");
  const digest = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  log(req.body);
  log(req.body.payload.payment);
  log(digest);
  log(req.headers['x-razorpay-signature']);

  if (digest === req.headers['x-razorpay-signature']) {
    res.json({ status: 'ok' })
  } else {
    return res.status(400).json({
      status: 'not-ok'
    });
  }
})

app.post('/payment/amount', async (req, res) => {
  log("/payment/amount");
  const payment_capture = 1
  const amount = 499
  const currency = 'INR'
  const receipt = shortid.generate();

  const options = {
    amount: amount * 100,
    currency,
    receipt,
    payment_capture
  };

  log(options);

  razorpay.orders.create(options)
    .then(creationResponse => {
      log(creationResponse);
      if (!creationResponse) {
        let error = new Error("Error creating order");
        error.status = 500;
        throw error;
      }
      return res.status(200).json({
        id: creationResponse.id,
        currency: creationResponse.currency,
        amount: creationResponse.amount
      });
    })
    .catch(err => {
      return next(err);
    });
});

app.use((err, req, res, next) => {
  err.status = err.status || 500;
  return res.status(err.status)
    .json({
      message: err.message
    });
});

app.listen(5000, () => {
  console.log('Listening on 5000')
});