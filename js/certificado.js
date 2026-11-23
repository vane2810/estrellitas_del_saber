/* ESTRELLITAS DEL SABER - CERTIFICADO FINAL */

"use strict";

const $ = (id) => document.getElementById(id);

const RUTA_AUDIO = "../audio/narraciones/";
const RUTA_STARLY = "../img/personajes/starly/";
const CLAVE_PROGRESO = "estrellitas_del_saber_progreso";
const CLAVE_CONFIGURACION = "estrellitas_del_saber_configuracion";

const TOTAL_MISIONES = 6;
const RUTA_MUSICA = "../audio/música/aventura-espacial.mp3";
const VOLUMEN_MUSICA = 0.22;

// Hacia dónde apunta el cohete en la imagen starlycohete.webp, en grados:
// -90 = hacia arriba, -45 = arriba a la derecha, 0 = a la derecha.
// El cohete despega en esa dirección; si ves que vuela "chueco", ajusta este número.
const DIRECCION_COHETE = -60;

const escena = $("cer-escena");
const guia = $("cer-guia");
const mensaje = $("cer-mensaje");
const botonAudio = $("cer-audio");
const starly = $("cer-starly");
const zona = $("cer-zona");
const caja = $("cer-caja");
const diploma = $("cer-diploma");
const medalla = $("cer-medalla");
const navePos = $("cer-nave-pos");
const nave = $("cer-nave");
const cohete = $("cer-cohete");
const respaldoCohete = $("cer-cohete-respaldo");
const lineas = $("cer-lineas");
const fugaz = $("cer-fugaz");
const cola = $("cer-cola");
const despedida = $("cer-despedida");
const botones = $("cer-botones");
const efectos = $("cer-efectos");

/* Los niños del autobús (mismos dibujos que en las misiones anteriores). */

const NINOS = [
    { id: "ana", nombre: "ANA",
      estilo: "larga", piel: "#E8B48A", pelo: "#5B3420", ropa: "#FF7BA9", ropa2: "#FF7BA9", vestido: true },
    { id: "luis", nombre: "LUIS",
      estilo: "corto", piel: "#D99A6C", pelo: "#1F1410", ropa: "#4FA3F7", ropa2: "#3B4FA0", vestido: false },
    { id: "sol", nombre: "SOL",
      estilo: "rizos", piel: "#B9784B", pelo: "#2B1B12", ropa: "#FFC83D", ropa2: "#FFC83D", vestido: true, silla: true }
];

const EXPRESIONES = {
    celebrando: ["starly_globos.webp", "Starly celebrando con globos"],
    feliz: ["starly_explorador.webp", "Starly explorador"]
};

// Textos cortos de Starly y su audio.
const DIALOGOS = {
    ganaste: ["¡Ganaste el certificado final de La Escuela de las Estrellas!", "ganaste.mp3"],
    derecho: ["¡Todos tenemos derecho a la educación!", "derecho.mp3"],
    gusto: ["¡Fue un gusto compartir contigo!", "gusto.mp3"],
    hastaPronto: ["¡Hasta pronto!", "hasta-pronto.mp3"]
};

let configuracion = { musica: true, efectos: true, voz: true };

try {
    const guardada = JSON.parse(localStorage.getItem(CLAVE_CONFIGURACION) || "{}");
    if (guardada && typeof guardada === "object") {
        configuracion = { ...configuracion, ...guardada };
    }
} catch (error) {
    console.warn("Se utilizará la configuración predeterminada.");
}

let ultimoDialogo = "ganaste";
let audioActual = null;
let resolverDialogo = null;
let contextoAudio = null;
let expresionActual = "";
let medallaLista = false;
let terminado = false;

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
        subirMusica(VOLUMEN_MUSICA * 0.4, 300);

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

            subirMusica(VOLUMEN_MUSICA, 600);
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

