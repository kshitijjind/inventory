var express = require("express");
var app = express.Router();

var mongoose = require("mongoose");
var bodyParser = require('body-parser');

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
    req.body['shopid'] = req.query.shopId;
    req.body['itemid'] = req.query.itemUid;
    req.body['itemname'] = req.query.itemName;
    req.body['quantity'] = req.query.orderQty;
    let bill = req.query.orderQty * req.query.itemPrice;
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