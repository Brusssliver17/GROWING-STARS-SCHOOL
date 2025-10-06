function togglePassword() {
  const passwordInput = document.getElementById("password");
  passwordInput.type = passwordInput.type === "password" ? "text" : "password";
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const res = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: document.getElementById("username").value,
      password: document.getElementById("password").value,
      userType: document.getElementById("userType").value
    })
  });
  
  const data = await res.json();
  if (data.success) {
  alert("Login successful! Redirecting...");
  window.location.href = "/dashboard.html";
} else {
  alert(data.message || "Invalid credentials!");
}
});

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");

const app = express();
app.use(express.json());
app.use(cors());

// Database connection
mongoose.connect("mongodb://127.0.0.1:27017/school_portal")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use("/api/auth", authRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ["student", "parent", "teacher", "admin"], required: true }
});

module.exports = mongoose.model("User", UserSchema);

const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, password, userType } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, userType });
    await user.save();
    res.json({ success: true, message: "User registered successfully" });
  } catch (err) {
    res.json({ success: false, message: "Error registering user" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password, userType } = req.body;
    const user = await User.findOne({ username, userType });
    if (!user) return res.json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid password" });

    res.json({ success: true, message: "Login successful", userType: user.userType });
  } catch (err) {
    res.json({ success: false, message: "Error logging in" });
  }
});

module.exports = router;