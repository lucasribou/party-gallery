const video = document.getElementById("video")
const canvas = document.getElementById("canvas")
const captureBtn = document.getElementById("captureBtn")
const nameInput = document.getElementById("nameInput")

navigator.mediaDevices.getUserMedia({video:true})
.then(stream=>{
video.srcObject=stream
})

captureBtn.onclick = async ()=>{

const ctx = canvas.getContext("2d")

canvas.width = video.videoWidth
canvas.height = video.videoHeight

ctx.drawImage(video,0,0)

const blob = await new Promise(resolve=>canvas.toBlob(resolve,"image/jpeg"))

const form = new FormData()

form.append("photo",blob)
form.append("name",nameInput.value)

await fetch("/upload",{
method:"POST",
body:form
})

showSuccess()

}

function showSuccess(){

document.getElementById("successScreen").classList.remove("hidden")

confetti()

}

function restart(){

// cacher l'écran succès
document.getElementById("successScreen").classList.add("hidden")

// relancer la caméra si besoin
navigator.mediaDevices.getUserMedia({video:true})
.then(stream=>{
video.srcObject = stream
})

}

function leave(){
window.location.href="/"
}