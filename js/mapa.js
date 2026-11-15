
/* ==========================================
   ESTRELLITAS DEL SABER
   MAPA DE MISIONES
========================================== */


/* ==========================================
   1. ELEMENTOS
========================================== */

const botonesMisiones = document.querySelectorAll(".mision");

const totalEstrellas = document.getElementById("total-estrellas");
const mensajeStarly = document.getElementById("mensaje-starly");
const tituloStarly = document.getElementById("titulo-starly");

const btnEscuchar = document.getElementById("btn-escuchar");

const modalMision = document.getElementById("modal-mision");
const modalCerrar = document.getElementById("modal-cerrar");

const modalIcono = document.getElementById("modal-icono");
const modalTitulo = document.getElementById("modal-titulo");
const modalDescripcion = document.getElementById("modal-descripcion");

const btnComenzar = document.getElementById("btn-comenzar");

const btnConfiguracion = document.getElementById("btn-configuracion");
const modalConfiguracion = document.getElementById("modal-configuracion");
const configuracionCerrar = document.getElementById("configuracion-cerrar");
const configuracionListo = document.getElementById("configuracion-listo");

const configMusica = document.getElementById("config-musica");
const configEfectos = document.getElementById("config-efectos");
const configVoz = document.getElementById("config-voz");


/* ==========================================
   2. DATOS DE LAS MISIONES
========================================== */

const misiones = [
    {
        id: 1,
        nombre: "¡A aprender!",
        titulo: "¡Tengo derecho a aprender!",
        descripcion: "¡Vamos a descubrir nuestro derecho a aprender!",
        icono: "📖",
        ruta: "juegos/mision-1.html",
        audio: null
    },
    {
        id: 2,
        nombre: "¡Para todos!",
        titulo: "¡La escuela es para todos!",
        descripcion: "¡Todos los niños y niñas podemos aprender!",
        icono: "🏫",
        ruta: "juegos/mision-2.html",
        audio: null
    },
    {
        id: 3,
        nombre: "¡A jugar!",
        titulo: "¡Aprendemos jugando!",
        descripcion: "¡Aprender también puede ser divertido!",
        icono: "🎨",
        ruta: "juegos/mision-3.html",
        audio: null
    },
    {
        id: 4,
        nombre: "¡Mi escuela!",
        titulo: "¡Cuidemos nuestra escuela!",
        descripcion: "¡Vamos a cuidar el lugar donde aprendemos!",
        icono: "🌟",
        ruta: "juegos/mision-4.html",
        audio: null
    }
];


/* ==========================================
   3. CONFIGURACIÓN Y AUDIO
========================================== */

const CLAVE_CONFIGURACION = "estrellitas_del_saber_configuracion";

const configuracionInicial = {
    musica: true,
    efectos: true,
    voz: true
};

function cargarConfiguracion() {

    try {
        const guardada = JSON.parse(
            localStorage.getItem(CLAVE_CONFIGURACION)
        );

        return {
            ...configuracionInicial,
            ...(guardada || {})
        };

    } catch (error) {
        return { ...configuracionInicial };
    }
}

let configuracion = cargarConfiguracion();

const audioMapa = {
    bienvenida: null,
    musica: null,
    efectoSeleccion: null
};

let narracionActual = null;

function detenerNarracion() {

    if (narracionActual) {
        narracionActual.pause();
        narracionActual.currentTime = 0;
        narracionActual = null;
    }
}

function reproducirNarracion(ruta) {

    detenerNarracion();

    if (!configuracion.voz || !ruta) {
        return;
    }

    narracionActual = new Audio(ruta);
    narracionActual.volume = 1;

    narracionActual.play().catch(() => {
        // El mapa funciona aunque el navegador bloquee el audio.
    });
}

function reproducirEfecto(ruta) {

    if (!configuracion.efectos || !ruta) {
        return;
    }

    const efecto = new Audio(ruta);
    efecto.volume = 0.4;

    efecto.play().catch(() => {});
}


/* ==========================================
   4. GUARDAR CONFIGURACIÓN
========================================== */

function guardarConfiguracion() {

    configuracion = {
        musica: configMusica.checked,
        efectos: configEfectos.checked,
        voz: configVoz.checked
    };

    try {
        localStorage.setItem(
            CLAVE_CONFIGURACION,
            JSON.stringify(configuracion)
        );
    } catch (error) {
        // La configuración sigue funcionando durante esta sesión.
    }

    if (!configuracion.voz) {
        detenerNarracion();
    }
}

function actualizarControlesConfiguracion() {

    configMusica.checked = configuracion.musica;
    configEfectos.checked = configuracion.efectos;
    configVoz.checked = configuracion.voz;

    btnEscuchar.disabled =
        !configuracion.voz || !audioMapa.bienvenida;
}


/* ==========================================
   5. PROGRESO
========================================== */

const CLAVE_PROGRESO = "estrellitas_del_saber_progreso";

function obtenerProgreso() {

    try {
        const guardado = localStorage.getItem(CLAVE_PROGRESO);

        if (guardado) {
            const progresoGuardado = JSON.parse(guardado);

            if (
                progresoGuardado &&
                Array.isArray(progresoGuardado.completadas)
            ) {
                return {
                    completadas: progresoGuardado.completadas,
                    estrellas: progresoGuardado.estrellas || {}
                };
            }
        }

    } catch (error) {
        // Si no hay datos válidos, iniciamos desde cero.
    }

    return {
        completadas: [],
        estrellas: {}
    };
}

