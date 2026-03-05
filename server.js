// ==========================
// IMPORTS
// ==========================

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ==========================
// APP SETUP
// ==========================

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// ==========================
// DOSSIERS
// ==========================

const baseDir = path.join(__dirname, "uploads");
const picturesDir = path.join(baseDir, "pictures");

// Création automatique des dossiers
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir);
}

if (!fs.existsSync(picturesDir)) {
  fs.mkdirSync(picturesDir);
}

// ==========================
// CONFIG MULTER
// ==========================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    const prenom = (req.body.prenom || "unknown")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "");

    const userDir = path.join(picturesDir, prenom);

    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    cb(null, userDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });

// ==========================
// VARIABLES GLOBALES
// ==========================

let revealDate = new Date(Date.now() + 3600000); // +1h par défaut
let uploadsEnabled = true;

// ==========================
// ROUTES
// ==========================

// Upload photo
app.post("/upload", upload.single("media"), (req, res) => {
  if (!uploadsEnabled) {
    return res.status(403).json({ error: "Uploads désactivés" });
  }

  res.json({ success: true });
});

// Récupérer la date du reveal
app.get("/reveal-date", (req, res) => {
  res.json({ revealDate });
});

// Modifier la date (ADMIN)
app.post("/admin/reveal-date", (req, res) => {
  if (!req.body.date) return res.sendStatus(400);

  revealDate = new Date(req.body.date);

  io.emit("update");

  res.sendStatus(200);
});

// Activer / désactiver uploads
app.post("/admin/toggle-uploads", (req, res) => {
  uploadsEnabled = !uploadsEnabled;
  res.json({ uploadsEnabled });
});

// Stats (nombre de photos par personne)
app.get("/stats", (req, res) => {

  const stats = {};

  if (!fs.existsSync(picturesDir)) {
    return res.json(stats);
  }

  const users = fs.readdirSync(picturesDir);

  users.forEach(user => {
    const userPath = path.join(picturesDir, user);

    if (fs.statSync(userPath).isDirectory()) {
      const files = fs.readdirSync(userPath);
      stats[user] = files.length;
    }
  });

  res.json(stats);
});

// Toutes les photos
app.get("/all-photos", (req, res) => {

  const result = {};

  if (!fs.existsSync(picturesDir)) {
    return res.json(result);
  }

  const users = fs.readdirSync(picturesDir);

  users.forEach(user => {
    const userPath = path.join(picturesDir, user);

    if (fs.statSync(userPath).isDirectory()) {
      result[user] = fs.readdirSync(userPath);
    }
  });

  res.json(result);
});

// Socket.io
io.on("connection", (socket) => {
  console.log("Client connecté");
});

// ==========================
// PORT (IMPORTANT POUR RENDER)
// ==========================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Serveur lancé sur le port " + PORT);
});