
/* ESTRELLITAS DEL SABER - MISIÓN 5: ESCRIBIMOS LOS NOMBRES */

"use strict";

const $ = (id) => document.getElementById(id);

const NUMERO_MISION = 5;
const RUTA_AUDIO = "../../audio/juegos/mision-5/";
const RUTA_STARLY = "../../img/personajes/starly/";
const CLAVE_PROGRESO = "estrellitas_del_saber_progreso";
const CLAVE_CONFIGURACION = "estrellitas_del_saber_configuracion";

const ESPERA_PISTA = 6000;
const MUESTRAS = 140;
const TOLERANCIA = 13;
const TOLERANCIA_INICIO = 20;
const ADELANTE = 30;

const escenario = $("luna-escenario");
const mensaje = $("luna-mensaje");
const botonAudio = $("luna-audio");
const starly = $("luna-starly");
const alumna = $("luna-alumna");
const nombre = $("luna-nombre");
const efectos = $("luna-efectos");
const svg = $("luna-trazo");
const capa = $("trazo-capa");
const punta = $("trazo-punta");
const numero = punta.querySelector(".num");
const mano = $("trazo-mano");

/* LETRAS */

const DIBUJOS = {
    A: ["M26 86 L50 14 L74 86", "M37 62 L63 62"],
    N: ["M28 86 L28 14 L72 86 L72 14"],
    L: ["M32 14 L32 84 L72 84"],
    U: ["M30 14 L30 60 Q30 86 50 86 Q70 86 70 60 L70 14"],
    I: ["M50 14 L50 86"],
    S: ["M68 28 Q66 14 50 14 Q30 14 30 32 Q30 46 50 50 Q70 54 70 68 Q70 86 50 86 Q34 86 30 72"],
    O: ["M50 14 A24 36 0 1 0 50 86 A24 36 0 1 0 50 14"]
};

/* PERSONAJES */

const NINOS = [
    {
        id: "ana",
        nombre: "ANA",
        turno: "turnoAna",
        bien: "bienAna",
        estilo: "larga",
        piel: "#E8B48A",
        pelo: "#5B3420",
        ropa: "#FF7BA9",
        ropa2: "#FF7BA9",
        vestido: true
    },
    {
        id: "luis",
        nombre: "LUIS",
        turno: "turnoLuis",
        bien: "bienLuis",
        estilo: "corto",
        piel: "#D99A6C",
        pelo: "#1F1410",
        ropa: "#4FA3F7",
        ropa2: "#3B4FA0",
        vestido: false
    },
    {
        id: "sol",
        nombre: "SOL",
        turno: "turnoSol",
        bien: "bienSol",
        estilo: "rizos",
        piel: "#B9784B",
        pelo: "#2B1B12",
        ropa: "#FFC83D",
        ropa2: "#FFC83D",
        vestido: true,
        silla: true
    }
];

/* EXPRESIONES */

const EXPRESIONES = {
    feliz: ["starly_mate.webp", "Starly contento"],
    celebrando: ["starly_globos.webp", "Starly celebrando con globos"]
};

/* DIÁLOGOS Y AUDIOS */

const DIALOGOS = {
    inicio: [
        "¡Nuestro salón está listo! ¡Ahora vamos a aprender!",
        "inicio.mp3"
    ],
    instrucciones: [
        "¡Hoy aprenderemos a escribir nombres! ¡Sigue las líneas con tu dedo!",
        "instrucciones.mp3"
    ],
    turnoAna: [
        "¡Comencemos con Ana!",
        "ana.mp3"
    ],
    turnoLuis: [
        "¡Ahora escribamos Luis!",
        "luis.mp3"
    ],
    turnoSol: [
        "¡Es el turno de Sol!",
        "sol.mp3"
    ],
    muyBien: [
        "¡Muy bien! ¡Sigue así!",
        "muy-bien.mp3"
    ],
    excelente: [
        "¡Excelente trabajo!",
        "excelente.mp3"
    ],
    bienAna: [
        "¡Lo logramos! ¡Escribimos ANA!",
        "bien-ana.mp3"
    ],
    bienLuis: [
        "¡Muy bien! ¡Escribimos LUIS!",
        "bien-luis.mp3"
    ],
    bienSol: [
        "¡Excelente! ¡Escribimos SOL!",
        "bien-sol.mp3"
    ],
    pista: [
        "¡Mira cómo se hace! ¡Ahora inténtalo tú!",
        "pista.mp3"
    ],
    final: [
        "¡Lo logramos, hemos completado los nombres!",
        "final.mp3"
    ],
    victoria: [
        "Todos tenemos derecho a aprender escribir nuestros nombres",
        "victoria.mp3"
    ]
};

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
    console.warn("Se utilizará la configuración predeterminada.");
}

