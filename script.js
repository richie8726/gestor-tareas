const inputTarea = document.getElementById("tarea-input");
const btnAgregar = document.getElementById("agregar-btn");
const listaTareas = document.getElementById("lista-tareas");
const botonesFiltro = document.querySelectorAll(".filtro");
const modoToggle = document.getElementById("modo-toggle");
const modoTexto = document.getElementById("modo-texto");

let filtroActual = "todas";

document.addEventListener("DOMContentLoaded", () => {
  cargarTareas();
  if (localStorage.getItem("modo") === "dark") {
    document.body.classList.add("dark");
    modoToggle.checked = true;
    modoTexto.textContent = "🌙 Modo Oscuro";
  }
});

inputTarea.addEventListener("keyup", (e) => {
  if (e.key === "Enter") btnAgregar.click();
});

btnAgregar.addEventListener("click", () => {
  const texto = inputTarea.value.trim();
  if (texto !== "") {
    const fecha = new Date().toLocaleString();
    agregarTarea(texto, false, fecha);
    guardarTareas();
    inputTarea.value = "";
  }
});

function agregarTarea(texto, completada = false, fecha = null) {
  const li = document.createElement("li");
  li.classList.add("tarea");
  if (completada) li.classList.add("completada");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = completada;

  const spanTexto = document.createElement("span");
  spanTexto.textContent = texto;

  spanTexto.addEventListener("dblclick", () => editarTarea(spanTexto, li));

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
    }, 400);
  });

  li.appendChild(checkbox);
  li.appendChild(spanTexto);
  li.appendChild(spanFecha);
  li.appendChild(btnEliminar);
  listaTareas.appendChild(li);

  mostrarTareas();
}

function editarTarea(span, li) {
  const textoOriginal = span.textContent;
  const inputEdicion = document.createElement("input");
  inputEdicion.type = "text";
  inputEdicion.value = textoOriginal;
  inputEdicion.classList.add("edicion");

  li.replaceChild(inputEdicion, span);
  inputEdicion.focus();

  inputEdicion.addEventListener("blur", () => {
    guardarEdicion(inputEdicion, span, li);
  });

  inputEdicion.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      guardarEdicion(inputEdicion, span, li);
    }
  });
}

function guardarEdicion(inputEdicion, span, li) {
  const nuevoTexto = inputEdicion.value.trim() || span.textContent;
  span.textContent = nuevoTexto;
  li.replaceChild(span, inputEdicion);
  guardarTareas();
}

function guardarTareas() {
  const tareas = [];
  document.querySelectorAll(".tarea").forEach(li => {
    const spanTexto = li.querySelector('span:not(.fecha)');
    const spanFecha = li.querySelector('.fecha');
    const texto = spanTexto ? spanTexto.textContent.trim() : "";
    const fecha = spanFecha ? spanFecha.textContent.replace(/[()]/g, "").trim() : "";
    tareas.push({
      texto,
      completada: li.classList.contains("completada"),
      fecha
    });
  });
  localStorage.setItem("tareas", JSON.stringify(tareas));
}

function cargarTareas() {
  listaTareas.innerHTML = "";
  const tareas = JSON.parse(localStorage.getItem("tareas")) || [];
  tareas.forEach(t => agregarTarea(t.texto, t.completada, t.fecha));
}

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
}

botonesFiltro.forEach(boton => {
  boton.addEventListener("click", () => {
    botonesFiltro.forEach(b => b.classList.remove("activo"));
    boton.classList.add("activo");
    filtroActual = boton.dataset.filtro;
    mostrarTareas();
  });
});

modoToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark");
  if (modoToggle.checked) {
    modoTexto.textContent = "🌙 Modo Oscuro";
    localStorage.setItem("modo", "dark");
  } else {
    modoTexto.textContent = "🌞 Modo Claro";
    localStorage.setItem("modo", "light");
  }
});
