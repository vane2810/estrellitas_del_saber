
/* ESTRELLITAS DEL SABER - LA MOCHILA DE STARLY */

"use strict";

const $ = (id) => document.getElementById(id);

const NUMERO_MISION = 2;
const RUTA_STARLY = "../../img/personajes/starly/";
const RUTA_AUDIO = "../../audio/juegos/mision-2/";
const CLAVE_PROGRESO = "estrellitas_del_saber_progreso";
const CLAVE_CONFIGURACION = "estrellitas_del_saber_configuracion";
const ESPERA_PISTA = 9000;

const EXPRESIONES = {
    mate: ["starly_mate.webp", "Starly con lentes"],
    explorador: ["starly_explorador.webp", "Starly explorador"],
    asustado: ["starly_asustado2.webp", "Starly asustado"],
    llorando: ["starly_llorando.webp", "Starly llorando"]
};

const UTILES = [
    { id: "lapiz", icono: "✏️", nombre: "Lápiz" },
    { id: "cuaderno", icono: "📓", nombre: "Cuaderno" },
    { id: "libro", icono: "📚", nombre: "Libro" },
    { id: "regla", icono: "📏", nombre: "Regla" },
    { id: "colores", icono: "🖍️", nombre: "Colores" }
];

const OTROS = [
    { id: "balon", icono: "⚽", tipo: "juguete" },
    { id: "osito", icono: "🧸", tipo: "juguete" },
    { id: "raton", icono: "🐭", tipo: "sorpresa" }
];

const ESTRELLAS_EN = [2, 4, 5];

const ESCONDITES = [
    {
        tipo: "armario",
        nombre: "Armario",
        w: 120, h: 200, x: 9, b: 6, mx: 17, mb: 49,
        html: '<div class="a-cuerpo"></div><span class="ancla"></span><div class="a-puerta a-izq"></div><div class="a-puerta a-der"></div>'
    },
    {
        tipo: "cortina",
        nombre: "Ventana con cortina",
        w: 150, h: 125, x: 27, b: 50, mx: 50, mb: 49,
        html: '<div class="v-marco"></div><span class="ancla"></span><div class="v-cortina v-izq"></div><div class="v-cortina v-der"></div>'
    },
    {
        tipo: "cama",
        nombre: "Cama",
        w: 250, h: 115, x: 64, b: 24, mx: 83, mb: 49,
        html: '<div class="m-cabecera"></div><div class="m-pata m-p1"></div><div class="m-pata m-p2"></div><div class="m-colchon"></div><div class="m-cobija"></div><span class="ancla"></span><div class="m-almohada"></div>'
    },
    {
        tipo: "sillon",
        nombre: "Sillón",
        w: 190, h: 105, x: 28, b: 5, mx: 17, mb: 26,
        html: '<div class="o-respaldo"></div><div class="o-brazo o-izq"></div><div class="o-brazo o-der"></div><div class="o-asiento"></div><span class="ancla"></span><div class="o-cojin"></div>'
    },
    {
        tipo: "escritorio",
        nombre: "Escritorio con cajón",
        w: 170, h: 130, x: 45, b: 6, mx: 50, mb: 26,
        html: '<div class="e-pata e-izq"></div><div class="e-pata e-der"></div><div class="e-hueco"></div><span class="ancla"></span><div class="e-cajon"></div><div class="e-tablero"></div>'
    },
    {
        tipo: "cofre",
        nombre: "Cofre de juguetes",
        w: 140, h: 105, x: 76, b: 5, mx: 83, mb: 26,
        html: '<div class="c-cuerpo"></div><div class="c-boca"></div><span class="ancla"></span><div class="c-tapa"></div>'
    },
    {
        tipo: "alfombra",
        nombre: "Alfombra",
        w: 210, h: 62, x: 60, b: 3, mx: 17, mb: 3,
        html: '<div class="r-hueco"></div><span class="ancla"></span><div class="r-alfombra"></div>'
    },
    {
        tipo: "cesto",
        nombre: "Cesto de ropa",
        w: 90, h: 100, x: 16, b: 4, mx: 50, mb: 3,
        html: '<div class="s-cesto"></div><div class="s-boca"></div><span class="ancla"></span><div class="s-tela"></div>'
    }
];

