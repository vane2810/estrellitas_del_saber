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

const CLAVE_PROGRESO = "estrellitas_del_saber_progreso";
const CLAVE_CONFIGURACION = "estrellitas_del_saber_configuracion";
const RUTA_AUDIO = "../../audio/juegos/mision-3/";

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
    inicio: ["¡Vamos a la escuela!", "inicio.mp3"],
    ana: ["¡Mira, es Ana! ¡Vamos por ella!", "ana.mp3"],
    luis: ["¡Ahí está Luis! ¡Vamos!", "luis.mp3"],
    sol: ["¡Sol nos espera! ¡Vamos por ella!", "sol.mp3"],
    bien: ["¡Muy bien!", "bien.mp3"],
    bienSol: ["¡Excelente!", "bien-sol.mp3"],
    final: ["¡Llegamos todos! ¡La escuela es para todos!", "final.mp3"]
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
    const guardada = JSON.parse(
        localStorage.getItem(CLAVE_CONFIGURACION) || "{}"
    );

    if (guardada && typeof guardada === "object") {
        configuracion = { ...configuracion, ...guardada };
    }
} catch (error) {
    console.warn("Se usará la configuración predeterminada.");
}

let etapa = 0;
let estrellas = 0;
let bloqueado = true;
let terminado = false;
let dibujando = false;
let punteroActivo = null;
let longitudTotal = 0;
let progreso = 0;
let ultimoDialogo = "inicio";
let audioActual = null;
let contextoAudio = null;
let temporizadorPista = null;
let animacionPista = null;
let animacionBus = null;

/* UTILIDADES */

function esperar(ms) {
    return new Promise((resolver) => setTimeout(resolver, ms));
}

function limitar(valor, minimo, maximo) {
    return Math.max(minimo, Math.min(valor, maximo));
}

/* AUDIO */

function detenerAudio() {
    if (audioActual) {
        audioActual.pause();
        audioActual.currentTime = 0;
        audioActual = null;
    }

    botonAudio.classList.remove("reproduciendo");
}

function decir(clave) {
    const dialogo = DIALOGOS[clave];

    if (!dialogo) return;

    ultimoDialogo = clave;
    mensaje.textContent = dialogo[0];

    detenerAudio();

    if (!configuracion.voz) return;

    const audio = new Audio(RUTA_AUDIO + dialogo[1]);
    audioActual = audio;

    audio.addEventListener("ended", () => {
        if (audioActual === audio) {
            botonAudio.classList.remove("reproduciendo");
        }
    });

    audio.play().then(() => {
        if (audioActual === audio && !audio.paused) {
            botonAudio.classList.add("reproduciendo");
        }
    }).catch(() => {});
}

function tono(frecuencia, duracion = .17) {
    if (!configuracion.efectos) return;

    try {
        const Contexto = window.AudioContext || window.webkitAudioContext;

        if (!Contexto) return;

        if (!contextoAudio) {
            contextoAudio = new Contexto();
        }

        if (contextoAudio.state === "suspended") {
            contextoAudio.resume().catch(() => {});
        }

        const oscilador = contextoAudio.createOscillator();
        const ganancia = contextoAudio.createGain();

        oscilador.type = "sine";
        oscilador.frequency.value = frecuencia;

        ganancia.gain.setValueAtTime(
            .045,
            contextoAudio.currentTime
        );

        ganancia.gain.exponentialRampToValueAtTime(
            .001,
            contextoAudio.currentTime + duracion
        );

        oscilador.connect(ganancia);
        ganancia.connect(contextoAudio.destination);

        oscilador.start();
        oscilador.stop(contextoAudio.currentTime + duracion);
    } catch (error) {
        console.warn("Efecto de sonido no disponible.");
    }
}

function sonidoAcierto() {
    tono(587);
    setTimeout(() => tono(740), 120);
    setTimeout(() => tono(988, .24), 240);
}

/* ESTRELLAS */

