import { Capacitor } from '@capacitor/core';
import { seedDatabase } from './seedDatabase';

// Tipos compartidos para las consultas
export interface ResultadoConsulta {
    values?: any[];
}

// Interfaz común para ambas implementaciones
interface ConexionBD {
    execute: (sql: string) => Promise<void>;
    query:   (sql: string, params?: any[]) => Promise<ResultadoConsulta>;
}

// ============================================================
// Implementación para NAVEGADOR usando sql.js
// ============================================================
let sqlJsDb: any = null;

async function iniciarNavegador(): Promise<ConexionBD> {
    const initSqlJs = (await import('sql.js')).default;
    const SQL = await initSqlJs({
        locateFile: () => '/sql-wasm.wasm'
    });
    sqlJsDb = new SQL.Database();

    return {
        execute: async (sql: string) => {
            sqlJsDb.run(sql);
        },
        query: async (sql: string, params?: any[]) => {
            const resultado = sqlJsDb.exec(sql, params);
            if (!resultado || resultado.length === 0) return { values: [] };
            const columnas = resultado[0].columns;
            const valores  = resultado[0].values.map((fila: any[]) => {
                const obj: any = {};
                columnas.forEach((col: string, i: number) => {
                    obj[col] = fila[i];
                });
                return obj;
            });
            return { values: valores };
        }
    };
}

// ============================================================
// Implementación para ANDROID usando @capacitor-community/sqlite
// ============================================================
async function iniciarAndroid(): Promise<ConexionBD> {
    const { CapacitorSQLite, SQLiteConnection } = await import('@capacitor-community/sqlite');
    const sqlite = new SQLiteConnection(CapacitorSQLite);
    const isConn = (await sqlite.isConnection('proyecto_bb', false)).result;
    let db: any;

    if (isConn) {
        db = await sqlite.retrieveConnection('proyecto_bb', false);
    } else {
        db = await sqlite.createConnection(
            'proyecto_bb',
            false,
            'no-encryption',
            1,
            false
        );
    }
    await db.open();

    return {
        execute: async (sql: string) => {
            await db.execute(sql);
        },
        query: async (sql: string, params?: any[]) => {
            return await db.query(sql, params);
        }
    };
}

// ============================================================
// Conexión activa
// ============================================================
let conexion: ConexionBD;

export async function initDatabase(): Promise<void> {
    const esAndroid = Capacitor.getPlatform() === 'android';

    if (esAndroid) {
        console.log('Iniciando base de datos en Android...');
        conexion = await iniciarAndroid();
    } else {
        console.log('Iniciando base de datos en navegador...');
        conexion = await iniciarNavegador();
    }

    await crearTablas();
    await seedDatabase(conexion);
}

async function crearTablas(): Promise<void> {
    await conexion.execute(`
        CREATE TABLE IF NOT EXISTS razas (
            id_raza           INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre            TEXT    NOT NULL,
            liga              TEXT,
            reglas_especiales TEXT,
            rerolls           INTEGER NOT NULL,
            apotecario        INTEGER NOT NULL DEFAULT 1
        );
    `);

    await conexion.execute(`
        CREATE TABLE IF NOT EXISTS posiciones (
            id_posicion   INTEGER PRIMARY KEY AUTOINCREMENT,
            id_raza_aux   INTEGER NOT NULL,
            nombre        TEXT    NOT NULL,
            tipo          TEXT    NOT NULL,
            cantidad_max  INTEGER NOT NULL,
            coste         INTEGER NOT NULL,
            movimiento    INTEGER NOT NULL,
            fuerza        INTEGER NOT NULL,
            agilidad      TEXT    NOT NULL,
            pase          TEXT,
            armadura      TEXT    NOT NULL,
            FOREIGN KEY (id_raza_aux) REFERENCES razas(id_raza)
        );
    `);

    await conexion.execute(`
        CREATE TABLE IF NOT EXISTS subida_habilidades (
            id_subHabilidad INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre          TEXT    NOT NULL,
            categoria       TEXT    NOT NULL
        );
    `);

    await conexion.execute(`
        CREATE TABLE IF NOT EXISTS posicion_subida_habilidades (
            id_posicion_aux     INTEGER NOT NULL,
            id_subHabilidad_aux INTEGER NOT NULL,
            tipo                TEXT    NOT NULL,
            PRIMARY KEY (id_posicion_aux, id_subHabilidad_aux, tipo),
            FOREIGN KEY (id_posicion_aux)     REFERENCES posiciones(id_posicion),
            FOREIGN KEY (id_subHabilidad_aux) REFERENCES subida_habilidades(id_subHabilidad)
        );
    `);
}

export async function getRazas(): Promise<any[]> {
    const resultado = await conexion.query('SELECT * FROM razas;');
    return resultado.values ?? [];
}

export async function getPosicionesByRaza(idRaza: number): Promise<any[]> {
    const resultado = await conexion.query(
        'SELECT * FROM posiciones WHERE id_raza_aux = ?;',
        [idRaza]
    );
    return resultado.values ?? [];
}

export async function getHabilidadesByPosicion(idPosicion: number): Promise<any[]> {
    const resultado = await conexion.query(`
        SELECT sh.nombre, sh.categoria, psh.tipo
        FROM posicion_subida_habilidades psh
        JOIN subida_habilidades sh ON sh.id_subHabilidad = psh.id_subHabilidad_aux
        WHERE psh.id_posicion_aux = ?;
    `, [idPosicion]);
    return resultado.values ?? [];
}

export async function getHabilidadesInnatasByPosicion(idPosicion: number): Promise<string[]> {
    const resultado = await conexion.query(`
        SELECT sh.nombre
        FROM posicion_subida_habilidades psh
        JOIN subida_habilidades sh ON sh.id_subHabilidad = psh.id_subHabilidad_aux
        WHERE psh.id_posicion_aux = ? AND psh.tipo = 'innata'
        ORDER BY sh.categoria, sh.nombre;
    `, [idPosicion]);
    return (resultado.values ?? []).map((h: any) => h.nombre);
}

export async function getPosicionByNombre(nombre: string): Promise<any | null> {
    const resultado = await conexion.query(
        'SELECT * FROM posiciones WHERE nombre = ?;',
        [nombre]
    );
    return resultado.values?.[0] ?? null;
}