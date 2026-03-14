const form = document.getElementById("clientForm");
const list = document.getElementById("clientsList");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const alphabetBar = document.getElementById("alphabetBar");

const modal = document.getElementById("clientModal");
const addBtn = document.getElementById("addBtn");
const closeModal = document.getElementById("closeModal");

const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");

const petModal = document.getElementById("petModal");
const petForm = document.getElementById("petForm");
const cancelPetBtn = document.getElementById("cancelPetBtn");
const editPetBtn = document.getElementById("editPetBtn");

const fichaModal = document.getElementById("fichaModal");
const fichaForm = document.getElementById("fichaForm");
const addFichaBtn = document.getElementById("addFichaBtn");
const fichasPanel = document.getElementById("fichasPanel");


const fichaFiles = document.getElementById("fichaFiles");
const filesPreview = document.getElementById("filesPreview");

let clients = JSON.parse(localStorage.getItem("clients")) || [];
let currentPage = 1;
const perPage = 10;
let currentLetter = "";
let currentSearch = "";
let editMode = false;
let selectedClient = null;
let selectedPet = null;
let selectedFicha = null;
let fichaEditMode = false;
let attachedFiles = [];

let catalogo = JSON.parse(localStorage.getItem("catalogo")) || {
  especies: ["Canino", "Felino", "Ave"],
  razas: {
    Canino: ["Labrador", "Bulldog", "Caniche"],
    Felino: ["Siames", "Persa"]
  },
  generos: ["Macho", "Hembra"]
};

/* =====================
   ALFABETO
===================== */
alphabetBar.innerHTML = "";

"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(l => {
  const btn = document.createElement("button");
  btn.textContent = l;

  btn.onclick = () => {
    currentLetter = l;
    currentSearch = ""; // 🔥 limpia búsqueda texto
    searchInput.value = "";
    currentPage = 1;
    render();
  };

  alphabetBar.appendChild(btn);
});

/* =====================
   RENDER
===================== */
function render() {
  list.innerHTML = "";

  // 1️⃣ aplicar filtro por letra
  let filtered = clients.filter(c => {
    const fullName = (c.nombre + " " + c.apellido).toLowerCase();

    if (currentLetter && !fullName.startsWith(currentLetter.toLowerCase())) {
      return false;
    }

    if (currentSearch && !fullName.includes(currentSearch.toLowerCase())) {
      return false;
    }

    return true;
  });

  // 2️⃣ paginación
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const pageClients = filtered.slice(start, end);

  // 3️⃣ render
  pageClients.forEach((c, index) => {
    const realIndex = clients.indexOf(c);

    const clientDiv = document.createElement("div");
    clientDiv.className = "client-item";

    clientDiv.innerHTML = `
      <div class="client-row">
        <span class="client-name">
          ${c.nombre} ${c.apellido}
          <small>(${(c.mascotas || []).length})</small>
        </span>

        <div class="client-actions hidden">
          <button class="view-client">👁</button>
        </div>
      </div>

      <div class="pets-list hidden"></div>
    `;

    const petsList = clientDiv.querySelector(".pets-list");
    const actions = clientDiv.querySelector(".client-actions");

    const row = clientDiv.querySelector(".client-row");

    row.onclick = () => {
      petsList.classList.toggle("hidden");
      actions.classList.toggle("hidden");
    };

    clientDiv.querySelector(".view-client").onclick = (e) => {
      e.stopPropagation();
      loadClient(realIndex);
    };

    (c.mascotas || []).forEach((m, petIndex) => {
      const petDiv = document.createElement("div");
      petDiv.className = "pet-item";
      petDiv.innerHTML = `
        🐾 ${m.nombre}
        <button class="view-pet">👁</button>
      `;

      petDiv.querySelector(".view-pet").onclick = (e) => {
        e.stopPropagation();
        loadPet(realIndex, petIndex);
      };

      petsList.appendChild(petDiv);
    });

    const addPetBtn = document.createElement("button");
    addPetBtn.className = "add-pet-btn";
    addPetBtn.textContent = "➕ Agregar mascota";

    addPetBtn.onclick = (e) => {
      e.stopPropagation();
      openNewPetModal(realIndex);
    };

    petsList.appendChild(addPetBtn);
    list.appendChild(clientDiv);
  });
}

/* =====================
   BUSCAR
===================== */
// 🔍 mientras escribís
searchInput.addEventListener("input", () => {
  currentSearch = searchInput.value.toLowerCase();
  currentLetter = ""; // si escribís, se anula el filtro por letra
  currentPage = 1;
  render();
});

