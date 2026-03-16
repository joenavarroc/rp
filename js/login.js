import { login } from "./auth.js";

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

if(loginForm){

loginForm.addEventListener("submit",(e)=>{
  console.log("LOGIN JS CARGADO");

  e.preventDefault();

  const data = new FormData(loginForm);
  const email = data.get("email");
  const pass = data.get("password");

  const res = login(email,pass);

  console.log("LOGIN RESULT:", res);

});

}

const goRegister = document.getElementById("goRegister");
const goLogin = document.getElementById("goLogin");

// cambiar entre login y registro
goRegister.onclick = () => {
  loginForm.classList.remove("active");
  registerForm.classList.add("active");
};

goLogin.onclick = () => {
  registerForm.classList.remove("active");
  loginForm.classList.add("active");
};


// ================= LOGIN =================

loginForm.addEventListener("submit",(e)=>{
console.log("LOGIN JS CARGADO");
  e.preventDefault();

  const data = new FormData(loginForm);
  const email = data.get("email");
  const pass = data.get("password");

  const res = login(email,pass);
console.log("LOGIN RESULT:", res);
  if(!res.ok){
    alert(res.msg);
    return;
  }

  // ADMIN
  if(res.role === "admin"){
    window.location.href="index.html";
  }

  // VETERINARIO
  if(res.role === "vet"){

    if(res.temporal){

      alert("Debes cambiar tu contraseña antes de continuar");

      window.location.href="cambiar-clave.html";

    }else{

      window.location.href="index.html";

    }

  }

});

// ================= REGISTER =================

registerForm.addEventListener("submit",(e)=>{

  e.preventDefault();

  const inputs = registerForm.querySelectorAll("input");

  const nombre = inputs[0].value;
  const email = inputs[1].value;
  const pass = inputs[2].value;

  const admins = JSON.parse(localStorage.getItem("admins")) || {};

  const existe = Object.values(admins).find(a => a.email === email);

  if(existe){
    alert("Ese email ya está registrado");
    return;
  }

  const id = "admin_"+Date.now();

  admins[id] = {
    id,
    nombre,
    email,
    clave:pass
  };

  localStorage.setItem("admins",JSON.stringify(admins));

  alert("Cuenta creada correctamente");

  registerForm.reset();

  registerForm.classList.remove("active");
  loginForm.classList.add("active");

});
