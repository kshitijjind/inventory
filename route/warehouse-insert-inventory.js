var express=require("express");
var app=express.Router();

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

//collection schema
var nameSchema = new mongoose.Schema({
    itemid:String,
    name:String,
    qty:Number,
    price:String
});

nameSchema.set('versionKey',false);

var productCol = mongoose.model("products", nameSchema);    //collection

//auth
app.post("/auth",(req,res)=>{
    if(req.body.uname == "abc" && req.body.upwd=="abc")
            res.redirect("/warehouse.html");
    else 
    console.log("wrong pwd");
});
   
//insert the product in collection
app.post("/product_insert",(req,res)=>{
    console.log(req.body);
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
app.post("/product_delete",function(req,res){
    console.log(req.body);
    console.log(req.body.itemid);

    productCol.remove({itemid:req.body.itemid}).then(function(result)
    {
        res.send(result);
    }).catch(function()
    {
        res.send({err:"error"});
    });
    
});

//update the records in inventory
app.post("/product_update",function(req,resp){
    productCol.findOneAndUpdate({itemid: req.body.itemid},{$set:{name:req.body.name,qty:req.body.qty,price:req.body.price}},{new:true}) .then((docs)=>
    {
        if(docs) {
           resp.send({success:true,data:docs});
        } else
         {
            resp.send({success:false,data:"no such user exist"});
        }
    })
         
});

//search the record in inventory
app.post("/product_search",function(req,res){
    productCol.findOne({itemid:req.body.itemid})
    .then(function(result)
    {
        res.send(result);
    })
    .catch(function(msg){res.send({err:msg});});
});

//show all the products from inventory
app.get("/showproduct",(req,res)=>{
    productCol.find()
    .then(function(result)
    {
         res.json(result);
    })
    .catch(function(msg){res.json({err:msg});});
});

module.exports=app;
  