const DIALOGOS = {
    historia: [
        "¡Mis útiles están listos!",
        "historia.mp3"
    ],
    inicio: [
        "¡Oh, no! ¡El ratón escondió mis útiles! ¡Vamos a buscarlos!",
        "inicio.mp3"
    ],
    lapiz: [
        "¡Un lápiz para escribir!",
        "lapiz.mp3"
    ],
    cuaderno: [
        "¡Un cuaderno para practicar!",
        "cuaderno.mp3"
    ],
    libro: [
        "¡Un libro para aprender!",
        "libro.mp3"
    ],
    regla: [
        "¡Una regla para medir!",
        "regla.mp3"
    ],
    colores: [
        "¡Colores para dibujar!",
        "colores.mp3"
    ],
    juguete: [
        "¡Un juguete! ¡Sigamos buscando!",
        "juguete.mp3"
    ],
    raton: [
        "¡Ahí está el ratoncito!",
        "raton.mp3"
    ],
    pista: [
        "¡Busca en los muebles!",
        "pista.mp3"
    ],
    final: [
        "¡Lo logramos! ¡Los útiles nos ayudan a aprender!",
        "final.mp3"
    ]
};

const escenario = $("mochila-escenario");
const mensaje = $("mochila-mensaje");
const botonAudio = $("mochila-audio");
const mochila = $("mochila");
const boca = $("mochila-boca");
const contenedorCosas = $("mochila-cosas");
const contenedorLista = $("mochila-lista");
const efectos = $("mochila-efectos");
const starly = $("mochila-starly");
const historia = $("mochila-historia");
const historiaUtiles = $("historia-utiles");
const historiaRaton = $("historia-raton");

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
    console.warn("Se utilizará la configuración predeterminada.");
}

let guardadas = 0;
let procesando = true;
let terminado = false;
let vacios = 0;
let reparto = {};
let introActiva = false;
let expresionActual = "";
let temporizadorStarly = null;
let temporizadorPista = null;
let ultimoDialogo = "historia";
let audioActual = null;
let resolverDialogo = null;
let contextoAudio = null;

function pausa(ms) {
    return new Promise((resolver) => setTimeout(resolver, ms));
}

/* STARLY */

function ajustarTamanoStarly() {
    if (!starly) return;

    const movil = window.innerWidth <= 600;

    starly.style.width = movil ? "85px" : "125px";
    starly.style.height = movil ? "95px" : "135px";
    starly.style.maxWidth = "none";
    starly.style.maxHeight = "none";
    starly.style.objectFit = "contain";
    starly.style.flexShrink = "0";
}

function cambiarStarly(nombre, brincar = false) {
    const expresion = EXPRESIONES[nombre];

    if (!expresion || !starly) return;

    expresionActual = nombre;

    const imagen = new Image();

    imagen.onload = () => {
        if (expresionActual === nombre) {
            starly.src = RUTA_STARLY + expresion[0];
            starly.alt = expresion[1];
            ajustarTamanoStarly();
        }
    };

    imagen.src = RUTA_STARLY + expresion[0];

    if (brincar) {
        starly.classList.remove("reaccion");
        void starly.offsetWidth;
        starly.classList.add("reaccion");

        setTimeout(() => {
            starly.classList.remove("reaccion");
        }, 600);
    }
}

function expresionPasajera(nombre, ms = 1800) {
    clearTimeout(temporizadorStarly);

    cambiarStarly(nombre, true);

    temporizadorStarly = setTimeout(() => {
        if (!terminado && !introActiva) {
            cambiarStarly("mate");
        }
    }, ms);
}

/* AUDIO */

function detenerAudio() {
    const pendiente = resolverDialogo;
    resolverDialogo = null;

    if (audioActual) {
        audioActual.pause();
        audioActual.currentTime = 0;
        audioActual = null;
    }

    botonAudio.classList.remove("reproduciendo");

    if (pendiente) pendiente();
}

