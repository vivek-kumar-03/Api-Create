const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt=require ("jsonwebtoken");
const authMiddleware=require('./middleware/authoMiddleware')

const app = express();
const port = 3000;

const RegUser = require("./model/user");

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use((req,res,next)=>{
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
})
const SECRET_KEY="this_is_my_secret_key";


// MongoDB connection
mongoose.connect(
  "mongodb+srv://vivekkumar6034:hw8McGi8xM7mzZRH@cluster0.c33kq5p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
).then(() => {
  console.log("MongoDB connected");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});

// Route to add user with OTP email
app.post("/adduser", async (req, res) => {
  try {
    const { name, age, email, address, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate OTP
    console.log("Generated OTP:", otp);

    // const transporter = nodemailer.createTransport({
    //   service: 'gmail',
    //   auth: {
    //     user: 'vivek.pakdu123@gmail.com',
    //     pass: 'kggm vbjf spvl ygso',
    //   }
    // });

    const reguser = new RegUser({
      name,
      age,
      email,
      address,
      password: hashedPassword,
      otp
    });

    const newrg = await reguser.save();

//     await transporter.sendMail({
//       from: 'vivek.pakdu123@gmail.com',
//       to: email,
//       subject: 'OTP for registration',
//       text:`Hello ${name},

// Your OTP is: ${otp}

// Please use this code to complete your registration.

// Do not share this code with anyone.

// Thank you  `
//     });

    return res.status(200).json({ message: "User registered and OTP sent!", newrg });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred", error: error.message });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await RegUser.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await bcrypt.compare(password, user.password);
    if (result) {
      const token=await jwt.sign({id:user._id},SECRET_KEY,{expiresIn:'1h'}) 
      return res.status(200).json({ message: "Login successful",token });
    } else {
      return res.status(401).json({ message: "Incorrect password" });
    }
  } catch (error) {
    return res.status(500).json({ message: "An error occurred", error: error.message });
  }
});

// Get all users
app.get("/getalluser", authMiddleware,async (req, res) => {
  try {
    const allUsers = await RegUser.find();
    return res.status(200).json(allUsers);
  } catch (error) {
    return res.status(500).json({ message: "An error occurred", error: error.message });
  }
});

// Get user by ID
app.get("/getuserbyID/:id", async (req, res) => {
  try {
    const user = await RegUser.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "An error occurred", error: error.message });
  }
});

// Update user
app.put("/updateuser/:id", async (req, res) => {
  try {
    const updatedUser = await RegUser.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: "An error occurred", error: error.message });
  }
});

// Delete user
app.delete("/userdelbyId/:id", async (req, res) => {
  try {
    const deletedUser = await RegUser.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(deletedUser);
  } catch (error) {
    return res.status(500).json({ message: "An error occurred", error: error.message });
  }
});

// search by name and email 
app.get("/usersdata/search", async (req, res) => {
  try {
    const { q } = req.query;

    const users = await RegUser.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    });

    return res.status(200).json(users);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error occurred during search by name or email" });
  }
});


// search by age min and max

app.get("/usersresult/filter",async (req,res)=>{

  try{
    const min=parseInt(req.query.min)||0;
    const max=parseInt(req.query.max)||100;

    const users=await RegUser.find({
      age:{$gte:min,$lte:max}
    })

    res.json(users);

    }catch(error){
      return res.status(500).json({meaaage: "errro accurd during filter by age"})
    }
})

// pagination 
app.get("/userspagination/paginate",async (req,res)=>{
  try{
    const page=parseInt(req.query.page)||1;
    const limit=parseInt(req.query.limit)||2;
    const skip=(page-1)*limit;
    const users=await RegUser.find().skip(skip).limit(limit)
    res.json(users);

  }catch(error){
    return res.status(500).json({message:"error accurd during pagination"})
  }
})

// count user 

app.get("/userscount/count", authMiddleware, async (req,res)=>{
  try{
    const count =await RegUser.countDocuments();
    res.json({totalusers:count});


  }catch(error){
    res.status(500).json({message:"error accurd during count"})
  }
})

// recent user 

app.get("/recentuser",async(req,res)=>{
  try{
    const n=parseInt(req.query.n)||1;
    const recentuser=await RegUser.find().sort({_id:-1}).limit(n)
    res.json({recentuser})
  }catch(error){
    return res.status(500).json({message:"error occurd during recent"})
  }
})


// Server start
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
