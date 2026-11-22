
/* ==========================================
   ESTRELLITAS DEL SABER
   MAPA DE MISIONES
========================================== */

/* ELEMENTOS */

const botonesMisiones = document.querySelectorAll(".mision");
const totalEstrellas = document.getElementById("total-estrellas");

const mapaAventura = document.getElementById("mapa-aventura");
const mapaDesplazamiento = document.getElementById("mapa-desplazamiento");
const starlyPosicion = document.getElementById("starly-posicion");

const btnConfiguracion = document.getElementById("btn-configuracion");
const modalConfiguracion = document.getElementById("modal-configuracion");
const configuracionCerrar = document.getElementById("configuracion-cerrar");
const configuracionListo = document.getElementById("configuracion-listo");

const configMusica = document.getElementById("config-musica");
const configEfectos = document.getElementById("config-efectos");
const configVoz = document.getElementById("config-voz");

const modalPremio = document.getElementById("modal-premio");
const premioMedalla = document.getElementById("premio-medalla");
const premioTitulo = document.getElementById("premio-titulo");
const premioDescripcion = document.getElementById("premio-descripcion");
const premioContinuar = document.getElementById("premio-continuar");

/* MISIONES */

const misiones = [
    {
        id: 1,
        nombre: "¡Vamos a la escuela!",
        titulo: "¡Vamos a la escuela!",
        descripcion: "Conozcamos nuestra escuela, un lugar para aprender.",
        icono: "🏫",
        ruta: "juegos/mision-1.html",
        audio: "../audio/narraciones/mision_1.mp3"
    },
    {
        id: 2,
        nombre: "¡Mi mochila!",
        titulo: "¡La mochila de Starly!",
        descripcion: "Ayudemos a Starly a encontrar sus útiles escolares.",
        icono: "🎒",
        ruta: "juegos/mision-2.html",
        audio: "../audio/narraciones/mision_2.mp3"
    },
    {
        id: 3,
        nombre: "¡Para todos!",
        titulo: "¡La escuela es para todos!",
        descripcion: "Todos los niños tenemos derecho a estudiar.",
        icono: "👧",
        ruta: "juegos/mision-3.html",
        audio: "../audio/narraciones/mision_3.mp3"
    },
    {
        id: 4,
        nombre: "¡A jugar!",
        titulo: "¡Aprendemos jugando!",
        descripcion: "Jugando también podemos aprender.",
        icono: "🎨",
        ruta: "juegos/mision-4.html",
        audio: "../audio/narraciones/mision_4.mp3"
    },
    {
        id: 5,
        nombre: "¡A descubrir!",
        titulo: "¡Descubrir es aprender!",
        descripcion: "Exploremos y descubramos cosas nuevas.",
        icono: "🔎",
        ruta: "juegos/mision-5.html",
        audio: "../audio/narraciones/mision_5.mp3"
    },
    {
        id: 6,
        nombre: "¡Mi escuela!",
        titulo: "¡Cuidemos nuestra escuela!",
        descripcion: "Nuestra escuela es un lugar especial que debemos cuidar.",
        icono: "🏫",
        ruta: "juegos/mision-6.html",
        audio: "../audio/narraciones/mision_6.mp3"
    }
];

/* RECONOCIMIENTOS */

const reconocimientos = [
    {
        id: 1,
        mision: 2,
        titulo: "Pequeño Explorador",
        descripcion: "¡Completaste tus primeras dos misiones!",
        icono: "🏅",
        audio: "../audio/narraciones/premio_1.mp3"
    },
    {
        id: 2,
        mision: 4,
        titulo: "Guardián del Saber",
        descripcion: "¡Cada día aprendes algo nuevo!",
        icono: "🏆",
        audio: "../audio/narraciones/premio_2.mp3"
    },
    {
        id: 3,
        mision: 6,
        titulo: "Estrella del Saber",
        descripcion: "¡Completaste toda la aventura!",
        icono: "🌟",
        audio: "../audio/narraciones/premio_3.mp3"
    }
];

/* ALMACENAMIENTO */

const CLAVE_CONFIGURACION = "estrellitas_del_saber_configuracion";
const CLAVE_PROGRESO = "estrellitas_del_saber_progreso";
const CLAVE_PREMIOS = "estrellitas_del_saber_premios";

const CLAVE_BIENVENIDA = "estrellitas_mapa_bienvenida";
const CLAVE_MISION_VISITADA = "estrellitas_mapa_mision_visitada";
const CLAVE_COMPLETADAS_ANTES = "estrellitas_mapa_completadas_antes";

