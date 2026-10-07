# Sync Benchmark Contract v1
## Contrato agnóstico para sincronización texto–audio

**Estado:** canónico  
**Versión:** 1  
**Fecha:** 2026-10-07  
**Proyecto de referencia:** Otro Gran Programa  
**Repositorio de referencia:** https://github.com/SeryMente/otrobuenprograma

## 1. Propósito

Este contrato define un método de benchmarking reutilizable para cualquier experiencia de texto sincronizado con audio.

El motor de benchmark **no conoce**:
- nombre del proyecto;
- idioma;
- número de segmentos;
- número de palabras;
- nombres de archivos de audio;
- numeración de segmentos;
- número de fases;
- orden histórico de los segmentos;
- contenido editorial.

Esos elementos pertenecen a los datos del proyecto o a su adaptador.

## 2. Separación de responsabilidades

### Motor universal

El motor:
- carga un artefacto de timing;
- descubre los segmentos presentes;
- descubre las palabras presentes;
- selecciona muestras de forma determinista;
- realiza seeks sobre el elemento de audio;
- observa la palabra activa;
- calcula métricas;
- compara contra thresholds;
- produce evidencia JSON.

### Adaptador de proyecto

El adaptador solo declara:
- URL de prueba;
- archivo de timing;
- archivo de transcript canónico, cuando exista;
- selectores del contrato DOM;
- política de muestreo;
- política de benchmark runtime;
- modo de aislamiento del medio.

## 3. Artefacto de timing

La estructura mínima es:

`segments[] → id → words[] → index, word, start, end`

Cada segmento puede tener cualquier identificador estable, por ejemplo:
- `intro`
- `A-07`
- `scene-blue`
- `segment-2026-01`

No existe un requisito de:
- 20 segmentos;
- IDs numéricos;
- cuatro segmentos por fase;
- 2,206 palabras;
- duración total determinada.

## 4. Transcript canónico opcional

Para M1/M2 y para comparaciones de frontera contra un modelo proporcional histórico, el adaptador puede proporcionar un transcript canónico:

`segments[] → id, text, audioDuration?`

La correspondencia se realiza por `id`, nunca por posición.

Por ello:
- eliminar segmentos no rompe el benchmark;
- agregar segmentos los incorpora automáticamente;
- sustituir un segmento lo convierte en una nueva observación;
- reordenar segmentos no cambia la identidad lógica;
- cambiar completamente el audio solo requiere generar el nuevo timing artifact y actualizar la referencia de datos.

## 5. Contrato DOM

El motor usa atributos semánticos, no nombres de clases visuales.

### Audio

`[data-sync-audio="true"]`

### Play

`[data-sync-play="true"]`

### Selector de segmento

`[data-sync-segment-control="{id}"]`

### Segmento activo

`[data-sync-active-segment="true"]`

El elemento activo debe exponer:

`data-sync-segment-id="{id}"`

### Palabra

Cada palabra sincronizable debe exponer:

`data-sync-segment-id="{id}"`  
`data-sync-word-index="{index}"`

### Palabra actualmente resaltada

La palabra activa debe exponer:

`data-sync-current-word="true"`

De este modo el benchmark no depende de:
- `.story-word`;
- `.is-current`;
- `.story-stop`;
- nombres visuales del componente.

## 6. Regla de identidad

La identidad de una observación es:

**segment ID + word index**

No se utiliza:
- posición global en el documento;
- índice del segmento dentro del array;
- texto visible como identificador;
- nombre del archivo.

## 7. Modo de muestreo

Por defecto se generan puntos deterministas por segmento:
- primera palabra;
- última palabra;
- puntos interiores uniformemente distribuidos.

La cantidad es configurable.

Al cambiar el número de segmentos o palabras:
- el conjunto de muestras se recalcula;
- no se reutilizan índices históricos;
- no se necesita modificar el benchmark.

## 8. Métricas

### Integridad

**M1 — coverage**

`timed words / canonical words`

**M2 — text integrity**

Coincidencia normalizada entre transcript canónico y timing.

**M3 — monotonicity**

Los intervalos respetan el orden temporal.

**M4 — valid interval**

`end > start` y, cuando existe duración canónica, `end <= duration + tolerance`.

### Timing comparativo

**M5/M6 — proportional boundary deviation**

Se conservan como indicadores comparativos cuando existe una referencia proporcional histórica.

No representan error absoluto humano.

**M7 — word duration P95**

Distribución de duración de palabra.

**M8 — alignment score**

Se utiliza cuando el alineador proporciona score.

### Runtime

**M9 — visual latency**

Desfase medido entre la frontera temporal y la detección visual del cambio.

**M10 — wrong-word rate**

La palabra activa no coincide con el intervalo esperado.

**M11 — missed-word rate**

La palabra esperada no llega a estado activo.

**M12 — transition monotonicity**

No existen regresiones de índice durante la reproducción.

**M13 — seek stability**

El audio alcanza de forma estable el tiempo objetivo.

## 9. Invariantes de portabilidad

El benchmark debe continuar funcionando cuando se produce cualquiera de estas operaciones:

| Operación | Resultado esperado |
|---|---|
| Cambiar audio completo | nuevo timing + mismo motor |
| Eliminar segmentos | el benchmark elimina automáticamente esas observaciones |
| Añadir segmentos | el benchmark los incluye automáticamente |
| Sustituir segmentos | se mide la nueva realidad |
| Reordenar segmentos | la identidad sigue siendo el ID |
| Cambiar número de palabras | muestreo recalculado |
| Cambiar idioma | sin cambio del motor |
| Cambiar UI/CSS | solo se actualiza el adaptador DOM |
| Cambiar de proyecto | nuevo config + mismo motor |

## 10. Qué NO debe hacer un proyecto futuro

No debe modificar el motor para:
- cambiar de 20 a 30 segmentos;
- cambiar IDs;
- acomodar otro idioma;
- acomodar otro audio;
- seleccionar un segmento concreto;
- cambiar el número de palabras;
- introducir un nuevo nombre de componente visual.

Esos cambios deben resolverse en:
1. datos;
2. configuración;
3. adaptador DOM.

## 11. Configuración de referencia

El proyecto de referencia utiliza:

`scripts/sync-benchmark.config.json`

El motor universal se encuentra en:

`scripts/lib/sync-benchmark.js`

El benchmark offline universal se encuentra en:

`scripts/benchmark_sync_timing.py`

La prueba Playwright consume el contrato y la configuración, mientras conserva pruebas visuales específicas de OGP fuera del núcleo de sincronización.

## 12. B1 de Otro Gran Programa

Los números publicados en:

`docs/evidence/F4-BASELINE-BENCHMARK-20261007.md`

son una **línea de base de este proyecto**, no un estándar universal.

El estándar universal es este contrato.

Por tanto, un proyecto futuro tendrá:
- su propio baseline B1;
- los mismos indicadores;
- el mismo motor;
- distinta matriz numérica.

## 13. Regla de evolución

La evolución correcta es:

**Proyecto nuevo/cambio de contenido → generar timing → adaptar config/DOM → ejecutar benchmark → obtener baseline → iterar.**

No:

**cambiar proyecto → reescribir benchmark.**

## 14. Resultado arquitectónico

El benchmark queda definido como una **pieza metodológica reutilizable**, y Otro Gran Programa pasa a ser únicamente una implementación de referencia del contrato.

**URL canónica:** https://github.com/SeryMente/otrobuenprograma
