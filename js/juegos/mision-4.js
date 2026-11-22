
/* ESTRELLITAS DEL SABER - MISIÓN 4 */

"use strict";

const MISION = 4;
const TOTAL_PIEZAS = 6;
const COLUMNAS = 3;
const TIEMPO_LIMITE = 40;

const IMAGEN_SALON = "../../img/fondos/rompecabezas.png";
const RUTA_AUDIO = "../../audio/juegos/mision-4/";
const RUTA_STARLY = "../../img/personajes/starly/";

const CLAVE_PROGRESO = "estrellitas_del_saber_progreso";
const CLAVE_CONFIGURACION = "estrellitas_del_saber_configuracion";

const $ = (id) => document.getElementById(id);

const tablero = $("tablero");
const casillas = $("casillas");
const izquierda = $("piezas-izquierda");
const derecha = $("piezas-derecha");
const guiaImagen = $("guia-imagen");
const salonCompleto = $("salon-completo");
const areaJuego = $("area-juego");
const dialogo = $("dialogo");
const botonAudio = $("boton-audio");
const reloj = $("reloj");
const tiempoTexto = $("tiempo");
const progresoTexto = $("progreso");
const contadorEstrellas = $("contador-estrellas");
const pantallaFinal = $("final");
const starly = $("starly");
const starlyFinal = $("starly-final");
const efectos = $("efectos");

const AUDIOS = {
    historia: "historia.mp3",
    desorden: "desorden.mp3",
    instrucciones: "instrucciones.mp3",
    ahoraTu: "ahora-tu.mp3",
    arrastrar: "arrastrar.mp3",
    seleccionar: "seleccionar.mp3",
    correcto: "correcto.mp3",
    error: "error.mp3",
    excelente: "excelente.mp3",
    muyBien: "muy-bien.mp3",
    reloj: "reloj.mp3",
    tiempo: "tiempo.mp3",
    final: "final.mp3",
    victoria: "victoria.mp3"
};

const FRASES = {
    historia: "¡Mira, tripulante! ¡Este es nuestro salón de clases!",
    desorden: "¡Oh, no! ¡Nuestro salón se ha desordenado!",
    instrucciones: "¡Vamos a unir las piezas para armarlo!",
    ahoraTu: "¡Vamos a armar nuestro salón!",
    arrastrar: "¡Mira! ¡Arrastra la pieza hasta su lugar!",
    excelente: "¡Excelente! ¡Sigue así!",
    muyBien: "¡Muy bien! ¡Sigue buscando!",
    tiempo: "¡Oh, no! ¡Intentémoslo otra vez!",
    final: "¡Lo logramos! ¡Nuestro salón está listo!",
    victoria: "¡En nuestro salón aprendemos juntos!"
};

const EXPRESIONES = {
    normal: RUTA_STARLY + "starly_lenguaje.webp",
    asustado: RUTA_STARLY + "starly_asustado.webp",
    alegre: RUTA_STARLY + "starly_explorador.webp",
    triste: RUTA_STARLY + "starly_triste.webp"
};

const configuracion = {
    musica: true,
    efectos: true,
    voz: true
};

try {
    const guardada = JSON.parse(
        localStorage.getItem(CLAVE_CONFIGURACION) || "{}"
    );

    if (guardada && typeof guardada === "object") {
        Object.assign(configuracion, guardada);
    }
} catch (error) {
    console.warn("Se utilizará la configuración predeterminada.");
}

let partidaActual = 0;
let imagenCargada = false;

let jugando = false;
let terminado = false;
let finalizando = false;

let seleccionada = null;
let colocadas = 0;

let tiempoRestante = TIEMPO_LIMITE;
let relojIniciado = false;
let intervalo = null;
let vencimiento = 0;

let arrastre = null;
let audioVoz = null;
let resolverVoz = null;
let audioReloj = null;
let tokenNarracion = 0;

let animacionesActivas = [];
let elementosTemporales = [];
let esperaDesbloqueo = null;

let primeraPiezaColocada = false;
let demostracionObjetivo = null;
let demostracionToken = 0;
let demostracionActiva = false;
let animacionesDemostracion = [];
let elementosDemostracion = [];
let piezaDemostracion = null;
let casillaDemostracion = null;

const sonidosActivos = new Set();

/* UTILIDADES */

function esperar(ms) {
    return new Promise((resolver) => setTimeout(resolver, ms));
}

function vigente(id) {
    return id === partidaActual;
}

function mostrarDialogo(texto) {
    if (dialogo) {
        dialogo.textContent = texto;
    }
}

function formatoTiempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const resto = segundos % 60;

    return `${String(minutos).padStart(2, "0")}:${String(resto).padStart(2, "0")}`;
}

function posicionPieza(indice) {
    return {
        x: `${(indice % COLUMNAS) * 50}%`,
        y: `${Math.floor(indice / COLUMNAS) * 100}%`
    };
}

function aplicarImagen(elemento, indice) {
    const posicion = posicionPieza(indice);

    elemento.style.backgroundImage = `url("${IMAGEN_SALON}")`;
    elemento.style.backgroundSize = "300% 200%";
    elemento.style.backgroundPosition = `${posicion.x} ${posicion.y}`;
    elemento.style.backgroundRepeat = "no-repeat";
}

function mezclar(valores) {
    const copia = [...valores];

    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }

    return copia;
}

/* EXPRESIONES DE STARLY */

function cambiarExpresion(tipo) {
    if (!starly) return;

    const ruta = EXPRESIONES[tipo] || EXPRESIONES.normal;
    const id = partidaActual;
    const imagen = new Image();

    imagen.onload = () => {
        if (vigente(id)) {
            starly.src = ruta;
        }
    };

    imagen.onerror = () => {
        if (vigente(id) && tipo !== "normal") {
            starly.src = EXPRESIONES.normal;
        }
    };

    imagen.src = ruta;
}

function cambiarExpresionFinal(tipo) {
    if (!starlyFinal) return;

    const ruta = EXPRESIONES[tipo] || EXPRESIONES.alegre;
    const imagen = new Image();

    imagen.onload = () => {
        if (!pantallaFinal.hidden) {
            starlyFinal.src = ruta;
        }
    };

    imagen.src = ruta;
}

/* EFECTOS DE SONIDO */

function reproducirEfecto(nombre, volumen = 0.45, repetir = false) {
    if (!configuracion.efectos || !AUDIOS[nombre]) {
        return null;
    }

    const audio = new Audio(RUTA_AUDIO + AUDIOS[nombre]);

    audio.volume = volumen;
    audio.loop = repetir;

    sonidosActivos.add(audio);

    const limpiar = () => {
        sonidosActivos.delete(audio);
    };

    audio.addEventListener("ended", limpiar, { once: true });
    audio.addEventListener("error", limpiar, { once: true });

    audio.play().catch(limpiar);

    return audio;
}

function detenerEfecto(audio) {
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    sonidosActivos.delete(audio);
}

function detenerEfectos() {
    for (const audio of [...sonidosActivos]) {
        detenerEfecto(audio);
    }

    audioReloj = null;
}

/* NARRACIONES */

function detenerVoz() {
    tokenNarracion++;

    const audio = audioVoz;
    const resolver = resolverVoz;

    audioVoz = null;
    resolverVoz = null;

    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }

    botonAudio.classList.remove("reproduciendo");

    if (resolver) {
        resolver(false);
    }
}

function crearDesbloqueoAudio() {
    if ($("inicio-audio")) {
        return $("inicio-audio");
    }

    const contenedor = document.createElement("div");

    contenedor.id = "inicio-audio";
    contenedor.className = "puzzle-inicio-audio";

    contenedor.innerHTML = `
        <div class="puzzle-inicio-contenido">
            <img src="${EXPRESIONES.normal}" alt="Starly">
            <p>¡Conozcamos nuestro salón!</p>
            <button
                id="iniciar-audio"
                class="puzzle-boton"
                type="button"
            >
                ▶ ¡Comenzar!
            </button>
        </div>
    `;

    document.body.appendChild(contenedor);

    return contenedor;
}

function esperarPermisoAudio() {
    const contenedor = crearDesbloqueoAudio();
    const boton = $("iniciar-audio");

    return new Promise((resolver) => {
        esperaDesbloqueo = resolver;

        boton.addEventListener("click", () => {
            esperaDesbloqueo = null;
            contenedor.remove();
            resolver(true);
        }, { once: true });
    });
}

function cancelarDesbloqueo() {
    $("inicio-audio")?.remove();

    if (esperaDesbloqueo) {
        const resolver = esperaDesbloqueo;
        esperaDesbloqueo = null;
        resolver(false);
    }
}

