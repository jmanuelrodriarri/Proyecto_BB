import * as Phaser from 'phaser';
import { Tablero, OFFSET_X_TABLERO, OFFSET_Y_TABLERO, COLUMNAS_TABLERO, TAMANYO_CASILLA } from '../game/Tablero';
import { Posicional } from '../game/Posicional';
import type { DatosPosicional } from '../game/Posicional';
import { SistemaMovimiento } from '../game/SistemaMovimiento';
import { MenuAcciones } from '../ui/MenuAcciones';
import { FichaPosicional } from '../ui/FichaPosicional';
import { MenuCircular } from '../ui/MenuCircular';
import type { OpcionMenu } from '../ui/MenuCircular';
import { SistemaPlacaje } from '../game/SistemaPlacaje';
import type { CasillaEmpuje } from '../game/SistemaPlacaje';
import { VentanaPlacaje } from '../ui/VentanaPlacaje';
import { RegistroAcciones } from '../ui/RegistroAcciones';
import { getPosicionByNombre, getHabilidadesInnatasByPosicion } from '../data/db/DatabaseService';
import { SistemaPase } from '../game/SistemaPase';

// Probabilidad base de Forzar la Marcha: 5/6
const PROB_FORZAR_MARCHA = 5 / 6;

export class EscenaJuego extends Phaser.Scene {
    private tablero!:              Tablero;
    private posicionales:          Posicional[] = [];
    private sistemaMovimiento!:    SistemaMovimiento;
    private menuAcciones!:         MenuAcciones;
    private fichaPosicional!:      FichaPosicional;
    private menuCircular!:         MenuCircular;

    private posicionalSeleccionado: Posicional | null = null;
    private caminoElegido:          { columna: number; fila: number }[] = [];
    private pasosRestantes:         number  = 0;
    private pasosForzadosUsados:    number  = 0;
    private probabilidadAcumulada:  number  = 1;
    private tieneEsquivar:          boolean = false;
    private esquivarGastado:        boolean = false;
    private posicionalEnMenu:       Posicional | null = null;

    private sistemaPlacaje!:    SistemaPlacaje;
    private ventanaPlacaje!:    VentanaPlacaje;
    private atacanteActual:     Posicional | null = null;
    private defensorActual:     Posicional | null = null;
    private casillasEmpuje:     Phaser.GameObjects.Rectangle[] = [];
    private accionEnCurso: boolean = false; // Bloquea los clicks en otros posicionales mientras se resuelve la Acción.
    private registroAcciones!: RegistroAcciones;
    private porcentajePlacajeElegido: number | null = null;

    private penetracionActiva:    boolean     = false;
    private defensorPenetracion:  Posicional | null = null;
    private penetracionUsada:     boolean     = false; // Solo una por turno 
    private penetracionEnCurso: boolean = false; // Para bloquear otras acciones mientras se resuelve la penetración.

    private sistemaPase!:        SistemaPase;
    private receptorPase:        Posicional | null = null;
    private paseEnCurso:         boolean = false;
    private paseUsado:           boolean = false; // Solo uno por turno


    constructor() {
        super({ key: 'EscenaJuego' });
    }

    create(): void {
        this.tablero           = new Tablero(this);
        this.sistemaMovimiento = new SistemaMovimiento(this);
        this.menuAcciones      = new MenuAcciones(this);
        this.fichaPosicional   = new FichaPosicional(this);
        this.menuCircular      = new MenuCircular(this);
        this.sistemaPlacaje  = new SistemaPlacaje();
        this.ventanaPlacaje  = new VentanaPlacaje(this);

        // Desactivar menú contextual del navegador sobre el canvas
        this.game.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        this.añadirTextoTouchdown();
        this.cargarPosicionales(); // Ya es async, no hace falta await aquí.
        this.registroAcciones = new RegistroAcciones(this);

        this.sistemaPase = new SistemaPase();
    }

    private añadirTextoTouchdown(): void {
        const letras = 'TOUCHDOWN'.split('');

        letras.forEach((letra, indice) => {
            this.add.text(
                OFFSET_X_TABLERO + TAMANYO_CASILLA / 2,
                OFFSET_Y_TABLERO + (11 - indice) * TAMANYO_CASILLA + TAMANYO_CASILLA / 2,
                letra,
                { fontSize: '26px', color: '#ffffff', fontStyle: 'bold' }
            ).setOrigin(0.5, 0.5).setAngle(-90);
        });

        letras.forEach((letra, indice) => {
            this.add.text(
                OFFSET_X_TABLERO + (COLUMNAS_TABLERO - 1) * TAMANYO_CASILLA + TAMANYO_CASILLA / 2,
                OFFSET_Y_TABLERO + (3 + indice) * TAMANYO_CASILLA + TAMANYO_CASILLA / 2,
                letra,
                { fontSize: '26px', color: '#ffffff', fontStyle: 'bold' }
            ).setOrigin(0.5, 0.5).setAngle(90);
        });
    }