/* ESTADO DEL JUEGO */

let trazos = [];
let indiceLetra = 0;
let indiceNino = 0;
let indiceTrazo = 0;
let ninosHechos = 0;

let trazando = false;
let puedeTrazar = false;
let introActiva = false;
let terminado = false;
let finalizando = false;

let ultimoDialogo = "inicio";
let audioActual = null;
let resolverDialogo = null;
let contextoAudio = null;

let temporizadorPista = null;
let idDemo = 0;
let ultimoTic = 0;
let pistasDadas = 0;
let expresionActual = "";

let letrasCompletadas = 0;
let primeraDemostracion = false;
let secuenciaActual = 0;

/* UTILIDADES */

function pausa(ms) {
    return new Promise((resolver) => setTimeout(resolver, ms));
}

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

        setTimeout(() => {
            starly.classList.remove("reaccion");
        }, 600);
    }
}

/* REPRODUCCIÓN DE AUDIOS */

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

function decir(clave) {
    const dialogo = DIALOGOS[clave];

    if (!dialogo) return Promise.resolve(false);

    detenerAudio();

    ultimoDialogo = clave;
    mensaje.textContent = dialogo[0];

    if (!configuracion.voz) return Promise.resolve(false);

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

        audio.addEventListener("ended", () => terminar(true), { once: true });
        audio.addEventListener("error", () => terminar(false), { once: true });

        audio.play().then(() => {
            if (audioActual === audio && !audio.paused) {
                botonAudio.classList.add("reproduciendo");
            }
        }).catch(() => terminar(false));
    });
}

async function dialogoConLimite(clave, limite = 6000, minimo = 0) {
    const reproduccion = decir(clave);

    await Promise.all([
        Promise.race([reproduccion, pausa(limite)]),
        pausa(minimo)
    ]);

    if (audioActual) detenerAudio();
}

/* EFECTOS DE SONIDO */

