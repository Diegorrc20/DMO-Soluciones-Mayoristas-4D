"use strict";

/* Equipo de trabajo. Para agregar a alguien, copia un bloque { ... } y cambia los datos. */
const EQUIPO = [
    {
        nombre: "Diego Rodríguez",
        rol: "Desarrollador Web",
        descripcion: "Encargado de programar la página web y subir los contenidos.",
        imagen: "Imagenes/Diego.png"
    },
    {
        nombre: "Marcela Santiago",
        rol: "Diseñadora de Interfaz",
        descripcion: "Diseño de la estructura visual y selección de colores.",
        imagen: "Imagenes/Marcela Santiago.png"
    },
    {
        nombre: "Vicente Sánchez",
        rol: "Administrador de Datos",
        descripcion: "Organización de datos y soporte del sistema.",
        imagen: "Imagenes/Vicente Sánchez.png"
    },
    {
        nombre: "Juan Castro",
        rol: "Gestor de Ventas",
        descripcion: "Atención a clientes y catálogo de productos mayoristas.",
        imagen: "Imagenes/Juan Castro.png"
    },
    {
        nombre: "Orlani Aguilar",
        rol: "Revisión y Pruebas",
        descripcion: "Pruebas de funcionamiento y corrección de errores en el sitio.",
        imagen: "Imagenes/Orlani Aguilar.png"
    }
];

function crearTarjeta(persona) {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta-equipo";

    const foto = document.createElement("img");
    foto.className = "foto-integrante";
    foto.src = persona.imagen;
    foto.alt = "Foto de " + persona.nombre;
    foto.width = 100;
    foto.height = 100;
    foto.loading = "lazy";

    const info = document.createElement("div");
    info.className = "info-integrante";

    const nombre = document.createElement("h3");
    nombre.textContent = persona.nombre;

    const rol = document.createElement("span");
    rol.className = "rol-integrante";
    rol.textContent = persona.rol;

    const descripcion = document.createElement("p");
    descripcion.textContent = persona.descripcion;

    info.append(nombre, rol, descripcion);
    tarjeta.append(foto, info);
    return tarjeta;
}

const contenedorEquipo = document.getElementById("contenedor-equipo");
if (contenedorEquipo) {
    EQUIPO.forEach((persona) => contenedorEquipo.append(crearTarjeta(persona)));
}