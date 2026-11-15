
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

const modalMision = document.getElementById("modal-mision");
const modalCerrar = document.getElementById("modal-cerrar");

const modalIcono = document.getElementById("modal-icono");
const modalTitulo = document.getElementById("modal-titulo");
const modalDescripcion = document.getElementById("modal-descripcion");

const btnComenzar = document.getElementById("btn-comenzar");


/* ==========================================
   2. DATOS DE LAS MISIONES
========================================== */

const misiones = [
    {
        id: 1,
        titulo: "¡Tengo derecho a aprender!",
        descripcion: "Descubriremos que aprender es un derecho de todos los niños y niñas.",
        icono: "📖",
        ruta: "juegos/mision-1.html"
    },
    {
        id: 2,
        titulo: "¡La escuela es para todos!",
        descripcion: "Aprenderemos que todos podemos estudiar y recibir educación.",
        icono: "🏫",
        ruta: "juegos/mision-2.html"
    },
    {
        id: 3,
        titulo: "¡Aprendemos jugando!",
        descripcion: "Resolveremos pequeños retos para aprender mientras nos divertimos.",
        icono: "🎨",
        ruta: "juegos/mision-3.html"
    },
    {
        id: 4,
        titulo: "¡Cuidemos nuestra escuela!",
        descripcion: "Descubriremos cómo cuidar los espacios donde aprendemos.",
        icono: "🌟",
        ruta: "juegos/mision-4.html"
    }
];


/* ==========================================
   3. PROGRESO GUARDADO
========================================== */

const CLAVE_PROGRESO = "estrellitas_del_saber_progreso";

function obtenerProgreso() {

    try {
        const guardado = localStorage.getItem(CLAVE_PROGRESO);

        if (guardado) {
            const progreso = JSON.parse(guardado);

            if (
                progreso &&
                Array.isArray(progreso.completadas)
            ) {
                return progreso;
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


/* ==========================================
   4. ESTADO DE LAS MISIONES
========================================== */

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

    return Object.values(progreso.estrellas || {}).reduce(
        (total, cantidad) => total + Number(cantidad || 0),
        0
    );
}


/* ==========================================
   5. ACTUALIZAR MAPA
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
            const cantidad = Number(progreso.estrellas?.[id] || 0);

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
   6. ABRIR MISIÓN
========================================== */

let misionSeleccionada = null;
let botonAnterior = null;

function abrirMision(id) {

    if (!estaDesbloqueada(id)) {
        return;
    }

    const mision = misiones.find((item) => item.id === id);

    if (!mision) {
        return;
    }

    misionSeleccionada = mision;

    modalIcono.textContent = mision.icono;
    modalTitulo.textContent = mision.titulo;
    modalDescripcion.textContent = mision.descripcion;

    botonAnterior = document.activeElement;

    modalMision.hidden = false;
    modalCerrar.focus();

    mensajeStarly.textContent =
        `¡Excelente elección, tripulante! ${mision.descripcion}`;
}


/* ==========================================
   7. CERRAR MISIÓN
========================================== */

function cerrarMision() {

    modalMision.hidden = true;
    misionSeleccionada = null;

    if (botonAnterior) {
        botonAnterior.focus();
    }
}


/* ==========================================
   8. COMENZAR MISIÓN
========================================== */

function comenzarMision() {

    if (!misionSeleccionada) {
        return;
    }

    // Los minijuegos se crearán después.
    // Por ahora evitamos navegar a una página inexistente.

    modalDescripcion.textContent =
        "¡Esta misión estará lista muy pronto!";

    btnComenzar.textContent = "¡Próximamente!";
    btnComenzar.disabled = true;
}


/* ==========================================
   9. EVENTOS
========================================== */

botonesMisiones.forEach((boton) => {

    boton.addEventListener("click", () => {

        const id = Number(boton.dataset.mision);

        abrirMision(id);
    });
});

modalCerrar.addEventListener("click", cerrarMision);

modalMision.addEventListener("click", (evento) => {

    if (evento.target === modalMision) {
        cerrarMision();
    }
});

document.addEventListener("keydown", (evento) => {

    if (evento.key === "Escape" && !modalMision.hidden) {
        cerrarMision();
    }
});


/* ==========================================
   10. INICIAR MAPA
========================================== */

actualizarMapa();
