
/* ESTRELLITAS DEL SABER - MISIÓN 4 */

const MISION = 4;
const CLAVE_PROGRESO = "estrellitas_del_saber_progreso";
const IMAGEN_SALON = "../../img/fondos/rompecabezas.png";

const TOTAL_PIEZAS = 6;
const COLUMNAS = 3;
const FILAS = 2;
const TIEMPO_LIMITE = 40;

const tablero = document.getElementById("tablero");
const casillas = document.getElementById("casillas");
const izquierda = document.getElementById("piezas-izquierda");
const derecha = document.getElementById("piezas-derecha");
const guiaImagen = document.getElementById("guia-imagen");
const dialogo = document.getElementById("dialogo");
const botonAudio = document.getElementById("boton-audio");
const reloj = document.getElementById("reloj");
const tiempoTexto = document.getElementById("tiempo");
const progresoTexto = document.getElementById("progreso");
const pantallaFinal = document.getElementById("final");
const efectos = document.getElementById("efectos");

const sonidoCorrecto = new Audio("../../audio/efectos/correcto.mp3");
const sonidoIncorrecto = new Audio("../../audio/efectos/incorrecto.mp3");
const narracion = new Audio("../../audio/narraciones/mision_4.mp3");

let seleccionada = null;
let colocadas = 0;
let terminado = false;
let imagenCargada = false;
let tiempoRestante = TIEMPO_LIMITE;
let intervalo = null;
let tiempoFinal = null;
let relojIniciado = false;
let jugando = false;
let demostrando = false;
let tokenPartida = 0;
let arrastre = null;

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function reproducir(audio) {
    if (!audio) return;

    audio.currentTime = 0;
    audio.play().catch(() => {});
}

function reaccionar(texto) {
    dialogo.textContent = texto;
}

function formatearTiempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const resto = segundos % 60;

    return `${String(minutos).padStart(2, "0")}:${String(resto).padStart(2, "0")}`;
}

function actualizarReloj() {
    tiempoTexto.textContent = formatearTiempo(tiempoRestante);
    reloj.classList.toggle("urgente", tiempoRestante <= 20);
}

function detenerReloj() {
    if (intervalo !== null) {
        clearInterval(intervalo);
        intervalo = null;
    }

    tiempoFinal = null;
    relojIniciado = false;
}

function iniciarReloj() {
    if (relojIniciado || terminado || !jugando) return;

    relojIniciado = true;
    tiempoFinal = Date.now() + tiempoRestante * 1000;

    intervalo = setInterval(() => {
        if (terminado) {
            detenerReloj();
            return;
        }

        tiempoRestante = Math.max(
            0,
            Math.ceil((tiempoFinal - Date.now()) / 1000)
        );

        actualizarReloj();

        if (tiempoRestante === 0) {
            terminado = true;
            jugando = false;
            cancelarArrastre();
            detenerReloj();
            finalizar(false);
        }
    }, 200);
}

function posicionPieza(indice) {
    const columna = indice % COLUMNAS;
    const fila = Math.floor(indice / COLUMNAS);

    return {
        x: `${columna * 50}%`,
        y: `${fila * 100}%`
    };
}

function aplicarImagen(elemento, indice) {
    const posicion = posicionPieza(indice);

    elemento.style.backgroundImage = `url("${IMAGEN_SALON}")`;
    elemento.style.backgroundSize = "300% 200%";
    elemento.style.backgroundPosition = `${posicion.x} ${posicion.y}`;
    elemento.style.backgroundRepeat = "no-repeat";
}

function mezclar(indices) {
    const copia = [...indices];

    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [copia[i], copia[j]] = [copia[j], copia[i]];
    }

    return copia;
}

function cargarImagen() {
    const imagen = new Image();

    imagen.onload = () => {
        imagenCargada = true;
        guiaImagen.style.backgroundImage = `url("${IMAGEN_SALON}")`;
        tablero.style.aspectRatio =
            `${imagen.naturalWidth} / ${imagen.naturalHeight}`;

        iniciarJuego(true);
    };

    imagen.onerror = () => {
        reaccionar("No se pudo cargar la imagen.");
        console.error("Error al cargar:", IMAGEN_SALON);
    };

    imagen.src = IMAGEN_SALON;
}

