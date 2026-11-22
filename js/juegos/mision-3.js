
/* ESTRELLITAS DEL SABER - MISIÓN 3 */

"use strict";

const $ = (id) => document.getElementById(id);

const escenario = $("ruta-escenario");
const autobus = $("ruta-autobus");
const companero = $("ruta-companero");
const puerta = $("bus-puerta");
const mensaje = $("ruta-mensaje");
const botonAudio = $("ruta-audio");
const recorrido = $("ruta-recorrido");
const svg = $("ruta-svg");
const caminoFondo = $("ruta-camino-fondo");
const caminoGuia = $("ruta-camino-guia");
const caminoHecho = $("ruta-camino-hecho");
const origen = $("ruta-origen");
const destino = $("ruta-destino");
const indicador = $("ruta-indicador");
const pista = $("ruta-pista");
const introCamino = $("ruta-intro-camino");
const introTrazo = $("ruta-intro-trazo");
const escuela = $("ruta-escuela");

const RUTA_AUDIO = "../../audio/juegos/mision-3/";
const CLAVE_PROGRESO = "estrellitas_del_saber_progreso";
const CLAVE_CONFIGURACION = "estrellitas_del_saber_configuracion";

const NINOS = [
    {
        nombre: "Ana",
        estilo: "larga",
        piel: "#E8B48A",
        pelo: "#5B3420",
        ropa: "#FF7BA9",
        ropa2: "#FF7BA9",
        vestido: true,
        dialogo: "ana",
        camino: "M25 160 Q350 35 675 160",
        tolerancia: 100,
        avance: 155
    },
    {
        nombre: "Luis",
        estilo: "corto",
        piel: "#D99A6C",
        pelo: "#1F1410",
        ropa: "#4FA3F7",
        ropa2: "#3B4FA0",
        vestido: false,
        dialogo: "luis",
        camino: "M25 65 L90 185 L155 65 L220 185 L285 65 L350 185 L415 65 L480 185 L545 65 L610 185 L675 65",
        tolerancia: 90,
        avance: 125
    },
    {
        nombre: "Sol",
        estilo: "rizos",
        piel: "#B9784B",
        pelo: "#2B1B12",
        ropa: "#FFC83D",
        ropa2: "#FFC83D",
        vestido: true,
        silla: true,
        dialogo: "sol",
        camino: "M25 75 L150 75 L215 185 L280 75 L345 185 L410 75 L475 185 Q570 20 675 125",
        tolerancia: 85,
        avance: 110
    }
];

const DIALOGOS = {
    historiaBus: [
        "¡Hoy iremos a la escuela en autobús!",
        "historia-bus.mp3"
    ],
    historiaAmigos: [
        "¡Pero primero debemos recoger a nuestros amigos!",
        "historia-amigos.mp3"
    ],
    ana: [
        "¡Mira, es Ana! ¡Vamos por ella!",
        "ana.mp3"
    ],
    luis: [
        "¡Ahí está Luis! ¡Vamos!",
        "luis.mp3"
    ],
    sol: [
        "¡Sol nos espera! ¡Vamos por ella!",
        "sol.mp3"
    ],
    bien: [
        "¡Muy bien!",
        "bien.mp3"
    ],
    bienSol: [
        "¡Excelente!",
        "bien-sol.mp3"
    ],
    final: [
        "¡Llegamos todos! ¡La escuela es para todos!",
        "final.mp3"
    ]
};

const ventanas = [
    $("bus-ventana-ana"),
    $("bus-ventana-luis"),
    $("bus-ventana-sol")
];

let configuracion = {
    musica: true,
    efectos: true,
    voz: true
};

try {
    const datos = JSON.parse(
        localStorage.getItem(CLAVE_CONFIGURACION) || "{}"
    );

    if (datos && typeof datos === "object") {
        configuracion = {
            ...configuracion,
            ...datos
        };
    }
} catch (error) {
    console.warn("Se utilizará la configuración predeterminada.");
}

let etapa = 0;
let estrellas = 0;
let bloqueado = true;
let terminado = false;
let dibujando = false;
let introduccionActiva = true;
let punteroActivo = null;
let longitudTotal = 0;
let progreso = 0;
let ultimoDialogo = "historiaBus";
let audioActual = null;
let resolverAudio = null;
let contextoAudio = null;
let temporizadorPista = null;
let animacionPista = null;
let animacionBus = null;
let sesion = 0;
let paginaActiva = true;
let efectoMotor = null;
let instruccionReproducida = false;
let efectoTrazo = null;

const efectosActivos = new Set();

/* UTILIDADES */

function esperar(ms) {
    return new Promise((resolver) => {
        setTimeout(resolver, ms);
    });
}

function limitar(valor, minimo, maximo) {
    return Math.max(minimo, Math.min(valor, maximo));
}

