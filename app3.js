"use strict";

const NUMERO_WHATSAPP = "56953518383"; // formato internacional, sin "+" ni espacios

const $ = (id) => document.getElementById(id);

const REGLAS = [
    { id: "nombre", error: (v) => (v.trim().length < 3 ? "Ingresa tu nombre o el de tu empresa (mínimo 3 caracteres)." : "") },
    { id: "correo", error: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Ingresa un correo válido, por ejemplo nombre@empresa.cl.") },
    { id: "telefono", error: (v) => (v.trim() === "" || /^[+\d\s()-]{8,18}$/.test(v.trim()) ? "" : "Ingresa un teléfono válido o deja el campo vacío.") },
    { id: "motivo", error: (v) => (v ? "" : "Selecciona el motivo de tu consulta.") },
    { id: "mensaje", error: (v) => (v.trim().length < 10 ? "Cuéntanos un poco más (mínimo 10 caracteres)." : "") }
];

const formulario = $("form-contacto");
const campoMensaje = $("mensaje");
const contador = $("contador-mensaje");

function actualizarContador() {
    contador.textContent = campoMensaje.value.length + " / " + campoMensaje.maxLength;
}

/* Cada campo se valida de nuevo mientras la persona corrige, sin esperar a otro envío */
function validarCampo(regla) {
    const campo = $(regla.id);
    const mensaje = regla.error(campo.value);
    $("error-" + regla.id).textContent = mensaje;
    campo.setAttribute("aria-invalid", mensaje ? "true" : "false");
    return mensaje ? campo : null;
}

REGLAS.forEach((regla) => {
    const campo = $(regla.id);
    const evento = campo.tagName === "SELECT" ? "change" : "input";
    campo.addEventListener(evento, () => {
        if (campo.getAttribute("aria-invalid") === "true") validarCampo(regla);
    });
});

campoMensaje.addEventListener("input", actualizarContador);

formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const estado = $("estado-contacto");
    let primerError = null;

    REGLAS.forEach((regla) => {
        const campoConError = validarCampo(regla);
        if (campoConError && !primerError) primerError = campoConError;
    });

    if (primerError) {
        estado.textContent = "Revisa los campos marcados.";
        estado.className = "estado error";
        primerError.focus();
        return;
    }

    const telefono = $("telefono").value.trim();
    const texto =
        "Hola, soy " + $("nombre").value.trim() + " (" + $("correo").value.trim() +
        (telefono ? ", " + telefono : "") + ").\nMotivo: " + $("motivo").value +
        "\n" + campoMensaje.value.trim();

    window.open("https://wa.me/" + NUMERO_WHATSAPP + "?text=" + encodeURIComponent(texto), "_blank", "noopener");
    estado.textContent = "Se abrió WhatsApp con tu consulta lista para enviar.";
    estado.className = "estado ok";

    formulario.reset();
    REGLAS.forEach((regla) => $(regla.id).setAttribute("aria-invalid", "false"));
    actualizarContador();
});

actualizarContador();