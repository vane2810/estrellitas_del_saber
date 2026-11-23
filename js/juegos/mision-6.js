/* ESTRELLITAS DEL SABER - MISIÓN 6: MI ÁLBUM DE LA ESCUELA */

"use strict";

const $ = (id) => document.getElementById(id);

const NUMERO_MISION = 6;

const RUTA_AUDIO = "../../audio/juegos/mision-6/";
const RUTA_STARLY = "../../img/personajes/starly/";
const CLAVE_PROGRESO = "estrellitas_del_saber_progreso";
const CLAVE_CONFIGURACION = "estrellitas_del_saber_configuracion";

// Tiempo sin hacer nada antes de dar una pista (ms).
const ESPERA_PISTA = 7000;

// Después de cuántos errores en una página el acierto empieza a saltar.
const ERRORES_PARA_AYUDA = 2;

// Páginas (empezando en 0) en las que se gana una estrella: 2, 4 y 5.
const ESTRELLAS_EN = [1, 3, 4];

const escenario = $("alb-escenario");
const mensaje = $("alb-mensaje");
const botonAudio = $("alb-audio");
const starly = $("alb-starly");
const libro = $("alb-libro");
const derecha = $("alb-der");
const puntos = Array.from(document.querySelectorAll("#alb-puntos span"));
const minis = Array.from(document.querySelectorAll(".alb-mini"));
const hueco = $("alb-hueco");
const bandeja = $("alb-bandeja");
const foto = $("alb-foto");
const polaroid = $("alb-polaroid");
const flash = $("alb-flash");
const mano = $("alb-mano");
const efectos = $("alb-efectos");

/* Los niños del autobús (mismos dibujos que en las misiones 3 y 5). */

const NINOS = [
    { id: "ana", nombre: "ANA",
      estilo: "larga", piel: "#E8B48A", pelo: "#5B3420", ropa: "#FF7BA9", ropa2: "#FF7BA9", vestido: true },
    { id: "luis", nombre: "LUIS",
      estilo: "corto", piel: "#D99A6C", pelo: "#1F1410", ropa: "#4FA3F7", ropa2: "#3B4FA0", vestido: false },
    { id: "sol", nombre: "SOL",
      estilo: "rizos", piel: "#B9784B", pelo: "#2B1B12", ropa: "#FFC83D", ropa2: "#FFC83D", vestido: true, silla: true }
];

const EXPRESIONES = {
    feliz: ["starly_explorador.webp", "Starly contento"],
    celebrando: ["starly_globos.webp", "Starly celebrando con globos"]
};

// Textos cortos de Starly y su audio.

const DIALOGOS = {
    repasar: [
        "¡Vamos a recordar lo que aprendimos!",
        "repasar.mp3"
    ],
    instrucciones: [
        "Elige una calcomanía y llévala al álbum",
        "instrucciones.mp3"
    ],
    p1: [
        "¿Qué llevamos para aprender?",
        "pregunta-1.mp3"
    ],
    p2: [
        "¿Cómo llegamos a la escuela?",
        "pregunta-2.mp3"
    ],
    p3: [
        "¿Dónde aprendemos juntos?",
        "pregunta-3.mp3"
    ],
    p4: [
        "¿Qué usamos para escribir?",
        "pregunta-4.mp3"
    ],
    p5: [
        "¿Con quiénes aprendemos?",
        "pregunta-5.mp3"
    ],
    bien1: [
        "¡Muy bien! Los útiles nos ayudan a aprender",
        "bien-1.mp3"
    ],
    bien2: [
        "¡Excelente! Todos podemos llegar a la escuela",
        "bien-2.mp3"
    ],
    bien3: [
        "¡Así es! La escuela es para todos",
        "bien-3.mp3"
    ],
    bien4: [
        "¡Muy bien! Aprendemos a escribir",
        "bien-4.mp3"
    ],
    bien5: [
        "¡Excelente! Aprendemos mejor juntos",
        "bien-5.mp3"
    ],
    intenta: [
        "¡Casi! Intenta con otra",
        "intenta.mp3"
    ],
    pista: [
        "¡Busca la calcomanía correcta!",
        "pista.mp3"
    ],
    final: [
        "¡Logramos recordar todo lo aprendido!",
        "final.mp3"
    ]
};


