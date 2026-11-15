
/* ==========================================
   ESTRELLITAS DEL SABER
   MAPA DE MISIONES
========================================== */

/* Elementos */

const botonesMisiones = document.querySelectorAll(".mision");

const totalEstrellas = document.getElementById("total-estrellas");
const mensajeStarly = document.getElementById("mensaje-starly");
const tituloStarly = document.getElementById("titulo-starly");
const btnEscuchar = document.getElementById("btn-escuchar");

const btnConfiguracion = document.getElementById("btn-configuracion");
const modalConfiguracion = document.getElementById("modal-configuracion");
const configuracionCerrar = document.getElementById("configuracion-cerrar");
const configuracionListo = document.getElementById("configuracion-listo");

const configMusica = document.getElementById("config-musica");
const configEfectos = document.getElementById("config-efectos");
const configVoz = document.getElementById("config-voz");

/* Datos de las seis misiones */

const misiones = [
    {
        id: 1,
        nombre: "¡A aprender!",
        titulo: "¡Tengo derecho a aprender!",
        descripcion: "Todos los niños tenemos derecho a aprender.",
        icono: "📖",
        ruta: "juegos/mision-1.html",
        audio: null
    },
    {
        id: 2,
        nombre: "¡Para todos!",
        titulo: "¡La escuela es para todos!",
        descripcion: "Todos podemos estudiar, sin importar nuestras diferencias.",
        icono: "🏫",
        ruta: "juegos/mision-2.html",
        audio: null
    },
    {
        id: 3,
        nombre: "¡A jugar!",
        titulo: "¡Aprendemos jugando!",
        descripcion: "Jugando también podemos descubrir cosas nuevas.",
        icono: "🎨",
        ruta: "juegos/mision-3.html",
        audio: null
    },
    {
        id: 4,
        nombre: "¡Nos ayudamos!",
        titulo: "¡Aprendemos juntos!",
        descripcion: "En la escuela nos respetamos y ayudamos.",
        icono: "🤝",
        ruta: "juegos/mision-4.html",
        audio: null
    },
    {
        id: 5,
        nombre: "¡A descubrir!",
        titulo: "¡Descubrir es aprender!",
        descripcion: "Podemos hacer preguntas y aprender cada día.",
        icono: "✏️",
        ruta: "juegos/mision-5.html",
        audio: null
    },
    {
        id: 6,
        nombre: "¡Mi escuela!",
        titulo: "¡Cuidemos nuestra escuela!",
        descripcion: "Cuidamos el lugar donde aprendemos.",
        icono: "🌟",
        ruta: "juegos/mision-6.html",
        audio: null
    }
];

/* Configuración */

const CLAVE_CONFIGURACION = "estrellitas_del_saber_configuracion";

const configuracionInicial = {
    musica: true,
    efectos: true,
    voz: true
};

function cargarConfiguracion() {
    try {
        const guardada = JSON.parse(
            localStorage.getItem(CLAVE_CONFIGURACION)
        );

        return {
            ...configuracionInicial,
            ...(guardada || {})
        };
    } catch (error) {
        return { ...configuracionInicial };
    }
}

let configuracion = cargarConfiguracion();

/* Audio */

const audioMapa = {
    bienvenida: null,
    musica: null,
    efectoSeleccion: null
};

let narracionActual = null;
let musicaActual = null;

function detenerNarracion() {
    if (narracionActual) {
        narracionActual.pause();
        narracionActual.currentTime = 0;
        narracionActual = null;
    }
}

function reproducirNarracion(ruta) {
    detenerNarracion();

    if (!configuracion.voz || !ruta) {
        return;
    }

    narracionActual = new Audio(ruta);
    narracionActual.volume = 1;

    narracionActual.play().catch(() => {
        // El mapa funciona aunque el navegador bloquee el audio.
    });
}

function reproducirEfecto(ruta) {
    if (!configuracion.efectos || !ruta) {
        return;
    }

    const efecto = new Audio(ruta);
    efecto.volume = 0.4;
    efecto.play().catch(() => {});
}

function actualizarMusica() {
    if (!audioMapa.musica) {
        return;
    }

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

/* Guardar configuración */

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
        // Se conserva la configuración durante esta sesión.
    }

    if (!configuracion.voz) {
        detenerNarracion();
    }

    actualizarMusica();
}