async function narrar(nombre, id = partidaActual) {
    if (!AUDIOS[nombre] || !vigente(id)) {
        return false;
    }

    detenerVoz();

    const token = tokenNarracion;

    if (FRASES[nombre]) {
        mostrarDialogo(FRASES[nombre]);
    }

    if (!configuracion.voz) {
        return false;
    }

    const audio = new Audio(RUTA_AUDIO + AUDIOS[nombre]);

    audio.volume = 0.95;
    audioVoz = audio;

    let iniciado = false;

    try {
        await audio.play();
        iniciado = true;
    } catch (error) {
        if (error.name === "NotAllowedError" && vigente(id)) {
            const autorizado = await esperarPermisoAudio();

            if (
                autorizado &&
                vigente(id) &&
                token === tokenNarracion
            ) {
                try {
                    await audio.play();
                    iniciado = true;
                } catch (segundoError) {
                    console.warn(
                        "No se pudo reproducir:",
                        AUDIOS[nombre]
                    );
                }
            }
        } else if (error.name !== "AbortError") {
            console.warn(
                "No se pudo reproducir:",
                AUDIOS[nombre]
            );
        }
    }

    if (
        !iniciado ||
        !vigente(id) ||
        token !== tokenNarracion ||
        audioVoz !== audio
    ) {
        if (audioVoz === audio) {
            audioVoz = null;
        }

        return false;
    }

    botonAudio.classList.add("reproduciendo");

    return new Promise((resolver) => {
        let resuelto = false;

        const finalizarAudio = (resultado) => {
            if (resuelto) return;

            resuelto = true;

            if (audioVoz === audio) {
                audioVoz = null;
                resolverVoz = null;
                botonAudio.classList.remove("reproduciendo");
            }

            resolver(resultado);
        };

        resolverVoz = finalizarAudio;

        audio.addEventListener(
            "ended",
            () => finalizarAudio(true),
            { once: true }
        );

        audio.addEventListener(
            "error",
            () => finalizarAudio(false),
            { once: true }
        );

        if (audio.ended) {
            finalizarAudio(true);
        }
    });
}

async function narrarConMinimo(nombre, id, minimo = 400) {
    await Promise.all([
        narrar(nombre, id),
        esperar(minimo)
    ]);
}

/* TEMPORIZADOR */

function actualizarReloj() {
    tiempoTexto.textContent = formatoTiempo(tiempoRestante);

    reloj.classList.toggle(
        "urgente",
        relojIniciado && tiempoRestante <= 10
    );
}

function detenerSonidoReloj() {
    detenerEfecto(audioReloj);
    audioReloj = null;
}

function detenerReloj() {
    if (intervalo !== null) {
        clearInterval(intervalo);
        intervalo = null;
    }

    relojIniciado = false;
    vencimiento = 0;

    detenerSonidoReloj();
    actualizarReloj();
}

function iniciarReloj() {
    if (
        relojIniciado ||
        !jugando ||
        terminado ||
        finalizando
    ) {
        return;
    }

    relojIniciado = true;
    vencimiento = Date.now() + tiempoRestante * 1000;

    actualizarReloj();

    intervalo = setInterval(() => {
        if (!jugando || terminado || finalizando) {
            detenerReloj();
            return;
        }

        tiempoRestante = Math.max(
            0,
            Math.ceil((vencimiento - Date.now()) / 1000)
        );

        actualizarReloj();

        if (tiempoRestante <= 10 && tiempoRestante > 0) {
            if (!audioReloj) {
                audioReloj = reproducirEfecto(
                    "reloj",
                    0.18,
                    true
                );
            }
        }

        if (tiempoRestante === 0) {
            jugando = false;
            terminado = true;

            cancelarArrastre();
            detenerDemostracion();
            detenerReloj();

            finalizar(false);
        }
    }, 150);
}

/* TABLERO */

function crearCasillas() {
    casillas.innerHTML = "";

    for (let i = 0; i < TOTAL_PIEZAS; i++) {
        const casilla = document.createElement("button");

        casilla.type = "button";
        casilla.className = "puzzle-casilla";
        casilla.dataset.indice = i;

        casilla.setAttribute(
            "aria-label",
            `Espacio ${i + 1}`
        );

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

        pieza.setAttribute(
            "aria-label",
            `Pieza ${indice + 1}`
        );

        aplicarImagen(pieza, indice);

        pieza.addEventListener("pointerdown", (evento) => {
            comenzarArrastre(evento, pieza);
        });

        pieza.addEventListener(
            "pointermove",
            moverArrastre
        );

        pieza.addEventListener(
            "pointerup",
            terminarArrastre
        );

        pieza.addEventListener(
            "pointercancel",
            cancelarArrastreEvento
        );

        pieza.addEventListener("click", (evento) => {
            if (evento.detail === 0) {
                seleccionarPieza(pieza);
            }
        });

        if (posicion < 3) {
            izquierda.appendChild(pieza);
        } else {
            derecha.appendChild(pieza);
        }
    });
}

