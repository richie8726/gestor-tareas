const inputTarea = document.getElementById("tarea-input");
const btnAgregar = document.getElementById("agregar-btn");
const listaTareas = document.getElementById("lista-tareas");
const botonesFiltro = document.querySelectorAll(".filtro");
const contador = document.getElementById("contador");
const btnEliminarCompletadas = document.getElementById("eliminar-completadas");
const btnModoToggle = document.getElementById("modo-toggle");

let filtroActual = "todas";

document.addEventListener("DOMContentLoaded", () => {
  cargarTareas();
  aplicarModoGuardado();
});

inputTarea.addEventListener("keyup", (e) => {
  if (e.key === "Enter") btnAgregar.click();
});

btnAgregar.addEventListener("click", () => {
  const texto = inputTarea.value.trim();
  if (texto !== "") {
    const fecha = new Date().toLocaleString();
    agregarTarea(texto, false, fecha, [], "azul"); // por defecto azul
    guardarTareas();
    inputTarea.value = "";
  }
});

function agregarTarea(texto, completada = false, fecha = null, subtareas = [], color = "azul") {
  const li = document.createElement("li");
  li.classList.add("tarea", `color-${color}`);
  if (completada) li.classList.add("completada");

  const header = document.createElement("div");
  header.classList.add("tarea-header");

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

  // menú colores
  const selectColor = document.createElement("select");
  ["rojo", "verde", "azul"].forEach(c => {
    const option = document.createElement("option");
    option.value = c;
    option.textContent = c.charAt(0).toUpperCase() + c.slice(1);
    if (c === color) option.selected = true;
    selectColor.appendChild(option);
  });

  selectColor.addEventListener("change", () => {
    li.classList.remove("color-rojo", "color-verde", "color-azul");
    li.classList.add(`color-${selectColor.value}`);
    guardarTareas();
  });

  header.appendChild(checkbox);
  header.appendChild(spanTexto);
  header.appendChild(spanFecha);
  header.appendChild(selectColor);
  header.appendChild(btnEliminar);

  const ulSubtareas = document.createElement("ul");
  ulSubtareas.classList.add("subtareas");

  const inputSubtarea = document.createElement("input");
  inputSubtarea.type = "text";
  inputSubtarea.placeholder = "Añadir subtarea...";
  inputSubtarea.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && inputSubtarea.value.trim() !== "") {
      agregarSubtarea(ulSubtareas, inputSubtarea.value.trim());
      inputSubtarea.value = "";
      guardarTareas();
    }
  });

  subtareas.forEach(st => agregarSubtarea(ulSubtareas, st.texto, st.completada));

  li.appendChild(header);
  li.appendChild(ulSubtareas);
  li.appendChild(inputSubtarea);
  listaTareas.appendChild(li);

  checkbox.addEventListener("change", () => {
    li.classList.toggle("completada", checkbox.checked);
    guardarTareas();
    mostrarTareas();
  });

  btnEliminar.addEventListener("click", () => {
    li.remove();
    guardarTareas();
    mostrarTareas();
  });

  mostrarTareas();
}

function agregarSubtarea(ul, texto, completada = false) {
  const li = document.createElement("li");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = completada;

  const span = document.createElement("span");
  span.textContent = texto;
  if (completada) span.style.textDecoration = "line-through";

  checkbox.addEventListener("change", () => {
    span.style.textDecoration = checkbox.checked ? "line-through" : "none";
    guardarTareas();
  });

  li.appendChild(checkbox);
  li.appendChild(span);
  ul.appendChild(li);
}

function guardarTareas() {
  const tareas = [];
  document.querySelectorAll(".tarea").forEach(li => {
    const texto = li.querySelector(".tarea-header span").textContent.trim();
    const fecha = li.querySelector(".fecha").textContent.replace(/[()]/g, "").trim();
    const completada = li.classList.contains("completada");
    const color = [...li.classList].find(c => c.startsWith("color-")).replace("color-", "");

    const subtareas = [];
    li.querySelectorAll(".subtareas li").forEach(st => {
      subtareas.push({
        texto: st.querySelector("span").textContent,
        completada: st.querySelector("input").checked
      });
    });

    tareas.push({ texto, completada, fecha, subtareas, color });
  });
  localStorage.setItem("tareas", JSON.stringify(tareas));
}

function cargarTareas() {
  listaTareas.innerHTML = "";
  const tareas = JSON.parse(localStorage.getItem("tareas")) || [];
  tareas.forEach(t => agregarTarea(t.texto, t.completada, t.fecha, t.subtareas, t.color));
}

function mostrarTareas() {
  const tareas = document.querySelectorAll(".tarea");
  tareas.forEach(t => {
    switch (filtroActual) {
      case "pendientes":
        t.style.display = t.classList.contains("completada") ? "none" : "block";
        break;
      case "completadas":
        t.style.display = t.classList.contains("completada") ? "block" : "none";
        break;
      default:
        t.style.display = "block";
    }
  });
  actualizarContador();
}

botonesFiltro.forEach(boton => {
  boton.addEventListener("click", () => {
    botonesFiltro.forEach(b => b.classList.remove("activo"));
    boton.classList.add("activo");
    filtroActual = boton.dataset.filtro;
    mostrarTareas();
  });
});

function actualizarContador() {
  const total = document.querySelectorAll(".tarea").length;
  const completadas = document.querySelectorAll(".tarea.completada").length;
  const pendientes = total - completadas;
  contador.textContent = `Pendientes: ${pendientes} | Completadas: ${completadas} | Total: ${total}`;
}

btnEliminarCompletadas.addEventListener("click", () => {
  document.querySelectorAll(".tarea.completada").forEach(t => t.remove());
  guardarTareas();
  mostrarTareas();
});

btnModoToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const modo = document.body.classList.contains("dark") ? "oscuro" : "claro";
  btnModoToggle.textContent = modo === "oscuro" ? "☀️ Modo Claro" : "🌙 Modo Oscuro";
  localStorage.setItem("modo", modo);
});

function aplicarModoGuardado() {
  const modo = localStorage.getItem("modo");
  if (modo === "oscuro") {
    document.body.classList.add("dark");
    btnModoToggle.textContent = "☀️ Modo Claro";
  }
}
