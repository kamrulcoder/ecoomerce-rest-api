# Ecomerce  Node and Express use Rest api 

>  ##### আমরা এখানে  ecommerce   ওয়েবসাইট এর  ডাটাবেস এর কি কি  প্রয়োজন সেই  অনুযায়ী  নোড এবং এক্সপ্রেস এর মাধ্যমে Rest  api  তৈরী করবো 

> #####  শুরুতে আমাদের যে ডিপেন্ডেন্সি এবং ডেভেলপার ডিপেন্ডেন্সি লাগবে তা নিম্নে দেওয়া হলো 

```javascript 
    npm install express jsonwebtoken mongoose nodemon dotenv crypto-js morgan  cors stripe
```
তারপর আমাদের কে mongdb এর সাথে কানেক্ট করতে হবে।   

<details>
<summary>Rest api index.js file code  ...... </summary>

 ```javascript
 // express import 
const express = require("express");

// app create 
const app = express();

//  all dependency import 
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan")
const cors = require('cors');

// dependency import 
const middleware = [
    morgan('dev'),
    express.static('public'),
    express.urlencoded({ extended: true }),
    express.json(),
    cors()
]
/* ==========================
    all route import   start 
*============================ */



/* ==========================
    all route import   start 
*============================ */


// env dependency  function call 
dotenv.config();
app.use(middleware)


/* ==========================
    all route  use start  
*============================ */

app.get("/", (req, res) => {
    res.send("<h2>you are success and all  work api project </h2>")
})

/* ==========================
    all route  use end   
*============================ */



/* ==========================
 mongdb connect code  start 
*============================ */

const PORT = process.env.PORT || 5000;

const uri = process.env.MONGODB_URL;
mongoose.connect(uri,
    { useNewUrlParser: true })
    .then(() => {
        console.log('Database Connected')
        app.listen(PORT, () => {
            console.log(`Server is running on PORT ${PORT}`)
        })
    })
    .catch(e => {
        return console.log(e)
    })

/* ==========================
 mongdb connect code  end
*============================ */
```
</details>

তারপর আমাদের  কে আলাদা কন্ট্রোলের , মডেল , এবং রাউটার তৈরি করে নিতে হবে।  আমরা আলাদা  আলাদা করে নিলে আমাদের প্রজেক্ট  ম্যানেজ করা  অনেক সহজ  হয়ে যায়। 


> ### User Manage 
> ##### User  ম্যানেজ  করার জন্য আমাদের যা  যা  করতে   হবে তা নিম্নে দেওয়া হলো 

- মডেল তৈরি করতে হবে 
- userAuth router , controller   তৈরি কর নিতে হবে  যেন লগইন এবং রেজিস্টার করতে  পারে  
- উজার্স নাম  রাউটার এবং কন্ট্রোলার তৈরি করতে  পারে যেন  উসারদের ম্যানেজ করা যায় 


<details>
<summary>User Model Code   ...... </summary>

```javascript

const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        img: { type: String },
    },
    { timestamps: true }
);

module.exports = model("User", UserSchema);

```
</details>



<details>
<summary>Auth route  and Controller   Code   ...... </summary>

```javascript
const router = require("express").Router();
const { registerController, loginController } = require("../controllers/authController")
//REGISTER
router.post("/register", registerController)

// login router 
router.post("/login", loginController)

module.exports = router;

```


```javascript

const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");



module.exports.registerController = async (req, res) => {
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(
            req.body.password,
            process.env.SECRET_KEY
        ).toString(),
    });

    try {
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports.loginController = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        !user && res.status(401).json("Wrong password or username!");

        const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
        const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

        originalPassword !== req.body.password &&
            res.status(401).json("Wrong password or username!");

        const accessToken = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.SECRET_KEY,
            { expiresIn: "5d" }
        );

        const { password, ...info } = user._doc;

        res.status(200).json({ ...info, accessToken });
    } catch (err) {
        res.status(500).json(err);
    }
}

```
</details>


<details>
<summary>user controller  Code   ...... </summary>

```javascript
const User = require("../models/User");
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
} = require("./verifyToken");


const router = require("express").Router();

//UPDATE
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
    if (req.body.password) {
        req.body.password = CryptoJS.AES.encrypt(
            req.body.password,
            process.env.PASS_SEC
        ).toString();
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            { new: true }
        );
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json(err);
    }
});

//DELETE
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("User has been deleted...");
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET USER
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const { password, ...others } = user._doc;
        res.status(200).json(others);
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET ALL USER
router.get("/", verifyTokenAndAdmin, async (req, res) => {
    const query = req.query.new;
    try {
        const users = query
            ? await User.find().sort({ _id: -1 }).limit(5)
            : await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET USER STATS

router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

    try {
        const data = await User.aggregate([
            { $match: { createdAt: { $gte: lastYear } } },
            {
                $project: {
                    month: { $month: "$createdAt" },
                },
            },
            {
                $group: {
                    _id: "$month",
                    total: { $sum: 1 },
                },
            },
        ]);
        res.status(200).json(data)
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
```
</details>

<br/>


> ##  Product  Manage
> > #####  আমাদের কে প্রোডাক্ট ম্যানেজ করার জন্য  মডেল এবং রাউটার তৈরী করতে হবে 


<details>
<summary>Product  Model  Code   ...... </summary>

```javascript 
const { Schema, model } = require("mongoose");

const ProductSchema = new Schema(
    {
        title: { type: String, required: true, unique: true },
        desc: { type: String, required: true },
        img: { type: String, required: true },
        categories: { type: Array },
        size: { type: Array },
        color: { type: Array },
        price: { type: Number, required: true },
        inStock: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = model("Product", ProductSchema);

```
</details>