let progreso = obtenerProgreso();

function estaCompletada(id) {
    return progreso.completadas.includes(id);
}

function estaDesbloqueada(id) {

    if (id === 1) {
        return true;
    }

    return estaCompletada(id - 1);
}

function calcularEstrellas() {

    return Object.values(progreso.estrellas).reduce(
        (total, cantidad) => total + Number(cantidad || 0),
        0
    );
}


/* ==========================================
   6. ACTUALIZAR MAPA
========================================== */

function actualizarMapa() {

    totalEstrellas.textContent = calcularEstrellas();

    botonesMisiones.forEach((boton) => {

        const id = Number(boton.dataset.mision);
        const completada = estaCompletada(id);
        const desbloqueada = estaDesbloqueada(id);

        boton.disabled = !desbloqueada;

        boton.classList.toggle(
            "mision-completada",
            completada
        );

        boton.classList.toggle(
            "mision-disponible",
            desbloqueada && !completada
        );

        boton.classList.toggle(
            "mision-bloqueada",
            !desbloqueada
        );

        const candado = boton.querySelector(".mision-candado");

        if (candado) {
            candado.hidden = desbloqueada;
        }

        const estrellas = boton.querySelector(".mision-estrellas");

        if (estrellas) {
            const cantidad = Number(progreso.estrellas[id] || 0);

            estrellas.textContent =
                "★ ".repeat(cantidad) +
                "☆ ".repeat(Math.max(0, 3 - cantidad));
        }

        const mision = misiones.find((item) => item.id === id);

        if (mision) {
            boton.setAttribute(
                "aria-label",
                `${mision.titulo}. ${
                    completada
                        ? "Misión completada"
                        : desbloqueada
                            ? "Misión disponible"
                            : "Misión bloqueada"
                }`
            );
        }
    });
}


/* ==========================================
   7. MENSAJES DE STARLY
========================================== */

function actualizarMensajeStarly(titulo, mensaje) {

    tituloStarly.textContent = titulo;
    mensajeStarly.textContent = mensaje;
}

function escucharStarly() {

    if (!configuracion.voz) {
        return;
    }

    reproducirNarracion(audioMapa.bienvenida);
}


/* ==========================================
   8. ABRIR Y CERRAR MODALES
========================================== */

let modalActivo = null;
let elementoAnterior = null;

function abrirModal(modal) {

    elementoAnterior = document.activeElement;
    modalActivo = modal;

    modal.hidden = false;
    document.body.style.overflow = "hidden";

    const cerrar = modal.querySelector(".modal-cerrar");

    if (cerrar) {
        cerrar.focus();
    }
}

function cerrarModal() {

    if (!modalActivo) {
        return;
    }

    modalActivo.hidden = true;
    modalActivo = null;

    document.body.style.overflow = "";

    if (elementoAnterior) {
        elementoAnterior.focus();
    }
}


/* ==========================================
   9. SELECCIONAR MISIÓN
========================================== */

let misionSeleccionada = null;


function abrirMision(id) {

    if (!estaDesbloqueada(id)) {
        return;
    }

    const mision = misiones.find((item) => item.id === id);

    if (!mision) {
        return;
    }

    reproducirEfecto(audioMapa.efectoSeleccion);

    // Entrar directamente al juego seleccionado.
    window.location.href = mision.ruta;
}



/* ==========================================
   10. COMENZAR MISIÓN
========================================== */

function comenzarMision() {

    if (!misionSeleccionada) {
        return;
    }

    // Los minijuegos todavía no están creados.
    modalDescripcion.textContent =
        "¡Pronto jugaremos esta misión!";

    btnComenzar.textContent = "¡Próximamente!";
    btnComenzar.disabled = true;
}


/* ==========================================
   11. CONFIGURACIÓN
========================================== */

function abrirConfiguracion() {

    actualizarControlesConfiguracion();
    abrirModal(modalConfiguracion);
}

function cerrarConfiguracion() {

    guardarConfiguracion();
    actualizarControlesConfiguracion();
    cerrarModal();
}


/* ==========================================
   12. EVENTOS
========================================== */

botonesMisiones.forEach((boton) => {

    boton.addEventListener("click", () => {
        abrirMision(Number(boton.dataset.mision));
    });
});

modalCerrar.addEventListener("click", cerrarModal);

btnComenzar.addEventListener("click", comenzarMision);

btnConfiguracion.addEventListener("click", abrirConfiguracion);

configuracionCerrar.addEventListener("click", cerrarConfiguracion);
configuracionListo.addEventListener("click", cerrarConfiguracion);

configMusica.addEventListener("change", guardarConfiguracion);
configEfectos.addEventListener("change", guardarConfiguracion);
configVoz.addEventListener("change", () => {
    guardarConfiguracion();
    actualizarControlesConfiguracion();
});

btnEscuchar.addEventListener("click", escucharStarly);

[modalMision, modalConfiguracion].forEach((modal) => {

    modal.addEventListener("click", (evento) => {

        if (evento.target === modal) {
            cerrarModal();
        }
    });
});

document.addEventListener("keydown", (evento) => {

    if (evento.key === "Escape" && modalActivo) {
        cerrarModal();
    }
});


/* ==========================================
   13. INICIAR MAPA
========================================== */

actualizarMapa();
actualizarControlesConfiguracion();
