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