const express = require("express");
const multer = require("multer");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static("public"));

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

let revealDate = new Date(Date.now() + 3600000); // +1h par défaut
let uploadsEnabled = true;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const name = req.body.prenom.toLowerCase();
    const ext = path.extname(file.originalname);
    cb(null, `${name}_${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

app.post("/upload", upload.single("media"), (req, res) => {
  if (!uploadsEnabled) return res.status(403).send("Uploads disabled");
  io.emit("update");
  res.sendStatus(200);
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