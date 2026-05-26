import * as Phaser from 'phaser';

export const COLUMNAS_TABLERO = 26;
export const FILAS_TABLERO    = 15;
export const TAMANYO_CASILLA  = 40;

export const OFFSET_X_TABLERO = 20;
export const OFFSET_Y_TABLERO = 20;

export class Tablero {
    private escena:   Phaser.Scene;
    private graficos: Phaser.GameObjects.Graphics;

    constructor(escena: Phaser.Scene) {
        this.escena   = escena;
        this.graficos = escena.add.graphics();
        this.dibujar();
    }

    private dibujar(): void {
        const g = this.graficos;

        // Fondo verde del campo
        /*g.fillStyle(0x2d6a2d);
        g.fillRect(
            OFFSET_X_TABLERO,
            OFFSET_Y_TABLERO,
            COLUMNAS_TABLERO * TAMANYO_CASILLA,
            FILAS_TABLERO    * TAMANYO_CASILLA
        ); */

        // Fondo con franjas horizontales alternas por fila y columna
        for (let fila = 0; fila < FILAS_TABLERO; fila++) {
            for (let columna = 0; columna < COLUMNAS_TABLERO; columna++) {
                if (columna === 0 || columna === COLUMNAS_TABLERO - 1) {
                    g.fillStyle(0x8b0000);
                } else {
                    const filaEsPar    = fila    % 2 === 0;
                    const columnaEsPar = columna % 2 === 0;

                    if      ( filaEsPar &&  columnaEsPar) g.fillStyle(0x35804a);
                    else if (!filaEsPar && !columnaEsPar) g.fillStyle(0x245c24);
                    else if ( filaEsPar && !columnaEsPar) g.fillStyle(0x2d6a2d);
                    else                                   g.fillStyle(0x2a6438);
                }

                g.fillRect(
                    OFFSET_X_TABLERO + columna * TAMANYO_CASILLA,
                    OFFSET_Y_TABLERO + fila    * TAMANYO_CASILLA,
                    TAMANYO_CASILLA,
                    TAMANYO_CASILLA
                );
            }
        }

        // Puntos blancos en intersecciones
        g.fillStyle(0xffffff, 1);

        for (let columna = 1; columna < COLUMNAS_TABLERO; columna++) {
            for (let fila = 1; fila < FILAS_TABLERO; fila++) {
                g.fillCircle(
                    OFFSET_X_TABLERO + columna * TAMANYO_CASILLA,
                    OFFSET_Y_TABLERO + fila    * TAMANYO_CASILLA,
                    1.5
                );
            }
        }

        // Líneas de la cuadrícula
        g.lineStyle(1, 0x1a3d1a, 0.8);

        for (let columna = 0; columna <= COLUMNAS_TABLERO; columna++) {
            const x = OFFSET_X_TABLERO + columna * TAMANYO_CASILLA;
            g.lineBetween(x, OFFSET_Y_TABLERO, x, OFFSET_Y_TABLERO + FILAS_TABLERO * TAMANYO_CASILLA);
        }

        for (let fila = 0; fila <= FILAS_TABLERO; fila++) {
            const y = OFFSET_Y_TABLERO + fila * TAMANYO_CASILLA;
            g.lineBetween(OFFSET_X_TABLERO, y, OFFSET_X_TABLERO + COLUMNAS_TABLERO * TAMANYO_CASILLA, y);
        }

        // Línea central (entre columna 13 y 14)
        g.lineStyle(4, 0xffffff, 0.6);
        //g.lineStyle(2, 0xffffff, 0.6);
        const centroX = OFFSET_X_TABLERO + (COLUMNAS_TABLERO / 2) * TAMANYO_CASILLA;
        g.lineBetween(centroX, OFFSET_Y_TABLERO, centroX, OFFSET_Y_TABLERO + FILAS_TABLERO * TAMANYO_CASILLA);

        // Líneas laterales discontinuas (filas 5 y 12, es decir después de la fila 4 y la 11)
        g.lineStyle(2, 0xffffff, 0.6);
        const filaLateral1Y = OFFSET_Y_TABLERO + 4  * TAMANYO_CASILLA;
        const filaLateral2Y = OFFSET_Y_TABLERO + 11 * TAMANYO_CASILLA;
        const anchuraTotal  = COLUMNAS_TABLERO * TAMANYO_CASILLA;

        // Más continua -> subir longitudTrazo o bajar longitudHueco
        // Más discontinua -> bajar longitudTrazo o subir longitudHueco
        const longitudTrazo = 8;
        const longitudHueco = 3;

        let x = OFFSET_X_TABLERO;
        while (x < OFFSET_X_TABLERO + anchuraTotal) {
            const finX = Math.min(x + longitudTrazo, OFFSET_X_TABLERO + anchuraTotal);
            g.lineBetween(x, filaLateral1Y, finX, filaLateral1Y);
            g.lineBetween(x, filaLateral2Y, finX, filaLateral2Y);
            x += longitudTrazo + longitudHueco;
        }
    }

    public casillaAPixel(columna: number, fila: number): { x: number; y: number } {
        return {
            x: OFFSET_X_TABLERO + columna * TAMANYO_CASILLA + TAMANYO_CASILLA / 2,
            y: OFFSET_Y_TABLERO + fila    * TAMANYO_CASILLA + TAMANYO_CASILLA / 2,
        };
    }

    public pixelACasilla(x: number, y: number): { columna: number; fila: number } {
        return {
            columna: Math.floor((x - OFFSET_X_TABLERO) / TAMANYO_CASILLA),
            fila:    Math.floor((y - OFFSET_Y_TABLERO)  / TAMANYO_CASILLA),
        };
    }
}