function decir(nombre) {
    const dialogo = DIALOGOS[nombre];

    if (!dialogo) return Promise.resolve(false);

    ultimoDialogo = nombre;
    mensaje.textContent = dialogo[0];

    detenerAudio();

    if (!configuracion.voz) {
        return Promise.resolve(false);
    }

    return new Promise((resolver) => {
        const audio = new Audio(RUTA_AUDIO + dialogo[1]);
        audioActual = audio;

        let resuelto = false;

        const detener = () => terminar(false);
        resolverDialogo = detener;

        function terminar(resultado) {
            if (resuelto) return;

            resuelto = true;

            if (resolverDialogo === detener) {
                resolverDialogo = null;
            }

            if (audioActual === audio) {
                audioActual = null;
                botonAudio.classList.remove("reproduciendo");
            }

            resolver(resultado);
        }

        audio.addEventListener(
            "ended",
            () => terminar(true),
            { once: true }
        );

        audio.addEventListener(
            "error",
            () => terminar(false),
            { once: true }
        );

        audio.play().then(() => {
            if (audioActual === audio && !audio.paused) {
                botonAudio.classList.add("reproduciendo");
            }
        }).catch(() => terminar(false));
    });
}

function dialogoConLimite(nombre, limite = 6000, minimo = 0) {
    return Promise.all([
        Promise.race([
            decir(nombre),
            pausa(limite)
        ]),
        pausa(minimo)
    ]);
}

/* SONIDOS */

function obtenerContextoAudio() {
    if (!configuracion.efectos) return null;

    try {
        const Contexto = window.AudioContext || window.webkitAudioContext;

        if (!Contexto) return null;

        if (!contextoAudio) {
            contextoAudio = new Contexto();
        }

        if (contextoAudio.state === "suspended") {
            contextoAudio.resume().catch(() => {});
        }

        return contextoAudio;
    } catch (error) {
        return null;
    }
}

function tono(frecuencia, duracion = 0.2) {
    const ctx = obtenerContextoAudio();
    if (!ctx) return;

    const oscilador = ctx.createOscillator();
    const ganancia = ctx.createGain();
    const ahora = ctx.currentTime;

    oscilador.type = "sine";
    oscilador.frequency.value = frecuencia;

    ganancia.gain.setValueAtTime(0.045, ahora);
    ganancia.gain.exponentialRampToValueAtTime(
        0.001,
        ahora + duracion
    );

    oscilador.connect(ganancia);
    ganancia.connect(ctx.destination);

    oscilador.start(ahora);
    oscilador.stop(ahora + duracion);
}

function deslizar(
    desde,
    hasta,
    duracion,
    tipo = "sine",
    volumen = 0.05,
    retraso = 0
) {
    const ctx = obtenerContextoAudio();
    if (!ctx) return;

    const inicio = ctx.currentTime + retraso;
    const oscilador = ctx.createOscillator();
    const ganancia = ctx.createGain();

    oscilador.type = tipo;

    oscilador.frequency.setValueAtTime(desde, inicio);
    oscilador.frequency.exponentialRampToValueAtTime(
        hasta,
        inicio + duracion
    );

    ganancia.gain.setValueAtTime(volumen, inicio);
    ganancia.gain.exponentialRampToValueAtTime(
        0.001,
        inicio + duracion
    );

    oscilador.connect(ganancia);
    ganancia.connect(ctx.destination);

    oscilador.start(inicio);
    oscilador.stop(inicio + duracion);
}

