import * as Phaser from 'phaser';
import type { DatosPosicional } from '../game/Posicional';

export class FichaPosicional {
    private escena:     Phaser.Scene;
    private contenedor: Phaser.GameObjects.Container | null = null;

    constructor(escena: Phaser.Scene) {
        this.escena = escena;
    }

    public mostrar(datos: DatosPosicional): void {
        this.ocultar();

        const anchoPanel  = 220;
        const alturaPanel = 260;
        const margen      = 10;
        const x           = margen + anchoPanel / 2;
        const y           = this.escena.scale.height - alturaPanel / 2 - margen;

        // Fondo negro semitransparente
        const fondo = this.escena.add.rectangle(
            0, 0,
            anchoPanel, alturaPanel,
            0x000000, 0.85
        );
        fondo.setStrokeStyle(1, 0xffffff, 0.5);

        // Botón de cerrar
        const btnCerrar = this.escena.add.text(
            anchoPanel / 2 - 10, -alturaPanel / 2 + 10,
            '✕',
            { fontSize: '12px', color: '#aaaaaa' }
        ).setOrigin(0.5, 0.5).setInteractive();
        btnCerrar.on('pointerdown', () => this.ocultar());
        btnCerrar.on('pointerover', () => btnCerrar.setColor('#ffffff'));
        btnCerrar.on('pointerout',  () => btnCerrar.setColor('#aaaaaa'));

        // Tipo de posicional
        const textoTipo = this.escena.add.text(
            0, -alturaPanel / 2 + 16,
            datos.nombre !== datos.tipo ? `${datos.tipo} - ${datos.nombre}` : datos.tipo.toUpperCase(),
            { fontSize: '13px', color: '#ffff00', fontStyle: 'bold' }
        ).setOrigin(0.5, 0.5);

        // Raza y cantidad máxima
        const textoRaza = this.escena.add.text(
            0, -alturaPanel / 2 + 34,
            `${datos.raza} (0-${datos.cantidadMax})`,
            { fontSize: '12px', color: '#aaaaaa' }
        ).setOrigin(0.5, 0.5);

        // Separador
        const separador1 = this.escena.add.rectangle(
            0, -alturaPanel / 2 + 46,
            anchoPanel - 20, 1,
            0x444444
        );

        // Estadísticas
        const textoStats = this.escena.add.text(
            -anchoPanel / 2 + 12, -alturaPanel / 2 + 56,
            [
                `MV: ${datos.estadisticas.movimiento}   FU: ${datos.estadisticas.fuerza}   AG: ${datos.estadisticas.agilidad}`,
                `PS: ${datos.estadisticas.pase ?? '-'}   AR: ${datos.estadisticas.armadura}`,
            ],
            { fontSize: '11px', color: '#ffffff', lineSpacing: 4 }
        );

        // Separador
        const separador2 = this.escena.add.rectangle(
            0, -alturaPanel / 2 + 88,
            anchoPanel - 20, 1,
            0x444444
        );

        // Habilidades
        const tituloHabilidades = this.escena.add.text(
            -anchoPanel / 2 + 12, -alturaPanel / 2 + 98,
            'HABILIDADES:',
            { fontSize: '12px', color: '#ffaa00', fontStyle: 'bold' }
        );

        const listaHabilidades = datos.habilidades.length > 0
            ? datos.habilidades.join(', ')
            : 'Ninguna';

        const textoHabilidades = this.escena.add.text(
            -anchoPanel / 2 + 12, -alturaPanel / 2 + 112,
            listaHabilidades,
            {
                fontSize:   '12px',
                color:      '#ffffff',
                wordWrap:   { width: anchoPanel - 24 },
                lineSpacing: 3,
            }
        );

        // Separador
        const separador3 = this.escena.add.rectangle(
            0, alturaPanel / 2 - 30,
            anchoPanel - 20, 1,
            0x444444
        );

        // Precio
        const textoCoste = this.escena.add.text(
            0, alturaPanel / 2 - 16,
            `Coste: ${datos.coste.toLocaleString('es-ES')} po`,
            { fontSize: '11px', color: '#88ff88' }
        ).setOrigin(0.5, 0.5);

        this.contenedor = this.escena.add.container(x, y, [
            fondo,
            btnCerrar,
            textoTipo,
            textoRaza,
            separador1,
            textoStats,
            separador2,
            tituloHabilidades,
            textoHabilidades,
            separador3,
            textoCoste,
        ]);

        // Profundidad alta para que aparezca por encima de todo
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