// 🔘 botón buscar (opcional)
searchBtn.onclick = () => {
  currentSearch = searchInput.value.toLowerCase();
  currentLetter = "";
  currentPage = 1;
  render();
};

/* =====================
   PAGINACION
===================== */
prevPageBtn.onclick = () => {
  if (currentPage > 1) {
    currentPage--;
    render();
  }
};

nextPageBtn.onclick = () => {
  currentPage++;
  render();
};

/* =====================
   MODAL
===================== */
const cancelBtn = document.getElementById("cancelBtn");

function openClientModal() {
  modal.classList.add("active");
}

function closeClientModal() {
  modal.classList.remove("active");
}

addBtn.addEventListener("click", () => {
  selectedClient = null;
  selectedPet = null;
  editMode = true;
  form.reset();
  setFormDisabled(false);
  openClientModal();
});

cancelBtn.addEventListener("click", closeClientModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    closeClientModal();
  }
});
/* =====================
   GUARDAR
===================== */

  // CLIENTE
form.addEventListener("submit", e => {
  e.preventDefault();

  const clientData = {
    nombre: form[0].value,
    apellido: form[1].value,
    documento: form[2].value,
    direccion: form[3].value,
    telefono: form[4].value,
    email: form[5].value,
    whatsapp: form[6].value,
    mascotas: selectedClient !== null 
      ? clients[selectedClient].mascotas 
      : []
  };

  if (selectedClient === null) {
    clients.push(clientData);
  } else {
    clients[selectedClient] = clientData;
  }

  localStorage.setItem("clients", JSON.stringify(clients));
  closeClientModal();
  render();
});

/* =====================
   INIT
===================== */
render();

const especieSelect = petForm.querySelector('[data-name="petEspecie"]');
const razaSelect = petForm.querySelector('[data-name="petRaza"]');
const generoSelect = petForm.querySelector('[data-name="petGenero"]');

llenarSelect(especieSelect, catalogo.especies);
llenarSelect(generoSelect, catalogo.generos, false);

function loadClient(index) {
  const c = clients[index];
  selectedClient = index;
  selectedPet = null;
  editMode = false;

  form[0].value = c.nombre;
  form[1].value = c.apellido;
  form[2].value = c.documento;
  form[3].value = c.direccion;
  form[4].value = c.telefono;
  form[5].value = c.email;
  form[6].value = c.whatsapp;

  setFormDisabled(true); // 🔒 ver solamente
  openClientModal();
}

function setFormDisabled(state) {
  const inputs = form.querySelectorAll("input, textarea, .custom-select");
  inputs.forEach(el => {
    if (el.classList.contains("custom-select")) {
      el.style.pointerEvents = state ? "none" : "auto";
      el.style.opacity = state ? "0.6" : "1";
    } else {
      el.disabled = state;
    }
  });
}

function loadPet(clientIndex, petIndex) {
  const pet = clients[clientIndex].mascotas[petIndex];
  selectedClient = clientIndex;
  selectedPet = petIndex;
  editMode = false;

  petForm.querySelector('[name="petNombre"]').value = pet.nombre;
  petForm.querySelector('[name="petNacimiento"]').value = pet.nacimiento;
  especieSelect.dataset.value = pet.especie;
  const label = especieSelect.querySelector(".select-selected");
  if (label) label.textContent = pet.especie;

  const razas = catalogo.razas[pet.especie] || [];
  llenarSelect(razaSelect, razas);
  razaSelect.dataset.value = pet.raza;
  const labelRaza = razaSelect.querySelector(".select-selected");
  if (labelRaza) labelRaza.textContent = pet.raza;

  generoSelect.dataset.value = pet.genero;
  const labelGenero = generoSelect.querySelector(".select-selected");
  if (labelGenero) labelGenero.textContent = pet.genero;

  petForm.querySelector('[name="petDescripcion"]').value = pet.descripcion;

  setPetFormDisabled(true);
  petModal.classList.add("active");
  renderFichas();
}

petForm.addEventListener("submit", e => {
  e.preventDefault();

  const petData = {
    nombre: petForm.querySelector('[name="petNombre"]').value,
    nacimiento: petForm.querySelector('[name="petNacimiento"]').value,
    especie: especieSelect.dataset.value,
    genero: generoSelect.dataset.value,
    raza: razaSelect.dataset.value,
    descripcion: petForm.querySelector('[name="petDescripcion"]').value,
    fichas: selectedPet !== null
      ? clients[selectedClient].mascotas[selectedPet].fichas
      : []
  };

  if (selectedPet === null) {
    clients[selectedClient].mascotas.push(petData);
  } else {
    clients[selectedClient].mascotas[selectedPet] = petData;
  }

  localStorage.setItem("clients", JSON.stringify(clients));
  petModal.classList.remove("active");
  render();
});

