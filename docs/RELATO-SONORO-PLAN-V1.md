# Otro Gran Programa — plan de ejecución del relato sonoro

## Criterio rector

Este documento consolida como trabajo propio todo lo que quedó encargado en la conversación de referencia. La conversación es el contexto; este plan es la unidad operativa. Ninguna etapa se considera terminada por intención: debe existir evidencia en repositorio y, cuando corresponda, evidencia de producción.

## Arquitectura fija

- 5 Fases narrativas.
- 20 segmentos exactos.
- Regla editorial: 1 segmento = 1 idea central.
- La transcripción es el contenido primario.
- El elemento visual y el contexto editorial son complementarios.
- El MP3 original de 23:11 permanece intacto como máster.
- Se generarán 20 archivos de audio independientes, uno por segmento.
- La sincronización debe provenir de alineamiento fonético; no se acepta sincronización proporcional.
- El roadmap representa Fase → Segmento y permite saltos anteriores/posteriores.
- El audio gobierna el estado de fase, segmento, palabra, visual y desplazamiento.

## Fase 1 — Limpieza estructural y cimentación editorial

### F1.1 Limpieza de la entrada
Eliminar la portada/hero antigua y el reproductor antiguo que aparecían antes del relato sonoro.

### F1.2 Limpieza de navegación heredada
Eliminar PULSO, “Por que existe esto, y por que asi”, “En lugar de pedir, preferimos preguntar” y los elementos de navegación que queden sin destino.

### F1.3 Reordenamiento de proyectos
Presentar “Otro Gran Programa” antes de Khora/la sección de la prótesis.

### F1.4 Normalización nominal
Adoptar “Otro Gran Programa” como denominación visible del proyecto, manteniendo intactos los identificadores técnicos del repositorio.

### F1.5 Modelo editorial
Congelar 5 Fases × 20 segmentos y documentar la idea única de cada segmento.

### Gate de endurecimiento de Fase 1
Debe comprobarse: no existen los IDs/entradas eliminados; “Otro Gran Programa” precede a la sección de Khora; la página no conserva navegación rota; el modelo 5×20 está registrado; el máster de audio no ha sido alterado.

## Fase 2 — Verdad de contenido y audio

### F2.1 Transcripción maestra
Reconstruir la transcripción completa contra el MP3 real, sin omisiones y sin alterar el significado.

### F2.2 QC-1: fidelidad al audio
Buscar omisiones, sustituciones, añadidos, nombres, números, negaciones, conectores y fragmentos perdidos.

### F2.3 QC-2: calidad lingüística
Corregir ortografía, puntuación, sintaxis, concordancia, mayúsculas y estructura sin reescribir el pensamiento.

### F2.4 QC-3: auditoría adversarial
Volver a cuestionar el texto bloque por bloque y documentar toda incertidumbre en vez de inventar.

### F2.5 Segmentación semántica
Asignar la transcripción maestra a los 20 segmentos y localizar exactamente los puntos de corte en el audio.

### F2.6 Cortes físicos
Generar 20 MP3 derivados a partir del máster y comprobar que su reproducción consecutiva reconstruye el original sin pérdidas ni duplicaciones.

### Gate de Fase 2
Transcripción QC-3 aprobada + 20 segmentos con límites de audio + 20 archivos reproducibles + correspondencia 1:1 entre segmento, texto y archivo.

## Fase 3 — Motor narrativo, sincronización y producción

### F3.1 Modelo de datos definitivo
Representar Fase, Segmento, audio local/absoluto, transcripción, palabra, timestamps, visual y navegación.

### F3.2 Alineamiento exacto
Generar start/end reales por palabra sobre cada audio segmentado y publicar los datos de timing.

### F3.3 Motor audiovisual
Hacer que audio → palabra → segmento → Fase → visual → scroll sean una cadena única y consistente.

### F3.4 Roadmap
Sustituir el navegador antiguo por un roadmap jerárquico de 5 Fases y 20 segmentos, navegable en ambas direcciones.

### F3.5 Diseño de 20 segmentos
Mantener la transcripción como contenido primario; distribuir aproximadamente 10–12 composiciones maestras visuales, transformadas semánticamente cuando corresponda.

### F3.6 Sustitución del sistema viejo
Eliminar la coexistencia entre relato viejo y relato nuevo. La experiencia narrativa debe ocupar realmente el lugar previsto y no ser una segunda capa paralela.

### F3.7 Responsive y accesibilidad
Cerrar móvil, autoplay bloqueado por navegador, controles, teclado, focus, contraste, reduced-motion y ausencia de overflow.

### F3.8 Rendimiento
Carga bajo demanda, precarga racional del siguiente segmento y optimización de visuales.

### F3.9 QA integral
Auditar audio, sincronización, navegación, roadmap, visuales, responsive, continuidad y regresión del resto del sitio.

### F3.10 Producción
Desplegar en main/GitHub Pages y verificar la experiencia pública real.

## Estado

- Fase 1: ejecutada y endurecida en la base estructural.
- Fase 2: pendiente.
- Fase 3: pendiente.

## Regla de cierre

No se declarará la experiencia terminada mientras exista sincronización estimada, transcripción no auditada, audio no segmentado, duplicación de motores o divergencia entre repositorio y producción.