function ganarEstrella() {
    if (estrellas >= 3) return;

    const estrella = document.querySelectorAll(".ruta-estrella")[
        estrellas
    ];

    if (estrella) {
        estrella.textContent = "★";
        estrella.classList.add("ganada");
    }

    estrellas++;
    $("ruta-total").textContent = estrellas;

    sonidoAcierto();
}

function crearDestellos() {
    const contenedor = $("ruta-efectos");

    for (let i = 0; i < 12; i++) {
        const destello = document.createElement("span");

        destello.className = "ruta-destello";
        destello.textContent = "✦";
        destello.style.left = `${25 + Math.random() * 50}%`;
        destello.style.top = `${35 + Math.random() * 35}%`;

        contenedor.appendChild(destello);

        setTimeout(() => destello.remove(), 1000);
    }
}

/* AUTOBÚS */

function posicionInicialBus() {
    autobus.style.transition = "none";
    autobus.style.left = "";
    autobus.style.opacity = "1";
}

function activarMovimiento(activo) {
    escenario.classList.toggle("moviendose", activo);
    autobus.classList.toggle("avanzando", activo);
}

function moverAutobus() {
    return new Promise((resolver) => {
        activarMovimiento(true);

        const inicio = performance.now();
        const duracion = 1800;
        const escenarioAncho = escenario.clientWidth;
        const autobusAncho = autobus.getBoundingClientRect().width;

        const inicioX =
            autobus.getBoundingClientRect().left -
            escenario.getBoundingClientRect().left;

        const destinoX = Math.max(
            inicioX,
            Math.min(
                escenarioAncho - autobusAncho - 18,
                escenarioAncho * .64
            )
        );

        function animar(tiempo) {
            const t = limitar((tiempo - inicio) / duracion, 0, 1);
            const suave = t * t * (3 - 2 * t);

            autobus.style.left =
                `${inicioX + (destinoX - inicioX) * suave}px`;

            if (t < 1) {
                animacionBus = requestAnimationFrame(animar);
            } else {
                animacionBus = null;
                activarMovimiento(false);
                resolver();
            }
        }

        animacionBus = requestAnimationFrame(animar);
    });
}

async function viajarSiguiente() {
    activarMovimiento(true);

    autobus.style.transition = "opacity .4s ease";
    autobus.style.opacity = "0";

    await esperar(450);

    posicionInicialBus();

    await esperar(100);

    autobus.style.transition = "opacity .4s ease";
    autobus.style.opacity = "1";

    await esperar(500);

    activarMovimiento(false);
}

/* COORDENADAS DEL CAMINO */

function puntoCamino(longitud) {
    return caminoFondo.getPointAtLength(
        limitar(longitud, 0, longitudTotal)
    );
}

