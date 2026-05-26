// Panel visual con las opciones de placaje y sus probabilidades

import * as Phaser from 'phaser';
import type { ResultadoPlacaje } from '../game/SistemaPlacaje';

export class VentanaPlacaje {
    private escena:     Phaser.Scene;
    private contenedor: Phaser.GameObjects.Container | null = null;

    constructor(escena: Phaser.Scene) {
        this.escena = escena;
    }

    public mostrar(
        opciones:   ResultadoPlacaje[],
        numDados:   number,
        elijeAtacante: boolean,
        alElegir:   (opcion: 'empujar' | 'derribar' | 'empujarDerribar') => void
    ): void {
        this.ocultar();

        const anchoPanel  = 220;
        const altoOpcion  = 44;
        const margen      = 10;
        const alturaPanel = 50 + opciones.length * altoOpcion + margen;

        const x = margen + anchoPanel / 2;
        const y = this.escena.scale.height - alturaPanel / 2 - margen - 80;

        const elementos: Phaser.GameObjects.GameObject[] = [];

        // Fondo
        const fondo = this.escena.add.rectangle(
            0, 0,
            anchoPanel, alturaPanel,
            0x000000, 0.85
        );
        fondo.setStrokeStyle(1, 0xffffff, 0.5);
        elementos.push(fondo);

        // Título
        const titulo = this.escena.add.text(
            0, -alturaPanel / 2 + 16,
            `Placaje — ${numDados} dado${numDados > 1 ? 's' : ''} ${elijeAtacante ? '(tú eliges)' : '(rival elige)'}`,
            { fontSize: '11px', color: '#ffff00', fontStyle: 'bold' }
        ).setOrigin(0.5, 0.5);
        elementos.push(titulo);

        // Separador
        const sep = this.escena.add.rectangle(
            0, -alturaPanel / 2 + 28,
            anchoPanel - 20, 1,
            0x444444
        );
        elementos.push(sep);

        // Opciones
        opciones.forEach((opcion, indice) => {
            const oy = -alturaPanel / 2 + 44 + indice * altoOpcion;

            const colorFondo  = opcion.disponible ? 0x224488 : 0x333333;
            const colorTexto  = opcion.disponible ? '#ffffff' : '#888888';
            const colorPorcentaje = opcion.disponible
                ? opcion.probabilidad >= 0.5 ? '#88ff88' : '#ffaa44'
                : '#666666';

            const fondoOpcion = this.escena.add.rectangle(
                0, oy,
                anchoPanel - 20, altoOpcion - 4,
                colorFondo, 0.8
            );
            fondoOpcion.setStrokeStyle(1, 0x446688, 0.5);

            const textoOpcion = this.escena.add.text(
                -(anchoPanel / 2 - 16), oy,
                opcion.etiqueta,
                { fontSize: '12px', color: colorTexto, fontStyle: 'bold' }
            ).setOrigin(0, 0.5);

            const textoPorcentaje = this.escena.add.text(
                anchoPanel / 2 - 16, oy,
                `${(opcion.probabilidad * 100).toFixed(1)}%`,
                { fontSize: '12px', color: colorPorcentaje, fontStyle: 'bold' }
            ).setOrigin(1, 0.5);

            elementos.push(fondoOpcion, textoOpcion, textoPorcentaje);

            if (opcion.disponible) {
                fondoOpcion.setInteractive();
                fondoOpcion.on('pointerdown', () => {
                    this.ocultar();
                    alElegir(opcion.opcion);
                });
                fondoOpcion.on('pointerover', () => fondoOpcion.setFillStyle(0x3366cc, 0.9));
                fondoOpcion.on('pointerout',  () => fondoOpcion.setFillStyle(colorFondo, 0.8));
            }
        });

        this.contenedor = this.escena.add.container(x, y, elementos);
        this.contenedor.setDepth(100);
    }

    public ocultar(): void {
        if (this.contenedor) {
            this.contenedor.destroy();
            this.contenedor = null;
        }
    }

    public estaVisible(): boolean {
        return this.contenedor !== null;
    }
}