function ruido(duracion, desde, hasta, volumen = 0.06) {
    const ctx = obtenerContextoAudio();
    if (!ctx) return;

    const muestras = Math.floor(ctx.sampleRate * duracion);
    const buffer = ctx.createBuffer(1, muestras, ctx.sampleRate);
    const datos = buffer.getChannelData(0);

    for (let i = 0; i < muestras; i++) {
        datos[i] = Math.random() * 2 - 1;
    }

    const fuente = ctx.createBufferSource();
    const filtro = ctx.createBiquadFilter();
    const ganancia = ctx.createGain();
    const ahora = ctx.currentTime;

    fuente.buffer = buffer;
    filtro.type = "bandpass";
    filtro.Q.value = 1.2;

    filtro.frequency.setValueAtTime(desde, ahora);
    filtro.frequency.exponentialRampToValueAtTime(
        hasta,
        ahora + duracion
    );

    ganancia.gain.setValueAtTime(0.001, ahora);
    ganancia.gain.exponentialRampToValueAtTime(
        volumen,
        ahora + duracion * 0.3
    );
    ganancia.gain.exponentialRampToValueAtTime(
        0.001,
        ahora + duracion
    );

    fuente.connect(filtro);
    filtro.connect(ganancia);
    ganancia.connect(ctx.destination);

    fuente.start();
    fuente.stop(ahora + duracion);
}

function sonidoAcierto() {
    tono(587, 0.14);
    setTimeout(() => tono(740, 0.14), 110);
    setTimeout(() => tono(988, 0.22), 220);
}

function sonidoAbrir(tipo) {
    const madera = ["armario", "cofre", "escritorio"];

    if (madera.includes(tipo)) {
        deslizar(130, 210, 0.32, "sawtooth", 0.03);
        deslizar(170, 120, 0.2, "sawtooth", 0.02, 0.18);
    } else {
        ruido(0.4, 600, 2200, 0.07);
    }
}

function sonidoAparece() {
    deslizar(500, 1000, 0.16);
}

function sonidoJuguete() {
    deslizar(260, 620, 0.14, "sine", 0.06);
    deslizar(620, 300, 0.2, "sine", 0.05, 0.14);
}

function sonidoRaton() {
    deslizar(1700, 2600, 0.09, "sine", 0.04);
    deslizar(2500, 1800, 0.1, "sine", 0.04, 0.12);
    deslizar(1800, 2800, 0.09, "sine", 0.04, 0.3);
}

function sonidoCierre() {
    for (let i = 0; i < 9; i++) {
        deslizar(
            900 + i * 70,
            700 + i * 70,
            0.03,
            "square",
            0.015,
            i * 0.045
        );
    }
}

/* ESTRELLAS Y EFECTOS */

function ganarEstrella() {
    const numero = ESTRELLAS_EN.indexOf(guardadas) + 1;

    if (numero === 0) return;

    const estrella = document.querySelectorAll(
        ".mochila-estrella"
    )[numero - 1];

    if (!estrella) return;

    estrella.textContent = "★";
    estrella.classList.add("ganada");

    $("mochila-total").textContent = numero;

    tono(880);
}

function crearDestellos(zona) {
    const caja = zona.getBoundingClientRect();
    const base = escenario.getBoundingClientRect();

    for (let i = 0; i < 10; i++) {
        const destello = document.createElement("span");

        destello.className = "mochila-destello";
        destello.textContent = "✦";

        destello.style.left =
            caja.left - base.left +
            Math.random() * caja.width + "px";

        destello.style.top =
            caja.top - base.top +
            Math.random() * caja.height + "px";

        efectos.appendChild(destello);

        setTimeout(() => destello.remove(), 1000);
    }
}

/* PREPARAR HABITACIÓN */

function barajar(lista) {
    const copia = lista.slice();

    for (let i = copia.length - 1; i > 0; i--) {
        const k = Math.floor(Math.random() * (i + 1));

        [copia[i], copia[k]] = [copia[k], copia[i]];
    }

    return copia;
}

function prepararLista() {
    contenedorLista.innerHTML = "";

    UTILES.forEach((util) => {
        const casilla = document.createElement("div");

        casilla.className = "lista-casilla";
        casilla.dataset.id = util.id;

        casilla.innerHTML = `
            <span class="lista-icono" aria-hidden="true">
                ${util.icono}
            </span>
        `;

        contenedorLista.appendChild(casilla);
    });
}

