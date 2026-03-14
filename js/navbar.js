let modalServicios;
let listaServicios;
let btnServices;
let modalVets;
let listaVets;
let btnVets;
let veterinarios = JSON.parse(localStorage.getItem("veterinarios")) || {};

function initNavbar() {
  // 🔹 Selección de elementos
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsMenu = document.getElementById("settingsMenu");

  btnServices = document.getElementById("btnServices");
  btnVets = document.getElementById("btnVets");

  modalServicios = document.getElementById("modal-servicios");
  listaServicios = document.getElementById("lista-servicios");

  modalVets = document.getElementById("modal-vets");
  listaVets = document.getElementById("lista-vets");

  const waitingBtn = document.getElementById("waitingBtn");

  // ================= Sala de espera =================
  if (waitingBtn) {
    waitingBtn.addEventListener("click", () => {
      const modal = document.getElementById("modal-waiting");
      if (modal) {
        modal.classList.remove("hidden");
        if (typeof cargarClientesWaiting === "function") cargarClientesWaiting();
        if (typeof cargarServiciosWaiting === "function") cargarServiciosWaiting();
      }
    });
  }

  // ================= Settings =================
  if (settingsBtn && settingsMenu) {
    settingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      settingsMenu.classList.toggle("hidden");
    });
    document.addEventListener("click", () => {
      settingsMenu.classList.add("hidden");
    });
  }

  // ================= Servicios =================
  if (btnServices && modalServicios && listaServicios) {
    btnServices.addEventListener("click", (e) => {
      e.stopPropagation();
      modalServicios.classList.remove("hidden");
      renderServicios();
    });
  }

  // ================= Veterinarios =================
  if (btnVets && modalVets && listaVets) {
    btnVets.addEventListener("click", (e) => {
      e.stopPropagation();
      modalVets.classList.remove("hidden");
      renderVets();
    });
  }

  // ================= Formularios =================
  const formServicio = document.getElementById("form-servicio");
  const formVet = document.getElementById("form-vet");

  if (formServicio) formServicio.addEventListener("submit", guardarServicio);
  if (formVet) formVet.addEventListener("submit", guardarVet);
}

// ================= SETTINGS / SERVICIOS =================

let servicios = JSON.parse(localStorage.getItem("servicios"));

if (!servicios) {
  servicios = {
    consulta: { nombre: "Consulta Veterinaria", color: "rgba(114,239,221,0.4)" },
    control: { nombre: "Control Veterinario", color: "rgba(201,3,168,0.4)" },
    vacuna: { nombre: "Vacunación", color: "rgba(128,237,153,0.4)" },
    eco: { nombre: "Ecografía", color: "rgba(188,122,255,0.4)" },
    radio: { nombre: "Radiografía", color: "rgba(255,122,122,0.4)" }
  };

  localStorage.setItem("servicios", JSON.stringify(servicios));
}

function cerrarModalServicios() {
  modalServicios.classList.add("hidden");
}

function renderServicios() {

  if(!listaServicios) return;

  listaServicios.innerHTML = "";

  Object.keys(servicios).forEach(key => {

    const li = document.createElement("li");
    li.className = "option";

    li.innerHTML = `
      <span style="color:${servicios[key].color}">
        ${servicios[key].nombre}
      </span>
      <div>
        <button onclick="editarServicio('${key}')">✏</button>
        <button onclick="eliminarServicio('${key}')">🗑</button>
      </div>
    `;

    listaServicios.appendChild(li);
  });

  actualizarSelectServicios();

  document.dispatchEvent(
    new CustomEvent("serviciosActualizados", { detail: servicios })
  );

}

function editarServicio(key) {
  document.getElementById("servicio-editando").value = key;
  document.getElementById("servicio-nombre").value = servicios[key].nombre;
  document.getElementById("servicio-color").value = rgbToHex(servicios[key].color);
}

function eliminarServicio(key) {
  if (!confirm("¿Eliminar servicio?")) return;

  delete servicios[key];

  localStorage.setItem("servicios", JSON.stringify(servicios)); // guardar

  renderServicios();
}

