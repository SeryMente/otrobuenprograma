# Otro Gran Programa — plan maestro de ejecución del relato sonoro v1.2

## Propósito
Este documento convierte en especificación operativa la totalidad del trabajo encargado en la conversación original, incluidos los hallazgos de la revisión inicial del resultado real. La conversación deja de ser necesaria como memoria de alcance: este documento es el registro de trazabilidad. Ninguna tarea se considera terminada por intención; debe existir evidencia de implementación, pruebas y, cuando corresponda, producción.

## Arquitectura definitiva no negociable
1. 5 Fases narrativas.
2. 20 segmentos exactos.
3. Regla: 1 segmento = 1 idea central.
4. La transcripción es el contenido primario.
5. Visual, ilustración, animación y contexto son contenido complementario.
6. El MP3 original de 23:11 permanece intacto como máster.
7. El máster se divide físicamente en 20 audios independientes.
8. Cada segmento conserva timestamps absolutos respecto al máster y timestamps locales respecto a su audio.
9. La sincronización de palabras será resultado de alineamiento fonético/forced alignment real; no se acepta sincronización proporcional.
10. El audio es el reloj maestro de palabra, segmento, Fase, visual y seguimiento de pantalla.
11. El roadmap sustituye al navegador narrativo anterior y representa Fase → Segmento.
12. Debe poder avanzar, retroceder y saltar directamente a segmentos/fases.
13. La experiencia debe funcionar como HTML/CSS/JS nativo, sin React, backend nuevo ni video como sustituto del relato.
14. Móvil es prioridad de diseño y comportamiento.
15. El intento de autoplay debe respetar las restricciones del navegador y proporcionar primer toque cuando sea necesario.
16. Se conserva el fallback de Vocaroo como respaldo, pero el MP3 de GitHub Pages es la fuente canónica.
17. La experiencia no debe rehacer innecesariamente el contenido inferior del sitio que no forma parte del relato.
18. El resultado final debe publicarse sobre main/GitHub Pages y validarse contra producción, incluyendo problemas de caché.

## Fase 1 — Limpieza estructural, control de alcance y cimentación
### F1.1 Inventario de arquitectura previa
Registrar como línea base los sistemas que coexistían: hero antiguo, reproductor antiguo, navegación antigua, relato nuevo y contenido inferior. El objetivo es poder demostrar qué se elimina y qué se conserva.
### F1.2 Limpieza de entrada
Eliminar el hero y reproductor narrativo heredados que abrían el sitio antes del relato nuevo.
### F1.3 Limpieza de navegación heredada
Eliminar PULSO y la sección «Por que existe esto, y por que asi», «En lugar de pedir, preferimos preguntar», enlaces asociados y cualquier referencia huérfana.
### F1.4 Reordenamiento
Colocar Otro Gran Programa antes de la sección de Khora/la prótesis cognitiva.
### F1.5 Normalización nominal
Adoptar «Otro Gran Programa» como denominación visible y consistente. Mantener los IDs/rutas técnicos existentes solo cuando su cambio no sea necesario para la función.
### F1.6 Protección de alcance
Verificar explícitamente que la limpieza no elimina accidentalmente Cuentas, Autor, Fundamentos, contenido de Khora ni otras secciones que no fueron solicitadas para eliminación.
### F1.7 Base narrativa
Congelar 5 Fases × 20 segmentos, con título e idea única por segmento, como contrato editorial de las etapas posteriores.
### F1.8 Base de datos y trazabilidad
Conservar en repositorio un artefacto canónico que relacione Fase → Segmento → idea y otro documento con el plan completo y sus gates.
### F1.9 Baseline técnico
Registrar que el estado anterior tenía 10 escenas, un único MP3, timing proporcional y un archivo de timing exacto ausente. Registrar también que el MP3 definitivo identificado en el trabajo previo dura 23:11 y tenía 16,695,648 bytes. Esto no es una tarea a conservar: es una condición de partida verificable.

### F1.10 Integridad de fuentes de audio
Conservar como regla de ingestión que no se concatenarán fuentes aparentemente distintas sin comprobar identidad binaria. El trabajo previo detectó dos archivos WEBM/WEBa idénticos y truncados aproximadamente a 1:59; fueron descartados como fuentes maestras. Cualquier fuente que no pueda demostrar continuidad y completitud se considera no válida.