function obtenerElemento(id) {
    return document.getElementById(id);
}

/* AUDIO DE STARLY */

function detenerAudio() {
    if (audioActual) {
        audioActual.pause();
        audioActual.currentTime = 0;
        audioActual = null;
    }

    if (resolverAudio) {
        const resolver = resolverAudio;
        resolverAudio = null;
        resolver();
    }

    if (botonAudio) {
        botonAudio.classList.remove("reproduciendo");
    }
}

function decir(clave) {
    const dialogo = DIALOGOS[clave];

    if (!dialogo) {
        return Promise.resolve();
    }

    detenerAudio();

    ultimoDialogo = clave;

    if (mensaje) {
        mensaje.textContent = dialogo[0];
    }

    if (!configuracion.voz) {
        return Promise.resolve();
    }

    return new Promise((resolver) => {
        const audio = new Audio(
            RUTA_AUDIO + dialogo[1]
        );

        audioActual = audio;

        let finalizado = false;

        const finalizar = () => {
            if (finalizado) return;

            finalizado = true;

            if (audioActual === audio) {
                audioActual = null;

                if (botonAudio) {
                    botonAudio.classList.remove("reproduciendo");
                }
            }

            if (resolverAudio === finalizar) {
                resolverAudio = null;
            }

            resolver();
        };

        resolverAudio = finalizar;

        audio.addEventListener(
            "ended",
            finalizar,
            { once: true }
        );

        audio.addEventListener(
            "error",
            finalizar,
            { once: true }
        );

        audio.play().then(() => {
            if (
                audioActual === audio &&
                !audio.paused &&
                botonAudio
            ) {
                botonAudio.classList.add("reproduciendo");
            }
        }).catch(finalizar);
    });
}

async function decirConMinimo(clave, tiempo) {
    await Promise.all([
        decir(clave),
        esperar(tiempo)
    ]);
}

/* EFECTOS DE SONIDO */

function reproducirEfecto(archivo, opciones = {}) {
    if (
        !configuracion.efectos ||
        !paginaActiva
    ) {
        return null;
    }

    const audio = new Audio(
        RUTA_AUDIO + archivo
    );

    audio.volume = opciones.volumen ?? 0.45;
    audio.loop = Boolean(opciones.bucle);

    efectosActivos.add(audio);

    const limpiar = () => {
        efectosActivos.delete(audio);

        if (efectoMotor === audio) {
            efectoMotor = null;
        }

        if (efectoTrazo === audio) {
            efectoTrazo = null;
        }
    };

    audio.addEventListener(
        "ended",
        limpiar,
        { once: true }
    );

    audio.addEventListener(
        "error",
        limpiar,
        { once: true }
    );

    audio.play().catch(limpiar);

    return audio;
}

function detenerEfecto(audio) {
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;

    efectosActivos.delete(audio);

    if (efectoMotor === audio) {
        efectoMotor = null;
    }

    if (efectoTrazo === audio) {
        efectoTrazo = null;
    }
}

function iniciarMotor() {
    detenerMotor();

    efectoMotor = reproducirEfecto(
        "motor-bus.mp3",
        {
            volumen: 0.18,
            bucle: true
        }
    );
}

function detenerMotor() {
    detenerEfecto(efectoMotor);
}

function detenerTodosLosEfectos() {
    for (const audio of [...efectosActivos]) {
        detenerEfecto(audio);
    }

    efectoMotor = null;
    efectoTrazo = null;
}

/* SONIDOS DE RECOMPENSA */

function reproducirTono(
    frecuencia,
    duracion = 0.2,
    retraso = 0
) {
    if (
        !configuracion.efectos ||
        !paginaActiva
    ) {
        return;
    }

    try {
        const Contexto =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!Contexto) return;

        if (!contextoAudio) {
            contextoAudio = new Contexto();
        }

        if (contextoAudio.state === "suspended") {
            contextoAudio.resume().catch(() => {});
        }

        const inicio =
            contextoAudio.currentTime + retraso;

        const oscilador =
            contextoAudio.createOscillator();

        const ganancia =
            contextoAudio.createGain();

        oscilador.type = "sine";

        oscilador.frequency.setValueAtTime(
            frecuencia,
            inicio
        );

        ganancia.gain.setValueAtTime(
            0.001,
            inicio
        );

        ganancia.gain.exponentialRampToValueAtTime(
            0.07,
            inicio + 0.015
        );

        ganancia.gain.exponentialRampToValueAtTime(
            0.001,
            inicio + duracion
        );

        oscilador.connect(ganancia);
        ganancia.connect(contextoAudio.destination);

        oscilador.start(inicio);
        oscilador.stop(inicio + duracion + 0.02);
    } catch (error) {
        console.warn("No se pudo reproducir el sonido.");
    }
}