function tono(frecuencia, duracion = 0.2, volumen = 0.045, retraso = 0, tipo = "sine") {
    const ctx = contexto();
    if (!ctx) return;

    const inicio = ctx.currentTime + retraso;
    const oscilador = ctx.createOscillator();
    const ganancia = ctx.createGain();

    oscilador.type = tipo;
    oscilador.frequency.value = frecuencia;

    ganancia.gain.setValueAtTime(volumen, inicio);
    ganancia.gain.exponentialRampToValueAtTime(0.001, inicio + duracion);

    oscilador.connect(ganancia);
    ganancia.connect(ctx.destination);

    oscilador.start(inicio);
    oscilador.stop(inicio + duracion);
}

// Un tono que sube o baja de frecuencia (motor, estrella fugaz).
function barrido(desde, hasta, duracion = 1, volumen = 0.04, tipo = "sine", retraso = 0) {
    const ctx = contexto();
    if (!ctx) return;

    const inicio = ctx.currentTime + retraso;
    const oscilador = ctx.createOscillator();
    const ganancia = ctx.createGain();

    oscilador.type = tipo;
    oscilador.frequency.setValueAtTime(desde, inicio);
    oscilador.frequency.exponentialRampToValueAtTime(hasta, inicio + duracion);

    ganancia.gain.setValueAtTime(0.001, inicio);
    ganancia.gain.linearRampToValueAtTime(volumen, inicio + duracion * 0.25);
    ganancia.gain.exponentialRampToValueAtTime(0.001, inicio + duracion);

    oscilador.connect(ganancia);
    ganancia.connect(ctx.destination);

    oscilador.start(inicio);
    oscilador.stop(inicio + duracion);
}

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

function sonidoFanfarria() {
    [523, 659, 784, 1047].forEach((f, i) => tono(f, 0.25, 0.05, i * 0.13));
    [523, 659, 784, 1047].forEach((f) => tono(f, 0.8, 0.03, 0.6));
}

function sonidoWhoosh() {
    ruido(0.6, 300, 2600, 0.05);
}

function sonidoGolpe() {
    tono(110, 0.3, 0.12, 0, "triangle");
    ruido(0.2, 200, 900, 0.08);
}

function sonidoMotor() {
    barrido(70, 220, 1.6, 0.05, "sawtooth");
    ruido(1.4, 150, 900, 0.03);
}

function sonidoDespegue() {
    barrido(120, 1100, 2.3, 0.045, "sawtooth");
    ruido(2.2, 200, 3500, 0.05);
}

function sonidoFugaz() {
    barrido(1400, 3400, 1.1, 0.03);
    [1568, 1976, 2349, 2637].forEach((f, i) => tono(f, 0.3, 0.025, 0.1 + i * 0.12));
}

/* Efectos visuales */

function posicionEnEscena(elemento) {
    const base = escena.getBoundingClientRect();
    const r = elemento.getBoundingClientRect();

    return { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2, ancho: r.width, alto: r.height };
}

function destellos(elemento, cantidad = 10) {
    const base = escena.getBoundingClientRect();
    const r = elemento.getBoundingClientRect();

    for (let i = 0; i < cantidad; i++) {
        const d = document.createElement("span");

        d.className = "cer-destello";
        d.textContent = "✦";
        d.style.left = r.left - base.left + Math.random() * r.width + "px";
        d.style.top = r.top - base.top + Math.random() * r.height + "px";
        d.style.fontSize = 18 + Math.random() * 18 + "px";

        efectos.appendChild(d);
        setTimeout(() => d.remove(), 1000);
    }
}

function onda(elemento) {
    const p = posicionEnEscena(elemento);
    const aro = document.createElement("span");

    aro.className = "cer-onda";
    aro.style.left = p.x + "px";
    aro.style.top = p.y + "px";

    efectos.appendChild(aro);
    setTimeout(() => aro.remove(), 900);
}