    private async cargarPosicionales(): Promise<void> {

        // Helper que lee todos los datos de un posicional desde la BD
        const cargarDatosPosicional = async (
            id:         string,
            nombre:     string,
            equipo:     'amigo' | 'enemigo',
            columna:    number,
            fila:       number,
            tieneBalon: boolean
        ): Promise<DatosPosicional> => {
            const pos         = await getPosicionByNombre(nombre);
            const habilidades = pos ? await getHabilidadesInnatasByPosicion(pos.id_posicion) : [];

            return {
                id, nombre, equipo, columna, fila, tieneBalon,
                tipo:        pos?.tipo        ?? '??',
                estadisticas: {
                    movimiento: pos?.movimiento ?? 0,
                    fuerza:     pos?.fuerza     ?? 0,
                    agilidad:   pos?.agilidad   ?? '?+',
                    pase:       pos?.pase       ?? null,
                    armadura:   pos?.armadura   ?? '?+',
                },
                habilidades,
                raza:        pos?.id_raza_aux  ?? 0,
                cantidadMax: pos?.cantidad_max ?? 0,
                coste:       pos?.coste        ?? 0,
            };
        };

        const listaPosicionales: DatosPosicional[] = [

            // ---- HUMANOS (amigos) ----
            await cargarDatosPosicional('a1', 'Human Lineman',  'amigo',   12, 5, false),
            await cargarDatosPosicional('a2', 'Human Lineman',  'amigo',   12, 7, false),
            await cargarDatosPosicional('a3', 'Human Lineman',  'amigo',   12, 9, false),
            await cargarDatosPosicional('a4', 'Human Blitzer',  'amigo',   11, 6, false),
            await cargarDatosPosicional('a5', 'Human Thrower',  'amigo',   10, 5,  true),
            await cargarDatosPosicional('a6', 'Human Catcher',  'amigo',   17, 9, false),
            await cargarDatosPosicional('a7', 'Ogre',           'amigo',    9, 7, false),

            // ---- ENANOS (enemigos) ----
            await cargarDatosPosicional('e1', 'Dwarf Lineman',  'enemigo', 13, 5, false),
            await cargarDatosPosicional('e2', 'Dwarf Lineman',  'enemigo', 13, 7, false),
            await cargarDatosPosicional('e3', 'Dwarf Lineman',  'enemigo', 13, 9, false),
            await cargarDatosPosicional('e4', 'Troll Slayer',   'enemigo', 14, 7, false),
            await cargarDatosPosicional('e5', 'Dwarf Blitzer',  'enemigo', 15, 9, false),
            await cargarDatosPosicional('e6', 'Dwarf Runner',   'enemigo', 15, 5, false),
            await cargarDatosPosicional('e7', 'Deathroller',    'enemigo', 16, 7, false),
        ];

        listaPosicionales.forEach(datos => {
            const posicional = new Posicional(this, datos);

            posicional.obtenerCirculo().on('pointerdown', (puntero: Phaser.Input.Pointer) => {
                // Prueba para ver datos de posicionales adyacentes.
                console.log('pointerdown RAW en:', posicional.datos.id);

                if (puntero.rightButtonDown()) {
                    // Prueba para ver datos de posicionales adyacentes.
                    console.log('pointerdown en:', posicional.datos.id);

                    if (posicional.datos.equipo === 'amigo') {
                        this.mostrarMenuCircular(posicional);
                    }
                } else {
                    this.alHacerClickEnPosicional(posicional);
                }
            });

            this.posicionales.push(posicional);
        });
    }

    private alHacerClickEnPosicional(posicional: Posicional): void {
        if (this.accionEnCurso) return; // Bloquear si hay alguna Acción en curso.
        // Prueba para ver datos de posicionales adyacentes.
        console.log('Click en:', posicional.datos.id, 'haMovido:', posicional.haMovido);

        // Cerrar menú circular si está activo
        if (this.menuCircular.estaVisible()) {
            this.menuCircular.ocultar();
            if (this.posicionalEnMenu) {
                this.posicionalEnMenu.deseleccionar();
                this.posicionalEnMenu = null;
            }
        }

        // Mostrar ficha del posicional (tanto amigos como enemigos).
        this.fichaPosicional.mostrar(posicional.datos);

        // Si es enemigo, no hacer nada más.
        if (posicional.datos.equipo !== 'amigo') return;
        if (posicional.haMovido) return;

        // Deseleccionar el anterior si había uno.
        if (this.posicionalSeleccionado) {
            this.posicionalSeleccionado.deseleccionar();
            this.sistemaMovimiento.limpiarTodo();
            this.menuAcciones.ocultarConfirmacion();
            this.caminoElegido = [];
        }

        // Seleccionar el nuevo
        this.posicionalSeleccionado  = posicional;
        this.posicionalSeleccionado.seleccionar();
        this.pasosRestantes          = posicional.datos.estadisticas.movimiento;
        this.pasosForzadosUsados     = 0;
        this.probabilidadAcumulada   = 1;
        this.caminoElegido           = [];

        // Comprobar si el posicional tiene Esquivar
        this.tieneEsquivar   = posicional.datos.habilidades.includes('Esquivar');
        this.esquivarGastado = false;

        // Registrar activación si es Grandullon
        // (esto mejor aquí no va)
        //this.registrarActivacionGrandullon(posicional);

        // Mostrar casillas adyacentes clickables
        this.actualizarCasillasClickables(
            posicional.datos.columna,
            posicional.datos.fila
        );
    }

    private actualizarCasillasClickables(columna: number, fila: number): void {
        this.sistemaMovimiento.limpiarCasillasAdyacentes();

        const puedeForzar = this.pasosForzadosUsados < 2;
        if (this.pasosRestantes <= 0 && !puedeForzar) return;

        this.sistemaMovimiento.mostrarCasillasAdyacentes(
            columna,
            fila,
            (col, fil) => this.alHacerClickEnCasilla(col, fil)
        );
    }