function contexto() {
    if (!configuracion.efectos) return null;

    try {
        const Contexto = window.AudioContext || window.webkitAudioContext;

        if (!Contexto) return null;

        if (!contextoAudio) contextoAudio = new Contexto();

        if (contextoAudio.state === "suspended") {
            contextoAudio.resume().catch(() => {});
        }

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

function sonidoAcierto() {
    tono(587, 0.14);
    tono(740, 0.14, 0.045, 0.11);
    tono(988, 0.22, 0.045, 0.22);
}

function sonidoTrazo(avance) {
    const ahora = performance.now();

    if (ahora - ultimoTic < 90) return;

    ultimoTic = ahora;
    tono(380 + avance * 420, 0.07, 0.025);
}

/* ESTRELLAS Y DESTELLOS */

function prepararEstrellas() {
    document.querySelectorAll(".luna-estrella").forEach((estrella) => {
        estrella.textContent = "☆";
        estrella.classList.remove("ganada");
    });

    const total = $("luna-total");

    if (total) {
        total.textContent = "0";
    }
}

function ganarEstrella() {
    const estrellas = document.querySelectorAll(".luna-estrella");
    const estrella = estrellas[ninosHechos - 1];

    if (!estrella) return;

    estrella.textContent = "⭐";
    estrella.classList.add("ganada");

    const total = $("luna-total");

    if (total) {
        total.textContent = ninosHechos;
    }

    tono(880);
}

function crearDestellos(zona) {
    if (!zona || !efectos || !escenario) return;

    const caja = zona.getBoundingClientRect();
    const base = escenario.getBoundingClientRect();

    for (let i = 0; i < 10; i++) {
        const destello = document.createElement("span");

        destello.className = "luna-destello";
        destello.textContent = "✦";

        destello.style.left =
            caja.left - base.left + Math.random() * caja.width + "px";

        destello.style.top =
            caja.top - base.top + Math.random() * caja.height + "px";

        efectos.appendChild(destello);

        setTimeout(() => destello.remove(), 1000);
    }
}

/* CONSTRUCCIÓN DE LETRAS */

function crear(etiqueta, atributos) {
    const elemento = document.createElementNS(
        "http://www.w3.org/2000/svg",
        etiqueta
    );

    Object.entries(atributos).forEach(([clave, valor]) => {
        elemento.setAttribute(clave, valor);
    });

    return elemento;
}

function construirLetra(caracter) {
    const dibujo = DIBUJOS[caracter];
    if (!dibujo) return;

    capa.innerHTML = "";
    capa.classList.remove("hecha");

    const caminos = dibujo.map((d) => crear("path", {
        d,
        class: "t-camino"
    }));

    const guias = dibujo.map((d) => crear("path", {
        d,
        class: "t-guia"
    }));

    const progresos = dibujo.map((d) => crear("path", {
        d,
        class: "t-progreso"
    }));

    [...caminos, ...guias, ...progresos].forEach((trazo) => {
        capa.appendChild(trazo);
    });

    trazos = dibujo.map((d, i) => {
        const largo = guias[i].getTotalLength();
        const muestras = [];

        for (let k = 0; k < MUESTRAS; k++) {
            const punto = guias[i].getPointAtLength(
                largo * k / (MUESTRAS - 1)
            );

            muestras.push([punto.x, punto.y]);
        }

        progresos[i].style.strokeDasharray = largo;
        progresos[i].style.strokeDashoffset = largo;

        return {
            progreso: progresos[i],
            largo,
            muestras,
            cur: 0
        };
    });

    indiceTrazo = 0;
    punta.classList.remove("oculta", "activa");

    moverPunta();
}

function dibujar(trazo) {
    trazo.progreso.style.strokeDashoffset =
        trazo.largo * (1 - trazo.cur / (MUESTRAS - 1));
}

function moverPunta() {
    const trazo = trazos[indiceTrazo];
    if (!trazo) return;

    const [x, y] = trazo.muestras[trazo.cur];

    punta.setAttribute("transform", `translate(${x} ${y})`);
    punta.classList.toggle("inicio", trazo.cur === 0);

    numero.textContent = indiceTrazo + 1;
}

/* DEMOSTRACIÓN Y PISTAS */

function cancelarDemo() {
    idDemo++;
    mano.classList.remove("visible");
}

function mostrarDemo() {
    cancelarDemo();

    const id = idDemo;
    const trazo = trazos[indiceTrazo];

    if (!trazo || terminado || finalizando) return;

    const desde = trazo.cur;
    const hasta = Math.min(
        MUESTRAS - 1,
        desde + Math.round(MUESTRAS * 0.45)
    );

    const duracion = 1600;
    const inicio = performance.now();

    mano.classList.add("visible");

    function paso(ahora) {
        if (id !== idDemo || terminado || !puedeTrazar) return;

        const k = Math.min(1, (ahora - inicio) / duracion);
        const suave = k < 0.5
            ? 2 * k * k
            : 1 - Math.pow(-2 * k + 2, 2) / 2;

        const i = Math.round(desde + (hasta - desde) * suave);
        const [x, y] = trazo.muestras[i];

        mano.setAttribute("transform", `translate(${x} ${y})`);

        if (k < 1) {
            requestAnimationFrame(paso);
        } else {
            setTimeout(() => {
                if (id === idDemo) mano.classList.remove("visible");
            }, 500);
        }
    }

    requestAnimationFrame(paso);
}

function quitarPista() {
    clearTimeout(temporizadorPista);
    cancelarDemo();
}

function programarPista() {
    clearTimeout(temporizadorPista);

    if (terminado || finalizando || !puedeTrazar) return;

    temporizadorPista = setTimeout(() => {
        if (terminado || finalizando || !puedeTrazar) return;

        if (trazando) {
            programarPista();
            return;
        }

        mostrarDemo();
        pistasDadas++;

        if (pistasDadas % 2 === 1) {
            decir("pista");
        }

        programarPista();
    }, ESPERA_PISTA);
}

/* INTERACCIÓN DEL TRAZADO */

function aPunto(evento) {
    const punto = svg.createSVGPoint();
    const matriz = svg.getScreenCTM();

    if (!matriz) return null;

    punto.x = evento.clientX;
    punto.y = evento.clientY;

    return punto.matrixTransform(matriz.inverse());
}

function avanzar(punto) {
    const trazo = trazos[indiceTrazo];

    if (!trazo || !punto) return;

    const fin = Math.min(MUESTRAS - 1, trazo.cur + ADELANTE);

    let mejor = -1;
    let distanciaMejor = Infinity;

    for (let i = trazo.cur; i <= fin; i++) {
        const distancia = Math.hypot(
            punto.x - trazo.muestras[i][0],
            punto.y - trazo.muestras[i][1]
        );

        if (distancia < distanciaMejor) {
            distanciaMejor = distancia;
            mejor = i;
        }
    }

    if (distanciaMejor <= TOLERANCIA && mejor > trazo.cur) {
        trazo.cur = mejor;

        dibujar(trazo);
        moverPunta();

        sonidoTrazo(mejor / (MUESTRAS - 1));

        if (trazo.cur >= MUESTRAS - 4) {
            completarTrazo();
        }
    }
}

function completarTrazo() {
    const trazo = trazos[indiceTrazo];
    if (!trazo) return;

    trazo.cur = MUESTRAS - 1;
    dibujar(trazo);

    trazando = false;
    punta.classList.remove("activa");

    if (indiceTrazo < trazos.length - 1) {
        indiceTrazo++;
        moverPunta();

        tono(660, 0.12);
        programarPista();

        return;
    }

    completarLetra();
}

/* EVENTOS DEL TRAZADO */

svg.addEventListener("pointerdown", (evento) => {
    if (!puedeTrazar || terminado || finalizando) return;

    evento.preventDefault();

    const punto = aPunto(evento);
    const trazo = trazos[indiceTrazo];

    if (!punto || !trazo) return;

    const [x, y] = trazo.muestras[trazo.cur];

    const distancia = Math.hypot(
        punto.x - x,
        punto.y - y
    );

    if (distancia <= TOLERANCIA_INICIO) {
        trazando = true;
        quitarPista();

        punta.classList.add("activa");

        try {
            svg.setPointerCapture(evento.pointerId);
        } catch (error) {
            console.warn("Captura de puntero no disponible.");
        }

        avanzar(punto);
    } else {
        punta.classList.remove("llama");
        void punta.getBoundingClientRect();
        punta.classList.add("llama");
    }
});

svg.addEventListener("pointermove", (evento) => {
    if (!trazando || !puedeTrazar) return;

    evento.preventDefault();

    const eventos = typeof evento.getCoalescedEvents === "function"
        ? evento.getCoalescedEvents()
        : [];

    const movimientos = eventos.length ? eventos : [evento];

    movimientos.forEach((e) => {
        if (trazando && puedeTrazar) {
            avanzar(aPunto(e));
        }
    });
});

function soltar() {
    if (!trazando) return;

    trazando = false;
    punta.classList.remove("activa");

    if (puedeTrazar && !terminado) {
        programarPista();
    }
}

svg.addEventListener("pointerup", soltar);
svg.addEventListener("pointercancel", soltar);

svg.addEventListener("keydown", (evento) => {
    if (!puedeTrazar || terminado || finalizando) return;

    if (["Enter", " ", "ArrowRight", "ArrowDown"].includes(evento.key)) {
        evento.preventDefault();

        const trazo = trazos[indiceTrazo];
        if (!trazo) return;

        trazo.cur = Math.min(MUESTRAS - 1, trazo.cur + 14);

        dibujar(trazo);
        moverPunta();

        sonidoTrazo(trazo.cur / (MUESTRAS - 1));

        if (trazo.cur >= MUESTRAS - 4) {
            completarTrazo();
        }
    }
});

/* DIBUJO DE LOS NIÑOS */

function dibujarNino(n) {
    const atras = {
        larga: `<path d="M20 60 Q20 8 60 8 Q100 8 100 60 L104 124 L16 124 Z" fill="${n.pelo}"></path>`,
        rizos: [
            [24, 50, 16],
            [96, 50, 16],
            [34, 24, 16],
            [86, 24, 16],
            [60, 14, 18],
            [18, 76, 12],
            [102, 76, 12]
        ].map(([x, y, r]) => `
            <circle cx="${x}" cy="${y}" r="${r}" fill="${n.pelo}"></circle>
        `).join(""),
        corto: ""
    }[n.estilo];

    const adelante = {
        larga: `<path d="M26 56 Q60 6 94 56 Q60 34 26 56 Z" fill="${n.pelo}"></path>`,
        rizos: `<path d="M30 50 Q60 14 90 50 Q60 38 30 50 Z" fill="${n.pelo}"></path>`,
        corto: `<path d="M26 60 Q24 12 60 12 Q96 12 94 60 Q60 36 26 60 Z" fill="${n.pelo}"></path>`
    }[n.estilo];

    const silla = n.silla ? {
        atras: `
            <rect x="26" y="98" width="68" height="56" rx="8" fill="#5A5F73"></rect>
            <ellipse cx="11" cy="146" rx="9" ry="29" fill="none" stroke="#3A3D4F" stroke-width="5"></ellipse>
            <ellipse cx="109" cy="146" rx="9" ry="29" fill="none" stroke="#3A3D4F" stroke-width="5"></ellipse>
            <ellipse cx="11" cy="146" rx="3" ry="4" fill="#3A3D4F"></ellipse>
            <ellipse cx="109" cy="146" rx="3" ry="4" fill="#3A3D4F"></ellipse>
            <rect x="20" y="124" width="10" height="5" rx="2" fill="#3A3D4F"></rect>
            <rect x="90" y="124" width="10" height="5" rx="2" fill="#3A3D4F"></rect>
        `,
        delante: `
            <rect x="22" y="150" width="76" height="7" rx="3" fill="#3A3D4F"></rect>
            <rect x="34" y="172" width="52" height="5" rx="2" fill="#3A3D4F"></rect>
            <circle cx="26" cy="178" r="5" fill="#3A3D4F"></circle>
            <circle cx="94" cy="178" r="5" fill="#3A3D4F"></circle>
        `
    } : null;

    const cuerpo = n.silla
        ? `
            <rect x="42" y="148" width="13" height="24" rx="5" fill="${n.piel}"></rect>
            <rect x="65" y="148" width="13" height="24" rx="5" fill="${n.piel}"></rect>
            <path d="M34 104 L86 104 L94 152 L26 152 Z" fill="${n.ropa}"></path>
            <path d="M48 104 L60 120 L72 104 Z" fill="#FFFFFF"></path>
        `
        : n.vestido
        ? `
            <path d="M36 104 L84 104 L100 172 L20 172 Z" fill="${n.ropa}"></path>
            <path d="M48 104 L60 120 L72 104 Z" fill="#FFFFFF"></path>
        `
        : `
            <path d="M36 104 L84 104 L90 144 L30 144 Z" fill="${n.ropa}"></path>
            <path d="M30 144 L90 144 L92 170 L66 170 L60 156 L54 170 L28 170 Z" fill="${n.ropa2}"></path>
        `;

    return `
        <svg viewBox="0 0 120 184">
            ${silla ? silla.atras : ""}
            ${atras}
            ${cuerpo}

            <path d="M38 112 L20 144"
                  stroke="${n.piel}"
                  stroke-width="10"
                  stroke-linecap="round"
                  fill="none"></path>

            <g class="luna-brazo">
                <path d="M82 112 L102 144"
                      stroke="${n.piel}"
                      stroke-width="10"
                      stroke-linecap="round"
                      fill="none"></path>
            </g>

            ${silla ? silla.delante : ""}

            <ellipse cx="${n.silla ? 48 : 44}"
                     cy="${n.silla ? 171 : 177}"
                     rx="14" ry="6" fill="#49309A"></ellipse>

            <ellipse cx="${n.silla ? 72 : 76}"
                     cy="${n.silla ? 171 : 177}"
                     rx="14" ry="6" fill="#49309A"></ellipse>

            <circle cx="60" cy="62" r="34" fill="${n.piel}"></circle>

            ${adelante}

            <circle cx="48" cy="64" r="4" fill="#2B1B12"></circle>
            <circle cx="72" cy="64" r="4" fill="#2B1B12"></circle>

            <circle cx="40" cy="74" r="5"
                    fill="#FF7A8A" opacity="0.55"></circle>

            <circle cx="80" cy="74" r="5"
                    fill="#FF7A8A" opacity="0.55"></circle>

            <path d="M50 78 Q60 88 70 78"
                  stroke="#A3452B"
                  stroke-width="3"
                  stroke-linecap="round"
                  fill="none"></path>
        </svg>
    `;
}

function mostrarNino(n) {
    alumna.classList.remove(
        "llegada",
        "saluda",
        "salta",
        "festeja",
        "grupo"
    );

    alumna.innerHTML = dibujarNino(n);
    void alumna.offsetWidth;
}

function mostrarGrupo() {
    alumna.classList.remove(
        "llegada",
        "saluda",
        "salta",
        "festeja"
    );

    alumna.classList.add("grupo");
    alumna.innerHTML = NINOS.map(dibujarNino).join("");

    void alumna.offsetWidth;
}

function prepararNombre(n) {
    nombre.classList.remove("completo");

    nombre.innerHTML = n.nombre
        .split("")
        .map(() => '<span class="nombre-casilla"></span>')
        .join("");
}

/* TURNOS DE APRENDIZAJE */

async function turnoDe(indice) {
    if (terminado || finalizando) return;

    const n = NINOS[indice];
    if (!n) return;

    const secuencia = ++secuenciaActual;

    indiceNino = indice;
    indiceLetra = 0;

    puedeTrazar = false;
    trazando = false;

    quitarPista();

    mostrarNino(n);
    prepararNombre(n);
    construirLetra(n.nombre[0]);

    alumna.classList.add("llegada", "saluda");

    await dialogoConLimite(n.turno, 6000, 1000);

    if (
        terminado ||
        finalizando ||
        secuencia !== secuenciaActual
    ) {
        return;
    }

    alumna.classList.remove("saluda");
    empezarLetra();
}

function empezarLetra() {
    if (terminado || finalizando) return;

    puedeTrazar = true;
    trazando = false;

    if (!primeraDemostracion) {
        primeraDemostracion = true;

        setTimeout(() => {
            if (puedeTrazar && !trazando && !terminado) {
                mostrarDemo();
            }
        }, 500);
    }

    programarPista();
}

/* COMPLETAR LETRAS */

async function completarLetra() {
    if (!puedeTrazar || terminado || finalizando) return;

    puedeTrazar = false;
    trazando = false;

    quitarPista();

    const secuencia = secuenciaActual;
    const n = NINOS[indiceNino];
    const casilla = nombre.children[indiceLetra];

    if (!n || !casilla) return;

    punta.classList.add("oculta");
    capa.classList.add("hecha");

    casilla.textContent = n.nombre[indiceLetra];
    casilla.classList.add("llena");

    sonidoAcierto();
    crearDestellos(casilla);

    letrasCompletadas++;

    alumna.classList.remove("salta");
    void alumna.getBoundingClientRect();
    alumna.classList.add("salta");

    const ultimaLetra = indiceLetra >= n.nombre.length - 1;

    if (ultimaLetra) {
        await completarNombre();
        return;
    }

    const felicitacion = letrasCompletadas % 2 === 1
        ? "muyBien"
        : "excelente";

    await dialogoConLimite(felicitacion, 3500, 850);

    if (
        terminado ||
        finalizando ||
        secuencia !== secuenciaActual
    ) {
        return;
    }

    alumna.classList.remove("salta");

    indiceLetra++;
    construirLetra(n.nombre[indiceLetra]);

    empezarLetra();
}

/* COMPLETAR NOMBRES */

async function completarNombre() {
    const n = NINOS[indiceNino];

    if (!n || terminado || finalizando) return;

    puedeTrazar = false;
    quitarPista();

    ninosHechos++;
    ganarEstrella();

    nombre.classList.add("completo");

    cambiarStarly("feliz", true);
    crearDestellos(nombre);

    alumna.classList.remove("salta");
    alumna.classList.add("festeja");

    await dialogoConLimite(n.bien, 5500, 1800);

    if (terminado || finalizando) return;

    const esElUltimo = indiceNino >= NINOS.length - 1;

    if (esElUltimo) {
        await finalizarMision();
        return;
    }

    alumna.classList.remove("festeja", "llegada");

    await pausa(500);

    if (terminado || finalizando) return;

    await turnoDe(indiceNino + 1);
}

/* GUARDAR PROGRESO */

function guardarProgreso() {
    try {
        const guardado = JSON.parse(
            localStorage.getItem(CLAVE_PROGRESO) || "{}"
        );

        const progreso = guardado && typeof guardado === "object"
            ? guardado
            : {};

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

        localStorage.setItem(
            CLAVE_PROGRESO,
            JSON.stringify(progreso)
        );
    } catch (error) {
        console.warn("No se pudo guardar el progreso.");
    }
}

/* FINAL DE LA MISIÓN */

async function finalizarMision() {
    if (terminado || finalizando) return;

    finalizando = true;
    puedeTrazar = false;
    trazando = false;

    secuenciaActual++;
    quitarPista();

    alumna.classList.remove("salta", "llegada");

    await pausa(650);

    mostrarGrupo();
    alumna.classList.add("llegada", "festeja");

    cambiarStarly("celebrando", true);

    sonidoAcierto();
    crearDestellos(nombre);

    await pausa(400);

    // Diálogo final antes de mostrar la celebración.
    await dialogoConLimite("final", 8000, 1800);

    if (terminado) return;

    await pausa(400);

    guardarProgreso();

    terminado = true;
    finalizando = false;

    detenerAudio();

    // El audio de victoria se reproduce únicamente en la celebración.
    if (typeof window.mostrarCelebracion === "function") {
        window.mostrarCelebracion({
            mision: NUMERO_MISION,
            estrellas: 3,
            titulo: "¡Misión completada!",
            mensaje: "Todos tenemos derecho a aprender escribir nuestros nombres",
            audio: configuracion.voz
                ? RUTA_AUDIO + "victoria.mp3"
                : null,
            destino: "../mapa.html"
        });

        return;
    }

    // Alternativa si el componente de celebración no está disponible.
    await dialogoConLimite("victoria", 10000, 2500);
}

/* INTRODUCCIÓN EN EL SALÓN */

async function contarHistoria() {
    introActiva = true;

    cambiarStarly("feliz");

    nombre.innerHTML = "";

    construirLetra("A");
    punta.classList.add("oculta");

    mostrarGrupo();
    alumna.classList.add("llegada", "saluda");

    await dialogoConLimite("inicio", 6500, 1000);

    if (!introActiva || terminado) return;

    await pausa(150);

    await dialogoConLimite("instrucciones", 7500, 1200);

    if (!introActiva || terminado) return;

    introActiva = false;

    alumna.classList.remove("saluda", "llegada");

    await pausa(350);

    await turnoDe(0);
}

/* BOTÓN PARA ESCUCHAR A STARLY */

botonAudio.addEventListener("click", () => {
    if (terminado) return;

    if (finalizando) {
        decir("final");
        return;
    }

    if (puedeTrazar) {
        decir("pista");
    } else {
        decir(ultimoDialogo);
    }
});

/* LIMPIEZA */

window.addEventListener("pagehide", () => {
    clearTimeout(temporizadorPista);

    terminado = true;
    finalizando = false;
    puedeTrazar = false;

    cancelarDemo();
    detenerAudio();
});

/* INICIAR MISIÓN */

prepararEstrellas();
contarHistoria();
