import * as Phaser from 'phaser';

export interface OpcionMenu {
    etiqueta:   string;
    accion:     string;
    disponible: boolean;
}

export class MenuCircular {
    private escena:     Phaser.Scene;
    private contenedor: Phaser.GameObjects.Container | null = null;
    private nivel:      number = 1;
    private alCerrar?:  () => void;

    constructor(escena: Phaser.Scene) {
        this.escena = escena;
    }

    public mostrar(
        x:          number,
        y:          number,
        opcionesN1: OpcionMenu[],
        opcionesN2: OpcionMenu[],
        alElegir:   (accion: string) => void,
        alCerrar?:  () => void
    ): void {
        this.ocultar();
        this.nivel    = 1;
        this.alCerrar = alCerrar;
        this.dibujarNivel(x, y, opcionesN1, opcionesN2, alElegir);
    }

    private dibujarNivel(
        x:          number,
        y:          number,
        opcionesN1: OpcionMenu[],
        opcionesN2: OpcionMenu[],
        alElegir:   (accion: string) => void
    ): void {
        this.ocultar();

        const opciones   = this.nivel === 1 ? opcionesN1 : opcionesN2;
        const radioMenu  = 70;
        const radioBoton = 32;
        const elementos: Phaser.GameObjects.GameObject[] = [];

        // Fondo circular central
        const fondoCentral = this.escena.add.circle(0, 0, 20, 0x000000, 0.8);
        const textoCentral = this.escena.add.text(0, 0,
            this.nivel === 1 ? '●' : '◀',
            { fontSize: '14px', color: '#ffffff' }
        ).setOrigin(0.5, 0.5).setInteractive();

        if (this.nivel === 2) {
            textoCentral.on('pointerdown', () => {
                this.nivel = 1;
                this.dibujarNivel(x, y, opcionesN1, opcionesN2, alElegir);
            });
        }

        elementos.push(fondoCentral, textoCentral);

        // Botón cerrar
        const btnCerrar = this.escena.add.text(22, -22, '✕',
            { fontSize: '12px', color: '#aaaaaa' }
        ).setOrigin(0.5, 0.5).setInteractive();
        btnCerrar.on('pointerdown', () => {
            this.ocultar();
            if (this.alCerrar) this.alCerrar();
        });
        btnCerrar.on('pointerover', () => btnCerrar.setColor('#ffffff'));
        btnCerrar.on('pointerout',  () => btnCerrar.setColor('#aaaaaa'));
        elementos.push(btnCerrar);

        // Distribuir opciones en círculo
        //const totalOpciones = this.nivel === 1 ? opciones.length + 1 : opciones.length;
        const tieneN2 = opcionesN2.length > 0;
        const totalOpciones = this.nivel === 1 && tieneN2 ? opciones.length + 1 : opciones.length;

        opciones.forEach((opcion, indice) => {
            const angulo = (indice / totalOpciones) * Math.PI * 2 - Math.PI / 2;
            const bx     = Math.cos(angulo) * radioMenu;
            const by     = Math.sin(angulo) * radioMenu;

            const colorFondo = opcion.disponible ? 0x224488 : 0x333333;
            const colorTexto = opcion.disponible ? '#ffffff' : '#888888';

            const fondo = this.escena.add.circle(bx, by, radioBoton, colorFondo, 0.9);
            fondo.setStrokeStyle(1, 0xffffff, 0.3);

            const texto = this.escena.add.text(bx, by, opcion.etiqueta,
                {
                    fontSize:  '12px',
                    color:     colorTexto,
                    fontStyle: 'bold',
                    align:     'center',
                    wordWrap:  { width: radioBoton * 2 - 4 },
                }
            ).setOrigin(0.5, 0.5);

            if (opcion.disponible) {
                fondo.setInteractive();
                fondo.on('pointerdown', () => {
                    this.ocultar();
                    alElegir(opcion.accion);
                });
                fondo.on('pointerover', () => fondo.setFillStyle(0x3366cc, 0.9));
                fondo.on('pointerout',  () => fondo.setFillStyle(colorFondo, 0.9));
            }

            elementos.push(fondo, texto);
        });

        // Botón "Más" en nivel 1. En realidad para esta Beta solo va a haber 1 nivel de Acciones.
        // En el futuro se implementará un segundo nivel con más opciones (Asegurar Balón, Pisar y Lanzar Compañero de equipo).
        // if (this.nivel === 1) {
        if (this.nivel === 1 && opcionesN2.length > 0) {
            const angulo = (opciones.length / totalOpciones) * Math.PI * 2 - Math.PI / 2;
            const bx     = Math.cos(angulo) * radioMenu;
            const by     = Math.sin(angulo) * radioMenu;

            const fondoMas = this.escena.add.circle(bx, by, radioBoton, 0x446644, 0.9);
            fondoMas.setStrokeStyle(1, 0xffffff, 0.3);
            fondoMas.setInteractive();

            const textoMas = this.escena.add.text(bx, by, 'Más...',
                { fontSize: '12px', color: '#aaffaa', fontStyle: 'bold' }
            ).setOrigin(0.5, 0.5);

            fondoMas.on('pointerdown', () => {
                this.nivel = 2;
                this.dibujarNivel(x, y, opcionesN1, opcionesN2, alElegir);
            });
            fondoMas.on('pointerover', () => fondoMas.setFillStyle(0x668866, 0.9));
            fondoMas.on('pointerout',  () => fondoMas.setFillStyle(0x446644, 0.9));

            elementos.push(fondoMas, textoMas);
        }

        this.contenedor = this.escena.add.container(x, y, elementos);
        this.contenedor.setDepth(200);
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