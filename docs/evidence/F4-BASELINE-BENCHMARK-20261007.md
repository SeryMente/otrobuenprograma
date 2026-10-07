# F4 — Línea de base cuantitativa de sincronización
## Baseline B1 · 2026-10-07

**Proyecto:** Otro Gran Programa (OGP)  
**Ciclo:** F4-20261007  
**Conversación:** CONV-ACTUAL  
**Versión de producto:** v1.7.0  
**Commit bajo prueba:** 7c8ffd52fdc4cdf1110391582819b62daa9f5ec9  
**Workflow:** Calidad (no-regresion) · run 37645750736  
**PR:** #17 · https://github.com/SeryMente/otrogranprograma/pull/17  
**Repositorio:** https://github.com/SeryMente/otrogranprograma  
**URL pública:** https://serymente.github.io/otrogranprograma/

## 1. Estado congelado

Esta ejecución constituye la **línea de base B1** para las siguientes iteraciones de sincronización narrativa.

Regla operativa desde B1:

> Toda mejora posterior se expresa como comparación numérica contra esta matriz y contra la mejor marca certificada posterior.

No se aceptará declarar mejora por inspección visual sin cambio medible en el benchmark.

## 2. Benchmark estructural y offline

| Métrica | Baseline B1 | Unidad | Criterio |
|---|---:|---|---|
| M1 coverage | 100.0 | % | 100% |
| M2 text integrity | 100.0 | % | 100% |
| M3 monotonicity | 100.0 | % | 100% |
| M4 valid interval | 100.0 | % | 100% |
| M5 proportional boundary deviation P50 | 4192.622 | ms | informativo |
| M6 proportional boundary deviation P95 | 14938.081 | ms | informativo |
| M7 word duration P95 | 700.000 | ms | informativo |
| M8 alignment score P10 | 0.60050 | score | informativo |
| M8 alignment score coverage | 100.0 | % | 100% |

**Cobertura canónica:** 20 segmentos / 2,206 palabras.

**Alineador:** WhisperX CTC.  
**Estado del artefacto:** forced-alignment-certified.  
**Timing proporcional:** false.

M5 y M6 son desviaciones comparativas respecto al antiguo timing proporcional; no representan error absoluto contra una anotación humana.

## 3. Benchmark de sincronización en navegador

**Suite:** F4 deterministic seek benchmark  
**Muestra:** 120 puntos  
**Modo de medio:** cada segmento se carga desde su recurso same-origin como Blob URL para aislar el motor de sincronización de problemas de HTTP Range/streaming.

| Métrica | Baseline B1 | Unidad | Criterio |
|---|---:|---|---|
| correctRate | 100.0000 | % | 100% |
| M10 wrong-word rate | 0.0000 | % | 0% |
| M11 missed-word rate | 0.0000 | % | 0% |
| M13 seek stability | 100.0000 | % | 100% |
| seek event rate | 100.0000 | % | 100% |
| probe time error P95 | 0.000 | ms | 0 ms |

**Errores:** 0 wrong / 0 missed / 0 unstable.

## 4. Benchmark del reloj visual

**Reproducción:** 1.0×  
**Segmento:** 04  
**Duración medida:** 15 s  
**Frames:** 953  
**Transiciones observadas:** 14

| Métrica | Baseline B1 | Unidad | Criterio |
|---|---:|---|---|
| M9 P50 | 7.376 | ms | informativo |
| M9 P95 | 14.994 | ms | <= 50 ms |
| M9 P99 | 16.185 | ms | informativo |
| M9 max | 16.483 | ms | informativo |
| M12 transition monotonicity | 100.0 | % | 100% |

## 5. Resultado de certificación B1

**STATIC CONTRACT:** PASS  
**PLAYWRIGHT GATE:** PASS  
**OFFLINE TIMING BENCHMARK:** CERTIFIED  
**BROWSER DETERMINISTIC MAPPING:** PASS  
**BROWSER RUNTIME CLOCK:** PASS

## 6. Regla de comparación para las iteraciones

Para cada futura iteración se reportará, como mínimo:

- valor actual;
- valor baseline B1;
- delta absoluto;
- delta porcentual cuando aplique;
- criterio objetivo;
- estado PASS/FAIL.

Una regresión será cualquier empeoramiento de una métrica certificada sin una excepción documentada.

Una mejora significativa será publicada y añadida como nuevo checkpoint cuantitativo, preservando B1 como referencia histórica.

## 7. Límites actuales de lo que significan estos números

B1 certifica la correspondencia del motor visual contra el artefacto de timing generado y la ejecución controlada en Chromium.

B1 **no** equivale todavía a una certificación de error fonético absoluto humano sobre las 2,206 palabras. Para esa afirmación se requiere un conjunto independiente de anotaciones de referencia.

## 8. Próximo benchmark

La siguiente iteración deberá medir exactamente la misma matriz antes de introducir nuevas métricas.

El objetivo inmediato es mantener:

**M10 = 0.0000%**  
**M11 = 0.0000%**  
**M12 = 100.0000%**  
**M13 = 100.0000%**  
**M9 P95 <= 50.000 ms**

y posteriormente reducir el margen de M9 y ampliar cobertura de reproducción y dispositivos sin degradar las cifras certificadas.
