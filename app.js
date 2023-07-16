const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date =  require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistdb");
const itemSchema = {
    name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to To-do List webapp"
});
const item2 = new Item({
    name: "Second Doc of todolist."
});
const item3 = new Item({
    name: "Third line of todolist"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};
const List = mongoose.model("List", listSchema);


// const items = ["Buy Milk", "Brew Coffee", "Code 'Todo-List' Webapp."];
// const workitems = [];

app.get("/", function (req, res) {

    const day = date.getDate();
    Item.find({})
    .then(foundItems => {
        if(foundItems.length === 0){
            Item.insertMany(defaultItems)
               
            res.render("/")
        }
        else{
            res.render("lists", { titleItem: day, newListItems: foundItems });
        }
        
    })
    .catch(err => {
        console.error(err);
        res.status(500).send("Internal Server Error");
    });
    
});

app.get("/:customListName", function(req, res) {
    const customListName = req.params.customListName;

    List.findOne({ name: customListName })
        .then(foundList => {
            if (!foundList) {
                const newList = new List({
                    name: customListName,
                    items: defaultItems
                });
                newList.save();
                res.redirect("/" + customListName);
            } else {
                res.render("lists", { titleItem: foundList.name, newListItems: foundList.items });
            }
        })
        .catch(err => {
            
            console.log(err);
        });
});


app.post("/", function(req, res){

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });
    const day = date.getDate();

    if(listName === day){
        item.save();
        res.redirect("/")
    }
    else{
        List.findOne({ name: listName })
            .then(foundList => {
                foundList.items.push(item);
                foundList.save();
            })
            .catch(err => {
                console.log(err);
            });
            res.redirect("/"+ listName);
    }
    
    // const item = req.body.newItem;
    // if (req.body.list === "Work"){
    //     workitems.push(item);
    //     res.redirect("/work")
    // }
    // else{
    //     items.push(item);
    //     res.redirect("/");
    // }
    
});

app.post("/delete", function(req,res){
    const checkedItemID = req.body.checkbox;

    Item.findByIdAndRemove(checkedItemID)
    .then(() =>{
        console.log('has been deleted')
        res.redirect('/')
    })
    .catch(err=>{console.log(err)});
    
});

// app.get("/work", function(req, res){

//     res.render("lists", {titleItem:"Work List", newListItems: workitems})
// });
// app.post("/work", function(req, res){

//     let item = req.body.newItem;
//     workitems.push(item)
//     res.redirect("/work")
// });
    
app.get("/about", function(req, res){

    res.render("about");
});

app.listen(3000, function(){
    console.log("Your port is live on port no. 3000");
});