function sonidoTilin() {
    reproducirTono(880, 0.24);
    reproducirTono(1320, 0.38, 0.12);
}

function sonidoEstrella() {
    reproducirTono(740, 0.15);
    reproducirTono(988, 0.22, 0.12);
}

/* BRILLITOS */

function crearDestellos() {
    const contenedor = obtenerElemento("ruta-efectos");

    if (!contenedor) return;

    for (let i = 0; i < 14; i++) {
        const destello = document.createElement("span");

        destello.className = "ruta-destello";
        destello.textContent = "✦";

        destello.style.left =
            `${25 + Math.random() * 50}%`;

        destello.style.top =
            `${35 + Math.random() * 35}%`;

        contenedor.appendChild(destello);

        setTimeout(() => {
            destello.remove();
        }, 1100);
    }
}

function crearBrillitosCamino() {
    const contenedor =
        obtenerElemento("ruta-efectos") || escenario;

    if (
        !contenedor ||
        !escenario ||
        !svg ||
        !caminoFondo
    ) {
        crearDestellos();
        return;
    }

    const matriz = svg.getScreenCTM();

    if (!matriz) {
        crearDestellos();
        return;
    }

    const caja =
        contenedor.getBoundingClientRect();

    const colores = [
        "#FFD54F",
        "#FFFFFF",
        "#C6A8FF",
        "#FF9ED2",
        "#FFF4A3"
    ];

    for (let i = 0; i < 24; i++) {
        const longitud =
            Math.random() * longitudTotal;

        const punto =
            caminoFondo.getPointAtLength(longitud);

        const puntoSvg = svg.createSVGPoint();

        puntoSvg.x = punto.x;
        puntoSvg.y = punto.y;

        const pantalla =
            puntoSvg.matrixTransform(matriz);

        const brillo = document.createElement("span");

        const desplazamientoX =
            (Math.random() - 0.5) * 85;

        const desplazamientoY =
            (Math.random() - 0.5) * 70;

        brillo.textContent =
            Math.random() > 0.35 ? "✦" : "✧";

        brillo.style.position = "absolute";
        brillo.style.left =
            `${pantalla.x - caja.left}px`;

        brillo.style.top =
            `${pantalla.y - caja.top}px`;

        brillo.style.color =
            colores[i % colores.length];

        brillo.style.fontSize =
            `${15 + Math.random() * 18}px`;

        brillo.style.fontWeight = "bold";
        brillo.style.pointerEvents = "none";
        brillo.style.zIndex = "60";
        brillo.style.opacity = "0";

        brillo.style.textShadow =
            "0 0 8px rgba(255,255,255,.95)";

        brillo.style.transform =
            "translate(-50%, -50%) scale(.2)";

        brillo.style.transition =
            "transform .65s ease-out, opacity .3s ease";

        contenedor.appendChild(brillo);

        const retraso = Math.random() * 220;

        setTimeout(() => {
            if (!brillo.isConnected) return;

            brillo.style.opacity = "1";

            brillo.style.transform =
                `translate(calc(-50% + ${desplazamientoX}px), calc(-50% + ${desplazamientoY}px)) scale(1.3)`;
        }, retraso);

        setTimeout(() => {
            brillo.style.opacity = "0";

            brillo.style.transform =
                `translate(calc(-50% + ${desplazamientoX}px), calc(-50% + ${desplazamientoY - 30}px)) scale(.4)`;
        }, retraso + 520);

        setTimeout(() => {
            brillo.remove();
        }, retraso + 1000);
    }
}

/* INTRODUCCIÓN */

function posicionInicialBus() {
    if (!autobus) return;

    autobus.style.transition = "none";
    autobus.style.left = "";
    autobus.style.opacity = "1";
}

function prepararIntroduccion() {
    introduccionActiva = true;
    bloqueado = true;

    recorrido.hidden = true;
    companero.hidden = true;
    escuela.hidden = true;

    introCamino.classList.remove(
        "activo",
        "desapareciendo"
    );

    detenerMotor();

    escenario.classList.remove(
        "intro-sacudida",
        "moviendose"
    );

    posicionInicialBus();

    introTrazo.style.transition = "none";
    introTrazo.style.strokeDasharray = "none";
    introTrazo.style.strokeDashoffset = "0";
}

function dibujarCaminoIntroduccion(duracion = 3200) {
    return new Promise((resolver) => {
        introCamino.classList.add("activo");
        introCamino.classList.remove("desapareciendo");

        const longitud =
            introTrazo.getTotalLength();

        introTrazo.style.transition = "none";

        introTrazo.style.strokeDasharray =
            `${longitud} ${longitud}`;

        introTrazo.style.strokeDashoffset =
            `${longitud}`;

        void introTrazo.getBoundingClientRect();

        requestAnimationFrame(() => {
            introTrazo.style.transition =
                `stroke-dashoffset ${duracion}ms linear`;

            introTrazo.style.strokeDashoffset = "0";
        });

        setTimeout(resolver, duracion);
    });
}

