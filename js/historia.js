
/* ==========================================
   ESTRELLAS DEL SABER
   CONTROL DE LA HISTORIA
========================================== */


/* ==========================================
   1. ELEMENTOS
========================================== */

const escenas = document.querySelectorAll(".escena");
const puntos = document.querySelectorAll(".punto");

const btnSaltar = document.getElementById("btn-saltar");
const btnExplorar = document.getElementById("btn-explorar");

const historia = document.querySelector(".historia");


/* ==========================================
   2. CONFIGURACIÓN DE AUDIO
========================================== */

const rutasAudio = {
    musica: "../audio/música/aventura-espacial.mp3",

    efectos: {
        nave: "../audio/efecto/nave-volando.mp3",
        burbuja: "../audio/efecto/burbuja.mp3",
        viaje: "../audio/efecto/viaje-espacial.mp3",
        aterrizaje: "../audio/efecto/aterrizaje.mp3",
        polvo: "../audio/efecto/polvo.mp3"
    }
};

const volumenes = {
    musica: 0.4,
    narracion: 1,
    efectos: 0.8
};


/* ==========================================
   3. CONFIGURACIÓN DE ESCENAS
========================================== */

const configuracionEscenas = [
    {
        duracion: 10000,
        retrasoAudio: 2800,
        duracionAudio: 6000,
        audio: "../audio/narraciones/historia-1.mp3",

        frases: [
            "¡Hola, tripulante!",
            "¡Soy Starly!",
            "¡Qué alegría que estés aquí!",
            "¿Me acompañas en una aventura?"
        ],

        efectos: [
            { nombre: "nave", tiempo: 0 },
            { nombre: "burbuja", tiempo: 2500 }
        ]
    },
    {
        duracion: 10000,
        retrasoAudio: 1500,
        duracionAudio: 7000,
        audio: "../audio/narraciones/historia-2.mp3",

        frases: [
            "¡Mira, la Tierra!",
            "¡Es el planeta donde vivimos!",
            "Aquí vamos a descubrir algo muy importante:",
            "¡Nuestros derechos!"
        ],

        efectos: [
            { nombre: "viaje", tiempo: 0 },
            { nombre: "burbuja", tiempo: 1000 }
        ]
    },
    {
        duracion: 14000,
        retrasoAudio: 6200,
        duracionAudio: 7000,
        audio: "../audio/narraciones/historia-3.mp3",

        frases: [
            "¡Llegamos, tripulante!",
            "Todos tenemos derechos",
            "que nos cuidan y protegen.",
            "¡Vamos a conocerlos jugando!"
        ],

        efectos: [
            { nombre: "aterrizaje", tiempo: 0 },
            { nombre: "polvo", tiempo: 3000 },
            { nombre: "burbuja", tiempo: 6000 }
        ]
    }
];


/* ==========================================
   4. ESTADO DE LA HISTORIA
========================================== */

let escenaActual = 0;
let historiaFinalizada = false;

let temporizadores = [];
let audioActual = null;

const musicaFondo = new Audio(rutasAudio.musica);
musicaFondo.loop = true;
musicaFondo.volume = volumenes.musica;

const efectosActivos = new Set();


/* ==========================================
   5. TEMPORIZADORES
========================================== */

function programarAccion(funcion, retraso) {

    const temporizador = setTimeout(funcion, retraso);

    temporizadores.push(temporizador);
}

function limpiarTemporizadores() {

    temporizadores.forEach(clearTimeout);
    temporizadores = [];
}


/* ==========================================
   6. CONTROL DE AUDIO
========================================== */

function detenerNarracion() {

    if (!audioActual) {
        return;
    }

    audioActual.pause();
    audioActual.currentTime = 0;
    audioActual = null;
}

function detenerEfectos() {

    efectosActivos.forEach((efecto) => {
        efecto.pause();
        efecto.currentTime = 0;
    });

    efectosActivos.clear();
}

function reproducirEfecto(nombre) {

    const ruta = rutasAudio.efectos[nombre];

    if (!ruta) {
        return;
    }

    const efecto = new Audio(ruta);
    efecto.volume = volumenes.efectos;

    efectosActivos.add(efecto);

    efecto.addEventListener("ended", () => {
        efectosActivos.delete(efecto);
    }, { once: true });

    efecto.play().catch(() => {
        efectosActivos.delete(efecto);
    });
}

function iniciarMusica() {

    if (!musicaFondo.paused) {
        return;
    }

    musicaFondo.play().catch(() => {
        // El navegador puede bloquear la reproducción automática.
    });
}

function detenerMusica() {

    musicaFondo.pause();
    musicaFondo.currentTime = 0;
}


/* ==========================================
   7. PREPARAR DIÁLOGOS
========================================== */

function prepararDialogo(numero) {

    const burbuja = escenas[numero].querySelector(".burbuja-dialogo");

    if (!burbuja) {
        return;
    }

    const titulo = burbuja.querySelector("h1, h2");
    const parrafo = burbuja.querySelector("p");

    if (titulo) {
        titulo.style.opacity = "0";
    }

    if (parrafo) {
        parrafo.textContent = "";
        parrafo.style.opacity = "0";
    }
}


/* ==========================================
   8. MOSTRAR FRASES
========================================== */