const configuracionInicial = {
    musica: true,
    efectos: true,
    voz: true
};

function leerJSON(almacen, clave, predeterminado) {
    try {
        const valor = almacen.getItem(clave);

        return valor === null
            ? predeterminado
            : JSON.parse(valor);
    } catch (error) {
        return predeterminado;
    }
}

function cargarConfiguracion() {
    const guardada = leerJSON(
        localStorage,
        CLAVE_CONFIGURACION,
        {}
    );

    return {
        ...configuracionInicial,
        ...(guardada && typeof guardada === "object" ? guardada : {})
    };
}

let configuracion = cargarConfiguracion();

/* PROGRESO */

function obtenerProgreso() {
    const guardado = leerJSON(
        localStorage,
        CLAVE_PROGRESO,
        {}
    );

    const completadas = Array.isArray(guardado?.completadas)
        ? [...new Set(
            guardado.completadas
                .map(Number)
                .filter(id =>
                    Number.isInteger(id) &&
                    id >= 1 &&
                    id <= 6
                )
        )]
        : [];

    const estrellas =
        guardado?.estrellas &&
        typeof guardado.estrellas === "object"
            ? guardado.estrellas
            : {};

    return { completadas, estrellas };
}

let progreso = obtenerProgreso();

function estaCompletada(id) {
    return progreso.completadas.includes(id);
}

function estaDesbloqueada(id) {
    return id === 1 || estaCompletada(id - 1);
}