async function contarIntroduccion() {
    const actual = ++sesion;

    prepararIntroduccion();

    iniciarMotor();

    await decirConMinimo("historiaBus", 2600);

    if (
        actual !== sesion ||
        !paginaActiva
    ) {
        return;
    }

    escuela.hidden = false;

    await esperar(350);

    if (
        actual !== sesion ||
        !paginaActiva
    ) {
        return;
    }

    escenario.classList.add("intro-sacudida");

    reproducirEfecto(
        "camino-magico.mp3",
        { volumen: 0.45 }
    );

    await Promise.all([
        dibujarCaminoIntroduccion(3200),
        decirConMinimo("historiaAmigos", 3400)
    ]);

    if (
        actual !== sesion ||
        !paginaActiva
    ) {
        return;
    }

    await esperar(650);

    escenario.classList.remove("intro-sacudida");

    detenerMotor();

    introCamino.classList.add("desapareciendo");

    await esperar(450);

    if (
        actual !== sesion ||
        !paginaActiva
    ) {
        return;
    }

    introCamino.classList.remove(
        "activo",
        "desapareciendo"
    );

    escuela.hidden = true;
    introduccionActiva = false;
}

/* CONTADOR DE ESTRELLAS */

function ganarEstrella() {
    if (estrellas >= 3) return;

    const estrellasVisuales =
        document.querySelectorAll(".ruta-estrella");

    const estrella = estrellasVisuales[estrellas];

    if (estrella) {
        estrella.textContent = "⭐";
        estrella.classList.add("ganada");
    }

    estrellas++;

    const contador =
        obtenerElemento("ruta-total");

    if (contador) {
        contador.textContent = String(estrellas);
    }

    const contadoresAlternativos = [
        obtenerElemento("ruta-contador"),
        obtenerElemento("ruta-estrellas-total")
    ];

    contadoresAlternativos.forEach((elemento) => {
        if (!elemento) return;

        elemento.textContent = `${estrellas}/3`;
    });

    sonidoEstrella();
}

/* MOVIMIENTO DEL AUTOBÚS */

function activarMovimiento(activo) {
    escenario.classList.toggle(
        "moviendose",
        activo
    );
}

function moverAutobus() {
    return new Promise((resolver) => {
        activarMovimiento(true);

        reproducirEfecto(
            "arranque-bus.mp3",
            { volumen: 0.48 }
        );

        iniciarMotor();

        const inicio = performance.now();
        const duracion = 1800;

        const cajaEscenario =
            escenario.getBoundingClientRect();

        const cajaBus =
            autobus.getBoundingClientRect();

        const inicioX =
            cajaBus.left - cajaEscenario.left;

        const destinoX = Math.max(
            inicioX,
            Math.min(
                cajaEscenario.width -
                    cajaBus.width -
                    18,
                cajaEscenario.width * 0.64
            )
        );

        function animar(tiempo) {
            if (!paginaActiva) {
                activarMovimiento(false);
                detenerMotor();
                resolver();
                return;
            }

            const t = limitar(
                (tiempo - inicio) / duracion,
                0,
                1
            );

            const suave =
                t * t * (3 - 2 * t);

            const posicion =
                inicioX +
                (destinoX - inicioX) * suave;

            autobus.style.left = `${posicion}px`;

            if (t < 1) {
                animacionBus =
                    requestAnimationFrame(animar);
            } else {
                animacionBus = null;

                activarMovimiento(false);
                detenerMotor();

                reproducirEfecto(
                    "freno-bus.mp3",
                    { volumen: 0.5 }
                );

                resolver();
            }
        }

        animacionBus =
            requestAnimationFrame(animar);
    });
}

/* REINICIAR POSICIÓN DEL AUTOBÚS */

async function viajarSiguiente() {
    activarMovimiento(false);

    autobus.style.transition =
        "opacity 0.4s ease";

    autobus.style.opacity = "0";

    await esperar(450);

    if (!paginaActiva) return;

    autobus.style.transition = "none";
    autobus.style.left = "";
    autobus.style.opacity = "0";

    void autobus.offsetWidth;

    autobus.style.transition =
        "opacity 0.4s ease";

    autobus.style.opacity = "1";

    await esperar(450);

    autobus.style.transition = "";
}

/* COORDENADAS DEL CAMINO */

function puntoCamino(longitud) {
    return caminoFondo.getPointAtLength(
        limitar(longitud, 0, longitudTotal)
    );
}

