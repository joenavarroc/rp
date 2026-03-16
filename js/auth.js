// =========================
// AUTH SYSTEM
// =========================

// admins
let admins = JSON.parse(localStorage.getItem("admins")) || {};

// vets
let veterinarios = JSON.parse(localStorage.getItem("veterinarios")) || {};


// =========================
// LOGIN
// =========================

export function login(email, clave){

  // leer siempre lo último guardado
  const admins = JSON.parse(localStorage.getItem("admins")) || {};
  const veterinarios = JSON.parse(localStorage.getItem("veterinarios")) || {};

  // buscar admin
  const admin = Object.values(admins).find(a => a.email === email);

  if(admin && admin.clave === clave){

      localStorage.setItem("userRole","admin");
      localStorage.setItem("adminId", admin.id);

      return { ok:true, role:"admin" };

  }

  // buscar veterinario
  const vetKey = Object.keys(veterinarios).find(key => veterinarios[key].email === email);
  const vet = veterinarios[vetKey];

  if(vet){

      if(vet.bloqueado){
         return { ok:false, msg:"Usuario bloqueado" };
      }

      if(vet.clave !== clave){
         return { ok:false, msg:"Contraseña incorrecta" };
      }

      localStorage.setItem("userRole","vet");
      localStorage.setItem("vetId", vetKey);

      return { 
        ok:true, 
        role:"vet",
        temporal: vet.temporal 
      };

  }

  return { ok:false, msg:"Usuario no encontrado" };
}

export function cambiarClaveVet(nuevaClave){

   const vetId = localStorage.getItem("vetId");

   if(!vetId) return;

   veterinarios[vetId].clave = nuevaClave;
   veterinarios[vetId].temporal = false;

   localStorage.setItem("veterinarios", JSON.stringify(veterinarios));

}

export function logout(){

   localStorage.removeItem("userRole");
   localStorage.removeItem("adminId");
   localStorage.removeItem("vetId");

   window.location.href = "login.html";

}

export function checkAuth(){

  const role = localStorage.getItem("userRole");

  if(!role){
     window.location.href = "login.html";
  }

}