
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
    },
    recuperados: {
        texto: "¡Los recuperamos!",
        audio: "los-recuperamos.mp3"
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

const EFECTOS_MP3 = {
    aparicion: "aparicion.mp3",
    risa: "risa-don-gris.mp3",
    robo: "robo-colores.mp3",
    escape: "escape.mp3",
    correcto: "color-correcto.mp3",
    error: "color-error.mp3"
};

const TIEMPOS = {
    presentacionMinima: 2500,
    entradaDonGris: 2000,
    sustoMinimo: 1100,
    roboMinimo: 5000,
    escape: 2000,
    pausaError: 700,
    pausaAcierto: 850,
    pausaFinal: 450,
    recordatorio: 8000,
    pistaInicial: 4500
};

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
        configuracion = {
            ...configuracion,
            ...guardada
        };
    }
} catch (error) {
    console.warn("Se utilizará la configuración predeterminada.");
}

let rondaActual = 0;
let estrellasGanadas = 0;
let introduccionTerminada = false;
let misionTerminada = false;
let procesando = true;

let audioActual = null;
let resolverAudioActual = null;
let ultimoMensaje = "bienvenida";

let temporizadorPista = null;
let temporizadorRecordatorio = null;
let recordatorioEnCurso = false;
let identificadorRecordatorio = 0;

const efectosActivos = new Set();
const audiosPrecargados = new Map();

/* UTILIDADES */

function pausa(tiempo) {
    return new Promise((resolver) => {
        setTimeout(resolver, tiempo);
    });
}

function esperarAudioOminimo(promesa, tiempo) {
    return Promise.all([
        promesa,
        pausa(tiempo)
    ]);
}

function precargarAudios() {
    const archivos = [
        ...Object.values(MENSAJES).map((mensaje) => mensaje.audio),
        ...Object.values(EFECTOS_MP3),
        "victoria.mp3"
    ];

    [...new Set(archivos)].forEach((archivo) => {
        const audio = new Audio(RUTA_AUDIO + archivo);
        audio.preload = "auto";
        audiosPrecargados.set(archivo, audio);
    });
}

function obtenerAudio(archivo) {
    const base = audiosPrecargados.get(archivo);

    if (base) {
        return base.cloneNode(true);
    }

    return new Audio(RUTA_AUDIO + archivo);
}

/* VOCES */

function detenerAudio() {
    const audio = audioActual;
    const resolver = resolverAudioActual;

    audioActual = null;
    resolverAudioActual = null;

    if (audio) {
        audio.pause();

        try {
            audio.currentTime = 0;
        } catch (error) {
            // El audio todavía puede estar cargando.
        }
    }

    botonAudio.classList.remove("reproduciendo");

    if (resolver) {
        resolver();
    }
}