function destellos(elemento) {
    const area = efectos.getBoundingClientRect();
    const rect = elemento.getBoundingClientRect();

    const x = rect.left - area.left + rect.width / 2;
    const y = rect.top - area.top + rect.height / 2;

    for (let i = 0; i < 7; i++) {
        const estrella = document.createElement("span");

        estrella.className = "puzzle-destello";
        estrella.textContent = "★";
        estrella.style.left =
            `${x + (Math.random() - 0.5) * 80}px`;
        estrella.style.top =
            `${y + (Math.random() - 0.5) * 60}px`;

        efectos.appendChild(estrella);

        setTimeout(() => estrella.remove(), 1100);
    }
}

function seleccionarPieza(pieza) {
    if (!jugando || terminado) return;

    iniciarReloj();

    if (seleccionada) {
        seleccionada.classList.remove("seleccionada");
    }

    if (seleccionada === pieza) {
        seleccionada = null;
        return;
    }

    seleccionada = pieza;
    pieza.classList.add("seleccionada");
}

function marcarError(casilla) {
    reproducir(sonidoIncorrecto);
    reaccionar("¡Prueba otra vez!");

    casilla.classList.remove("error");
    void casilla.offsetWidth;
    casilla.classList.add("error");

    setTimeout(() => {
        casilla.classList.remove("error");
    }, 450);
}

function colocarPieza(indiceCasilla, pieza = seleccionada) {
    if (!jugando || terminado || !pieza) return false;

    const casilla = casillas.children[indiceCasilla];

    if (!casilla || casilla.classList.contains("ocupada")) {
        return false;
    }

    const indicePieza = Number(pieza.dataset.indice);

    if (indicePieza !== indiceCasilla) {
        marcarError(casilla);
        return false;
    }

    reproducir(sonidoCorrecto);

    const imagenColocada = document.createElement("div");
    imagenColocada.className = "puzzle-colocada";

    aplicarImagen(imagenColocada, indicePieza);

    casilla.appendChild(imagenColocada);
    casilla.classList.add("ocupada");
    casilla.setAttribute("aria-label", "Pieza colocada");

    destellos(casilla);

    pieza.remove();

    seleccionada = null;
    colocadas++;

    progresoTexto.textContent = `🧩 ${colocadas}/6`;

    reaccionar(
        colocadas === TOTAL_PIEZAS
            ? "¡Lo lograste!"
            : "¡Muy bien!"
    );

    if (colocadas === TOTAL_PIEZAS) {
        terminado = true;
        jugando = false;
        detenerReloj();

        const partida = tokenPartida;

        setTimeout(() => {
            if (partida === tokenPartida) {
                finalizar(true);
            }
        }, 850);
    }

    return true;
}

function crearCasillas() {
    casillas.innerHTML = "";

    for (let i = 0; i < TOTAL_PIEZAS; i++) {
        const casilla = document.createElement("button");

        casilla.type = "button";
        casilla.className = "puzzle-casilla";
        casilla.dataset.indice = i;
        casilla.setAttribute("aria-label", `Espacio ${i + 1}`);

        casilla.addEventListener("click", () => {
            colocarPieza(i);
        });

        casillas.appendChild(casilla);
    }
}

function crearPiezas() {
    izquierda.innerHTML = "";
    derecha.innerHTML = "";

    const indices = mezclar([0, 1, 2, 3, 4, 5]);

    indices.forEach((indice, posicion) => {
        const pieza = document.createElement("button");

        pieza.type = "button";
        pieza.className = "puzzle-pieza";
        pieza.dataset.indice = indice;
        pieza.setAttribute("aria-label", `Pieza ${indice + 1}`);

        aplicarImagen(pieza, indice);

        pieza.addEventListener("pointerdown", evento => {
            comenzarArrastre(evento, pieza);
        });

        pieza.addEventListener("pointermove", moverArrastre);
        pieza.addEventListener("pointerup", terminarArrastre);
        pieza.addEventListener("pointercancel", cancelarArrastreEvento);

        pieza.addEventListener("click", evento => {
            if (!jugando || terminado) return;

            if (pieza.dataset.ignorarClick === "1") {
                pieza.dataset.ignorarClick = "0";
                return;
            }

            seleccionarPieza(pieza);
        });

        if (posicion < 3) {
            izquierda.appendChild(pieza);
        } else {
            derecha.appendChild(pieza);
        }
    });
}

function crearFantasma(pieza, rect) {
    const fantasma = document.createElement("div");

    fantasma.className = "puzzle-fantasma";
    fantasma.style.width = `${rect.width}px`;
    fantasma.style.height = `${rect.height}px`;

    aplicarImagen(fantasma, Number(pieza.dataset.indice));

    document.body.appendChild(fantasma);

    return fantasma;
}