    // Cuenta cuántos enemigos tienen en su Tackle Zone la posición dada
    private contarTackleZones(columna: number, fila: number): number {
        return this.posicionales.filter(p => {
            if (p.datos.equipo !== 'enemigo') return false;
            const dc = Math.abs(p.datos.columna - columna);
            const df = Math.abs(p.datos.fila    - fila);
            return dc <= 1 && df <= 1 && (dc + df > 0);
        }).length;
    }

    // Comprueba si algún enemigo adyacente tiene la habilidad Placaje defensivo
    private hayPlacajeEnemigo(columna: number, fila: number): boolean {
        return this.posicionales.some(p => {
            if (p.datos.equipo !== 'enemigo') return false;
            const dc = Math.abs(p.datos.columna - columna);
            const df = Math.abs(p.datos.fila    - fila);
            const esAdyacente = dc <= 1 && df <= 1 && (dc + df > 0);
            return esAdyacente && p.datos.habilidades.includes('Placaje defensivo');
        });
    }

    // Calcula la probabilidad de esquivar desde una posición
    private calcularProbabilidadEsquivar(
        columnaSalida:   number,
        filaSalida:      number,
        tieneEsquivar:   boolean,
        esquivarGastado: boolean
    ): number {
        const numTZ = this.contarTackleZones(columnaSalida, filaSalida);
        if (numTZ === 0) return 1;

        const agilidadStr  = this.posicionalSeleccionado!.datos.estadisticas.agilidad;
        const agilidadBase = parseInt(agilidadStr.replace('+', ''));
        const dificultad   = Math.min(agilidadBase + (numTZ - 1), 5);
        const probBase     = (7 - dificultad) / 6;

        const placajeEnemigo    = this.hayPlacajeEnemigo(columnaSalida, filaSalida);
        const puedeUsarEsquivar = tieneEsquivar && !esquivarGastado && !placajeEnemigo;

        if (puedeUsarEsquivar) {
            const probFallo = (dificultad - 1) / 6;
            return 1 - (probFallo * probFallo);
        }

        return probBase;
    }

    private alHacerClickEnCasilla(columna: number, fila: number): void {
        // Si hay un posicional en esa casilla, redirigir el click a él
        const posicionalEnCasilla = this.posicionales.find(
            p => p.datos.columna === columna && p.datos.fila === fila
        );

        if (posicionalEnCasilla) {
            this.alHacerClickEnPosicional(posicionalEnCasilla);
            return;
        }

        if (!this.posicionalSeleccionado) return;

        const casillaOcupada = this.posicionales.some(
            p => p.datos.columna === columna && p.datos.fila === fila
        );

        if (casillaOcupada) return;

        const posicionSalida = this.caminoElegido.length > 0
            ? this.caminoElegido[this.caminoElegido.length - 1]
            : { columna: this.posicionalSeleccionado.datos.columna, fila: this.posicionalSeleccionado.datos.fila };

        const esForzado   = this.pasosRestantes <= 0;
        const numTZ       = this.contarTackleZones(posicionSalida.columna, posicionSalida.fila);
        const hayEsquivar = numTZ > 0;

        if (esForzado && this.pasosForzadosUsados >= 2) return;

        const placajeEnemigo = this.hayPlacajeEnemigo(posicionSalida.columna, posicionSalida.fila);
        const usaEsquivar    = hayEsquivar && this.tieneEsquivar && !this.esquivarGastado && !placajeEnemigo;

        let probEsquivar = 1;

        if (hayEsquivar) {
            probEsquivar = this.calcularProbabilidadEsquivar(
                posicionSalida.columna,
                posicionSalida.fila,
                this.tieneEsquivar,
                this.esquivarGastado
            );
        }

        if (usaEsquivar) {
            this.esquivarGastado = true;
        }

        let tipoCasilla: 'normal' | 'forzar' | 'esquivar' | 'forzarEsquivar';
        if      ( esForzado &&  hayEsquivar) tipoCasilla = 'forzarEsquivar';
        else if ( esForzado && !hayEsquivar) tipoCasilla = 'forzar';
        else if (!esForzado &&  hayEsquivar) tipoCasilla = 'esquivar';
        else                                 tipoCasilla = 'normal';

        if (esForzado) {
            this.probabilidadAcumulada *= PROB_FORZAR_MARCHA;
            this.pasosForzadosUsados++;
        } else {
            this.pasosRestantes--;
        }

        if (hayEsquivar) {
            this.probabilidadAcumulada *= probEsquivar;
        }

        const probMostrar = (hayEsquivar || esForzado)
            ? this.probabilidadAcumulada * 100
            : null;

        const colorTexto = usaEsquivar ? '#ff99cc' : '#ffffff';

        this.sistemaMovimiento.añadirAlRastro(
            columna,
            fila,
            tipoCasilla,
            probMostrar,
            colorTexto
        );

        this.caminoElegido.push({ columna, fila });
        this.actualizarCasillasClickables(columna, fila);

        this.menuAcciones.mostrarConfirmacion(
            () => this.confirmarMovimiento(),
            () => this.cancelarMovimiento()
        );
    }