function reproducirAudio(nombre) {
    const mensaje = MENSAJES[nombre];

    if (!mensaje) {
        return Promise.resolve();
    }

    detenerAudio();
    ultimoMensaje = nombre;

    if (!configuracion.voz) {
        return Promise.resolve();
    }

    return new Promise((resolver) => {
        const audio = obtenerAudio(mensaje.audio);
        let terminado = false;

        function finalizar() {
            if (terminado) {
                return;
            }

            terminado = true;

            if (audioActual === audio) {
                audioActual = null;
                resolverAudioActual = null;
                botonAudio.classList.remove("reproduciendo");
            }

            resolver();
        }

        audioActual = audio;
        resolverAudioActual = finalizar;
        audio.volume = 1;

        audio.addEventListener("ended", finalizar, { once: true });
        audio.addEventListener("error", finalizar, { once: true });

        audio.play()
            .then(() => {
                if (audioActual === audio) {
                    botonAudio.classList.add("reproduciendo");
                }
            })
            .catch(finalizar);
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

/* EFECTOS */

function reproducirEfecto(nombre, esperar = false) {
    const archivo = EFECTOS_MP3[nombre];

    if (!archivo || !configuracion.efectos) {
        return Promise.resolve();
    }

    const audio = obtenerAudio(archivo);

    audio.volume = nombre === "error" ? 1 : 0.6;
    efectosActivos.add(audio);

    const promesa = new Promise((resolver) => {
        let terminado = false;

        function finalizar() {
            if (terminado) {
                return;
            }

            terminado = true;
            efectosActivos.delete(audio);
            resolver();
        }

        audio.addEventListener("ended", finalizar, { once: true });
        audio.addEventListener("error", finalizar, { once: true });

        audio.play().catch(finalizar);
    });

    return esperar ? promesa : Promise.resolve();
}

function detenerEfectos() {
    efectosActivos.forEach((audio) => {
        audio.pause();

        try {
            audio.currentTime = 0;
        } catch (error) {
            // El audio todavía puede estar cargando.
        }

        audio.dispatchEvent(new Event("ended"));
    });

    efectosActivos.clear();
}

/* STARLY */

function cambiarStarly(nombre) {
    const ruta = RUTA_STARLY + nombre;
    const imagen = new Image();

    imagen.onload = () => {
        starly.src = ruta;
    };

    imagen.src = ruta;
}

/* COLORES */

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

function actualizarMuestra(color) {
    gotaMuestra.classList.remove(
        "rojo",
        "amarillo",
        "azul",
        "verde",
        "morado"
    );

    if (!color || !SIMBOLOS[color]) {
        muestraColor.hidden = true;
        simboloMuestra.textContent = "";
        return;
    }

    gotaMuestra.classList.add(color);
    simboloMuestra.textContent = SIMBOLOS[color];
    muestraColor.hidden = false;
}

function apagarPaisaje() {
    paisaje.classList.add("sin-color");

    escuela.classList.remove(
        "techo-pintado",
        "paredes-pintadas",
        "puerta-pintada"
    );

    paisaje.classList.remove(
        "naturaleza-pintada",
        "flores-pintadas",
        "recuperando"
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
    villano.classList.remove(
        "entrando",
        "presente",
        "robando",
        "escapando",
        "oculto"
    );

    efectoRobo.classList.remove("activo");

    villano.classList.add("entrando");

    reproducirEfecto("aparicion");
    reproducirEfecto("risa");

    await pausa(TIEMPOS.entradaDonGris);

    villano.classList.remove("entrando");
    villano.classList.add("presente");

    cambiarStarly(IMAGENES.asustado);

    await esperarAudioOminimo(
        mostrarMensaje("susto"),
        TIEMPOS.sustoMinimo
    );

    villano.classList.add("robando");
    efectoRobo.classList.add("activo");

    const sonidoRobo = reproducirEfecto("robo", true);

    await pausa(1800);

    apagarPaisaje();

    await esperarAudioOminimo(
        sonidoRobo,
        TIEMPOS.roboMinimo - 1800
    );

    efectoRobo.classList.remove("activo");
    villano.classList.remove("robando");

    villano.classList.add("escapando");
    reproducirEfecto("escape");

    await pausa(TIEMPOS.escape);

    villano.classList.remove("escapando", "presente");
    villano.classList.add("oculto");
}

/* RECORDATORIO AUTOMÁTICO */

function detenerRecordatorio() {
    clearTimeout(temporizadorRecordatorio);
    temporizadorRecordatorio = null;
    identificadorRecordatorio++;
}

function iniciarRecordatorio() {
    detenerRecordatorio();

    if (
        misionTerminada ||
        procesando ||
        !introduccionTerminada ||
        recordatorioEnCurso
    ) {
        return;
    }

    const rondaProgramada = rondaActual;
    const identificador = identificadorRecordatorio;

    temporizadorRecordatorio = setTimeout(async () => {
        if (
            identificador !== identificadorRecordatorio ||
            misionTerminada ||
            procesando ||
            rondaActual !== rondaProgramada ||
            recordatorioEnCurso
        ) {
            return;
        }

        const ronda = RONDAS[rondaActual];

        if (!ronda) {
            return;
        }

        // No interrumpir una voz que todavía está hablando.
        if (audioActual) {
            iniciarRecordatorio();
            return;
        }

        recordatorioEnCurso = true;

        await mostrarMensaje(ronda.pedido);

        recordatorioEnCurso = false;

        if (
            identificador === identificadorRecordatorio &&
            !misionTerminada &&
            !procesando &&
            rondaActual === rondaProgramada
        ) {
            iniciarRecordatorio();
        }
    }, TIEMPOS.recordatorio);
}

/* PISTAS */

function quitarPistas() {
    clearTimeout(temporizadorPista);
    temporizadorPista = null;

    botonesColores.forEach((boton) => {
        boton.classList.remove("pista");
    });
}

function programarPista() {
    quitarPistas();

    if (
        rondaActual !== 0 ||
        misionTerminada ||
        procesando
    ) {
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

        if (
            boton &&
            !misionTerminada &&
            !procesando &&
            rondaActual === 0
        ) {
            boton.classList.add("pista");
        }
    }, TIEMPOS.pistaInicial);
}

/* RONDAS */

function bloquearColores() {
    botonesColores.forEach((boton) => {
        boton.disabled = true;
    });
}

function habilitarColores() {
    botonesColores.forEach((boton) => {
        boton.disabled = boton.classList.contains("usado");
    });
}

function pedirRonda() {
    const ronda = RONDAS[rondaActual];

    if (!ronda || misionTerminada) {
        return;
    }

    recordatorioEnCurso = false;
    actualizarMuestra(ronda.color);

    mensajeTexto.textContent = MENSAJES[ronda.pedido].texto;

    procesando = false;
    habilitarColores();

    reproducirAudio(ronda.pedido);

    programarPista();
    iniciarRecordatorio();
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

/* DESTELLOS */

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

        setTimeout(() => {
            destello.remove();
        }, 950);
    }
}

/* SELECCIÓN DE COLORES */

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

    detenerRecordatorio();
    quitarPistas();

    procesando = true;
    bloquearColores();

    // Detener la petición anterior antes de dar una respuesta.
    detenerAudio();
    recordatorioEnCurso = false;

    if (boton.dataset.color !== ronda.color) {
        boton.classList.add("error");

        reproducirEfecto("error");

        // Esperar a que termine la voz de corrección.
        await mostrarMensaje("error");

        // Pequeña pausa para que la respuesta sea natural.
        await pausa(TIEMPOS.pausaError);

        boton.classList.remove("error");

        if (!misionTerminada) {
            pedirRonda();
        }

        return;
    }

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

    reproducirEfecto("correcto");

    rondaActual++;
    actualizarEstrellas();

    if (rondaActual === 3) {
        cambiarStarly(IMAGENES.normal);
    }

    if (rondaActual >= RONDAS.length) {
        await finalizarMision();
        return;
    }

    await pausa(TIEMPOS.pausaAcierto);

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

        if (
            !progreso.estrellas ||
            typeof progreso.estrellas !== "object"
        ) {
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

    detenerRecordatorio();
    quitarPistas();
    detenerAudio();
    bloquearColores();
    actualizarMuestra(null);

    // Recuperar todo el color antes del mensaje final.
    paisaje.classList.remove("sin-color", "juego-activo");
    paisaje.classList.add("recuperando");

    cambiarStarly(IMAGENES.normal);

    guardarProgreso();

    // El diálogo debe terminar antes de abrir la celebración.
    await esperarAudioOminimo(
        mostrarMensaje("recuperados"),
        1800
    );

    await pausa(TIEMPOS.pausaFinal);

    detenerAudio();

    if (typeof window.mostrarCelebracion === "function") {
        window.mostrarCelebracion({
            mision: 1,
            estrellas: 3,
            titulo: "¡Misión completada!",
            mensaje: "¡Todos tenemos derecho a ir a la escuela!",
            audio: RUTA_AUDIO + "victoria.mp3",
            destino: "../mapa.html"
        });
    } else {
        console.warn("No se encontró la función mostrarCelebracion.");
    }
}

/* INTRODUCCIÓN */

async function iniciarIntroduccion() {
    introduccionTerminada = false;
    misionTerminada = false;
    procesando = true;

    detenerRecordatorio();
    quitarPistas();
    detenerAudio();

    actualizarMuestra(null);
    bloquearColores();

    controlesJuego.hidden = true;
    contador.hidden = true;

    // La escuela comienza completamente coloreada.
    paisaje.classList.remove(
        "sin-color",
        "juego-activo",
        "recuperando",
        "naturaleza-pintada",
        "flores-pintadas"
    );

    escuela.classList.add(
        "techo-pintado",
        "paredes-pintadas",
        "puerta-pintada"
    );

    villano.classList.remove(
        "entrando",
        "presente",
        "robando",
        "escapando"
    );

    villano.classList.add("oculto");
    efectoRobo.classList.remove("activo");

    precargarAudios();
    cambiarStarly(IMAGENES.normal);

    // Presentación: esperar la voz sin alargarla demasiado.
    await esperarAudioOminimo(
        mostrarMensaje("bienvenida"),
        TIEMPOS.presentacionMinima
    );

    // Don Gris aparece y comienza a reír desde su entrada.
    await animarRobo();

    cambiarStarly(IMAGENES.llorando);

    // Starly pide ayuda antes de mostrar los controles.
    await mostrarMensaje("ayuda");

    await pausa(300);

    prepararColores();
}

/* EVENTOS */

botonesColores.forEach((boton) => {
    boton.addEventListener("click", () => {
        seleccionarColor(boton);
    });
});

botonAudio.addEventListener("click", () => {
    if (misionTerminada) {
        return;
    }

    // Evitar interrumpir la narración automática.
    if (!introduccionTerminada || procesando) {
        return;
    }

    detenerRecordatorio();

    const ronda = RONDAS[rondaActual];

    if (!ronda) {
        return;
    }

    mostrarMensaje(ronda.pedido).then(() => {
        if (!misionTerminada && !procesando) {
            iniciarRecordatorio();
        }
    });
});

window.addEventListener("pagehide", () => {
    detenerRecordatorio();
    detenerAudio();
    detenerEfectos();
    quitarPistas();
});

/* INICIO */

iniciarIntroduccion();