function comenzarArrastre(evento, pieza) {
    if (!jugando || terminado || !evento.isPrimary) return;
    if (evento.pointerType === "mouse" && evento.button !== 0) return;

    evento.preventDefault();
    iniciarReloj();

    const rect = pieza.getBoundingClientRect();

    arrastre = {
        pieza,
        pointerId: evento.pointerId,
        inicioX: evento.clientX,
        inicioY: evento.clientY,
        offsetX: evento.clientX - rect.left,
        offsetY: evento.clientY - rect.top,
        ancho: rect.width,
        alto: rect.height,
        fantasma: null,
        movido: false
    };

    pieza.setPointerCapture(evento.pointerId);
}

function moverArrastre(evento) {
    if (!arrastre || evento.pointerId !== arrastre.pointerId) return;
    if (!jugando || terminado) return;

    const distancia = Math.hypot(
        evento.clientX - arrastre.inicioX,
        evento.clientY - arrastre.inicioY
    );

    if (!arrastre.movido && distancia < 4) return;

    if (!arrastre.movido) {
        arrastre.movido = true;
        arrastre.pieza.classList.add("arrastrando");

        arrastre.fantasma = crearFantasma(
            arrastre.pieza,
            arrastre.pieza.getBoundingClientRect()
        );
    }

    const x = evento.clientX - arrastre.offsetX;
    const y = evento.clientY - arrastre.offsetY;

    arrastre.fantasma.style.left = `${x}px`;
    arrastre.fantasma.style.top = `${y}px`;
}

function buscarCasilla(x, y) {
    const elemento = document.elementFromPoint(x, y);

    if (!elemento) return null;

    const casilla = elemento.closest(".puzzle-casilla");

    if (!casilla || casilla.classList.contains("ocupada")) {
        return null;
    }

    return casilla;
}

function terminarArrastre(evento) {
    if (!arrastre || evento.pointerId !== arrastre.pointerId) return;

    const datos = arrastre;
    arrastre = null;

    if (datos.pieza.hasPointerCapture(evento.pointerId)) {
        datos.pieza.releasePointerCapture(evento.pointerId);
    }

    if (!datos.movido) {
        return;
    }

    datos.pieza.dataset.ignorarClick = "1";
    datos.pieza.classList.remove("arrastrando");

    if (datos.fantasma) {
        datos.fantasma.remove();
    }

    const centroX = evento.clientX - datos.offsetX + datos.ancho / 2;
    const centroY = evento.clientY - datos.offsetY + datos.alto / 2;

    const casilla =
        buscarCasilla(evento.clientX, evento.clientY) ||
        buscarCasilla(centroX, centroY);

    if (casilla) {
        colocarPieza(Number(casilla.dataset.indice), datos.pieza);
    }

    setTimeout(() => {
        if (datos.pieza.isConnected) {
            datos.pieza.dataset.ignorarClick = "0";
        }
    }, 100);
}

function cancelarArrastre() {
    if (!arrastre) return;

    const datos = arrastre;
    arrastre = null;

    datos.pieza.classList.remove("arrastrando");

    if (datos.fantasma) {
        datos.fantasma.remove();
    }

    if (
        datos.pieza.isConnected &&
        datos.pieza.hasPointerCapture(datos.pointerId)
    ) {
        datos.pieza.releasePointerCapture(datos.pointerId);
    }
}

function cancelarArrastreEvento(evento) {
    if (arrastre && evento.pointerId === arrastre.pointerId) {
        cancelarArrastre();
    }
}