    private confirmarMovimiento(): void {
        if (!this.posicionalSeleccionado || this.caminoElegido.length === 0) return;

        const posicional = this.posicionalSeleccionado; // Guardar antes de null
        const probFinal = this.probabilidadAcumulada;  // Guardar antes de reset
        const pasosRestantesAntes = this.pasosRestantes;         // Guardar antes de reset

        const destino = this.caminoElegido[this.caminoElegido.length - 1];
        posicional.moverA(destino.columna, destino.fila);

        // Solo desactivar y deseleccionar si NO hay penetración en curso
        if (!this.penetracionEnCurso && !this.paseEnCurso) {
            posicional.deseleccionar();
            posicional.desactivar();
            posicional.haMovido = true;
        }

        this.sistemaMovimiento.limpiarTodo();
        this.menuAcciones.ocultarConfirmacion();
        this.caminoElegido          = [];
        this.posicionalSeleccionado = null;
        this.pasosRestantes         = 0;
        this.pasosForzadosUsados    = 0;
        this.probabilidadAcumulada  = 1;

        // Registrar activación si es Grandullon
        this.registrarActivacionGrandullon(posicional);

        this.registroAcciones.añadir(
            posicional.datos.tipo,
            'Movimiento',
            probFinal < 1 ? probFinal * 100 : null
        );

        // Comprobar si hay penetración activa y el posicional está adyacente al defensor
        if (this.penetracionActiva && this.defensorPenetracion) {
            const dc = Math.abs(destino.columna - this.defensorPenetracion.datos.columna);
            const df = Math.abs(destino.fila    - this.defensorPenetracion.datos.fila);
            const esAdyacente = dc <= 1 && df <= 1 && (dc + df > 0);

            if (esAdyacente && pasosRestantesAntes >= 1) {
                this.menuAcciones.mostrarOpcionAccion('⚔ Placar', 0x884400, () => {
                    this.penetracionActiva  = false;
                    this.penetracionEnCurso = false;
                    this.defensorPenetracion!.deseleccionar();
                    const defensor = this.defensorPenetracion!;
                    this.defensorPenetracion = null;
                    this.iniciarPlacaje(posicional, defensor);
                });
            } else {
                // Si el defensor no mueve hasta a su oponente -> penetración consumida
                this.defensorPenetracion.deseleccionar();
                this.defensorPenetracion = null;
                this.penetracionActiva   = false;
                this.penetracionEnCurso  = false;
                posicional.desactivar();
                posicional.haMovido = true;
            }
        }

        // Comprobar si hay pase en curso -> mostrar selección de receptor.
        if (this.paseEnCurso) {
            this.menuAcciones.mostrarMensaje('🏉 Elige el compañero receptor');
            this.activarSeleccionReceptor(posicional);
        }
    }

    private cancelarMovimiento(): void {
        if (!this.posicionalSeleccionado) return;

        this.posicionalSeleccionado.deseleccionar();
        this.sistemaMovimiento.limpiarTodo();
        this.menuAcciones.ocultarConfirmacion();
        this.caminoElegido          = [];
        this.posicionalSeleccionado = null;
        this.pasosRestantes         = 0;
        this.pasosForzadosUsados    = 0;
        this.probabilidadAcumulada  = 1;
    }

    private mostrarMenuCircular(posicional: Posicional): void {
        //console.log('estaDesactivado:', posicional.estaDesactivado); //Mostrar informacion. Prueba borrar.

        if (this.accionEnCurso) return; // Bloquear si hay alguna acción en curso.

        if (posicional.estaDesactivado) return; // No mostrar menú si ya ha actuado

        // Cerrar ficha si está visible
        this.fichaPosicional.ocultar();

        // Deseleccionar el posicional seleccionado con click izquierdo si lo hubiera.
        if (this.posicionalSeleccionado) {
            this.posicionalSeleccionado.deseleccionar();
            this.sistemaMovimiento.limpiarTodo();
            this.menuAcciones.ocultarConfirmacion();
            this.caminoElegido          = [];
            this.posicionalSeleccionado = null;
            this.pasosRestantes         = 0;
            this.pasosForzadosUsados    = 0;
            this.probabilidadAcumulada  = 1;
        }

        // Deseleccionar el posicional anterior si había uno en el menú
        if (this.posicionalEnMenu && this.posicionalEnMenu !== posicional) {
            this.posicionalEnMenu.deseleccionar();
        }

        this.posicionalEnMenu = posicional;

        // Seleccionar visualmente el posicional
        posicional.seleccionar();

        const px = posicional.datos.columna * TAMANYO_CASILLA + OFFSET_X_TABLERO + TAMANYO_CASILLA / 2;
        const py = posicional.datos.fila    * TAMANYO_CASILLA + OFFSET_Y_TABLERO + TAMANYO_CASILLA / 2;

        const haMolido      = posicional.haMovido;
        const tieneBalon    = posicional.datos.tieneBalon;
        const esGrandullon  = posicional.datos.tipo === 'Grandullon';
        const tieneLanzar   = posicional.datos.habilidades.includes('Lanzar companero');
        const hayEnemAdyac  = this.posicionales.some(p => {
            if (p.datos.equipo !== 'enemigo') return false;
            const dc = Math.abs(p.datos.columna - posicional.datos.columna);
            const df = Math.abs(p.datos.fila    - posicional.datos.fila);
            return dc <= 1 && df <= 1 && (dc + df > 0);
        });
        // Prueba a ver si hay algún enemigo adyacente.
        /*console.log('Posicional:', posicional.datos.id, 
            'columna:', posicional.datos.columna, 
            'fila:', posicional.datos.fila);
        console.log('hayEnemAdyac:', hayEnemAdyac);
        console.log('haMolido:', haMolido);*/

        const hayAmigoAdyac = this.posicionales.some(p => {
            if (p.datos.equipo !== 'amigo' || p.datos.id === posicional.datos.id) return false;
            const dc = Math.abs(p.datos.columna - posicional.datos.columna);
            const df = Math.abs(p.datos.fila    - posicional.datos.fila);
            return dc <= 1 && df <= 1 && (dc + df > 0);
        });

        // Nivel 1
        const opcionesN1: OpcionMenu[] = [
            {
                etiqueta:   'Placaje',
                accion:     'placaje',
                disponible: hayEnemAdyac && !haMolido
            },
            {
                etiqueta:   'Penetración',
                accion:     'penetracion',
                disponible: !haMolido && !this.penetracionUsada
            },
            {
                etiqueta:   'Pase',
                accion:     'pase',
                disponible: tieneBalon && !haMolido && !this.paseUsado
            },
            {
                etiqueta:   'Pase en\nmano',
                accion:     'entrega',
                disponible: tieneBalon && hayAmigoAdyac && !haMolido
            },
        ];

        // Nivel 2
        const opcionesN2: OpcionMenu[] = [
            /*{
                etiqueta:   'Asegurar\nel Balón',
                accion:     'asegurar',
                disponible: !esGrandullon && !haMolido
            },
            {
                etiqueta:   'Entrega\nen mano',
                accion:     'entrega',
                disponible: tieneBalon && hayAmigoAdyac && !haMolido
            },
            {
                etiqueta:   'Falta',
                accion:     'falta',
                disponible: !haMolido
            },
            {
                etiqueta:   'Lanzar\nCompañero',
                accion:     'lanzar',
                disponible: tieneLanzar && !haMolido
            },*/
        ];

        this.menuCircular.mostrar(px, py, opcionesN1, opcionesN2,
            (accion) => {
                // No deseleccionar → mantener el amarillo durante la acción
                this.posicionalEnMenu = null;
                this.ejecutarAccion(accion, posicional);
            },
            () => {
                // Solo deseleccionar si se cancela el menú sin elegir acción
                posicional.deseleccionar();
                this.posicionalEnMenu = null;
            }
        );
    }

