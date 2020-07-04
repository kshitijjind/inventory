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
    shopid: String,
    itemid: String,
    itemname: String,
    quantity: Number,
    Date: String,
    totalbill: String,
    advpayment: String,
    raw: String,
    status: Number
});

nameSchema.set('versionKey', false);

var customerCol = mongoose.model("customerOrder", nameSchema); //collection


//insert the product in collection
app.get("/custorderPlaceOrder", (req, res) => {
    let laparray = "'screen', 'keybord', 'mouse', 'harddisk'";
    let mobilearray = "'charger', 'earphones', 'camera'";
    let ipodarray = "'box', 'charger', 'body'";
    let ipadarray = "'box', 'charger', 'body'";

    let bill = (req.query.orderQty * req.query.itemPrice) + (req.query.orderQty * req.query.itemPrice) * 18 / 100;

    // client.messages.create({
    //     to: "+" + req.query.mobile,
    //     from: '+12083699650',
    //     body: `You have sucessfully place your order and your bill is ${bill}`
    // }).then((message) => console.log(message));
    req.body['shopid'] = req.query.shopId;
    req.body['itemid'] = req.query.itemUid;
    req.body['itemname'] = req.query.itemName;
    req.body['quantity'] = req.query.orderQty;
    req.body["Date"] = date;
    req.body['totalbill'] = bill;
    req.body['advpayment'] = bill - req.query.payment;
    if (req.query.itemName == "laptop")
        req.body['raw'] = laparray;
    else if (req.query.itemName == "mobile")
        req.body['raw'] = mobilearray;
    else if (req.query.itemName == "ipod")
        req.body['raw'] = ipodarray;
    else if (req.query.itemName == "ipad")
        req.body['raw'] = ipadarray;
    req.body['status'] = 0;
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

//show the pending order
app.get("/showpendingorder", (req, res) => {
    customerCol.find({
            $and: [{
                status: 0
            }, {
                Date: req.query.currentDate
            }]
        })
        .then(function (result) {
            console.log(result);
            res.json(result);
        })
        .catch(function (msg) {
            res.json({
                err: msg
            });
        });

});

app.get("/updatependingorder", (req, res) => {
    console.log(req.query.orderUid);
    customerCol.findOneAndUpdate({
        _id: req.query.orderUid
    }, {
        $set: {
            status: 1
        }
    }, {
        new: true
    }).then((docs) => {
        if (docs) {
            console.log("order accepted")
            res.send({
                success: true,
                data: docs
            });
        } else {
            res.send({
                success: false,
                data: "no such user exist"
            });
        }
    })
});

module.exports = app;