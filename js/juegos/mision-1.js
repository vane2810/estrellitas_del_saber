
/* ESTRELLITAS DEL SABER - MISIÓN 1 */

"use strict";

/* ELEMENTOS */

const escenario = document.getElementById("escenario");
const paisaje = document.getElementById("paisaje");
const escuela = document.getElementById("escuela");
const starly = document.getElementById("starly");
const villano = document.getElementById("villano");
const efectoRobo = document.getElementById("efecto-robo");

const zonaJuego = document.getElementById("zona-juego");
const controlesJuego = document.getElementById("controles-juego");
const contador = document.getElementById("contador");

const mensajeTexto = document.getElementById("mensaje-texto");
const muestraColor = document.getElementById("mensaje-muestra");
const gotaMuestra = document.getElementById("mensaje-gota");
const simboloMuestra = document.getElementById("simbolo-muestra");

const botonAudio = document.getElementById("btn-audio");
const botonesColores = document.querySelectorAll(".color-magico");
const contenedorColores = document.getElementById("colores");
const contadorEstrellas = document.getElementById("contador-estrellas");
const estrellasProgreso = document.querySelectorAll(".estrella-progreso");
const destellos = document.getElementById("destellos");

/* CONFIGURACIÓN */

const CLAVE_PROGRESO = "estrellitas_del_saber_progreso";
const CLAVE_CONFIGURACION = "estrellitas_del_saber_configuracion";

const RUTA_AUDIO = "../../audio/juegos/mision-1/";
const RUTA_STARLY = "../../img/personajes/starly/";

const IMAGENES = {
    normal: "starly_explorador.webp",
    asustado: "starly_asustado.webp",
    llorando: "starly_llorando.webp"
};

const SIMBOLOS = {
    rojo: "★",
    amarillo: "●",
    azul: "▲",
    verde: "◆",
    morado: "♥"
};

const NOMBRES_SIMBOLOS = {
    rojo: "estrella",
    amarillo: "círculo",
    azul: "triángulo",
    verde: "rombo",
    morado: "corazón"
};

const MENSAJES = {
    bienvenida: {
        texto: "¡Mira, tripulante! ¡Esta es nuestra escuela!",
        audio: "bienvenida.mp3"
    },
    susto: {
        texto: "¡Oh, no!",
        audio: "susto.mp3"
    },
    ayuda: {
        texto: "¡Se llevó los colores! ¿Me ayudas a recuperarlos?",
        audio: "inicio.mp3"
    },
    pedirRojo: {
        texto: "¡Busca el rojo!",
        audio: "pedir-rojo.mp3"
    },
    pedirAmarillo: {
        texto: "¡Ahora el amarillo!",
        audio: "pedir-amarillo.mp3"
    },
    pedirAzul: {
        texto: "¡Vamos por el azul!",
        audio: "pedir-azul.mp3"
    },
    pedirVerde: {
        texto: "¡Busca el verde!",
        audio: "pedir-verde.mp3"
    },
    pedirMorado: {
        texto: "¡Falta el morado!",
        audio: "pedir-morado.mp3"
    },
    error: {
        texto: "¡Inténtalo otra vez!",
        audio: "casi.mp3"
    }
};

const RONDAS = [
    {
        color: "rojo",
        clase: "techo-pintado",
        pedido: "pedirRojo",
        selector: ".techo"
    },
    {
        color: "amarillo",
        clase: "paredes-pintadas",
        pedido: "pedirAmarillo",
        selector: ".edificio"
    },
    {
        color: "azul",
        clase: "puerta-pintada",
        pedido: "pedirAzul",
        selector: ".puerta"
    },
    {
        color: "verde",
        clase: "naturaleza-pintada",
        pedido: "pedirVerde",
        selector: ".arbol"
    },
    {
        color: "morado",
        clase: "flores-pintadas",
        pedido: "pedirMorado",
        selector: ".flor"
    }
];

/* ESTADO */

let configuracion = {
    musica: true,
    efectos: true,
    voz: true
};

try {
    const guardada = JSON.parse(
        localStorage.getItem(CLAVE_CONFIGURACION) || "{}"
    );

    if (guardada && typeof guardada === "object") {
        configuracion = { ...configuracion, ...guardada };
    }
} catch (error) {
    console.warn("Configuración predeterminada.");
}

let rondaActual = 0;
let estrellasGanadas = 0;
let introduccionTerminada = false;
let misionTerminada = false;
let procesando = false;

let audioActual = null;
let ultimoMensaje = "bienvenida";
let temporizadorPista = null;
let contextoAudio = null;

/* UTILIDADES */

function pausa(tiempo) {
    return new Promise((resolver) => {
        setTimeout(resolver, tiempo);
    });
}

function detenerAudio() {
    if (audioActual) {
        audioActual.pause();
        audioActual.currentTime = 0;
        audioActual = null;
    }

    botonAudio.classList.remove("reproduciendo");
}

