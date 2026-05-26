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
    // ============================================================
    await db.execute(`
        INSERT INTO subida_habilidades (nombre, categoria) VALUES
        ('Placar',                'G'),
        ('Placaje defensivo',     'G'),
        ('Romper defensas',       'A'),
        ('Esprintar',             'A'),
        ('Manos seguras',         'G'),
        ('Pasar',                 'P'),
        ('Atrapar',               'A'),
        ('Esquivar',              'A'),
        ('Saltar',                'A'),
        ('Proteger el cuero',     'A'),
        ('Patada de despeje',     'P'),
        ('Pase precipitado',      'P'),
        ('En pie de un salto',    'A'),
        ('Abrirse paso',          'F'),
        ('Perseguir',             'T'),
        ('Golpe a a Carrera',     'A'),
        ('Golpe mortifero',       'F'),
        ('Provocar',              'G'),
        ('Brazo fuerte',          'F'),
        ('Mantenerse firme',      'F'),
        ('Jugar sucio',           'T'),
        ('Proyectil de vomito',   'Rasgo'),
        ('Apuñalar',              'Rasgo'), 
        ('Cabeza dura',           'Rasgo'),
        ('Estupido',              'Rasgo'),
        ('Lanzar companero',      'Rasgo'),
        ('Solitario 3+',          'Rasgo'),
        ('Solitario 4+',          'Rasgo'),
        ('Escurridizo',           'Rasgo'),
        ('Humanoide bala',        'Rasgo'),
        ('Furia',                 'Rasgo'),
        ('Odio Troll',            'Rasgo'),
        ('Agallas',               'Rasgo'),
        ('Placaje heroico',       'Rasgo'),
        ('Abrirse paso rasgo',    'Rasgo'),
        ('Arma secreta',          'Rasgo'),
        ('El balon ni verlo',     'Rasgo'),
        ('Imparable',             'Rasgo'),
        ('Realmente estupido',    'Rasgo'),
        ('Regeneracion',          'Rasgo'),
        ('Siempre hambriento',    'Rasgo'),
        ('Echar raices',          'Rasgo'),
        ('Tembloroso',            'Rasgo');
    `);

    // ============================================================
    // POSICIONES
    // ============================================================
    await db.execute(`
        INSERT INTO posiciones (id_raza_aux, nombre, tipo, cantidad_max, coste, movimiento, fuerza, agilidad, pase, armadura) VALUES
        (1, 'Human Lineman',        'Linea',       16,   50000,  6, 3, '3+', '4+', '9+'),
        (1, 'Halfling Hopeful',     'Linea',        3,   30000,  5, 2, '3+', '4+', '7+'),
        (1, 'Human Catcher',        'Receptor',     2,   75000,  8, 3, '3+', '4+', '8+'),
        (1, 'Human Thrower',        'Lanzador',     2,   75000,  6, 3, '3+', '3+', '9+'),
        (1, 'Human Blitzer',        'Blitzer',      2,   85000,  7, 3, '3+', '4+', '9+'),
        (1, 'Ogre',                 'Ogre',         1,  140000,  5, 5, '4+', '5+', '10+'),
        (2, 'Dwarf Lineman',        'Linea',       16,   70000,  4, 3, '4+', '5+', '10+'),
        (2, 'Dwarf Runner',         'Corredor',     2,   80000,  6, 3, '3+', '4+', '9+'),
        (2, 'Dwarf Blitzer',        'Blitzer',      2,  100000,  5, 3, '4+', '4+', '10+'),
        (2, 'Troll Slayer',         'Troll Slayer', 2,   95000,  5, 3, '4+', '5+', '9+'),
        (2, 'Deathroller',          'DeathRoller',  1,  170000,  5, 7, '5+', NULL,  '11+'),
        (3, 'Dark Elf Lineman',     'Linea',       16,   65000,  6, 3, '2+', '3+', '9+'),
        (3, 'Dark Elf Runner',      'Corredor',     2,   80000,  7, 3, '2+', '3+', '8+'),
        (3, 'Dark Elf Assassin',    'Assassin',     2,   90000,  7, 3, '2+', '4+', '8+'),
        (3, 'Dark Elf Blitzer',     'Blitzer',      2,  105000,  7, 3, '2+', '3+', '9+'),
        (3, 'Witch Elf',            'Witch Elf',    2,  110000,  7, 3, '2+', '4+', '8+'),
        (4, 'Orc Lineman',          'Linea',       16,   50000,  5, 3, '3+', '4+', '10+'),
        (4, 'Goblin Lineman',       'Linea',        4,   40000,  6, 2, '3+', '3+', '8+'),
        (4, 'Orc Thrower',          'Lanzador',     2,   75000,  6, 3, '3+', '3+', '9+'),
        (4, 'Orc Blitzer',          'Blitzer',      2,   85000,  6, 3, '3+', '4+', '10+'),
        (4, 'Big Un Blocker',       'Defensor',     2,   95000,  5, 4, '4+', '6+', '10+'),
        (4, 'Troll',                'Troll',        1,  115000,  4, 5, '5+', '5+', '10+'),
        (5, 'Wood Elf Lineman',     'Linea',       16,   65000,  7, 3, '2+', '3+', '8+'),
        (5, 'Wood Elf Thrower',     'Lanzador',     2,   85000,  7, 3, '2+', '2+', '8+'),
        (5, 'Wood Elf Catcher',     'Receptor',     2,   90000,  8, 2, '2+', '3+', '8+'),
        (5, 'Wardancer',            'Blitzer',      2,  130000,  8, 3, '2+', '3+', '8+'),
        (5, 'Loren Forest Treeman', 'Treeman',      1,  120000,  6, 5, '5+', NULL,  '11+');
    `);

    // ============================================================
    // RELACIONES POSICION - HABILIDADES
    // ============================================================

    // Human Lineman (1)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (1,1,'primaria'),(1,2,'primaria'),(1,3,'primaria'),(1,4,'primaria'),(1,5,'primaria'),
        (1,6,'primaria'),(1,7,'primaria'),(1,8,'primaria'),(1,9,'primaria'),(1,10,'primaria'),
        (1,11,'primaria'),(1,12,'primaria'),(1,13,'primaria'),(1,14,'primaria'),(1,15,'primaria'),(1,16,'primaria'),
        (1,17,'secundaria'),(1,18,'secundaria'),(1,19,'secundaria'),(1,20,'secundaria'),
        (1,21,'secundaria'),(1,22,'secundaria'),(1,23,'secundaria');`);

    // Halfling Hopeful (2)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (2,30,'innata'),(2,31,'rasgo'),(2,8,'innata'),
        (2,17,'primaria'),(2,7,'primaria'),(2,9,'primaria'),(2,13,'primaria'),(2,15,'primaria'),(2,16,'primaria'),
        (2,18,'secundaria'),(2,19,'secundaria'),(2,20,'secundaria'),(2,21,'secundaria'),
        (2,1,'secundaria'),(2,2,'secundaria'),(2,3,'secundaria'),(2,4,'secundaria'),(2,5,'secundaria'),
        (2,6,'secundaria'),(2,10,'secundaria'),(2,11,'secundaria'),(2,12,'secundaria'),
        (2,14,'secundaria'),(2,22,'secundaria'),(2,23,'secundaria');`);

    // Human Catcher (3)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (3,7,'innata'),(3,8,'innata'),
        (3,17,'primaria'),(3,9,'primaria'),(3,13,'primaria'),(3,15,'primaria'),(3,16,'primaria'),
        (3,1,'primaria'),(3,2,'primaria'),(3,3,'primaria'),(3,4,'primaria'),(3,5,'primaria'),
        (3,6,'primaria'),(3,10,'primaria'),(3,11,'primaria'),(3,12,'primaria'),(3,14,'primaria'),
        (3,18,'secundaria'),(3,19,'secundaria'),(3,20,'secundaria'),(3,21,'secundaria'),
        (3,24,'secundaria'),(3,22,'secundaria'),(3,23,'secundaria');`);

    // Human Thrower (4)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (4,5,'innata'),(4,6,'innata'),
        (4,1,'primaria'),(4,2,'primaria'),(4,3,'primaria'),(4,4,'primaria'),(4,7,'primaria'),
        (4,8,'primaria'),(4,9,'primaria'),(4,10,'primaria'),(4,11,'primaria'),(4,12,'primaria'),
        (4,13,'primaria'),(4,14,'primaria'),(4,15,'primaria'),(4,16,'primaria'),(4,24,'primaria'),
        (4,17,'secundaria'),(4,18,'secundaria'),(4,19,'secundaria'),(4,20,'secundaria'),
        (4,21,'secundaria'),(4,22,'secundaria'),(4,23,'secundaria');`);

    // Human Blitzer (5)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (5,2,'innata'),(5,1,'innata'),
        (5,18,'primaria'),(5,19,'primaria'),(5,20,'primaria'),(5,21,'primaria'),
        (5,3,'primaria'),(5,4,'primaria'),(5,5,'primaria'),(5,6,'primaria'),(5,7,'primaria'),
        (5,8,'primaria'),(5,9,'primaria'),(5,10,'primaria'),(5,11,'primaria'),(5,12,'primaria'),
        (5,13,'primaria'),(5,14,'primaria'),(5,15,'primaria'),(5,16,'primaria'),
        (5,17,'secundaria'),(5,22,'secundaria'),(5,23,'secundaria');`);

    // Ogre (6)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (6,25,'innata'),  -- Cabeza dura
        (6,26,'innata'),  -- Estupido
        (6,18,'innata'),  -- Golpe mortifero
        (6,27,'innata'),  -- Lanzar companero
        (6,28,'innata'),  -- Solitario 4+
        (6,19,'primaria'),(6,20,'primaria'),(6,21,'primaria'),
        (6,17,'secundaria'),(6,1,'secundaria'),(6,2,'secundaria'),(6,3,'secundaria'),(6,4,'secundaria'),
        (6,5,'secundaria'),(6,6,'secundaria'),(6,7,'secundaria'),(6,8,'secundaria'),(6,9,'secundaria'),
        (6,10,'secundaria'),(6,11,'secundaria'),(6,12,'secundaria'),(6,13,'secundaria'),
        (6,14,'secundaria'),(6,15,'secundaria'),(6,16,'secundaria');`);

    // Dwarf Lineman (7)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (7,25,'rasgo'),(7,1,'innata'),(7,3,'innata'),
        (7,2,'primaria'),(7,4,'primaria'),(7,5,'primaria'),(7,6,'primaria'),(7,7,'primaria'),
        (7,8,'primaria'),(7,9,'primaria'),(7,10,'primaria'),(7,11,'primaria'),(7,12,'primaria'),
        (7,13,'primaria'),(7,14,'primaria'),(7,15,'primaria'),(7,16,'primaria'),
        (7,22,'primaria'),(7,23,'primaria'),
        (7,18,'secundaria'),(7,19,'secundaria'),(7,20,'secundaria'),(7,21,'secundaria');`);

    // Dwarf Runner (8)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (8,25,'rasgo'),(8,4,'innata'),(8,5,'innata'),
        (8,1,'primaria'),(8,2,'primaria'),(8,3,'primaria'),(8,6,'primaria'),(8,7,'primaria'),
        (8,8,'primaria'),(8,9,'primaria'),(8,10,'primaria'),(8,11,'primaria'),(8,12,'primaria'),
        (8,13,'primaria'),(8,14,'primaria'),(8,15,'primaria'),(8,16,'primaria'),(8,24,'primaria'),
        (8,18,'secundaria'),(8,19,'secundaria'),(8,20,'secundaria'),(8,21,'secundaria');`);

    // Dwarf Blitzer (9)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (9,25,'rasgo'),(9,2,'innata'),(9,35,'innata'),(9,1,'innata'),
        (9,18,'primaria'),(9,19,'primaria'),(9,20,'primaria'),(9,21,'primaria'),
        (9,3,'primaria'),(9,4,'primaria'),(9,5,'primaria'),(9,6,'primaria'),(9,7,'primaria'),
        (9,8,'primaria'),(9,9,'primaria'),(9,10,'primaria'),(9,11,'primaria'),(9,12,'primaria'),
        (9,13,'primaria'),(9,14,'primaria'),(9,15,'primaria'),(9,16,'primaria'),
        (9,24,'secundaria');`);

    // Troll Slayer (10)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (10,34,'rasgo'),(10,25,'rasgo'),(10,32,'rasgo'),(10,33,'rasgo'),(10,1,'innata'),
        (10,18,'primaria'),(10,19,'primaria'),(10,20,'primaria'),(10,21,'primaria'),
        (10,2,'primaria'),(10,3,'primaria'),(10,4,'primaria'),(10,5,'primaria'),(10,6,'primaria'),
        (10,7,'primaria'),(10,8,'primaria'),(10,9,'primaria'),(10,10,'primaria'),(10,11,'primaria'),
        (10,12,'primaria'),(10,13,'primaria'),(10,14,'primaria'),(10,15,'primaria'),(10,16,'primaria'),
        (10,22,'secundaria'),(10,23,'secundaria');`);

    // Deathroller (11)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (11,36,'rasgo'),(11,37,'rasgo'),(11,38,'rasgo'),(11,18,'rasgo'),(11,39,'rasgo'),(11,23,'rasgo'),
        (11,19,'primaria'),(11,20,'primaria'),(11,21,'primaria'),
        (11,1,'secundaria'),(11,2,'secundaria'),(11,3,'secundaria'),(11,4,'secundaria'),(11,5,'secundaria'),
        (11,6,'secundaria'),(11,7,'secundaria'),(11,8,'secundaria'),(11,9,'secundaria'),(11,10,'secundaria'),
        (11,11,'secundaria'),(11,12,'secundaria'),(11,13,'secundaria'),(11,14,'secundaria'),
        (11,15,'secundaria'),(11,16,'secundaria');`);

    // Dark Elf Lineman (12)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (12,17,'primaria'),(12,7,'primaria'),(12,9,'primaria'),(12,13,'primaria'),(12,15,'primaria'),(12,16,'primaria'),
        (12,1,'primaria'),(12,2,'primaria'),(12,3,'primaria'),(12,4,'primaria'),(12,5,'primaria'),
        (12,6,'primaria'),(12,8,'primaria'),(12,10,'primaria'),(12,11,'primaria'),(12,12,'primaria'),(12,14,'primaria'),
        (12,18,'secundaria'),(12,19,'secundaria'),(12,20,'secundaria'),(12,21,'secundaria'),
        (12,22,'secundaria'),(12,23,'secundaria');`);

    // Dark Elf Runner (13)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (13,12,'innata'),(13,11,'innata'),
        (13,17,'primaria'),(13,7,'primaria'),(13,9,'primaria'),(13,13,'primaria'),(13,15,'primaria'),(13,16,'primaria'),
        (13,1,'primaria'),(13,2,'primaria'),(13,3,'primaria'),(13,4,'primaria'),(13,5,'primaria'),
        (13,6,'primaria'),(13,8,'primaria'),(13,10,'primaria'),(13,14,'primaria'),(13,24,'primaria'),
        (13,18,'secundaria'),(13,19,'secundaria'),(13,20,'secundaria'),(13,21,'secundaria'),
        (13,22,'secundaria'),(13,23,'secundaria');`);

    // Dark Elf Assassin (14)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (14,22,'innata'),(14,16,'innata'),(14,15,'innata'),
        (14,17,'primaria'),(14,7,'primaria'),(14,9,'primaria'),(14,13,'primaria'),(14,23,'primaria'),
        (14,18,'secundaria'),(14,19,'secundaria'),(14,20,'secundaria'),(14,21,'secundaria'),
        (14,1,'secundaria'),(14,2,'secundaria'),(14,3,'secundaria'),(14,4,'secundaria'),(14,5,'secundaria'),
        (14,6,'secundaria'),(14,8,'secundaria'),(14,10,'secundaria'),(14,11,'secundaria'),
        (14,12,'secundaria'),(14,14,'secundaria');`);

    // Dark Elf Blitzer (15)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (15,1,'innata'),
        (15,17,'primaria'),(15,7,'primaria'),(15,9,'primaria'),(15,13,'primaria'),(15,15,'primaria'),(15,16,'primaria'),
        (15,2,'primaria'),(15,3,'primaria'),(15,4,'primaria'),(15,5,'primaria'),(15,6,'primaria'),
        (15,8,'primaria'),(15,10,'primaria'),(15,11,'primaria'),(15,12,'primaria'),(15,14,'primaria'),
        (15,18,'secundaria'),(15,19,'secundaria'),(15,20,'secundaria'),(15,21,'secundaria'),
        (15,24,'secundaria'),(15,22,'secundaria'),(15,23,'secundaria');`);

    // Witch Elf (16)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (16,32,'rasgo'),(16,13,'innata'),(16,8,'innata'),
        (16,17,'primaria'),(16,7,'primaria'),(16,9,'primaria'),(16,15,'primaria'),(16,16,'primaria'),
        (16,1,'primaria'),(16,2,'primaria'),(16,3,'primaria'),(16,4,'primaria'),(16,5,'primaria'),
        (16,6,'primaria'),(16,10,'primaria'),(16,11,'primaria'),(16,12,'primaria'),(16,14,'primaria'),
        (16,18,'secundaria'),(16,19,'secundaria'),(16,20,'secundaria'),(16,21,'secundaria'),
        (16,22,'secundaria'),(16,23,'secundaria');`);

    // Orc Lineman (17)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (17,18,'primaria'),(17,19,'primaria'),(17,20,'primaria'),(17,21,'primaria'),
        (17,1,'primaria'),(17,2,'primaria'),(17,3,'primaria'),(17,4,'primaria'),(17,5,'primaria'),
        (17,6,'primaria'),(17,7,'primaria'),(17,8,'primaria'),(17,9,'primaria'),(17,10,'primaria'),
        (17,11,'primaria'),(17,12,'primaria'),(17,13,'primaria'),(17,14,'primaria'),(17,15,'primaria'),(17,16,'primaria'),
        (17,17,'secundaria'),(17,22,'secundaria'),(17,23,'secundaria');`);

    // Goblin Lineman (18)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (18,30,'rasgo'),(18,31,'rasgo'),(18,8,'innata'),
        (18,17,'primaria'),(18,7,'primaria'),(18,9,'primaria'),(18,13,'primaria'),(18,15,'primaria'),
        (18,16,'primaria'),(18,22,'primaria'),(18,23,'primaria'),
        (18,18,'secundaria'),(18,19,'secundaria'),(18,20,'secundaria'),(18,21,'secundaria'),
        (18,1,'secundaria'),(18,2,'secundaria'),(18,3,'secundaria'),(18,4,'secundaria'),(18,5,'secundaria'),
        (18,6,'secundaria'),(18,10,'secundaria'),(18,11,'secundaria'),(18,12,'secundaria'),
        (18,14,'secundaria'),(18,24,'secundaria');`);

    // Orc Thrower (19)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (19,5,'innata'),(19,6,'innata'),
        (19,1,'primaria'),(19,2,'primaria'),(19,3,'primaria'),(19,4,'primaria'),(19,7,'primaria'),
        (19,8,'primaria'),(19,9,'primaria'),(19,10,'primaria'),(19,11,'primaria'),(19,12,'primaria'),
        (19,13,'primaria'),(19,14,'primaria'),(19,15,'primaria'),(19,16,'primaria'),(19,24,'primaria'),
        (19,17,'secundaria'),(19,18,'secundaria'),(19,19,'secundaria'),(19,20,'secundaria'),
        (19,21,'secundaria'),(19,22,'secundaria'),(19,23,'secundaria');`);

    // Orc Blitzer (20)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (20,14,'innata'),(20,1,'innata'),
        (20,18,'primaria'),(20,19,'primaria'),(20,20,'primaria'),(20,21,'primaria'),
        (20,2,'primaria'),(20,3,'primaria'),(20,4,'primaria'),(20,5,'primaria'),(20,6,'primaria'),
        (20,7,'primaria'),(20,8,'primaria'),(20,9,'primaria'),(20,10,'primaria'),(20,11,'primaria'),
        (20,12,'primaria'),(20,13,'primaria'),(20,15,'primaria'),(20,16,'primaria'),
        (20,17,'secundaria'),(20,22,'secundaria'),(20,23,'secundaria');`);

    // Big Un Blocker (21)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (21,25,'rasgo'),(21,44,'rasgo'),(21,18,'innata'),(21,19,'innata'),
        (21,20,'primaria'),(21,21,'primaria'),
        (21,1,'primaria'),(21,2,'primaria'),(21,3,'primaria'),(21,4,'primaria'),(21,5,'primaria'),
        (21,6,'primaria'),(21,7,'primaria'),(21,8,'primaria'),(21,9,'primaria'),(21,10,'primaria'),
        (21,11,'primaria'),(21,12,'primaria'),(21,13,'primaria'),(21,14,'primaria'),(21,15,'primaria'),(21,16,'primaria'),
        (21,17,'secundaria'),(21,22,'secundaria'),(21,23,'secundaria');`);

    // Troll (22)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (22,18,'rasgo'),(22,27,'rasgo'),(22,24,'rasgo'),(22,40,'rasgo'),(22,41,'rasgo'),(22,42,'rasgo'),(22,29,'rasgo'),
        (22,19,'primaria'),(22,20,'primaria'),(22,21,'primaria'),
        (22,17,'secundaria'),(22,1,'secundaria'),(22,2,'secundaria'),(22,3,'secundaria'),(22,4,'secundaria'),
        (22,5,'secundaria'),(22,6,'secundaria'),(22,7,'secundaria'),(22,8,'secundaria'),(22,9,'secundaria'),
        (22,10,'secundaria'),(22,11,'secundaria'),(22,12,'secundaria'),(22,13,'secundaria'),
        (22,14,'secundaria'),(22,15,'secundaria'),(22,16,'secundaria');`);

    // Wood Elf Lineman (23)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (23,17,'primaria'),(23,7,'primaria'),(23,9,'primaria'),(23,13,'primaria'),(23,15,'primaria'),(23,16,'primaria'),
        (23,1,'primaria'),(23,2,'primaria'),(23,3,'primaria'),(23,4,'primaria'),(23,5,'primaria'),
        (23,6,'primaria'),(23,8,'primaria'),(23,10,'primaria'),(23,11,'primaria'),(23,12,'primaria'),(23,14,'primaria'),
        (23,18,'secundaria'),(23,19,'secundaria'),(23,20,'secundaria'),(23,21,'secundaria');`);

    // Wood Elf Thrower (24)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (24,6,'innata'),(24,10,'innata'),
        (24,17,'primaria'),(24,7,'primaria'),(24,9,'primaria'),(24,13,'primaria'),(24,15,'primaria'),(24,16,'primaria'),
        (24,1,'primaria'),(24,2,'primaria'),(24,3,'primaria'),(24,4,'primaria'),(24,5,'primaria'),
        (24,8,'primaria'),(24,11,'primaria'),(24,12,'primaria'),(24,14,'primaria'),(24,24,'primaria'),
        (24,18,'secundaria'),(24,19,'secundaria'),(24,20,'secundaria'),(24,21,'secundaria');`);

    // Wood Elf Catcher (25)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (25,7,'innata'),(25,17,'innata'),(25,8,'innata'),
        (25,9,'primaria'),(25,13,'primaria'),(25,15,'primaria'),(25,16,'primaria'),
        (25,1,'primaria'),(25,2,'primaria'),(25,3,'primaria'),(25,4,'primaria'),(25,5,'primaria'),
        (25,6,'primaria'),(25,10,'primaria'),(25,11,'primaria'),(25,12,'primaria'),(25,14,'primaria'),
        (25,18,'secundaria'),(25,19,'secundaria'),(25,20,'secundaria'),(25,21,'secundaria'),(25,24,'secundaria');`);

    // Wardancer (26)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (26,8,'innata'),(26,1,'innata'),(26,9,'innata'),
        (26,17,'primaria'),(26,7,'primaria'),(26,13,'primaria'),(26,15,'primaria'),(26,16,'primaria'),
        (26,2,'primaria'),(26,3,'primaria'),(26,4,'primaria'),(26,5,'primaria'),(26,6,'primaria'),
        (26,10,'primaria'),(26,11,'primaria'),(26,12,'primaria'),(26,14,'primaria'),
        (26,18,'secundaria'),(26,19,'secundaria'),(26,20,'secundaria'),(26,21,'secundaria'),(26,24,'secundaria');`);

    // Loren Forest Treeman (27)
    await db.execute(`INSERT INTO posicion_subida_habilidades VALUES
        (27,20,'rasgo'),(27,25,'rasgo'),(27,43,'rasgo'),(27,27,'rasgo'),(27,21,'rasgo'),(27,29,'rasgo'),
        (27,18,'innata'),
        (27,19,'primaria'),
        (27,17,'secundaria'),(27,1,'secundaria'),(27,2,'secundaria'),(27,3,'secundaria'),(27,4,'secundaria'),
        (27,5,'secundaria'),(27,6,'secundaria'),(27,7,'secundaria'),(27,8,'secundaria'),(27,9,'secundaria'),
        (27,10,'secundaria'),(27,11,'secundaria'),(27,12,'secundaria'),(27,13,'secundaria'),
        (27,14,'secundaria'),(27,15,'secundaria'),(27,16,'secundaria'),(27,24,'secundaria');`);
}