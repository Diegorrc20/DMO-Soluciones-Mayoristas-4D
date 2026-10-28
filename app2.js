"use strict";

/* ===== CONFIGURACIÓN ===== */
const NUMERO_WHATSAPP = "56953518383"; // formato internacional, sin "+" ni espacios

const PACKS = [
    {
        titulo: "Cepillo de peluquería para cardado y peinado",
        precio: 1000,
        descripcion: "Herramienta ideal para técnicas de volumen, brushing y acabados profesionales en salón.",
        imagen: "Imagenes/Cepillo de peluquería para cardado y peinado.png"
    },
    {
        titulo: "Cepillo doble para cejas y pestañas o cepillo perfilador de cejas",
        precio: 1000,
        descripcion: "Diseño dual ergonómico para peinar, definir cejas y separar pestañas con precisión.",
        imagen: "Imagenes/Cepillo doble para cejas y pestañas o cepillo perfilador de cejas.png"
    },
    {
        titulo: "Cuchillas depiladoras para cejas",
        precio: 1000,
        descripcion: "Cuchillas de alta precisión con protector de seguridad para perfilado facial limpio y rápido.",
        imagen: "Imagenes/Cuchillas depiladoras para cejas.png"
    },
    {
        titulo: "Kit de cepillos y peines para cejas",
        precio: 1500,
        descripcion: "Set completo de accesorios surtidos orientados al cuidado y laminado de cejas.",
        imagen: "Imagenes/Kit de cepillos y peines para cejas.png"
    },
    {
        titulo: "Kit de perfilado de cejas 3 en 1",
        precio: 1500,
        descripcion: "Solución integral que incluye herramientas esenciales para diseño y mantenimiento de cejas.",
        imagen: "Imagenes/Kit de perfilado de cejas 3 en 1.png"
    },
    {
        titulo: "Peine para hacer divisiones en el cabello",
        precio: 1000,
        descripcion: "Peine de púa metálica o fina, resistente al calor, perfecto para particiones limpias y tinturas.",
        imagen: "Imagenes/Peine para hacer divisiones en el cabello.png"
    },
    {
        titulo: "Peine perfilador de cejas",
        precio: 1000,
        descripcion: "Accesorio compacto y funcional para retoques rápidos y definición perfecta de la mirada.",
        imagen: "Imagenes/Peine perfilador de cejas.png"
    },
    {
        titulo: "Pestañas postizas",
        precio: 1000,
        descripcion: "Pestañas con volumen natural y banda flexible para una aplicación cómoda y estética duradera.",
        imagen: "Imagenes/Pestañas postizas.png"
    }
];

/* ===== UTILIDADES ===== */
const $ = (id) => document.getElementById(id);
const clp = (n) => Number(n || 0).toLocaleString("es-CL");
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

