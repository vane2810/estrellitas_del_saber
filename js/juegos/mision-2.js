
/* ESTRELLITAS DEL SABER - MISIÓN 2: LA MOCHILA DE STARLY */

"use strict";

const $ = (id) => document.getElementById(id);

const NUMERO_MISION = 2;
const RUTA_STARLY = "../../img/personajes/starly/";
const RUTA_AUDIO = "../../audio/juegos/mision-2/";
const CLAVE_PROGRESO = "estrellitas_del_saber_progreso";
const CLAVE_CONFIGURACION = "estrellitas_del_saber_configuracion";
const ESPERA_PISTA = 8000;

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

/* DIÁLOGOS */

const DIALOGOS = {
    historia: [
        "¡Para ir a la escuela necesitamos nuestros útiles! ¡Ya tengo los míos listos!",
        "historia.mp3"
    ],
    inicio: [
        "¡Oh, no! ¡El ratón escondió mis útiles! ¡Vamos a buscarlos!",
        "inicio.mp3"
    ],
    lapiz: ["¡Un lápiz para escribir!", "lapiz.mp3"],
    cuaderno: ["¡Un cuaderno para practicar!", "cuaderno.mp3"],
    libro: ["¡Un libro para aprender!", "libro.mp3"],
    regla: ["¡Una regla para medir!", "regla.mp3"],
    colores: ["¡Colores para dibujar!", "colores.mp3"],
    juguete: ["Eso no es un útil escolar", "juguete.mp3"],
    raton: ["¡Ahí está el ratoncito!", "ratoncito.mp3"],
    pista: ["¡Busca en los muebles!", "pista.mp3"],
    final: ["¡Lo logramos! ¡Nuestra mochila está lista!", "final.mp3"]
};

/* EFECTOS MP3 */

const ARCHIVOS_EFECTOS = {
    abrir: "abrir-mueble.mp3",
    aparece: "objeto-aparece.mp3",
    juguete: "juguetee.mp3",
    raton: "raton.mp3",
    pasos: "pasos-raton.mp3",
    robo: "robo-utiles.mp3",
    encontrado: "util-encontrado.mp3",
    guardar: "guardar-mochila.mp3"
};

const VOLUMEN_EFECTOS = {
    abrir: 0.7,
    aparece: 0.8,
    juguete: 0.75,
    raton: 1,
    pasos: 0.8,
    robo: 0.85,
    encontrado: 0.85,
    guardar: 0.8
};

/* ELEMENTOS */

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

/* CONFIGURACIÓN */

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

/* ESTADO */

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
let sesionIntroduccion = 0;
let pistaActiva = false;

const efectosActivos = new Set();

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

/* VOCES */

function detenerAudio() {
    const audio = audioActual;
    const pendiente = resolverDialogo;

    audioActual = null;
    resolverDialogo = null;

    if (audio) {
        audio.pause();

        try {
            audio.currentTime = 0;
        } catch (error) {
            console.warn("No se pudo reiniciar la voz.");
        }
    }

    if (botonAudio) {
        botonAudio.classList.remove("reproduciendo");
    }

    if (pendiente) pendiente();
}

function decir(nombre) {
    const dialogo = DIALOGOS[nombre];

    if (!dialogo) return Promise.resolve(false);

    detenerAudio();

    ultimoDialogo = nombre;
    mensaje.textContent = dialogo[0];

    if (!configuracion.voz) {
        return Promise.resolve(false);
    }

    return new Promise((resolver) => {
        const audio = new Audio(RUTA_AUDIO + dialogo[1]);
        let resuelto = false;

        audioActual = audio;
        audio.volume = 1;

        function terminar(resultado) {
            if (resuelto) return;

            resuelto = true;

            if (audioActual === audio) {
                audioActual = null;
                resolverDialogo = null;

                if (botonAudio) {
                    botonAudio.classList.remove("reproduciendo");
                }
            }

            resolver(resultado);
        }

        resolverDialogo = () => terminar(false);

        audio.addEventListener(
            "ended",
            () => terminar(true),
            { once: true }
        );

        audio.addEventListener(
            "error",
            () => {
                console.warn("No se encontró la voz:", dialogo[1]);
                terminar(false);
            },
            { once: true }
        );

        audio.play()
            .then(() => {
                if (audioActual === audio && !audio.paused) {
                    botonAudio.classList.add("reproduciendo");
                }
            })
            .catch((error) => {
                console.warn("No se pudo reproducir:", dialogo[1], error);
                terminar(false);
            });
    });
}

