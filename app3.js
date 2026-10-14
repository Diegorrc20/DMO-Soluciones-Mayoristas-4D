document.addEventListener("DOMContentLoaded", function () {

    // 1. Cargar la tabla condicionalmente según el rol (Cliente vs Admin)
    function cargarTablaReservas() {
        var tablaBody = document.getElementById("cuerpo-tabla");
        if (!tablaBody) return;

        tablaBody.innerHTML = "";
        
        var reservas = JSON.parse(localStorage.getItem("historialReservas")) || [];

        if (reservas.length === 0) {
            tablaBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No hay cotizaciones o compras registradas.</td></tr>`;
            return;
        }

        var usuarioGuardado = localStorage.getItem("usuarioLogueado");
        var esAdmin = (usuarioGuardado === "admin");
        var correoSesion = localStorage.getItem("correoLogueado") || localStorage.getItem("usuarioCorreo") || "Sin correo registrado";

        reservas.forEach(function (reserva, index) {
            var correoMostrar = reserva.email || reserva.correo || correoSesion;
            
            var contenidoAccion = esAdmin 
                ? `<button class="btn-eliminar-fila" data-index="${index}">🗑️ Eliminar</button>`
                : `<span style="color: #16a34a; font-weight: bold;">Registrado</span>`;

            var nuevaFila = document.createElement("tr");
            nuevaFila.innerHTML = `
                <td>${reserva.usuario || "Cliente Mayorista"}</td>
                <td>${correoMostrar}</td>
                <td>${reserva.obra || reserva.pack || "Pack de Insumos"}</td>
                <td>$${Number(reserva.monto || 0).toLocaleString("es-CL")} CLP</td>
                <td>${reserva.fecha || "Reciente"}</td>
                <td style="text-align: center;">${contenidoAccion}</td>
            `;
            tablaBody.appendChild(nuevaFila);
        });

        if (esAdmin) {
            var botonesEliminar = tablaBody.querySelectorAll(".btn-eliminar-fila");
            botonesEliminar.forEach(function (btn) {
                btn.addEventListener("click", function () {
                    var posIndex = parseInt(this.getAttribute("data-index"), 10);
                    eliminarReserva(posIndex);
                });
            });
        }
    }

    function eliminarReserva(index) {
        var reservas = JSON.parse(localStorage.getItem("historialReservas")) || [];
        if (confirm("¿Estás seguro de que deseas eliminar este registro de compra?")) {
            reservas.splice(index, 1);
            localStorage.setItem("historialReservas", JSON.stringify(reservas));
            cargarTablaReservas();
        }
    }

    // 2. Control de Sesión
    var formLogin = document.getElementById("form-login");
    var inputUsuario = document.getElementById("usuario");
    var inputCorreo = document.getElementById("correo");
    var inputClave = document.getElementById("clave");

    var errorUsuario = document.getElementById("error-usuario");
    var errorCorreo = document.getElementById("error-correo");
    var errorClave = document.getElementById("error-clave");

    var seccionLogin = document.getElementById("seccion-login");
    var panelAdmin = document.getElementById("panel-admin");
    var btnCerrar = document.getElementById("btn-cerrar");
    var btnCerrarAdmin = document.getElementById("btn-cerrar-admin");

    var btnAbrirModalAdmin = document.getElementById("btn-abrir-modal-admin");
    var modalAdmin = document.getElementById("modal-admin");
    var cerrarModalAdmin = document.getElementById("cerrar-modal-admin");
    var formLoginAdmin = document.getElementById("form-login-admin");
    var inputAdminNombre = document.getElementById("admin-nombre");
    var inputAdminClave = document.getElementById("admin-clave");
    var errorAdminNombre = document.getElementById("error-admin-nombre");
    var errorAdminClave = document.getElementById("error-admin-clave");

    function verificarSesion() {
        var usuarioGuardado = localStorage.getItem("usuarioLogueado");

        if (usuarioGuardado && seccionLogin && panelAdmin) {
            seccionLogin.style.display = "none";
            panelAdmin.style.display = "block";

            if (usuarioGuardado === "admin") {
                if (btnAbrirModalAdmin) btnAbrirModalAdmin.style.display = "none";
                if (btnCerrar) btnCerrar.style.display = "none";
                if (btnCerrarAdmin) btnCerrarAdmin.style.display = "inline-block";
            } else {
                if (btnAbrirModalAdmin) btnAbrirModalAdmin.style.display = "inline-block";
                if (btnCerrar) btnCerrar.style.display = "inline-block";
                if (btnCerrarAdmin) btnCerrarAdmin.style.display = "none";
            }

            cargarTablaReservas();
        } else if (seccionLogin && panelAdmin) {
            seccionLogin.style.display = "block";
            panelAdmin.style.display = "none";
        }
    }

    // Modal Admin
    if (btnAbrirModalAdmin) {
        btnAbrirModalAdmin.addEventListener("click", function () {
            modalAdmin.style.display = "flex";
        });
    }

    if (cerrarModalAdmin) {
        cerrarModalAdmin.addEventListener("click", function () {
            modalAdmin.style.display = "none";
        });
    }

    window.addEventListener("click", function (e) {
        if (e.target === modalAdmin) {
            modalAdmin.style.display = "none";
        }
    });

    // Login Admin
    if (formLoginAdmin) {
        formLoginAdmin.addEventListener("submit", function (e) {
            e.preventDefault();

            if (errorAdminNombre) { errorAdminNombre.textContent = ""; errorAdminNombre.style.display = "none"; }
            if (errorAdminClave) { errorAdminClave.textContent = ""; errorAdminClave.style.display = "none"; }

            var nombreVal = inputAdminNombre ? inputAdminNombre.value.trim() : "";
            var claveVal = inputAdminClave ? inputAdminClave.value.trim() : "";
            var hayError = false;

            if (nombreVal === "") {
                if (errorAdminNombre) {
                    errorAdminNombre.textContent = "Ingresa el nombre de usuario.";
                    errorAdminNombre.style.display = "block";
                }
                hayError = true;
            }

            if (claveVal === "") {
                if (errorAdminClave) {
                    errorAdminClave.textContent = "Ingresa la contraseña.";
                    errorAdminClave.style.display = "block";
                }
                hayError = true;
            }

            if (hayError) return;

            if (nombreVal !== "admin" || claveVal !== "1234") {
                if (errorAdminClave) {
                    errorAdminClave.textContent = "Usuario o contraseña incorrectos.";
                    errorAdminClave.style.display = "block";
                }
                return;
            }

            var clientePrevio = localStorage.getItem("usuarioLogueado");
            var correoPrevio = localStorage.getItem("correoLogueado");
            
            if (clientePrevio && clientePrevio !== "admin") {
                localStorage.setItem("clientePrevioUsuario", clientePrevio);
                if (correoPrevio) localStorage.setItem("clientePrevioCorreo", correoPrevio);
            }

            localStorage.setItem("usuarioLogueado", "admin");
            localStorage.setItem("correoLogueado", "admin@dmo.cl");

            modalAdmin.style.display = "none";
            formLoginAdmin.reset();
            verificarSesion();
        });
    }

    // Login Cliente
    if (formLogin) {
        formLogin.addEventListener("submit", function (e) {
            e.preventDefault();

            if (errorUsuario) { errorUsuario.textContent = ""; errorUsuario.style.display = "none"; }
            if (errorCorreo) { errorCorreo.textContent = ""; errorCorreo.style.display = "none"; }
            if (errorClave) { errorClave.textContent = ""; errorClave.style.display = "none"; }

            var usuarioVal = inputUsuario ? inputUsuario.value.trim() : "";
            var correoVal = inputCorreo ? inputCorreo.value.trim() : "";
            var claveVal = inputClave ? inputClave.value.trim() : "";
            var hayError = false;

            if (usuarioVal === "") {
                if (errorUsuario) {
                    errorUsuario.textContent = "Por favor ingresa tu usuario o empresa.";
                    errorUsuario.style.display = "block";
                }
                hayError = true;
            }

            if (correoVal === "") {
                if (errorCorreo) {
                    errorCorreo.textContent = "Por favor ingresa tu correo electrónico.";
                    errorCorreo.style.display = "block";
                }
                hayError = true;
            }

            if (claveVal === "") {
                if (errorClave) {
                    errorClave.textContent = "Por favor ingresa tu contraseña.";
                    errorClave.style.display = "block";
                }
                hayError = true;
            }

            if (hayError) return;

            localStorage.setItem("usuarioLogueado", usuarioVal);
            localStorage.setItem("correoLogueado", correoVal);

            localStorage.removeItem("clientePrevioUsuario");
            localStorage.removeItem("clientePrevioCorreo");

            verificarSesion();
            formLogin.reset();
        });
    }

    // Cierre de Sesiones
    if (btnCerrar) {
        btnCerrar.addEventListener("click", function () {
            localStorage.removeItem("usuarioLogueado");
            localStorage.removeItem("correoLogueado");
            localStorage.removeItem("clientePrevioUsuario");
            localStorage.removeItem("clientePrevioCorreo");
            verificarSesion();
        });
    }

    if (btnCerrarAdmin) {
        btnCerrarAdmin.addEventListener("click", function () {
            var clientePrevio = localStorage.getItem("clientePrevioUsuario");
            var correoPrevio = localStorage.getItem("clientePrevioCorreo");

            if (clientePrevio) {
                localStorage.setItem("usuarioLogueado", clientePrevio);
                if (correoPrevio) {
                    localStorage.setItem("correoLogueado", correoPrevio);
                }
                localStorage.removeItem("clientePrevioUsuario");
                localStorage.removeItem("clientePrevioCorreo");
            } else {
                localStorage.removeItem("usuarioLogueado");
                localStorage.removeItem("correoLogueado");
            }

            verificarSesion();
        });
    }

    verificarSesion();
});