<details>
<summary>Product   route   Code   ...... </summary>

```javascript 
const Product = require("../models/Product");
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//CREATE

router.post("/", verifyTokenAndAdmin, async (req, res) => {
    const newProduct = new Product(req.body);

    try {
        const savedProduct = await newProduct.save();
        res.status(200).json(savedProduct);
    } catch (err) {
        res.status(500).json(err);
    }
});

//UPDATE
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            { new: true }
        );
        res.status(200).json(updatedProduct);
    } catch (err) {
        res.status(500).json(err);
    }
});

//DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json("Product has been deleted...");
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET PRODUCT
router.get("/find/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET ALL PRODUCTS
router.get("/", async (req, res) => {
    const qNew = req.query.new;
    const qCategory = req.query.category;
    try {
        let products;

        if (qNew) {
            products = await Product.find().sort({ createdAt: -1 }).limit(1);
        } else if (qCategory) {
            products = await Product.find({
                categories: {
                    $in: [qCategory],
                },
            });
        } else {
            products = await Product.find();
        }

        res.status(200).json(products);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;

```
</details>

<br/> 

> ##  Cart  Manage
> > #####  আমাদের কে Cart ম্যানেজ করার জন্য  মডেল এবং রাউটার তৈরী করতে হবে 

<details>
<summary>Cart Model  Code   ...... </summary>

```javascript 
const { Schema, model } = require("mongoose");

const CartSchema = new Schema(
    {
        userId: { type: String, required: true },
        products: [
            {
                productId: {
                    type: String,
                },
                quantity: {
                    type: Number,
                    default: 1,
                },
            },
        ],
    },
    { timestamps: true }
);

module.exports = model("Cart", CartSchema);

```
</details>


<details>
<summary>Cart route   Code   ...... </summary>

  ```javascript 
const Cart = require("../models/Cart");
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//CREATE

router.post("/", verifyToken, async (req, res) => {
    const newCart = new Cart(req.body);

    try {
        const savedCart = await newCart.save();
        res.status(200).json(savedCart);
    } catch (err) {
        res.status(500).json(err);
    }
});

//UPDATE
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const updatedCart = await Cart.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            { new: true }
        );
        res.status(200).json(updatedCart);
    } catch (err) {
        res.status(500).json(err);
    }
});

//DELETE
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try {
        await Cart.findByIdAndDelete(req.params.id);
        res.status(200).json("Cart has been deleted...");
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET USER CART
router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId });
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json(err);
    }
});

// //GET ALL

router.get("/", verifyTokenAndAdmin, async (req, res) => {
    try {
        const carts = await Cart.find();
        res.status(200).json(carts);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;

  ```
</details>

<br/>

> ##   Order  Manage
> > #####  আমাদের কে Order ম্যানেজ করার জন্য  মডেল এবং রাউটার তৈরী করতে হবে 

<details>
<summary>Order  Model    Code   ...... </summary>

```javascript
const { Schema, model } = require("mongoose");

const OrderSchema = new Schema(
    {
        userId: { type: String, required: true },
        products: [
            {
                productId: {
                    type: String,
                },
                quantity: {
                    type: Number,
                    default: 1,
                },
            },
        ],
        amount: { type: Number, required: true },
        address: { type: Object, required: true },
        status: { type: String, default: "pending" },
    },
    { timestamps: true }
);

module.exports = model("Order", OrderSchema);


```

</details>

<details>
<summary>Order  route   Code   ...... </summary>

```javascript 
const Order = require("../models/Order");
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//CREATE

router.post("/", verifyToken, async (req, res) => {
    const newOrder = new Order(req.body);

    try {
        const savedOrder = await newOrder.save();
        res.status(200).json(savedOrder);
    } catch (err) {
        res.status(500).json(err);
    }
});

//UPDATE
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
            },
            { new: true }
        );
        res.status(200).json(updatedOrder);
    } catch (err) {
        res.status(500).json(err);
    }
});

//DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.status(200).json("Order has been deleted...");
    } catch (err) {
        res.status(500).json(err);
    }
});

//GET USER ORDERS
router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId });
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json(err);
    }
});

// //GET ALL

router.get("/", verifyTokenAndAdmin, async (req, res) => {
    try {
        const orders = await Order.find();
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json(err);
    }
});

// GET MONTHLY INCOME

router.get("/income", verifyTokenAndAdmin, async (req, res) => {
    const productId = req.query.pid;
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

    try {
        const income = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: previousMonth },
                    ...(productId && {
                        products: { $elemMatch: { productId } },
                    }),
                },
            },
            {
                $project: {
                    month: { $month: "$createdAt" },
                    sales: "$amount",
                },
            },
            {
                $group: {
                    _id: "$month",
                    total: { $sum: "$sales" },
                },
            },
        ]);
        res.status(200).json(income);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
```
</details>

<br/>

> ##   Strip Payment getway 
> > #####  আমাদের কে Strip  Payment ম্যানেজ করার জন্য  মডেল এবং রাউটার তৈরী করতে হবে 

<details>
<summary>Strip payment   route   Code   ...... </summary>

```javascript 
const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_KEY);

router.post("/payment", (req, res) => {
    stripe.charges.create(
        {
            source: req.body.tokenId,
            amount: req.body.amount,
            currency: "usd",
        },
        (stripeErr, stripeRes) => {
            if (stripeErr) {
                res.status(500).json(stripeErr);
            } else {
                res.status(200).json(stripeRes);
            }
        }
    );
});

module.exports = router;
```

</details>