/* EFECTOS VISUALES */

function destellos(elemento) {
    const area = efectos.getBoundingClientRect();
    const rect = elemento.getBoundingClientRect();

    const x = rect.left - area.left + rect.width / 2;
    const y = rect.top - area.top + rect.height / 2;

    const colores = [
        "#ffd84d",
        "#ffffff",
        "#c7a8ff",
        "#ff9ec7",
        "#8ee8ff"
    ];

    for (let i = 0; i < 12; i++) {
        const estrella = document.createElement("span");

        estrella.className = "puzzle-destello";
        estrella.textContent = i % 2 === 0 ? "★" : "✦";

        estrella.style.left =
            `${x + (Math.random() - 0.5) * 100}px`;

        estrella.style.top =
            `${y + (Math.random() - 0.5) * 85}px`;

        estrella.style.color =
            colores[i % colores.length];

        estrella.style.fontSize =
            `${15 + Math.random() * 12}px`;

        efectos.appendChild(estrella);

        setTimeout(() => estrella.remove(), 1100);
    }
}

function marcarError(casilla) {
    reproducirEfecto("error", 0.45);
    cambiarExpresion("normal");

    casilla.classList.remove("error");
    void casilla.offsetWidth;
    casilla.classList.add("error");

    setTimeout(() => {
        casilla.classList.remove("error");
    }, 450);
}

/* SELECCIONAR PIEZAS */

function seleccionarPieza(pieza) {
    if (!jugando || terminado || finalizando) {
        return;
    }

    detenerDemostracion();
    iniciarReloj();

    if (seleccionada === pieza) {
        pieza.classList.remove("seleccionada");
        seleccionada = null;
        reanudarDemostracionPrimeraPieza();
        return;
    }

    if (seleccionada) {
        seleccionada.classList.remove("seleccionada");
    }

    seleccionada = pieza;
    pieza.classList.add("seleccionada");

    reproducirEfecto("seleccionar", 0.35);

    reanudarDemostracionPrimeraPieza();
}

/* COLOCAR PIEZAS */

function colocarPieza(indiceCasilla, pieza = seleccionada) {
    if (
        !jugando ||
        terminado ||
        finalizando ||
        !pieza
    ) {
        return false;
    }

    const casilla = casillas.children[indiceCasilla];

    if (!casilla || casilla.classList.contains("ocupada")) {
        return false;
    }

    iniciarReloj();

    const indicePieza = Number(pieza.dataset.indice);

    if (indicePieza !== indiceCasilla) {
        marcarError(casilla);
        reanudarDemostracionPrimeraPieza();
        return false;
    }

    detenerDemostracion();

    reproducirEfecto("correcto", 0.55);
    cambiarExpresion("alegre");

    const imagenColocada = document.createElement("div");

    imagenColocada.className = "puzzle-colocada";
    aplicarImagen(imagenColocada, indicePieza);

    casilla.appendChild(imagenColocada);
    casilla.classList.add("ocupada");

    casilla.setAttribute(
        "aria-label",
        "Pieza colocada"
    );

    destellos(casilla);

    pieza.remove();

    if (seleccionada === pieza) {
        seleccionada = null;
    }

    colocadas++;

    progresoTexto.textContent =
        `🧩 ${colocadas}/${TOTAL_PIEZAS}`;

    if (!primeraPiezaColocada) {
        primeraPiezaColocada = true;
        demostracionObjetivo = null;
    }

    if (colocadas === TOTAL_PIEZAS) {
        jugando = false;
        terminado = true;
        finalizando = true;

        detenerReloj();
        detenerVoz();

        completarRompecabezas(partidaActual);
    } else {
        const felicitacion =
            colocadas % 2 === 1 ? "muyBien" : "excelente";

        narrar(felicitacion);
    }

    return true;
}

/* ARRASTRAR PIEZAS */

function crearPiezaFlotante(indice, rect, clase) {
    const elemento = document.createElement("div");

    elemento.className = clase;

    elemento.style.width = `${rect.width}px`;
    elemento.style.height = `${rect.height}px`;
    elemento.style.left = `${rect.left}px`;
    elemento.style.top = `${rect.top}px`;

    aplicarImagen(elemento, indice);

    document.body.appendChild(elemento);
    elementosTemporales.push(elemento);

    return elemento;
}

