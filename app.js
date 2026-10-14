document.addEventListener("DOMContentLoaded", function () {
    var contenedorEquipo = document.getElementById("contenedor-equipo");

    if (!contenedorEquipo) return;

    var equipo = [
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
            imagen: "Imagenes/Marcela.png"
        },
        {
            nombre: "Orlani Aguilar",
            rol: "Administrador de Datos",
            descripcion: "Organización de datos y soporte del sistema.",
            imagen: "Imagenes/Orlani.png"
        },
        {
            nombre: "Juan Castro",
            rol: "Gestor de Ventas",
            descripcion: "Atención a clientes y catálogo de productos mayoristas.",
            imagen: "Imagenes/Juan Castro.png"
        },
        {
            nombre: "Carla Gutiérrez",
            rol: "Revisión y Pruebas",
            descripcion: "Pruebas de funcionamiento y corrección de errores en el sitio.",
            imagen: "Imagenes/Carla Gutiérrez.png"
        }
    ];

    var html = "";
    for (var i = 0; i < equipo.length; i++) {
        html += '<div class="tarjeta-equipo">';
        html += '<img src="' + equipo[i].imagen + '" alt="' + equipo[i].nombre + '" class="foto-integrante">';
        html += '<div class="info-integrante">';
        html += '<h3>' + equipo[i].nombre + '</h3>';
        html += '<span class="rol-integrante">' + equipo[i].rol + '</span>';
        html += '<p>' + equipo[i].descripcion + '</p>';
        html += '</div>';
        html += '</div>';
    }

    contenedorEquipo.innerHTML = html;
});