function prepararEscondites() {
    contenedorCosas.innerHTML = "";
    reparto = {};

    const contenidos = barajar([
        ...UTILES.map((util) => ({
            ...util,
            tipo: "util"
        })),
        ...OTROS
    ]);

    ESCONDITES.forEach((sitio, indice) => {
        const boton = document.createElement("button");

        boton.type = "button";
        boton.className = `escondite t-${sitio.tipo}`;
        boton.dataset.indice = indice;

        boton.setAttribute(
            "aria-label",
            `${sitio.nombre}. Toca para abrir`
        );

        boton.style.setProperty("--w", sitio.w);
        boton.style.setProperty("--h", sitio.h);
        boton.style.setProperty("--m", Math.max(sitio.w, sitio.h));
        boton.style.setProperty("--x", sitio.x);
        boton.style.setProperty("--b", sitio.b);
        boton.style.setProperty("--mx", sitio.mx);
        boton.style.setProperty("--mb", sitio.mb);

        boton.innerHTML = `<div class="arte">${sitio.html}</div>`;

        reparto[indice] = contenidos[indice];

        contenedorCosas.appendChild(boton);
    });
}

/* PISTAS */

function quitarPistas() {
    clearTimeout(temporizadorPista);

    document.querySelectorAll(".escondite.pista").forEach((sitio) => {
        sitio.classList.remove("pista");
    });
}

function programarPista() {
    clearTimeout(temporizadorPista);

    if (terminado || introActiva) return;

    temporizadorPista = setTimeout(
        mostrarPista,
        ESPERA_PISTA
    );
}

function mostrarPista() {
    if (terminado || introActiva) return;

    if (procesando) {
        programarPista();
        return;
    }

    const cerrados = document.querySelectorAll(
        ".escondite:not(.abierto)"
    );

    if (!cerrados.length) return;

    cerrados.forEach((sitio) => {
        sitio.classList.add("pista");
    });

    decir("pista");
}

/* EXPLORAR MUEBLES */

function ponerHallazgo(sitio, contenido) {
    const ancla = sitio.querySelector(".ancla");
    const caja = (ancla || sitio).getBoundingClientRect();
    const base = escenario.getBoundingClientRect();

    const cosa = document.createElement("div");

    cosa.className = "hallazgo";
    cosa.textContent = contenido.icono;

    cosa.style.left = caja.left - base.left + "px";
    cosa.style.top = caja.top - base.top + "px";

    efectos.appendChild(cosa);

    return cosa;
}

async function abrirEscondite(sitio) {
    if (
        procesando ||
        terminado ||
        introActiva ||
        sitio.classList.contains("abierto")
    ) {
        return;
    }

    procesando = true;
    quitarPistas();

    const indice = Number(sitio.dataset.indice);
    const contenido = reparto[indice];
    const mueble = ESCONDITES[indice];

    if (!contenido || !mueble) {
        procesando = false;
        return;
    }

    sitio.classList.add("abierto");
    sitio.setAttribute(
        "aria-label",
        `${mueble.nombre}. Abierto`
    );

    sonidoAbrir(mueble.tipo);

    await pausa(420);

    const cosa = ponerHallazgo(sitio, contenido);

    sonidoAparece();

    if (contenido.tipo === "util") {
        await pausa(700);
        await guardarUtil(cosa, contenido);
        return;
    }

    vacios++;

    if (contenido.tipo === "sorpresa") {
        cosa.classList.add("travieso");
        sonidoRaton();

        expresionPasajera("asustado", 2200);
        decir("raton");
    } else {
        sonidoJuguete();
        decir("juguete");
    }

    await pausa(900);

    procesando = false;

    await pausa(900);

    cosa.classList.add("se-va");

    setTimeout(() => {
        cosa.remove();
    }, 650);

    if (vacios >= 2) {
        vacios = 0;

        setTimeout(() => {
            if (!terminado && !procesando) {
                mostrarPista();
            }
        }, 2600);
    } else {
        programarPista();
    }
}

/* GUARDAR ÚTILES */

