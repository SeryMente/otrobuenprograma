# F4-P1 · IGP y dashboard reforzado

**Fecha:** 2026-10-07
**Iteración:** P1.1
**Branch:** iter/p1-sync-dom-20261007
**Workflow de referencia:** https://github.com/SeryMente/otrobuenprograma/actions/runs/37655198400
**PR:** https://github.com/SeryMente/otrobuenprograma/pull/20
**URL pública canónica:** https://serymente.github.io/otrobuenprograma/

## Resultado

El dashboard pasa de mostrar únicamente métricas aisladas a mostrar un índice compuesto de proximidad al ideal.

### Componentes persistidos

- assets/js/igp.js · motor genérico.
- assets/data/sync-igp-config.json · reglas y pesos del IGP.
- assets/data/sync-metric-definitions.json · explicación de una frase por métrica.
- sync-dashboard.html · visualización de IGP, déficit, gates, deltas, métricas y evidencia.
- assets/data/sync-benchmark-latest.json · snapshot P1.

## Principio de interpretación

El IGP no sustituye M1–M13: los resume en una escala común de 0 a 100 para responder una sola pregunta:

> ¿Qué tan cerca estamos del estado ideal?

El gate responde otra pregunta:

> ¿Podemos certificar el estado actual?

## Resultado P1

La ejecución P1 mantuvo los gates críticos:

- M10 = 0%.
- M11 = 0%.
- M12 = 100%.
- M13 = 100%.

M9 P95 pasó de 14.994 ms en B1 a 15.698 ms en P1, por lo que esta iteración no se declara mejora de latencia.

## Regla visual

Cada métrica debe explicarse en una sola frase corta; no se usan dos definiciones distintas para evitar que el usuario tenga que interpretar un bloque técnico adicional.

**Fase técnica:** https://github.com/SeryMente/otrobuenprograma/tree/iter/p1-sync-dom-20261007