function distancia(a, b) {
    return Math.hypot(
        a.x - b.x,
        a.y - b.y
    );
}

function puntoPuntero(evento) {
    const punto = svg.createSVGPoint();

    punto.x = evento.clientX;
    punto.y = evento.clientY;

    const matriz = svg.getScreenCTM();

    if (!matriz) return null;

    return punto.matrixTransform(
        matriz.inverse()
    );
}

function actualizarCamino(nuevaLongitud) {
    progreso = limitar(
        Math.max(progreso, nuevaLongitud),
        0,
        longitudTotal
    );

    caminoHecho.setAttribute(
        "stroke-dasharray",
        `${progreso} ${longitudTotal + 10}`
    );

    const punto = puntoCamino(progreso);

    indicador.setAttribute("cx", punto.x);
    indicador.setAttribute("cy", punto.y);
}

/* PISTAS VISUALES */

function detenerPista() {
    clearTimeout(temporizadorPista);
    temporizadorPista = null;

    if (animacionPista !== null) {
        cancelAnimationFrame(animacionPista);
        animacionPista = null;
    }

    recorrido.classList.remove("mostrar-pista");
}

function mostrarPista() {
    if (
        bloqueado ||
        terminado ||
        dibujando ||
        introduccionActiva
    ) {
        return;
    }

    detenerPista();

    recorrido.classList.add("mostrar-pista");

    const inicio = performance.now();
    const desde = progreso;

    const hasta = Math.min(
        longitudTotal,
        progreso + 110
    );

    function animar(tiempo) {
        if (
            bloqueado ||
            terminado ||
            dibujando ||
            introduccionActiva
        ) {
            animacionPista = null;

            recorrido.classList.remove(
                "mostrar-pista"
            );

            return;
        }

        const t =
            ((tiempo - inicio) % 1800) / 1800;

        const punto = puntoCamino(
            desde + (hasta - desde) * t
        );

        pista.setAttribute("cx", punto.x);
        pista.setAttribute("cy", punto.y);

        animacionPista =
            requestAnimationFrame(animar);
    }

    animacionPista =
        requestAnimationFrame(animar);
}

function programarPista() {
    detenerPista();

    if (
        bloqueado ||
        terminado ||
        introduccionActiva
    ) {
        return;
    }

    temporizadorPista = setTimeout(
        mostrarPista,
        3000
    );
}

/* PREPARAR RECORRIDO */

function prepararCamino() {
    const datos = NINOS[etapa];

    caminoFondo.setAttribute(
        "d",
        datos.camino
    );

    caminoGuia.setAttribute(
        "d",
        datos.camino
    );

    caminoHecho.setAttribute(
        "d",
        datos.camino
    );

    longitudTotal =
        caminoFondo.getTotalLength();

    progreso = 0;
    dibujando = false;
    punteroActivo = null;
    instruccionReproducida = false;

    const primero = puntoCamino(0);
    const ultimo = puntoCamino(longitudTotal);

    origen.setAttribute("cx", primero.x);
    origen.setAttribute("cy", primero.y);

    destino.setAttribute("cx", ultimo.x);
    destino.setAttribute("cy", ultimo.y);

    indicador.setAttribute("cx", primero.x);
    indicador.setAttribute("cy", primero.y);

    pista.setAttribute("cx", primero.x);
    pista.setAttribute("cy", primero.y);

    caminoHecho.setAttribute(
        "stroke-dasharray",
        `0 ${longitudTotal + 10}`
    );

    recorrido.classList.remove("terminado");
    recorrido.hidden = false;
}

/* SEGUIR LA LÍNEA */

function buscarPuntoCercano(punto) {
    const desde = Math.max(
        0,
        progreso - 25
    );

    const hasta = Math.min(
        longitudTotal,
        progreso + NINOS[etapa].avance
    );

    let mejorLongitud = progreso;
    let mejorDistancia = Infinity;

    for (
        let longitud = desde;
        longitud <= hasta;
        longitud += 4
    ) {
        const candidato =
            puntoCamino(longitud);

        const separacion =
            distancia(punto, candidato);

        if (separacion < mejorDistancia) {
            mejorDistancia = separacion;
            mejorLongitud = longitud;
        }
    }

    const extremo = puntoCamino(hasta);

    const separacionFinal =
        distancia(punto, extremo);

    if (separacionFinal < mejorDistancia) {
        mejorDistancia = separacionFinal;
        mejorLongitud = hasta;
    }

    return {
        longitud: mejorLongitud,
        distancia: mejorDistancia
    };
}

