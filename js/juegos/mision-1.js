
/* ==========================================
   ESTRELLITAS DEL SABER
   MISIÓN 1 - LA MOCHILA
========================================== */

/* 1. Elementos */

const objetos = document.querySelectorAll(".objeto");
const contador = document.getElementById("contador-utiles");
const mochila = document.getElementById("mochila");
const mochilaContenido = document.getElementById("mochila-contenido");

const estrellasProgreso = document.querySelectorAll(".estrella-progreso");

const mensajeTitulo = document.getElementById("mensaje-titulo");
const mensajeTexto = document.getElementById("mensaje-texto");

const botonAudio = document.getElementById("btn-audio");
const recompensa = document.getElementById("recompensa");
const confeti = document.getElementById("confeti");

/* 2. Configuración */

const TOTAL_UTILES = 3;
const RUTA_AUDIO = "../../audio/juegos/mision-1/";

const narraciones = {
    inicio: "inicio.mp3",
    libro: "libros.mp3",
    lapiz: "lapiz.mp3",
    cuaderno: "cuaderno.mp3",
    incorrecto: "intenta-otra-vez.mp3",
    victoria: "victoria.mp3"
};

const efectoVictoria = new Audio(
    "../../audio/efecto/victoria.mp3"
);

efectoVictoria.volume = 0.35;
const mensajes = {
    inicio: {
        titulo: "¡Hola, tripulante!",
        texto: "¡Elige 3 útiles para mi mochila!"
    },

    libro: {
        titulo: "¡Muy bien!",
        texto: "¡Los libros nos ayudan a aprender!"
    },

    lapiz: {
        titulo: "¡Excelente!",
        texto: "¡Con el lápiz podemos escribir!"
    },

    cuaderno: {
        titulo: "¡Genial!",
        texto: "¡En el cuaderno podemos practicar!"
    },

    incorrecto: {
        titulo: "¡Sigue intentando!",
        texto: "¡Ese no es un útil escolar! ¡Busquemos otro!"
    },

    victoria: {
        titulo: "¡Lo lograste!",
        texto: "¡Todos tenemos derecho a aprender!"
    }
};



let utilesGuardados = 0;
let juegoTerminado = false;
let audioActual = null;
let ultimaNarracion = "inicio";
let temporizadorFinal = null;

/* 3. Narraciones de Starly */

function detenerNarracion() {
    if (!audioActual) return;

    audioActual.pause();
    audioActual.currentTime = 0;
    audioActual = null;

    botonAudio.classList.remove("reproduciendo");
}

function reproducirNarracion(nombre) {
    const archivo = narraciones[nombre];

    if (!archivo) return;

    detenerNarracion();

    ultimaNarracion = nombre;

    const audio = new Audio(RUTA_AUDIO + archivo);
    audio.volume = 1;

    audioActual = audio;

    audio.addEventListener("ended", () => {
        if (audioActual === audio) {
            audioActual = null;
            botonAudio.classList.remove("reproduciendo");
        }
    });

    audio.addEventListener("error", () => {
        if (audioActual === audio) {
            audioActual = null;
            botonAudio.classList.remove("reproduciendo");
        }
    });

    audio.play()
        .then(() => {
            if (audioActual === audio) {
                botonAudio.classList.add("reproduciendo");
            }
        })
        .catch(() => {
            // Algunos navegadores requieren interacción
            // antes de permitir reproducir audio.
            if (audioActual === audio) {
                botonAudio.classList.remove("reproduciendo");
            }
        });
}

function mostrarMensaje(nombre) {
    const mensaje = mensajes[nombre];

    if (!mensaje) return;

    mensajeTitulo.textContent = mensaje.titulo;
    mensajeTexto.textContent = mensaje.texto;

    reproducirNarracion(nombre);
}

/* 4. Efectos suaves */

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
            0.045,
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
        // El juego continúa sin efectos de sonido.
    }
}

function sonidoCorrecto() {
    reproducirTono(523, 0.13);
    setTimeout(() => reproducirTono(659, 0.16), 120);
}

function sonidoVictoria() {
    efectoVictoria.currentTime = 0;

    efectoVictoria.play().catch(() => {
        // El juego continúa si el audio no está disponible.
    });
}

/* 5. Guardar útiles */

function guardarUtil(boton) {
    if (juegoTerminado || boton.disabled) return;

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

    const tipo = boton.dataset.id;

    if (utilesGuardados === TOTAL_UTILES) {
        finalizarJuego();
    } else {
        mostrarMensaje(tipo);
    }
}

/* 6. Objetos que no son útiles */

function respuestaIncorrecta(boton) {
    if (juegoTerminado) return;

    boton.classList.remove("incorrecto");
    void boton.offsetWidth;
    boton.classList.add("incorrecto");

    mostrarMensaje("incorrecto");

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
        // El juego funciona sin almacenamiento local.
    }
}

/* 8. Confeti */

function crearConfeti() {
    confeti.innerHTML = "";

    const colores = [
        "#ffd84d",
        "#ff8745",
        "#55d6f5",
        "#8467d7",
        "#43c98b",
        "#f36b79"
    ];

    for (let i = 0; i < 45; i++) {
        const pieza = document.createElement("span");

        pieza.className = "confeti-pieza";

        pieza.style.left = Math.random() * 100 + "%";
        pieza.style.backgroundColor =
            colores[Math.floor(Math.random() * colores.length)];

        pieza.style.animationDuration =
            (2 + Math.random() * 2) + "s";

        pieza.style.animationDelay =
            (Math.random() * 0.7) + "s";

        confeti.appendChild(pieza);
    }
}

/* 9. Finalizar misión */

function finalizarJuego() {
    juegoTerminado = true;

    objetos.forEach((objeto) => {
        objeto.disabled = true;
    });

    guardarProgreso();

    sonidoVictoria();

    // Dejamos que se vea el último útil entrando.
    temporizadorFinal = setTimeout(() => {
        recompensa.hidden = false;
        crearConfeti();

        mostrarMensaje("victoria");

        const botonContinuar =
            recompensa.querySelector(".boton-continuar");

        if (botonContinuar) {
            botonContinuar.focus();
        }
    }, 900);
}

/* 10. Eventos */

objetos.forEach((boton) => {
    boton.addEventListener("click", () => {
        if (juegoTerminado || boton.disabled) return;

        const esCorrecto =
            boton.dataset.correcto === "true";

        if (esCorrecto) {
            guardarUtil(boton);
        } else {
            respuestaIncorrecta(boton);
        }
    });
});

botonAudio.addEventListener("click", () => {
    reproducirNarracion(ultimaNarracion);
});

window.addEventListener("pagehide", () => {
    clearTimeout(temporizadorFinal);
    detenerNarracion();
});

/* 11. Iniciar misión */

mostrarMensaje("inicio");
