var express=require("express");
var app=express.Router();
var date = require("date-and-time");

var mongoose = require("mongoose");
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.Promise = global.Promise;

//databse connectivity
mongoose.connect("mongodb://localhost:27017/inventory", { useUnifiedTopology: true,useNewUrlParser: true }).then(()=>{
    console.log("Connected to database");
}).catch((err)=>{
    console.log(err);
});

let nowDate = new Date();
let currDate = ("0" + nowDate.getDate()).slice(-2);
let currMonth = ("0" + (nowDate.getMonth() + 1)).slice(-2);

var date = nowDate.getFullYear()+'-'+currMonth+'-'+currDate; 
console.log(date);
//collection schema
var nameSchema = new mongoose.Schema({
    shopid:String,
    shopname:String,
    productid:String,
    quantity:Number,
    Date:String,
    status:Number
});

nameSchema.set('versionKey',false);

var orderCol = mongoose.model("orders", nameSchema);    //collection

//insert the product in collection
app.post("/placeOrder",(req,res)=>{
    req.body["Date"]=date;
    req.body["status"]=0;
    console.log(req.body);
    var orderData = new orderCol(req.body);
    orderData.save()
    .then(item => {
    //res.send({success:true,data:item});
      res.redirect("/order-products.html");
    })
    .catch(err => {
    res.status(400).send("unable to save to database");
    });
});

//show current order placed
app.get("/placedOrder",(req,res)=>{
    console.log(req.query.currentDate);
    orderCol.find({Date:req.query.currentDate})
    .then(function(result)
    {
        res.json(result);
    })
    .catch(function(msg){res.json({err:msg});});

});

//accept the particular order status =1
app.get("/acceptOrder",(req,res)=>{
    console.log(req.query.orderUid);
    orderCol.findOneAndUpdate({_id: req.query.orderUid},{$set:{status:1}},{new:true}) .then((docs)=>
    {
        if(docs) {
            alert("order accepted");
            resp.send({success:true,data:docs});
        } else
         {
            resp.send({success:false,data:"no such user exist"});
        }
    }) 
});

//accepted orders 
app.get("/acceptedOrders",(req,res)=>{
    console.log(req.query.currentDate);
    console.log(req.query.shopId);
    orderCol.find({ $and: [ { shopid: req.query.shopId}, { Date: req.query.currentDate} ,{status:1} ] })
    .then(function(result)
    {
        console.log(result);
        res.json(result);
    })
    .catch(function(msg){res.json({err:msg});}); 
});

module.exports=app;