function grupoHtml() {
    return `<span class="alb-grupo">${NINOS.map((n) => dibujarNino(n)).join("")}</span>`;
}

// En cada página hay 3 calcomanías y solo una responde la pregunta.
const PAGINAS = [
    { calcos: [{ html: "🎒", ok: true }, { html: "⚽" }, { html: "🧸" }] },
    { calcos: [{ html: "🚌", ok: true }, { html: "🚀" }, { html: "🛏️" }] },
    { calcos: [{ html: "🏫", ok: true }, { html: "🛒" }, { html: "⛺" }] },
    { calcos: [{ html: "✏️", ok: true }, { html: "🍕" }, { html: "🧦" }] },
    { calcos: [{ html: grupoHtml(), ok: true }, { html: "🐶" }, { html: "🦖" }] }
];

let configuracion = { musica: true, efectos: true, voz: true };

try {
    const guardada = JSON.parse(localStorage.getItem(CLAVE_CONFIGURACION) || "{}");
    if (guardada && typeof guardada === "object") {
        configuracion = { ...configuracion, ...guardada };
    }
} catch (error) {
    console.warn("Se utilizará la configuración predeterminada.");
}

let pagina = 0;
let procesando = false;
let terminado = false;
let interactuado = false;
let fallos = 0;
let pistasPagina = 0;
let token = 0;
let ultimoDialogo = "repasar";
let animacionMano = null;
let destellosFinal = null;
let audioActual = null;
let resolverDialogo = null;
let contextoAudio = null;
let temporizadorPista = null;
let expresionActual = "";
let arrastreCalco = null;

function pausa(ms) {
    return new Promise((resolver) => setTimeout(resolver, ms));
}

/* Caras de Starly */

function cambiarStarly(clave, brincar = false) {
    const expresion = EXPRESIONES[clave];

    if (!expresion) return;

    expresionActual = clave;

    const comprobacion = new Image();

    comprobacion.onload = () => {
        if (expresionActual === clave) {
            starly.src = RUTA_STARLY + expresion[0];
            starly.alt = expresion[1];
        }
    };

    comprobacion.src = RUTA_STARLY + expresion[0];

    if (brincar) {
        starly.classList.remove("reaccion");
        void starly.offsetWidth;
        starly.classList.add("reaccion");
        setTimeout(() => starly.classList.remove("reaccion"), 600);
    }
}

/* Voz de Starly */

function detenerAudio() {
    const pendiente = resolverDialogo;

    resolverDialogo = null;

    if (audioActual) {
        audioActual.pause();
        audioActual.currentTime = 0;
        audioActual = null;
    }

    botonAudio.classList.remove("reproduciendo");

    if (pendiente) {
        pendiente();
    }
}

// Muestra el texto y reproduce el audio. La promesa se cumple cuando el
// audio termina (o falla, o lo interrumpen).
function decir(clave) {
    const dialogo = DIALOGOS[clave];

    if (!dialogo) {
        return Promise.resolve(false);
    }

    ultimoDialogo = clave;
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
            if (resuelto) {
                return;
            }

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

        audio.addEventListener("ended", () => terminar(true), { once: true });
        audio.addEventListener("error", () => terminar(false), { once: true });

        audio.play().then(() => {
            if (audioActual === audio && !audio.paused) {
                botonAudio.classList.add("reproduciendo");
            }
        }).catch(() => terminar(false));
    });
}

// Dice algo y espera a que termine (máximo "limite"), y como mínimo "minimo".
function dialogoConLimite(clave, limite = 6000, minimo = 0) {
    return Promise.all([
        Promise.race([decir(clave), pausa(limite)]),
        pausa(minimo)
    ]);
}

/* Efectos de sonido (los hace el navegador, no necesitan archivos) */

function contexto() {
    if (!configuracion.efectos) return null;

    try {
        const Contexto = window.AudioContext || window.webkitAudioContext;
        if (!Contexto) return null;

        if (!contextoAudio) contextoAudio = new Contexto();

        return contextoAudio;
    } catch (error) {
        return null;
    }
}

