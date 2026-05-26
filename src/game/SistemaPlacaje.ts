import { Posicional } from './Posicional';
import { COLUMNAS_TABLERO, FILAS_TABLERO } from './Tablero';

export interface ResultadoPlacaje {
    opcion:       'empujar' | 'derribar' | 'empujarDerribar';
    etiqueta:     string;
    probabilidad: number;
    disponible:   boolean;
}

export interface CasillaEmpuje {
    columna: number;
    fila:    number;
}

export class SistemaPlacaje {

    // Calcula el número de dados de placaje
    public calcularDados(
        atacante:     Posicional,
        defensor:     Posicional,
        posicionales: Posicional[]
    ): { numDados: number; elijeAtacante: boolean } {
        const fuerzaAtacante = this.calcularFuerza(atacante, defensor, posicionales);
        const fuerzaDefensor = this.calcularFuerza(defensor, atacante, posicionales);

        if (fuerzaAtacante === fuerzaDefensor) {
            return { numDados: 1, elijeAtacante: true };
        } else if (fuerzaAtacante > fuerzaDefensor) {
            const ratio = fuerzaAtacante / fuerzaDefensor;
            return { numDados: ratio >= 2 ? 3 : 2, elijeAtacante: true };
        } else {
            const ratio = fuerzaDefensor / fuerzaAtacante;
            return { numDados: ratio >= 2 ? 3 : 2, elijeAtacante: false };
        }
    }

    // Calcula la fuerza total de un posicional incluyendo apoyos
    private calcularFuerza(
        posicional:   Posicional,
        rival:        Posicional,
        posicionales: Posicional[]
    ): number {
        let fuerza = posicional.datos.estadisticas.fuerza;
        const equipoRival = rival.datos.equipo;

        // Apoyos: compañeros adyacentes al rival que no estén marcados por otros rivales
        posicionales.forEach(p => {
            if (p.datos.equipo !== posicional.datos.equipo) return;
            if (p.datos.id === posicional.datos.id) return;
            if (p.tumbado) return;

            const adyacenteARival = this.esAdyacente(p, rival);
            if (!adyacenteARival) return;

            // Verificar que el apoyo no está marcado por otro rival
            const marcadoPorRival = posicionales.some(r =>
                r.datos.equipo === equipoRival &&
                r.datos.id !== rival.datos.id &&
                !r.tumbado &&
                this.esAdyacente(r, p)
            );

            if (!marcadoPorRival) fuerza++;
        });

        return fuerza;
    }

    // Calcula las probabilidades de cada opción
    public calcularOpciones(
        atacante:     Posicional,
        defensor:     Posicional,
        posicionales: Posicional[]
    ): ResultadoPlacaje[] {
        const { numDados, elijeAtacante } = this.calcularDados(atacante, defensor, posicionales);

        const atacanteTieneBlock    = atacante.datos.habilidades.includes('Placar');
        const defensorTieneBlock    = defensor.datos.habilidades.includes('Placar');
        const atacanteTieneTackle   = atacante.datos.habilidades.includes('Placaje defensivo');
        const defensorTieneEsquivar = defensor.datos.habilidades.includes('Esquivar');

        // Caras de cada resultado (sobre 6):
        // Atacante derribado: 1 cara
        // Ambos derribados:   1 cara
        // Empujón:            2 caras
        // Desequilibrado:     1 cara
        // ¡Zasca!:            1 cara

        // Probabilidad de conseguir al menos una cara favorable en N dados
        const probAmbos  = 1 - Math.pow(5 / 6, numDados); // 1 cara
        const probZasca  = 1 - Math.pow(5 / 6, numDados); // 1 cara

        const opciones: ResultadoPlacaje[] = [];

        // OPCIÓN: EMPUJAR (sin derribar)
        // Incluye: Empujón + Desequilibrado si defensor tiene Esquivar y atacante no tiene Tackle
        let probEmpujar = 1 - Math.pow(4 / 6, numDados); // Empujón: 2 caras
        if (defensorTieneEsquivar && !atacanteTieneTackle) {
            // Empujón (2 caras) + Desequilibrado (1 cara) = 3 caras
            probEmpujar = 1 - Math.pow(3 / 6, numDados);
        }

        opciones.push({
            opcion:       'empujar',
            etiqueta:     'Empujar',
            probabilidad: elijeAtacante ? probEmpujar : 1 - probEmpujar,
            disponible:   elijeAtacante,
        });

        // Prueba para ver los datos antes de derribar.
        console.log('atacanteTieneBlock:', atacanteTieneBlock);
        console.log('defensorTieneBlock:', defensorTieneBlock);

        // OPCIÓN: DERRIBAR (sin mover).
        // Solo aparece si el atacante tiene Placar y el defensor NO tiene Placar.
        if (atacanteTieneBlock && !defensorTieneBlock) {
            opciones.push({
                opcion:       'derribar',
                etiqueta:     'Derribar',
                probabilidad: elijeAtacante ? probAmbos : 1 - probAmbos,
                disponible:   elijeAtacante,
            });
        }

        // OPCIÓN: EMPUJAR + DERRIBAR.
        // Incluye: ¡Zasca! + Desequilibrado si defensor NO tiene Esquivar o atacante tiene Tackle.
        let probEmpujarDerribar = probZasca; // Solo ¡Zasca!: 1 cara.
        if (!defensorTieneEsquivar || atacanteTieneTackle) {
            // Zasca (1 cara) + Desequilibrado (1 cara) = 2 caras.
            probEmpujarDerribar = 1 - Math.pow(4 / 6, numDados);
        }

        opciones.push({
            opcion:       'empujarDerribar',
            etiqueta:     'Empujar + Derribar',
            probabilidad: elijeAtacante ? probEmpujarDerribar : 1 - probEmpujarDerribar,
            disponible:   elijeAtacante,
        });

        return opciones;
    }

