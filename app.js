const express = require('express');
const Razorpay = require('razorpay');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Razorpay with your key_id and key_secret
const razorpay = new Razorpay({
    key_id: 'rzp_test_z0IK20sbjb0BuR',
    key_secret: '5ap9jT4Oa1pxmECED2p9fDs6'
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
    res.render('payment');
});

// Create Order
app.post('/createOrder', (req, res) => {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
    }

    const options = {
        amount: amount * 100, // Amount in paise (100 paise = Rs. 1)
        currency: 'INR',
        receipt: 'order_rcptid_' + Date.now()
    };

    razorpay.orders.create(options, (err, order) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(order);
    });
});

// Handle Payment Success
app.post('/payment/success', (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const text = razorpay_order_id + '|' + razorpay_payment_id;
    const generatedSignature = crypto.createHmac('sha256', '5ap9jT4Oa1pxmECED2p9fDs6')
                                     .update(text)
                                     .digest('hex');

    if (generatedSignature === razorpay_signature) {
        res.send('Payment successful');
    } else {
        res.send('Payment failed');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
