const inputTarea = document.getElementById("tarea-input");
const btnAgregar = document.getElementById("agregar-btn");
const listaTareas = document.getElementById("lista-tareas");
const botonesFiltro = document.querySelectorAll(".filtro");
const selectOrden = document.getElementById("orden");
const toggleModo = document.getElementById("modo-toggle");

let filtroActual = "todas";
let tareas = [];

// Cargar tareas y modo al iniciar
document.addEventListener("DOMContentLoaded", () => {
  cargarTareas();
  if (localStorage.getItem("modo") === "dark") {
    document.body.classList.add("dark");
    toggleModo.checked = true;
  }
});

// Permitir Enter
inputTarea.addEventListener("keyup", (e) => {
  if (e.key === "Enter") btnAgregar.click();
});

// Agregar tarea
btnAgregar.addEventListener("click", () => {
  const texto = inputTarea.value.trim();
  if (texto !== "") {
    const fecha = new Date().toLocaleString();
    tareas.push({ texto, completada: false, fecha });
    guardarTareas();
    inputTarea.value = "";
    mostrarTareas();
  }
});

// Cambiar modo
toggleModo.addEventListener("change", () => {
  document.body.classList.toggle("dark", toggleModo.checked);
  localStorage.setItem("modo", toggleModo.checked ? "dark" : "light");
});

// Función: mostrar tareas con filtro y orden
function mostrarTareas() {
  listaTareas.innerHTML = "";

  let filtradas = tareas.filter(t => {
    if (filtroActual === "pendientes") return !t.completada;
    if (filtroActual === "completadas") return t.completada;
    return true;
  });

  // Ordenamiento
  filtradas.sort((a, b) => {
    if (selectOrden.value === "recientes")
      return new Date(b.fecha) - new Date(a.fecha);
    if (selectOrden.value === "antiguas")
      return new Date(a.fecha) - new Date(b.fecha);
    if (selectOrden.value === "pendientes")
      return (a.completada === b.completada) ? 0 : a.completada ? 1 : -1;
    if (selectOrden.value === "completadas")
      return (a.completada === b.completada) ? 0 : a.completada ? -1 : 1;
  });

  filtradas.forEach((t, index) => agregarTarea(t, index));
}

// Renderizar una tarea
function agregarTarea(t, index) {
  const li = document.createElement("li");
  li.classList.add("tarea");
  if (t.completada) li.classList.add("completada");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = t.completada;
  checkbox.addEventListener("change", () => {
    tareas[index].completada = checkbox.checked;
    guardarTareas();
    mostrarTareas();
  });

  const spanTexto = document.createElement("span");
  spanTexto.textContent = t.texto;

  const spanFecha = document.createElement("span");
  spanFecha.textContent = ` (${t.fecha})`;
  spanFecha.classList.add("fecha");

  const btnEliminar = document.createElement("button");
  btnEliminar.textContent = "❌";
  btnEliminar.addEventListener("click", () => {
    li.classList.add("eliminando");
    setTimeout(() => {
      tareas.splice(index, 1);
      guardarTareas();
      mostrarTareas();
    }, 400);
  });

  li.appendChild(checkbox);
  li.appendChild(spanTexto);
  li.appendChild(spanFecha);
  li.appendChild(btnEliminar);
  listaTareas.appendChild(li);
}

// Guardar y cargar LocalStorage
function guardarTareas() {
  localStorage.setItem("tareas", JSON.stringify(tareas));
}
function cargarTareas() {
  tareas = JSON.parse(localStorage.getItem("tareas")) || [];
  mostrarTareas();
}

// Filtros
botonesFiltro.forEach(boton => {
  boton.addEventListener("click", () => {
    botonesFiltro.forEach(b => b.classList.remove("activo"));
    boton.classList.add("activo");
    filtroActual = boton.dataset.filtro;
    mostrarTareas();
  });
});

// Ordenamiento
selectOrden.addEventListener("change", mostrarTareas);