function tono(frecuencia, duracion = 0.2, volumen = 0.045, retraso = 0) {
    const ctx = contexto();
    if (!ctx) return;

    const inicio = ctx.currentTime + retraso;
    const oscilador = ctx.createOscillator();
    const ganancia = ctx.createGain();

    oscilador.type = "sine";
    oscilador.frequency.value = frecuencia;

    ganancia.gain.setValueAtTime(volumen, inicio);
    ganancia.gain.exponentialRampToValueAtTime(0.001, inicio + duracion);

    oscilador.connect(ganancia);
    ganancia.connect(ctx.destination);

    oscilador.start(inicio);
    oscilador.stop(inicio + duracion);
}

/* Estrellas y destellos */

function ganarEstrella(numero) {
    const estrella = document.querySelectorAll(".alb-estrella")[numero - 1];

    if (!estrella) return;

    estrella.textContent = "⭐";
    estrella.classList.add("ganada");
    $("alb-total").textContent = numero;
    tono(880);
}

function crearDestellos(zona) {
    const caja = zona.getBoundingClientRect();
    const base = escenario.getBoundingClientRect();

    for (let i = 0; i < 10; i++) {
        const destello = document.createElement("span");
        destello.className = "alb-destello";
        destello.textContent = "✦";
        destello.style.left = caja.left - base.left + Math.random() * caja.width + "px";
        destello.style.top = caja.top - base.top + Math.random() * caja.height + "px";

        efectos.appendChild(destello);
        setTimeout(() => destello.remove(), 1000);
    }
}

/* Los niños */

