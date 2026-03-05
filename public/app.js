// ==========================
// ELEMENTS
// ==========================

const video = document.getElementById("video")
const captureBtn = document.getElementById("captureBtn")
const switchCamBtn = document.getElementById("switchCam")
const modal = document.getElementById("successModal")
const multer = require("multer")
const fs = require("fs")
const path = require("path")

let currentStream
let usingFront = false

// ==========================
// CAMERA
// ==========================

async function startCamera() {

  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop())
  }

  const constraints = {
    video: {
      facingMode: usingFront ? "user" : "environment"
    }
  }

  try {
    currentStream = await navigator.mediaDevices.getUserMedia(constraints)
    video.srcObject = currentStream
  } catch (err) {
    alert("Impossible d'accéder à la caméra")
    console.error(err)
  }
}

startCamera()

// ==========================
// CHANGER CAMERA
// ==========================

if (switchCamBtn) {
  switchCamBtn.onclick = () => {
    usingFront = !usingFront
    startCamera()
  }
}

// ==========================
// PRENDRE PHOTO
// ==========================

if (captureBtn) {
  captureBtn.onclick = async () => {

    const prenom = document.getElementById("nameInput").value.trim()

    if (prenom === "") {
      alert("Veuillez entrer votre prénom")
      return
    }

    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    ctx.drawImage(video, 0, 0)

    const blob = await new Promise(resolve =>
      canvas.toBlob(resolve, "image/jpeg", 0.9)
    )

    const form = new FormData()
    form.append("media", blob)
    form.append("prenom", prenom)

    await fetch("/upload", {
      method: "POST",
      body: form
    })

    showModal()
    launchConfetti()
  }
}

// ==========================
// MODAL
// ==========================

function showModal() {
  if (modal) {
    modal.classList.remove("hidden")
  }
}

function closeModal() {
  if (modal) {
    modal.classList.add("hidden")
  }
}

function takeAnother() {
  closeModal()
}

// ==========================
// CONFETTIS
// ==========================

function launchConfetti() {
  for (let i = 0; i < 100; i++) {
    const c = document.createElement("div")
    c.style.position = "fixed"
    c.style.width = "8px"
    c.style.height = "8px"
    c.style.background = "hsl(" + Math.random() * 360 + ",70%,60%)"
    c.style.left = Math.random() * 100 + "vw"
    c.style.top = "-10px"
    c.style.animation = "fall 3s linear"
    document.body.appendChild(c)
    setTimeout(() => c.remove(), 3000)
  }
}

// ==========================
// ADMIN
// ==========================

function openAdmin() {
  const adminModal = document.getElementById("adminModal")
  if (adminModal) {
    adminModal.classList.remove("hidden")
  }
}

function closeAdmin() {
  const adminModal = document.getElementById("adminModal")
  if (adminModal) {
    adminModal.classList.add("hidden")
  }
}

function checkAdmin() {
  const code = document.getElementById("adminCode").value

  if (code === "01081983") {
    window.location.href = "/tv.html"
  } else {
    alert("Code incorrect")
  }
}