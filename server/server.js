require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// Multer setup for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- AUTHENTICATION MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401); // if there isn't any token

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).send("Username and password required.");

    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await db.query(
      "INSERT INTO users (username, password_hash, display_name) VALUES ($1, $2, $1) RETURNING id, username, display_name, profile_picture_mimetype",
      [username, hashedPassword]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      // Unique violation
      return res.status(409).send("Username already exists.");
    }
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const { rows } = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (rows.length === 0) return res.status(400).send("Cannot find user");

    if (await bcrypt.compare(password, rows[0].password_hash)) {
      const user = {
        id: rows[0].id,
        username: rows[0].username,
        displayName: rows[0].display_name,
        hasProfilePicture: !!rows[0].profile_picture_mimetype,
      };
      const accessToken = jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      res.json({ accessToken, user });
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
    const { rows } = await db.query(
      "SELECT profile_picture_data, profile_picture_mimetype FROM users WHERE id = $1",
      [userId]
    );
    if (rows.length > 0 && rows[0].profile_picture_data) {
      res.set("Content-Type", rows[0].profile_picture_mimetype);
      res.send(rows[0].profile_picture_data);
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
      let query;
      let queryParams;

      if (profilePicture) {
        query =
          "UPDATE users SET display_name = $1, profile_picture_data = $2, profile_picture_mimetype = $3 WHERE id = $4 RETURNING id, username, display_name, profile_picture_mimetype";
        queryParams = [
          displayName,
          profilePicture.buffer,
          profilePicture.mimetype,
          req.user.id,
        ];
      } else {
        query =
          "UPDATE users SET display_name = $1 WHERE id = $2 RETURNING id, username, display_name, profile_picture_mimetype";
        queryParams = [displayName, req.user.id];
      }

      const { rows } = await db.query(query, queryParams);

      const user = {
        id: rows[0].id,
        username: rows[0].username,
        displayName: rows[0].display_name,
        hasProfilePicture: !!rows[0].profile_picture_mimetype,
      };
      res.json(user);
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
    const { rows } = await db.query(
      "SELECT * FROM snippets WHERE user_id = $1 ORDER BY updated_at DESC",
      [req.user.id]
    );
    res.status(200).json(rows);
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
    const { rows } = await db.query(
      "INSERT INTO snippets (title, language, code, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, language, code, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// UPDATE a snippet owned by the logged-in user
app.put("/api/snippets/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, language, code } = req.body;
  try {
    const { rows } = await db.query(
      "UPDATE snippets SET title = $1, language = $2, code = $3, updated_at = NOW() WHERE id = $4 AND user_id = $5 RETURNING *",
      [title, language, code, id, req.user.id]
    );
    if (rows.length === 0)
      return res
        .status(404)
        .send("Snippet not found or you do not have permission.");
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// DELETE a snippet owned by the logged-in user
app.delete("/api/snippets/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      "DELETE FROM snippets WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );
    if (result.rowCount === 0)
      return res
        .status(404)
        .send("Snippet not found or you do not have permission.");
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