function dibujarNino(n) {
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

    return `<svg viewBox="0 0 120 184">
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

function limitar(valor, minimo, maximo) {
    return Math.max(minimo, Math.min(valor, maximo));
}



function limitar(valor, minimo, maximo) {
    return Math.max(minimo, Math.min(valor, maximo));
}

function mezclar(lista) {
    const copia = lista.slice();

    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }

    return copia;
}

/* Más efectos de sonido */

function ruido(duracion = 0.25, desde = 600, hasta = 3000, volumen = 0.05) {
    const ctx = contexto();
    if (!ctx) return;

    const muestras = Math.floor(ctx.sampleRate * duracion);
    const memoria = ctx.createBuffer(1, muestras, ctx.sampleRate);
    const datos = memoria.getChannelData(0);

    for (let i = 0; i < muestras; i++) {
        datos[i] = (Math.random() * 2 - 1) * (1 - i / muestras);
    }

    const fuente = ctx.createBufferSource();
    const filtro = ctx.createBiquadFilter();
    const ganancia = ctx.createGain();

    filtro.type = "bandpass";
    filtro.frequency.setValueAtTime(desde, ctx.currentTime);
    filtro.frequency.exponentialRampToValueAtTime(hasta, ctx.currentTime + duracion);
    ganancia.gain.value = volumen;

    fuente.buffer = memoria;
    fuente.connect(filtro);
    filtro.connect(ganancia);
    ganancia.connect(ctx.destination);
    fuente.start();
}

function sonidoAcierto() {
    tono(587, 0.14);
    tono(740, 0.14, 0.045, 0.11);
    tono(988, 0.22, 0.045, 0.22);
}

// Suave, para que equivocarse no asuste.
function sonidoError() {
    tono(330, 0.16, 0.035);
    tono(262, 0.22, 0.035, 0.14);
}

function sonidoPegar() {
    tono(300, 0.06, 0.06);
    tono(620, 0.1, 0.05, 0.05);
}

function sonidoPagina() {
    ruido(0.3, 500, 3200, 0.05);
}

// "Clic" de la cámara al salir la foto.
function sonidoClic() {
    tono(2200, 0.04, 0.06);
    tono(1000, 0.09, 0.05, 0.06);
}

function sonidoFanfarria() {
    [523, 659, 784, 1047].forEach((f, i) => tono(f, 0.25, 0.05, i * 0.13));
    [523, 659, 784, 1047].forEach((f) => tono(f, 0.7, 0.03, 0.6));
}

/* Efectos visuales */

function onda(zona) {
    const caja = zona.getBoundingClientRect();
    const base = escenario.getBoundingClientRect();
    const aro = document.createElement("span");

    aro.className = "alb-onda";
    aro.style.left = caja.left - base.left + caja.width / 2 + "px";
    aro.style.top = caja.top - base.top + caja.height / 2 + "px";

    efectos.appendChild(aro);
    setTimeout(() => aro.remove(), 800);
}

function confeti() {
    const colores = ["#FF7BA9", "#FFD454", "#4FA3F7", "#7BCB82", "#8467D7", "#FF9F5A"];
    const alto = escenario.clientHeight + 40;

    for (let i = 0; i < 50; i++) {
        const pieza = document.createElement("span");

        pieza.className = "alb-confeti";
        pieza.style.left = Math.random() * 100 + "%";
        pieza.style.background = colores[i % colores.length];
        pieza.style.animationDuration = 2.2 + Math.random() * 1.8 + "s";
        pieza.style.animationDelay = Math.random() * 0.9 + "s";
        pieza.style.setProperty("--caida", alto + "px");
        pieza.style.setProperty("--giro", (Math.random() * 900 - 450) + "deg");

        efectos.appendChild(pieza);
        setTimeout(() => pieza.remove(), 5500);
    }
}

/* Pistas */

function ocultarMano() {
    if (animacionMano) {
        animacionMano.cancel();
        animacionMano = null;
    }

    mano.hidden = true;
    bandeja.classList.remove("guia");
}

// La manita enseña el gesto: agarra una calcomanía y la lleva al hueco.
function mostrarMano(repeticiones = 2, origen = null) {
    ocultarMano();

    if (!mano.animate) return;

    const base = escenario.getBoundingClientRect();
    const botones = Array.from(bandeja.querySelectorAll(".alb-calco:not(.usado)"));
    const salida = (origen || botones[1] || botones[0]);

    if (!salida) return;

    const a = salida.getBoundingClientRect();
    const b = hueco.getBoundingClientRect();
    const ox = a.left + a.width / 2 - base.left;
    const oy = a.top + a.height / 2 - base.top;
    const dx = b.left + b.width / 2 - base.left - ox;
    const dy = b.top + b.height / 2 - base.top - oy;
    const punta = "translate(-50%, -8%)";

    mano.style.left = ox + "px";
    mano.style.top = oy + "px";
    mano.hidden = false;
    bandeja.classList.add("guia");

    animacionMano = mano.animate([
        { opacity: 0, transform: `translate(0px, 0px) ${punta} scale(1.3)`, offset: 0 },
        { opacity: 1, transform: `translate(0px, 0px) ${punta} scale(1)`, offset: 0.14 },
        { opacity: 1, transform: `translate(0px, 0px) ${punta} scale(0.82)`, offset: 0.26 },
        { opacity: 1, transform: `translate(${dx}px, ${dy}px) ${punta} scale(0.82)`, offset: 0.74 },
        { opacity: 1, transform: `translate(${dx}px, ${dy}px) ${punta} scale(1)`, offset: 0.84 },
        { opacity: 0, transform: `translate(${dx}px, ${dy}px) ${punta} scale(1)`, offset: 1 }
    ], { duration: 2200, iterations: repeticiones, easing: "ease-in-out" });

    animacionMano.onfinish = () => {
        mano.hidden = true;
        bandeja.classList.remove("guia");
        hueco.classList.remove("pista");
    };
}

function quitarPistas() {
    ocultarMano();
    hueco.classList.remove("pista");
    bandeja.querySelectorAll(".alb-calco").forEach((c) => c.classList.remove("llamar"));
}

function programarPista() {
    clearTimeout(temporizadorPista);

    if (terminado || procesando) return;

    temporizadorPista = setTimeout(darPista, ESPERA_PISTA);
}

function darPista() {
    if (terminado || procesando) return;

    quitarPistas();
    pistasPagina++;

    hueco.classList.add("pista");

    const botones = Array.from(bandeja.querySelectorAll(".alb-calco:not(.usado)"));

    if (pistasPagina >= 2) {
        // A la segunda pista ya señalamos la respuesta.
        const correcto = botones.find((b) => b.dataset.ok === "1");

        if (correcto) {
            correcto.classList.add("llamar");
            mostrarMano(2, correcto);
        }
    } else {
        botones.forEach((b) => b.classList.add("llamar"));
        mostrarMano(2);
    }

    decir("pista");
    programarPista();
}

function interaccion() {
    interactuado = true;
    quitarPistas();
    programarPista();
}

/* Páginas del álbum */

function dibujarPagina(indice) {
    const datos = PAGINAS[indice];

    puntos.forEach((punto, i) => {
        punto.classList.toggle("hecho", i < indice);
        punto.classList.toggle("actual", i === indice);
    });

    minis.forEach((mini, i) => mini.classList.toggle("actual", i === indice));

    hueco.className = "alb-hueco";
    hueco.innerHTML = '<span class="alb-interrogante" aria-hidden="true">?</span>';

    bandeja.innerHTML = "";
    mezclar(datos.calcos).forEach((calco, i) => {
        const boton = document.createElement("button");

        boton.type = "button";
        boton.className = "alb-calco";
        boton.dataset.ok = calco.ok ? "1" : "0";
        boton.setAttribute("aria-label", "Calcomanía " + (i + 1));
        boton.innerHTML = calco.html;

        bandeja.appendChild(boton);
    });

    bandeja.classList.remove("entra");
    void bandeja.offsetWidth;
    bandeja.classList.add("entra");
}

async function iniciarPagina(indice) {
    const miToken = ++token;

    pagina = indice;
    fallos = 0;
    pistasPagina = 0;
    interactuado = false;
    procesando = false;

    if (indice > 0) {
        derecha.classList.add("saliendo");
        sonidoPagina();
        await pausa(280);
        derecha.classList.remove("saliendo");
    }

    dibujarPagina(indice);

    derecha.classList.add("entrando");
    setTimeout(() => derecha.classList.remove("entrando"), 400);

    if (indice === 0) {
        // Presentación: primero Starly dice de qué se trata y luego cómo se juega.
        libro.classList.add("abriendo");
        setTimeout(() => libro.classList.remove("abriendo"), 1000);
        sonidoPagina();

        await dialogoConLimite("repasar", 3500, 1500);

        if (miToken !== token || interactuado || procesando) {
            programarPista();
            return;
        }

        hueco.classList.add("pista");
        mostrarMano(2);
        await dialogoConLimite("instrucciones", 5500, 3000);

        if (miToken !== token || interactuado || procesando) {
            programarPista();
            return;
        }

        ocultarMano();
        hueco.classList.remove("pista");
        await pausa(900);

        if (miToken !== token || interactuado || procesando) {
            programarPista();
            return;
        }
    }

    decir("p" + (indice + 1));
    programarPista();
}

/* Responder: arrastrar o tocar una calcomanía */

async function responder(boton) {
    if (procesando || terminado || boton.classList.contains("usado")) return;

    clearTimeout(temporizadorPista);
    quitarPistas();

    if (boton.dataset.ok !== "1") {
        // Sin castigo: la calcomanía se sacude, Starly anima y se puede probar otra.
        fallos++;
        boton.classList.remove("no");
        void boton.offsetWidth;
        boton.classList.add("no");
        setTimeout(() => boton.classList.remove("no"), 500);

        sonidoError();
        decir("intenta");

        if (fallos >= ERRORES_PARA_AYUDA) {
            const correcto = bandeja.querySelector('.alb-calco[data-ok="1"]');
            if (correcto) correcto.classList.add("llamar");
        }

        programarPista();
        return;
    }

    procesando = true;

    const numero = pagina + 1;
    const html = boton.innerHTML;

    boton.classList.add("usado");
    minis[pagina].classList.remove("actual");
    hueco.classList.add("listo");
    hueco.innerHTML = `<span class="alb-puesto">${html}</span>`;

    sonidoAcierto();
    sonidoPegar();
    crearDestellos(hueco);
    onda(hueco);
    cambiarStarly("feliz", true);

    await dialogoConLimite("bien" + numero, 5000, 1700);

    await volarAlAlbum(html);

    if (ESTRELLAS_EN.includes(pagina)) {
        ganarEstrella(ESTRELLAS_EN.indexOf(pagina) + 1);
        sonidoAcierto();
    }

    if (pagina < PAGINAS.length - 1) {
        await pausa(350);
        iniciarPagina(pagina + 1);
    } else {
        cerrarAlbum();
    }
}

// La calcomanía vuela de la página al lugar que le toca en el álbum.
async function volarAlAlbum(html) {
    const origen = hueco.querySelector(".alb-puesto");
    const destino = minis[pagina];

    if (!origen || !destino || !origen.animate) {
        destino.classList.add("lleno");
        destino.insertAdjacentHTML("beforeend", html);
        return;
    }

    const r = origen.getBoundingClientRect();
    const d = destino.getBoundingClientRect();
    const volador = document.createElement("div");

    volador.className = "alb-volador";
    volador.style.left = r.left + "px";
    volador.style.top = r.top + "px";
    volador.style.width = r.width + "px";
    volador.style.height = r.height + "px";
    volador.style.fontSize = getComputedStyle(origen).fontSize;
    volador.innerHTML = html;

    document.body.appendChild(volador);
    origen.style.visibility = "hidden";

    const dx = d.left + d.width / 2 - (r.left + r.width / 2);
    const dy = d.top + d.height / 2 - (r.top + r.height / 2);
    const escala = Math.max(0.2, Math.min(1, (d.width * 0.62) / Math.max(r.width, 1)));

    const animacion = volador.animate([
        { transform: "translate(0, 0) scale(1) rotate(0deg)" },
        { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 60}px) scale(${(1 + escala) / 2 + 0.1}) rotate(-12deg)`, offset: 0.5 },
        { transform: `translate(${dx}px, ${dy}px) scale(${escala}) rotate(0deg)` }
    ], { duration: 700, easing: "ease-in-out", fill: "forwards" });

    try {
        await animacion.finished;
    } catch (error) {
        /* se cancela si cierran la página */
    }

    volador.remove();

    destino.classList.add("lleno", "recibe");
    destino.insertAdjacentHTML("beforeend", html);
    sonidoPegar();
    crearDestellos(destino);
    setTimeout(() => destino.classList.remove("recibe"), 600);
}

