document.addEventListener("DOMContentLoaded", function () {
    var packs = [
        { 
            titulo: 'Pack Abarrotes Básico', 
            precio: 150000, 
            descripcion: 'Insumos esenciales para almacenes pequeños (Arroz, Fideos, Aceite, Azúcar).',
            imagen: 'Imagenes/47b3852a-9059-4808-a445-7b7e8baf6868.png' 
        },
        { 
            titulo: 'Pack Comercial Pyme', 
            precio: 350000, 
            descripcion: 'Variedad de abarrotes, enlatados y productos de limpieza por mayor.',
            imagen: 'Imagenes/47b3852a-9059-4808-a445-7b7e8baf6868.png' 
        },
        { 
            titulo: 'Pack Mayorista Completo', 
            precio: 600000, 
            descripcion: 'Surtido amplio con despacho prioritario para minimarkets y locales.',
            imagen: 'Imagenes/47b3852a-9059-4808-a445-7b7e8baf6868.png' 
        }
    ];

    var contenedorObras = document.getElementById("contenedor-obras");
    var inputNombre = document.getElementById("nombre-pintura");
    var inputMonto = document.getElementById("monto-oferta");
    var formOferta = document.getElementById("form-oferta");
    var tablaPujasBody = document.getElementById("tabla-pujas-body");

    // Dibuja las tarjetas con imagen en la pantalla
    function mostrarCatalogo() {
        if (!contenedorObras) return;
        contenedorObras.innerHTML = "";

        packs.forEach(function (pack) {
            var tarjeta = document.createElement("article");
            tarjeta.className = "tarjeta-galeria";
            tarjeta.style.cursor = "pointer";

            tarjeta.innerHTML = `
                <div class="galeria-img-container">
                    <img src="${pack.imagen}" alt="${pack.titulo}">
                </div>
                <div class="galeria-info">
                    <p class="galeria-titulo">${pack.titulo}</p>
                    <p class="galeria-descripcion">${pack.descripcion}</p>
                    <p class="galeria-precio">$${pack.precio.toLocaleString("es-CL")} CLP</p>
                    <button type="button" class="btn-seleccionar">Seleccionar Pack</button>
                </div>
            `;

            tarjeta.addEventListener("click", function () {
                seleccionarPack(pack.titulo, pack.precio);
            });

            contenedorObras.appendChild(tarjeta);
        });
    }

    // Carga los datos del pack en el formulario
    function seleccionarPack(nombre, precio) {
        if (inputNombre) inputNombre.value = nombre;
        if (inputMonto) inputMonto.value = precio;
    }

    // Muestra las solicitudes guardadas
    function cargarHistorial() {
        if (!tablaPujasBody) return;

        var historial = JSON.parse(localStorage.getItem("historialReservas")) || [];

        if (historial.length === 0) {
            tablaPujasBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">No hay solicitudes registradas aún.</td></tr>`;
            return;
        }

        tablaPujasBody.innerHTML = "";
        historial.forEach(function (item) {
            var fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${item.obra || item.pack}</td>
                <td>$${Number(item.monto).toLocaleString("es-CL")} CLP</td>
                <td>${item.fecha || "Reciente"}</td>
            `;
            tablaPujasBody.appendChild(fila);
        });
    }

    // Guarda el pedido en localStorage
    if (formOferta) {
        formOferta.addEventListener("submit", function (e) {
            e.preventDefault();

            var packVal = inputNombre ? inputNombre.value.trim() : "";
            var montoVal = Number(inputMonto ? inputMonto.value : 0);
            var usuario = localStorage.getItem("usuarioLogueado") || "Cliente Mayorista";
            var correo = localStorage.getItem("correoLogueado") || "contacto@cliente.cl";

            if (packVal === "" || montoVal <= 0) {
                alert("Por favor selecciona un pack válido.");
                return;
            }

            var historial = JSON.parse(localStorage.getItem("historialReservas")) || [];
            
            historial.unshift({
                usuario: usuario,
                email: correo,
                obra: packVal,
                monto: montoVal,
                fecha: new Date().toLocaleDateString("es-CL")
            });

            localStorage.setItem("historialReservas", JSON.stringify(historial));

            alert("¡Cotización enviada con éxito!");
            formOferta.reset();
            cargarHistorial();
        });
    }

    mostrarCatalogo();
    cargarHistorial();
});