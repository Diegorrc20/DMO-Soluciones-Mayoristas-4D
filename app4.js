"use strict";
 
/* Acceso de DEMOSTRACIÓN: como está escrito en este archivo, cualquiera que abra admin.html
   puede ver estos datos con "Ver código fuente". Sirve para mostrar la función, no protege de verdad. */
const ADMIN_USUARIO = "admin";
const ADMIN_CLAVE = "1234";
 
const $ = (id) => document.getElementById(id);
const clp = (n) => Number(n || 0).toLocaleString("es-CL");
 
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
 
function cargarTabla() {
    const cuerpo = $("cuerpo-tabla");
    cuerpo.replaceChildren();
    const lista = leerHistorial();
 
    const total = lista.reduce((suma, r) => suma + Number(r.monto || 0), 0);
    $("resumen-admin").textContent = lista.length + " registro(s) · Total: $" + clp(total) + " CLP";
 
    if (lista.length === 0) {
        cuerpo.append(el("tr", {}, [el("td", { colSpan: 6, className: "vacio", textContent: "No hay cotizaciones o compras registradas aún." })]));
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
 
actualizarVista();
 