function comenzarArrastre(evento, pieza) {
    if (
        !jugando ||
        terminado ||
        finalizando ||
        !evento.isPrimary
    ) {
        return;
    }

    if (
        evento.pointerType === "mouse" &&
        evento.button !== 0
    ) {
        return;
    }

    evento.preventDefault();

    detenerDemostracion();
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

    try {
        pieza.setPointerCapture(evento.pointerId);
    } catch (error) {
        console.warn("Captura de puntero no disponible.");
    }
}

function moverArrastre(evento) {
    if (
        !arrastre ||
        evento.pointerId !== arrastre.pointerId ||
        !jugando ||
        terminado
    ) {
        return;
    }

    const distancia = Math.hypot(
        evento.clientX - arrastre.inicioX,
        evento.clientY - arrastre.inicioY
    );

    if (!arrastre.movido && distancia < 5) {
        return;
    }

    if (!arrastre.movido) {
        arrastre.movido = true;

        arrastre.pieza.classList.add("arrastrando");

        arrastre.fantasma = crearPiezaFlotante(
            Number(arrastre.pieza.dataset.indice),
            arrastre.pieza.getBoundingClientRect(),
            "puzzle-fantasma"
        );
    }

    arrastre.fantasma.style.left =
        `${evento.clientX - arrastre.offsetX}px`;

    arrastre.fantasma.style.top =
        `${evento.clientY - arrastre.offsetY}px`;
}

function buscarCasilla(x, y) {
    const elemento = document.elementFromPoint(x, y);
    const casilla = elemento?.closest(".puzzle-casilla");

    if (!casilla || casilla.classList.contains("ocupada")) {
        return null;
    }

    return casilla;
}

function terminarArrastre(evento) {
    if (
        !arrastre ||
        evento.pointerId !== arrastre.pointerId
    ) {
        return;
    }

    const datos = arrastre;
    arrastre = null;

    try {
        if (datos.pieza.hasPointerCapture(evento.pointerId)) {
            datos.pieza.releasePointerCapture(evento.pointerId);
        }
    } catch (error) {
        console.warn("No se pudo liberar el puntero.");
    }

    if (!datos.movido) {
        seleccionarPieza(datos.pieza);
        return;
    }

    datos.pieza.classList.remove("arrastrando");
    datos.fantasma?.remove();

    const centroX =
        evento.clientX -
        datos.offsetX +
        datos.ancho / 2;

    const centroY =
        evento.clientY -
        datos.offsetY +
        datos.alto / 2;

    const casilla =
        buscarCasilla(evento.clientX, evento.clientY) ||
        buscarCasilla(centroX, centroY);

    if (casilla) {
        colocarPieza(
            Number(casilla.dataset.indice),
            datos.pieza
        );
    }

    reanudarDemostracionPrimeraPieza();
}

function cancelarArrastre() {
    if (!arrastre) return;

    arrastre.pieza.classList.remove("arrastrando");
    arrastre.fantasma?.remove();

    try {
        if (
            arrastre.pieza.hasPointerCapture(
                arrastre.pointerId
            )
        ) {
            arrastre.pieza.releasePointerCapture(
                arrastre.pointerId
            );
        }
    } catch (error) {
        console.warn("No se pudo liberar el puntero.");
    }

    arrastre = null;
}

function cancelarArrastreEvento(evento) {
    if (
        arrastre &&
        evento.pointerId === arrastre.pointerId
    ) {
        cancelarArrastre();
        reanudarDemostracionPrimeraPieza();
    }
}

/* ANIMACIONES */

function registrarAnimacion(animacion) {
    animacionesActivas.push(animacion);
    return animacion;
}

function limpiarAnimaciones() {
    for (const animacion of animacionesActivas) {
        animacion.cancel();
    }

    animacionesActivas = [];

    for (const elemento of elementosTemporales) {
        elemento.remove();
    }

    elementosTemporales = [];

    document.querySelectorAll(".destino-demo").forEach(
        (elemento) => {
            elemento.classList.remove("destino-demo");
        }
    );

    document.querySelectorAll(".puzzle-pieza").forEach(
        (pieza) => {
            pieza.style.opacity = "";
        }
    );
}

/* PIEZAS SALEN VOLANDO */