function distancia(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function puntoPuntero(evento) {
    const punto = svg.createSVGPoint();

    punto.x = evento.clientX;
    punto.y = evento.clientY;

    const matriz = svg.getScreenCTM();

    if (!matriz) return null;

    return punto.matrixTransform(matriz.inverse());
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

/* PISTA VISUAL */

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
    if (bloqueado || terminado || dibujando) return;

    detenerPista();
    recorrido.classList.add("mostrar-pista");

    const inicio = performance.now();
    const desde = progreso;
    const hasta = Math.min(longitudTotal, progreso + 110);

    function animar(tiempo) {
        if (bloqueado || terminado || dibujando) {
            animacionPista = null;
            recorrido.classList.remove("mostrar-pista");
            return;
        }

        const t = ((tiempo - inicio) % 1800) / 1800;
        const punto = puntoCamino(desde + (hasta - desde) * t);

        pista.setAttribute("cx", punto.x);
        pista.setAttribute("cy", punto.y);

        animacionPista = requestAnimationFrame(animar);
    }

    animacionPista = requestAnimationFrame(animar);
}

function programarPista() {
    detenerPista();

    temporizadorPista = setTimeout(mostrarPista, 3000);
}

/* PREPARACIÓN DEL RECORRIDO */

function prepararCamino() {
    const datos = NINOS[etapa];

    caminoFondo.setAttribute("d", datos.camino);
    caminoGuia.setAttribute("d", datos.camino);
    caminoHecho.setAttribute("d", datos.camino);

    longitudTotal = caminoFondo.getTotalLength();
    progreso = 0;
    dibujando = false;
    punteroActivo = null;

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

    programarPista();
}

/* DETECCIÓN DEL TRAZADO */

function buscarPuntoCercano(punto) {
    const desde = Math.max(0, progreso - 25);

    const hasta = Math.min(
        longitudTotal,
        progreso + NINOS[etapa].avance
    );

    let mejorLongitud = progreso;
    let mejorDistancia = Infinity;

    for (let longitud = desde; longitud <= hasta; longitud += 4) {
        const candidato = puntoCamino(longitud);
        const separacion = distancia(punto, candidato);

        if (separacion < mejorDistancia) {
            mejorDistancia = separacion;
            mejorLongitud = longitud;
        }
    }

    const extremo = puntoCamino(hasta);
    const separacionFinal = distancia(punto, extremo);

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
    if (bloqueado || terminado || recorrido.hidden) return;

    if (evento.pointerType === "mouse" && evento.button !== 0) {
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
        recorrido.setPointerCapture(evento.pointerId);
    } catch (error) {
        console.warn("Captura de puntero no disponible.");
    }

    continuarDibujo(evento);
}

function continuarDibujo(evento) {
    if (
        !dibujando ||
        evento.pointerId !== punteroActivo ||
        bloqueado ||
        terminado
    ) {
        return;
    }

    evento.preventDefault();

    const punto = puntoPuntero(evento);

    if (!punto) return;

    const cercano = buscarPuntoCercano(punto);

    if (
        cercano.distancia >
        NINOS[etapa].tolerancia
    ) {
        return;
    }

    if (cercano.longitud > progreso) {
        actualizarCamino(cercano.longitud);
    }

    if (progreso >= longitudTotal * .95) {
        completarCamino();
    }
}

function finalizarDibujo(evento) {
    if (!dibujando || evento.pointerId !== punteroActivo) {
        return;
    }

    dibujando = false;
    punteroActivo = null;

    try {
        recorrido.releasePointerCapture(evento.pointerId);
    } catch (error) {
        // La captura puede finalizar automáticamente.
    }

    if (!bloqueado && !terminado) {
        programarPista();
    }
}

/* COMPLETAR CAMINO */

async function completarCamino() {
    if (bloqueado || terminado) return;

    bloqueado = true;
    dibujando = false;
    punteroActivo = null;

    detenerPista();
    actualizarCamino(longitudTotal);

    recorrido.classList.add("terminado");

    sonidoAcierto();
    crearDestellos();

    await esperar(650);

    recorrido.hidden = true;

    await moverAutobus();
    await recogerCompanero();
}

/* COMPAÑEROS */

// Los niños se dibujan igual que en la misión 5 (mismos colores y peinados).
function dibujarNino(n, soloCabeza = false) {
    const atras = {
        larga: `<path d="M20 60 Q20 8 60 8 Q100 8 100 60 L104 124 L16 124 Z" fill="${n.pelo}"></path>`,
        rizos: [[24, 50, 16], [96, 50, 16], [34, 24, 16], [86, 24, 16], [60, 14, 18], [18, 76, 12], [102, 76, 12]]
            .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${n.pelo}"></circle>`).join(""),
        corto: ""
    }[n.estilo];

    const adelante = {
        larga: `<path d="M26 56 Q60 6 94 56 Q60 34 26 56 Z" fill="${n.pelo}"></path>`,
        rizos: `<path d="M30 50 Q60 14 90 50 Q60 38 30 50 Z" fill="${n.pelo}"></path>`,
        corto: `<path d="M26 60 Q24 12 60 12 Q96 12 94 60 Q60 36 26 60 Z" fill="${n.pelo}"></path>`
    }[n.estilo];

    // Sol va en silla de ruedas: se dibuja sentada, con la silla vista de frente.
    const silla = n.silla ? {
        atras: `<rect x="26" y="98" width="68" height="56" rx="8" fill="#5A5F73"></rect>
                <ellipse cx="11" cy="146" rx="9" ry="29" fill="none" stroke="#3A3D4F" stroke-width="5"></ellipse>
                <ellipse cx="109" cy="146" rx="9" ry="29" fill="none" stroke="#3A3D4F" stroke-width="5"></ellipse>
                <ellipse cx="11" cy="146" rx="3" ry="4" fill="#3A3D4F"></ellipse>
                <ellipse cx="109" cy="146" rx="3" ry="4" fill="#3A3D4F"></ellipse>
                <rect x="20" y="124" width="10" height="5" rx="2" fill="#3A3D4F"></rect>
                <rect x="90" y="124" width="10" height="5" rx="2" fill="#3A3D4F"></rect>`,
        delante: `<rect x="22" y="150" width="76" height="7" rx="3" fill="#3A3D4F"></rect>
                  <rect x="34" y="172" width="52" height="5" rx="2" fill="#3A3D4F"></rect>
                  <circle cx="26" cy="178" r="5" fill="#3A3D4F"></circle>
                  <circle cx="94" cy="178" r="5" fill="#3A3D4F"></circle>`
    } : null;

    const cuerpo = n.silla
        ? `<rect x="42" y="148" width="13" height="24" rx="5" fill="${n.piel}"></rect>
           <rect x="65" y="148" width="13" height="24" rx="5" fill="${n.piel}"></rect>
           <path d="M34 104 L86 104 L94 152 L26 152 Z" fill="${n.ropa}"></path>
           <path d="M48 104 L60 120 L72 104 Z" fill="#FFFFFF"></path>`
        : n.vestido
        ? `<path d="M36 104 L84 104 L100 172 L20 172 Z" fill="${n.ropa}"></path>
           <path d="M48 104 L60 120 L72 104 Z" fill="#FFFFFF"></path>`
        : `<path d="M36 104 L84 104 L90 144 L30 144 Z" fill="${n.ropa}"></path>
           <path d="M30 144 L90 144 L92 170 L66 170 L60 156 L54 170 L28 170 Z" fill="${n.ropa2}"></path>`;

    const vista = soloCabeza ? "12 0 96 92" : "0 0 120 184";

    return `<svg viewBox="${vista}" aria-hidden="true">
        ${silla ? silla.atras : ""}
        ${atras}
        ${cuerpo}
        <path d="M38 112 L20 144" stroke="${n.piel}" stroke-width="10" stroke-linecap="round" fill="none"></path>
        <g class="luna-brazo">
            <path d="M82 112 L102 144" stroke="${n.piel}" stroke-width="10" stroke-linecap="round" fill="none"></path>
        </g>
        ${silla ? silla.delante : ""}
        <ellipse cx="${n.silla ? 48 : 44}" cy="${n.silla ? 171 : 177}" rx="14" ry="6" fill="#49309A"></ellipse>
        <ellipse cx="${n.silla ? 72 : 76}" cy="${n.silla ? 171 : 177}" rx="14" ry="6" fill="#49309A"></ellipse>
        <circle cx="60" cy="62" r="34" fill="${n.piel}"></circle>
        ${adelante}
        <circle cx="48" cy="64" r="4" fill="#2B1B12"></circle>
        <circle cx="72" cy="64" r="4" fill="#2B1B12"></circle>
        <circle cx="40" cy="74" r="5" fill="#FF7A8A" opacity="0.55"></circle>
        <circle cx="80" cy="74" r="5" fill="#FF7A8A" opacity="0.55"></circle>
        <path d="M50 78 Q60 88 70 78" stroke="#A3452B" stroke-width="3" stroke-linecap="round" fill="none"></path>
    </svg>`;
}

function prepararCompanero() {
    const datos = NINOS[etapa];

    $("companero-emoji").innerHTML = dibujarNino(datos);
    $("companero-nombre").textContent = datos.nombre;

    companero.classList.remove("subiendo");
    companero.hidden = false;
}

function mostrarCompanero() {
    if (terminado || etapa >= NINOS.length) return;

    prepararCompanero();
    prepararCamino();

    bloqueado = false;

    decir(NINOS[etapa].dialogo);
}

async function recogerCompanero() {
    const datos = NINOS[etapa];

    puerta.classList.add("abierta");

    decir(datos.nombre === "Sol" ? "bienSol" : "bien");

    await esperar(400);

    companero.classList.add("subiendo");

    await esperar(850);

    ventanas[etapa].innerHTML = dibujarNino(datos, true);

    puerta.classList.remove("abierta");
    companero.hidden = true;

    ganarEstrella();
    crearDestellos();

    await esperar(700);

    etapa++;

    if (etapa >= NINOS.length) {
        await finalizarMision();
        return;
    }

    await viajarSiguiente();
    mostrarCompanero();
}

/* GUARDAR PROGRESO */

function guardarProgreso() {
    try {
        const guardado = JSON.parse(
            localStorage.getItem(CLAVE_PROGRESO) || "{}"
        );

        const datos =
            guardado && typeof guardado === "object"
                ? guardado
                : {};

        if (!Array.isArray(datos.completadas)) {
            datos.completadas = [];
        }

        if (!datos.completadas.map(Number).includes(3)) {
            datos.completadas.push(3);
        }

        if (!datos.estrellas || typeof datos.estrellas !== "object") {
            datos.estrellas = {};
        }

        datos.estrellas[3] = 3;

        localStorage.setItem(
            CLAVE_PROGRESO,
            JSON.stringify(datos)
        );
    } catch (error) {
        console.warn("No se pudo guardar el progreso.");
    }
}

/* FINAL DE LA MISIÓN */

async function finalizarMision() {
    terminado = true;
    bloqueado = true;

    detenerPista();

    recorrido.hidden = true;
    companero.hidden = true;

    $("ruta-decoracion").hidden = true;
    $("ruta-escuela").hidden = false;

    decir("final");
    guardarProgreso();

    activarMovimiento(true);

    await esperar(1200);

    activarMovimiento(false);

    await esperar(1300);

    detenerAudio();

    if (typeof window.mostrarCelebracion === "function") {
        window.mostrarCelebracion({
            mision: 3,
            estrellas: 3,
            titulo: "¡Misión completada!",
            mensaje: "¡La escuela es para todos!",
            audio: RUTA_AUDIO + "victoria.mp3",
            destino: "../mapa.html"
        });
    }
}

/* EVENTOS */

recorrido.addEventListener("pointerdown", comenzarDibujo);
recorrido.addEventListener("pointermove", continuarDibujo);
recorrido.addEventListener("pointerup", finalizarDibujo);
recorrido.addEventListener("pointercancel", finalizarDibujo);

recorrido.addEventListener("lostpointercapture", () => {
    if (!bloqueado && dibujando) {
        dibujando = false;
        punteroActivo = null;
        programarPista();
    }
});

botonAudio.addEventListener("click", () => {
    decir(ultimoDialogo);
});

window.addEventListener("pagehide", () => {
    detenerAudio();
    detenerPista();

    if (animacionBus !== null) {
        cancelAnimationFrame(animacionBus);
    }
});

/* INICIO */

async function iniciarJuego() {
    bloqueado = true;
    recorrido.hidden = true;
    companero.hidden = true;

    posicionInicialBus();
    decir("inicio");

    await esperar(900);

    mostrarCompanero();
}

iniciarJuego();