function mostrarFrases(numero) {

    const burbuja = escenas[numero].querySelector(".burbuja-dialogo");

    if (!burbuja) {
        return;
    }

    const titulo = burbuja.querySelector("h1, h2");
    const parrafo = burbuja.querySelector("p");

    if (!parrafo) {
        return;
    }

    const configuracion = configuracionEscenas[numero];
    const frases = configuracion.frases;

    if (titulo) {
        titulo.style.opacity = "1";
    }

    parrafo.style.opacity = "1";

    const tiempoPorFrase = configuracion.duracionAudio / frases.length;

    frases.forEach((frase, indice) => {

        programarAccion(() => {

            if (escenaActual !== numero) {
                return;
            }

            parrafo.textContent = frase;

            parrafo.classList.remove("texto-apareciendo");

            void parrafo.offsetWidth;

            parrafo.classList.add("texto-apareciendo");

        }, indice * tiempoPorFrase);
    });
}


/* ==========================================
   9. REPRODUCIR NARRACIÓN
========================================== */

function reproducirNarracion(numero) {

    detenerNarracion();

    const configuracion = configuracionEscenas[numero];

    const narracion = new Audio(configuracion.audio);
    narracion.volume = volumenes.narracion;

    audioActual = narracion;

    narracion.play()
        .then(() => {
            if (escenaActual === numero && audioActual === narracion) {
                mostrarFrases(numero);
            }
        })
        .catch(() => {
            if (escenaActual === numero) {
                mostrarFrases(numero);
            }
        });
}


/* ==========================================
   10. EFECTOS DE CADA ESCENA
========================================== */

function programarEfectos(numero) {

    const efectos = configuracionEscenas[numero].efectos;

    efectos.forEach((efecto) => {

        programarAccion(() => {

            if (escenaActual === numero) {
                reproducirEfecto(efecto.nombre);
            }

        }, efecto.tiempo);
    });
}


/* ==========================================
   11. INDICADORES
========================================== */

function actualizarProgreso(numero) {

    puntos.forEach((punto, indice) => {
        punto.classList.toggle("punto-activo", indice === numero);
    });
}


/* ==========================================
   12. MOSTRAR ESCENA
========================================== */

function mostrarEscena(numero) {

    limpiarTemporizadores();
    detenerNarracion();
    detenerEfectos();

    escenaActual = numero;
    historiaFinalizada = false;

    historia.classList.remove("historia-saltada");

    escenas.forEach((escena, indice) => {

        const activa = indice === numero;

        escena.classList.toggle("escena-activa", activa);
        escena.setAttribute("aria-hidden", String(!activa));
    });

    actualizarProgreso(numero);
    prepararDialogo(numero);

    btnExplorar.disabled = true;

    iniciarMusica();
    programarEfectos(numero);

    const configuracion = configuracionEscenas[numero];

    programarAccion(() => {
        reproducirNarracion(numero);
    }, configuracion.retrasoAudio);

    if (numero < escenas.length - 1) {

        btnSaltar.style.display = "inline-flex";

        programarAccion(() => {
            mostrarEscena(numero + 1);
        }, configuracion.duracion);

    } else {

        btnSaltar.style.display = "none";

        const tiempoFinal =
            configuracion.retrasoAudio +
            configuracion.duracionAudio +
            500;

        programarAccion(() => {

            historiaFinalizada = true;
            btnExplorar.disabled = false;

        }, tiempoFinal);
    }
}


/* ==========================================
   13. SALTAR INTRODUCCIÓN
========================================== */

function saltarHistoria() {

    if (historiaFinalizada) {
        return;
    }

    limpiarTemporizadores();
    detenerNarracion();
    detenerEfectos();
    detenerMusica();

    const numero = escenas.length - 1;

    escenaActual = numero;
    historiaFinalizada = true;

    historia.classList.add("historia-saltada");

    escenas.forEach((escena, indice) => {

        const activa = indice === numero;

        escena.classList.toggle("escena-activa", activa);
        escena.setAttribute("aria-hidden", String(!activa));
    });

    actualizarProgreso(numero);

    btnSaltar.style.display = "none";
    btnExplorar.disabled = false;

    const burbuja = escenas[numero].querySelector(".burbuja-dialogo");

    if (burbuja) {

        const titulo = burbuja.querySelector("h1, h2");
        const parrafo = burbuja.querySelector("p");

        if (titulo) {
            titulo.style.opacity = "1";
        }

        if (parrafo) {
            parrafo.textContent =
                configuracionEscenas[numero].frases.join(" ");

            parrafo.style.opacity = "1";
        }
    }
}


/* ==========================================
   14. COMENZAR EXPLORACIÓN
========================================== */


/* Comenzar exploración */

function comenzarExploracion() {
    if (btnExplorar.disabled) {
        return;
    }

    btnExplorar.disabled = true;

    limpiarTemporizadores();
    detenerNarracion();
    detenerEfectos();
    detenerMusica();

    const polvo = document.getElementById("transicion-polvo");

    try {
        sessionStorage.setItem("estrellitas_transicion_mapa", "1");
    } catch (error) {
        // La navegación continúa aunque no se pueda guardar el estado.
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !polvo) {
        window.location.href = "mapa.html";
        return;
    }

    polvo.classList.add("activa");

    setTimeout(() => {
        window.location.href = "mapa.html";
    }, 850);
}



/* ==========================================
   15. EVENTOS
========================================== */

btnSaltar.addEventListener("click", saltarHistoria);
btnExplorar.addEventListener("click", comenzarExploracion);


/* ==========================================
   16. INICIAR HISTORIA
========================================== */

mostrarEscena(0);



