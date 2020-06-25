var express = require("express");
var app = express.Router();

//send msg to the customer
const account_sid = 'xxxxxxxxxxxxxxx'
const auth_token = 'xxxxxxxxxxxxxxxx'
const client = require('twilio')(account_sid, auth_token)


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
    shopid: String,
    itemid: String,
    itemname: String,
    quantity: Number,
    totalbill: String
});

nameSchema.set('versionKey', false);

var customerCol = mongoose.model("customerOrder", nameSchema); //collection


//insert the product in collection
app.get("/custorderPlaceOrder", (req, res) => {
    let bill = req.query.orderQty * req.query.itemPrice;
    client.messages.create({
        to: "+" + req.query.mobile,
        from: '+12083699650',
        body: `You have sucessfully place your order and your bill is ${bill}`
    }).then((message) => console.log(message));

    req.body['shopid'] = req.query.shopId;
    req.body['itemid'] = req.query.itemUid;
    req.body['itemname'] = req.query.itemName;
    req.body['quantity'] = req.query.orderQty;
    req.body['totalbill'] = bill;
    var custOrderData = new customerCol(req.body);
    custOrderData.save()
        .then(item => {
            //res.send({success:true,data:item});
            res.redirect("/customer-place-order.html");
        })
        .catch(err => {
            res.status(400).send("unable to save to database");
        });
});

module.exports = app;