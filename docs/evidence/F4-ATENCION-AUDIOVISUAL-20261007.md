# F4 · Atención audiovisual — registro de implementación
## Checkpoint 2026-10-07

**Proyecto:** Otro Gran Programa (OGP)
**Repositorio canónico:** https://github.com/SeryMente/otrogranprograma
**URL pública canónica:** https://serymente.github.io/otrogranprograma/
**Objetivo:** correspondencia audiovisual inmediata, continua y gratificante entre audio y transcripción.

## Resultado del ciclo

| Iteración | Cambio | Resultado técnico |
|---|---|---|
| I1 | continuidad visual | ancla durante pausas cortas + estela reciente |
| I2 | prosodia | envolvente RMS suavizada → presencia visual |
| I3 | progreso intrapalabra | progreso derivado de tiempo real de la palabra |

## Evidencia determinista de entrada

- 20 segmentos.
- 2,206 palabras.
- 1,646 pausas interpalabra de duración ≤240 ms.

El recuento demuestra que el problema de desaparición durante pausas cortas es material y recurrente.

## Gates preservados

Los cambios no sustituyen el reloj de audio ni modifican los intervalos de timing. Se preservan los selectores:

- `data-sync-audio`
- `data-sync-segment-id`
- `data-sync-active-segment`
- `data-sync-current-word`
- `data-sync-play`

I1 añade `data-sync-continuity-anchor`.

## Criterio perceptual

La prosodia modula presencia visual mediante una señal suavizada y limitada; no interpreta amplitud como importancia semántica.

La progresión intrapalabra se deriva del tiempo real de la palabra y no de una animación desacoplada.

## Estado

**IMPLEMENTADO Y PUBLICADO EN `main`.**

El benchmark técnico de navegador y la validación perceptual A/B siguen siendo comprobaciones independientes; no se inventan resultados ausentes.