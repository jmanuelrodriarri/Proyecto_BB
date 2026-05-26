import * as Phaser from 'phaser';
import { COLUMNAS_TABLERO, FILAS_TABLERO, OFFSET_X_TABLERO, OFFSET_Y_TABLERO, TAMANYO_CASILLA } from './Tablero';

export type TipoCasilla = 'normal' | 'forzar' | 'esquivar' | 'forzarEsquivar';

export interface CasillaResaltada {
    columna:   number;
    fila:      number;
    resaltado: Phaser.GameObjects.Rectangle;
}

export interface CasillaRastro {
    columna:         number;
    fila:            number;
    fondo:           Phaser.GameObjects.Rectangle;
    fondoTexto:      Phaser.GameObjects.Rectangle | null;
    textoPorcentaje: Phaser.GameObjects.Text | null;
}

export class SistemaMovimiento {
    private escena:          Phaser.Scene;
    private casillasActivas: CasillaResaltada[] = [];
    private rastro:          CasillaRastro[]    = [];

    constructor(escena: Phaser.Scene) {
        this.escena = escena;
    }

    // Muestra casillas adyacentes invisibles pero clickables
    public mostrarCasillasAdyacentes(
        columna:      number,
        fila:         number,
        alHacerClick: (columna: number, fila: number) => void
    ): void {
        this.limpiarCasillasAdyacentes();

        const direcciones = [
            { dc: -1, df: -1 }, { dc: 0, df: -1 }, { dc: 1, df: -1 },
            { dc: -1, df:  0 },                     { dc: 1, df:  0 },
            { dc: -1, df:  1 }, { dc: 0, df:  1 }, { dc: 1, df:  1 },
        ];

        direcciones.forEach(({ dc, df }) => {
            const nuevaColumna = columna + dc;
            const nuevaFila    = fila    + df;

            if (nuevaColumna < 0 || nuevaColumna >= COLUMNAS_TABLERO) return;
            if (nuevaFila    < 0 || nuevaFila    >= FILAS_TABLERO)    return;

            const x = OFFSET_X_TABLERO + nuevaColumna * TAMANYO_CASILLA;
            const y = OFFSET_Y_TABLERO + nuevaFila    * TAMANYO_CASILLA;

            const resaltado = this.escena.add.rectangle(
                x + TAMANYO_CASILLA / 2,
                y + TAMANYO_CASILLA / 2,
                TAMANYO_CASILLA - 2,
                TAMANYO_CASILLA - 2,
                0xffff00,
                0  // Totalmente transparente, solo clickable
            );
            resaltado.setInteractive();
            resaltado.on('pointerdown', () => alHacerClick(nuevaColumna, nuevaFila));

            this.casillasActivas.push({
                columna:   nuevaColumna,
                fila:      nuevaFila,
                resaltado: resaltado
            });
        });
    }

    // Añade una casilla al rastro con su color y probabilidad
    public añadirAlRastro(
        columna:      number,
        fila:         number,
        tipo:         TipoCasilla,
        probabilidad: number | null,
        colorTexto:   string = '#ffffff'
    ): void {
        const x = OFFSET_X_TABLERO + columna * TAMANYO_CASILLA;
        const y = OFFSET_Y_TABLERO + fila    * TAMANYO_CASILLA;

        // Color del fondo según tipo
        const colores: Record<TipoCasilla, number> = {
            'normal':        0xffff00,  // Amarillo
            'esquivar':      0xff69b4,  // Rosa
            'forzar':        0xff8800,  // Naranja
            'forzarEsquivar': 0xff0000, // Rojo
        };
        const opacidades: Record<TipoCasilla, number> = {
            'normal':         0.5,
            'esquivar':       0.6,
            'forzar':         0.6,
            'forzarEsquivar': 0.6,
        };

        const fondo = this.escena.add.rectangle(
            x + TAMANYO_CASILLA / 2,
            y + TAMANYO_CASILLA / 2,
            TAMANYO_CASILLA - 2,
            TAMANYO_CASILLA - 2,
            colores[tipo],
            opacidades[tipo]
        );

        // Fondo negro y texto para la probabilidad
        let fondoTexto:      Phaser.GameObjects.Rectangle | null = null;
        let textoPorcentaje: Phaser.GameObjects.Text | null      = null;

        if (probabilidad !== null) {
            fondoTexto = this.escena.add.rectangle(
                x + TAMANYO_CASILLA / 2,
                y + TAMANYO_CASILLA / 2,
                36, 16,
                0x000000,
                0.9
            );

            textoPorcentaje = this.escena.add.text(
                x + TAMANYO_CASILLA / 2,
                y + TAMANYO_CASILLA / 2,
                `${probabilidad.toFixed(1)}%`,
                {
                    fontSize:  '11px',
                    color:     colorTexto,
                    fontStyle: 'normal',
                }
            ).setOrigin(0.5, 0.5);
        }

        this.rastro.push({ columna, fila, fondo, fondoTexto, textoPorcentaje });
    }

    public limpiarCasillasAdyacentes(): void {
        this.casillasActivas.forEach(c => c.resaltado.destroy());
        this.casillasActivas = [];
    }

    public limpiarRastro(): void {
        this.rastro.forEach(r => {
            r.fondo.destroy();
            r.fondoTexto?.destroy();
            r.textoPorcentaje?.destroy();
        });
        this.rastro = [];
    }

    public limpiarTodo(): void {
        this.limpiarCasillasAdyacentes();
        this.limpiarRastro();
    }
}