function comenzarDibujo(evento) {
    if (
        bloqueado ||
        terminado ||
        introduccionActiva ||
        recorrido.hidden
    ) {
        return;
    }

    if (
        evento.pointerType === "mouse" &&
        evento.button !== 0
    ) {
        return;
    }

    const punto = puntoPuntero(evento);

    if (!punto) return;

    const esperado = puntoCamino(progreso);

    if (
        distancia(punto, esperado) >
        NINOS[etapa].tolerancia
    ) {
        mostrarPista();
        return;
    }

    evento.preventDefault();

    dibujando = true;
    punteroActivo = evento.pointerId;

    detenerPista();

    try {
        recorrido.setPointerCapture(
            evento.pointerId
        );
    } catch (error) {
        console.warn(
            "Captura de puntero no disponible."
        );
    }

    if (!instruccionReproducida) {
        instruccionReproducida = true;

        efectoTrazo = reproducirEfecto(
            "trazar.mp3",
            { volumen: 1 }
        );
    }

    continuarDibujo(evento);
}

function continuarDibujo(evento) {
    if (
        !dibujando ||
        evento.pointerId !== punteroActivo ||
        bloqueado ||
        terminado ||
        introduccionActiva
    ) {
        return;
    }

    evento.preventDefault();

    const punto = puntoPuntero(evento);

    if (!punto) return;

    const cercano =
        buscarPuntoCercano(punto);

    if (
        cercano.distancia >
        NINOS[etapa].tolerancia
    ) {
        return;
    }

    if (cercano.longitud > progreso) {
        actualizarCamino(cercano.longitud);
    }

    if (
        progreso >= longitudTotal * 0.95
    ) {
        completarCamino();
    }
}

function finalizarDibujo(evento) {
    if (
        !dibujando ||
        evento.pointerId !== punteroActivo
    ) {
        return;
    }

    dibujando = false;
    punteroActivo = null;

    try {
        recorrido.releasePointerCapture(
            evento.pointerId
        );
    } catch (error) {
        // La captura puede finalizar automáticamente.
    }

    if (!bloqueado && !terminado) {
        programarPista();
    }
}

/* DIBUJAR PERSONAJES */

function dibujarNino(n, soloCabeza = false) {
    const atras = {
        larga: `
            <path
                d="M20 60 Q20 8 60 8 Q100 8 100 60 L104 124 L16 124 Z"
                fill="${n.pelo}"
            ></path>
        `,
        rizos: [
            [24, 50, 16],
            [96, 50, 16],
            [34, 24, 16],
            [86, 24, 16],
            [60, 14, 18],
            [18, 76, 12],
            [102, 76, 12]
        ].map(
            ([x, y, r]) => `
                <circle
                    cx="${x}"
                    cy="${y}"
                    r="${r}"
                    fill="${n.pelo}"
                ></circle>
            `
        ).join(""),
        corto: ""
    }[n.estilo];

    const adelante = {
        larga: `
            <path
                d="M26 56 Q60 6 94 56 Q60 34 26 56 Z"
                fill="${n.pelo}"
            ></path>
        `,
        rizos: `
            <path
                d="M30 50 Q60 14 90 50 Q60 38 30 50 Z"
                fill="${n.pelo}"
            ></path>
        `,
        corto: `
            <path
                d="M26 60 Q24 12 60 12 Q96 12 94 60 Q60 36 26 60 Z"
                fill="${n.pelo}"
            ></path>
        `
    }[n.estilo];

    const silla = n.silla ? {
        atras: `
            <rect
                x="26" y="98"
                width="68" height="56"
                rx="8"
                fill="#5A5F73"
            ></rect>

            <ellipse
                cx="11" cy="146"
                rx="9" ry="29"
                fill="none"
                stroke="#3A3D4F"
                stroke-width="5"
            ></ellipse>

            <ellipse
                cx="109" cy="146"
                rx="9" ry="29"
                fill="none"
                stroke="#3A3D4F"
                stroke-width="5"
            ></ellipse>

            <rect
                x="20" y="124"
                width="10" height="5"
                rx="2"
                fill="#3A3D4F"
            ></rect>

            <rect
                x="90" y="124"
                width="10" height="5"
                rx="2"
                fill="#3A3D4F"
            ></rect>
        `,
        delante: `
            <rect
                x="22" y="150"
                width="76" height="7"
                rx="3"
                fill="#3A3D4F"
            ></rect>

            <rect
                x="34" y="172"
                width="52" height="5"
                rx="2"
                fill="#3A3D4F"
            ></rect>

            <circle
                cx="26" cy="178"
                r="5"
                fill="#3A3D4F"
            ></circle>

            <circle
                cx="94" cy="178"
                r="5"
                fill="#3A3D4F"
            ></circle>
        `
    } : null;

    const cuerpo = n.silla
        ? `
            <rect
                x="42" y="148"
                width="13" height="24"
                rx="5"
                fill="${n.piel}"
            ></rect>

            <rect
                x="65" y="148"
                width="13" height="24"
                rx="5"
                fill="${n.piel}"
            ></rect>

            <path
                d="M34 104 L86 104 L94 152 L26 152 Z"
                fill="${n.ropa}"
            ></path>

            <path
                d="M48 104 L60 120 L72 104 Z"
                fill="#FFFFFF"
            ></path>
        `
        : n.vestido
            ? `
                <path
                    d="M36 104 L84 104 L100 172 L20 172 Z"
                    fill="${n.ropa}"
                ></path>

                <path
                    d="M48 104 L60 120 L72 104 Z"
                    fill="#FFFFFF"
                ></path>
            `
            : `
                <path
                    d="M36 104 L84 104 L90 144 L30 144 Z"
                    fill="${n.ropa}"
                ></path>

                <path
                    d="M30 144 L90 144 L92 170 L66 170 L60 156 L54 170 L28 170 Z"
                    fill="${n.ropa2}"
                ></path>
            `;

    const vista = soloCabeza
        ? "12 0 96 92"
        : "0 0 120 184";

    return `
        <svg viewBox="${vista}" aria-hidden="true">
            ${silla ? silla.atras : ""}
            ${atras}
            ${cuerpo}

            <path
                d="M38 112 L20 144"
                stroke="${n.piel}"
                stroke-width="10"
                stroke-linecap="round"
                fill="none"
            ></path>

            <path
                d="M82 112 L102 144"
                stroke="${n.piel}"
                stroke-width="10"
                stroke-linecap="round"
                fill="none"
            ></path>

            ${silla ? silla.delante : ""}

            <ellipse
                cx="${n.silla ? 48 : 44}"
                cy="${n.silla ? 171 : 177}"
                rx="14"
                ry="6"
                fill="#49309A"
            ></ellipse>

            <ellipse
                cx="${n.silla ? 72 : 76}"
                cy="${n.silla ? 171 : 177}"
                rx="14"
                ry="6"
                fill="#49309A"
            ></ellipse>

            <circle
                cx="60"
                cy="62"
                r="34"
                fill="${n.piel}"
            ></circle>

            ${adelante}

            <circle
                cx="48"
                cy="64"
                r="4"
                fill="#2B1B12"
            ></circle>

            <circle
                cx="72"
                cy="64"
                r="4"
                fill="#2B1B12"
            ></circle>

            <circle
                cx="40"
                cy="74"
                r="5"
                fill="#FF7A8A"
                opacity=".55"
            ></circle>

            <circle
                cx="80"
                cy="74"
                r="5"
                fill="#FF7A8A"
                opacity=".55"
            ></circle>

            <path
                d="M50 78 Q60 88 70 78"
                stroke="#A3452B"
                stroke-width="3"
                stroke-linecap="round"
                fill="none"
            ></path>
        </svg>
    `;
}