function confeti(cantidad = 36) {
    const colores = ["#F7A8C4", "#FFD98A", "#8DC4F7", "#A6DDA9", "#B9A4F1"];
    const alto = escena.clientHeight + 40;

    for (let i = 0; i < cantidad; i++) {
        const pieza = document.createElement("span");

        pieza.className = "cer-confeti";
        pieza.style.left = Math.random() * 100 + "%";
        pieza.style.background = colores[i % colores.length];
        pieza.style.animationDuration = 2.4 + Math.random() * 2 + "s";
        pieza.style.animationDelay = Math.random() * 0.9 + "s";
        pieza.style.setProperty("--caida", alto + "px");
        pieza.style.setProperty("--giro", (Math.random() * 900 - 450) + "deg");

        efectos.appendChild(pieza);
        setTimeout(() => pieza.remove(), 6000);
    }
}

function globos(cantidad = 5) {
    const colores = ["#F7A8C4", "#8DC4F7", "#FFDF8A", "#A6DDA9", "#C4AEF2", "#FFBE8A"];

    for (let i = 0; i < cantidad; i++) {
        const g = document.createElement("span");

        g.className = "cer-globo";
        g.style.left = 4 + Math.random() * 88 + "%";
        g.style.setProperty("--c", colores[i % colores.length]);
        g.style.setProperty("--t", 6 + Math.random() * 3 + "s");
        g.style.animationDelay = Math.random() * 1.6 + "s";

        $("cer-globos").appendChild(g);
        setTimeout(() => g.remove(), 11000);
    }
}

function chispa(x, y) {
    const c = document.createElement("span");

    c.className = "cer-chispa";
    c.textContent = "✦";
    c.style.left = x + "px";
    c.style.top = y + "px";
    c.style.fontSize = 12 + Math.random() * 16 + "px";

    efectos.appendChild(c);
    setTimeout(() => c.remove(), 850);
}

function generarEstrellas() {
    const cielo = $("cer-estrellas");

    for (let i = 0; i < 90; i++) {
        const e = document.createElement("span");
        const tam = 2 + Math.random() * 3;

        e.className = "cer-estrella-fondo";
        e.style.left = Math.random() * 100 + "%";
        e.style.top = Math.random() * 100 + "%";
        e.style.width = tam + "px";
        e.style.height = tam + "px";
        e.style.setProperty("--t", 2 + Math.random() * 3 + "s");
        e.style.setProperty("--r", Math.random() * 3 + "s");

        cielo.appendChild(e);
    }
}

/* Armado del certificado */

const COLORES_LINEAS = ["var(--cer-morado)", "var(--cer-naranja)"];

function crearTitulo() {
    const titulo = $("cer-titulo");
    let indice = 0;

    ["La Escuela", "de las Estrellas"].forEach((linea, numeroLinea) => {
        const fila = document.createElement("span");

        fila.className = "cer-linea-titulo";

        Array.from(linea).forEach((caracter) => {
            const letra = document.createElement("span");

            if (caracter === " ") {
                letra.className = "cer-espacio";
            } else {
                letra.className = "cer-letra";
                letra.textContent = caracter;
                letra.style.setProperty("--c", COLORES_LINEAS[numeroLinea]);
                letra.style.setProperty("--i", indice);
                indice++;
            }

            fila.appendChild(letra);
        });

        titulo.appendChild(fila);
    });
}

function crearNinos() {
    const fila = $("cer-ninos");

    fila.innerHTML = NINOS.map((n) => dibujarNino(n)).join("");

    Array.from(fila.children).forEach((svg, i) => svg.style.setProperty("--k", i));
}

function misionesCompletadas() {
    try {
        const progreso = JSON.parse(localStorage.getItem(CLAVE_PROGRESO) || "{}");
        const lista = progreso && Array.isArray(progreso.completadas) ? progreso.completadas.map(Number) : [];

        // Sin progreso guardado (por ejemplo, al probar la página) se muestran todas.
        return lista.length ? lista : Array.from({ length: TOTAL_MISIONES }, (_, i) => i + 1);
    } catch (error) {
        return Array.from({ length: TOTAL_MISIONES }, (_, i) => i + 1);
    }
}

