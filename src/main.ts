import * as Phaser from 'phaser';
import { EscenaJuego } from './scenes/EscenaJuego';
import { initDatabase } from './data/db/DatabaseService';

const iniciarJuego = async () => {
    try {
        await initDatabase();
        console.log('Base de datos inicializada correctamente');
    } catch (e) {  // Abortar si la BD es esencial
        console.error('Error al inicializar la base de datos:', e);
        return; // o lanzar el error
    }

    const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 1100,
        height: 660,
        backgroundColor: '#1a472a',
        scene: [EscenaJuego],
        parent: 'game-container',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
    };

    new Phaser.Game(config);
};

iniciarJuego();