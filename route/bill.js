var express = require("express");
var app = express.Router();
var fs = require('fs');
var path = require('path');
var multer = require('multer');



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
    vendorid: String,
    vendorgst: String,
    billno: String,
    totalitem: Number,
    totalbill: String,
    billcopy: String,

});

nameSchema.set('versionKey', false);

var billCol = mongoose.model("bill", nameSchema); //collection

var filename;

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'bill');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
        filename = file.originalname;
    }
});
var upload = multer({
    storage: storage
});

//insert the bill into the bill collection
app.post("/insert_bill", upload.single('billcopy'), (req, res) => {
    req.body['billcopy'] = filename;
    var billData = new billCol(req.body);
    billData.save()
        .then(item => {
            //res.send({success:true,data:item});
            res.redirect("/bill.html");
        })
        .catch(err => {
            res.status(400).send("unable to save to database");
        });
});

//search the record of the bill
app.post("/show_bill", function (req, res) {
    billCol.findOne({
            $and: [{
                vendorid: req.body.vendorid,
                billno: req.body.billno
            }]
        })
        .then(function (result) {
            res.send(result);
        })
        .catch(function (msg) {
            res.send({
                err: msg
            });
        });
});
module.exports = app;