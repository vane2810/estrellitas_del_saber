
/* ==========================================
   ESTRELLITAS DEL SABER
   MISIÓN 1 - LA MOCHILA
========================================== */

/* 1. Elementos */

const objetos = document.querySelectorAll(".objeto");
const contador = document.getElementById("contador-utiles");
const mochila = document.getElementById("mochila");
const mochilaContenido = document.getElementById("mochila-contenido");

const estrellasProgreso = document.querySelectorAll(
    ".estrella-progreso"
);

const mensajeTitulo = document.getElementById("mensaje-titulo");
const mensajeTexto = document.getElementById("mensaje-texto");

const recompensa = document.getElementById("recompensa");

/* 2. Configuración */

const TOTAL_UTILES = 3;

let utilesGuardados = 0;
let juegoTerminado = false;
let temporizadorMensaje = null;

const mensajes = {
    correcto: [
        "¡Muy bien!",
        "¡Excelente!",
        "¡Lo estás logrando!"
    ],

    incorrecto: [
        "¡Ese es para jugar! Busca otro.",
        "¡Intenta con otro objeto!",
        "¡Vamos a buscar un útil escolar!"
    ]
};

/* 3. Sonidos sencillos */

let contextoAudio = null;

function reproducirTono(frecuencia, duracion = 0.15) {

    try {
        const AudioContexto =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContexto) return;

        if (!contextoAudio) {
            contextoAudio = new AudioContexto();
        }

        if (contextoAudio.state === "suspended") {
            contextoAudio.resume();
        }

        const oscilador = contextoAudio.createOscillator();
        const ganancia = contextoAudio.createGain();

        oscilador.type = "sine";
        oscilador.frequency.value = frecuencia;

        ganancia.gain.setValueAtTime(
            0.08,
            contextoAudio.currentTime
        );

        ganancia.gain.exponentialRampToValueAtTime(
            0.001,
            contextoAudio.currentTime + duracion
        );

        oscilador.connect(ganancia);
        ganancia.connect(contextoAudio.destination);

        oscilador.start();
        oscilador.stop(contextoAudio.currentTime + duracion);

    } catch (error) {
        // El juego funciona aunque no haya sonido.
    }
}

function sonidoCorrecto() {
    reproducirTono(523);
    setTimeout(() => reproducirTono(659), 120);
}

function sonidoIncorrecto() {
    reproducirTono(330, 0.2);
}

function sonidoVictoria() {
    [523, 659, 784, 1046].forEach((nota, indice) => {
        setTimeout(() => reproducirTono(nota, 0.25), indice * 140);
    });
}

/* 4. Mensajes de Starly */

function cambiarMensaje(titulo, texto) {

    clearTimeout(temporizadorMensaje);

    mensajeTitulo.textContent = titulo;
    mensajeTexto.textContent = texto;

    if (!juegoTerminado) {
        temporizadorMensaje = setTimeout(() => {
            mensajeTitulo.textContent = "¡Tú puedes!";
            mensajeTexto.textContent =
                "¡Elige los objetos para aprender!";
        }, 2500);
    }
}

/* 5. Guardar útiles */

function guardarUtil(boton) {

    if (juegoTerminado || boton.disabled) {
        return;
    }

    boton.disabled = true;
    boton.classList.add("seleccionado");

    utilesGuardados++;

    contador.textContent = utilesGuardados;

    const icono = boton.querySelector("span").textContent;

    const util = document.createElement("span");
    util.className = "util-guardado";
    util.textContent = icono;

    mochilaContenido.appendChild(util);

    mochila.classList.remove("mochila-acierto");

    void mochila.offsetWidth;

    mochila.classList.add("mochila-acierto");

    const estrella = estrellasProgreso[utilesGuardados - 1];

    if (estrella) {
        estrella.textContent = "⭐";
        estrella.classList.add("ganada");
    }

    sonidoCorrecto();

    cambiarMensaje(
        mensajes.correcto[
            (utilesGuardados - 1) % mensajes.correcto.length
        ],
        "¡Ese objeto nos ayuda a aprender!"
    );

    if (utilesGuardados === TOTAL_UTILES) {
        finalizarJuego();
    }
}

/* 6. Respuesta incorrecta */

function respuestaIncorrecta(boton) {

    if (juegoTerminado) {
        return;
    }

    boton.classList.remove("incorrecto");

    void boton.offsetWidth;

    boton.classList.add("incorrecto");

    sonidoIncorrecto();

    const mensaje = mensajes.incorrecto[
        Math.floor(Math.random() * mensajes.incorrecto.length)
    ];

    cambiarMensaje("¡Sigue intentando!", mensaje);

    setTimeout(() => {
        boton.classList.remove("incorrecto");
    }, 400);
}

/* 7. Guardar progreso */

function guardarProgreso() {

    try {
        const clave = "estrellitas_progreso";

        const progreso = JSON.parse(
            localStorage.getItem(clave) || "{}"
        );

        if (!progreso.misiones) {
            progreso.misiones = {};
        }

        progreso.misiones[1] = Math.max(
            Number(progreso.misiones[1]) || 0,
            3
        );

        localStorage.setItem(
            clave,
            JSON.stringify(progreso)
        );

    } catch (error) {
        // Si el almacenamiento no está disponible,
        // el niño puede continuar jugando.
    }
}

/* 8. Finalizar misión */

function finalizarJuego() {

    juegoTerminado = true;

    clearTimeout(temporizadorMensaje);

    mensajeTitulo.textContent = "¡Lo lograste!";
    mensajeTexto.textContent =
        "¡Todos tenemos derecho a aprender!";

    objetos.forEach((objeto) => {
        objeto.disabled = true;
    });

    guardarProgreso();

    sonidoVictoria();

    setTimeout(() => {
        recompensa.hidden = false;

        const boton = recompensa.querySelector(".boton-continuar");

        if (boton) {
            boton.focus();
        }
    }, 1100);
}

/* 9. Eventos */

objetos.forEach((boton) => {

    boton.addEventListener("click", () => {

        if (juegoTerminado || boton.disabled) {
            return;
        }

        const esCorrecto = boton.dataset.correcto === "true";

        if (esCorrecto) {
            guardarUtil(boton);
        } else {
            respuestaIncorrecta(boton);
        }
    });

});