### F1.11 Endurecimiento de Fase 1
Aplicar una auditoría independiente que compruebe simultáneamente: ausencia real de los bloques eliminados; ausencia de enlaces huérfanos hacia ellos; orden Otro Gran Programa → Khora; ausencia del reproductor viejo; coherencia de la navegación restante; consistencia de nombre; presencia del relato nuevo; presencia del contenido inferior no solicitado; existencia del artefacto 5×20; integridad del MP3 máster.
### Gate Fase 1
Fase 1 solo se aprueba cuando todos los controles anteriores pasan y la matriz de trazabilidad cubre todas las decisiones y hallazgos operativos heredados del trabajo original. La aprobación no implica que el relato narrativo esté terminado.

## Fase 2 — Verdad editorial, segmentación semántica y audio físico
### F2.1 Transcripción maestra contra el MP3 real
Usar exclusivamente el MP3 maestro validado en F1.10 como fuente sonora canónica.
Reconstruir el relato completo desde el audio de 23:11. El texto actual es borrador de comparación, no fuente de verdad.
### F2.2 QC-1 — Fidelidad
Buscar y corregir omisiones, sustituciones, añadidos, frases incompletas, repeticiones, nombres, números, términos técnicos, negaciones, conectores y partículas pequeñas.
### F2.3 QC-2 — Calidad lingüística
Corregir ortografía, acentuación, puntuación, sintaxis, concordancia, nombres propios, mayúsculas y estructura. No modificar la intención ni el significado.
### F2.4 QC-3 — Auditoría adversarial
Intentar romper la transcripción por bloques consecutivos, buscando falsos positivos plausibles. Marcar incertidumbre cuando el audio no permita certeza.
### F2.5 Control editorial semántico
Distinguir explícitamente testimonio personal, interpretación o tesis del autor y datos históricos verificables. No inventar hechos, estadísticas, categorías, tiempos o referencias.
### F2.6 Verificación del nombre
Resolver contra el audio cualquier discrepancia entre «Buen» y «Gran». La marca visible ya queda definida como Otro Gran Programa; la evidencia sonora debe determinar la transcripción correcta.
### F2.7 Segmentación 5×20
Asignar la transcripción maestra a los 20 segmentos sin forzar cortes por longitud. Cada segmento tendrá exactamente una idea central.
### F2.8 Límites de audio
Localizar en el máster los puntos exactos de inicio y fin de cada segmento, conservando pausas narrativas pertinentes y evitando cortes en palabras.
### F2.9 Generación de 20 audios
Crear 20 MP3 derivados del máster, sin modificar el máster.
### F2.10 QC de archivos
Comprobar existencia, reproducción, duración, inicio/fin y correspondencia con metadata.
### F2.11 QC de continuidad
Reproducir 01→20 y demostrar que los 20 segmentos reconstruyen el máster sin omisiones ni duplicaciones, salvo silencios técnicos documentados.
### Gate Fase 2
Transcripción QC-3 aprobada + 20 segmentos validados + 20 audios válidos + continuidad comprobada + metadata coherente.

