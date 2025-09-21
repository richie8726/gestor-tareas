// Seleccionar elementos del DOM
const inputTarea = document.getElementById("tarea-input");
const btnAgregar = document.getElementById("agregar-btn");
const listaTareas = document.getElementById("lista-tareas");
const botonesFiltro = document.querySelectorAll(".filtro");

let filtroActual = "todas";

// Cargar tareas desde LocalStorage al inicio
document.addEventListener("DOMContentLoaded", cargarTareas);

// Permitir Enter para agregar tarea
inputTarea.addEventListener("keyup", (e) => {
  if (e.key === "Enter") btnAgregar.click();
});

// Evento: Agregar tarea
btnAgregar.addEventListener("click", () => {
  const texto = inputTarea.value.trim();
  if (texto !== "") {
    const fecha = new Date().toLocaleString(); // Fecha + hora
    agregarTarea(texto, false, fecha);
    guardarTareas();
    inputTarea.value = "";
  }
});

// Función: agregar tarea
function agregarTarea(texto, completada = false, fecha = null) {
  const li = document.createElement("li");
  li.classList.add("tarea");
  if (completada) li.classList.add("completada");

  // Checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = completada;

  // Texto de la tarea
  const spanTexto = document.createElement("span");
  spanTexto.textContent = texto;

  // Fecha
  const spanFecha = document.createElement("span");
  spanFecha.textContent = ` (${fecha || new Date().toLocaleString()})`;
  spanFecha.classList.add("fecha");

  // Botón eliminar
  const btnEliminar = document.createElement("button");
  btnEliminar.textContent = "❌";
  btnEliminar.style.marginLeft = "10px";
  btnEliminar.style.cursor = "pointer";

  // Evento: marcar como completada con checkbox
  checkbox.addEventListener("change", () => {
    li.classList.toggle("completada", checkbox.checked);
    guardarTareas();
    mostrarTareas();
  });

  // Evento: eliminar tarea con animación
  btnEliminar.addEventListener("click", () => {
    // añadimos clase para animación CSS (fadeOut)
    li.classList.add("eliminando");
    // luego de la animación, removemos y guardamos
    setTimeout(() => {
      li.remove();
      guardarTareas();
    }, 400); // 400ms -> debe coincidir con la duración de la animación CSS
  });

  // Construir el li
  li.appendChild(checkbox);
  li.appendChild(spanTexto);
  li.appendChild(spanFecha);
  li.appendChild(btnEliminar);
  listaTareas.appendChild(li);

  mostrarTareas();
}

// Guardar tareas en LocalStorage
function guardarTareas() {
  const tareas = [];
  document.querySelectorAll(".tarea").forEach(li => {
    // Obtenemos el span que NO sea la fecha (evita confundir texto con fecha)
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

// Cargar tareas desde LocalStorage
function cargarTareas() {
  // Limpiamos la lista para evitar duplicados (útil cuando recargas el script)
  listaTareas.innerHTML = "";

  const tareas = JSON.parse(localStorage.getItem("tareas")) || [];
  tareas.forEach(t => agregarTarea(t.texto, t.completada, t.fecha));
}

// Filtrar y mostrar tareas
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

// Eventos de los botones de filtro
botonesFiltro.forEach(boton => {
  boton.addEventListener("click", () => {
    botonesFiltro.forEach(b => b.classList.remove("activo"));
    boton.classList.add("activo");
    filtroActual = boton.dataset.filtro;
    mostrarTareas();
  });
});
