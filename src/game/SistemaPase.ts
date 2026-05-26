export class SistemaPase {

    // Determina el tipo de pase según la distancia
    public calcularTipoPase(
        columnaLanzador: number, filaLanzador: number,
        columnaReceptor: number, filaReceptor: number
    ): 'rapido' | 'corto' | 'largo' | 'bomba' | 'fuera' {
        const dc = Math.abs(columnaReceptor - columnaLanzador);
        const df = Math.abs(filaReceptor    - filaLanzador);

        // Usamos la tabla de Regular Throwing Ranges
        const max = Math.max(dc, df);
        const min = Math.min(dc, df);

        if (max <= 3 && min <= 3) {
            // Zona Q o T
            if (max === 0) return 'rapido'; // misma casilla no aplica
            return 'rapido';
        }
        if (max <= 6) return 'corto';
        if (max <= 10) return 'largo';
        if (max <= 13) return 'bomba';
        return 'fuera';
    }

    // Modificador de dificultad según tipo de pase
    public modificadorDistancia(tipo: 'rapido' | 'corto' | 'largo' | 'bomba'): number {
        switch (tipo) {
            case 'rapido': return 0;
            case 'corto':  return 1;
            case 'largo':  return 2;
            case 'bomba':  return 3;
        }
    }

    // Calcula probabilidad de pase
    public calcularProbabilidadPase(
        paseAtributo:  string,   // ej. '3+'
        tipoPase:      'rapido' | 'corto' | 'largo' | 'bomba',
        enemigosMarcan: number,  // enemigos en pie marcando al lanzador
        tieneHabilidadPasar: boolean
    ): number {
        const paseBase   = parseInt(paseAtributo.replace('+', ''));
        const dificultad = Math.min(paseBase + this.modificadorDistancia(tipoPase) + enemigosMarcan, 6);
        const probFallo  = (dificultad - 1) / 6;

        if (tieneHabilidadPasar) {
            // Puede repetir → prob fallo = probFallo²
            return 1 - (probFallo * probFallo);
        }
        return 1 - probFallo;
    }

    // Calcula probabilidad de atrapar
    public calcularProbabilidadAtrapar(
        agilidadAtributo:    string,  // ej. '3+'
        enemigosMarcan:      number,  // enemigos en pie marcando al receptor
        tieneHabilidadAtrapar:   boolean,
        tieneNerviosAcero:       boolean,
        tieneRecepcionHeroica:   boolean
    ): number {
        const agBase = parseInt(agilidadAtributo.replace('+', ''));

        let modificador = 0;
        if (!tieneNerviosAcero) modificador += enemigosMarcan;
        if (tieneRecepcionHeroica) modificador -= 1; // +1 al chequeo = -1 a dificultad

        const dificultad = Math.min(Math.max(agBase + modificador, 2), 6);
        const probFallo  = (dificultad - 1) / 6;

        if (tieneHabilidadAtrapar) {
            return 1 - (probFallo * probFallo);
        }
        return 1 - probFallo;
    }

    // Cuenta enemigos en pie que marcan a un posicional
    public contarEnemigosMarcan(
        columna:      number,
        fila:         number,
        posicionales: any[]
    ): number {
        return posicionales.filter(p => {
            if (p.datos.equipo === 'amigo') return false;
            if (p.tumbado) return false;
            const dc = Math.abs(p.datos.columna - columna);
            const df = Math.abs(p.datos.fila    - fila);
            return dc <= 1 && df <= 1 && (dc + df > 0);
        }).length;
    }
}