## Fase 3 — Sincronización exacta, motor narrativo, UX, QA y producción
### F3.1 Modelo de datos definitivo
Representar Fase, Segmento, título, idea, audio local, audio máster, masterStart, masterEnd, transcript, words[], visual, contexto y navegación.
### F3.2 Alineamiento fonético real
Generar start/end reales por palabra a partir del audio. Eliminar la dependencia operativa del algoritmo proporcional.
### F3.3 Datos de timing
Publicar el artefacto canónico de timing palabra por palabra y validarlo contra la duración y el conteo reales.
### F3.4 Motor de reproducción segmentada
El reproductor debe operar sobre los 20 archivos independientes, permitiendo sustitución futura de un segmento sin reconstruir el relato completo.
### F3.5 Motor de estado narrativo
Implementar la cadena única audio → palabra → segmento → Fase → visual → scroll.
### F3.6 Navegación por palabra
Click/tap sobre una palabra debe llevar al punto temporal correspondiente del segmento correcto.
### F3.7 Roadmap
Construir el roadmap jerárquico de 5 Fases × 20 segmentos. Debe reflejar reproducción, navegación manual, cambios de fase y posición actual.
### F3.8 Autoavance y retroceso
Al terminar un segmento, cargar el siguiente. Anterior/siguiente deben respetar la segmentación física.
### F3.9 Scroll y control del usuario
El seguimiento automático debe acompañar la narración sin luchar contra el scroll manual. Cuando el usuario interviene, el modo de seguimiento debe poder ceder y reanudarse explícitamente.
### F3.10 Diseño de las 20 unidades
La concepción inicial identificó 24 estaciones semánticas, pero se decidió expresamente no convertir esas 24 estaciones en 24 ilustraciones. El sistema final trabajará con 20 segmentos y aproximadamente 10–12 composiciones visuales maestras, capaces de transformarse según el sentido narrativo.
Mantener una sola idea por segmento. Las composiciones visuales pueden reutilizarse/transicionarse y deben permanecer aproximadamente en el orden de 10–12 composiciones maestras, no una ilustración obligatoria por segmento.
### F3.11 Jerarquía de presentación
En escritorio, la composición conceptual es transcripción | línea/nodo | visual/contexto. Las palabras ya escuchadas deben permanecer visibles pero atenuadas y la palabra activa debe destacar. En móvil, la composición se transforma a una sola columna sin perder la jerarquía textual.

### F3.12 Jerarquía visual
La transcripción debe ser el contenido principal; imagen/animación/contexto no deben sustituir ni resumir la voz.
### F3.13 Responsive móvil
Una sola columna; controles suficientemente grandes; sin overflow horizontal; roadmap compacto; imágenes adaptadas; viewport inicial limpio.
### F3.14 Autoplay y fallback
Intentar autoplay cuando sea permitido; ante bloqueo del navegador, primer toque explícito. Mantener fallback de Vocaroo sin competir con la fuente canónica.
### F3.15 Resolver hallazgos iniciales de interfaz
Eliminar estados inconsistentes como «Audio en preparación» cuando el audio ya está disponible; impedir que overlays de instalación/PWA tapen el contenido inicial; eliminar señales de coexistencia entre reproductores.
### F3.16 Accesibilidad
Teclado, focus visible, contraste, controles semánticos, lectores de pantalla, reduced-motion y transcripción navegable.
### F3.17 Rendimiento
Carga bajo demanda de audios, precarga racional del siguiente, optimización de SVG/recursos y prevención de descargas innecesarias.
### F3.18 Unificación definitiva
Eliminar cualquier implementación narrativa antigua que todavía compita con el motor definitivo. Debe existir una sola experiencia narrativa.
### F3.19 Auditoría integral
QC de audio, sincronización, continuidad, navegación, roadmap, palabra, segmento, Fase, visual, scroll, responsive, accesibilidad y regresión del contenido no narrativo.
### F3.20 Producción
Publicar en main/GitHub Pages y verificar que los recursos públicos correspondan a main.
### F3.21 Control de caché/divergencia
Comparar hashes, contenido y comportamiento de producción para detectar versiones cacheadas o divergencias entre repo y página pública. No aceptar una página cacheada como evidencia del estado del repositorio.
### F3.22 Cierre creativo
Pulir composición, jerarquía, ritmo, tipografía, animaciones semánticas y transición entre segmentos después de que la verdad editorial y temporal esté certificada.
### Gate Fase 3
Solo se considera terminado cuando la producción pública demuestra la cadena completa y ya no existen timing proporcional, duplicación de motores, inconsistencias de audio, navegación rota ni divergencia no explicada entre main y producción.

