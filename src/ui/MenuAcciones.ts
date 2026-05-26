import * as Phaser from 'phaser';

export class MenuAcciones {
    private escena:         Phaser.Scene;
    private contenedor:     Phaser.GameObjects.Container | null = null;

    constructor(escena: Phaser.Scene) {
        this.escena = escena;
    }

    public mostrarSoloCancelar(
        textoBoton: string,
        alCancelar: () => void
    ): void {
        this.ocultarConfirmacion();

        const ancho = this.escena.scale.width;
        const alto  = this.escena.scale.height;

        const fondo = this.escena.add.rectangle(0, 0, 160, 60, 0x000000, 0.7);

        const fondoCancelar = this.escena.add.rectangle(0, 0, 140, 40, 0x882222);
        const textoCancelar = this.escena.add.text(0, 0, `✗ ${textoBoton}`, {
            fontSize:  '16px',
            color:     '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5, 0.5);
        fondoCancelar.setInteractive();
        fondoCancelar.on('pointerdown', () => {
            this.ocultarConfirmacion();
            alCancelar();
        });

        this.contenedor = this.escena.add.container(ancho / 2, alto - 40, [
            fondo,
            fondoCancelar, textoCancelar,
        ]);
    }

    public mostrarConfirmacion(
        alConfirmar: () => void,
        alCancelar:  () => void
    ): void {
        this.ocultarConfirmacion();

        const ancho = this.escena.scale.width;
        const alto  = this.escena.scale.height;

        // Fondo semitransparente
        const fondo = this.escena.add.rectangle(
            0, 0,
            300, 60,
            0x000000, 0.7
        );

        // Botón Confirmar
        const fondoConfirmar = this.escena.add.rectangle(-80, 0, 120, 40, 0x228822);
        const textoConfirmar = this.escena.add.text(-80, 0, '✓ Confirmar', {
            fontSize:  '16px',
            color:     '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5, 0.5);
        fondoConfirmar.setInteractive();
        fondoConfirmar.on('pointerdown', () => {
            this.ocultarConfirmacion();
            alConfirmar();
        });

        // Botón Cancelar
        const fondoCancelar = this.escena.add.rectangle(80, 0, 120, 40, 0x882222);
        const textoCancelar = this.escena.add.text(80, 0, '✗ Cancelar', {
            fontSize:  '16px',
            color:     '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5, 0.5);
        fondoCancelar.setInteractive();
        fondoCancelar.on('pointerdown', () => {
            this.ocultarConfirmacion();
            alCancelar();
        });

        this.contenedor = this.escena.add.container(ancho / 2, alto - 40, [
            fondo,
            fondoConfirmar, textoConfirmar,
            fondoCancelar,  textoCancelar,
        ]);
    }

    public ocultarConfirmacion(): void {
        if (this.contenedor) {
            this.contenedor.destroy();
            this.contenedor = null;
        }
    }

    /* public mostrarOpcionPlacar(alPlacar: () => void): void {
        // No destruir el contenedor existente, añadir botón encima
        const ancho = this.escena.scale.width;
        const alto  = this.escena.scale.height;

        const fondoPlacar = this.escena.add.rectangle(ancho / 2, alto - 80, 140, 40, 0x884400);
        const textoPlacar = this.escena.add.text(ancho / 2, alto - 80, '⚔ Placar', {
            fontSize:  '16px',
            color:     '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5, 0.5);
        fondoPlacar.setInteractive();
        fondoPlacar.on('pointerdown', () => {
            fondoPlacar.destroy();
            textoPlacar.destroy();
            alPlacar();
        });
    } */

    public mostrarMensaje(texto: string): void {
        this.ocultarConfirmacion();
        const ancho = this.escena.scale.width;
        const alto  = this.escena.scale.height;

        const fondo = this.escena.add.rectangle(ancho / 2, alto - 40, 320, 40, 0x000000, 0.85);
        const msg   = this.escena.add.text(ancho / 2, alto - 40, texto, {
            fontSize: '14px', color: '#ffff00', fontStyle: 'bold'
        }).setOrigin(0.5, 0.5);

        this.contenedor = this.escena.add.container(0, 0, [fondo, msg]);
        this.contenedor.setDepth(100);
    }

    /* public mostrarOpcionPasar(alPasar: () => void): void {
        const ancho = this.escena.scale.width;
        const alto  = this.escena.scale.height;

        const fondoPasar = this.escena.add.rectangle(ancho / 2, alto - 80, 140, 40, 0x004488);
        const textoPasar = this.escena.add.text(ancho / 2, alto - 80, '🏉 Pasar', {
            fontSize:  '16px',
            color:     '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5, 0.5);

        fondoPasar.setInteractive();
        fondoPasar.on('pointerdown', () => {
            fondoPasar.destroy();
            textoPasar.destroy();
            alPasar();
        });
        fondoPasar.on('pointerover', () => fondoPasar.setFillStyle(0x0066cc));
        fondoPasar.on('pointerout',  () => fondoPasar.setFillStyle(0x004488));
    }*/

    public mostrarOpcionAccion(texto: string, color: number, alEjecutar: () => void): void {
        const ancho = this.escena.scale.width;
        const alto  = this.escena.scale.height;

        const fondo = this.escena.add.rectangle(ancho / 2, alto - 80, 140, 40, color);
        const textoObj = this.escena.add.text(ancho / 2, alto - 80, texto, {
            fontSize:  '16px',
            color:     '#ffffff',
            fontStyle: 'bold',
        }).setOrigin(0.5, 0.5);
        fondo.setInteractive();
        fondo.on('pointerdown', () => {
            fondo.destroy();
            textoObj.destroy();
            alEjecutar();
        });
        fondo.on('pointerover', () => fondo.setFillStyle(color + 0x222222));
        fondo.on('pointerout',  () => fondo.setFillStyle(color));
    }
}