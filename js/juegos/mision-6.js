
/* ESTRELLITAS DEL SABER - MISIÓN 6 */

const MISION = 6;
const CLAVE_PROGRESO = "estrellitas_del_saber_progreso";
const TOTAL_PASOS = 3;

const plataformas = document.querySelectorAll(".final-plataforma");
const starly = document.getElementById("starly-jugador");
const escuela = document.getElementById("escuela");
const dialogo = document.getElementById("dialogo");
const contador = document.getElementById("contador");
const mano = document.getElementById("demostracion-mano");
const particulas = document.getElementById("particulas");
const granFinal = document.getElementById("gran-final");
const botonAudio = document.getElementById("boton-audio");

const narracion = new Audio("../../audio/narraciones/mision_6.mp3");
const sonidoCorrecto = new Audio("../../audio/efectos/correcto.mp3");
const sonidoIncorrecto = new Audio("../../audio/efectos/incorrecto.mp3");

let pasoActual = 0;
let jugando = false;
let bloqueado = false;
let terminado = false;
let tokenJuego = 0;

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function reproducir(audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
}

function reaccionar(texto) {
    dialogo.textContent = texto;
}

function actualizarPlataformas() {
    plataformas.forEach(plataforma => {
        const paso = Number(plataforma.dataset.paso);

        plataforma.disabled = !jugando || bloqueado || paso !== pasoActual + 1;

        plataforma.classList.toggle(
            "disponible",
            jugando && !bloqueado && paso === pasoActual + 1
        );
    });
}

function crearParticulas(elemento, cantidad = 12) {
    const escenario = document.getElementById("escenario");
    const rectEscenario = escenario.getBoundingClientRect();
    const rect = elemento.getBoundingClientRect();

    const centroX = rect.left - rectEscenario.left + rect.width / 2;
    const centroY = rect.top - rectEscenario.top + rect.height / 2;

    for (let i = 0; i < cantidad; i++) {
        const particula = document.createElement("span");

        particula.className = "final-particula";
        particula.textContent = Math.random() > 0.5 ? "⭐" : "✦";
        particula.style.left = `${centroX}px`;
        particula.style.top = `${centroY}px`;
        particula.style.setProperty(
            "--dx",
            `${(Math.random() - 0.5) * 240}px`
        );
        particula.style.setProperty(
            "--dy",
            `${(Math.random() - 0.5) * 200}px`
        );

        particulas.appendChild(particula);

        setTimeout(() => particula.remove(), 1400);
    }
}

async function demostrarMovimiento(partida) {
    reaccionar("¡Mira, Tripulante!");

    mano.classList.add("demostrando");

    await esperar(2300);

    if (partida !== tokenJuego) return;

    mano.classList.remove("demostrando");

    jugando = true;
    bloqueado = false;

    reaccionar("¡Ahora tú!");

    actualizarPlataformas();
}

async function moverStarly(paso) {
    if (!jugando || bloqueado || terminado) return;
    if (paso !== pasoActual + 1) return;

    bloqueado = true;
    actualizarPlataformas();

    const plataforma = document.querySelector(
        `.final-plataforma[data-paso="${paso}"]`
    );

    const partida = tokenJuego;

    const posiciones = [
        { left: "7%", bottom: "15%" },
        { left: "26%", bottom: "22%" },
        { left: "46%", bottom: "29%" },
        { left: "66%", bottom: "37%" }
    ];

    const destino = posiciones[paso];

    starly.classList.remove("saltando");
    void starly.offsetWidth;
    starly.classList.add("saltando");

    starly.style.left = destino.left;
    starly.style.bottom = destino.bottom;

    await esperar(900);

    if (partida !== tokenJuego) return;

    starly.classList.remove("saltando");

    plataforma.classList.add("recogida");
    reproducir(sonidoCorrecto);
    crearParticulas(plataforma);

    pasoActual = paso;

    contador.textContent = `${pasoActual}/${TOTAL_PASOS}`;

    const estrella = document.getElementById(`estrella-${paso}`);
    estrella.textContent = "★";
    estrella.classList.add("conseguida");

    document.getElementById(`paso-${paso}`).classList.add("completo");

    reaccionar(
        pasoActual === TOTAL_PASOS
            ? "¡La escuela brillará!"
            : "¡Excelente!"
    );

    if (pasoActual === TOTAL_PASOS) {
        terminado = true;
        jugando = false;

        await esperar(500);

        if (partida !== tokenJuego) return;

        iluminarEscuela();
        return;
    }

    bloqueado = false;
    actualizarPlataformas();
}

function guardarProgreso() {
    let progreso;

    try {
        progreso = JSON.parse(
            localStorage.getItem(CLAVE_PROGRESO) || "{}"
        );
    } catch {
        progreso = {};
    }

    if (!progreso || typeof progreso !== "object" || Array.isArray(progreso)) {
        progreso = {};
    }

    if (!Array.isArray(progreso.completadas)) {
        progreso.completadas = [];
    }

    if (!progreso.estrellas || typeof progreso.estrellas !== "object") {
        progreso.estrellas = {};
    }

    if (!progreso.completadas.includes(MISION)) {
        progreso.completadas.push(MISION);
    }

    progreso.estrellas[MISION] = Math.max(
        Number(progreso.estrellas[MISION] || 0),
        3
    );

    localStorage.setItem(
        CLAVE_PROGRESO,
        JSON.stringify(progreso)
    );
}

function contarEstrellas() {
    let progreso;

    try {
        progreso = JSON.parse(
            localStorage.getItem(CLAVE_PROGRESO) || "{}"
        );
    } catch {
        progreso = {};
    }

    const estrellas = progreso.estrellas || {};

    return Array.from({ length: 6 }, (_, indice) => {
        const valor = Number(estrellas[indice + 1] || 0);
        return Math.min(3, Math.max(0, valor));
    }).reduce((total, cantidad) => total + cantidad, 0);
}

async function iluminarEscuela() {
    escuela.classList.add("iluminada");

    crearParticulas(escuela, 35);

    reaccionar("¡Lo logramos, Tripulante!");

    guardarProgreso();

    await esperar(1800);

    const total = contarEstrellas();
    document.getElementById("total-estrellas").textContent = `${total}/18 ⭐`;

    granFinal.hidden = false;
}

function iniciarJuego() {
    tokenJuego++;
    const partida = tokenJuego;

    pasoActual = 0;
    jugando = false;
    bloqueado = true;
    terminado = false;

    starly.style.left = "7%";
    starly.style.bottom = "15%";

    plataformas.forEach(plataforma => {
        plataforma.classList.remove("recogida", "disponible");
        plataforma.disabled = true;
    });

    actualizarPlataformas();

    reaccionar("¡Vamos a iluminar la escuela!");

    reproducir(narracion);

    setTimeout(() => {
        if (partida === tokenJuego) {
            demostrarMovimiento(partida);
        }
    }, 6500);
}

plataformas.forEach(plataforma => {
    plataforma.addEventListener("click", () => {
        moverStarly(Number(plataforma.dataset.paso));
    });
});

botonAudio.addEventListener("click", () => {
    reproducir(narracion);
});

iniciarJuego();
