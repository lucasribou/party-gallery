const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// ==========================
// CLOUDINARY CONFIG
// ==========================

cloudinary.config({
  cloud_name: "dsjd9vqnu",
  api_key: "289571173988713",
  api_secret: "TON_API_SECRET_ICI"
});

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
// MULTER + CLOUDINARY
// ==========================

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "party-gallery",
    allowed_formats: ["jpg", "png", "jpeg"]
  }
});

const upload = multer({ storage });

// ==========================
// VARIABLES
// ==========================

let revealDate = new Date(Date.now() + 3600000);
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