async function guardarUtil(cosa, util) {
    vacios = 0;

    const origen = cosa.getBoundingClientRect();
    const destino = boca.getBoundingClientRect();

    const dx =
        destino.left + destino.width / 2 -
        origen.left - origen.width / 2;

    const dy =
        destino.top + destino.height / 2 -
        origen.top - origen.height / 2;

    cosa.style.setProperty("--dx", dx + "px");
    cosa.style.setProperty("--dy", dy + "px");

    cosa.classList.add("volando");

    tono(523, 0.1);

    await pausa(780);

    cosa.remove();

    guardadas++;

    mochila.classList.remove("recibe");
    void mochila.offsetWidth;
    mochila.classList.add("recibe");

    const casilla = contenedorLista.querySelector(
        `[data-id="${util.id}"]`
    );

    if (casilla) {
        casilla.classList.add("lista-lista");
    }

    sonidoAcierto();
    crearDestellos(mochila);
    ganarEstrella();

    if (guardadas >= UTILES.length) {
        await finalizarMision();
        return;
    }

    procesando = false;

    cambiarStarly("mate");
    decir(util.id);

    programarPista();
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

        if (
            !progreso.completadas
                .map(Number)
                .includes(NUMERO_MISION)
        ) {
            progreso.completadas.push(NUMERO_MISION);
        }

        if (
            !progreso.estrellas ||
            typeof progreso.estrellas !== "object"
        ) {
            progreso.estrellas = {};
        }

        progreso.estrellas[NUMERO_MISION] = Math.max(
            Number(progreso.estrellas[NUMERO_MISION]) || 0,
            3
        );

        localStorage.setItem(
            CLAVE_PROGRESO,
            JSON.stringify(progreso)
        );
    } catch (error) {
        console.warn("No se pudo guardar el progreso.");
    }
}

/* FINALIZAR MISIÓN */

async function finalizarMision() {
    terminado = true;
    procesando = true;

    quitarPistas();
    clearTimeout(temporizadorStarly);

    await pausa(500);

    mochila.classList.add("llena");
    sonidoCierre();

    await pausa(600);

    mochila.classList.add("feliz");

    cambiarStarly("explorador", true);

    sonidoAcierto();
    crearDestellos(mochila);

    const caja = mochila.getBoundingClientRect();
    const base = escenario.getBoundingClientRect();

    const raton = document.createElement("div");

    raton.className = "hallazgo travieso";
    raton.textContent = "🐭";

    raton.style.left =
        caja.left - base.left - 34 + "px";

    raton.style.top =
        caja.bottom - base.top - 30 + "px";

    efectos.appendChild(raton);

    sonidoRaton();
    guardarProgreso();

    await dialogoConLimite("final", 6500, 2000);

    detenerAudio();

    if (typeof window.mostrarCelebracion === "function") {
        window.mostrarCelebracion({
            mision: NUMERO_MISION,
            estrellas: 3,
            titulo: "¡Misión completada!",
            mensaje: "¡Los útiles nos ayudan a aprender!",
            audio: RUTA_AUDIO + "victoria.mp3",
            destino: "../mapa.html"
        });
    } else {
        mensaje.textContent =
            "¡Misión completada! ¡Ganaste tres estrellas!";
    }
}

/* MINI HISTORIA DEL RATONCITO */

function limpiarHistoria() {
    historia.getAnimations({ subtree: true }).forEach((animacion) => {
        animacion.cancel();
    });

    historia.hidden = true;

    historiaRaton.classList.remove("corre", "lleva");
    historiaRaton.style.opacity = "0";
}

function terminarIntro() {
    if (!introActiva) return;

    introActiva = false;

    limpiarHistoria();

    procesando = false;

    cambiarStarly("mate", true);

    mensaje.textContent =
        "¡Toca los muebles para encontrar mis útiles!";
}

function saltarIntro() {
    if (!introActiva) return;

    terminarIntro();

    decir("inicio");
    programarPista();
}

