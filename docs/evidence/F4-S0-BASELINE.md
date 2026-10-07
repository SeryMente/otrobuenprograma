# F4-S0 · Baseline de control de sincronización

**Versión de producto:** v1.7.0-S0
**Sprint:** F4 · Sincronización narrativa
**Fecha:** 2026-10-07
**URL pública:** https://serymente.github.io/otrogranprograma/
**Repositorio:** https://github.com/SeryMente/otrogranprograma

## Objetivo modesto

S0 no intenta demostrar exactitud fonética. Su único objetivo es establecer control: saber exactamente cuál es el estado inicial que cualquier iteración posterior debe superar.

## Estado de partida

- 20 segmentos.
- 2,206 palabras.
- 1,391.304 s de audio maestro.
- Artefacto actual: assets/data/story-word-timing.json.
- Estado del artefacto: editorial-word-timing-preliminary.
- Método actual: timing proporcional derivado de conteo de palabras + duración de segmento.
- proportionalTiming: true.
- forcedAlignmentPending: true.

## Indicadores S0

| Indicador | Resultado S0 | Interpretación |
|---|---:|---|
| M1 · cobertura de palabras | 100% | Las 2,206 palabras tienen un intervalo almacenado. |
| M2 · integridad textual | 100% | El texto de timing coincide con el transcript canónico. |
| M3 · orden temporal | 100% | Los intervalos son monotónicos y no presentan solapamientos en el artefacto actual. |
| M4 · intervalos válidos | 100% | Los 2,206 intervalos tienen end > start y están dentro de su segmento. |
| M5/M6 · error absoluto de alineamiento | NO MEDIDO | No existe todavía una referencia independiente de onset/offset humano/fonético. |
| M10 · wrong-word rate | NO CERTIFICABLE en S0 | El reloj actual usa el mismo timing proporcional que se pretende auditar; medir contra sí mismo sería circular. |
| M11 · missed-word rate | NO CERTIFICABLE en S0 | Misma limitación circular. |

## Regla de control

El baseline no es un certificado de calidad. Que M1–M4 sean 100% solo significa que el artefacto está completo y estructuralmente válido.

> Existe un sistema de timing completo, pero su correspondencia con la voz real todavía no está medida con una referencia independiente.

## Criterio de salida S0

S0 queda cerrado cuando:
1. este estado está persistido en GitHub;
2. la URL pública corresponde al código F4 que incorpora los instrumentos de medición;
3. el pipeline de alineamiento ya no falla por configuración del workflow.

Después comienza S1: forced alignment real.

## Evidencia canónica

- Timing: https://github.com/SeryMente/otrogranprograma/blob/main/assets/data/story-word-timing.json
- Plan F4: https://github.com/SeryMente/otrogranprograma/blob/main/docs/PLAN-F4-SINCRONIZACION-NARRATIVA-20261007.md