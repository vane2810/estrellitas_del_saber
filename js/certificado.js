
/* ESTRELLITAS DEL SABER - CERTIFICADO FINAL */

"use strict";

/* ELEMENTOS */

const escenaCertificado = document.getElementById("escena-certificado");
const escenaDespedida = document.getElementById("escena-despedida");
const escenaFin = document.getElementById("escena-fin");

const mensajeCertificado = document.getElementById("mensaje-certificado");
const textoDespedida = document.getElementById("texto-despedida");
const certificadoEstrellas = document.getElementById("certificado-estrellas");

const btnContinuar = document.getElementById("btn-continuar");
const btnGuardar = document.getElementById("btn-guardar");
const btnVolver = document.getElementById("btn-volver");
const btnAudio = document.getElementById("btn-audio");

const nave = document.getElementById("final-nave");
const cielo = document.getElementById("certificado-cielo");

/* RUTAS */

const RUTA_MAPA = "mapa.html";
const RUTA_NARRACIONES = "../audio/narraciones/";
const RUTA_EFECTOS = "../audio/efecto/";
const RUTA_MUSICA = "../audio/musica/";

const audios = {
    certificado1: RUTA_NARRACIONES + "certificado_1.mp3",
    certificado2: RUTA_NARRACIONES + "certificado_2.mp3",
    despedida1: RUTA_NARRACIONES + "despedida_1.mp3",
    despedida2: RUTA_NARRACIONES + "despedida_2.mp3",
    certificado: RUTA_EFECTOS + "certificado.mp3",
    despegue: RUTA_EFECTOS + "despegue.mp3",
    vuelo: RUTA_EFECTOS + "vuelo.mp3",
    musica: RUTA_MUSICA + "aventura_espacial.mp3"
};

/* CONFIGURACIÓN */

const CLAVE_CONFIGURACION = "estrellitas_del_saber_configuracion";
const CLAVE_PROGRESO = "estrellitas_del_saber_progreso";

function leerJSON(clave, predeterminado) {
    try {
        const valor = localStorage.getItem(clave);
        return valor === null ? predeterminado : JSON.parse(valor);
    } catch (error) {
        return predeterminado;
    }
}

const configuracionGuardada = leerJSON(CLAVE_CONFIGURACION, {});

const configuracion = {
    musica: true,
    efectos: true,
    voz: true,
    ...(configuracionGuardada &&
        typeof configuracionGuardada === "object"
        ? configuracionGuardada
        : {})
};

let vozActivada = Boolean(configuracion.voz);
let narracionActual = null;
let musicaActual = null;
let efectosActivos = [];
let secuenciaActual = 0;
let despedidaIniciada = false;
let narracionPendiente = false;

const movimientoReducido = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

/* UTILIDADES */

function esperar(milisegundos) {
    return new Promise(resolver => {
        setTimeout(resolver, milisegundos);
    });
}

function detenerNarracion() {
    if (!narracionActual) return;

    narracionActual.pause();
    narracionActual.currentTime = 0;
    narracionActual = null;
}

function detenerEfectos() {
    efectosActivos.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });

    efectosActivos = [];
}

function detenerMusica() {
    if (musicaActual) {
        musicaActual.pause();
    }
}

function actualizarBotonAudio() {
    if (!btnAudio) return;

    btnAudio.textContent = vozActivada ? "🔊" : "🔇";
    btnAudio.setAttribute(
        "aria-label",
        vozActivada
            ? "Desactivar narración"
            : "Activar narración"
    );
}

/* NARRACIONES */

function reproducirNarracion(ruta, maximo = 9000) {
    if (!vozActivada || !ruta) {
        return Promise.resolve();
    }

    detenerNarracion();

    return new Promise(resolver => {
        const audio = new Audio(ruta);
        const identificador = secuenciaActual;

        narracionActual = audio;
        audio.volume = 1;

        let finalizado = false;
        let temporizador = null;

        function terminar() {
            if (finalizado) return;

            finalizado = true;
            clearTimeout(temporizador);

            audio.pause();

            if (narracionActual === audio) {
                narracionActual = null;
            }

            resolver();
        }

        audio.addEventListener("ended", terminar, { once: true });
        audio.addEventListener("error", terminar, { once: true });

        audio.play().then(() => {
            if (identificador !== secuenciaActual) {
                terminar();
            }
        }).catch(error => {
            if (error.name === "NotAllowedError") {
                narracionPendiente = true;
            }

            terminar();
        });

        temporizador = setTimeout(terminar, maximo);
    });
}

/* EFECTOS */

function reproducirEfecto(ruta, volumen = 0.45) {
    if (!configuracion.efectos || !ruta) return;

    const audio = new Audio(ruta);

    audio.volume = Math.max(0, Math.min(1, volumen));
    efectosActivos.push(audio);

    function limpiar() {
        efectosActivos = efectosActivos.filter(
            elemento => elemento !== audio
        );
    }

    audio.addEventListener("ended", limpiar, { once: true });
    audio.addEventListener("error", limpiar, { once: true });

    audio.play().catch(limpiar);
}

/* MÚSICA */

function iniciarMusica() {
    if (!configuracion.musica) return;

    if (!musicaActual) {
        musicaActual = new Audio(audios.musica);
        musicaActual.loop = true;
        musicaActual.volume = 0.12;
    }

    musicaActual.play().catch(() => {});
}

/* FONDO ESTRELLADO */