function dialogoConMinimo(nombre, minimo = 0) {
    return Promise.all([
        decir(nombre),
        pausa(minimo)
    ]);
}

/* EFECTOS */

function reproducirEfecto(nombre) {
    const archivo = ARCHIVOS_EFECTOS[nombre];

    if (!configuracion.efectos || !archivo) {
        return Promise.resolve(false);
    }

    const audio = new Audio(RUTA_AUDIO + archivo);
    audio.preload = "auto";
    audio.volume = VOLUMEN_EFECTOS[nombre] ?? 0.7;

    efectosActivos.add(audio);

    return new Promise((resolver) => {
        let resuelto = false;

        function finalizar(resultado) {
            if (resuelto) return;

            resuelto = true;
            efectosActivos.delete(audio);
            resolver(resultado);
        }

        audio.addEventListener(
            "ended",
            () => finalizar(true),
            { once: true }
        );

        audio.addEventListener(
            "error",
            () => {
                console.warn("No se encontró el efecto:", archivo);
                finalizar(false);
            },
            { once: true }
        );

        audio.play().catch((error) => {
            console.warn("No se pudo reproducir:", archivo, error);
            finalizar(false);
        });
    });
}

function detenerEfectos() {
    efectosActivos.forEach((audio) => {
        audio.pause();

        try {
            audio.currentTime = 0;
        } catch (error) {
            console.warn("No se pudo reiniciar el efecto.");
        }

        audio.dispatchEvent(new Event("ended"));
    });

    efectosActivos.clear();
}

function sonidoAcierto() {
    return reproducirEfecto("encontrado");
}

function sonidoAbrir() {
    return reproducirEfecto("abrir");
}

function sonidoAparece() {
    return reproducirEfecto("aparece");
}

function sonidoJuguete() {
    return reproducirEfecto("juguete");
}

function sonidoRaton() {
    return reproducirEfecto("raton");
}

function sonidoCierre() {
    return reproducirEfecto("guardar");
}

/* ESTRELLAS */

function ganarEstrella() {
    const numero = ESTRELLAS_EN.indexOf(guardadas) + 1;

    if (numero === 0) return;

    const estrella = document.querySelectorAll(
        ".mochila-estrella"
    )[numero - 1];

    if (!estrella) return;

    estrella.textContent = "⭐";
    estrella.classList.add("ganada");

    const total = $("mochila-total");

    if (total) {
        total.textContent = numero;
    }
}

/* DESTELLOS */

