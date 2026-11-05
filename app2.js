"use strict";

/* ===== CONFIGURACIÓN ===== */
const NUMERO_WHATSAPP = "56953518383"; // formato internacional, sin "+" ni espacios
const LARGO_MINIMO_CLAVE = 4;

const PACKS = [
    {
        titulo: "Cepillo de peluquería para cardado y peinado",
        precio: 1000,
        descripcion: "Herramienta ideal para técnicas de volumen, brushing y acabados profesionales en salón.",
        imagen: "Cepillo de peluquería para cardado y peinado.png"
    },
    {
        titulo: "Cepillo doble para cejas y pestañas o cepillo perfilador de cejas",
        precio: 1000,
        descripcion: "Diseño dual ergonómico para peinar, definir cejas y separar pestañas con precisión.",
        imagen: "Cepillo doble para cejas y pestañas o cepillo perfilador de cejas.png"
    },
    {
        titulo: "Cuchillas depiladoras para cejas",
        precio: 1000,
        descripcion: "Cuchillas de alta precisión con protector de seguridad para perfilado facial limpio y rápido.",
        imagen: "Cuchillas depiladoras para cejas.png"
    },
    {
        titulo: "Kit de cepillos y peines para cejas",
        precio: 1500,
        descripcion: "Set completo de accesorios surtidos orientados al cuidado y laminado de cejas.",
        imagen: "Kit de cepillos y peines para cejas.png"
    },
    {
        titulo: "Kit de perfilado de cejas 3 en 1",
        precio: 1500,
        descripcion: "Solución integral que incluye herramientas esenciales para diseño y mantenimiento de cejas.",
        imagen: "Kit de perfilado de cejas 3 en 1.png"
    },
    {
        titulo: "Peine para hacer divisiones en el cabello",
        precio: 1000,
        descripcion: "Peine de púa metálica o fina, resistente al calor, perfecto para particiones limpias y tinturas.",
        imagen: "Peine para hacer divisiones en el cabello.png"
    },
    {
        titulo: "Peine perfilador de cejas",
        precio: 1000,
        descripcion: "Accesorio compacto y funcional para retoques rápidos y definición perfecta de la mirada.",
        imagen: "Peine perfilador de cejas.png"
    },
    {
        titulo: "Pestañas postizas",
        precio: 1000,
        descripcion: "Pestañas con volumen natural y banda flexible para una aplicación cómoda y estética duradera.",
        imagen: "Pestañas postizas.png"
    }
];

/* ===== UTILIDADES ===== */
const $ = (id) => document.getElementById(id);
const clp = (n) => Number(n || 0).toLocaleString("es-CL");
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Para buscar sin importar tildes ni mayúsculas ("pestanas" encuentra "Pestañas") */
const normalizar = (texto) =>
    String(texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function leerJSON(clave, defecto) {
    try {
        const valor = localStorage.getItem(clave);
        return valor ? JSON.parse(valor) : defecto;
    } catch (e) {
        return defecto;
    }
}

function guardarJSON(clave, valor) {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
    } catch (e) { /* sin acción si el navegador bloquea */ }
}

function leerSesion(clave) {
    try { return sessionStorage.getItem(clave); } catch (e) { return null; }
}
function guardarSesion(clave, valor) {
    try { sessionStorage.setItem(clave, valor); } catch (e) { /* sin acción */ }
}
function borrarSesion(clave) {
    try { sessionStorage.removeItem(clave); } catch (e) { /* sin acción */ }
}

function el(etiqueta, propiedades, hijos) {
    const nodo = document.createElement(etiqueta);
    Object.assign(nodo, propiedades || {});
    (hijos || []).forEach((hijo) => nodo.append(hijo));
    return nodo;
}

function aviso(idElemento, texto, tipo) {
    const mensaje = $(idElemento);
    mensaje.textContent = texto;
    mensaje.className = "estado " + (tipo || "");
}

function mostrarErrorCampo(idCampo, texto) {
    $("error-" + idCampo).textContent = texto;
    $(idCampo).setAttribute("aria-invalid", texto ? "true" : "false");
}

