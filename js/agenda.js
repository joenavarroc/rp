let fechaActual = new Date();
let modoModal = "nuevo"; // nuevo | ver | editar
let turnoEditandoId = null;
let serviciosDisponibles = {};
let turnos = JSON.parse(localStorage.getItem("turnos")) || {};

document.addEventListener('DOMContentLoaded', () => {

    // 1. Inicializar el Calendario
    renderizarCalendario();

    // ⭐ cargar servicios guardados
    const serviciosLS = JSON.parse(localStorage.getItem("servicios")) || {};
    serviciosDisponibles = serviciosLS;
    cargarServiciosEnSelect();
    
    const hoy = new Date();
    const nombresMeses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    
    const fechaHeader = document.getElementById('fecha-seleccionada');
    if(fechaHeader){
        fechaHeader.textContent =
        `${hoy.getDate()} de ${nombresMeses[hoy.getMonth()]} de ${hoy.getFullYear()}`;
    }

    // 2. Inicializar grilla
    const timeGrid = document.getElementById('time-grid');

    if(timeGrid){
        for(let h=0; h<24; h++){
            for(let m=0; m<60; m+=15){

                const timeStr =
                `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;

                const label = document.createElement('div');
                label.className = 'time-label';
                label.textContent = m === 0 ? timeStr : '';

                const slot = document.createElement('div');
                slot.className = 'time-slot';
                slot.dataset.time = timeStr;
                slot.innerHTML = `<span>${timeStr} - Disponible</span>`;

                slot.onclick = () => abrirModal(timeStr, slot);

                timeGrid.appendChild(label);
                timeGrid.appendChild(slot);
            }
        }
    }

    // navegación calendario
    const btnPrev = document.getElementById('prevMonth');
    const btnNext = document.getElementById('nextMonth');

    if(btnPrev){
        btnPrev.onclick = () => {
            fechaActual.setMonth(fechaActual.getMonth() - 1);
            renderizarCalendario();
        };
    }

    if(btnNext){
        btnNext.onclick = () => {
            fechaActual.setMonth(fechaActual.getMonth() + 1);
            renderizarCalendario();
        };
    }

    // inputs horario
    const inicioInput = document.getElementById("hora-inicio");
    const finInput = document.getElementById("hora-fin");

    // ⭐ FORZAR INTERVALOS DE 15
    ajustarA15(inicioInput);
    ajustarA15(finInput);

    // ⭐ auto completar fin +15
    inicioInput.addEventListener("change", () => {
        finInput.value = sumar15(inicioInput.value);
    });

    // selects
    inicializarSelects();

    cargarClientesEnSelect();
    cargarVeterinarios();

});

// --- Funciones de Apoyo ---

function renderizarCalendario() {
    const monthDisplay = document.getElementById('monthDisplay');
    const calendarDays = document.getElementById('calendar-days');
    if(!calendarDays || !monthDisplay) return;
    
    calendarDays.innerHTML = '';
    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();
    const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                         "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    monthDisplay.textContent = `${nombresMeses[mes]} ${año}`;

    const primerDiaMes = new Date(año, mes, 1).getDay();
    const totalDiasMes = new Date(año, mes + 1, 0).getDate();

    for (let i = 0; i < primerDiaMes; i++) {
        calendarDays.appendChild(document.createElement('div'));
    }

    for (let dia = 1; dia <= totalDiasMes; dia++) {
        const diaElemento = document.createElement('div');
        diaElemento.className = 'calendar-day';
        diaElemento.textContent = dia;

        const hoy = new Date();
        if (dia === hoy.getDate() && mes === hoy.getMonth() && año === hoy.getFullYear()) {
            diaElemento.classList.add('today');
        }

        diaElemento.onclick = () => {
            // 1. Efecto visual de selección
            document.querySelectorAll('.calendar-day').forEach(d => {
                d.style.border = "none";
                d.style.backgroundColor = "transparent";
            });
            diaElemento.style.border = `1px solid var(--primary-color)`;
            diaElemento.style.backgroundColor = "rgba(255,255,255,0.1)";

            // 2. Actualizar el texto al lado de "Agenda del Día"
            const fechaTexto = `${dia} de ${nombresMeses[mes]} de ${año}`;
            const displayFecha = document.getElementById('fecha-seleccionada');
            if(displayFecha) displayFecha.textContent = fechaTexto;

            // 3. Limpiar la agenda para el nuevo día
            cargarAgendaVet();
        };

        calendarDays.appendChild(diaElemento);
    }
}

// ESTA FUNCIÓN FALTABA Y HACÍA QUE EL CÓDIGO FALLARA
function limpiarAgenda() {
    document.querySelectorAll('.time-slot').forEach(slot => {
        const time = slot.dataset.time;
        slot.innerHTML = `<span>${time} - Disponible</span>`;
        slot.style.backgroundColor = "";
        slot.style.borderLeft = "none";
        slot.classList.remove('occupied');
    });
}

function obtenerColorServicio(key) {
  if (typeof servicios !== "undefined" && servicios[key]) {
    return servicios[key].color;
  }
  // color por defecto si no existe
  return "rgba(114,239,221,0.4)";
}

function inicializarSelects() {
  document.querySelectorAll('.custom-select').forEach(select => {
    const trigger = select.querySelector('.select-trigger');
    const optionsContainer = select.querySelector('.select-options');

    if (!trigger || !optionsContainer) return;

    // abrir / cerrar
    trigger.onclick = (e) => {
      document.querySelectorAll('.custom-select').forEach(s => {
        if (s !== select) s.classList.remove('active');
      });
      select.classList.toggle('active');
      e.stopPropagation();
    };

    // seleccionar opción
    optionsContainer.onclick = (e) => {
      const option = e.target.closest('.option');
      if (!option) return;

      const span = select.querySelector('.select-trigger span');
        const input = select.querySelector('.select-input');

        if(span){
        span.textContent = option.textContent;
        }

        if(input){
        input.value = option.textContent;
        }

      optionsContainer.querySelectorAll('.option').forEach(o =>
        o.classList.remove('selected')
      );

      option.classList.add('selected');
      select.classList.remove('active');

      // ⭐ SI ES SELECT DE CLIENTE → cargar mascotas
      if (select.id === "select-cliente") {
        const clienteIndex = option.dataset.index;
        cargarMascotas(clienteIndex);
      }

      if(select.id === "select-profesional"){
        cargarAgendaVet();
      }
    };
  });
}

function cerrarModal() {
    const modal = document.getElementById('modal-turno');
    if(modal) modal.classList.add('hidden');
}

window.onclick = function(event) {
    const modal = document.getElementById('modal-turno');
    if (event.target == modal) cerrarModal();
    if (!event.target.closest('.custom-select')) {
        document.querySelectorAll('.custom-select').forEach(s => s.classList.remove('active'));
    }
}

// Modificamos abrirModal para que ponga la hora inicial automáticamente
function abrirModal(time, slot) {

    const vetId = obtenerVetSeleccionado();

    if(!vetId){
        alert("Primero debés seleccionar un veterinario");
        return;
    }

    const modal = document.getElementById('modal-turno');
    const inputInicio = document.getElementById('hora-inicio');
    const inputFin = document.getElementById('hora-fin');

    const btnConfirmar = document.getElementById('btn-confirmar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const btnEditar = document.getElementById('btn-editar');
    const btnEliminar = document.getElementById('btn-eliminar');

    // limpiar cliente
    document.querySelector("#select-cliente .select-input").value = "";
    document.querySelector("#select-cliente .select-options").innerHTML = "";

    // limpiar mascota
    document.querySelector("#select-mascota .select-trigger span").textContent = "Seleccionar mascota";
    document.querySelector("#select-mascota .select-options").innerHTML = "";

    // limpiar servicio
    document.querySelector("#select-servicio .select-trigger span").textContent = "Seleccionar servicio";

    // limpiar observaciones
    document.getElementById("observaciones").value = "";

    cargarClientesEnSelect();


    // 🧠 SI EL SLOT ESTÁ OCUPADO
    if (slot.classList.contains('occupied')) {

        modoModal = "ver";
        turnoEditandoId = slot.dataset.idTurno;

        btnEditar.classList.remove('hidden');
        btnEliminar.classList.remove('hidden');
        btnConfirmar.classList.add('hidden');

        const vetId = obtenerVetSeleccionado();
        const fecha = obtenerFechaSeleccionada();

        const agenda = turnos[vetId]?.[fecha] || [];
        const turno = agenda.find(t => t.id == turnoEditandoId);

        if (turno) {

            inputInicio.value = turno.inicio;
            inputFin.value = turno.fin;

            document.getElementById("observaciones").value = turno.observacion || "";

            // seleccionar servicio
            const servicioOption = document.querySelector(`#select-servicio .option[data-value="${turno.servicio}"]`);
            if (servicioOption) {

                document.querySelectorAll("#select-servicio .option").forEach(o => o.classList.remove("selected"));
                servicioOption.classList.add("selected");

                document.querySelector("#select-servicio .select-trigger span").textContent = servicioOption.textContent;
            }

            // paciente guardado como "Mascota (Cliente)"
            const clientes = JSON.parse(localStorage.getItem("clients")) || [];

            const cliente = clientes[turno.clienteIndex];

            if(cliente){

                const clienteInput = document.querySelector("#select-cliente .select-input");
                clienteInput.value = `${cliente.nombre} ${cliente.apellido}`;

                // marcar cliente seleccionado
                const clienteOption = document.querySelector(`#select-cliente .option[data-index="${turno.clienteIndex}"]`);

                if(clienteOption){

                document.querySelectorAll("#select-cliente .option").forEach(o => 
                    o.classList.remove("selected")
                );

                clienteOption.classList.add("selected");
                }

                cargarMascotas(turno.clienteIndex);

                const mascota = cliente.mascotas?.[turno.mascotaIndex];

                if(mascota){

                    const mascotaOption = document.querySelector(`#select-mascota .option[data-index="${turno.mascotaIndex}"]`);

                    if(mascotaOption){

                        document.querySelectorAll("#select-mascota .option").forEach(o => o.classList.remove("selected"));

                        mascotaOption.classList.add("selected");

                        document.querySelector("#select-mascota .select-trigger span").textContent = mascota.nombre;
                    }
                }
            }
        }

        bloquearFormulario(true);

    } else {

        // 🟢 NUEVO TURNO
        modoModal = "nuevo";
        turnoEditandoId = null;

        btnEditar.classList.add('hidden');
        btnEliminar.classList.add('hidden');
        btnConfirmar.classList.remove('hidden');

        inputInicio.value = time;
        inputFin.value = sumar15(time);

        bloquearFormulario(false);
    }

    modal.classList.remove('hidden');
}

document.getElementById('btn-editar').onclick = function() {
    modoModal = "editar";

    document.getElementById('btn-confirmar').classList.remove('hidden');
    document.getElementById('btn-editar').classList.add('hidden');
    document.getElementById('btn-eliminar').classList.add('hidden'); // 👈 OCULTAMOS ELIMINAR

    bloquearFormulario(false);
};

document.getElementById('btn-eliminar').onclick = function() {

    if (!confirm("¿Eliminar este turno?")) return;

    const vetId = obtenerVetSeleccionado();
    const fecha = obtenerFechaSeleccionada();

    if(turnos[vetId] && turnos[vetId][fecha]){

        turnos[vetId][fecha] = turnos[vetId][fecha].filter(
            t => t.id != turnoEditandoId
        );

        localStorage.setItem("turnos", JSON.stringify(turnos));
    }

    cargarAgendaVet(); // redibuja agenda

    cerrarModal();
};

// Lógica de guardado masivo
document.getElementById('form-turno').onsubmit = function(e) {
    e.preventDefault();

    const inicio = document.getElementById('hora-inicio').value;
    const fin = document.getElementById('hora-fin').value;

    if (modoModal === "ver") return;

    // si estaba editando, primero borramos el viejo
    if (modoModal === "editar") {
        document.querySelectorAll('.time-slot').forEach(slot => {
            if (slot.dataset.idTurno == turnoEditandoId) {
                const time = slot.dataset.time;
                slot.innerHTML = `<span>${time} - Disponible</span>`;
                slot.style.backgroundColor = "";
                slot.style.borderLeft = "none";
                slot.classList.remove('occupied');
                delete slot.dataset.idTurno;
            }
        });
    }

    const clienteSel = document.querySelector("#select-cliente .option.selected");
    const mascotaSel = document.querySelector("#select-mascota .option.selected");

    if (!clienteSel || !mascotaSel) {
        alert("Seleccioná cliente y mascota");
        return;
    }

    const clienteIndex = clienteSel.dataset.index;
    const mascotaIndex = mascotaSel.dataset.index;

    const clientes = JSON.parse(localStorage.getItem("clients")) || [];
    const cliente = clientes[clienteIndex];
    const mascota = cliente.mascotas[mascotaIndex];

    const paciente = `${mascota.nombre} (${cliente.nombre})`;

    const servicioElem = document.querySelector("#select-servicio .option.selected");

    if (!servicioElem) {
        alert("Seleccioná un servicio");
        return;
    }

    const observacion = document.getElementById('observaciones').value;
    const servicioKey = servicioElem.dataset.value;
    const color = obtenerColorServicio(servicioKey);

    const vetId = obtenerVetSeleccionado();
    const fecha = obtenerFechaSeleccionada();

    if(!turnos[vetId]) turnos[vetId] = {};
    if(!turnos[vetId][fecha]) turnos[vetId][fecha] = [];

    const nuevoTurno = {
        id: Date.now(),
        inicio,
        fin,
        clienteIndex,
        mascotaIndex,
        servicio: servicioKey,
        observacion
    };

    turnos[vetId][fecha].push(nuevoTurno);

    localStorage.setItem("turnos", JSON.stringify(turnos));

    const slots = document.querySelectorAll('.time-slot');
    
    // --- PASO 1: VERIFICAR SUPERPOSICIÓN ---
    let estaSuperpuesto = false;
    let validando = false;

    for (let slot of slots) {
        const slotTime = slot.dataset.time;

        if (slotTime === inicio) validando = true;
        if (slotTime === fin) validando = false;

        if (validando && slot.classList.contains('occupied')) {
            estaSuperpuesto = true;
            break; // Salimos del bucle apenas encontramos un choque
        }
    }

    if (estaSuperpuesto) {
        alert("¡Error! El horario seleccionado se superpone con un turno ya existente.");
        return; // Detenemos el guardado
    }

    // --- PASO 2: PINTAR SI TODO ESTÁ BIEN ---
    let pintando = false;
    slots.forEach(slot => {
        const slotTime = slot.dataset.time;

        if (slotTime === inicio) pintando = true;
        if (slotTime === fin) pintando = false;

        if (pintando) {
            slot.classList.add('occupied');
            slot.style.backgroundColor = color;
            slot.style.borderLeft = `4px solid ${color.replace('0.4', '1')}`;
            const servicioNombre = serviciosDisponibles[servicioKey]?.nombre || servicioKey;

            slot.innerHTML = `
                <span>
                    ${slotTime} - <b>${paciente}</b> - ${servicioNombre}
                    ${observacion ? `<small style="opacity:0.7"> — ${observacion}</small>` : ""}
                </span>
            `;
            // Guardamos metadatos para futuras ediciones
            slot.dataset.idTurno = nuevoTurno.id;
        }
    });

    cerrarModal();
};

function bloquearFormulario(estado) {
    document.querySelectorAll('#form-turno input, #form-turno textarea').forEach(el => {
        el.disabled = estado;
    });
    document.querySelectorAll('#form-turno .custom-select').forEach(el => {
        el.style.pointerEvents = estado ? "none" : "auto";
        el.style.opacity = estado ? "0.6" : "1";
    });
}

function sumar15(time) {
    let [h, m] = time.split(':').map(Number);
    let d = new Date();
    d.setHours(h, m + 15);
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
}


document.addEventListener("serviciosActualizados", (e) => {
  serviciosDisponibles = e.detail;
  cargarServiciosEnSelect();
});

function cargarServiciosEnSelect() {
  const contenedor = document.querySelector("#select-servicio .select-options");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  Object.keys(serviciosDisponibles).forEach(key => {
    const div = document.createElement("div");
    div.className = "option";
    div.dataset.value = key;
    div.textContent = serviciosDisponibles[key].nombre;
    contenedor.appendChild(div);
  });

  inicializarSelects();
}

function cargarClientesEnSelect() {

  const clientes = JSON.parse(localStorage.getItem("clients")) || [];

  const contCliente = document.querySelector("#select-cliente .select-options");

  contCliente.innerHTML = "";

  clientes.forEach((c, index) => {

    const div = document.createElement("div");

    div.className = "option";
    div.dataset.index = index;
    div.textContent = `${c.nombre} ${c.apellido}`;

    contCliente.appendChild(div);

  });

  inicializarSelects();
  activarBusquedaClientes();

}

function cargarMascotas(clienteIndex){

  const clientes = JSON.parse(localStorage.getItem("clients")) || [];
  const mascotas = clientes[clienteIndex].mascotas || [];

  const contMascota = document.querySelector("#select-mascota .select-options");

  contMascota.innerHTML = "";

  mascotas.forEach((m,index)=>{

    const div = document.createElement("div");

    div.className = "option";
    div.dataset.index = index;
    div.textContent = m.nombre;

    contMascota.appendChild(div);

  });

  document.querySelector("#select-mascota .select-trigger span").textContent = "Seleccionar mascota";

  inicializarSelects();

}

function cargarVeterinarios(){

  const veterinarios = JSON.parse(localStorage.getItem("veterinarios")) || {};
  const select = document.querySelector("#select-profesional .select-options");
  const trigger = document.querySelector("#select-profesional .select-trigger span");

  if(!select) return;

  const vetActual = obtenerVetSeleccionado();

  select.innerHTML = "";

  const keys = Object.keys(veterinarios);

  if(keys.length === 0){
    select.innerHTML = `<div class="option">No hay veterinarios</div>`;
    trigger.textContent = "Sin veterinarios";
    return;
  }

  let haySeleccion = false;

  keys.forEach((key) => {

    const vet = veterinarios[key];
    if(vet.bloqueado) return;

    const div = document.createElement("div");
    div.className = "option";
    div.dataset.value = key;
    div.textContent = vet.nombre;

    if(key === vetActual){
      div.classList.add("selected");
      trigger.textContent = vet.nombre;
      haySeleccion = true;
    }

    select.appendChild(div);

  });

  if(!haySeleccion){
    trigger.textContent = "Seleccionar veterinario";
  }

  inicializarSelects();
}

function obtenerVetSeleccionado(){

  const vet = document.querySelector("#select-profesional .option.selected");

  if(!vet) return null;

  return vet.dataset.value;
}

function obtenerFechaSeleccionada(){

  const fecha = document.getElementById("fecha-seleccionada").textContent;

  return fecha;
}

function cargarAgendaVet(){

  limpiarAgenda();

  const vetId = obtenerVetSeleccionado();
  const fecha = obtenerFechaSeleccionada();

  if(!turnos[vetId]) return;
  if(!turnos[vetId][fecha]) return;

  const agenda = turnos[vetId][fecha];

  const clientes = JSON.parse(localStorage.getItem("clients")) || [];

  agenda.forEach(turno => {

    let pintando = false;

    const cliente = clientes[turno.clienteIndex];
    const mascota = cliente?.mascotas?.[turno.mascotaIndex];

    const paciente = mascota
      ? `${mascota.nombre} (${cliente.nombre})`
      : "Paciente";

    document.querySelectorAll(".time-slot").forEach(slot => {

      const t = slot.dataset.time;

      if(t === turno.inicio) pintando = true;
      if(t === turno.fin) pintando = false;

      if(pintando){

        const color = obtenerColorServicio(turno.servicio);

        slot.classList.add("occupied");
        slot.style.backgroundColor = color;
        slot.style.borderLeft = `4px solid ${color.replace("0.4","1")}`;

        const servicioNombre = serviciosDisponibles[turno.servicio]?.nombre || turno.servicio;

        slot.innerHTML = `
        <span>
        ${t} - <b>${paciente}</b> - ${servicioNombre}
        ${turno.observacion ? `<small style="opacity:0.7"> — ${turno.observacion}</small>` : ""}
        </span>
        `;

        slot.dataset.idTurno = turno.id;
      }

    });

  });

}

function activarBusquedaClientes(){

  const input = document.querySelector("#select-cliente .select-input");
  const opciones = document.querySelectorAll("#select-cliente .option");
  const select = document.querySelector("#select-cliente");

  if(!input) return;

  input.addEventListener("focus", ()=>{
    select.classList.add("active");
  });

  input.addEventListener("input",()=>{

    const filtro = input.value.toLowerCase();

    opciones.forEach(op=>{

      const texto = op.textContent.toLowerCase();

      if(texto.includes(filtro)){
        op.style.display="";
      }else{
        op.style.display="none";
      }

    });

  });

}

function ajustarA15(input){

  input.addEventListener("change", () => {

    let [h, m] = input.value.split(":").map(Number);

    const mRedondeado = Math.round(m / 15) * 15;

    if(mRedondeado === 60){
      h += 1;
      m = 0;
    } else {
      m = mRedondeado;
    }

    const hora = String(h).padStart(2,"0");
    const min = String(m).padStart(2,"0");

    input.value = `${hora}:${min}`;

  });

}