function openNewPetModal(clientIndex) {

  selectedClient = clientIndex;
  selectedPet = null;
  editMode = true;

  petForm.reset();

  especieSelect.dataset.value = "";
  razaSelect.dataset.value = "";
  generoSelect.dataset.value = "";

  especieSelect.querySelector(".select-selected").textContent = "Seleccionar";
  razaSelect.querySelector(".select-selected").textContent = "Seleccionar";
  generoSelect.querySelector(".select-selected").textContent = "Seleccionar";

  llenarSelect(razaSelect, []);
  setPetFormDisabled(false);

  petModal.classList.add("active");
}

petModal.addEventListener("click", (e) => {
  if (e.target === petModal) {
    petModal.classList.remove("active");
  }
});

cancelPetBtn.onclick = () => {
  petModal.classList.remove("active");
};

editPetBtn.onclick = () => {
  editMode = true;
  setPetFormDisabled(false); // habilita inputs
};

function setPetFormDisabled(state) {
  const inputs = petForm.querySelectorAll("input, textarea, .custom-select");

  inputs.forEach(el => {

    if (el.classList.contains("custom-select")) {
      el.style.pointerEvents = state ? "none" : "auto";
      el.style.opacity = state ? "0.6" : "1";
    } else {
      el.disabled = state;
    }

  });
}

addFichaBtn.onclick = () => {
  selectedFicha = null;
  fichaEditMode = true;
  fichaForm.reset();
  attachedFiles = [];
  filesPreview.innerHTML = "";
  setFichaFormDisabled(false);
  fichaModal.classList.add("active");
};

fichaForm.addEventListener("submit", e => {
  e.preventDefault();

  const fichas = clients[selectedClient]
    .mascotas[selectedPet]
    .fichas;

  const ficha = {
    peso: fichaForm.peso.value,
    temp: fichaForm.temp.value,
    obs: fichaForm.obs.value,
    vet: fichaForm.vet.value,
    archivos: attachedFiles,
    fecha: selectedFicha === null
      ? new Date().toLocaleDateString()
      : fichas[selectedFicha].fecha
  };

  if (selectedFicha === null) {
    fichas.push(ficha);
  } else {
    fichas[selectedFicha] = ficha;
  }

  localStorage.setItem("clients", JSON.stringify(clients));
  fichaModal.classList.remove("active");
  renderFichas();
});

function renderFichas() {
  fichasPanel.innerHTML = "";

  const fichas = clients[selectedClient]
    .mascotas[selectedPet].fichas || [];

  fichas.forEach((f, index) => {
    const div = document.createElement("div");
    div.className = "ficha-icon";
    div.textContent = `📄 ${f.fecha} - ${f.vet}`;

    div.onclick = () => {
      abrirFicha(index);
    };

    fichasPanel.appendChild(div);
  });
}

const cancelFichaBtn = document.getElementById("cancelFichaBtn");

cancelFichaBtn.onclick = () => {
  fichaModal.classList.remove("active");
};

function abrirFicha(index) {
  selectedFicha = index;
  fichaEditMode = false;

  const ficha = clients[selectedClient]
    .mascotas[selectedPet]
    .fichas[index];

  fichaForm.peso.value = ficha.peso;
  fichaForm.temp.value = ficha.temp;
  fichaForm.obs.value = ficha.obs;
  fichaForm.vet.value = ficha.vet;

  setFichaFormDisabled(true); // 🔒 modo lectura
  fichaModal.classList.add("active");
}

fichaFiles.addEventListener("change", () => {

  const files = Array.from(fichaFiles.files);

  files.forEach(file => {

    const reader = new FileReader();

    reader.onload = function(e) {

      attachedFiles.push({
        name: file.name,
        type: file.type,
        data: e.target.result
      });

      renderFilesPreview();

    };

    reader.readAsDataURL(file);

  });

});

function renderFilesPreview() {

  filesPreview.innerHTML = "";

  attachedFiles.forEach((file, index) => {

    const div = document.createElement("div");
    div.className = "file-item";

    if (file.type.startsWith("image")) {

      div.innerHTML = `
        <img src="${file.data}" class="file-thumb">
        <span>${file.name}</span>
        <button data-index="${index}">❌</button>
      `;

    } else {

      div.innerHTML = `
        📄 ${file.name}
        <button data-index="${index}">❌</button>
      `;

    }

    div.querySelector("button").onclick = () => {
      attachedFiles.splice(index,1);
      renderFilesPreview();
    };

    filesPreview.appendChild(div);

  });

}

