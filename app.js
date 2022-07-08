const express = require('express');
let app = express();
let cors = require('cors');
require('dotenv').config();
let mongoose = require('mongoose');

mongoose.connect(`mongodb+srv://ashu184:${process.env.password}@cluster0.bczff4w.mongodb.net/eCommerce?retryWrites=true&w=majority`).catch(e => { console.log(e) });

app.use(express.urlencoded({ extended: true }));
app.use(express.json())

let model = mongoose.model('products', {
    name: String,
    type:String,
    brand: String,
    photo: String,
    releasePrice: Number,
    currPrice: Number,
    totalStock: Number,
    currStock: Number,
    preview: Array,
    sizes: Array
})
let userModel = mongoose.model('users', {
    email: String,
    password: String,
    cart: Array,
    wishlist: Array,
    dob: String,
    currPin: String,
    address: Array,
    defaultAddress: String,
    phone: String
})
let filterModel = mongoose.model('filters',{
    category:String,
    type:String,
    brands:Array,
    categorySpecific : Object
})
let brandModel = mongoose.model('brands',{
    name:String,
    type:String,
    gender:String
})
app.use(cors());

app.get('/', async (req, res) => {
    // let x = await model.findOne({brand:"Samsung"});
    // x.photo = "https://i.ibb.co/KqP0KWs/removal-ai-tmp-62a29a5f966c0.png";
    // x.save();
    res.send("Hello")
})

app.get('/getSome', async (req, res) => {
    let query = req.query
    try {
        let data = await model.findOne({ name: req.query.name });
        res.send(data)
    }
    catch { }
})
app.get('/weeklyData', async (req, res) => {
    let x = await model.find({});
    let data = x.map(data => {
        let obj = {
            name: data.name,
            brand: data.brand,
            photo: data.photo,
            releasePrice: data.releasePrice,
            currPrice: data.currPrice,
            totalStock: data.totalStock,
            currStock: data.currStock,
            preview: data.preview,
            availableSizes: data.sizes

        }
        return obj;
    })
    res.send(data);

})

app.post('/updateCart', async (req, res) => {
    let data = await model.findOne({ name: req.body.data.name });
    let user = await userModel.findOne({ email: 'ashu@gmial.com' });
    
    let usefulData = {
        name: data.name,
        brand: data.brand,
        photo: data.photo,
        currPrice: data.currPrice,
        releasePrice: data.releasePrice,
        quantity: req.body.data.quantity
    }

    for(let i in user.cart){
        if(user.cart[i].name === req.body.data.name )
        {
            usefulData.quantity = user.cart[i].quantity+1;
            user.cart[i] = usefulData;
            await user.save();
            res.send("Hello");
            return;
        }
    }
    user.cart.push(usefulData);
    await user.save();
    res.status(200);


})

app.get('/getCart', async (req, res) => {

    let user = await userModel.findOne({ email: 'ashu@gmial.com' });
    let cartData = user.cart.map(async (cartItem) => {
        let prod = await model.findOne({ name: cartItem.name });
        if (prod.currStock > cartItem.quantity) {
            return cartItem;
        }
    })
    cartData = await Promise.all(cartData)
    res.send(cartData);
})

app.get('/filters/:item',async(req,res)=>{
    let filter = await filterModel.findOne({type:req.query.type});
    let brands = await brandModel.find({type:req.query.type});
    brands.forEach(e=>{
        filter.brands.push(e)
    })
    let data = await model.find({type:req.query.type})
    let responseData ={
        filter:filter,
        data:data
    }
    res.send(responseData)
    
})

app.listen(5000)