/* Función para mostrar la alerta flotante superior visual */
function mostrarAlertaFlotante(textoHTML, tipo) {
    const banner = $("alerta-banner-flotante");
    const texto = $("texto-alerta-banner");

    texto.innerHTML = textoHTML;

    if (tipo === "error") {
        banner.style.backgroundColor = "#f8d7da";
        banner.style.color = "#721c24";
        banner.style.border = "1px solid #f5c6cb";
    } else {
        banner.style.backgroundColor = "#d4edda";
        banner.style.color = "#155724";
        banner.style.border = "1px solid #c3e6cb";
    }

    banner.style.display = "block";
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

function mostrarCatalogo() {
    const contenedor = $("contenedor-obras");
    contenedor.replaceChildren();

    PACKS.forEach((pack) => {
        const imagen = el("img", { src: pack.imagen, alt: pack.titulo, loading: "lazy" });
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
        cuerpo.append(el("tr", {}, [el("td", { colSpan: 5, className: "vacio", textContent: "El carrito está vacío." })]));
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

function cargarTablaReservas() {
    const cuerpo = $("cuerpo-tabla");
    cuerpo.replaceChildren();

    const correoSesion = leerSesion("correoLogueado");
    const lista = leerHistorial().filter((r) => (r.email || r.correo) === correoSesion);

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
    
    // Calcula automáticamente lo que el cliente ha comprado y lo refleja en "Crédito Utilizado"
    const correoSesion = leerSesion("correoLogueado");
    const lista = leerHistorial().filter((r) => (r.email || r.correo) === correoSesion);
    const totalAcumulado = lista.reduce((suma, r) => suma + Number(r.monto || 0), 0);
    
    const elemCredito = $("cliente-credito-usado");
    if (elemCredito) {
        elemCredito.textContent = clp(totalAcumulado);
    }

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
    mostrarErrorCampo("clave", clave === "" ? "Por favor ingresa tu contraseña." : "");

    const primerError = ["usuario", "correo", "clave"].find((id) => $("error-" + id).textContent !== "");
    if (primerError) {
        $(primerError).focus();
        return;
    }

    guardarSesion("usuarioLogueado", usuario);
    guardarSesion("correoLogueado", correo.toLowerCase());

    $("form-login").reset();
    verificarSesion();
    aviso("mensaje-sesion", "¡Bienvenido/a " + usuario + "! Has iniciado sesión con éxito.", "ok");
}

function cerrarSesionCliente() {
    ["usuarioLogueado", "correoLogueado"].forEach(borrarSesion);
    verificarSesion();
    aviso("mensaje-sesion", "Sesión cerrada correctamente.", "ok");
}

/* ===== ENVÍO DEL PEDIDO CON ALERTA VISUAL SUPERIOR ===== */
function enviarPedido() {
    const usuario = leerSesion("usuarioLogueado");

    if (!usuario) {
        mostrarAlertaFlotante("⚠️ <strong>Atención:</strong> Para enviar tu pedido, primero debes iniciar sesión arriba.", "error");
        $("usuario").focus();
        return;
    }
    if (carrito.length === 0) {
        mostrarAlertaFlotante("⚠️ <strong>Tu carrito está vacío:</strong> Agrega productos antes de enviar el pedido.", "error");
        return;
    }

    const correo = leerSesion("correoLogueado") || "contacto@cliente.cl";
    const fecha = new Date().toLocaleDateString("es-CL");
    const total = carrito.reduce((suma, i) => suma + i.precio * i.cantidad, 0);

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
        "\nTotal referencial: $" + clp(total) + " CLP";

    const urlWhatsApp = "https://wa.me/" + NUMERO_WHATSAPP + "?text=" + encodeURIComponent(mensaje);
    
    // Abrir WhatsApp
    window.open(urlWhatsApp, "_blank", "noopener");

    // Vaciar carrito
    carrito = [];
    guardarYActualizarCarrito();
    cargarTablaReservas();

    // Mostrar ALERTA VISUAL DE ÉXITO ARRIBA indicando claramente que funcionó y dando el enlace por si el navegador bloquea el diálogo
    mostrarAlertaFlotante(`
        ✅ <strong>¡Pedido registrado con éxito!</strong> Se intentó abrir WhatsApp.<br>
        <span style="font-size: 0.85rem; font-weight: normal;">Si tu navegador bloqueó la aplicación o no se abrió automáticamente, haz clic 
        <a href="${urlWhatsApp}" target="_blank" rel="noopener noreferrer" style="color: #155724; text-decoration: underline; font-weight: bold;">aquí para enviar tu pedido a WhatsApp</a>.</span>
    `, "ok");
}

/* ===== INICIO ===== */
$("form-login").addEventListener("submit", iniciarSesionCliente);
$("btn-cerrar").addEventListener("click", cerrarSesionCliente);
$("btn-enviar-pedido").addEventListener("click", enviarPedido);

mostrarCatalogo();
renderizarCarrito();
verificarSesion();