function setFichaFormDisabled(state) {

  const inputs = fichaForm.querySelectorAll("input, textarea");

  inputs.forEach(i => {

    if (i.type !== "file") {
      i.disabled = state;
    }

  });

}

const editFichaBtn = document.getElementById("editFichaBtn");

editFichaBtn.onclick = () => {
  fichaEditMode = true;
  setFichaFormDisabled(false);
};

function llenarSelect(select, opciones, admin = true) {

  const optionsContainer = select.querySelector(".select-options");
  const selected = select.querySelector(".select-selected");

  optionsContainer.innerHTML = "";

  select.dataset.value = "";
  selected.textContent = "Seleccionar";

  opciones.forEach(op => {

    const div = document.createElement("div");
    div.className = "option";
    div.dataset.value = op;
    div.textContent = op;

    div.onclick = () => {

      selected.textContent = op;
      select.dataset.value = op;
      select.classList.remove("active");

      // 🔹 si cambia especie → actualizar razas
      if (select.dataset.name === "petEspecie") {
        const razas = catalogo.razas[op] || [];
        llenarSelect(razaSelect, razas);
      }

    };

    optionsContainer.appendChild(div);
  });

  /* 🔧 BOTON ADMINISTRAR */

  if (admin) {

    const adminBtn = document.createElement("div");
    adminBtn.className = "option option-admin";
    adminBtn.textContent = "⚙ Administrar";

    adminBtn.onclick = (e) => {

      e.stopPropagation();

      if (select.dataset.name === "petEspecie") {
        abrirCatalogo("especies");
      }

      if (select.dataset.name === "petRaza") {

        const especie = especieSelect.dataset.value;

        if (!especie) {
          alert("Primero seleccione una especie");
          return;
        }

        abrirCatalogo("razas", especie);
      }

    };

    optionsContainer.appendChild(adminBtn);
  }

}

const catalogModal = document.getElementById("catalogModal");
const catalogList = document.getElementById("catalogList");
const newOption = document.getElementById("newOption");

let catalogType = null;
let catalogParent = null;

function abrirCatalogo(tipo, parent = null) {

  catalogType = tipo;
  catalogParent = parent;

  catalogModal.classList.add("active");

  renderCatalogo();
}

function renderCatalogo() {

  catalogList.innerHTML = "";

  let lista;

  if (catalogType === "especies") {
    lista = catalogo.especies;
  }

  if (catalogType === "razas") {
    lista = catalogo.razas[catalogParent] || [];
  }

  lista.forEach((item, index) => {

    const row = document.createElement("div");

    row.innerHTML = `
      <input value="${item}" data-index="${index}">
      <button data-del="${index}">🗑</button>
    `;

    catalogList.appendChild(row);
  });
}

document.getElementById("addOption").onclick = () => {

  const value = newOption.value.trim();

  if (!value) return;

  if (catalogType === "especies") {
    catalogo.especies.push(value);
  }

  if (catalogType === "razas") {

    if (!catalogo.razas[catalogParent]) {
      catalogo.razas[catalogParent] = [];
    }

    catalogo.razas[catalogParent].push(value);
  }

  newOption.value = "";
  renderCatalogo();
};

document.getElementById("saveCatalog").onclick = () => {

  const inputs = catalogList.querySelectorAll("input");
  let lista = [];

  inputs.forEach(i => lista.push(i.value));

  if (catalogType === "especies") {
    catalogo.especies = lista;
    llenarSelect(especieSelect, catalogo.especies);
  }

  if (catalogType === "razas") {
    catalogo.razas[catalogParent] = lista;

    // 🔹 actualizar select de razas inmediatamente
    if (especieSelect.dataset.value === catalogParent) {
      llenarSelect(razaSelect, catalogo.razas[catalogParent]);
    }
  }

  localStorage.setItem("catalogo", JSON.stringify(catalogo));

  catalogModal.classList.remove("active");

};

function inicializarSelects() {

document.querySelectorAll(".custom-select").forEach(select => {

const trigger =
select.querySelector(".select-selected") ||
select.querySelector(".select-trigger");

const options = select.querySelector(".select-options");

if(!trigger || !options) return;

if(trigger.dataset.ready) return;

trigger.dataset.ready = "true";

trigger.onclick = (e) => {

e.stopPropagation();

const isOpen = select.classList.contains("active");

document.querySelectorAll(".custom-select")
.forEach(s => s.classList.remove("active"));

if (!isOpen) {
select.classList.add("active");
}

};

});

}

document.addEventListener("click", () => {

document.querySelectorAll(".custom-select")
.forEach(s => s.classList.remove("active"));

});

inicializarSelects();