function crearDestellos(zona) {
    const caja = zona.getBoundingClientRect();
    const base = escenario.getBoundingClientRect();

    for (let i = 0; i < 12; i++) {
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

function crearBrilloHallazgo(cosa) {
    const brillo = document.createElement("span");

    brillo.className = "mochila-brillo-hallazgo";
    brillo.textContent = "✦";

    brillo.style.left = cosa.style.left;
    brillo.style.top = cosa.style.top;

    efectos.appendChild(brillo);

    crearDestellos(cosa);

    setTimeout(() => {
        brillo.remove();
    }, 850);
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

function bloquearMuebles() {
    document.querySelectorAll(".escondite").forEach((sitio) => {
        sitio.disabled = true;
        sitio.setAttribute("aria-disabled", "true");
    });
}

function habilitarMuebles() {
    document.querySelectorAll(".escondite").forEach((sitio) => {
        if (!sitio.classList.contains("abierto")) {
            sitio.disabled = false;
            sitio.removeAttribute("aria-disabled");
        }
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
        boton.disabled = true;

        boton.setAttribute(
            "aria-label",
            `${sitio.nombre}. Toca para abrir`
        );

        boton.setAttribute("aria-disabled", "true");

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
    temporizadorPista = null;

    document.querySelectorAll(".escondite").forEach((sitio) => {
        sitio.classList.remove("pista", "mochila-sacudir");
    });
}

function programarPista() {
    clearTimeout(temporizadorPista);

    if (
        terminado ||
        introActiva ||
        procesando ||
        pistaActiva
    ) {
        return;
    }

    temporizadorPista = setTimeout(
        mostrarPista,
        ESPERA_PISTA
    );
}

async function mostrarPista() {
    if (
        terminado ||
        introActiva ||
        procesando ||
        pistaActiva
    ) {
        return;
    }

    if (audioActual) {
        programarPista();
        return;
    }

    const cerrados = Array.from(
        document.querySelectorAll(
            ".escondite:not(.abierto)"
        )
    );

    if (!cerrados.length) return;

    pistaActiva = true;

    cerrados.forEach((sitio) => {
        sitio.classList.remove("mochila-sacudir");
        void sitio.offsetWidth;
        sitio.classList.add("pista", "mochila-sacudir");
    });

    await decir("pista");

    await pausa(250);

    cerrados.forEach((sitio) => {
        sitio.classList.remove("mochila-sacudir");
    });

    pistaActiva = false;

    if (!terminado && !procesando) {
        programarPista();
    }
}

/* HALLAZGOS */

function ponerHallazgo(sitio, contenido) {
    const ancla = sitio.querySelector(".ancla");
    const caja = (ancla || sitio).getBoundingClientRect();
    const base = escenario.getBoundingClientRect();

    const cosa = document.createElement("div");

    cosa.className = "hallazgo mochila-hallazgo-aparece";
    cosa.textContent = contenido.icono;

    cosa.style.left = caja.left - base.left + "px";
    cosa.style.top = caja.top - base.top + "px";

    efectos.appendChild(cosa);

    crearBrilloHallazgo(cosa);

    return cosa;
}

/* EXPLORAR MUEBLES */

async function abrirEscondite(sitio) {
    if (
        procesando ||
        terminado ||
        introActiva ||
        sitio.disabled ||
        sitio.classList.contains("abierto")
    ) {
        return;
    }

    procesando = true;
    pistaActiva = false;
    quitarPistas();

    const indice = Number(sitio.dataset.indice);
    const contenido = reparto[indice];
    const mueble = ESCONDITES[indice];

    if (!contenido || !mueble) {
        procesando = false;
        programarPista();
        return;
    }

    detenerAudio();

    sitio.classList.add("abierto");
    sitio.disabled = true;

    sitio.setAttribute(
        "aria-label",
        `${mueble.nombre}. Abierto`
    );

    sonidoAbrir();

    await pausa(420);

    const cosa = ponerHallazgo(sitio, contenido);

    sonidoAparece();

    // Dejar que el niño observe el objeto y su brillo.
    await pausa(950);

    if (contenido.tipo === "util") {
        await guardarUtil(cosa, contenido);
        return;
    }

    vacios++;

    let vozHallazgo;

    if (contenido.tipo === "sorpresa") {
        cosa.classList.add("travieso");

        // Primero el chirrido, después habla Starly.
        await sonidoRaton();

        expresionPasajera("asustado", 2200);
        vozHallazgo = decir("raton");
    } else {
        sonidoJuguete();
        vozHallazgo = decir("juguete");
    }

    await vozHallazgo;

    if (terminado) return;

    cosa.classList.add("se-va");

    setTimeout(() => {
        cosa.remove();
    }, 650);

    procesando = false;

    if (vacios >= 2) {
        vacios = 0;

        temporizadorPista = setTimeout(() => {
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

    cosa.classList.remove("mochila-hallazgo-aparece");
    cosa.classList.add("volando");

    reproducirEfecto("guardar");

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

    cambiarStarly("mate");

    // REPRODUCIR SIEMPRE EL AUDIO DEL ÚTIL ENCONTRADO
    await decir(util.id);

    // FINALIZAR SOLAMENTE DESPUÉS DEL AUDIO DEL ÚLTIMO ÚTIL
    if (guardadas >= UTILES.length) {
        await pausa(400);
        await finalizarMision();
        return;
    }

    procesando = false;
    programarPista();
}


/* GUARDAR PROGRESO */

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

    await sonidoRaton();

    guardarProgreso();

    await dialogoConMinimo("final", 1500);

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

/* HISTORIA DEL RATONCITO */

function limpiarHistoria() {
    historia.getAnimations({ subtree: true }).forEach((animacion) => {
        animacion.cancel();
    });

    historia.hidden = true;

    historiaRaton.classList.remove("corre", "lleva");
    historiaRaton.style.opacity = "0";
}

async function terminarIntro() {
    if (!introActiva) return;

    introActiva = false;
    sesionIntroduccion++;

    limpiarHistoria();

    cambiarStarly("mate", true);

    // Los muebles siguen bloqueados mientras Starly habla.
    procesando = true;

    const cerrados = document.querySelectorAll(
        ".escondite:not(.abierto)"
    );

    cerrados.forEach((sitio) => {
        sitio.classList.remove("mochila-sacudir");
        void sitio.offsetWidth;
        sitio.classList.add("mochila-sacudir");
    });

    await decir("pista");

    cerrados.forEach((sitio) => {
        sitio.classList.remove("mochila-sacudir");
    });

    // Ahora el niño puede comenzar a buscar.
    procesando = false;
    habilitarMuebles();
    programarPista();
}

async function contarHistoria() {
    introActiva = true;
    procesando = true;

    bloquearMuebles();

    const sesion = ++sesionIntroduccion;

    cambiarStarly("mate");

    historiaUtiles.innerHTML = UTILES
        .map((util) => {
            return `<span class="historia-util">${util.icono}</span>`;
        })
        .join("");

    historiaRaton.classList.remove("corre", "lleva");
    historiaRaton.style.opacity = "0";

    historia.hidden = false;

    // STARLY PRESENTA LOS ÚTILES

    await dialogoConMinimo("historia", 1500);

    if (!introActiva || sesion !== sesionIntroduccion) return;

    // APARECE EL RATONCITO

    const base = escenario.getBoundingClientRect();
    const piezas = Array.from(historiaUtiles.children);
    const caja = historiaUtiles.getBoundingClientRect();

    const anchoRaton = historiaRaton.offsetWidth || 60;

    const puntoX =
        caja.left - base.left +
        caja.width / 2 -
        anchoRaton / 2;

    // Starly se sorprende al ver al ratoncito.
    cambiarStarly("asustado", true);

    historiaRaton.style.opacity = "1";
    historiaRaton.classList.add("corre");

    // El ratoncito aparece con su chirrido.
    await sonidoRaton();

    if (!introActiva || sesion !== sesionIntroduccion) return;

    reproducirEfecto("pasos");

    const llegada = historiaRaton.animate(
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

    await llegada.finished.catch(() => { });

    if (!introActiva || sesion !== sesionIntroduccion) return;

    historiaRaton.classList.remove("corre");

    // EL RATONCITO ROBA LOS ÚTILES

    reproducirEfecto("robo");

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
    });

    await pausa(450 + piezas.length * 90);

    if (!introActiva || sesion !== sesionIntroduccion) return;

    // EL RATONCITO HUYE

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

    reproducirEfecto("pasos");

    await Promise.all([
        dialogoConMinimo("inicio", 1700),
        huida.finished.catch(() => { })
    ]);

    if (!introActiva || sesion !== sesionIntroduccion) return;

    await terminarIntro();
}

/* EVENTOS */

contenedorCosas.addEventListener("click", (evento) => {
    const sitio = evento.target.closest(".escondite");

    if (sitio) {
        abrirEscondite(sitio);
    }
});

botonAudio.addEventListener("click", () => {
    if (introActiva || terminado || procesando) return;

    quitarPistas();

    decir(ultimoDialogo).then(() => {
        if (!terminado && !procesando) {
            programarPista();
        }
    });
});

window.addEventListener("resize", ajustarTamanoStarly);

window.addEventListener("pagehide", () => {
    clearTimeout(temporizadorPista);
    clearTimeout(temporizadorStarly);

    detenerAudio();
    detenerEfectos();
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
