require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const connectDB = require("./db"); // <-- Updated db import

// Import Mongoose Models
const User = require("./models/userModel");
const Snippet = require("./models/snippetModel");

// Connect to Database
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// --- TEST ROUTE ---
app.get("/api/test", (req, res) => {
  res.status(200).json({ message: "Success! The backend is running." });
});

// Multer setup for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- AUTHENTICATION MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.user = decoded; // The decoded JWT payload now contains user info
    next();
  });
};

// --- AUTH ROUTES ---
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).send("Username and password required.");

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).send("Username already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword,
    });

    res.status(201).json({
      id: user._id,
      username: user.username,
      displayName: user.displayName,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send("Cannot find user");

    if (await bcrypt.compare(password, user.password)) {
      const tokenPayload = {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        hasProfilePicture: !!user.profilePictureMimetype,
      };
      const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      res.json({ accessToken, user: tokenPayload });
    } else {
      res.status(403).send("Not Allowed");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// --- USER PROFILE ROUTES ---
app.get("/api/user/profile-picture/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (user && user.profilePictureData) {
      res.set("Content-Type", user.profilePictureMimetype);
      res.send(user.profilePictureData);
    } else {
      res.status(404).send("Not found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.put(
  "/api/user/profile",
  authenticateToken,
  upload.single("profilePicture"),
  async (req, res) => {
    const { displayName } = req.body;
    const profilePicture = req.file;

    try {
      const updateData = { displayName };

      if (profilePicture) {
        updateData.profilePictureData = profilePicture.buffer;
        updateData.profilePictureMimetype = profilePicture.mimetype;
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        updateData,
        { new: true }
      );

      const userPayload = {
        id: updatedUser._id,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        hasProfilePicture: !!updatedUser.profilePictureMimetype,
      };
      res.json(userPayload);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

// --- SNIPPET ROUTES (PROTECTED) ---

// GET all snippets for the logged-in user
app.get("/api/snippets", authenticateToken, async (req, res) => {
  try {
    const snippets = await Snippet.find({ user: req.user.id }).sort({
      updatedAt: -1,
    });
    res.status(200).json(snippets);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// CREATE a new snippet for the logged-in user
app.post("/api/snippets", authenticateToken, async (req, res) => {
  const { title, language, code } = req.body;
  if (!title || !language || !code)
    return res.status(400).send("All fields are required.");

  try {
    const newSnippet = await Snippet.create({
      title,
      language,
      code,
      user: req.user.id,
    });
    res.status(201).json(newSnippet);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// UPDATE a snippet owned by the logged-in user
app.put("/api/snippets/:id", authenticateToken, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).send("Snippet not found.");
    }
    // Check for ownership
    if (snippet.user.toString() !== req.user.id) {
      return res.status(403).send("You do not have permission.");
    }

    const updatedSnippet = await Snippet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedSnippet);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// DELETE a snippet owned by the logged-in user
app.delete("/api/snippets/:id", authenticateToken, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).send("Snippet not found.");
    }
    // Check for ownership
    if (snippet.user.toString() !== req.user.id) {
      return res.status(403).send("You do not have permission.");
    }

    await snippet.deleteOne();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = app; // <-- ADD THIS LINE