/* MOSTRAR COMPAÑERO */

function prepararCompanero() {
    const datos = NINOS[etapa];

    const dibujo =
        obtenerElemento("companero-emoji");

    const nombre =
        obtenerElemento("companero-nombre");

    if (dibujo) {
        dibujo.innerHTML = dibujarNino(datos);
    }

    if (nombre) {
        nombre.textContent = datos.nombre;
    }

    companero.classList.remove("subiendo");
    companero.hidden = false;
}

function mostrarCompanero() {
    if (
        terminado ||
        introduccionActiva ||
        etapa >= NINOS.length ||
        !paginaActiva
    ) {
        return;
    }

    prepararCompanero();
    prepararCamino();

    bloqueado = false;

    decir(NINOS[etapa].dialogo);

    programarPista();
}

/* CAMINO COMPLETADO */

async function completarCamino() {
    if (
        bloqueado ||
        terminado ||
        introduccionActiva
    ) {
        return;
    }

    bloqueado = true;
    dibujando = false;
    punteroActivo = null;

    detenerPista();
    detenerEfecto(efectoTrazo);

    actualizarCamino(longitudTotal);

    recorrido.classList.add("terminado");

    sonidoTilin();

    try {
        crearBrillitosCamino();
    } catch (error) {
        console.warn(
            "No se pudieron mostrar todos los brillitos.",
            error
        );
    }

    await esperar(1050);

    recorrido.hidden = true;

    await moverAutobus();

    await recogerCompanero();
}

/* RECOGER COMPAÑERO */

