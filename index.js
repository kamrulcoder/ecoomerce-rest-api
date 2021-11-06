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
const authRouter = require("./routes/auth")
const userRouter = require("./routes/user")

/* ==========================
   all route import   start 
*============================ */


// env dependency  function call 
dotenv.config();
app.use(middleware)


/* ==========================
   all route  use start  
*============================ */


app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

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