function crearEstrellas() {
    if (!cielo) return;

    const fragmento = document.createDocumentFragment();

    for (let indice = 0; indice < 70; indice++) {
        const estrella = document.createElement("span");

        estrella.className = "final-estrella-fondo";

        estrella.style.setProperty(
            "--x",
            `${Math.random() * 100}%`
        );

        estrella.style.setProperty(
            "--y",
            `${Math.random() * 100}%`
        );

        estrella.style.setProperty(
            "--tamano",
            `${1 + Math.random() * 3}px`
        );

        estrella.style.setProperty(
            "--duracion",
            `${1.5 + Math.random() * 3}s`
        );

        estrella.style.setProperty(
            "--retraso",
            `${Math.random() * -4}s`
        );

        fragmento.appendChild(estrella);
    }

    cielo.appendChild(fragmento);
}

/* PROGRESO */

function obtenerProgreso() {
    return leerJSON(CLAVE_PROGRESO, {});
}

function aventuraCompletada() {
    const progreso = obtenerProgreso();

    if (!Array.isArray(progreso?.completadas)) {
        return false;
    }

    const completadas = progreso.completadas.map(Number);

    return [1, 2, 3, 4, 5, 6].every(
        id => completadas.includes(id)
    );
}

function obtenerTotalEstrellas() {
    const progreso = obtenerProgreso();
    const estrellas = progreso?.estrellas || {};

    return [1, 2, 3, 4, 5, 6].reduce((total, id) => {
        const cantidad = Number(estrellas[id] || 0);

        return total + Math.max(
            0,
            Math.min(
                3,
                Number.isFinite(cantidad)
                    ? Math.floor(cantidad)
                    : 0
            )
        );
    }, 0);
}

/* ESCENAS */

function mostrarEscena(escena) {
    [escenaCertificado, escenaDespedida, escenaFin].forEach(
        elemento => {
            if (!elemento) return;

            elemento.hidden = elemento !== escena;
        }
    );
}

/* ENTREGA DEL CERTIFICADO */

async function presentarCertificado() {
    const identificador = ++secuenciaActual;

    mostrarEscena(escenaCertificado);

    mensajeCertificado.textContent =
        "¡Lo logramos, tripulante!";

    btnContinuar.disabled = true;

    certificadoEstrellas.textContent =
        `${obtenerTotalEstrellas()} de 18 estrellas conseguidas`;

    iniciarMusica();

    await esperar(600);

    if (identificador !== secuenciaActual) return;

    reproducirEfecto(audios.certificado, 0.45);

    await esperar(850);

    if (identificador !== secuenciaActual) return;

    await reproducirNarracion(audios.certificado1);

    if (identificador !== secuenciaActual) return;

    await esperar(350);

    mensajeCertificado.textContent =
        "¡Este certificado es para ti!";

    await reproducirNarracion(audios.certificado2);

    if (identificador !== secuenciaActual) return;

    await esperar(400);

    btnContinuar.disabled = false;
}

/* DESPEDIDA */

async function iniciarDespedida() {
    if (despedidaIniciada) return;

    despedidaIniciada = true;

    const identificador = ++secuenciaActual;

    detenerNarracion();
    detenerEfectos();

    mostrarEscena(escenaDespedida);

    textoDespedida.textContent =
        "¡Nuestra aventura ha terminado!";

    iniciarMusica();

    await esperar(500);

    if (identificador !== secuenciaActual) return;

    await reproducirNarracion(audios.despedida1);

    if (identificador !== secuenciaActual) return;

    textoDespedida.textContent =
        "¡Hasta pronto, tripulante!";

    await esperar(350);

    await reproducirNarracion(audios.despedida2);

    if (identificador !== secuenciaActual) return;

    await esperar(450);

    await despegarNave(identificador);
}

/* DESPEGUE */

async function despegarNave(identificador) {
    if (!nave) {
        mostrarFinal();
        return;
    }

    textoDespedida.textContent =
        "¡Nos vemos en otra aventura!";

    nave.classList.add("encendida");
    nave.classList.add("temblando");

    reproducirEfecto(audios.despegue, 0.5);

    await esperar(movimientoReducido ? 200 : 1200);

    if (identificador !== secuenciaActual) return;

    nave.classList.remove("temblando");
    nave.classList.add("despegando");

    reproducirEfecto(audios.vuelo, 0.3);

    await esperar(movimientoReducido ? 600 : 5000);

    if (identificador !== secuenciaActual) return;

    nave.classList.remove("encendida");

    detenerEfectos();

    await esperar(400);

    if (identificador !== secuenciaActual) return;

    mostrarFinal();
}

/* PANTALLA FINAL */

function mostrarFinal() {
    detenerNarracion();
    detenerEfectos();

    mostrarEscena(escenaFin);

    if (musicaActual) {
        musicaActual.volume = 0.08;
    }

    btnVolver?.focus();
}

/* EVENTOS */

btnContinuar?.addEventListener("click", () => {
    iniciarDespedida();
});

btnGuardar?.addEventListener("click", () => {
    window.print();
});

btnVolver?.addEventListener("click", () => {
    window.location.href = RUTA_MAPA;
});

btnAudio?.addEventListener("click", () => {
    vozActivada = !vozActivada;

    if (!vozActivada) {
        detenerNarracion();
    }

    actualizarBotonAudio();
});

document.addEventListener("pointerdown", () => {
    iniciarMusica();
}, { once: true });

window.addEventListener("pagehide", () => {
    secuenciaActual++;
    detenerNarracion();
    detenerEfectos();
    detenerMusica();
});

/* INICIAR */

function iniciar() {
    crearEstrellas();
    actualizarBotonAudio();

    if (!aventuraCompletada()) {
        window.location.replace(RUTA_MAPA);
        return;
    }

    presentarCertificado();
}

iniciar();