## Registro explícito de hallazgos de la revisión inicial
| Hallazgo inicial | Destino |
|---|---|
| Hero viejo coexistía con relato nuevo | F1.2 / F3.17 |
| Reproductor viejo coexistía con nuevo | F1.2 / F3.14 / F3.17 |
| Relato nuevo estaba añadido, no sustituía estructuralmente al hero | F1.2 / F3.17 |
| Había solo 10 escenas, no 20 segmentos | F1.7 / F2.7 |
| timing era estimated-text-sync | F2.1–F2.6 / F3.2 |
| story-word-timing.json no existía | F3.3 |
| El motor tenía fallback proporcional | F3.2 |
| El audio real de 23:11 sí estaba disponible | F1.9 / F2.1 |
| Había un estado de audio inconsistente | F3.14 |
| Un overlay/PWA podía invadir el primer viewport móvil | F3.14 |
| Móvil debía ser prioridad | F3.12 |
| Las palabras debían ser navegables | F3.6 |
| El seguimiento automático debía ceder al control manual | F3.9 |
| El sistema visual partía de 24 estaciones conceptuales pero debía condensarse en aproximadamente 10–12 composiciones maestras | F3.10 |
| La transcripción debía ser contenido primario | F3.11 |
| El roadmap debía ser Fase → Segmento | F3.7 |
| El audio debía actuar como reloj maestro | F3.5 |
| Vocaroo debía mantenerse como fallback | F3.13 |
| El resto del sitio no debía rehacerse innecesariamente | F1.6 |
| Producción podía diferir por caché | F3.20–F3.21 |
| Duplicación arquitectónica detectada | F1.1 / F3.18 |
| La revisión inicial distinguió diseño bueno de producción incompleta | Gates de las tres fases |

## Registro del plan original de 16 ámbitos
1. Arquitectura editorial → F1.
2. Transcripción maestra → F2.
3. Segmentación semántica → F2.
4. Cortes de audio → F2.
5. Sincronización palabra por palabra → F3.
6. Modelo de datos → F3.
7. Arquitectura de experiencia narrativa → F3.
8. Roadmap → F3.
9. Diseño visual → F3.
10. Scroll/timeline → F3.
11. Sustitución de arquitectura actual → F1 + F3.
12. Responsive/móvil → F3.
13. Accesibilidad → F3.
14. Rendimiento/carga → F3.
15. Control de calidad integral → F3.
16. Publicación/verificación en producción → F3.

## Estado tras endurecimiento de Fase 1
- Fase 1: aprobada y endurecida.
- Fase 2: pendiente.
- Fase 3: pendiente.

## Regla de cierre global
La experiencia no se declarará terminada mientras exista cualquier combinación de: transcripción no auditada; sincronización proporcional; audio no segmentado; roadmap no jerárquico; duplicación de motores; inconsistencia entre fuente canónica y producción; UI heredada no resuelta; contenido visual sustituyendo a la voz; regresiones del resto del sitio.

## Fuente de verdad
Repositorio: SeryMente/otrobuenprograma
Rama de trabajo/cierre: main
Máster sonoro: assets/audio/relato-obp-v015.mp3
Arquitectura canónica: assets/data/relato-obp-architecture-v1.json
Plan canónico: docs/RELATO-SONORO-PLAN-V1.md

## Estado de ejecución — 2026-10-05
La Fase 2 está dividida en dos estados de evidencia para no confundir segmentación editorial con alineamiento físico:

- **Completado:** segmentación semántica 5×20, preservando literalmente la transcripción canónica de `relato-obp-v015.json`; se generó `assets/data/relato-obp-phase2-editorial.json`. El nombre hablado “Otro Buen Programa” se conserva en la transcripción y el nombre visible es “Otro Gran Programa”.
- **Implementado para ejecución reproducible:** `scripts/execute_relato_phase2.py` y `.github/workflows/execute-relato-phase2.yml`, con verificación de bytes/duración/hash del máster, ASR contra el MP3 real, cortes físicos y QC.
- **Bloqueo de evidencia:** la certificación de transcripción contra audio, timestamps físicos y los 20 MP3 derivados todavía no puede marcarse como pasada porque las ejecuciones de ASR han sufrido dos fallos distintos: cola de runners de GitHub y la incompatibilidad de `faster-whisper 1.2.1` con PyAV 19. El pipeline ya quedó corregido fijando `av<19`.
- **No permitido:** convertir el timing proporcional anterior en sustituto del alineamiento físico. Mientras el máster no haya sido transcrito/verificado y cortado sobre sus timestamps reales, Fase 2 no se considera cerrada.
