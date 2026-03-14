let waiting = JSON.parse(localStorage.getItem("waiting")) || [];
let editingWaitingId = null;

function cerrarWaiting(){
document.getElementById("modal-waiting").classList.add("hidden");
}

function cargarServiciosWaiting(){

const servicios = JSON.parse(localStorage.getItem("servicios")) || {};

const cont = document.querySelector("#waiting-servicio .select-options");

cont.innerHTML="";

Object.keys(servicios).forEach(key=>{

const div = document.createElement("div");

div.className="option";
div.dataset.value=key;
div.textContent=servicios[key].nombre;

cont.appendChild(div);

});

inicializarSelects();

}

function cargarClientesWaiting(){

const clientes = JSON.parse(localStorage.getItem("clients")) || [];

const cont = document.querySelector("#waiting-cliente .select-options");

cont.innerHTML="";

clientes.forEach((c,index)=>{

const div=document.createElement("div");

div.className="option";
div.dataset.index=index;
div.textContent=`${c.nombre} ${c.apellido}`;

cont.appendChild(div);

});

inicializarSelects();

}

function cargarMascotasWaiting(clienteIndex){

const clientes = JSON.parse(localStorage.getItem("clients")) || [];

const mascotas = clientes[clienteIndex].mascotas || [];

const cont = document.querySelector("#waiting-mascota .select-options");

cont.innerHTML="";

mascotas.forEach((m,index)=>{

const div=document.createElement("div");

div.className="option";
div.dataset.index=index;
div.textContent=m.nombre;

cont.appendChild(div);

});

inicializarSelects();

}

document.addEventListener("click", (e) => {

     if (e.target.tagName === 'INPUT') return; 
    // 1. LÓGICA DE SELECTS (Cualquier custom-select)
    const option = e.target.closest(".custom-select .option");
    if (option) {
        const select = option.closest(".custom-select");
        
        // Desmarcar otros y marcar este
        select.querySelectorAll(".option").forEach(o => o.classList.remove("selected"));
        option.classList.add("selected");

        // Actualizar el texto visual (funciona para span o input)
        const span = select.querySelector(".select-trigger span");
        const input = select.querySelector(".select-trigger input");
        if (span) span.textContent = option.textContent;
        if (input) input.value = option.textContent;

        // CASO ESPECIAL: Si es el select de cliente, cargar sus mascotas
        if (select.id === "waiting-cliente") {
            const index = option.dataset.index;
            cargarMascotasWaiting(index);
        }
        return; // Salir para no procesar otros clics
    }

    // 2. LÓGICA DE BORRAR (Botón X)
    if (e.target.classList.contains("waiting-delete")) {
        e.stopPropagation();
        const id = Number(e.target.dataset.id);
        let waiting = JSON.parse(localStorage.getItem("waiting")) || [];
        waiting = waiting.filter(w => w.id !== id);
        localStorage.setItem("waiting", JSON.stringify(waiting));
        renderWaiting();
        return;
    }

    // 3. LÓGICA DE EDITAR (Clic en la fila de la lista)
    const item = e.target.closest(".waiting-item");
    if (item && !e.target.classList.contains("waiting-delete")) {
        const id = Number(item.dataset.id);
        const waiting = JSON.parse(localStorage.getItem("waiting")) || [];
        const registro = waiting.find(w => w.id === id);
        
        if (registro) {
            editingWaitingId = id;
            const btn = document.querySelector("#btn-agregar-espera");
            if (btn) btn.textContent = "Guardar";
            abrirWaiting();
            setTimeout(() => seleccionarWaiting(registro), 200);
        }
    }
});


function agregarAEspera(){

const cliente = document.querySelector("#waiting-cliente .option.selected");
const mascota = document.querySelector("#waiting-mascota .option.selected");
const servicio = document.querySelector("#waiting-servicio .option.selected");

if(!cliente || !mascota || !servicio){
alert("Completar datos");
return;
}

let waiting = JSON.parse(localStorage.getItem("waiting")) || [];

if(editingWaitingId){

// EDITAR
const index = waiting.findIndex(w => w.id === editingWaitingId);

if(index !== -1){

waiting[index].clienteIndex = cliente.dataset.index;
waiting[index].mascotaIndex = mascota.dataset.index;
waiting[index].servicio = servicio.dataset.value;

}

editingWaitingId = null;

}else{

// NUEVO
waiting.push({
id: Date.now(),
clienteIndex: cliente.dataset.index,
mascotaIndex: mascota.dataset.index,
servicio: servicio.dataset.value,
horaLlegada: Date.now()
});

}

localStorage.setItem("waiting",JSON.stringify(waiting));

renderWaiting();

limpiarFormularioWaiting();

}