function ajustar() {
    const ancho = window.innerWidth;
    const alto = window.innerHeight;
    const arriba = ancho <= 600 ? 76 : (alto <= 520 ? 66 : 86);
    const escala = Math.max(0.3, Math.min((ancho - 28) / 660, (alto - arriba - 30) / 520, 1.25));

    caja.style.setProperty("--s", escala.toFixed(3));
}

/* Secuencia del certificado */

async function mostrarCertificado() {
    $("cer-rayos").classList.add("on");
    diploma.classList.add("entra", "armado");
    sonidoWhoosh();
    globos();

    const voz = dialogoConLimite("ganaste", 6000, 4200);

    await pausa(1100);
    sonidoAcierto();
    await pausa(1300);
    confeti(18);

    await voz;

    // Cada misión se "sella" una por una.
    const hechas = misionesCompletadas();
    const sellos = Array.from(document.querySelectorAll("#cer-sellos li"));

    for (let i = 0; i < sellos.length; i++) {
        if (hechas.includes(i + 1)) {
            sellos[i].classList.add("on");
            tono(520 + i * 95, 0.18, 0.05);
            destellos(sellos[i], 3);
        }

        await pausa(330);
    }

    await pausa(400);

    // La medalla cae con un golpe.
    medalla.classList.add("sellada");
    medallaLista = true;
    sonidoGolpe();

    await pausa(280);

    diploma.classList.remove("entra", "entrado");
    diploma.classList.add("sacude");
    onda(medalla);
    destellos(medalla, 12);
    confeti(40);
    globos(4);
    sonidoFanfarria();

    setTimeout(() => {
        diploma.classList.remove("sacude");
        diploma.classList.add("entrado");
    }, 520);

    await dialogoConLimite("derecho", 6000, 4200);
    await pausa(500);
}

/* Viaje de Starly */