    private ejecutarAccion(accion: string, posicional: Posicional): void {
        // Registrar activación si es Grandullon
        this.registrarActivacionGrandullon(posicional);
        
        switch (accion) {
            case 'placaje':
                // Buscar enemigo adyacente
                const enemigosAdyacentes = this.posicionales.filter(p => {
                    if (p.datos.equipo !== 'enemigo') return false;
                    if (p.tumbado) return false;
                    return this.sistemaPlacaje.esAdyacente(posicional, p);
                });

                if (enemigosAdyacentes.length === 0) return;

                if (enemigosAdyacentes.length === 1) {
                    // Si solo hay un enemigo adyacente, atacar directamente.
                    this.iniciarPlacaje(posicional, enemigosAdyacentes[0]);
                } else {
                    // Hay varios enemigos → resaltarlos para que el jugador elija.
                    enemigosAdyacentes.forEach(e => e.seleccionar());

                    // Al hacer click en un enemigo resaltado → iniciar placaje.
                    enemigosAdyacentes.forEach(e => {
                        const manejador = () => {
                            if (this.accionEnCurso) return; // Evitar doble click
                            
                            // Bloquear inmediatamente
                            this.accionEnCurso = true;

                            // Deseleccionar y eliminar eventos de TODOS los enemigos.
                            enemigosAdyacentes.forEach(en => {
                                en.deseleccionar();
                                en.obtenerCirculo().removeAllListeners('pointerdown');
                            });

                            // Restaurar el evento original de cada enemigo
                            enemigosAdyacentes.forEach(en => {
                                en.obtenerCirculo().on('pointerdown', (puntero: Phaser.Input.Pointer) => {
                                    if (puntero.rightButtonDown()) return;
                                    this.alHacerClickEnPosicional(en);
                                });
                            });

                            this.iniciarPlacaje(posicional, e);
                        };
                        e.obtenerCirculo().on('pointerdown', manejador);
                    });
                }
                break;

            case 'penetracion': {
                this.penetracionEnCurso = true; // Acción de penetración en curso.
                this.penetracionUsada   = true; // Solo se puede usar una vez por turno.

                // Ventana Mensaje para elegir un posicional enemigo.
                this.menuAcciones.mostrarMensaje('👆 Elige el posicional enemigo a atacar');

                // El jugador hace click en un enemigo para declarar objetivo.
                const enemigosEnPie = this.posicionales.filter(p =>
                    p.datos.equipo === 'enemigo' && !p.tumbado
                );

                // Esperar a que el jugador elija un enemigo.
                enemigosEnPie.forEach(e => {
                    const manejador = (puntero: Phaser.Input.Pointer) => {
                        if (puntero.rightButtonDown()) return;

                        // Eliminar listeners de todos los enemigos.
                        enemigosEnPie.forEach(en => {
                            en.obtenerCirculo().removeAllListeners('pointerdown');
                        });

                        // Restaurar listeners originales.
                        enemigosEnPie.forEach(en => {
                            en.obtenerCirculo().on('pointerdown', (p: Phaser.Input.Pointer) => {
                                if (p.rightButtonDown()) return;
                                this.alHacerClickEnPosicional(en);
                            });
                        });

                        // Ocultar mensaje al elegir enemigo
                        this.menuAcciones.ocultarConfirmacion();

                        // Declarar objetivo.
                        this.defensorPenetracion = e;                        

                        // Declarar objetivo.
                        this.defensorPenetracion = e;
                        this.penetracionActiva   = true;
                        e.seleccionar(); // Resaltar en amarillo.

                        // Iniciar movimiento del atacante.
                        this.alHacerClickEnPosicional(posicional);
                    };
                    e.obtenerCirculo().on('pointerdown', manejador);
                });
                break;
            }

            case 'pase': {
                this.paseEnCurso = true;
                this.paseUsado   = true;

                // Activar selección de receptor directamente
                this.activarSeleccionReceptor(posicional);

                // También permitir movimiento
                this.alHacerClickEnPosicional(posicional);
                break;

                /*// Mostrar botón para pasar directamente sin mover
                this.menuAcciones.mostrarSoloCancelar('🏉 Pasar desde aquí.', () => {
                    this.sistemaMovimiento.limpiarTodo();
                    this.menuAcciones.ocultarConfirmacion();
                    this.posicionalSeleccionado = null;
                    this.caminoElegido          = [];
                    this.pasosRestantes         = 0;
                    this.pasosForzadosUsados    = 0;
                    this.probabilidadAcumulada  = 1;
                    this.menuAcciones.mostrarMensaje('🏉 Elige el compañero receptor');
                    this.activarSeleccionReceptor(posicional);
                });

                // Permitir movimiento del lanzador antes del pase
                this.alHacerClickEnPosicional(posicional);
                break;*/
            }

            case 'asegurar':
                console.log('Acción Asegurar el Balón seleccionada');
                break;

            case 'entrega':
                console.log('Acción Entrega en mano seleccionada');
                break;

            case 'falta':
                console.log('Acción Falta seleccionada');
                break;
                
            case 'lanzar':
                console.log('Acción Lanzar Compañero seleccionada');
                break;
        }
    }

