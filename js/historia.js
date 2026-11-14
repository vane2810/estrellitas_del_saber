
/* ==========================================
   ESTRELLAS DEL SABER
   CONTROL DE LA HISTORIA
========================================== */


/* ==========================================
   1. ELEMENTOS
========================================== */

const escenas = document.querySelectorAll(".escena");
const puntos = document.querySelectorAll(".punto");

const btnRepetir = document.getElementById("btn-repetir");
const btnSaltar = document.getElementById("btn-saltar");
const btnExplorar = document.getElementById("btn-explorar");

const historia = document.querySelector(".historia");


/* ==========================================
   2. CONFIGURACIÓN
========================================== */

const configuracionEscenas = [
    {
        duracion: 7000,
        retrasoAudio: 2800,
        audio: "../audio/narraciones/historia-1.mp3"
    },
    {
        duracion: 8000,
        retrasoAudio: 1200,
        audio: "../audio/narraciones/historia-2.mp3"
    },
    {
        duracion: 9000,
        retrasoAudio: 6000,
        audio: "../audio/narraciones/historia-3.mp3"
    }
];

let escenaActual = 0;

let temporizadorEscena = null;
let temporizadorAudio = null;
let temporizadorFinal = null;

let audioActual = null;
let historiaFinalizada = false;


/* ==========================================
   3. DETENER AUDIO
========================================== */

function detenerAudio() {

    if (audioActual) {
        audioActual.pause();
        audioActual.currentTime = 0;
        audioActual = null;
    }
}


/* ==========================================
   4. REPRODUCIR NARRACIÓN
========================================== */

function reproducirNarracion() {

    detenerAudio();

    const ruta = configuracionEscenas[escenaActual].audio;

    audioActual = new Audio(ruta);
    audioActual.volume = 1;

    audioActual.play().catch(() => {
        // La historia continúa si el audio no está disponible.
    });
}


/* ==========================================
   5. PROGRAMAR NARRACIÓN
========================================== */

function programarNarracion() {

    clearTimeout(temporizadorAudio);

    const retraso = configuracionEscenas[escenaActual].retrasoAudio;

    temporizadorAudio = setTimeout(() => {
        reproducirNarracion();
    }, retraso);
}


/* ==========================================
   6. ACTUALIZAR INDICADORES
========================================== */

function actualizarProgreso(numero) {

    puntos.forEach((punto, indice) => {
        punto.classList.toggle(
            "punto-activo",
            indice === numero
        );
    });
}


/* ==========================================
   7. MOSTRAR ESCENA
========================================== */

function mostrarEscena(numero) {

    clearTimeout(temporizadorEscena);
    clearTimeout(temporizadorAudio);
    clearTimeout(temporizadorFinal);

    detenerAudio();

    escenaActual = numero;
    historiaFinalizada = false;

    historia.classList.remove("historia-saltada");

    escenas.forEach((escena, indice) => {

        const activa = indice === numero;

        escena.classList.toggle("escena-activa", activa);
        escena.setAttribute("aria-hidden", String(!activa));

    });

    actualizarProgreso(numero);

    btnExplorar.disabled = true;

    if (numero < escenas.length - 1) {

        btnSaltar.style.display = "inline-flex";

        programarNarracion();

        temporizadorEscena = setTimeout(() => {
            mostrarEscena(numero + 1);
        }, configuracionEscenas[numero].duracion);

    } else {

        btnSaltar.style.display = "none";

        programarNarracion();

        temporizadorFinal = setTimeout(() => {
            historiaFinalizada = true;
            btnExplorar.disabled = false;
        }, 6800);
    }
}


/* ==========================================
   8. SALTAR INTRODUCCIÓN
========================================== */

function saltarHistoria() {

    if (historiaFinalizada) {
        return;
    }

    mostrarEscena(escenas.length - 1);

    clearTimeout(temporizadorAudio);
    clearTimeout(temporizadorFinal);

    detenerAudio();

    historia.classList.add("historia-saltada");

    historiaFinalizada = true;
    btnExplorar.disabled = false;
}


/* ==========================================
   9. COMENZAR EXPLORACIÓN
========================================== */

function comenzarExploracion() {

    clearTimeout(temporizadorEscena);
    clearTimeout(temporizadorAudio);
    clearTimeout(temporizadorFinal);

    detenerAudio();

    // Ruta temporal hasta crear el mapa de niveles.
    window.location.href = "../index.html";
}


/* ==========================================
   10. EVENTOS
========================================== */

btnRepetir.addEventListener("click", () => {

    if (historia.classList.contains("historia-saltada")) {
        reproducirNarracion();
        return;
    }

    clearTimeout(temporizadorAudio);
    reproducirNarracion();
});

btnSaltar.addEventListener("click", saltarHistoria);

btnExplorar.addEventListener("click", comenzarExploracion);


/* ==========================================
   11. INICIAR HISTORIA
========================================== */

mostrarEscena(0);
