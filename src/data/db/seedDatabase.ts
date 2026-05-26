import type { ResultadoConsulta } from './DatabaseService';
interface ConexionBD { execute: (sql: string) => Promise<void>; query: (sql: string, params?: any[]) => Promise<ResultadoConsulta>; }
export async function seedDatabase(db: ConexionBD): Promise<void> {

    // Comprobamos si ya hay datos para no insertar dos veces
    const check = await db.query('SELECT COUNT(*) as total FROM razas;');
    const total = check.values?.[0]?.total ?? 0;
    if (total > 0) return;

    // ============================================================
    // RAZAS
    // ============================================================
    await db.execute(`
        INSERT INTO razas (nombre, liga, reglas_especiales, rerolls, apotecario) VALUES
        ('Humanos',       'Clasica del Viejo Mundo',       'Capitan de equipo',                     8, 1),
        ('Enanos',        'Superliga del Fin del Mundo',   'Brutos brutales, Soborno y corrupcion', 8, 1),
        ('Elfos Oscuros', 'Liga de los Reinos Elves',      'Capitan del Viejo Mundo',               8, 1),
        ('Orcos',         'Clasica del Viejo Mundo',       NULL,                                    8, 1),
        ('Wood Elves',    'Liga de los Bosques',           NULL,                                    8, 1);
    `);

    // ============================================================
    // HABILIDADES
    // IDs reservados por categoria:
    // Agilidad  [1-12]
    // Fuerza    [21-32]
    // General   [41-52]
    // Pase      [61-72]
    // Triquinuela [81-91]
    // Rasgos    [100-135]
    // ============================================================

    // --- AGILIDAD (A) - IDs 1-12 ---
    await db.execute(`
        INSERT INTO subida_habilidades (id_subHabilidad, nombre, categoria) VALUES
        (1,  'Atrapar',            'A'),
        (2,  'Echarse a un lado',  'A'),
        (3,  'En pie de un salto', 'A'),
        (4,  'Esprintar',          'A'),
        (5,  'Esquivar',           'A'),
        (6,  'Golpe a la carrera', 'A'),
        (7,  'Pies firmes',        'A'),
        (8,  'Placaje heroico',    'A'),
        (9,  'Proteger el cuero',  'A'),
        (10, 'Recepcion heroica',  'A'),
        (11, 'Romper defensas',    'A'),
        (12, 'Saltar',             'A');
    `);

    // --- FUERZA (F) - IDs 21-32 ---
    await db.execute(`
        INSERT INTO subida_habilidades (id_subHabilidad, nombre, categoria) VALUES
        (21, 'Abrirse paso',       'F'),
        (22, 'Apartar',            'F'),
        (23, 'Brazo fuerte',       'F'),
        (24, 'Cabeza dura',        'F'),
        (25, 'Defensa',            'F'),
        (26, 'Golpe mortifero',    'F'),
        (27, 'Imparable',          'F'),
        (28, 'Llave de brazo',     'F'),
        (29, 'Luchador',           'F'),
        (30, 'Mantenerse firme',   'F'),
        (31, 'Ojo de halcon',      'F'),
        (32, 'Placaje multiple',   'F');
    `);

    // --- GENERAL (G) - IDs 41-52 ---
    await db.execute(`
        INSERT INTO subida_habilidades (id_subHabilidad, nombre, categoria) VALUES
        (41, 'Agallas',            'G'),
        (42, 'Equilibrio firme',   'G'),
        (43, 'Forcejear',          'G'),
        (44, 'Furia',              'G'),
        (45, 'Manos seguras',      'G'),
        (46, 'Patada',             'G'),
        (47, 'Placaje defensivo',  'G'),
        (48, 'Placar',             'G'),
        (49, 'Profesional',        'G'),
        (50, 'Provocar',           'G'),
        (51, 'Robar balon',        'G'),
        (52, 'Zafarse',            'G');
    `);

    // --- PASE (P) - IDs 61-72 ---
    await db.execute(`
        INSERT INTO subida_habilidades (id_subHabilidad, nombre, categoria) VALUES
        (61, 'Atento al balon',    'P'),
        (62, 'Canonero',           'P'),
        (63, 'Lider',              'P'),
        (64, 'Nervios de acero',   'P'),
        (65, 'Partenubes',         'P'),
        (66, 'Pasar',              'P'),
        (67, 'Pasar y seguir',     'P'),
        (68, 'Pase a lo loco',     'P'),
        (69, 'Pase precipitado',   'P'),
        (70, 'Pase seguro',        'P'),
        (71, 'Patada de despeje',  'P'),
        (72, 'Precision',          'P');
    `);

    // --- TRIQUINUELA (T) - IDs 81-91 ---
    await db.execute(`
        INSERT INTO subida_habilidades (id_subHabilidad, nombre, categoria) VALUES
        (81, 'Agresor discreto',   'T'),
        (82, 'Piquete de ojos',    'T'),
        (83, 'Dejada',             'T'),
        (84, 'Vuelo letal',        'T'),
        (85, 'Falta rapida',       'T'),
        (86, 'Crujir',             'T'),
        (87, 'Jugar sucio',        'T'),
        (88, 'Meter la bota',      'T'),
        (89, 'Saboteador',         'T'),
        (90, 'Perseguir',          'T'),
        (91, 'Innovador violento', 'T');
    `);

    // --- RASGOS - IDs 100-135 ---
    await db.execute(`
        INSERT INTO subida_habilidades (id_subHabilidad, nombre, categoria) VALUES
        (100, 'Animadversion',      'Rasgo'),
        (101, 'Apunalar',           'Rasgo'),
        (102, 'Arma secreta',       'Rasgo'),
        (103, 'Bola con cadena',    'Rasgo'),
        (104, 'Bombardero',         'Rasgo'),
        (105, 'Borracho',           'Rasgo'),
        (106, 'Canijo',             'Rasgo'),
        (107, 'Chutar companero',   'Rasgo'),
        (108, 'Echar raices',       'Rasgo'),
        (109, 'El balon es mio',    'Rasgo'),
        (110, 'El balon ni verlo',  'Rasgo'),
        (111, 'Embustero',          'Rasgo'),
        (112, 'Escurridizo',        'Rasgo'),
        (113, 'Estupido',           'Rasgo'),
        (114, 'Exhalar fuego',      'Rasgo'),
        (115, 'Ferocidad animal',   'Rasgo'),
        (116, 'Humanoide bala',     'Rasgo'),
        (117, 'Ira descontrolada',  'Rasgo'),
        (118, 'Lanzar companero',   'Rasgo'),
        (119, 'Levantar companero', 'Rasgo'),
        (120, 'Mirada hipnotica',   'Rasgo'),
        (121, 'Motosierra',         'Rasgo'),
        (122, 'Odio',               'Rasgo'),
        (123, 'Planear',            'Rasgo'),
        (124, 'Proyectil de vomito','Rasgo'),
        (125, 'Realmente estupido', 'Rasgo'),
        (126, 'Regeneracion',       'Rasgo'),
        (127, 'Sed de sangre 2+',   'Rasgo'),
        (128, 'Sed de sangre 3+',   'Rasgo'),
        (129, 'Sed de sangre 4+',   'Rasgo'),
        (130, 'Siempre hambriento', 'Rasgo'),
        (131, 'Solitario 2+',       'Rasgo'),
        (132, 'Solitario 3+',       'Rasgo'),
        (133, 'Solitario 4+',       'Rasgo'),
        (134, 'Tembloroso',         'Rasgo'),
        (135, 'Tronco va',          'Rasgo');
    `);

    // ============================================================
    // POSICIONES
    // ============================================================
    await db.execute(`
        INSERT INTO posiciones (id_raza_aux, nombre, tipo, cantidad_max, coste, movimiento, fuerza, agilidad, pase, armadura) VALUES
        (1, 'Human Lineman',        'Linea',      16,  50000, 6, 3, '3+', '4+', '9+'),
        (1, 'Halfling Hopeful',     'Linea',       3,  30000, 5, 2, '3+', '4+', '7+'),
        (1, 'Human Catcher',        'Receptor',    2,  75000, 8, 3, '3+', '4+', '8+'),
        (1, 'Human Thrower',        'Lanzador',    2,  75000, 6, 3, '3+', '3+', '9+'),
        (1, 'Human Blitzer',        'Blitzer',     2,  85000, 7, 3, '3+', '4+', '9+'),
        (1, 'Ogre',                 'Grandullon',  1, 140000, 5, 5, '4+', '5+', '10+'),
        (2, 'Dwarf Lineman',        'Linea',      16,  70000, 4, 3, '4+', '5+', '10+'),
        (2, 'Dwarf Runner',         'Corredor',    2,  80000, 6, 3, '3+', '4+', '9+'),
        (2, 'Dwarf Blitzer',        'Blitzer',     2, 100000, 5, 3, '4+', '4+', '10+'),
        (2, 'Troll Slayer',         'Especial',    2,  95000, 5, 3, '4+', '5+', '9+'),
        (2, 'Deathroller',          'Grandullon',  1, 170000, 5, 7, '5+', NULL, '11+'),
        (3, 'Dark Elf Lineman',     'Linea',      16,  65000, 6, 3, '2+', '3+', '9+'),
        (3, 'Dark Elf Runner',      'Corredor',    2,  80000, 7, 3, '2+', '3+', '8+'),
        (3, 'Dark Elf Assassin',    'Especial',    2,  90000, 7, 3, '2+', '4+', '8+'),
        (3, 'Dark Elf Blitzer',     'Blitzer',     2, 105000, 7, 3, '2+', '3+', '9+'),
        (3, 'Witch Elf',            'Especial',    2, 110000, 7, 3, '2+', '4+', '8+'),
        (4, 'Orc Lineman',          'Linea',      16,  50000, 5, 3, '3+', '4+', '10+'),
        (4, 'Goblin Lineman',       'Linea',       4,  40000, 6, 2, '3+', '3+', '8+'),
        (4, 'Orc Thrower',          'Lanzador',    2,  75000, 6, 3, '3+', '3+', '9+'),
        (4, 'Orc Blitzer',          'Blitzer',     2,  85000, 6, 3, '3+', '4+', '10+'),
        (4, 'Big Un Blocker',       'Defensor',    2,  95000, 5, 4, '4+', '6+', '10+'),
        (4, 'Troll',                'Grandullon',  1, 115000, 4, 5, '5+', '5+', '10+'),
        (5, 'Wood Elf Lineman',     'Linea',      16,  65000, 7, 3, '2+', '3+', '8+'),
        (5, 'Wood Elf Thrower',     'Lanzador',    2,  85000, 7, 3, '2+', '2+', '8+'),
        (5, 'Wood Elf Catcher',     'Receptor',    2,  90000, 8, 2, '2+', '3+', '8+'),
        (5, 'Wardancer',            'Blitzer',     2, 130000, 8, 3, '2+', '3+', '8+'),
        (5, 'Loren Forest Treeman', 'Grandullon',  1, 120000, 6, 5, '5+', NULL, '11+');
    `);

    // ============================================================
    // HABILIDADES INNATAS POR POSICION
    // ============================================================

    // Human Lineman (1) - Sin habilidades innatas

    // Halfling Hopeful (2)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (2, 112, 'innata'),
        (2,   5, 'innata'),
        (2, 116, 'innata');`);

    // Human Catcher (3)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (3,  1, 'innata'),
        (3,  5, 'innata');`);

    // Human Thrower (4)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (4, 45, 'innata'),
        (4, 66, 'innata');`);

    // Human Blitzer (5)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (5, 47, 'innata'),
        (5, 48, 'innata');`);

    // Ogre (6)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (6, 24,  'innata'),
        (6, 113, 'innata'),
        (6, 26,  'innata'),
        (6, 118, 'innata'),
        (6, 132, 'innata');`);

    // Dwarf Lineman (7)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (7, 24, 'innata'),
        (7, 48, 'innata'),
        (7, 11, 'innata');`);

    // Dwarf Runner (8)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (8, 24, 'innata'),
        (8,  4, 'innata'),
        (8, 45, 'innata');`);

    // Dwarf Blitzer (9)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (9, 24, 'innata'),
        (9, 47, 'innata'),
        (9,  8, 'innata'),
        (9, 48, 'innata');`);

    // Troll Slayer (10)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (10, 41,  'innata'),
        (10, 24,  'innata'),
        (10, 44,  'innata'),
        (10, 122, 'innata'),
        (10, 48,  'innata');`);

    // Deathroller (11)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (11, 21,  'innata'),
        (11, 102, 'innata'),
        (11, 110, 'innata'),
        (11, 26,  'innata'),
        (11, 27,  'innata'),
        (11, 87,  'innata'),
        (11, 30,  'innata'),
        (11, 133, 'innata');`);

    // Dark Elf Lineman (12) - Sin habilidades innatas

    // Dark Elf Runner (13)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (13, 69, 'innata'),
        (13, 71, 'innata');`);

    // Dark Elf Assassin (14)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (14, 101, 'innata'),
        (14,   6, 'innata'),
        (14,  90, 'innata');`);

    // Dark Elf Blitzer (15)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (15, 48, 'innata');`);

    // Witch Elf (16)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (16, 44, 'innata'),
        (16,  3, 'innata'),
        (16,  5, 'innata');`);

    // Orc Lineman (17) - Sin habilidades innatas

    // Goblin Lineman (18)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (18, 112, 'innata'),
        (18,   5, 'innata'),
        (18, 116, 'innata');`);

    // Orc Thrower (19)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (19, 45, 'innata'),
        (19, 66, 'innata');`);

    // Orc Blitzer (20)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (20, 21, 'innata'),
        (20, 48, 'innata');`);

    // Big Un Blocker (21)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (21, 24,  'innata'),
        (21, 26,  'innata'),
        (21, 50,  'innata'),
        (21, 134, 'innata');`);

    // Troll (22)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (22, 26,  'innata'),
        (22, 118, 'innata'),
        (22, 124, 'innata'),
        (22, 125, 'innata'),
        (22, 126, 'innata'),
        (22, 130, 'innata'),
        (22, 133, 'innata');`);

    // Wood Elf Lineman (23) - Sin habilidades innatas

    // Wood Elf Thrower (24)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (24, 66, 'innata'),
        (24,  9, 'innata');`);

    // Wood Elf Catcher (25)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (25,  1, 'innata'),
        (25,  4, 'innata'),
        (25,  5, 'innata');`);

    // Wardancer (26)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (26,  5, 'innata'),
        (26, 48, 'innata'),
        (26, 12, 'innata');`);

    // Loren Forest Treeman (27)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (27, 23,  'innata'),
        (27, 24,  'innata'),
        (27, 108, 'innata'),
        (27, 26,  'innata'),
        (27, 30,  'innata'),
        (27, 133, 'innata');`);
}