/* ===== ALERTA FLOTANTE SUPERIOR ===== */
let temporizadorAlerta = null;

/* mensaje: texto en negrita. detalle y enlace son opcionales.
   Todo se inserta como texto (no como HTML), así no hay riesgo de inyección. */
function mostrarAlertaFlotante(mensaje, tipo, detalle, enlace) {
    const banner = $("alerta-banner-flotante");
    const contenido = $("texto-alerta-banner");

    contenido.replaceChildren(el("strong", { textContent: mensaje }));

    if (detalle) {
        const linea = el("span", { className: "alerta-detalle" });
        linea.append(detalle + " ");
        if (enlace) {
            linea.append(el("a", {
                href: enlace.url,
                target: "_blank",
                rel: "noopener noreferrer",
                textContent: enlace.texto
            }));
        }
        contenido.append(linea);
    }

    banner.className = "alerta-banner " + (tipo === "error" ? "error" : "ok");
    banner.hidden = false;

    clearTimeout(temporizadorAlerta);
    // Los errores se esconden solos; el éxito queda para poder usar el enlace de respaldo
    if (tipo === "error") {
        temporizadorAlerta = setTimeout(() => { banner.hidden = true; }, 8000);
    }
}

/* ===== CARRITO ===== */
let carrito = leerJSON("carritoCompras", [])
    .filter((i) => i && Number.isInteger(i.cantidad) && i.cantidad > 0)
    .map((i) => {
        const pack = PACKS.find((p) => p.titulo === i.titulo);
        return pack ? { titulo: pack.titulo, precio: pack.precio, cantidad: i.cantidad } : null;
    })
    .filter(Boolean);

function guardarYActualizarCarrito() {
    guardarJSON("carritoCompras", carrito);
    renderizarCarrito();
}

function agregarAlCarrito(pack) {
    const existente = carrito.find((i) => i.titulo === pack.titulo);
    if (existente) existente.cantidad += 1;
    else carrito.push({ titulo: pack.titulo, precio: pack.precio, cantidad: 1 });
    guardarYActualizarCarrito();
}

function cambiarCantidad(index, cambio) {
    if (!carrito[index]) return;
    carrito[index].cantidad += cambio;
    if (carrito[index].cantidad <= 0) carrito.splice(index, 1);
    guardarYActualizarCarrito();
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    guardarYActualizarCarrito();
}

function vaciarCarrito() {
    if (carrito.length === 0) return;
    if (!confirm("¿Quieres quitar todos los productos del carrito?")) return;
    carrito = [];
    guardarYActualizarCarrito();
}

/* ===== CATÁLOGO CON BUSCADOR ===== */
function mostrarCatalogo(textoBusqueda) {
    const contenedor = $("contenedor-obras");
    const filtro = normalizar(textoBusqueda).trim();
    contenedor.replaceChildren();

    const visibles = PACKS.filter((pack) =>
        normalizar(pack.titulo + " " + pack.descripcion).includes(filtro)
    );

    $("contador-catalogo").textContent = filtro
        ? "Mostrando " + visibles.length + " de " + PACKS.length + " productos."
        : PACKS.length + " productos disponibles.";

    if (visibles.length === 0) {
        contenedor.append(el("p", {
            className: "sin-resultados",
            textContent: "No encontramos productos con esa búsqueda. Prueba con otra palabra, por ejemplo \"cejas\" o \"peine\"."
        }));
        return;
    }

    visibles.forEach((pack) => {
        const imagen = el("img", { src: pack.imagen, alt: pack.titulo, loading: "lazy", decoding: "async" });
        contenedor.append(
            el("article", { className: "tarjeta-galeria" }, [
                el("div", { className: "galeria-img-container" }, [imagen]),
                el("div", { className: "galeria-info" }, [
                    el("p", { className: "galeria-titulo", textContent: pack.titulo }),
                    el("p", { className: "galeria-descripcion", textContent: pack.descripcion }),
                    el("p", { className: "galeria-precio", textContent: "$" + clp(pack.precio) + " CLP" }),
                    el("button", {
                        type: "button",
                        className: "btn-seleccionar",
                        textContent: "Agregar al Carrito",
                        onclick: () => agregarAlCarrito(pack)
                    })
                ])
            ])
        );
    });
}