    public iniciarPlacaje(atacante: Posicional, defensor: Posicional): void {
        this.accionEnCurso = true; // Bloquea otras acciones de ser ejecutadas.
        this.atacanteActual = atacante;
        this.defensorActual = defensor;

        // Mantener el borde amarillo del atacante.
        atacante.seleccionar();

        // Calcular opciones y dados.
        const { numDados, elijeAtacante } = this.sistemaPlacaje.calcularDados(
            atacante, defensor, this.posicionales
        );
        const opciones = this.sistemaPlacaje.calcularOpciones(
            atacante, defensor, this.posicionales
        );

        
        // Limpiar casillas de empuje anteriores
        this.limpiarCasillasEmpuje();
        // Mostrar casillas de empuje al iniciar el placaje
        const casillas = this.sistemaPlacaje.calcularCasillasEmpuje(atacante, defensor);
        this.mostrarCasillasEmpuje(casillas);
        // cambio en la Acción de Penetración.
        // const casillas = this.sistemaPlacaje.calcularCasillasEmpuje(atacante, defensor);
        //this.mostrarCasillasEmpuje(casillas);

        // Resaltar defensor con borde amarillo.
        defensor.seleccionar();

        this.ventanaPlacaje.mostrar(opciones, numDados, elijeAtacante,
            (opcion) => {
                // Guardar el porcentaje de la opción elegida
                const opcionElegida = opciones.find(o => o.opcion === opcion);
                this.porcentajePlacajeElegido = opcionElegida ? opcionElegida.probabilidad * 100 : null;
                this.alElegirOpcionPlacaje(opcion);
            }
        );
    }

    private mostrarCasillasEmpuje(casillas: CasillaEmpuje[]): void {
        const casillasLibres   = casillas.filter(c =>
            !this.posicionales.some(p => p.datos.columna === c.columna && p.datos.fila === c.fila)
        );
        const casillasAMostrar = casillasLibres.length > 0 ? casillasLibres : casillas;

        casillasAMostrar.forEach(c => {
            const x = 20 + c.columna * 40;
            const y = 20 + c.fila    * 40;

            const rect = this.add.rectangle(
                x + 20, y + 20,
                38, 38,
                0xff6600, 0.5
            );
            rect.setStrokeStyle(2, 0xffffff, 0.8);
            this.casillasEmpuje.push(rect);
        });
    }

    private limpiarCasillasEmpuje(): void {
        this.casillasEmpuje.forEach(r => r.destroy());
        this.casillasEmpuje = [];
    }

private alElegirOpcionPlacaje(
        opcion: 'empujar' | 'derribar' | 'empujarDerribar'
    ): void {
        if (!this.atacanteActual || !this.defensorActual) return;

        const atacante = this.atacanteActual; // Guardar antes de null.

        if (opcion === 'derribar') {
            const atacanteTieneBlock = atacante.datos.habilidades.includes('Placar');
            const defensorTieneBlock = this.defensorActual.datos.habilidades.includes('Placar');

            if (!atacanteTieneBlock) atacante.tumbar();
            if (!defensorTieneBlock) this.defensorActual.tumbar();

            atacante.deseleccionar();
            atacante.desactivar();
            this.defensorActual.deseleccionar();

            this.limpiarCasillasEmpuje();
            atacante.haMovido   = true;
            this.atacanteActual = null;
            this.defensorActual = null;
            this.accionEnCurso  = false;

            this.registroAcciones.añadir(
                atacante.datos.tipo,
                'Derribar',
                null
            );
        } else {
            //this.mostrarCasillasEmpuje(casillas);
            // Empujar o Empujar+Derribar -> el jugador elige casilla.
            this.activarSeleccionCasillaEmpuje(opcion);
            //this.activarSeleccionCasillaEmpuje(opcion); // Hay que mostrar las casillas cuando el atacante esté adyacente al defensor.
        }
    }