    // Calcula las 3 casillas válidas de empuje
    public calcularCasillasEmpuje(
        atacante: Posicional,
        defensor: Posicional
    ): CasillaEmpuje[] {
        const dc = defensor.datos.columna - atacante.datos.columna;
        const df = defensor.datos.fila    - atacante.datos.fila;

        const ncol = dc === 0 ? 0 : dc / Math.abs(dc);
        const nfil = df === 0 ? 0 : df / Math.abs(df);

        let candidatas: CasillaEmpuje[];

        if (ncol !== 0 && nfil !== 0) {
            // Caso diagonal: 3 casillas del cuadrante opuesto
            candidatas = [
                { columna: defensor.datos.columna + ncol, fila: defensor.datos.fila        },
                { columna: defensor.datos.columna + ncol, fila: defensor.datos.fila + nfil },
                { columna: defensor.datos.columna,        fila: defensor.datos.fila + nfil },
            ];
        } else if (ncol === 0) {
            // Misma columna: 3 casillas en la fila opuesta
            candidatas = [
                { columna: defensor.datos.columna - 1, fila: defensor.datos.fila + nfil },
                { columna: defensor.datos.columna,     fila: defensor.datos.fila + nfil },
                { columna: defensor.datos.columna + 1, fila: defensor.datos.fila + nfil },
            ];
        } else {
            // Misma fila: 3 casillas en la columna opuesta
            candidatas = [
                { columna: defensor.datos.columna + ncol, fila: defensor.datos.fila - 1 },
                { columna: defensor.datos.columna + ncol, fila: defensor.datos.fila     },
                { columna: defensor.datos.columna + ncol, fila: defensor.datos.fila + 1 },
            ];
        }

        // Filtrar casillas fuera del tablero
        return candidatas.filter(c =>
            c.columna >= 0 && c.columna < COLUMNAS_TABLERO &&
            c.fila    >= 0 && c.fila    < FILAS_TABLERO
        );
    }

    // Resuelve la cadena de empujones
    public resolverEmpuje(
        defensor:     Posicional,
        destino:      CasillaEmpuje,
        posicionales: Posicional[],
        atacante:     Posicional
    ): { posicional: Posicional; destino: CasillaEmpuje }[] {
        const movimientos: { posicional: Posicional; destino: CasillaEmpuje }[] = [];
        this.resolverEmpujeRecursivo(defensor, destino, posicionales, atacante, movimientos);
        return movimientos;
    }

    private resolverEmpujeRecursivo(
        posicional:   Posicional,
        destino:      CasillaEmpuje,
        posicionales: Posicional[],
        empujador:    Posicional,
        movimientos:  { posicional: Posicional; destino: CasillaEmpuje }[]
    ): void {
        // Ver si hay alguien en la casilla destino
        const ocupante = posicionales.find(
            p => p.datos.columna === destino.columna &&
                 p.datos.fila    === destino.fila &&
                 p.datos.id      !== posicional.datos.id
        );

        if (ocupante) {
            // Calcular casillas de empuje para el ocupante
            const casillasOcupante = this.calcularCasillasEmpuje(empujador, ocupante);
            const casillaLibre = casillasOcupante.find(c =>
                !posicionales.some(p =>
                    p.datos.columna === c.columna &&
                    p.datos.fila    === c.fila
                )
            );

            if (casillaLibre) {
                this.resolverEmpujeRecursivo(ocupante, casillaLibre, posicionales, posicional, movimientos);
            }
        }

        movimientos.push({ posicional, destino });
    }

    public esAdyacente(a: Posicional, b: Posicional): boolean {
        const dc = Math.abs(a.datos.columna - b.datos.columna);
        const df = Math.abs(a.datos.fila    - b.datos.fila);
        return dc <= 1 && df <= 1 && (dc + df > 0);
    }
}