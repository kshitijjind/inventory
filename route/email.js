var express = require("express");
var app = express.Router();
const nodemailer = require("nodemailer");

//sending email from contact
var transpoter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'xxxxxxxxxxxxxx',
        pass: 'xxxxxxxxxxxxx'

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
    email: String
});

nameSchema.set('versionKey', false);

var emailCol = mongoose.model("email", nameSchema); //collection



//insert the product in collection
app.post("/insert_email", (req, res) => {
    var emailData = new emailCol(req.body);
    emailData.save()
        .then(item => {
            //res.send({success:true,data:item});
            res.redirect("/email.html");
        })
        .catch(err => {
            res.status(400).send("unable to save to database");
        });
});

app.post("/sendmsg", (req, res) => {

    emailCol.find()
        .then(function (result) {
            res.json(result);
            for (let i = 0; i < result.length; i++) {
                console.log(result[i].email);
                var mailOptions = {
                    from: 'xxxxxxxxx',
                    to: result[i].email,
                    subject: "dynamic msg",
                    text: req.body.textmsg
                }
                transpoter.sendMail(mailOptions, function (error, info) {
                    if (error) console.log(error);
                    else console.log('email sent: ' + info.response);
                });

            }

        })
        .catch(function (msg) {
            res.json({
                err: msg
            });
        });
});


module.exports = app;