function actualizarControlesConfiguracion() {
    configMusica.checked = configuracion.musica;
    configEfectos.checked = configuracion.efectos;
    configVoz.checked = configuracion.voz;

    btnEscuchar.disabled =
        !configuracion.voz || !audioMapa.bienvenida;
}

/* Progreso */

const CLAVE_PROGRESO = "estrellitas_del_saber_progreso";

function obtenerProgreso() {
    try {
        const guardado = localStorage.getItem(CLAVE_PROGRESO);

        if (guardado) {
            const progresoGuardado = JSON.parse(guardado);

            if (
                progresoGuardado &&
                Array.isArray(progresoGuardado.completadas)
            ) {
                return {
                    completadas: progresoGuardado.completadas
                        .map(Number)
                        .filter(id => Number.isInteger(id) && id >= 1 && id <= 6),

                    estrellas: progresoGuardado.estrellas || {}
                };
            }
        }
    } catch (error) {
        // Se inicia sin progreso si los datos no son válidos.
    }

    return {
        completadas: [],
        estrellas: {}
    };
}

let progreso = obtenerProgreso();

function estaCompletada(id) {
    return progreso.completadas.includes(id);
}

function estaDesbloqueada(id) {
    if (id === 1) {
        return true;
    }

    return estaCompletada(id - 1);
}

function calcularEstrellas() {
    return misiones.reduce((total, mision) => {
        const cantidad = Number(progreso.estrellas[mision.id] || 0);

        return total + Math.max(
            0,
            Math.min(3, Number.isFinite(cantidad) ? cantidad : 0)
        );
    }, 0);
}

/* Actualizar mapa */

function actualizarMapa() {
    totalEstrellas.textContent = calcularEstrellas();

    botonesMisiones.forEach((boton) => {
        const id = Number(boton.dataset.mision);
        const completada = estaCompletada(id);
        const desbloqueada = estaDesbloqueada(id);

        boton.disabled = !desbloqueada;

        boton.classList.toggle(
            "mision-completada",
            completada
        );

        boton.classList.toggle(
            "mision-disponible",
            desbloqueada && !completada
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
            const cantidad = Math.max(
                0,
                Math.min(3, Number(progreso.estrellas[id] || 0))
            );

            estrellas.textContent =
                "★ ".repeat(cantidad) +
                "☆ ".repeat(3 - cantidad);

            estrellas.hidden = !desbloqueada;
        }

        const mision = misiones.find(item => item.id === id);

        if (mision) {
            const estado = completada
                ? "Misión completada"
                : desbloqueada
                    ? "Misión disponible"
                    : "Misión bloqueada";

            boton.setAttribute(
                "aria-label",
                `${mision.titulo}. ${estado}`
            );
        }
    });
}

/* Mensajes de Starly */

function actualizarMensajeStarly(titulo, mensaje) {
    tituloStarly.textContent = titulo;
    mensajeStarly.textContent = mensaje;
}

function escucharStarly() {
    if (!configuracion.voz) {
        return;
    }

    reproducirNarracion(audioMapa.bienvenida);
}

/* Entrar a las misiones */

function abrirMision(id) {
    if (!estaDesbloqueada(id)) {
        return;
    }

    const mision = misiones.find(item => item.id === id);

    if (!mision) {
        return;
    }

    reproducirEfecto(audioMapa.efectoSeleccion);

    window.location.href = mision.ruta;
}

/* Modal de configuración */

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

    if (elementoAnterior) {
        elementoAnterior.focus();
    }
}

/* Eventos */

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

configVoz.addEventListener("change", () => {
    guardarConfiguracion();
    actualizarControlesConfiguracion();
});

btnEscuchar.addEventListener(
    "click",
    escucharStarly
);

modalConfiguracion.addEventListener("click", (evento) => {
    if (evento.target === modalConfiguracion) {
        cerrarConfiguracion();
    }
});

document.addEventListener("keydown", (evento) => {
    if (
        evento.key === "Escape" &&
        !modalConfiguracion.hidden
    ) {
        cerrarConfiguracion();
    }
});

/* Iniciar mapa */

actualizarMapa();
actualizarControlesConfiguracion();
actualizarMusica();