function renderizarCarrito() {
    const cuerpo = $("tabla-carrito-body");
    cuerpo.replaceChildren();

    if (carrito.length === 0) {
        cuerpo.append(el("tr", {}, [el("td", { colSpan: 5, className: "vacio", textContent: "El carrito está vacío. Agrega productos del catálogo para armar tu pedido." })]));
        $("total-carrito").textContent = "0";
        return;
    }

    let montoTotal = 0;
    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        montoTotal += subtotal;

        const menos = el("button", { type: "button", className: "btn-cant", textContent: "-", onclick: () => cambiarCantidad(index, -1) });
        menos.setAttribute("aria-label", "Quitar una unidad de " + item.titulo);
        const mas = el("button", { type: "button", className: "btn-cant", textContent: "+", onclick: () => cambiarCantidad(index, 1) });
        mas.setAttribute("aria-label", "Agregar una unidad de " + item.titulo);

        cuerpo.append(
            el("tr", {}, [
                el("td", {}, [el("strong", { textContent: item.titulo })]),
                el("td", { textContent: "$" + clp(item.precio) + " CLP" }),
                el("td", { className: "centro" }, [menos, el("span", { className: "cantidad-valor", textContent: String(item.cantidad) }), mas]),
                el("td", { textContent: "$" + clp(subtotal) + " CLP" }),
                el("td", { className: "centro" }, [el("button", { type: "button", className: "btn-eliminar", textContent: "🗑️ Quitar", onclick: () => eliminarDelCarrito(index) })])
            ])
        );
    });

    $("total-carrito").textContent = clp(montoTotal);
}

/* ===== HISTORIAL DE PEDIDOS ===== */
function leerHistorial() {
    const historial = leerJSON("historialReservas", []);
    let cambio = false;
    historial.forEach((registro) => {
        if (!registro.id) {
            registro.id = Date.now() + "-" + Math.random().toString(36).slice(2, 8);
            cambio = true;
        }
    });
    if (cambio) guardarJSON("historialReservas", historial);
    return historial;
}

function pedidosDelCliente() {
    const correoSesion = leerSesion("correoLogueado");
    return leerHistorial().filter((r) => (r.email || r.correo) === correoSesion);
}

function cargarTablaReservas() {
    const cuerpo = $("cuerpo-tabla");
    cuerpo.replaceChildren();

    const lista = pedidosDelCliente();

    if (lista.length === 0) {
        cuerpo.append(el("tr", {}, [el("td", { colSpan: 6, className: "vacio", textContent: "Aún no tienes pedidos registrados." })]));
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
                el("td", { className: "centro" }, [el("span", { className: "registrado", textContent: "Registrado" })])
            ])
        );
    });
}

/* ===== SESIÓN ===== */
function verificarSesion() {
    const usuario = leerSesion("usuarioLogueado");

    $("seccion-login").hidden = Boolean(usuario);
    $("panel-admin").hidden = !usuario;
    if (!usuario) return;

    $("titulo-panel").textContent = "Bienvenido/a, " + usuario;

    // Resumen real de lo que este cliente ha enviado desde este navegador
    const lista = pedidosDelCliente();
    $("cliente-cantidad-pedidos").textContent = String(lista.length);
    $("cliente-total-pedidos").textContent = clp(lista.reduce((suma, r) => suma + Number(r.monto || 0), 0));

    cargarTablaReservas();
}

