const inputTarea = document.getElementById("tarea-input");
const btnAgregar = document.getElementById("agregar-btn");
const listaTareas = document.getElementById("lista-tareas");
const botonesFiltro = document.querySelectorAll(".filtro");
const contador = document.getElementById("contador");
const btnEliminarCompletadas = document.getElementById("eliminar-completadas");
const btnModoToggle = document.getElementById("modo-toggle");

let filtroActual = "todas";

// Cargar tareas al inicio
document.addEventListener("DOMContentLoaded", () => {
  cargarTareas();
  aplicarModoGuardado();
});

// Enter para agregar
inputTarea.addEventListener("keyup", (e) => {
  if (e.key === "Enter") btnAgregar.click();
});

// Agregar tarea
btnAgregar.addEventListener("click", () => {
  const texto = inputTarea.value.trim();
  if (texto !== "") {
    const fecha = new Date().toLocaleString();
    agregarTarea(texto, false, fecha);
    guardarTareas();
    inputTarea.value = "";
  }
});

// Crear tarea
function agregarTarea(texto, completada = false, fecha = null) {
  const li = document.createElement("li");
  li.classList.add("tarea");
  if (completada) li.classList.add("completada");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = completada;

  const spanTexto = document.createElement("span");
  spanTexto.textContent = texto;

  const spanFecha = document.createElement("span");
  spanFecha.textContent = ` (${fecha || new Date().toLocaleString()})`;
  spanFecha.classList.add("fecha");

  const btnEliminar = document.createElement("button");
  btnEliminar.textContent = "❌";

  checkbox.addEventListener("change", () => {
    li.classList.toggle("completada", checkbox.checked);
    guardarTareas();
    mostrarTareas();
  });

  btnEliminar.addEventListener("click", () => {
    li.classList.add("eliminando");
    setTimeout(() => {
      li.remove();
      guardarTareas();
      mostrarTareas();
    }, 400);
  });

  li.appendChild(checkbox);
  li.appendChild(spanTexto);
  li.appendChild(spanFecha);
  li.appendChild(btnEliminar);
  listaTareas.appendChild(li);

  mostrarTareas();
}

// Guardar en localStorage
function guardarTareas() {
  const tareas = [];
  document.querySelectorAll(".tarea").forEach(li => {
    const texto = li.querySelector("span:not(.fecha)").textContent.trim();
    const fecha = li.querySelector(".fecha").textContent.replace(/[()]/g, "").trim();
    tareas.push({
      texto,
      completada: li.classList.contains("completada"),
      fecha
    });
  });
  localStorage.setItem("tareas", JSON.stringify(tareas));
}

// Cargar de localStorage
function cargarTareas() {
  listaTareas.innerHTML = "";
  const tareas = JSON.parse(localStorage.getItem("tareas")) || [];
  tareas.forEach(t => agregarTarea(t.texto, t.completada, t.fecha));
}

// Mostrar según filtro
function mostrarTareas() {
  const tareas = document.querySelectorAll(".tarea");
  tareas.forEach(t => {
    switch (filtroActual) {
      case "pendientes":
        t.style.display = t.classList.contains("completada") ? "none" : "flex";
        break;
      case "completadas":
        t.style.display = t.classList.contains("completada") ? "flex" : "none";
        break;
      default:
        t.style.display = "flex";
    }
  });
  actualizarContador();
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

// Actualizar contador
function actualizarContador() {
  const total = document.querySelectorAll(".tarea").length;
  const completadas = document.querySelectorAll(".tarea.completada").length;
  const pendientes = total - completadas;
  contador.textContent = `Pendientes: ${pendientes} | Completadas: ${completadas} | Total: ${total}`;
}

// 🔘 Eliminar todas las completadas
btnEliminarCompletadas.addEventListener("click", () => {
  document.querySelectorAll(".tarea.completada").forEach(t => t.remove());
  guardarTareas();
  mostrarTareas();
});

// 🌙 Toggle modo oscuro
btnModoToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const modo = document.body.classList.contains("dark") ? "oscuro" : "claro";
  btnModoToggle.textContent = modo === "oscuro" ? "☀️ Modo Claro" : "🌙 Modo Oscuro";
  localStorage.setItem("modo", modo);
});

// Guardar modo en localStorage
function aplicarModoGuardado() {
  const modo = localStorage.getItem("modo");
  if (modo === "oscuro") {
    document.body.classList.add("dark");
    btnModoToggle.textContent = "☀️ Modo Claro";
  }
}