async function contarHistoria() {
    introActiva = true;
    procesando = true;

    cambiarStarly("mate");

    historiaUtiles.innerHTML = UTILES
        .map((util) => {
            return `<span class="historia-util">${util.icono}</span>`;
        })
        .join("");

    historiaRaton.classList.remove("corre", "lleva");
    historiaRaton.style.opacity = "0";

    historia.hidden = false;

    // STARLY PRESENTA SUS ÚTILES

    await dialogoConLimite("historia", 3500, 1500);

    if (!introActiva) return;

    // APARECE EL RATONCITO

    const base = escenario.getBoundingClientRect();
    const piezas = Array.from(historiaUtiles.children);
    const caja = historiaUtiles.getBoundingClientRect();

    const anchoRaton = historiaRaton.offsetWidth || 60;

    const puntoX =
        caja.left - base.left +
        caja.width / 2 -
        anchoRaton / 2;

    historiaRaton.style.opacity = "1";
    historiaRaton.classList.add("corre");

    sonidoRaton();

    historiaRaton.animate(
        [
            {
                transform: `translateX(${base.width + 30}px)`
            },
            {
                transform: `translateX(${puntoX}px)`
            }
        ],
        {
            duration: 1100,
            easing: "ease-out",
            fill: "forwards"
        }
    );

    await pausa(1100);

    if (!introActiva) return;

    historiaRaton.classList.remove("corre");

    // EL RATONCITO RECOGE LOS ÚTILES

    const cuerpo = historiaRaton.getBoundingClientRect();

    piezas.forEach((pieza, indice) => {
        const origen = pieza.getBoundingClientRect();

        const dx =
            cuerpo.left + cuerpo.width / 2 -
            origen.left - origen.width / 2;

        const dy =
            cuerpo.top + cuerpo.height / 2 -
            origen.top - origen.height / 2;

        pieza.animate(
            [
                {
                    transform: "translate(0, 0) scale(1)",
                    opacity: 1
                },
                {
                    transform: `translate(${dx}px, ${dy}px) scale(0.25)`,
                    opacity: 0
                }
            ],
            {
                duration: 450,
                delay: indice * 90,
                easing: "ease-in",
                fill: "forwards"
            }
        );

        setTimeout(() => {
            if (introActiva) {
                tono(700 + indice * 120, 0.08);
            }
        }, indice * 90);
    });

    await pausa(450 + piezas.length * 90);

    if (!introActiva) return;

    // STARLY LLORA CUANDO EL RATÓN HUYE CON LOS ÚTILES

    cambiarStarly("llorando", true);

    historiaRaton.classList.add("lleva", "corre");

    const huida = historiaRaton.animate(
        [
            {
                transform: `translateX(${puntoX}px)`
            },
            {
                transform: `translateX(${-anchoRaton - 40}px)`
            }
        ],
        {
            duration: 1600,
            easing: "ease-in",
            fill: "forwards"
        }
    );

    sonidoRaton();

    await Promise.all([
        dialogoConLimite("inicio", 5000, 1700),
        huida.finished.catch(() => {})
    ]);

    if (!introActiva) return;

    // STARLY MATE REGRESA PARA LA EXPLORACIÓN

    terminarIntro();

    programarPista();
}

/* EVENTOS */

contenedorCosas.addEventListener("click", (evento) => {
    const sitio = evento.target.closest(".escondite");

    if (sitio) {
        abrirEscondite(sitio);
    }
});

botonAudio.addEventListener("click", () => {
    decir(ultimoDialogo);
});

escenario.addEventListener("pointerdown", (evento) => {
    if (evento.target.closest("#mochila-audio")) return;

    if (introActiva) {
        saltarIntro();
    }
});

window.addEventListener("resize", ajustarTamanoStarly);

window.addEventListener("pagehide", () => {
    clearTimeout(temporizadorPista);
    clearTimeout(temporizadorStarly);
    detenerAudio();
});

/* INICIAR JUEGO */

async function iniciarJuego() {
    ajustarTamanoStarly();

    prepararLista();
    prepararEscondites();

    cambiarStarly("mate");

    await contarHistoria();
}

iniciarJuego();
