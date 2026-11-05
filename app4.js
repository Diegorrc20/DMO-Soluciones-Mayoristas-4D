"use strict";
 
/* Acceso de DEMOSTRACIÓN: como está escrito en este archivo, cualquiera que abra admin.html
   puede ver estos datos con "Ver código fuente". Sirve para mostrar la función, no protege de verdad. */
const ADMIN_USUARIO = "admin";
const ADMIN_CLAVE = "1234";
 
const $ = (id) => document.getElementById(id);
const clp = (n) => Number(n || 0).toLocaleString("es-CL");

/* Para buscar sin importar tildes ni mayúsculas */
const normalizar = (texto) =>
    String(texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

let textoBusqueda = "";
 
function leerHistorial() {
    let historial = [];
    try {
        historial = JSON.parse(localStorage.getItem("historialReservas")) || [];
    } catch (e) {
        historial = [];
    }
    let cambio = false;
    historial.forEach((r) => {
        if (!r.id) {
            r.id = Date.now() + "-" + Math.random().toString(36).slice(2, 8);
            cambio = true;
        }
    });
    if (cambio) guardarHistorial(historial);
    return historial;
}
 
function guardarHistorial(historial) {
    try {
        localStorage.setItem("historialReservas", JSON.stringify(historial));
    } catch (e) { /* sin acción */ }
}
 
function el(etiqueta, propiedades, hijos) {
    const nodo = document.createElement(etiqueta);
    Object.assign(nodo, propiedades || {});
    (hijos || []).forEach((hijo) => nodo.append(hijo));
    return nodo;
}
 
function aviso(texto, tipo) {
    const mensaje = $("mensaje-sesion");
    mensaje.textContent = texto;
    mensaje.className = "estado " + (tipo || "");
}
 
function mostrarError(id, texto) {
    $("error-" + id).textContent = texto;
    $(id).setAttribute("aria-invalid", texto ? "true" : "false");
}
 
function adminActivo() {
    try { return sessionStorage.getItem("adminLogueado") === "si"; } catch (e) { return false; }
}
 
function actualizarVista() {
    const activo = adminActivo();
    $("seccion-login").hidden = activo;
    $("panel-admin").hidden = !activo;
    if (activo) cargarTabla();
}
 
function filtrarLista(lista) {
    const filtro = normalizar(textoBusqueda).trim();
    if (!filtro) return lista;
    return lista.filter((r) =>
        normalizar([r.usuario, r.email || r.correo, r.obra || r.pack].join(" ")).includes(filtro)
    );
}

function cargarTabla() {
    const cuerpo = $("cuerpo-tabla");
    cuerpo.replaceChildren();
    const todos = leerHistorial();
    const lista = filtrarLista(todos);

    const total = lista.reduce((suma, r) => suma + Number(r.monto || 0), 0);
    const clientes = new Set(lista.map((r) => (r.email || r.correo || "").toLowerCase()).filter(Boolean)).size;
    $("resumen-admin").textContent = textoBusqueda.trim()
        ? lista.length + " de " + todos.length + " registro(s) · " + clientes + " cliente(s) · Total: $" + clp(total) + " CLP"
        : todos.length + " registro(s) · " + clientes + " cliente(s) · Total: $" + clp(total) + " CLP";

    $("btn-exportar").disabled = lista.length === 0;
    $("btn-vaciar-todo").disabled = todos.length === 0;

    if (lista.length === 0) {
        const mensaje = todos.length === 0
            ? "No hay cotizaciones o compras registradas aún."
            : "Ningún registro coincide con la búsqueda.";
        cuerpo.append(el("tr", {}, [el("td", { colSpan: 6, className: "vacio", textContent: mensaje })]));
        return;
    }

    lista.forEach((r) => {
        cuerpo.append(
            el("tr", {}, [
                el("td", { textContent: r.usuario || "Cliente Mayorista" }),
                el("td", { textContent: r.email || r.correo || "Sin correo registrado" }),
                el("td", { textContent: r.obra || r.pack || "Pack de Insumos" }),
                el("td", { textContent: "$" + clp(r.monto) + " CLP" }),
                el("td", { textContent: r.fecha || "Reciente" }),
                el("td", { className: "centro" }, [
                    el("button", { type: "button", className: "btn-eliminar-fila", textContent: "🗑️ Eliminar", onclick: () => eliminar(r.id) })
                ])
            ])
        );
    });
}

/* Celdas que empiezan con = + - @ se prefijan con ' para que Excel no las ejecute como fórmula */
function celdaCSV(valor) {
    let texto = String(valor == null ? "" : valor);
    if (/^[=+\-@]/.test(texto)) texto = "'" + texto;
    return '"' + texto.replace(/"/g, '""') + '"';
}

function exportarCSV() {
    const lista = filtrarLista(leerHistorial());
    if (lista.length === 0) return;

    const filas = [["Cliente", "Correo", "Pedido", "Monto (CLP)", "Fecha"]].concat(
        lista.map((r) => [
            r.usuario || "Cliente Mayorista",
            r.email || r.correo || "",
            r.obra || r.pack || "Pack de Insumos",
            Number(r.monto || 0),
            r.fecha || ""
        ])
    );
    // Separador ";" y BOM para que Excel en español abra bien las tildes y las columnas
    const contenido = "\uFEFF" + filas.map((f) => f.map(celdaCSV).join(";")).join("\r\n");
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(new Blob([contenido], { type: "text/csv;charset=utf-8" }));
    enlace.download = "pedidos-dmo-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.append(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
    aviso("Se descargó el archivo con " + lista.length + " registro(s).", "ok");
}

function vaciarTodo() {
    const cantidad = leerHistorial().length;
    if (cantidad === 0) return;
    if (!confirm("Se borrarán los " + cantidad + " registros guardados en este navegador. Esta acción no se puede deshacer. ¿Continuar?")) return;
    guardarHistorial([]);
    cargarTabla();
    aviso("Se borraron todos los registros.", "ok");
}

function eliminar(id) {
    if (!confirm("¿Estás seguro de que deseas eliminar este registro de compra?")) return;
    guardarHistorial(leerHistorial().filter((r) => r.id !== id));
    cargarTabla();
}
 
$("form-login-admin").addEventListener("submit", (evento) => {
    evento.preventDefault();
    const nombre = $("admin-nombre").value.trim();
    const clave = $("admin-clave").value.trim();
 
    mostrarError("admin-nombre", nombre === "" ? "Ingresa el nombre de usuario." : "");
    mostrarError("admin-clave", clave === "" ? "Ingresa la contraseña." : "");
    if (nombre === "" || clave === "") return;
 
    if (nombre !== ADMIN_USUARIO || clave !== ADMIN_CLAVE) {
        mostrarError("admin-clave", "Usuario o contraseña incorrectos.");
        return;
    }
 
    try { sessionStorage.setItem("adminLogueado", "si"); } catch (e) { /* sin acción */ }
    $("form-login-admin").reset();
    actualizarVista();
    aviso("¡Sesión iniciada como Administrador!", "ok");
});
 
$("btn-cerrar-admin").addEventListener("click", () => {
    try { sessionStorage.removeItem("adminLogueado"); } catch (e) { /* sin acción */ }
    actualizarVista();
    aviso("Sesión de Administrador cerrada.", "ok");
});
 
$("buscar-pedido").addEventListener("input", (evento) => {
    textoBusqueda = evento.target.value;
    cargarTabla();
});
$("btn-exportar").addEventListener("click", exportarCSV);
$("btn-vaciar-todo").addEventListener("click", vaciarTodo);
$("mostrar-clave-admin").addEventListener("change", (evento) => {
    $("admin-clave").type = evento.target.checked ? "text" : "password";
});

actualizarVista();