function reproducirAudio(nombre) {
    detenerAudio();

    ultimoMensaje = nombre;

    const mensaje = MENSAJES[nombre];

    if (!mensaje || !configuracion.voz) {
        return Promise.resolve();
    }

    return new Promise((resolver) => {
        const audio = new Audio(RUTA_AUDIO + mensaje.audio);
        audioActual = audio;

        let terminado = false;

        function finalizar() {
            if (terminado) {
                return;
            }

            terminado = true;

            if (audioActual === audio) {
                audioActual = null;
                botonAudio.classList.remove("reproduciendo");
            }

            resolver();
        }

        audio.addEventListener("ended", finalizar, { once: true });
        audio.addEventListener("error", finalizar, { once: true });

        audio.play().then(() => {
            botonAudio.classList.add("reproduciendo");
        }).catch(finalizar);
    });
}

function mostrarMensaje(nombre) {
    const mensaje = MENSAJES[nombre];

    if (!mensaje) {
        return Promise.resolve();
    }

    mensajeTexto.textContent = mensaje.texto;

    return reproducirAudio(nombre);
}

function cambiarStarly(nombre) {
    const imagen = new Image();

    imagen.onload = () => {
        starly.src = RUTA_STARLY + nombre;
    };

    imagen.src = RUTA_STARLY + nombre;
}

function reproducirTono(frecuencia) {
    if (!configuracion.efectos) {
        return;
    }

    try {
        const AudioContexto =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContexto) {
            return;
        }

        if (!contextoAudio) {
            contextoAudio = new AudioContexto();
        }

        const oscilador = contextoAudio.createOscillator();
        const ganancia = contextoAudio.createGain();

        oscilador.frequency.value = frecuencia;
        oscilador.type = "sine";

        ganancia.gain.setValueAtTime(0.05, contextoAudio.currentTime);
        ganancia.gain.exponentialRampToValueAtTime(
            0.001,
            contextoAudio.currentTime + 0.2
        );

        oscilador.connect(ganancia);
        ganancia.connect(contextoAudio.destination);

        oscilador.start();
        oscilador.stop(contextoAudio.currentTime + 0.2);
    } catch (error) {
        // EL JUEGO CONTINÚA SIN AUDIO.
    }
}

/* MEZCLAR COLORES */

function mezclarColores() {
    const botones = Array.from(botonesColores);

    for (let i = botones.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [botones[i], botones[j]] = [botones[j], botones[i]];
    }

    botones.forEach((boton) => {
        contenedorColores.appendChild(boton);
    });
}

/* PAISAJE */

function apagarPaisaje() {
    paisaje.classList.add("sin-color");

    escuela.classList.remove(
        "techo-pintado",
        "paredes-pintadas",
        "puerta-pintada"
    );

    paisaje.classList.remove(
        "naturaleza-pintada",
        "flores-pintadas"
    );
}

function prepararColores() {
    paisaje.classList.remove("sin-color");
    paisaje.classList.add("juego-activo");

    mezclarColores();

    zonaJuego.classList.remove("historia-activa");

    controlesJuego.hidden = false;
    controlesJuego.classList.add("apareciendo");

    contador.hidden = false;

    introduccionTerminada = true;

    pedirRonda();
}

/* DON GRIS */

async function animarRobo() {
    villano.classList.add("entrando");

    await pausa(2000);

    villano.classList.remove("entrando");
    villano.classList.add("robando");

    cambiarStarly(IMAGENES.asustado);
    mostrarMensaje("susto");

    await pausa(500);

    efectoRobo.classList.add("activo");

    await pausa(1300);

    apagarPaisaje();

    await pausa(1200);

    villano.classList.remove("robando");
    villano.classList.add("escapando");

    await pausa(2000);

    villano.classList.remove("escapando");
    efectoRobo.classList.remove("activo");
}

/* MUESTRA */

function actualizarMuestra(color) {
    gotaMuestra.classList.remove(
        "rojo",
        "amarillo",
        "azul",
        "verde",
        "morado"
    );

    if (!color) {
        muestraColor.hidden = true;
        return;
    }

    muestraColor.hidden = false;
    gotaMuestra.classList.add(color);
    simboloMuestra.textContent = SIMBOLOS[color];
}

/* PISTAS */

function quitarPistas() {
    clearTimeout(temporizadorPista);

    botonesColores.forEach((boton) => {
        boton.classList.remove("pista");
    });
}

function programarPista() {
    quitarPistas();

    if (rondaActual !== 0) {
        return;
    }

    const ronda = RONDAS[rondaActual];

    if (!ronda) {
        return;
    }

    temporizadorPista = setTimeout(() => {
        const boton = document.querySelector(
            '.color-magico[data-color="' + ronda.color + '"]'
        );

        if (boton && !misionTerminada && !procesando) {
            boton.classList.add("pista");
        }
    }, 1500);
}

/* RONDAS */

function pedirRonda() {
    const ronda = RONDAS[rondaActual];

    if (!ronda || misionTerminada) {
        return;
    }

    procesando = false;

    botonesColores.forEach((boton) => {
        boton.disabled = boton.classList.contains("usado");
    });

    actualizarMuestra(ronda.color);
    mostrarMensaje(ronda.pedido);
    programarPista();
}

