import * as Phaser from 'phaser';
import { OFFSET_X_TABLERO, OFFSET_Y_TABLERO, TAMANYO_CASILLA } from './Tablero';

export interface EstadisticasPosicional {
    movimiento: number;
    fuerza:     number;
    agilidad:   string;
    pase:       string | null;
    armadura:   string;
}

export interface DatosPosicional {
    id:           string;
    nombre:       string;
    tipo:         string;
    equipo:       'amigo' | 'enemigo';
    columna:      number;
    fila:         number;
    tieneBalon:   boolean;
    estadisticas: EstadisticasPosicional;
    habilidades:  string[];
    raza:         string;        // Nombre de la raza
    cantidadMax:  number;        // Cantidad máxima en el campo
    coste:        number;        // Precio del posicional
}

export class Posicional {
    private escena:   Phaser.Scene;
    private circulo:  Phaser.GameObjects.Arc;
    private etiqueta: Phaser.GameObjects.Text;
    private balon:    Phaser.GameObjects.Text | null = null;
    private marcaX:   Phaser.GameObjects.Text | null = null;

    public datos:     DatosPosicional;
    public haMovido:  boolean = false;
    public tumbado:   boolean = false;

    public activacionGrandullon: boolean = false; // True si ya se ha registrado la activación este turno.

    public estaDesactivado: boolean = false; // Si el posicional está desactivado, no muestra el menú circular (entre otras cosas).

    constructor(escena: Phaser.Scene, datos: DatosPosicional) {
        this.escena = escena;
        this.datos  = datos;

        const posicion = this.casillaAPixel(datos.columna, datos.fila);
        const radio    = TAMANYO_CASILLA / 2 - 3;
        const color    = datos.equipo === 'amigo' ? 0x2255cc : 0xcc2222;

        // Círculo del posicional
        this.circulo = escena.add.circle(posicion.x, posicion.y, radio, color);
        this.circulo.setStrokeStyle(2, 0xffffff, 1);
        this.circulo.setInteractive();

        // Inicial del tipo
        const inicial = this.obtenerInicial(datos.tipo);
        this.etiqueta = escena.add.text(posicion.x, posicion.y, inicial, {
            fontSize:  '14px',
            color:     '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5, 0.5);

        // Balón si lo tiene
        if (datos.tieneBalon) {
            this.balon = escena.add.text(
                posicion.x + radio - 4,
                posicion.y - radio + 4,
                '🏈',
                { fontSize: '10px' }
            ).setOrigin(0.5, 0.5);
        }
    }

private obtenerInicial(tipo: string): string {
        const mapa: Record<string, string> = {
            'Linea':      'Li',
            'Receptor':   'Re',
            'Lanzador':   'La',
            'Blitzer':    'Bl',
            'Corredor':   'Co',
            'Especial':   'Es',
            'Defensor':   'Df',
            'Grandullon': 'Gr',
        };
        return mapa[tipo] ?? '??';
    }

    private casillaAPixel(columna: number, fila: number): { x: number; y: number } {
        return {
            x: OFFSET_X_TABLERO + columna * TAMANYO_CASILLA + TAMANYO_CASILLA / 2,
            y: OFFSET_Y_TABLERO + fila    * TAMANYO_CASILLA + TAMANYO_CASILLA / 2,
        };
    }

    public moverA(columna: number, fila: number): void {
        this.datos.columna = columna;
        this.datos.fila    = fila;
        const posicion     = this.casillaAPixel(columna, fila);

        const objetivos = [this.circulo, this.etiqueta, this.balon, this.marcaX].filter(Boolean);

        this.escena.tweens.add({
            targets:  objetivos,
            x:        posicion.x,
            y:        posicion.y,
            duration: 200,
            // 'ease' define el tipo de animación del movimiento, es decir, 
            // cómo acelera y desacelera el posicional durante el desplazamiento.
            // 'Power2' significa que el movimiento empieza rápido y va frenando al 
            // llegar al destino, como si tuviera inercia.
            ease:     'Power2',
        });

        this.haMovido = true;
    }

    public seleccionar(): void {
        this.circulo.setStrokeStyle(3, 0xffff00, 1);
    }

    public deseleccionar(): void {
        // Prueba para ver desde donde se llama al método deseleccionar.
        console.log('deseleccionar:', this.datos.id);

        this.circulo.setStrokeStyle(2, 0xffffff, 1);
    }

    public obtenerCirculo(): Phaser.GameObjects.Arc {
        return this.circulo;
    }

    public destruir(): void {
        this.circulo.destroy();
        this.etiqueta.destroy();
        this.balon?.destroy();
    }

    public tumbar(): void {
        if (this.tumbado) return;
        this.tumbado = true;

        const posicion = this.casillaAPixel(this.datos.columna, this.datos.fila);

        // X roja sobre el círculo
        this.marcaX = this.escena.add.text(
            posicion.x,
            posicion.y,
            '✕',
            {
                fontSize:  '20px',
                color:     '#ff0000',
                fontStyle: 'bold',
            }
        ).setOrigin(0.5, 0.5);

        // Oscurecer el círculo para indicar que está tumbado
        this.circulo.setAlpha(0.5);
        this.etiqueta.setAlpha(0.5);
    }

    public levantarse(): void {
        if (!this.tumbado) return;
        this.tumbado = false;

        this.marcaX?.destroy();
        this.marcaX = null;

        this.circulo.setAlpha(1);
        this.etiqueta.setAlpha(1);
    }

    // Método para deshabilitar un posicional despues de que haya realizado una Acción.
    public desactivar(): void {
        this.estaDesactivado = true; // No muestra menú circular.
        this.circulo.setStrokeStyle(2, 0xffffff, 1); // Deseleccionar (quitar amarillo).
        this.circulo.setFillStyle(0x666666);
        this.circulo.setAlpha(0.7);
        this.etiqueta.setAlpha(0.7);
    }

    // Metodo dinámico para eliminar el balón del posicional.
    public eliminarBalon(): void {
        this.datos.tieneBalon = false;
        this.balon?.destroy();
        this.balon = null;
    }

    // Metodo dinámico para poner el balón al posicional.
    public ponerBalon(): void {
        this.datos.tieneBalon = true;
        const posicion = this.casillaAPixel(this.datos.columna, this.datos.fila);
        const radio    = TAMANYO_CASILLA / 2 - 3;
        this.balon = this.escena.add.text(
            posicion.x + radio - 4,
            posicion.y - radio + 4,
            '🏈',
            { fontSize: '10px' }
        ).setOrigin(0.5, 0.5);
    }
}