async function desordenarSalon(id) {
    if (!vigente(id)) return;

    const rectTablero = casillas.getBoundingClientRect();

    const piezas = [
        ...izquierda.querySelectorAll(".puzzle-pieza"),
        ...derecha.querySelectorAll(".puzzle-pieza")
    ];

    const vuelos = [];

    for (const pieza of piezas) {
        const indice = Number(pieza.dataset.indice);

        const columna = indice % COLUMNAS;
        const fila = Math.floor(indice / COLUMNAS);

        const anchoOrigen = rectTablero.width / COLUMNAS;
        const altoOrigen = rectTablero.height / 2;

        const origen = {
            left: rectTablero.left + columna * anchoOrigen,
            top: rectTablero.top + fila * altoOrigen,
            width: anchoOrigen,
            height: altoOrigen
        };

        const destino = pieza.getBoundingClientRect();

        const voladora = crearPiezaFlotante(
            indice,
            origen,
            "puzzle-pieza-voladora"
        );

        pieza.style.opacity = "0";

        vuelos.push({
            pieza,
            voladora,
            origen,
            destino
        });
    }

    areaJuego.classList.remove("introduccion");
    salonCompleto.classList.remove("visible");

    await esperar(100);

    if (!vigente(id)) return;

    const animaciones = vuelos.map((vuelo, posicion) => {
        const dx =
            vuelo.destino.left - vuelo.origen.left;

        const dy =
            vuelo.destino.top - vuelo.origen.top;

        const escalaX =
            vuelo.destino.width / vuelo.origen.width;

        const escalaY =
            vuelo.destino.height / vuelo.origen.height;

        const giro = posicion % 2 === 0 ? -12 : 12;

        const animacion = vuelo.voladora.animate([
            {
                transform:
                    "translate(0, 0) scale(1) rotate(0deg)",
                opacity: 1
            },
            {
                transform:
                    `translate(${dx * 0.48}px, ${dy * 0.48 - 75}px) scale(0.95) rotate(${giro}deg)`,
                opacity: 1,
                offset: 0.5
            },
            {
                transform:
                    `translate(${dx}px, ${dy}px) scale(${escalaX}, ${escalaY}) rotate(0deg)`,
                opacity: 1
            }
        ], {
            duration: 1400 + posicion * 80,
            easing: "cubic-bezier(.22,.75,.25,1)",
            fill: "forwards"
        });

        registrarAnimacion(animacion);

        return animacion.finished.catch(() => {});
    });

    await Promise.all(animaciones);

    if (!vigente(id)) return;

    for (const vuelo of vuelos) {
        vuelo.pieza.style.opacity = "";
        vuelo.voladora.remove();
    }

    await esperar(200);
}

/* DEMOSTRACIÓN DE LA PRIMERA PIEZA */

function obtenerPiezaDemostracion() {
    if (primeraPiezaColocada) return null;

    const piezas = [
        ...izquierda.querySelectorAll(".puzzle-pieza"),
        ...derecha.querySelectorAll(".puzzle-pieza")
    ];

    if (demostracionObjetivo !== null) {
        const objetivo = piezas.find(
            (pieza) =>
                Number(pieza.dataset.indice) === demostracionObjetivo
        );

        if (objetivo) {
            return objetivo;
        }
    }

    const primera = piezas[0] || null;

    if (primera) {
        demostracionObjetivo = Number(primera.dataset.indice);
    }

    return primera;
}

function limpiarElementosDemostracion() {
    for (const animacion of animacionesDemostracion) {
        animacion.cancel();
    }

    animacionesDemostracion = [];

    for (const elemento of elementosDemostracion) {
        elemento.remove();
    }

    elementosDemostracion = [];

    if (piezaDemostracion?.isConnected) {
        piezaDemostracion.style.opacity = "";
    }

    casillaDemostracion?.classList.remove("destino-demo");

    piezaDemostracion = null;
    casillaDemostracion = null;
}

function detenerDemostracion() {
    demostracionToken++;
    demostracionActiva = false;

    limpiarElementosDemostracion();
}