async function recogerCompanero() {
    if (
        etapa >= NINOS.length ||
        !paginaActiva
    ) {
        return;
    }

    const datos = NINOS[etapa];

    if (puerta) {
        puerta.classList.add("abierta");
    }

    reproducirEfecto(
        "puerta-bus.mp3",
        { volumen: 0.55 }
    );

    decir(
        datos.nombre === "Sol"
            ? "bienSol"
            : "bien"
    );

    await esperar(400);

    reproducirEfecto(
        "camino-magico.mp3",
        { volumen: 0.5 }
    );

    companero.classList.add("subiendo");

    await esperar(850);

    if (!paginaActiva) return;

    const ventana = ventanas[etapa];

    if (ventana) {
        ventana.innerHTML =
            dibujarNino(datos, true);
    }

    if (puerta) {
        puerta.classList.remove("abierta");
    }

    companero.hidden = true;

    // LA ESTRELLA SE REGISTRA ANTES DE LOS EFECTOS VISUALES
    ganarEstrella();

    try {
        crearDestellos();
    } catch (error) {
        console.warn(
            "No se pudieron mostrar los destellos.",
            error
        );
    }

    await esperar(700);

    if (!paginaActiva) return;

    etapa++;

    if (etapa >= NINOS.length) {
        await finalizarMision();
        return;
    }

    await viajarSiguiente();

    if (!paginaActiva) return;

    mostrarCompanero();
}

/* GUARDAR PROGRESO */

function guardarProgreso() {
    try {
        const guardado = JSON.parse(
            localStorage.getItem(
                CLAVE_PROGRESO
            ) || "{}"
        );

        const datos =
            guardado &&
            typeof guardado === "object"
                ? guardado
                : {};

        if (!Array.isArray(datos.completadas)) {
            datos.completadas = [];
        }

        if (
            !datos.completadas
                .map(Number)
                .includes(3)
        ) {
            datos.completadas.push(3);
        }

        if (
            !datos.estrellas ||
            typeof datos.estrellas !== "object"
        ) {
            datos.estrellas = {};
        }

        datos.estrellas[3] = 3;

        localStorage.setItem(
            CLAVE_PROGRESO,
            JSON.stringify(datos)
        );
    } catch (error) {
        console.warn(
            "No se pudo guardar el progreso.",
            error
        );
    }
}

/* FINALIZAR MISIÓN */

async function finalizarMision() {
    terminado = true;
    bloqueado = true;

    detenerPista();

    recorrido.hidden = true;
    companero.hidden = true;

    const decoracion =
        obtenerElemento("ruta-decoracion");

    if (decoracion) {
        decoracion.hidden = true;
    }

    escuela.hidden = false;

    guardarProgreso();

    activarMovimiento(true);

    detenerMotor();
    detenerTodosLosEfectos();

    const vozFinal = decir("final");

    await esperar(1200);

    activarMovimiento(false);

    await Promise.all([
        vozFinal,
        esperar(1300)
    ]);

    detenerAudio();

    if (
        typeof window.mostrarCelebracion === "function"
    ) {
        window.mostrarCelebracion({
            mision: 3,
            estrellas: 3,
            titulo: "¡Misión completada!",
            mensaje: "¡La escuela es para todos!",
            audio: RUTA_AUDIO + "victoria.mp3",
            destino: "../mapa.html"
        });
    } else {
        console.warn(
            "No se encontró la función mostrarCelebracion."
        );
    }
}

/* EVENTOS DEL RECORRIDO */

if (recorrido) {
    recorrido.addEventListener(
        "pointerdown",
        comenzarDibujo
    );

    recorrido.addEventListener(
        "pointermove",
        continuarDibujo
    );

    recorrido.addEventListener(
        "pointerup",
        finalizarDibujo
    );

    recorrido.addEventListener(
        "pointercancel",
        finalizarDibujo
    );

    recorrido.addEventListener(
        "lostpointercapture",
        () => {
            if (
                !bloqueado &&
                dibujando
            ) {
                dibujando = false;
                punteroActivo = null;
                programarPista();
            }
        }
    );
}

/* REPETIR AUDIO */

if (botonAudio) {
    botonAudio.addEventListener(
        "click",
        () => {
            decir(ultimoDialogo);
        }
    );
}

/* CERRAR PÁGINA */

window.addEventListener("pagehide", () => {
    paginaActiva = false;
    sesion++;

    detenerAudio();
    detenerPista();
    detenerTodosLosEfectos();

    if (animacionBus !== null) {
        cancelAnimationFrame(animacionBus);
        animacionBus = null;
    }

    if (escenario) {
        escenario.classList.remove(
            "intro-sacudida",
            "moviendose"
        );
    }
});

/* INICIAR MISIÓN */

async function iniciarJuego() {
    bloqueado = true;
    terminado = false;
    etapa = 0;
    estrellas = 0;

    posicionInicialBus();

    const contador =
        obtenerElemento("ruta-total");

    if (contador) {
        contador.textContent = "0";
    }

    await contarIntroduccion();

    if (
        terminado ||
        !paginaActiva ||
        introduccionActiva
    ) {
        return;
    }

    await esperar(250);

    mostrarCompanero();
}

iniciarJuego();
