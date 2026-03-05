const successScreen = document.getElementById("successScreen")

function showSuccess(){
  successScreen.classList.remove("hidden")
  confetti()
}

function restart(){
  successScreen.classList.add("hidden")
}

function leave(){
  window.location.href="/"
}