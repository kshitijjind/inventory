var QRCode = require('qrcode');
var express = require("express");
var app = express.Router();
const base64Img = require('base64-img');
const nodemailer = require("nodemailer");

//sending email from contact
var transpoter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'xxxxxxxxx',
        pass: 'xxxxxxxxx'

    }
});

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
    itemid: String,
    name: String,
    qty: Number,
    price: String,
    specs: String,
    qrcodeUrl: String
});

nameSchema.set('versionKey', false);

var productCol = mongoose.model("products", nameSchema); //collection

//auth
app.post("/auth", (req, res) => {
    if (req.body.uname == "abc" && req.body.upwd == "abc")
        res.redirect("/warehouse.html");
    else
        console.log("wrong pwd");
});

//insert the product in collection
app.post("/product_insert", (req, res) => {

    //qr code genration
    const Qrdata = JSON.stringify(req.body);
    const path = process.cwd() + '/qrcodes/';
    const filename = `${req.body.itemid}`;
    QRCode.toDataURL(Qrdata, {
        type: 'terminal'
    }, function (err, url) {
        base64Img.img(url, path, filename, (err, filepath) => {});
    });
    req.body.qrcodeUrl = path + filename;

    //mail send to head
    var mailOptions = {
        from: 'xxxxxxxxxx',
        to: 'xxxxxxxxx',
        subject: "add new product to inventory",
        text: `${Qrdata}`
    }
    transpoter.sendMail(mailOptions, function (error, info) {
        if (error) console.log(error);
        else console.log('email sent: ' + info.response);
    });
    var proData = new productCol(req.body);
    proData.save()
        .then(item => {
            //res.send({success:true,data:item});
            res.redirect("/warehouse.html");
        })
        .catch(err => {
            res.status(400).send("unable to save to database");
        });
});

//delete the product from collection
app.post("/product_delete", function (req, res) {
    console.log(req.body);
    console.log(req.body.itemid);

    productCol.remove({
        itemid: req.body.itemid
    }).then(function (result) {
        res.send(result);
    }).catch(function () {
        res.send({
            err: "error"
        });
    });

});

//update the records in inventory
app.post("/product_update", function (req, resp) {
    productCol.findOneAndUpdate({
        itemid: req.body.itemid
    }, {
        $set: {
            name: req.body.name,
            qty: req.body.qty,
            price: req.body.price
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

//search the record in inventory
app.post("/product_search", function (req, res) {
    productCol.findOne({
            itemid: req.body.itemid
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

//show all the products from inventory
app.get("/showproduct", (req, res) => {
    productCol.find()
        .then(function (result) {
            res.json(result);
        })
        .catch(function (msg) {
            res.json({
                err: msg
            });
        });
});

//update inventory quantity
app.get("/updateQuantity", function (req, resp) {
    console.log(req.query.productUid);
    console.log(req.query.quantity);
    productCol.findOneAndUpdate({
        itemid: req.query.productUid
    }, {
        $inc: {
            qty: -req.query.quantity
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

app.get("/updateQuantityReject", function (req, resp) {
    console.log(req.query.productUid);
    console.log(req.query.quantity);
    productCol.findOneAndUpdate({
        itemid: req.query.productUid
    }, {
        $inc: {
            qty: +req.query.quantity
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
module.exports = app;