function guardarServicio(e) {

  e.preventDefault();

  const nombre = document.getElementById("servicio-nombre").value;
  const colorHex = document.getElementById("servicio-color").value;
  const keyEdit = document.getElementById("servicio-editando").value;

  const rgba = hexToRgba(colorHex, 0.4);

  if (keyEdit) {
    servicios[keyEdit] = { nombre, color: rgba };
  } else {
    const key = nombre.toLowerCase().replace(/\s+/g,"_");
    servicios[key] = { nombre, color: rgba };
  }

  localStorage.setItem("servicios", JSON.stringify(servicios)); // ⭐ guardar

  e.target.reset();
  document.getElementById("servicio-editando").value = "";
  renderServicios();
}

function actualizarSelectServicios() {
  const contenedor = document.querySelector("#select-servicio .select-options");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  Object.keys(servicios).forEach(key => {
    const div = document.createElement("div");
    div.className = "option";
    div.dataset.value = key;
    div.textContent = servicios[key].nombre;
    contenedor.appendChild(div);
  });

  // 🔥 IMPORTANTE: volver a enganchar eventos
  inicializarSelects();
}

// utils
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.substring(1,3),16);
  const g = parseInt(hex.substring(3,5),16);
  const b = parseInt(hex.substring(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function rgbToHex(rgba) {
  const nums = rgba.match(/\d+/g);
  const r = parseInt(nums[0]).toString(16).padStart(2,"0");
  const g = parseInt(nums[1]).toString(16).padStart(2,"0");
  const b = parseInt(nums[2]).toString(16).padStart(2,"0");
  return `#${r}${g}${b}`;
}

function obtenerColorServicio(key) {
  if (servicios && servicios[key]) {
    return servicios[key].color;
  }
  return "rgba(114,239,221,0.4)";
}

function cerrarModalVets(){
  modalVets.classList.add("hidden");
}

function renderVets(){

  if(!listaVets) return;

  listaVets.innerHTML = "";

  Object.keys(veterinarios).forEach(key=>{

    const vet = veterinarios[key];

    const li = document.createElement("li");

    li.innerHTML = `
      <div>
        <strong>${vet.nombre}</strong><br>
        <small>${vet.email}</small>
        ${vet.bloqueado ? "<span style='color:#ff6b6b'> (bloqueado)</span>" : ""}
      </div>

      <div>
        <button onclick="editarVet('${key}')">✏</button>
        <button onclick="toggleVet('${key}')">${vet.bloqueado ? "🔓" : "🔒"}</button>
        <button onclick="eliminarVet('${key}')">🗑</button>
      </div>
    `;

    listaVets.appendChild(li);

  });

}

function editarVet(key){

  const vet = veterinarios[key];

  document.getElementById("vet-editando").value = key;
  document.getElementById("vet-nombre").value = vet.nombre;
  document.getElementById("vet-email").value = vet.email;
  document.getElementById("vet-clave").value = vet.clave;

}

function guardarVet(e){

  e.preventDefault();

  const nombre = document.getElementById("vet-nombre").value;
  const email = document.getElementById("vet-email").value;
  const clave = document.getElementById("vet-clave").value || "temporal123";

  const keyEdit = document.getElementById("vet-editando").value;

  if(keyEdit){

    veterinarios[keyEdit].nombre = nombre;
    veterinarios[keyEdit].email = email;
    veterinarios[keyEdit].clave = clave;

  }else{

    const key = "vet_"+Date.now();

    veterinarios[key] = {
      nombre,
      email,
      clave,
      bloqueado:false
    };

  }

  e.target.reset();
  document.getElementById("vet-editando").value = "";

  localStorage.setItem("veterinarios", JSON.stringify(veterinarios));
  renderVets();

}

function toggleVet(key){

  veterinarios[key].bloqueado = !veterinarios[key].bloqueado;

  localStorage.setItem("veterinarios", JSON.stringify(veterinarios));

  renderVets();

}

function eliminarVet(key){

  if(!confirm("¿Eliminar veterinario?")) return;

  delete veterinarios[key];

  localStorage.setItem("veterinarios", JSON.stringify(veterinarios));
  
  renderVets();

}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("settingsBtn")) {
    initNavbar();
  }
});