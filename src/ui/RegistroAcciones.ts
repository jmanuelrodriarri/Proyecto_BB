import * as Phaser from 'phaser';

interface EntradaRegistro {
    posicional: string;
    accion:     string;
    porcentaje: number | null;
}

export class RegistroAcciones {
    private escena:         Phaser.Scene;
    private contenedor:     Phaser.GameObjects.Container | null = null;
    private entradas:       EntradaRegistro[] = [];
    private historialTurno: EntradaRegistro[] = [];
    private indiceInicio:   number = 0;

    private readonly MAX_VISIBLES  = 4;
    private readonly ANCHO_PANEL   = 280;
    private readonly ALTO_FILA     = 22;
    private readonly MARGEN        = 10;

    constructor(escena: Phaser.Scene) {
        this.escena = escena;
    }

    public añadir(posicional: string, accion: string, porcentaje: number | null): void {
        const entrada = { posicional, accion, porcentaje };
        this.entradas.push(entrada);

        // Solo guardar en el historial si hubo riesgo (hay porcentaje).
        if (porcentaje !== null) {
            this.historialTurno.push(entrada);
        }

        // Eliminar el shift(), ya no borra entradas antiguas.
        // Mostrar siempre las últimas entradas.
        this.indiceInicio = Math.max(0, this.entradas.length - this.MAX_VISIBLES);
        this.redibujar();
    }
    public obtenerHistorial(): EntradaRegistro[] {
        return [...this.historialTurno];
    }

    public limpiar(): void {
        this.entradas     = [];
        this.indiceInicio = 0;
        this.redibujar();
        // historialTurno NO se limpia aquí
    }

    public limpiarHistorial(): void {
        this.historialTurno = [];
        this.limpiar();
    }

    private scrollArriba(): void {
        if (this.indiceInicio > 0) {
            this.indiceInicio--;
            this.redibujar();
        }
    }

    private scrollAbajo(): void {
        if (this.indiceInicio + this.MAX_VISIBLES < this.entradas.length) {
            this.indiceInicio++;
            this.redibujar();
        }
    }

    private redibujar(): void {
        if (this.contenedor) {
            this.contenedor.destroy();
            this.contenedor = null;
        }

        if (this.entradas.length === 0) return;

        const entradasVisibles = this.entradas.slice(
            this.indiceInicio,
            this.indiceInicio + this.MAX_VISIBLES
        );

        const alturaPanel = this.MARGEN + 16 + entradasVisibles.length * this.ALTO_FILA + this.MARGEN;
        const elementos: Phaser.GameObjects.GameObject[] = [];

        // Fondo
        const fondo = this.escena.add.rectangle(
            0, 0,
            this.ANCHO_PANEL, alturaPanel,
            0x000000, 0.85
        );
        fondo.setStrokeStyle(1, 0x444444, 1);
        elementos.push(fondo);

        // Título
        const titulo = this.escena.add.text(
            -this.ANCHO_PANEL / 2 + this.MARGEN,
            -alturaPanel / 2 + 6,
            'REGISTRO DE ACCIONES',
            { fontSize: '9px', color: '#888888', fontStyle: 'bold' }
        );
        elementos.push(titulo);

        // Botón scroll arriba ▲
        const puedeSubir = this.indiceInicio > 0;
        const btnArriba = this.escena.add.text(
            this.ANCHO_PANEL / 2 - this.MARGEN,
            -alturaPanel / 2 + 6,
            '▲',
            { fontSize: '11px', color: puedeSubir ? '#ffffff' : '#444444' }
        ).setOrigin(1, 0);
        if (puedeSubir) {
            btnArriba.setInteractive();
            btnArriba.on('pointerdown', () => this.scrollArriba());
            btnArriba.on('pointerover', () => btnArriba.setColor('#ffff00'));
            btnArriba.on('pointerout',  () => btnArriba.setColor('#ffffff'));
        }
        elementos.push(btnArriba);

        // Entradas visibles
        entradasVisibles.forEach((entrada, indice) => {
            const y = -alturaPanel / 2 + this.MARGEN + 16 + indice * this.ALTO_FILA;

            const porcentajeTexto = entrada.porcentaje !== null
                ? `${entrada.porcentaje.toFixed(1)}%`
                : '';

            const texto = this.escena.add.text(
                -this.ANCHO_PANEL / 2 + this.MARGEN,
                y,
                `${entrada.posicional.padEnd(12)} ${entrada.accion.padEnd(14)} ${porcentajeTexto}`,
                { fontSize: '11px', color: '#ffffff', fontFamily: 'monospace' }
            );
            elementos.push(texto);
        });

        // Botón scroll abajo ▼
        const puedeBajar = this.indiceInicio + this.MAX_VISIBLES < this.entradas.length;
        const btnAbajo = this.escena.add.text(
            this.ANCHO_PANEL / 2 - this.MARGEN,
            alturaPanel / 2 - 6,
            '▼',
            { fontSize: '11px', color: puedeBajar ? '#ffffff' : '#444444' }
        ).setOrigin(1, 1);
        if (puedeBajar) {
            btnAbajo.setInteractive();
            btnAbajo.on('pointerdown', () => this.scrollAbajo());
            btnAbajo.on('pointerover', () => btnAbajo.setColor('#ffff00'));
            btnAbajo.on('pointerout',  () => btnAbajo.setColor('#ffffff'));
        }
        elementos.push(btnAbajo);

        const x = this.MARGEN + this.ANCHO_PANEL / 2;
        const y = this.MARGEN + alturaPanel / 2;

        this.contenedor = this.escena.add.container(x, y, elementos);
        this.contenedor.setDepth(50);
    }
}