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
    vendorid: String,
    vendorname: String,
    contact: String,
    country: String,
    state: String,
    city: String,
    address: String,
});

nameSchema.set('versionKey', false);

var vendorCol = mongoose.model("vendor", nameSchema); //collection



//insert the vendor in the collection
app.post("/insert_vendor", (req, res) => {
    var digits = '0123456789';
    let rid = '';
    for (let i = 0; i < 4; i++) {
        rid += digits[Math.floor(Math.random() * 10)];
    }
    req.body["vendorid"] = rid;
    var vendorData = new vendorCol(req.body);

    vendorData.save()
        .then(item => {
            //res.send({success:true,data:item});
            res.redirect("/vendor-opt.html");
        })
        .catch(err => {
            res.status(400).send("unable to save to database");
        });
});

//delete the vendor form out collection
app.post("/vendor_delete", function (req, res) {
    vendorCol.remove({
        vendorid: req.body.vendorid
    }).then(function (result) {
        res.send(result);
    }).catch(function () {
        res.send({
            err: "error"
        });
    });

});

//search the vendor in the collectipn 
app.post("/vendor_search", function (req, res) {
    vendorCol.findOne({
            vendorid: req.body.vendorid
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

//update the records in employees
app.post("/vendor_update", function (req, resp) {
    vendorCol.findOneAndUpdate({
        vendorid: req.body.vendorid
    }, {
        $set: {
            vendorname: req.body.vendorname,
            contact: req.body.contact,
            country: req.body.country,
            state: req.body.state,
            city: req.body.city,
            address: req.body.address,

        }
    }, {
        new: true
    }).then((docs) => {
        if (docs) {
            resp.send({
                success: true,
                data: docs
            });
        } else {
            resp.send({
                success: false,
                data: "no such user exist"
            });
        }
    })

});

//show all the vendor in the collection
app.get("/showallvendor", (req, res) => {
    vendorCol.find()
        .then(function (result) {
            res.json(result);
        })
        .catch(function (msg) {
            res.json({
                err: msg
            });
        });
});
module.exports = app;