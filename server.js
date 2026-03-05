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
// DOSSIER UPLOADS
// ==========================

const baseUploadDir = path.join(__dirname, "uploads");
const picturesDir = path.join(baseUploadDir, "pictures");

// Créer dossiers si ils n'existent pas
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir);
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
// ROUTE UPLOAD
// ==========================

app.post("/upload", upload.single("media"), (req, res) => {

  if (!uploadsEnabled) {
    return res.status(403).json({ error: "Uploads désactivés" });
  }

  res.json({ success: true });

});

app.get("/stats", (req, res) => {
  const files = fs.readdirSync(uploadDir);
  const stats = {};

  files.forEach(file => {
    const prenom = file.split("_")[0];
    stats[prenom] = (stats[prenom] || 0) + 1;
  });

  res.json(stats);
});

app.get("/reveal-date", (req, res) => {
  res.json({ revealDate });
});

app.post("/admin/reveal-date", (req, res) => {
  revealDate = new Date(req.body.date);
  io.emit("update");
  res.sendStatus(200);
});

app.post("/admin/toggle-uploads", (req, res) => {
  uploadsEnabled = !uploadsEnabled;
  res.json({ uploadsEnabled });
});

app.get("/all-photos", (req, res) => {
  const files = fs.readdirSync(uploadDir);
  res.json(files);
});

io.on("connection", socket => {
  console.log("Client connecté");
});

server.listen(3000, () => {
  console.log("Serveur lancé sur http://localhost:3000");
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});