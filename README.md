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
</details>

