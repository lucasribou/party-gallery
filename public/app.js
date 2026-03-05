const video = document.getElementById("video")
const captureBtn = document.getElementById("captureBtn")
const modal = document.getElementById("successModal")

navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
.then(stream=>{
video.srcObject = stream
})

captureBtn.onclick = async ()=>{

const canvas = document.createElement("canvas")
canvas.width = video.videoWidth
canvas.height = video.videoHeight

canvas.getContext("2d").drawImage(video,0,0)

const blob = await new Promise(res=>canvas.toBlob(res,"image/jpeg"))

const form = new FormData()
form.append("media",blob)
form.append("prenom",document.getElementById("nameInput").value)

await fetch("/upload",{ method:"POST", body:form })

showModal()
launchConfetti()

}

function showModal(){
modal.classList.remove("hidden")
}

function closeModal(){
modal.classList.add("hidden")
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