async function ejecutarGestoPrimeraPieza(token, id) {
    if (
        token !== demostracionToken ||
        !vigente(id) ||
        primeraPiezaColocada ||
        terminado ||
        finalizando ||
        arrastre
    ) {
        return;
    }

    const pieza = obtenerPiezaDemostracion();

    if (!pieza) return;

    const indice = Number(pieza.dataset.indice);
    const destino = casillas.children[indice];

    if (!destino || destino.classList.contains("ocupada")) {
        return;
    }

    const origenRect = pieza.getBoundingClientRect();
    const destinoRect = destino.getBoundingClientRect();

    const dx =
        destinoRect.left +
        (destinoRect.width - origenRect.width) / 2 -
        origenRect.left;

    const dy =
        destinoRect.top +
        (destinoRect.height - origenRect.height) / 2 -
        origenRect.top;

    const fantasma = crearPiezaFlotante(
        indice,
        origenRect,
        "puzzle-fantasma"
    );

    const mano = document.createElement("div");

    mano.className = "puzzle-mano";
    mano.textContent = "👆";
    mano.setAttribute("aria-hidden", "true");

    mano.style.left =
        `${origenRect.left + origenRect.width * 0.55}px`;

    mano.style.top =
        `${origenRect.top + origenRect.height * 0.55}px`;

    document.body.appendChild(mano);

    elementosDemostracion.push(fantasma, mano);

    piezaDemostracion = pieza;
    casillaDemostracion = destino;

    pieza.style.opacity = "0.25";
    destino.classList.add("destino-demo");

    const recorrido = [
        {
            transform: "translate(0, 0)",
            offset: 0
        },
        {
            transform: "translate(0, 0)",
            offset: 0.15
        },
        {
            transform: `translate(${dx}px, ${dy}px)`,
            offset: 0.8
        },
        {
            transform: `translate(${dx}px, ${dy}px)`,
            offset: 1
        }
    ];

    const opciones = {
        duration: 2500,
        easing: "ease-in-out",
        fill: "forwards"
    };

    const animacionPieza = fantasma.animate(
        recorrido,
        opciones
    );

    const animacionMano = mano.animate(
        recorrido,
        opciones
    );

    animacionesDemostracion = [
        animacionPieza,
        animacionMano
    ];

    await Promise.allSettled([
        animacionPieza.finished,
        animacionMano.finished
    ]);

    if (
        token !== demostracionToken ||
        !vigente(id)
    ) {
        return;
    }

    await esperar(350);

    if (token !== demostracionToken) return;

    limpiarElementosDemostracion();
}

async function cicloDemostracionPrimeraPieza(token, id) {
    while (
        token === demostracionToken &&
        vigente(id) &&
        !primeraPiezaColocada &&
        !terminado &&
        !finalizando
    ) {
        if (arrastre) {
            await esperar(150);
            continue;
        }

        await ejecutarGestoPrimeraPieza(token, id);

        if (token !== demostracionToken) break;

        await esperar(650);
    }

    if (token === demostracionToken) {
        demostracionActiva = false;
        limpiarElementosDemostracion();
    }
}

function iniciarDemostracionPrimeraPieza() {
    if (
        !jugando ||
        terminado ||
        finalizando ||
        primeraPiezaColocada ||
        arrastre ||
        demostracionActiva
    ) {
        return;
    }

    demostracionActiva = true;

    const token = ++demostracionToken;
    const id = partidaActual;

    cicloDemostracionPrimeraPieza(token, id);
}

function reanudarDemostracionPrimeraPieza() {
    if (
        !jugando ||
        terminado ||
        finalizando ||
        primeraPiezaColocada ||
        arrastre
    ) {
        return;
    }

    iniciarDemostracionPrimeraPieza();
}

/* MINI HISTORIA */

async function mostrarHistoria(id) {
    jugando = false;

    detenerDemostracion();
    cambiarExpresion("normal");

    areaJuego.classList.add("introduccion");
    salonCompleto.classList.add("visible");

    await narrarConMinimo("historia", id, 1200);

    if (!vigente(id)) return;

    await esperar(250);

    if (!vigente(id)) return;

    cambiarExpresion("asustado");

    await Promise.all([
        narrar("desorden", id),
        desordenarSalon(id)
    ]);

    if (!vigente(id)) return;

    await esperar(300);

    if (!vigente(id)) return;

    cambiarExpresion("normal");

    await narrar("instrucciones", id);

    if (!vigente(id)) return;

    await esperar(200);

    if (!vigente(id)) return;

    await narrar("ahoraTu", id);

    if (!vigente(id)) return;

    await esperar(150);

    if (!vigente(id)) return;

    jugando = true;

    iniciarDemostracionPrimeraPieza();

    await narrar("arrastrar", id);
}

/* FINAL DE LA MISIÓN */

async function completarRompecabezas(id) {
    await esperar(600);

    if (!vigente(id)) return;

    cambiarExpresion("alegre");

    await narrarConMinimo("final", id, 700);

    if (!vigente(id)) return;

    await esperar(250);

    if (!vigente(id)) return;

    finalizar(true);
}

/* GUARDAR PROGRESO */

