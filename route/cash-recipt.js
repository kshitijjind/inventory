var express = require("express");
var app = express.Router();
var date = require("date-and-time");


//send msg to the customer
// const account_sid = 'xx'
// const auth_token = 'xx'
// const client = require('twilio')(account_sid, auth_token)

//curent date
let nowDate = new Date();
let currDate = ("0" + nowDate.getDate()).slice(-2);
let currMonth = ("0" + (nowDate.getMonth() + 1)).slice(-2);

var date = nowDate.getFullYear() + '-' + currMonth + '-' + currDate;

var mongoose = require("mongoose");
var bodyParser = require('body-parser');
const {
    response
} = require("express");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.Promise = global.Promise;

//databse connectivity
mongoose.connect("mongodb://localhost:27017/inventory", {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => {
    console.log("Connected to database");
}).catch((err) => {
    console.log(err);
});

//collection schema
var nameSchema = new mongoose.Schema({
    date: String,
    reciptnumber: String,
    itemid: String,
    price: Number,
    advpay: Number,
    balancepay: Number,
    gst: String,
});

nameSchema.set('versionKey', false);

var reciptCol = mongoose.model("reciptbox", nameSchema); //collection


//insert the product in collection
app.get("/generaterecipt", (req, res) => {
    var digits = '0123456789';
    let rid = '';
    for (let i = 0; i < 4; i++) {
        rid += digits[Math.floor(Math.random() * 10)];
    }
    // client.messages.create({
    //     to: "+" + req.query.mobile,
    //     from: '+12083699650',
    //     body: `You have sucessfully place your order and your rciept is ${bill}`
    // }).then((message) => console.log(message));
    req.body["Date"] = date;
    req.body["reciptnumber"] = rid;
    req.body['itemid'] = req.query.itemUid;
    req.body['price'] = req.query.itemPrice;
    req.body['advpay'] = req.query.payment;
    req.body['balancepay'] = req.query.itemPrice - req.query.payment;
    req.body['gst'] = req.query.payment * 18 / 100;

    var reciptData = new reciptCol(req.body);
    reciptData.save()
        .then(item => {
            //res.send({success:true,data:item});
            res.redirect("/customer-place-order.html");
        })
        .catch(err => {
            res.status(400).send("unable to save to database");
        });
});




module.exports = app;