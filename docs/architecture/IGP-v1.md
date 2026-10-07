# IGP v1 · Índice General de Perfección

**Fecha:** 2026-10-07
**Proyecto de referencia:** Otro Gran Programa
**Contrato:** assets/data/sync-igp-config.json + assets/js/igp.js

## Propósito

El IGP mide la distancia cuantitativa entre un estado observado y un estado ideal, sin confundir aprobación técnica con perfección.

## Fórmula

Para cada dimensión con ideal explícito se calcula una calidad normalizada qᵢ ∈ [0,1] y después:

`IGP = 100 × Π(qᵢ ^ wᵢ)`

con `Σwᵢ = 1`.

La media geométrica evita que una métrica excelente oculte completamente una métrica deficiente.

## Reglas

- `100.000` es el ideal matemático.
- `100.000` solo existe cuando todas las dimensiones del índice tienen `qᵢ = 1.000`.
- Los **critical gates** son independientes del IGP.
- Un gate fallido produce `NO CERTIFICADO`, aunque el IGP siga siendo numéricamente alto.
- Los diagnósticos no entran al índice cuando no tienen un ideal suficientemente definido.
- B1 sirve para medir evolución; el IGP no se calcula contra B1.
- Los valores de configuración no se ajustan para convertir un FAIL en PASS.

## Curvas

### Métricas mayores-es-mejor

`q = clamp((x - worst) / (ideal - worst), 0, 1)`

### Métricas menores-es-mejor

La métrica conserva una puntuación cercana al ideal mientras mejora dentro del umbral y cae con mayor severidad fuera de él.

Para M9:

- ideal: `0 ms`
- gate: `≤ 50 ms`
- calidad en el gate: `0.900`
- curva: potencia `2`
- hard limit: `100 ms`

Esto evita interpretar 50 ms como calidad cero y conserva una separación matemática entre 0 ms y 15 ms.

### Métricas que idealmente deben ser cero

Se usa un `softLimit` para cuantificar la degradación; el gate puede seguir siendo estrictamente cero.

## Dimensiones que forman el IGP de sincronización

- M1 · cobertura · peso 8%
- M2 · integridad textual · peso 8%
- M3 · monotonía · peso 8%
- M4 · intervalos válidos · peso 8%
- M9 · latencia visual P95 · peso 18%
- M10 · palabra incorrecta · peso 15%
- M11 · palabra omitida · peso 15%
- M12 · monotonía de transición · peso 10%
- M13 · estabilidad de seek · peso 10%

Total: `100%`.

## Diagnósticos fuera del IGP

M5, M6, M7 y M8 siguen visibles y explicados, pero no se convierten en puntos artificiales del índice porque describen comparación histórica, distribución o confianza del alineamiento.

## Estados

- **PERFECTO:** todos los gates pasan y el IGP es 100.000.
- **CERTIFICADO:** todos los gates pasan, pero todavía existe déficit.
- **NO CERTIFICADO:** al menos un gate falla.

## Presentación

El dashboard debe mostrar en cada iteración:

1. IGP actual.
2. Déficit hasta 100.
3. Gates cumplidos.
4. Δ IGP frente a B1.
5. Cada métrica con valor, objetivo, calidad normalizada, peso y una sola frase explicativa.
6. Diagnósticos separados del índice.
7. Evidencia de la ejecución que produjo los valores.

**Fase técnica:** https://github.com/SeryMente/otrobuenprograma/tree/iter/p1-sync-dom-20261007
**URL pública:** https://serymente.github.io/otrobuenprograma/