/* Cierre: el álbum se cierra y aparece la foto de todos */

const POSICIONES_PEGATINAS = [[-8, 6], [93, 4], [-7, 60], [92, 58], [44, 82]];

function ponerPegatinas() {
    PAGINAS.forEach((datos, i) => {
        const bueno = datos.calcos.find((c) => c.ok);
        const pegatina = document.createElement("span");

        pegatina.className = "alb-pegatina";
        pegatina.style.left = POSICIONES_PEGATINAS[i][0] + "%";
        pegatina.style.top = POSICIONES_PEGATINAS[i][1] + "%";
        pegatina.style.setProperty("--d", 1 + i * 0.2 + "s");
        pegatina.innerHTML = bueno.html;

        polaroid.appendChild(pegatina);
    });
}

async function cerrarAlbum() {
    clearTimeout(temporizadorPista);

    await pausa(600);

    sonidoPagina();
    libro.classList.add("cerrado");

    await pausa(750);

    $("alb-foto-ninos").innerHTML = NINOS.map((n) => dibujarNino(n)).join("");
    ponerPegatinas();

    foto.hidden = false;
    flash.classList.add("on");
    sonidoClic();
    sonidoFanfarria();
    confeti();
    cambiarStarly("celebrando", true);

    await pausa(700);

    onda(polaroid);

    // Mientras se ve la foto siguen saliendo destellos y confeti.
    destellosFinal = setInterval(() => {
        crearDestellos(polaroid);
    }, 700);

    setTimeout(confeti, 2600);

    await dialogoConLimite("final", 7500, 5000);

    finalizarMision();
}

