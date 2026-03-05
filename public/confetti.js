function confetti(){

for(let i=0;i<120;i++){

const c=document.createElement("div")

c.className="confetti"

c.style.left=Math.random()*100+"vw"

c.style.animationDuration=(Math.random()*3+2)+"s"

document.body.appendChild(c)

setTimeout(()=>c.remove(),5000)

}

}