async function mostrarDemostracion(partida) {
    demostrando = true;
    jugando = false;

    reaccionar("¡Mira, Tripulante!");

    await esperar(1000);

    if (partida !== tokenPartida) return;

    const pieza = izquierda.querySelector(".puzzle-pieza");

    if (!pieza) {
        demostrando = false;
        jugando = true;
        return;
    }

    const indice = Number(pieza.dataset.indice);
    const destino = casillas.children[indice];

    const origenRect = pieza.getBoundingClientRect();
    const destinoRect = destino.getBoundingClientRect();

    const origenX = origenRect.left;
    const origenY = origenRect.top;

    const destinoX =
        destinoRect.left + (destinoRect.width - origenRect.width) / 2;

    const destinoY =
        destinoRect.top + (destinoRect.height - origenRect.height) / 2;

    const fantasma = crearFantasma(pieza, origenRect);
    const mano = document.createElement("div");

    mano.className = "puzzle-mano";
    mano.textContent = "👆";
    mano.setAttribute("aria-hidden", "true");

    document.body.appendChild(mano);

    pieza.style.opacity = "0.2";
    destino.classList.add("destino-demo");

    const desplazamientoX = destinoX - origenX;
    const desplazamientoY = destinoY - origenY;

    const inicioManoX = origenX + origenRect.width * 0.55;
    const inicioManoY = origenY + origenRect.height * 0.55;

    fantasma.style.left = `${origenX}px`;
    fantasma.style.top = `${origenY}px`;

    mano.style.left = `${inicioManoX}px`;
    mano.style.top = `${inicioManoY}px`;

    const fotogramas = [
        { transform: "translate(0px, 0px)" },
        { transform: "translate(0px, 0px)", offset: 0.15 },
        {
            transform: `translate(${desplazamientoX}px, ${desplazamientoY}px)`,
            offset: 0.78
        },
        {
            transform: `translate(${desplazamientoX}px, ${desplazamientoY}px)`
        }
    ];

    const opciones = {
        duration: 2600,
        easing: "ease-in-out",
        fill: "forwards"
    };

    const animacionPieza = fantasma.animate(fotogramas, opciones);
    const animacionMano = mano.animate(fotogramas, opciones);

    await Promise.allSettled([
        animacionPieza.finished,
        animacionMano.finished
    ]);

    if (partida !== tokenPartida) {
        fantasma.remove();
        mano.remove();
        return;
    }

    await esperar(450);

    fantasma.remove();
    mano.remove();

    pieza.style.opacity = "";
    destino.classList.remove("destino-demo");

    demostrando = false;
    jugando = true;

    reaccionar("¡Ahora tú!");
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

    if (
        !progreso ||
        typeof progreso !== "object" ||
        Array.isArray(progreso)
    ) {
        progreso = {};
    }

    if (!Array.isArray(progreso.completadas)) {
        progreso.completadas = [];
    }

    if (
        !progreso.estrellas ||
        typeof progreso.estrellas !== "object"
    ) {
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

function finalizar(completado) {
    detenerReloj();

    if (completado) {
        guardarProgreso();

        if (typeof window.mostrarCelebracion === "function") {
            window.mostrarCelebracion({
                mision: MISION,
                estrellas: 3,
                titulo: "¡Salón completado!",
                mensaje: "¡Conseguiste las tres estrellas!",
                destino: "../mapa.html"
            });

            return;
        }
    }

    document.getElementById("titulo-final").textContent =
        completado ? "¡Excelente!" : "¡Se acabó el tiempo!";

    document.getElementById("resultado-final").textContent =
        completado ? "⭐⭐⭐" : "⏰";

    document.getElementById("mensaje-final").textContent =
        completado
            ? "¡Completaste el rompecabezas!"
            : "¡Vamos a intentarlo otra vez!";

    pantallaFinal.hidden = false;
}

async function iniciarJuego(conDemostracion = false) {
    if (!imagenCargada) return;

    tokenPartida++;
    const partida = tokenPartida;

    detenerReloj();
    cancelarArrastre();

    seleccionada = null;
    colocadas = 0;
    terminado = false;
    jugando = false;
    demostrando = false;
    tiempoRestante = TIEMPO_LIMITE;

    pantallaFinal.hidden = true;
    progresoTexto.textContent = "🧩 0/6";

    actualizarReloj();
    crearCasillas();
    crearPiezas();

    if (conDemostracion) {
        reaccionar("¡Armemos nuestro salón!");

        reproducir(narracion);

        await esperar(6500);

        if (partida !== tokenPartida) return;

        await mostrarDemostracion(partida);
    } else {
        reaccionar("¡Vamos de nuevo!");
        jugando = true;
    }
}

botonAudio.addEventListener("click", () => {
    reproducir(narracion);
});

narracion.addEventListener("play", () => {
    botonAudio.classList.add("reproduciendo");
});

narracion.addEventListener("pause", () => {
    botonAudio.classList.remove("reproduciendo");
});

narracion.addEventListener("ended", () => {
    botonAudio.classList.remove("reproduciendo");
});

document.getElementById("reintentar").addEventListener("click", () => {
    iniciarJuego(false);
});

cargarImagen();