function guardarProgreso() {
    try {
        const guardado = JSON.parse(localStorage.getItem(CLAVE_PROGRESO) || "{}");
        const progreso = guardado && typeof guardado === "object" ? guardado : {};

        if (!Array.isArray(progreso.completadas)) {
            progreso.completadas = [];
        }

        if (!progreso.completadas.map(Number).includes(NUMERO_MISION)) {
            progreso.completadas.push(NUMERO_MISION);
        }

        if (!progreso.estrellas || typeof progreso.estrellas !== "object") {
            progreso.estrellas = {};
        }

        progreso.estrellas[NUMERO_MISION] = 3;
        localStorage.setItem(CLAVE_PROGRESO, JSON.stringify(progreso));
    } catch (error) {
        console.warn("No se pudo guardar el progreso.");
    }
}

function finalizarMision() {
    terminado = true;
    clearInterval(destellosFinal);
    guardarProgreso();

    if (typeof window.mostrarCelebracion === "function") {
        window.mostrarCelebracion({
            mision: NUMERO_MISION,
            estrellas: 3,
            titulo: "¡Misión completada!",
            mensaje: "¡Todos los niños tienen derecho a ir a la escuela y aprender juntos!",
            audio: RUTA_AUDIO + "victoria.mp3",
            destino: "../mapa.html"
        });
    }
}

