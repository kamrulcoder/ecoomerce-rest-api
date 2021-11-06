const router = require("express").Router();
const { registerController, loginController } = require("../controllers/authController")



//REGISTER
router.post("/register", registerController)

// login router 
router.post("/login", loginController)





module.exports = router;