function calcularEstrellas() {
    return misiones.reduce((total, mision) => {
        const cantidad = Number(
            progreso.estrellas[mision.id] || 0
        );

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

function obtenerMisionActual() {
    const siguiente = misiones.find(mision =>
        !estaCompletada(mision.id) &&
        estaDesbloqueada(mision.id)
    );

    return siguiente ? siguiente.id : null;
}

/* AUDIO */

const audioMapa = {
    bienvenida: "../audio/narraciones/mapa_bienvenida.mp3",
    siguiente: "../audio/narraciones/mapa_siguiente_mision.mp3",
    final: "../audio/narraciones/mapa_final.mp3",
    musica: "../audio/musica/aventura_espacial.mp3",
    efectoSeleccion: null
};

let narracionActual = null;
let musicaActual = null;
let narracionPendiente = false;
let rutaNarracionPendiente = null;
let narracionReproducida = false;
let intentoNarracion = 0;
let entradaMapaProcesada = false;
let seleccionMisionActiva = false;

function detenerNarracion() {
    intentoNarracion++;

    if (narracionActual) {
        narracionActual.pause();
        narracionActual.currentTime = 0;
        narracionActual = null;
    }

    narracionPendiente = false;
    rutaNarracionPendiente = null;
}

async function reproducirNarracion(ruta, permitirRepeticion = false) {
    if (!configuracion.voz || !ruta) return false;

    if (narracionReproducida && !permitirRepeticion) {
        return false;
    }

    detenerNarracion();

    const intento = ++intentoNarracion;
    const audio = new Audio(ruta);

    narracionActual = audio;
    audio.volume = 1;

    try {
        await audio.play();

        if (intento !== intentoNarracion) {
            audio.pause();
            return false;
        }

        narracionReproducida = true;
        narracionPendiente = false;
        rutaNarracionPendiente = null;

        return true;
    } catch (error) {
        if (intento !== intentoNarracion) return false;

        if (error.name === "NotAllowedError") {
            narracionPendiente = true;
            rutaNarracionPendiente = ruta;
        }

        return false;
    }
}

function esperarNarracion(ruta) {
    if (!configuracion.voz || !ruta) {
        return Promise.resolve();
    }

    detenerNarracion();

    return new Promise((resolver) => {
        const audio = new Audio(ruta);
        const intento = ++intentoNarracion;

        narracionActual = audio;
        audio.volume = 1;

        let terminado = false;

        function finalizar() {
            if (terminado) return;

            terminado = true;

            if (narracionActual === audio) {
                narracionActual = null;
            }

            resolver();
        }

        audio.addEventListener("ended", finalizar, { once: true });
        audio.addEventListener("error", finalizar, { once: true });

        audio.play().then(() => {
            if (intento !== intentoNarracion) {
                audio.pause();
                finalizar();
            }
        }).catch(finalizar);

        setTimeout(() => {
            if (!terminado) {
                audio.pause();
                finalizar();
            }
        }, 7000);
    });
}

function reintentarNarracion() {
    if (
        !narracionPendiente ||
        !rutaNarracionPendiente ||
        narracionReproducida ||
        !configuracion.voz
    ) {
        return;
    }

    reproducirNarracion(rutaNarracionPendiente);
}

function reproducirEfecto(ruta) {
    if (!configuracion.efectos || !ruta) return;

    const efecto = new Audio(ruta);
    efecto.volume = 0.4;
    efecto.play().catch(() => {});
}

function actualizarMusica() {
    if (!audioMapa.musica) return;

    if (!musicaActual) {
        musicaActual = new Audio(audioMapa.musica);
        musicaActual.loop = true;
        musicaActual.volume = 0.18;
    }

    if (configuracion.musica) {
        musicaActual.play().catch(() => {});
    } else {
        musicaActual.pause();
    }
}

/* PREMIOS */

function obtenerPremiosGuardados() {
    const guardados = leerJSON(
        localStorage,
        CLAVE_PREMIOS,
        []
    );

    return Array.isArray(guardados)
        ? guardados.map(Number).filter(Number.isInteger)
        : [];
}

function guardarPremio(id) {
    const premios = obtenerPremiosGuardados();

    if (premios.includes(id)) return;

    premios.push(id);

    try {
        localStorage.setItem(
            CLAVE_PREMIOS,
            JSON.stringify(premios)
        );
    } catch (error) {
        console.warn("No se pudo guardar el premio.");
    }
}

function obtenerPremioPendiente(nuevasCompletadas) {
    const guardados = obtenerPremiosGuardados();

    return reconocimientos.find(premio =>
        nuevasCompletadas.includes(premio.mision) &&
        !guardados.includes(premio.id) &&
        Array.from(
            { length: premio.mision },
            (_, indice) => indice + 1
        ).every(id => estaCompletada(id))
    ) || null;
}

let premioPendiente = null;
let focoAnteriorPremio = null;

function mostrarModalPremio(premio) {
    if (!premio || !modalPremio) return;

    focoAnteriorPremio = document.activeElement;

    premioMedalla.textContent = premio.icono;
    premioTitulo.textContent = premio.titulo;
    premioDescripcion.textContent = premio.descripcion;

    premioPendiente = premio;
    modalPremio.hidden = false;

    document.body.style.overflow = "hidden";

    guardarPremio(premio.id);

    detenerNarracion();
    reproducirNarracion(premio.audio, true);

    premioContinuar.focus();
}

function cerrarModalPremio() {
    if (!modalPremio || modalPremio.hidden) return;

    modalPremio.hidden = true;
    premioPendiente = null;

    document.body.style.overflow = "";

    detenerNarracion();

    if (focoAnteriorPremio?.focus) {
        focoAnteriorPremio.focus();
    }
}

/* ENTRADA AL MAPA */

function obtenerNarracionEntrada() {
    const bienvenidaEscuchada =
        sessionStorage.getItem(CLAVE_BIENVENIDA) === "true";

    const misionVisitada =
        sessionStorage.getItem(CLAVE_MISION_VISITADA) === "true";

    const completadasAntes = leerJSON(
        sessionStorage,
        CLAVE_COMPLETADAS_ANTES,
        []
    );

    let ruta = null;

    if (misionVisitada) {
        const anteriores = Array.isArray(completadasAntes)
            ? completadasAntes.map(Number)
            : [];

        const nuevasCompletadas = progreso.completadas.filter(
            id => !anteriores.includes(id)
        );

        if (nuevasCompletadas.length > 0) {
            premioPendiente = obtenerPremioPendiente(
                nuevasCompletadas
            );

            if (!premioPendiente) {
                ruta = progreso.completadas.length === misiones.length
                    ? audioMapa.final
                    : audioMapa.siguiente;
            }
        }

        sessionStorage.removeItem(CLAVE_MISION_VISITADA);
        sessionStorage.removeItem(CLAVE_COMPLETADAS_ANTES);

    } else if (!bienvenidaEscuchada) {
        ruta = audioMapa.bienvenida;
    }

    sessionStorage.setItem(CLAVE_BIENVENIDA, "true");

    return ruta;
}

function iniciarEntradaMapa() {
    if (entradaMapaProcesada) return;

    entradaMapaProcesada = true;

    const transicion = document.getElementById("transicion-polvo");

    const tieneTransicion =
        document.documentElement.classList.contains("entrada-polvo");

    const rutaNarracion = obtenerNarracionEntrada();

    try {
        sessionStorage.removeItem("estrellitas_transicion_mapa");
    } catch (error) {
        // Continúa la entrada.
    }

    function terminarEntrada() {
        document.documentElement.classList.remove("entrada-polvo");

        if (transicion) {
            transicion.remove();
        }

        if (premioPendiente) {
            setTimeout(() => {
                mostrarModalPremio(premioPendiente);
            }, 450);
        } else if (rutaNarracion) {
            reproducirNarracion(rutaNarracion);
        }
    }

    if (!tieneTransicion) {
        terminarEntrada();
        return;
    }

    const movimientoReducido = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    setTimeout(
        terminarEntrada,
        movimientoReducido ? 0 : 1100
    );
}

/* CONFIGURACIÓN */

function actualizarControlesConfiguracion() {
    configMusica.checked = configuracion.musica;
    configEfectos.checked = configuracion.efectos;
    configVoz.checked = configuracion.voz;
}

function guardarConfiguracion() {
    configuracion = {
        musica: configMusica.checked,
        efectos: configEfectos.checked,
        voz: configVoz.checked
    };

    try {
        localStorage.setItem(
            CLAVE_CONFIGURACION,
            JSON.stringify(configuracion)
        );
    } catch (error) {
        console.warn("No se pudo guardar la configuración.");
    }

    if (!configuracion.voz) {
        detenerNarracion();
    }

    actualizarMusica();
}

/* ACTUALIZAR MAPA */

function actualizarMapa() {
    totalEstrellas.textContent = calcularEstrellas();

    const misionActual = obtenerMisionActual();

    botonesMisiones.forEach((boton) => {
        const id = Number(boton.dataset.mision);
        const mision = misiones.find(item => item.id === id);

        if (!mision) return;

        const completada = estaCompletada(id);
        const desbloqueada = estaDesbloqueada(id);
        const disponible = id === misionActual;

        boton.disabled = !desbloqueada;

        boton.classList.toggle(
            "mision-completada",
            completada
        );

        boton.classList.toggle(
            "mision-disponible",
            disponible
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
            const cantidadOriginal = Number(
                progreso.estrellas[id] || 0
            );

            const cantidad = Math.max(
                0,
                Math.min(
                    3,
                    Number.isFinite(cantidadOriginal)
                        ? Math.floor(cantidadOriginal)
                        : 0
                )
            );

            estrellas.textContent =
                "★ ".repeat(cantidad) +
                "☆ ".repeat(3 - cantidad);

            estrellas.hidden = !desbloqueada;
        }

        const nombreVisible = boton.querySelector(
            ".mision-etiqueta"
        );

        const iconoVisible = boton.querySelector(
            ".mision-icono"
        );

        if (nombreVisible) {
            nombreVisible.textContent = mision.nombre;
        }

        if (iconoVisible) {
            iconoVisible.textContent = mision.icono;
        }

        const estado = completada
            ? "Misión completada"
            : desbloqueada
                ? "Misión disponible"
                : "Misión bloqueada";

        boton.setAttribute(
            "aria-label",
            `${mision.titulo}. ${estado}`
        );
    });
}

/* POSICIONAR STARLY */

function posicionarStarly() {
    const misionActual = obtenerMisionActual();
    const idObjetivo = misionActual || 6;

    const boton = document.querySelector(
        `.mision[data-mision="${idObjetivo}"]`
    );

    if (!boton || !starlyPosicion || !mapaAventura) {
        return;
    }

    const anchoMapa = mapaAventura.clientWidth;
    const altoMapa = mapaAventura.clientHeight;

    const anchoStarly = starlyPosicion.offsetWidth;
    const altoStarly = starlyPosicion.offsetHeight;

    const centroBotonY =
        boton.offsetTop + boton.offsetHeight / 2;

    const separacion = 22;

    let posicionX =
        boton.offsetLeft - anchoStarly - separacion;

    let posicionY =
        centroBotonY - altoStarly / 2;

    let colocarDerecha = false;

    if (idObjetivo !== 1 && posicionX < 8) {
        posicionX =
            boton.offsetLeft +
            boton.offsetWidth +
            separacion;

        colocarDerecha = true;
    }

    posicionX = Math.max(
        8,
        Math.min(
            posicionX,
            anchoMapa - anchoStarly - 8
        )
    );

    posicionY = Math.max(
        8,
        Math.min(
            posicionY,
            altoMapa - altoStarly - 8
        )
    );

    starlyPosicion.style.left = `${posicionX}px`;
    starlyPosicion.style.top = `${posicionY}px`;

    starlyPosicion.classList.toggle(
        "starly-derecha",
        colocarDerecha
    );

    starlyPosicion.classList.toggle(
        "starly-final",
        misionActual === null
    );
}

/* ENFOCAR MISIÓN */

function enfocarMisionActual() {
    if (!mapaDesplazamiento) return;

    const misionActual = obtenerMisionActual();

    if (misionActual === null) return;

    const boton = document.querySelector(
        `.mision[data-mision="${misionActual}"]`
    );

    if (!boton) return;

    if (
        mapaDesplazamiento.scrollWidth <=
        mapaDesplazamiento.clientWidth
    ) {
        return;
    }

    const centroBoton =
        boton.offsetLeft + boton.offsetWidth / 2;

    const destino =
        centroBoton - mapaDesplazamiento.clientWidth / 2;

    mapaDesplazamiento.scrollLeft = Math.max(0, destino);
}

/* ABRIR MISIÓN */

async function abrirMision(id) {
    if (!estaDesbloqueada(id) || seleccionMisionActiva) {
        return;
    }

    const mision = misiones.find(item => item.id === id);

    if (!mision) return;

    seleccionMisionActiva = true;

    detenerNarracion();
    reproducirEfecto(audioMapa.efectoSeleccion);

    try {
        sessionStorage.setItem(
            CLAVE_COMPLETADAS_ANTES,
            JSON.stringify(progreso.completadas)
        );

        sessionStorage.setItem(
            CLAVE_MISION_VISITADA,
            "true"
        );
    } catch (error) {
        console.warn("No se pudo guardar la visita.");
    }

    await esperarNarracion(mision.audio);

    window.location.href = mision.ruta;
}

/* MODAL DE CONFIGURACIÓN */

let elementoAnterior = null;

function abrirConfiguracion() {
    elementoAnterior = document.activeElement;

    actualizarControlesConfiguracion();

    modalConfiguracion.hidden = false;
    document.body.style.overflow = "hidden";

    configuracionCerrar.focus();
}

function cerrarConfiguracion() {
    guardarConfiguracion();
    actualizarControlesConfiguracion();

    modalConfiguracion.hidden = true;
    document.body.style.overflow = "";

    if (elementoAnterior?.focus) {
        elementoAnterior.focus();
    }
}

/* EVENTOS */

botonesMisiones.forEach((boton) => {
    boton.addEventListener("click", () => {
        abrirMision(Number(boton.dataset.mision));
    });
});

btnConfiguracion.addEventListener(
    "click",
    abrirConfiguracion
);

configuracionCerrar.addEventListener(
    "click",
    cerrarConfiguracion
);

configuracionListo.addEventListener(
    "click",
    cerrarConfiguracion
);

configMusica.addEventListener(
    "change",
    guardarConfiguracion
);

configEfectos.addEventListener(
    "change",
    guardarConfiguracion
);

configVoz.addEventListener(
    "change",
    guardarConfiguracion
);

premioContinuar.addEventListener(
    "click",
    cerrarModalPremio
);

modalConfiguracion.addEventListener("click", (evento) => {
    if (evento.target === modalConfiguracion) {
        cerrarConfiguracion();
    }
});

document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
        if (!modalPremio.hidden) {
            cerrarModalPremio();
        } else if (!modalConfiguracion.hidden) {
            cerrarConfiguracion();
        }
    }

    if (evento.key === "Tab" && !modalPremio.hidden) {
        evento.preventDefault();
        premioContinuar.focus();
    }
});

document.addEventListener("pointerdown", reintentarNarracion);
document.addEventListener("keydown", reintentarNarracion);

/* REGRESAR AL MAPA */

window.addEventListener("pageshow", (evento) => {
    progreso = obtenerProgreso();
    seleccionMisionActiva = false;

    actualizarMapa();
    posicionarStarly();
    enfocarMisionActual();

    if (evento.persisted) {
        entradaMapaProcesada = false;
        narracionReproducida = false;
        iniciarEntradaMapa();
    }
});

/* AJUSTAR PANTALLA */

window.addEventListener("resize", posicionarStarly);

/* INICIAR */

actualizarMapa();
actualizarControlesConfiguracion();
actualizarMusica();

posicionarStarly();
enfocarMisionActual();

iniciarEntradaMapa();