// Starly (la de celebración) viaja al centro y allí se convierte en cohete.
async function transformarEnCohete() {
    const pieza = cohete.hidden ? respaldoCohete : cohete;

    // El cohete se coloca en el centro, todavía invisible, para saber dónde aterriza Starly.
    nave.style.opacity = "0";
    navePos.hidden = false;

    const origen = starly.getBoundingClientRect();
    const destino = pieza.getBoundingClientRect();
    const dx = destino.left + destino.width / 2 - (origen.left + origen.width / 2);
    const dy = destino.top + destino.height / 2 - (origen.top + origen.height / 2);
    const crecer = Math.max(1, Math.min(2.6, destino.height / Math.max(origen.height, 1) * 0.9));

    tono(660, 0.14, 0.05);
    sonidoWhoosh();

    if (starly.animate) {
        const viajeStarly = starly.animate([
            { transform: "translate(0, 0) scale(1) rotate(0deg)" },
            { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 40}px) scale(${1 + (crecer - 1) * 0.5}) rotate(180deg)`, offset: 0.55 },
            { transform: `translate(${dx}px, ${dy}px) scale(${crecer}) rotate(360deg)` }
        ], { duration: 1100, easing: "ease-in-out", fill: "forwards" });

        try { await viajeStarly.finished; } catch (error) { /* nada */ }
    }

    // ¡Puf! Starly se transforma.
    starly.style.visibility = "hidden";
    nave.style.opacity = "";
    sonidoMotor();
    sonidoAcierto();
    onda(pieza);
    destellos(pieza, 12);

    if (nave.animate) {
        const aparecer = nave.animate([
            { transform: "scale(0.2) rotate(-30deg)", opacity: 0 },
            { transform: "scale(1.2) rotate(6deg)", opacity: 1, offset: 0.65 },
            { transform: "scale(1) rotate(0deg)", opacity: 1 }
        ], { duration: 700, easing: "ease-out", fill: "forwards" });

        try { await aparecer.finished; } catch (error) { /* nada */ }
    }
}

function lineasDeVelocidad() {
    for (let i = 0; i < 12; i++) {
        const l = document.createElement("span");

        l.className = "cer-linea";
        l.style.top = Math.random() * 100 + "%";
        l.style.width = 100 + Math.random() * 200 + "px";
        l.style.animationDuration = 0.6 + Math.random() * 0.5 + "s";
        l.style.animationDelay = Math.random() * 1.6 + "s";
        l.style.animationIterationCount = "2";

        lineas.appendChild(l);
        setTimeout(() => l.remove(), 3400);
    }
}

async function despegar() {
    const base = escena.getBoundingClientRect();
    const inicio = posicionEnEscena(nave);
    const rad = DIRECCION_COHETE * Math.PI / 180;
    const ux = Math.cos(rad);
    const uy = Math.sin(rad);

    // Distancia hasta el borde de la pantalla en esa dirección.
    const haciaArriba = uy < -0.05 ? (inicio.y + 40) / -uy : Infinity;
    const haciaLado = ux > 0.05 ? (base.width - inicio.x) / ux : (ux < -0.05 ? inicio.x / -ux : Infinity);
    const borde = Math.min(haciaArriba, haciaLado);
    const recorrido = borde * 0.72;

    const dx = ux * recorrido;
    const dy = uy * recorrido;
    const meta = { x: inicio.x + dx, y: inicio.y + dy, angulo: DIRECCION_COHETE };

    navePos.classList.add("despega");
    guia.classList.add("fuera");
    sonidoDespegue();
    lineasDeVelocidad();

    // Rastro de chispas detrás del cohete.
    const rastro = setInterval(() => {
        const r = nave.getBoundingClientRect();
        const atras = Math.min(r.width, r.height) * 0.42;

        chispa(r.left - base.left + r.width / 2 - ux * atras, r.top - base.top + r.height / 2 - uy * atras);
    }, 55);

    if (nave.animate) {
        const vuelo = nave.animate([
            { transform: "translate(0, 0) scale(1)", offset: 0 },
            { transform: `translate(${-ux * 18}px, ${-uy * 18 + 6}px) scale(1.04)`, offset: 0.16 },
            { transform: `translate(${dx}px, ${dy}px) scale(0.16)`, offset: 1 }
        ], { duration: 2600, easing: "cubic-bezier(0.55, 0, 0.85, 0.45)", fill: "forwards" });

        try { await vuelo.finished; } catch (error) { /* nada */ }
    } else {
        await pausa(2600);
    }

    clearInterval(rastro);
    navePos.hidden = true;

    return meta;
}

// El cohete se hace tan pequeño que se convierte en una estrella fugaz.
async function estrellaFugaz(meta) {
    const base = escena.getBoundingClientRect();
    const rad = meta.angulo * Math.PI / 180;
    const distancia = Math.max(base.width, base.height);
    const vx = Math.cos(rad) * distancia;
    const vy = Math.sin(rad) * distancia;

    fugaz.style.left = meta.x + "px";
    fugaz.style.top = meta.y + "px";
    fugaz.hidden = false;

    sonidoFugaz();
    destellos({ getBoundingClientRect: () => ({ left: base.left + meta.x - 20, top: base.top + meta.y - 20, width: 40, height: 40 }) }, 8);

    if (fugaz.animate) {
        cola.animate([
            { transform: "scaleX(0.15)" },
            { transform: "scaleX(1.1)", offset: 0.3 },
            { transform: "scaleX(0.6)" }
        ], { duration: 1200, easing: "ease-out", fill: "forwards" });

        const viaje = fugaz.animate([
            { transform: `translate(0px, 0px) rotate(${meta.angulo}deg) scale(0.6)`, opacity: 1 },
            { transform: `translate(${vx * 0.35}px, ${vy * 0.35}px) rotate(${meta.angulo}deg) scale(1.1)`, opacity: 1, offset: 0.35 },
            { transform: `translate(${vx}px, ${vy}px) rotate(${meta.angulo}deg) scale(0.5)`, opacity: 0 }
        ], { duration: 1300, easing: "cubic-bezier(0.4, 0, 0.9, 0.6)", fill: "forwards" });

        try { await viaje.finished; } catch (error) { /* nada */ }
    } else {
        await pausa(1300);
    }

    fugaz.hidden = true;
}

function mostrarDespedida() {
    despedida.innerHTML = Array.from("¡Hasta pronto!")
        .map((c, i) => c === " "
            ? '<span class="cer-espacio-desp"></span>'
            : `<span class="cer-palabra" style="--i:${i}"><span class="cer-trazo" aria-hidden="true">${c}</span><span class="cer-relleno">${c}</span></span>`)
        .join("");
    despedida.hidden = false;
}

async function viaje() {
    // Cae la noche y el certificado se guarda.
    escena.classList.add("noche");
    diploma.classList.remove("entrado", "sacude", "entra");
    diploma.classList.add("sale");
    sonidoWhoosh();

    await pausa(1500);
    zona.hidden = true;

    await transformarEnCohete();
    await dialogoConLimite("gusto", 5000, 2600);

    const meta = await despegar();

    await estrellaFugaz(meta);
    await pausa(800);

    // Starly ya se fue: solo queda su voz.
    mostrarDespedida();
    sonidoAcierto();
    await dialogoConLimite("hastaPronto", 5000, 3000);
    await pausa(300);

    botones.hidden = false;
    sonidoFanfarria();
    terminado = true;
}

/* Medalla: se puede tocar para sacar destellos */

medalla.addEventListener("click", () => {
    if (!medallaLista || terminado) return;

    medalla.classList.remove("brinca", "sellada");
    void medalla.offsetWidth;
    medalla.classList.add("brinca");

    tono(880 + Math.random() * 400, 0.2, 0.05);
    destellos(medalla, 8);
});

botonAudio.addEventListener("click", () => decir(ultimoDialogo));

window.addEventListener("resize", ajustar);

window.addEventListener("pagehide", () => {
    detenerAudio();
});

/* Imagen del cohete: si no carga, se prueban otros nombres y, al final, se usa un 🚀 */

const IMAGENES_COHETE = ["starlycohete.webp", "starly_cohete.webp", "starlycohete.png", "starly_cohete.png"];

function cargarCohete(indice = 0) {
    if (indice >= IMAGENES_COHETE.length) {
        console.error("No se pudo cargar la imagen del cohete. Revisa que exista: " + RUTA_STARLY + IMAGENES_COHETE[0]);
        cohete.hidden = true;
        respaldoCohete.hidden = false;
        return;
    }

    const prueba = new Image();

    prueba.onload = () => {
        cohete.src = prueba.src;
    };

    prueba.onerror = () => {
        console.warn("No cargó: " + prueba.src);
        cargarCohete(indice + 1);
    };

    prueba.src = RUTA_STARLY + IMAGENES_COHETE[indice];
}

/* Música de fondo */

let musica = null;

function iniciarMusica() {
    if (!configuracion.musica) return;

    musica = new Audio(RUTA_MUSICA);
    musica.loop = true;
    musica.volume = 0;

    const reproducir = () => {
        musica.play().then(() => subirMusica()).catch(() => {
            // El navegador pide un toque antes de dejar sonar: se inicia con el primero.
            const primerToque = () => {
                musica.play().then(() => subirMusica()).catch(() => {});
            };

            window.addEventListener("pointerdown", primerToque, { once: true });
        });
    };

    reproducir();
}

// Sube o baja el volumen poco a poco.
function subirMusica(destino = VOLUMEN_MUSICA, duracion = 1500) {
    if (!musica) return;

    clearInterval(musica.fundido);

    const pasos = 20;
    const inicio = musica.volume;
    let paso = 0;

    musica.fundido = setInterval(() => {
        paso++;
        musica.volume = Math.max(0, Math.min(1, inicio + (destino - inicio) * paso / pasos));

        if (paso >= pasos) clearInterval(musica.fundido);
    }, duracion / pasos);
}
/* Inicio */

ajustar();
cargarCohete();
generarEstrellas();
crearTitulo();
crearNinos();
cambiarStarly("celebrando");
iniciarMusica();

mostrarCertificado().then(viaje);