function renderWaiting(){

const lista = document.getElementById("lista-espera");

if(!lista) return;

lista.innerHTML="";

const clientes = JSON.parse(localStorage.getItem("clients")) || [];
const servicios = JSON.parse(localStorage.getItem("servicios")) || {};
const waiting = JSON.parse(localStorage.getItem("waiting")) || [];

waiting.forEach(w=>{

const cliente = clientes[w.clienteIndex];
if(!cliente) return;

const mascota = cliente.mascotas[w.mascotaIndex];
if(!mascota) return;

const servicioNombre = servicios[w.servicio]?.nombre || "Servicio";

const li = document.createElement("li");
li.classList.add("waiting-item");
li.dataset.id = w.id;

const tiempo = calcularTiempo(w.horaLlegada);
const minutos = Math.floor((Date.now() - w.horaLlegada)/60000);

let color="green";

if(minutos>10) color="orange";
if(minutos>30) color="red";

li.innerHTML = `
<span class="waiting-info">
${cliente.nombre} - ${mascota.nombre} - ${servicioNombre}
<span style="color:${color}"> ${tiempo}</span>
</span>

<button class="waiting-delete" data-id="${w.id}">✕</button>
`;

lista.appendChild(li);

});

}

function activarBusquedaClientesWaiting() {
    const select = document.getElementById("waiting-cliente");
    const input = select.querySelector(".select-input");
    const optionsContainer = select.querySelector(".select-options");

    if (!input) return;

    // EVITAR QUE EL CLICK EN EL INPUT CIERRE EL SELECT
    input.addEventListener("click", (e) => {
        e.stopPropagation();
        select.classList.add("active"); // Asegura que se abra al hacer click
    });

    input.addEventListener("input", () => {
        const texto = input.value.toLowerCase();
        
        // Forzamos que el select esté abierto al escribir
        select.classList.add("active");

        const opciones = select.querySelectorAll(".option");

        opciones.forEach(op => {
            const nombre = op.textContent.toLowerCase();
            if (nombre.includes(texto)) {
                op.style.display = "block";
            } else {
                op.style.display = "none";
            }
        });
    });
}

function seleccionarWaiting(registro){

document.querySelectorAll("#waiting-servicio .option").forEach(o=>{
if(o.dataset.value === registro.servicio){
o.click();
}
});

document.querySelectorAll("#waiting-cliente .option").forEach(o=>{
if(o.dataset.index == registro.clienteIndex){
o.click();
}
});

setTimeout(()=>{

document.querySelectorAll("#waiting-mascota .option").forEach(o=>{
if(o.dataset.index == registro.mascotaIndex){
o.click();
}
});

},200);

}

function abrirWaiting(){

document.getElementById("modal-waiting").classList.remove("hidden");

cargarServiciosWaiting();
cargarClientesWaiting();
renderWaiting();

}

document.addEventListener("DOMContentLoaded", () => {

renderWaiting();

});

function actualizarBadgeWaiting(){

const badge = document.getElementById("waiting-count");

if(!badge) return;

const waiting = JSON.parse(localStorage.getItem("waiting")) || [];

badge.textContent = waiting.length;

}

function calcularTiempo(horaLlegada){

const ahora = Date.now();
const diff = Math.floor((ahora - horaLlegada) / 1000);

if(diff < 60) return diff + " s";

const min = Math.floor(diff / 60);
if(min < 60) return min + " min";

const h = Math.floor(min / 60);
const m = min % 60;

return h + "h " + m + "m";

}

setInterval(() => {
renderWaiting();
actualizarBadgeWaiting();
}, 1000);

function limpiarFormularioWaiting() {
    // 1. Quitar la clase 'selected' de todas las opciones
    document.querySelectorAll(".custom-select .option").forEach(o => {
        o.classList.remove("selected");
    });

    // 2. Limpiar los textos de los triggers (Servicio y Mascota)
    document.querySelectorAll(".select-trigger span").forEach(s => {
        s.textContent = "Seleccionar..."; // Asegúrate que coincida con tu placeholder inicial
    });

    // 3. Limpiar los inputs de búsqueda (Cliente)
    document.querySelectorAll(".select-trigger input").forEach(i => {
        i.value = "";
    });

    // 4. IMPORTANTE: Vaciar el select de mascotas 
    // (porque depende de qué cliente esté seleccionado)
    const contMascotas = document.querySelector("#waiting-mascota .select-options");
    if(contMascotas) contMascotas.innerHTML = "";

    // 5. Resetear el botón y el ID de edición
    const btn = document.querySelector("#btn-agregar-espera");
    if (btn) btn.textContent = "Agregar a espera";
    
    editingWaitingId = null; 
}

// DELEGACIÓN DE EVENTOS PARA EL BUSCADOR
document.addEventListener("input", (e) => {
    // Verificamos si el input que está escribiendo es el del cliente
    if (e.target.classList.contains("select-input")) {
        const input = e.target;
        const select = input.closest(".custom-select");
        const texto = input.value.toLowerCase();

        // 1. Asegurar que el menú se vea (clase active)
        select.classList.add("active");

        // 2. Filtrar las opciones
        const opciones = select.querySelectorAll(".option");
        opciones.forEach(op => {
            const nombre = op.textContent.toLowerCase();
            op.style.display = nombre.includes(texto) ? "block" : "none";
        });
    }
});