/* Arrastre de calcomanías */

function iniciarArrastre(evento) {
    if (procesando || terminado) return;

    const boton = evento.target.closest(".alb-calco");
    if (!boton || boton.classList.contains("usado")) return;

    evento.preventDefault();
    detenerAudio();
    interaccion();

    const fantasma = document.createElement("div");

    fantasma.className = "alb-fantasma";
    fantasma.innerHTML = boton.innerHTML;
    fantasma.style.left = evento.clientX + "px";
    fantasma.style.top = evento.clientY + "px";
    document.body.appendChild(fantasma);

    arrastreCalco = {
        id: evento.pointerId,
        boton,
        fantasma,
        inicioX: evento.clientX,
        inicioY: evento.clientY,
        movido: false
    };

    boton.classList.add("arrastrando");
    try { boton.setPointerCapture(evento.pointerId); } catch (e) { /* nada */ }
}

function moverArrastre(evento) {
    if (!arrastreCalco || evento.pointerId !== arrastreCalco.id) return;

    if (Math.hypot(evento.clientX - arrastreCalco.inicioX, evento.clientY - arrastreCalco.inicioY) > 8) {
        arrastreCalco.movido = true;
    }

    arrastreCalco.fantasma.style.left = evento.clientX + "px";
    arrastreCalco.fantasma.style.top = evento.clientY + "px";
}

function soltarArrastre(evento) {
    if (!arrastreCalco || evento.pointerId !== arrastreCalco.id) return;

    const { boton, fantasma, movido } = arrastreCalco;
    const caja = hueco.getBoundingClientRect();
    const margen = 22;
    const dentro = evento.clientX >= caja.left - margen && evento.clientX <= caja.right + margen &&
        evento.clientY >= caja.top - margen && evento.clientY <= caja.bottom + margen;

    arrastreCalco = null;
    fantasma.remove();
    boton.classList.remove("arrastrando");

    if (!movido || dentro) {
        // Un toque simple también cuenta como elegir esa calcomanía.
        responder(boton);
    } else {
        programarPista();
    }
}

function calcoConTeclado(evento) {
    if (evento.detail !== 0) return;

    const boton = evento.target.closest(".alb-calco");
    if (boton) {
        interaccion();
        responder(boton);
    }
}

/* Eventos */

bandeja.addEventListener("pointerdown", iniciarArrastre);
bandeja.addEventListener("pointermove", moverArrastre);
bandeja.addEventListener("pointerup", soltarArrastre);
bandeja.addEventListener("pointercancel", soltarArrastre);
bandeja.addEventListener("click", calcoConTeclado);

botonAudio.addEventListener("click", () => decir(ultimoDialogo));

window.addEventListener("pagehide", () => {
    clearTimeout(temporizadorPista);
    clearInterval(destellosFinal);
    detenerAudio();
});

cambiarStarly("feliz");
iniciarPagina(0);