function guardarProgreso() {
    let progreso;

    try {
        progreso = JSON.parse(
            localStorage.getItem(CLAVE_PROGRESO) || "{}"
        );
    } catch (error) {
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

    if (!progreso.completadas.map(Number).includes(MISION)) {
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

/* PANTALLA FINAL */

async function finalizar(completado) {
    detenerDemostracion();
    detenerReloj();

    jugando = false;
    terminado = true;
    finalizando = true;

    cancelarArrastre();
    detenerEfectos();

    if (completado) {
        guardarProgreso();

        contadorEstrellas.textContent = "3/3";

        if (
            typeof window.mostrarCelebracion === "function"
        ) {
            window.mostrarCelebracion({
                mision: MISION,
                estrellas: 3,
                titulo: "¡Salón completado!",
                mensaje: "¡Aquí aprendemos juntos!",
                audio: RUTA_AUDIO + AUDIOS.victoria,
                destino: "../mapa.html"
            });

            return;
        }

        $("titulo-final").textContent =
            "¡Salón completado!";

        $("resultado-final").textContent = "⭐⭐⭐";

        $("mensaje-final").textContent =
            "¡Aquí aprendemos juntos!";

        pantallaFinal.hidden = false;

        cambiarExpresionFinal("alegre");

        await narrar("victoria");

        return;
    }

    detenerVoz();

    $("titulo-final").textContent =
        "¡Se acabó el tiempo!";

    $("resultado-final").innerHTML =
        '<span class="puzzle-reloj-grande">⏰</span>';

    $("mensaje-final").textContent =
        "¡Intentémoslo otra vez!";

    starlyFinal.classList.add("triste");

    const botonReintentar = $("reintentar");

    botonReintentar.innerHTML =
        '<span aria-hidden="true">↻</span> ¡Jugar otra vez!';

    botonReintentar.setAttribute(
        "aria-label",
        "Jugar otra vez"
    );

    const botones = document.querySelector(
        ".puzzle-final-botones"
    );

    if (botones) {
        botones.style.justifyContent = "center";

        const botonMapa = botones.querySelector("a");

        if (botonMapa) {
            botonMapa.hidden = true;
            botonMapa.style.display = "none";
        }
    }

    pantallaFinal.hidden = false;

    cambiarExpresionFinal("triste");

    await narrarConMinimo(
        "tiempo",
        partidaActual,
        600
    );
}

/* INICIAR Y REINICIAR */

async function iniciarJuego(conHistoria = true) {
    if (!imagenCargada) return;

    partidaActual++;

    const id = partidaActual;

    cancelarDesbloqueo();
    detenerDemostracion();
    detenerReloj();
    detenerVoz();
    detenerEfectos();
    cancelarArrastre();
    limpiarAnimaciones();

    seleccionada = null;
    colocadas = 0;

    jugando = false;
    terminado = false;
    finalizando = false;
    relojIniciado = false;

    tiempoRestante = TIEMPO_LIMITE;

    primeraPiezaColocada = false;
    demostracionObjetivo = null;

    pantallaFinal.hidden = true;

    starlyFinal.src = EXPRESIONES.alegre;
    starlyFinal.classList.remove("triste");

    cambiarExpresion("normal");

    contadorEstrellas.textContent = "0/3";
    progresoTexto.textContent = "🧩 0/6";

    efectos.innerHTML = "";

    areaJuego.classList.remove("introduccion");
    salonCompleto.classList.remove("visible");

    actualizarReloj();

    crearCasillas();
    crearPiezas();

    if (conHistoria) {
        await mostrarHistoria(id);
    } else {
        await narrarConMinimo("ahoraTu", id, 500);

        if (!vigente(id)) return;

        jugando = true;

        iniciarDemostracionPrimeraPieza();

        await narrar("arrastrar", id);
    }
}

/* CARGAR IMAGEN */

function cargarImagen() {
    const imagen = new Image();

    imagen.onload = () => {
        imagenCargada = true;

        guiaImagen.style.backgroundImage =
            `url("${IMAGEN_SALON}")`;

        salonCompleto.style.backgroundImage =
            `url("${IMAGEN_SALON}")`;

        tablero.style.aspectRatio =
            `${imagen.naturalWidth} / ${imagen.naturalHeight}`;

        iniciarJuego(true);
    };

    imagen.onerror = () => {
        mostrarDialogo("No se pudo cargar el salón.");

        console.error(
            "Imagen no encontrada:",
            IMAGEN_SALON
        );
    };

    imagen.src = IMAGEN_SALON;
}

/* EVENTOS */

botonAudio.addEventListener("click", () => {
    if (jugando && !terminado) {
        narrar("arrastrar");
    }
});

$("reintentar").addEventListener("click", () => {
    iniciarJuego(false);
});

window.addEventListener("pagehide", () => {
    partidaActual++;

    cancelarDesbloqueo();
    detenerDemostracion();
    detenerReloj();
    detenerVoz();
    detenerEfectos();
    cancelarArrastre();
    limpiarAnimaciones();
});

/* INICIAR MISIÓN */

cargarImagen();
