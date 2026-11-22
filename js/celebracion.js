
/* ESTRELLITAS DEL SABER - CELEBRACIÓN COMPARTIDA */

(function () {
    "use strict";

    const RUTA_BASE = "../../";
    const RUTA_STARLY = RUTA_BASE + "img/personajes/starly/starly_globos.webp";
    const RUTA_VICTORIA = RUTA_BASE + "audio/efecto/victoria.mp3";
    const CLAVE_CONFIGURACION = "estrellitas_del_saber_configuracion";

    let ventana = null;
    let celebracionActiva = false;
    let temporizadores = [];
    let audioVictoria = null;
    let audioNarracion = null;
    let configuracionActual = {};
    let ejecucion = 0;
    let elementoAnterior = null;

    function obtenerConfiguracion() {
        const predeterminada = {
            musica: true,
            efectos: true,
            voz: true
        };

        try {
            const guardada = JSON.parse(
                localStorage.getItem(CLAVE_CONFIGURACION) || "{}"
            );

            if (guardada && typeof guardada === "object" && !Array.isArray(guardada)) {
                return { ...predeterminada, ...guardada };
            }
        } catch (error) {
            console.warn("No se pudo leer la configuración.");
        }

        return predeterminada;
    }

    function esperar(funcion, tiempo) {
        const temporizador = setTimeout(funcion, tiempo);
        temporizadores.push(temporizador);
        return temporizador;
    }

    function pausa(tiempo) {
        return new Promise((resolver) => {
            esperar(resolver, tiempo);
        });
    }

    function limpiarTemporizadores() {
        temporizadores.forEach(clearTimeout);
        temporizadores = [];
    }

    function detenerAudios() {
        if (audioVictoria) {
            audioVictoria.pause();
            audioVictoria.currentTime = 0;
            audioVictoria = null;
        }

        if (audioNarracion) {
            audioNarracion.pause();
            audioNarracion.currentTime = 0;
            audioNarracion = null;
        }
    }

    function reproducirVictoria() {
        if (!configuracionActual.efectos) {
            return;
        }

        audioVictoria = new Audio(RUTA_VICTORIA);
        audioVictoria.volume = 0.35;

        audioVictoria.play().catch(() => {});
    }

    function reproducirNarracion(ruta, id) {
        return new Promise((resolver) => {
            if (!configuracionActual.voz || !ruta || id !== ejecucion) {
                resolver(false);
                return;
            }

            const audio = new Audio(ruta);
            audioNarracion = audio;
            let terminado = false;

            const finalizar = (resultado) => {
                if (terminado) {
                    return;
                }

                terminado = true;

                if (audioNarracion === audio) {
                    audioNarracion = null;
                }

                resolver(resultado);
            };

            audio.addEventListener("ended", () => finalizar(true), { once: true });
            audio.addEventListener("error", () => finalizar(false), { once: true });

            audio.play().catch(() => finalizar(false));
        });
    }

    function crearEstructura() {
        if (ventana) {
            return;
        }

        ventana = document.createElement("div");
        ventana.className = "celebracion-fondo";
        ventana.id = "celebracion-global";
        ventana.hidden = true;

        ventana.innerHTML = `
            <div class="celebracion-confeti" id="celebracion-confeti" aria-hidden="true"></div>

            <section
                class="celebracion-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="celebracion-titulo"
                aria-describedby="celebracion-mensaje"
                tabindex="-1"
            >
                <h2 id="celebracion-titulo">¡Misión completada!</h2>

                <div class="celebracion-estrellas" id="celebracion-estrellas" aria-label="Estrellas obtenidas">
                    <span class="celebracion-estrella" aria-hidden="true">★</span>
                    <span class="celebracion-estrella" aria-hidden="true">★</span>
                    <span class="celebracion-estrella" aria-hidden="true">★</span>
                </div>

                <img
                    src="${RUTA_STARLY}"
                    alt="Starly celebrando con globos"
                    class="celebracion-starly"
                >

                <p class="celebracion-mensaje" id="celebracion-mensaje" hidden></p>

                <a
                    href="../mapa.html"
                    class="celebracion-continuar"
                    id="celebracion-continuar"
                    aria-label="Continuar al mapa de misiones"
                    hidden
                >
                    <span class="celebracion-boton-texto">
                        ¡SIGUIENTE MISIÓN!
                    </span>

                    <span class="celebracion-boton-icono" aria-hidden="true">
                        ➜
                    </span>
                </a>

                <p class="celebracion-ayuda" id="celebracion-ayuda" hidden>
                    
                </p>
            </section>
        `;

        document.body.appendChild(ventana);
    }

    function crearConfeti() {
        const contenedor = ventana.querySelector("#celebracion-confeti");
        contenedor.innerHTML = "";

        const colores = [
            "#FFD84D",
            "#FF8745",
            "#55D6F5",
            "#8467D7",
            "#43C98B",
            "#F36B79"
        ];

        for (let i = 0; i < 45; i++) {
            const pieza = document.createElement("span");

            pieza.className = "celebracion-confeti-pieza";
            pieza.style.left = Math.random() * 100 + "%";
            pieza.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
            pieza.style.animationDuration = (2 + Math.random() * 2) + "s";
            pieza.style.animationDelay = Math.random() * 0.7 + "s";

            contenedor.appendChild(pieza);
        }
    }

    function animarEstrellas(cantidad, id) {
        const estrellas = ventana.querySelectorAll(".celebracion-estrella");

        estrellas.forEach((estrella) => {
            estrella.classList.remove("encendida", "llegando", "acumulada");
        });

        for (let indice = 0; indice < cantidad; indice++) {
            esperar(() => {
                if (id !== ejecucion) {
                    return;
                }

                const estrella = estrellas[indice];
                estrella.classList.add("llegando");

                esperar(() => {
                    if (id !== ejecucion) {
                        return;
                    }

                    estrella.classList.add("encendida", "acumulada");
                }, 750);
            }, 350 + indice * 800);
        }

        esperar(() => {
            if (id !== ejecucion) {
                return;
            }

            ventana.querySelector("#celebracion-estrellas")
                .classList.add("completadas");
        }, 350 + cantidad * 800);
    }

    function mostrarMensajeFinal(mensaje) {
        const elemento = ventana.querySelector("#celebracion-mensaje");

        elemento.textContent = mensaje;
        elemento.hidden = false;

        elemento.classList.remove("apareciendo");
        void elemento.offsetWidth;
        elemento.classList.add("apareciendo");
    }

    function mostrarBoton(id) {
        if (!celebracionActiva || id !== ejecucion) {
            return;
        }

        const boton = ventana.querySelector("#celebracion-continuar");
        const ayuda = ventana.querySelector("#celebracion-ayuda");

        boton.hidden = false;
        ayuda.hidden = false;

        boton.classList.remove("visible");
        void boton.offsetWidth;
        boton.classList.add("visible");

        boton.focus();
    }

    async function mostrarCelebracion(opciones = {}) {
        if (celebracionActiva) {
            return;
        }

        crearEstructura();

        celebracionActiva = true;
        const id = ++ejecucion;

        configuracionActual = obtenerConfiguracion();

        const {
            estrellas = 3,
            mensaje = "¡Lo logramos!",
            destino = "../mapa.html",
            audio = null,
            titulo = "¡Misión completada!"
        } = opciones;

        const cantidad = Math.max(0, Math.min(3, Number(estrellas) || 0));

        limpiarTemporizadores();
        detenerAudios();

        elementoAnterior = document.activeElement;

        const panel = ventana.querySelector(".celebracion-panel");
        const tituloElemento = ventana.querySelector("#celebracion-titulo");
        const mensajeElemento = ventana.querySelector("#celebracion-mensaje");
        const boton = ventana.querySelector("#celebracion-continuar");
        const ayuda = ventana.querySelector("#celebracion-ayuda");
        const contenedorEstrellas = ventana.querySelector("#celebracion-estrellas");

        tituloElemento.textContent = titulo;
        mensajeElemento.textContent = "";
        mensajeElemento.hidden = true;

        boton.href = destino;
        boton.hidden = true;
        ayuda.hidden = true;

        contenedorEstrellas.classList.remove("completadas");

        ventana.hidden = false;
        document.body.classList.add("celebracion-abierta");

        panel.focus();

        crearConfeti();
        animarEstrellas(cantidad, id);
        reproducirVictoria();

        await pausa(3100);

        if (id !== ejecucion || !celebracionActiva) {
            return;
        }

        mostrarMensajeFinal(mensaje);

        await Promise.race([
            reproducirNarracion(audio, id),
            pausa(6500)
        ]);

        if (id !== ejecucion || !celebracionActiva) {
            return;
        }

        esperar(() => mostrarBoton(id), 400);
    }

    function cerrarCelebracion() {
        celebracionActiva = false;
        ejecucion++;

        limpiarTemporizadores();
        detenerAudios();

        if (ventana) {
            ventana.hidden = true;
        }

        document.body.classList.remove("celebracion-abierta");

        if (elementoAnterior && typeof elementoAnterior.focus === "function") {
            elementoAnterior.focus();
        }
    }

    window.mostrarCelebracion = mostrarCelebracion;
    window.cerrarCelebracion = cerrarCelebracion;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", crearEstructura, { once: true });
    } else {
        crearEstructura();
    }
})();