   private activarSeleccionCasillaEmpuje(
        opcion: 'empujar' | 'empujarDerribar'
    ): void {
        if (!this.atacanteActual || !this.defensorActual) return;

        const casillas = this.sistemaPlacaje.calcularCasillasEmpuje(
            this.atacanteActual,
            this.defensorActual
        );

        // Separar casillas libres y ocupadas
        const casillasLibres  = casillas.filter(c =>
            !this.posicionales.some(p => p.datos.columna === c.columna && p.datos.fila === c.fila)
        );
        const casillasAMostrar = casillasLibres.length > 0 ? casillasLibres : casillas;

        // Hacer las casillas clickables
        this.limpiarCasillasEmpuje();
        casillasAMostrar.forEach(c => {
            const x = 20 + c.columna * 40;
            const y = 20 + c.fila    * 40;

            const rect = this.add.rectangle(
                x + 20, y + 20,
                38, 38,
                0xff6600, 0.5
            );
            rect.setStrokeStyle(2, 0xffffff, 0.8);
            rect.setInteractive();
            rect.on('pointerdown', () => {
                this.aplicarEmpuje(c, opcion);
            });
            rect.on('pointerover', () => rect.setFillStyle(0xff8800, 0.7));
            rect.on('pointerout',  () => rect.setFillStyle(0xff6600, 0.5));

            this.casillasEmpuje.push(rect);
        });
    }

    private aplicarEmpuje(
        destino: CasillaEmpuje,
        opcion:  'empujar' | 'empujarDerribar'
    ): void {
        if (!this.atacanteActual || !this.defensorActual) return;

        const atacante = this.atacanteActual;
        const defensor = this.defensorActual;

        // Guardar posición original del defensor antes del empuje por si el atacante elige seguirle.
        const posicionOriginalDefensor = {
            columna: defensor.datos.columna,
            fila:    defensor.datos.fila
        };

        // Resolver cadena de empujones
        const movimientos = this.sistemaPlacaje.resolverEmpuje(
            defensor,
            destino,
            this.posicionales,
            atacante
        );

        // Aplicar movimientos.
        movimientos.forEach(({ posicional, destino: dest }) => {
            posicional.moverA(dest.columna, dest.fila);
        });

        // Derribar si aplica.
        if (opcion === 'empujarDerribar') {
            this.defensorActual.tumbar();
        }

        this.limpiarCasillasEmpuje();
        this.atacanteActual = null;
        this.defensorActual = null;
        
        // Registrar la acción.
        this.registroAcciones.añadir(
            atacante.datos.tipo,
            opcion === 'empujarDerribar' ? 'Empujar+Derribar' : 'Empujar',
            this.porcentajePlacajeElegido
        );
        
        // Ofrecer opción de seguir al defensor.
        this.ofrecerSeguirDefensor(atacante, posicionOriginalDefensor, defensor);
    }

    private ofrecerSeguirDefensor(
        atacante:                Posicional,
        posicionOriginalDefensor: { columna: number; fila: number },
        defensor:                Posicional
    ): void {
        // La casilla que quedó vacía es la posición original del defensor
        const casillaVacia = posicionOriginalDefensor;

        // Mostrar la casilla vacía como opción de seguimiento
        const x = 20 + casillaVacia.columna * 40;
        const y = 20 + casillaVacia.fila    * 40;

        const rectSeguir = this.add.rectangle(
            x + 20, y + 20,
            38, 38,
            0x00aaff, 0.5  // Azul claro para distinguirlo del empuje
        );
        rectSeguir.setStrokeStyle(2, 0xffffff, 0.8);
        rectSeguir.setInteractive();

        // Texto indicativo
        const textoSeguir = this.add.text(
            x + 20, y + 20,
            '→',
            { fontSize: '16px', color: '#ffffff', fontStyle: 'bold' }
        ).setOrigin(0.5, 0.5);

        // Al hacer click → seguir al defensor
        rectSeguir.on('pointerdown', () => {
            atacante.moverA(casillaVacia.columna, casillaVacia.fila);
            rectSeguir.destroy();
            textoSeguir.destroy();
            atacante.deseleccionar();
            atacante.desactivar();
            defensor.deseleccionar();
            atacante.haMovido = true;

            this.accionEnCurso = false; // Permite ejecutar otras acciones nuevamente.

            this.menuAcciones.ocultarConfirmacion(); 
        });

        rectSeguir.on('pointerover', () => rectSeguir.setFillStyle(0x0088ff, 0.7));
        rectSeguir.on('pointerout',  () => rectSeguir.setFillStyle(0x00aaff, 0.5));

        // Botón para NO seguir
                this.menuAcciones.mostrarSoloCancelar(
            'No seguir',
            () => {
                rectSeguir.destroy();
                textoSeguir.destroy();
                atacante.deseleccionar();
                atacante.desactivar();
                defensor.deseleccionar();
                atacante.haMovido = true;

                this.accionEnCurso = false; // Permite ejecutar otras acciones nuevamente.
            }
        );
    }