function actualizarEstrellas() {
    const nuevasEstrellas =
        rondaActual >= 5 ? 3 :
        rondaActual >= 4 ? 2 :
        rondaActual >= 2 ? 1 : 0;

    while (estrellasGanadas < nuevasEstrellas) {
        const estrella = estrellasProgreso[estrellasGanadas];

        if (estrella) {
            estrella.textContent = "⭐";
            estrella.classList.add("ganada");
        }

        estrellasGanadas++;
    }

    contadorEstrellas.textContent = estrellasGanadas;
}

function crearDestellos(elemento) {
    const caja = elemento.getBoundingClientRect();
    const escenarioCaja = escenario.getBoundingClientRect();

    for (let i = 0; i < 10; i++) {
        const destello = document.createElement("span");

        destello.className = "destello";
        destello.textContent = "✦";

        destello.style.left =
            caja.left - escenarioCaja.left +
            Math.random() * caja.width + "px";

        destello.style.top =
            caja.top - escenarioCaja.top +
            Math.random() * caja.height + "px";

        destellos.appendChild(destello);

        setTimeout(() => destello.remove(), 950);
    }
}

async function seleccionarColor(boton) {
    if (
        !introduccionTerminada ||
        misionTerminada ||
        procesando ||
        boton.disabled
    ) {
        return;
    }

    const ronda = RONDAS[rondaActual];

    if (!ronda) {
        return;
    }

    if (boton.dataset.color !== ronda.color) {
        procesando = true;

        reproducirTono(300);

        boton.classList.add("error");

        mensajeTexto.textContent = MENSAJES.error.texto;
        reproducirAudio("error");

        await pausa(900);

        boton.classList.remove("error");

        if (!misionTerminada) {
            pedirRonda();
        }

        return;
    }

    procesando = true;
    quitarPistas();

    boton.disabled = true;
    boton.classList.add("usado");

    if (rondaActual < 3) {
        escuela.classList.add(ronda.clase);
    } else {
        paisaje.classList.add(ronda.clase);
    }

    const elemento = document.querySelector(ronda.selector);

    if (elemento) {
        crearDestellos(elemento);
    }

    reproducirTono(650);

    rondaActual++;
    actualizarEstrellas();

    if (rondaActual === 3) {
        cambiarStarly(IMAGENES.normal);
    }

    if (rondaActual >= RONDAS.length) {
        finalizarMision();
        return;
    }

    await pausa(850);

    if (!misionTerminada) {
        pedirRonda();
    }
}

/* PROGRESO */

function guardarProgreso() {
    try {
        const guardado = JSON.parse(
            localStorage.getItem(CLAVE_PROGRESO) || "{}"
        );

        const progreso =
            guardado && typeof guardado === "object"
                ? guardado
                : {};

        if (!Array.isArray(progreso.completadas)) {
            progreso.completadas = [];
        }

        if (!progreso.completadas.map(Number).includes(1)) {
            progreso.completadas.push(1);
        }

        if (!progreso.estrellas || typeof progreso.estrellas !== "object") {
            progreso.estrellas = {};
        }

        progreso.estrellas[1] = 3;

        localStorage.setItem(
            CLAVE_PROGRESO,
            JSON.stringify(progreso)
        );
    } catch (error) {
        console.warn("No se pudo guardar el progreso.");
    }
}

/* FINAL */

async function finalizarMision() {
    misionTerminada = true;
    procesando = true;

    quitarPistas();
    detenerAudio();
    actualizarMuestra(null);

    botonesColores.forEach((boton) => {
        boton.disabled = true;
    });

    paisaje.classList.remove("sin-color");
    paisaje.classList.add("recuperando");

    cambiarStarly(IMAGENES.normal);

    mensajeTexto.textContent =
        "¡Lo logramos! ¡Qué bonita quedó nuestra escuela!";

    guardarProgreso();

    await pausa(1600);

    if (typeof window.mostrarCelebracion === "function") {
        window.mostrarCelebracion({
            mision: 1,
            estrellas: 3,
            titulo: "¡Misión completada!",
            mensaje: "¡Todos tenemos derecho a ir a la escuela!",
            audio: RUTA_AUDIO + "victoria.mp3",
            destino: "../mapa.html"
        });
    }
}

/* INTRODUCCIÓN */

async function iniciarIntroduccion() {
    actualizarMuestra(null);

    await Promise.all([
        mostrarMensaje("bienvenida"),
        pausa(4000)
    ]);

    await animarRobo();

    cambiarStarly(IMAGENES.llorando);

    await Promise.all([
        mostrarMensaje("ayuda"),
        pausa(3500)
    ]);

    prepararColores();
}

/* EVENTOS */

botonesColores.forEach((boton) => {
    boton.addEventListener("click", () => {
        seleccionarColor(boton);
    });
});

botonAudio.addEventListener("click", () => {
    reproducirAudio(ultimoMensaje);
});

window.addEventListener("pagehide", () => {
    detenerAudio();
    clearTimeout(temporizadorPista);
});

/* INICIO */

iniciarIntroduccion();
