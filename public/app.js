let currentStream
let usingFront = false

async function startCamera() {

if(currentStream){
currentStream.getTracks().forEach(track=>track.stop())
}

const constraints = {
video: {
facingMode: usingFront ? "user" : "environment"
}
}

currentStream = await navigator.mediaDevices.getUserMedia(constraints)
video.srcObject = currentStream
}

startCamera()

document.getElementById("switchCam").onclick = () => {
usingFront = !usingFront
startCamera()
}

captureBtn.onclick = async () => {

const prenom = document.getElementById("nameInput").value.trim()

if(prenom === ""){
alert("Veuillez entrer votre prénom")
return
}

const canvas = document.createElement("canvas")
canvas.width = video.videoWidth
canvas.height = video.videoHeight

canvas.getContext("2d").drawImage(video,0,0)

const blob = await new Promise(res=>canvas.toBlob(res,"image/jpeg"))

const form = new FormData()
form.append("media",blob)
form.append("prenom",prenom)

await fetch("/upload",{ method:"POST", body:form })

showModal()
launchConfetti()

}

function showModal(){
modal.classList.remove("hidden")
}

function closeModal(){
window.close()
}

function takeAnother(){
modal.classList.add("hidden")
}

function launchConfetti(){
for(let i=0;i<100;i++){
const c=document.createElement("div")
c.style.position="fixed"
c.style.width="8px"
c.style.height="8px"
c.style.background="hsl("+Math.random()*360+",70%,60%)"
c.style.left=Math.random()*100+"vw"
c.style.top="-10px"
c.style.animation="fall 3s linear"
document.body.appendChild(c)
setTimeout(()=>c.remove(),3000)
}
}

function openAdmin(){
document.getElementById("adminModal").classList.remove("hidden")
}

function closeAdmin(){
document.getElementById("adminModal").classList.add("hidden")
}

function checkAdmin(){
const code=document.getElementById("adminCode").value

if(code==="01081983"){
window.location.href="/tv.html"
}else{
alert("Code incorrect")
}
}