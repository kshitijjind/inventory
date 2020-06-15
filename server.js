var express=require("express");
var path=require("path");
var bodyparser= require("body-parser");

var app=express();

app.use(express.urlencoded({"extended":false}));

var insert_products=require("./route/warehouse-insert-inventory");
app.use("/index",insert_products);

var insert_orders=require("./route/place-order");
app.use("/order",insert_orders);


app.use(express.static("pages"));       //imp line for .html

app.use("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"pages","index.html"));
});

var PORT = 8000;
app.listen(PORT,()=>{
    console.log("started on " + PORT);
});

app.use((req,res,next)=>{
    res.status(404).send("Page not found- invalid URL");
})