    private calcularPorcentajeActivacion(posicional: Posicional): number | null {
        const habilidades = posicional.datos.habilidades;

        if (habilidades.includes('Estupido')) {
            return (5 / 6) * 100; // 83.3%
        }

        if (habilidades.includes('Realmente estupido')) {
            // Comprobar si hay compañero "niñera" adyacente
            const hayNinera = this.posicionales.some(p => {
                if (p.datos.equipo !== 'amigo') return false;
                if (p.datos.id === posicional.datos.id) return false;
                if (p.tumbado) return false;
                if (p.datos.habilidades.includes('Realmente estupido')) return false;
                const dc = Math.abs(p.datos.columna - posicional.datos.columna);
                const df = Math.abs(p.datos.fila    - posicional.datos.fila);
                return dc <= 1 && df <= 1 && (dc + df > 0);
            });
            return hayNinera ? (5 / 6) * 100 : (3 / 6) * 100;
        }

        return null; // No tiene rasgo de activación
    }

    private registrarActivacionGrandullon(posicional: Posicional): void {
        if (posicional.activacionGrandullon) return; // Ya registrada

        const porcentaje = this.calcularPorcentajeActivacion(posicional);
        if (porcentaje === null) return; // No es Grandullon con rasgo

        posicional.activacionGrandullon = true;
        this.registroAcciones.añadir(
            posicional.datos.tipo,
            'Activacion',
            porcentaje
        );
    }

    private ejecutarPase(lanzador: Posicional): void {
        if (!this.receptorPase) return;

        const receptor = this.receptorPase;

        // Calcular tipo de pase
        const tipoPase = this.sistemaPase.calcularTipoPase(
            lanzador.datos.columna, lanzador.datos.fila,
            receptor.datos.columna, receptor.datos.fila
        );

        // Calcular enemigos marcando al lanzador y al receptor
        const enemigosLanzador = this.sistemaPase.contarEnemigosMarcan(
            lanzador.datos.columna, lanzador.datos.fila, this.posicionales
        );
        const enemigosReceptor = this.sistemaPase.contarEnemigosMarcan(
            receptor.datos.columna, receptor.datos.fila, this.posicionales
        );

        // Calcular probabilidad de pase
        const probPase = this.sistemaPase.calcularProbabilidadPase(
            lanzador.datos.estadisticas.pase ?? '6+',
            tipoPase as 'rapido' | 'corto' | 'largo' | 'bomba',
            enemigosLanzador,
            lanzador.datos.habilidades.includes('Pasar')
        );

        // Calcular probabilidad de atrapar
        const probAtrapar = this.sistemaPase.calcularProbabilidadAtrapar(
            receptor.datos.estadisticas.agilidad,
            enemigosReceptor,
            receptor.datos.habilidades.includes('Atrapar'),
            receptor.datos.habilidades.includes('Nervios de acero'),
            receptor.datos.habilidades.includes('Recepcion heroica')
        );

        // Registrar en el registro de acciones
        this.registroAcciones.añadir(
            lanzador.datos.tipo,
            'Pase ' + tipoPase,
            probPase * 100
        );
        this.registroAcciones.añadir(
            receptor.datos.tipo,
            'Atrapar',
            probAtrapar * 100
        );

          // Transferir el balón del posicional que ejecuta el pase al posicional que recepciona el balón.
        lanzador.eliminarBalon();
        receptor.ponerBalon();

        // Desactivar lanzador
        lanzador.deseleccionar();
        lanzador.desactivar();
        lanzador.haMovido = true;

        // Desactivar receptor
        receptor.deseleccionar();

        // Limpiar estado
        this.receptorPase  = null;
        this.paseEnCurso   = false;
    }

    private activarSeleccionReceptor(lanzador: Posicional): void {
        const companerosPosibles = this.posicionales.filter(p =>
            p.datos.equipo === 'amigo' &&
            p.datos.id !== lanzador.datos.id &&
            !p.tumbado
        );

        companerosPosibles.forEach(c => {
            c.obtenerCirculo().removeAllListeners('pointerdown');
            c.obtenerCirculo().on('pointerdown', (puntero: Phaser.Input.Pointer) => {
                if (puntero.rightButtonDown()) return;

                // Restaurar listeners originales
                companerosPosibles.forEach(cp => {
                    cp.obtenerCirculo().removeAllListeners('pointerdown');
                    cp.obtenerCirculo().on('pointerdown', (p: Phaser.Input.Pointer) => {
                        if (p.rightButtonDown()) return;
                        this.alHacerClickEnPosicional(cp);
                    });
                });

                this.menuAcciones.ocultarConfirmacion();

                const tipoPase = this.sistemaPase.calcularTipoPase(
                    lanzador.datos.columna, lanzador.datos.fila,
                    c.datos.columna, c.datos.fila
                );

                if (tipoPase === 'fuera') {
                    c.deseleccionar();
                    this.menuAcciones.mostrarMensaje('❌ Receptor fuera de rango');
                    setTimeout(() => {
                        this.menuAcciones.ocultarConfirmacion();
                        // lanzador.deseleccionar();
                        // this.paseEnCurso = false;
                        //this.paseUsado   = false;
                        this.activarSeleccionReceptor(lanzador); // ← volver a activar
                    }, 2000);
                    return;
                }

                this.receptorPase = c;
                c.seleccionar();

                this.menuAcciones.mostrarOpcionAccion('🏉 Pasar', 0x004488, () => {
                    this.ejecutarPase(lanzador);
                });
            });
        });
    }
}