function iniciarSesionCliente(evento) {
    evento.preventDefault();
    const usuario = $("usuario").value.trim();
    const correo = $("correo").value.trim();
    const clave = $("clave").value.trim();

    mostrarErrorCampo("usuario", usuario === "" ? "Por favor ingresa tu usuario o empresa." : "");
    mostrarErrorCampo("correo", correo === "" ? "Por favor ingresa tu correo electrónico."
        : !REGEX_CORREO.test(correo) ? "Por favor ingresa un correo electrónico válido." : "");
    mostrarErrorCampo("clave", clave === "" ? "Por favor ingresa tu contraseña."
        : clave.length < LARGO_MINIMO_CLAVE ? "La contraseña debe tener al menos " + LARGO_MINIMO_CLAVE + " caracteres." : "");

    const primerError = ["usuario", "correo", "clave"].find((id) => $("error-" + id).textContent !== "");
    if (primerError) {
        $(primerError).focus();
        return;
    }

    // La contraseña solo se valida en el formulario; no se guarda en ninguna parte
    guardarSesion("usuarioLogueado", usuario);
    guardarSesion("correoLogueado", correo.toLowerCase());

    $("form-login").reset();
    $("clave").type = "password";
    verificarSesion();
    aviso("mensaje-sesion", "¡Bienvenido/a " + usuario + "! Has iniciado sesión con éxito.", "ok");
}

function cerrarSesionCliente() {
    ["usuarioLogueado", "correoLogueado"].forEach(borrarSesion);
    verificarSesion();
    aviso("mensaje-sesion", "Sesión cerrada correctamente.", "ok");
}

/* ===== ENVÍO DEL PEDIDO ===== */
function enviarPedido() {
    const usuario = leerSesion("usuarioLogueado");

    if (!usuario) {
        mostrarAlertaFlotante("⚠️ Atención: para enviar tu pedido, primero debes iniciar sesión.", "error");
        $("usuario").focus();
        return;
    }
    if (carrito.length === 0) {
        mostrarAlertaFlotante("⚠️ Tu carrito está vacío: agrega productos antes de enviar el pedido.", "error");
        return;
    }

    const correo = leerSesion("correoLogueado") || "contacto@cliente.cl";
    const fecha = new Date().toLocaleDateString("es-CL");
    const total = carrito.reduce((suma, i) => suma + i.precio * i.cantidad, 0);
    const notas = $("notas-pedido").value.trim();

    const historial = leerHistorial();
    carrito.forEach((item) => {
        historial.unshift({
            id: Date.now() + "-" + Math.random().toString(36).slice(2, 8),
            usuario: usuario,
            email: correo,
            obra: item.titulo + " (x" + item.cantidad + ")",
            monto: item.precio * item.cantidad,
            fecha: fecha
        });
    });
    guardarJSON("historialReservas", historial);

    const mensaje =
        "Hola, soy " + usuario + " (" + correo + "). Quiero cotizar este pedido:\n" +
        carrito.map((i) => "- " + i.titulo + " x" + i.cantidad + ": $" + clp(i.precio * i.cantidad)).join("\n") +
        "\nTotal referencial: $" + clp(total) + " CLP" +
        (notas ? "\nNotas: " + notas : "");

    const urlWhatsApp = "https://wa.me/" + NUMERO_WHATSAPP + "?text=" + encodeURIComponent(mensaje);

    window.open(urlWhatsApp, "_blank", "noopener");

    carrito = [];
    $("notas-pedido").value = "";
    guardarYActualizarCarrito();
    verificarSesion();

    mostrarAlertaFlotante(
        "✅ ¡Pedido registrado con éxito! Se intentó abrir WhatsApp.",
        "ok",
        "Si tu navegador lo bloqueó o no se abrió, haz clic",
        { url: urlWhatsApp, texto: "aquí para enviar tu pedido por WhatsApp" }
    );
}

/* ===== INICIO ===== */
$("form-login").addEventListener("submit", iniciarSesionCliente);
$("btn-cerrar").addEventListener("click", cerrarSesionCliente);
$("btn-enviar-pedido").addEventListener("click", enviarPedido);
$("btn-vaciar-carrito").addEventListener("click", vaciarCarrito);
$("btn-cerrar-alerta").addEventListener("click", () => { $("alerta-banner-flotante").hidden = true; });
$("buscar-catalogo").addEventListener("input", (evento) => mostrarCatalogo(evento.target.value));
$("mostrar-clave").addEventListener("change", (evento) => {
    $("clave").type = evento.target.checked ? "text" : "password";
});

mostrarCatalogo("");
renderizarCarrito();
verificarSesion();