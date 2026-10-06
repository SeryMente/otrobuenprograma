# OGP / Fase 3 â€” Plan de actualizaciÃ³n mÃ³vil
## v1.6.0 Â· Experiencia mÃ³vil: navegaciÃ³n mÃ­nima, roadmap persistente y arranque sonoro

**Ciclo:** C20261006-1606
**Proyecto:** Otro Buen Programa (OGP)
**ConversaciÃ³n:** CONV-F3-3
**Base canÃ³nica:** v1.5.11 Â· `909d23d98881867f1361d78c253272f75ae6eb6f`
**Base remota:** `main` de https://github.com/SeryMente/otrobuenprograma
**Estado de este documento:** PLANIFICACIÃ“N â€” sin cambios de cÃ³digo
**VersiÃ³n objetivo:** v1.6.0
**PropÃ³sito del ciclo:** corregir la composiciÃ³n mÃ³vil y la entrada a la experiencia sin volver a introducir ruido, redundancia ni superficies de interfaz no solicitadas.

---

## 1. DecisiÃ³n de alcance

Este ciclo NO es una nueva fase narrativa ni una ampliaciÃ³n funcional del producto.

Se modifica Ãºnicamente la experiencia de entrada y consumo en dispositivos mÃ³viles, ademÃ¡s de la jerarquÃ­a textual comÃºn del hero.

Queda fuera de alcance:
- backend, Supabase, OAuth, chat humano, IA y nuevas fuentes de datos;
- cambios al contenido narrativo de los 20 segmentos;
- modificaciÃ³n de la sincronizaciÃ³n palabra-voz certificada;
- rediseÃ±o del layout desktop del relato;
- recuperaciÃ³n de Glosa;
- aviso o flujo automÃ¡tico de instalaciÃ³n PWA.

El criterio rector serÃ¡: **menos interfaz visible, mÃ¡s experiencia, cero elementos compitiendo con la voz y el relato.**

---

## 2. Estado real de partida

La rama local fue llevada por fast-forward hasta el `origin/main` real antes de redactar este plan.

Estado verificado:
- `main` remoto = `909d23d...`;
- working tree limpio;
- versiÃ³n publicada por el Ãºltimo commit: v1.5.11;
- el cierre anterior resolviÃ³ el delta visual mÃ³vil de portada;
- `story-v3.js` monta el reproductor, los 20 segmentos, transcripciÃ³n palabra-a-palabra y arte contextual;
- `story-v3.css` mantiene composiciÃ³n desktop de tres columnas y composiciÃ³n mÃ³vil de dos columnas;
- `navigator.js` aÃºn crea la pÃ­ldora de navegaciÃ³n inferior en mÃ³vil;
- `glosa.js` continÃºa cargado en la superficie pÃºblica;
- el autoplay mÃ³vil ya se intenta, pero hoy depende de `play()` y conserva un fallback visible cuando el navegador lo bloquea;
- el hero todavÃ­a duplica el nombre del proyecto y conserva la nomenclatura Â«Iniciativa de Bienestar SocialÂ».

La documentaciÃ³n histÃ³rica de roadmap confirma que existieron varios intentos de rail mÃ³vil; el nuevo diseÃ±o NO debe resucitar esos modelos completos.

---

## 3. Contrato visual objetivo

### 3.1 Encabezado mÃ³vil

En mÃ³vil, el encabezado debe ser una sola pieza compacta:

**Otro Gran Programa Â· Proyectos Â· Cuentas Â· Autor**

No habrÃ¡ una marca separada ocupando una zona propia.

CaracterÃ­sticas:
- una sola fila;
- altura mÃ­nima razonable;
- tipografÃ­a y paddings compactos;
- el nombre funciona como marca/enlace;
- los tres destinos permanecen en la misma barra;
- no debe empujar verticalmente el hero;
- la barra conserva contraste y legibilidad sin convertirse en protagonista.

En el estado superior de la pÃ¡gina, esta barra es visible.

En cuanto el usuario abandone la posiciÃ³n superior:
- la barra completa sale del flujo visual;
- aparece un activador diminuto y discreto;
- el activador debe ocupar aproximadamente el mÃ­nimo Ã¡rea tÃ¡ctil compatible con accesibilidad, aunque su marca visual sea casi invisible;
- el activador queda fijo en un borde seguro y no interfiere con el roadmap.

---

## 4. NavegaciÃ³n mÃ³vil colapsada

El activador abre una capa de navegaciÃ³n de pantalla completa.

La capa contendrÃ¡ Ãºnicamente:
- Proyectos;
- Cuentas;
- Autor;
- un botÃ³n `Ã—` para cerrar.

Comportamiento:
- apertura inmediata al toque;
- bloqueo del scroll del documento mientras la capa estÃ¡ abierta;
- cierre mediante `Ã—`;
- cierre mediante `Escape` cuando exista teclado;
- tocar un destino cierra la capa y navega a la secciÃ³n;
- foco accesible en apertura/cierre;
- transiciÃ³n muy breve y sobria;
- sin logo duplicado, sin copy explicativo y sin controles adicionales.

La barra mÃ³vil NO reaparecerÃ¡ durante scroll intermedio salvo cuando el usuario vuelva al estado superior definido por el diseÃ±o.

Esto sustituye la pÃ­ldora mÃ³vil actualmente generada por `navigator.js`.

**Fase tÃ©cnica de implementaciÃ³n:** https://github.com/SeryMente/otrobuenprograma

---

## 5. Ficha del autor

La tarjeta seguirÃ¡ siendo compacta, elegante y centrada.

Orden canÃ³nico:
1. fotografÃ­a;
2. nombre;
3. lema: Â«Patria pendiente, lo que deviene aÃºn.Â»;
4. Â«Desarrollador independienteÂ»;
5. Â«IntÃ©rprete mÃ©dico / Traductor (espaÃ±ol-inglÃ©s)Â»;
6. formaciÃ³n: Â«Estudiante de IngenierÃ­a, Seguridad de la InformaciÃ³n Â· Universidad AutÃ³noma de Guadalajara Â· MatrÃ­cula [dato pendiente]Â»;
7. correo;
8. telÃ©fono.

No se mostrarÃ¡ la palabra Â«oficioÂ» como etiqueta editorial.

La lÃ­nea profesional del intÃ©rprete deberÃ¡ dejar de verse como una etiqueta tÃ©cnica y pasar a una composiciÃ³n tipogrÃ¡fica cercana a una firma: serif, ritmo corto, espaciado y jerarquÃ­a discreta.

La informaciÃ³n debe conservarse compacta para no consumir altura innecesaria.

**Dato pendiente:** matrÃ­cula de la Universidad AutÃ³noma de Guadalajara. Se incorpora en la fase de implementaciÃ³n cuando sea proporcionada.

---

## 6. FotografÃ­a del autor

Objetivo visual:
- retrato claramente mÃ¡s vertical que el actual;
- rostro centrado sobre el eje visual;
- hombro visible;
- brazo/mano derecha visible hasta el lÃ­mite natural solicitado;
- un poco de margen adicional en ambos lados;
- menos anchura relativa y mayor aprovechamiento de altura;
- sin deformaciÃ³n;
- sin cortar la parte superior de la cabeza;
- sin dejar demasiado espacio muerto.

Estrategia:
- contenedor vertical independiente del ancho del dispositivo;
- `object-fit: cover`;
- `object-position` ajustado por evidencia visual, no por intuiciÃ³n;
- relaciÃ³n inicial de trabajo cercana a 2:3;
- tamaÃ±o expresado con `clamp()`, sin valores que dependan de un telÃ©fono concreto;
- QA visual especÃ­fico en 320, 360, 390, 412, 430 y 540 px.

No se generarÃ¡ una nueva imagen: se trabajarÃ¡ sobre el recurso fotogrÃ¡fico pÃºblico existente.

**Fase tÃ©cnica de implementaciÃ³n:** https://github.com/SeryMente/otrobuenprograma
## 7. Identidad del sitio y eliminaciÃ³n de redundancias

La entrada debe dejar de decir:

Â«Otro Gran Programa â€” Iniciativa de Bienestar SocialÂ»

y pasar a:

**Otro Gran Programa, una propuesta**

Reglas:
- Â«Otro Gran Programa, una propuestaÂ» es el tÃ­tulo visual del hero;
- debe permanecer en una sola lÃ­nea en cualquier ancho mÃ³vil razonable;
- se utilizarÃ¡ una estrategia CSS-first de reducciÃ³n fluida de tamaÃ±o;
- un pequeÃ±o ajuste JS de fit-to-width solo actuarÃ¡ como guardarraÃ­l para extremos que no quepan;
- el tÃ­tulo queda centrado;
- no habrÃ¡ kicker previo que repita Â«OTRO GRAN PROGRAMAÂ»;
- desaparece la segunda menciÃ³n Â«Iniciativa de Bienestar SocialÂ» del tÃ­tulo;
- el subtÃ­tulo exacto serÃ¡:

Â«una iniciativa para revolucionar la manera en la que aliviaremos la disfunciÃ³n familiar para nuestros hijos y sus hijos tambiÃ©n.Â»

TambiÃ©n se actualizarÃ¡n:
- <title>;
- meta description;
- og:title;
- og:description.

No debe quedar una frase vieja competidora en la portada.

---

## 8. Arquitectura mÃ³vil del relato

La experiencia mÃ³vil conservarÃ¡ el principio actual:

**transcripciÃ³n primero + contenido complementario despuÃ©s**, en disposiciÃ³n vertical.

No se alterarÃ¡ el modelo de datos ni la secuencia de segmentos.

El cambio principal serÃ¡ estructural:
- el reproductor deja de ocupar una pieza grande dentro de la entrada;
- el primer bloque narrativo debe aparecer sin que el reproductor robe protagonismo;
- el transporte de audio pasa a una superficie compacta y persistente, independiente del flujo principal;
- la transcripciÃ³n continÃºa siendo el contenido primario;
- la ilustraciÃ³n y el contexto permanecen como contenido complementario;
- el autoavance y la sincronizaciÃ³n de palabras permanecen.

La implementaciÃ³n deberÃ¡ evitar que el transporte fijo tape:
- texto actual;
- controles de navegaciÃ³n;
- botones de segmento;
- roadmap;
- zonas de seguridad del telÃ©fono.

Se usarÃ¡n env(safe-area-inset-*) donde proceda.

**Fase tÃ©cnica:** https://github.com/SeryMente/otrobuenprograma

---

## 9. Roadmap mÃ³vil â€” diseÃ±o agnÃ³stico al ancho

Se descarta el modelo anterior de pÃ­ldora inferior y cualquier roadmap que consuma una columna completa.

Nuevo concepto: **micro-rail lateral persistente**.

CaracterÃ­sticas:
- posiciÃ³n fija en un borde del viewport;
- ancho visual aproximado de 12â€“18 px;
- una lÃ­nea vertical extremadamente delgada;
- cinco hitos principales, uno por fase;
- cuatro micro-marcas por fase para representar los 20 segmentos;
- segmento actual claramente diferenciado;
- progreso pasado visible sin texto voluminoso;
- objetivos tÃ¡ctiles mayores que su representaciÃ³n grÃ¡fica;
- sin depender del ancho disponible para el contenido;
- no participa del grid de la historia;
- puede superponerse al margen reservado del viewport sin comprimir la transcripciÃ³n;
- respeta safe areas;
- nunca queda debajo del reproductor;
- permanece visible mientras el relato estÃ¡ activo.

Modelo conceptual:

I  Â· Â· Â· Â·
â”‚
II Â· Â· Â· Â·
â”‚
III Â· Â· Â· Â·
â”‚
IV Â· Â· Â· Â·
â”‚
V Â· Â· Â· Â·

La representaciÃ³n visual real serÃ¡ mÃ¡s refinada y compacta que este esquema.

InteracciÃ³n:
- tocar un marcador lleva al primer segmento de la fase;
- tocar un micro-marcador lleva al segmento correspondiente;
- el estado activo se actualiza con el segmento que realmente reproduce el audio;
- al cambiar de segmento por palabra, anterior/siguiente o autoavance, el rail se actualiza;
- el rail no abre paneles adicionales;
- labels completos se reservan para accesibilidad y no para saturar la pantalla.

La fuente de verdad serÃ¡ relato-obp-phase3.json: sus campos phase + orden de id serÃ¡n suficientes para construir el rail.

No se duplicarÃ¡ manualmente el contenido de fases en HTML.

**Fase tÃ©cnica:** https://github.com/SeryMente/otrobuenprograma

---

## 10. EliminaciÃ³n de Glosa

Â«Lo del Glosa quÃ­taloÂ» se interpreta como retirada de la superficie pÃºblica.

Resultado requerido:
- ningÃºn .glosa-tab;
- ningÃºn pin Â«+ glosarÂ»;
- ningÃºn panel Glosa;
- ningÃºn texto de modo local relacionado con Glosa;
- ningÃºn elemento visual que reserve espacio para Glosa;
- ningÃºn desplazamiento o estado de la portada condicionado por Glosa.

DecisiÃ³n de conservaciÃ³n:
- no borrar el mÃ³dulo assets/js/glosa.js en este ciclo si no es necesario;
- simplemente dejar de cargarlo desde la superficie pÃºblica;
- los estilos que ya no tengan consumidor podrÃ¡n eliminarse posteriormente, pero no deben permanecer activos.

Esto minimiza riesgo y evita una eliminaciÃ³n irreversible de cÃ³digo legado.

---## 11. ReproducciÃ³n automÃ¡tica mÃ³vil

Objetivo UX:
**al abrir el sitio en mÃ³vil, la experiencia intenta comenzar por sÃ­ sola.**

Estrategia de mÃ¡xima agresividad compatible con la plataforma:
1. detectar contexto mÃ³vil;
2. montar inmediatamente el primer segmento;
3. usar preload=auto;
4. establecer la primera fuente sin demora;
5. marcar autoplay;
6. llamar a play() tan pronto como el elemento tenga una fuente vÃ¡lida;
7. intentar nuevamente en los eventos de ciclo de vida apropiados;
8. si el navegador rechaza el intento, conservar la experiencia cargada y lista;
9. capturar el primer gesto natural del usuario (pointerdown/toque) para reintentar automÃ¡ticamente;
10. mantener el botÃ³n de reproducciÃ³n como control de acceso directo, no como requisito inicial.

No se debe esperar al scroll para intentar el primer play().

No se debe depender de un temporizador arbitrario de 650 ms como condiciÃ³n funcional.

### LÃ­mite tÃ©cnico no evitable

Los navegadores pueden bloquear la reproducciÃ³n audible iniciada por script sin interacciÃ³n previa. audio.play() puede rechazar con NotAllowedError; no existe una API web capaz de obligar al navegador a ignorar esa polÃ­tica. Por ello, el contrato correcto de v1.6.0 serÃ¡:

**intento automÃ¡tico inmediato + recuperaciÃ³n silenciosa en el primer gesto natural + fallback mÃ­nimo cuando el bloqueo sea absoluto.**

No se falsearÃ¡ el estado diciendo que el audio estÃ¡ reproduciÃ©ndose cuando el navegador lo haya bloqueado.

La existencia del atributo autoplay tampoco debe tratarse como garantÃ­a: los agentes de usuario pueden ignorarlo.

**Fase tÃ©cnica:** https://github.com/SeryMente/otrobuenprograma

---

## 12. SeparaciÃ³n de estados mÃ³viles

Se definirÃ¡n tres estados explÃ­citos:

### A. Top / Landing
- topbar completa visible;
- autor + tÃ­tulo + subtÃ­tulo;
- micro-rail preparado sin competir con la portada;
- autoplay se intenta al montar la experiencia;
- sin Glosa.

### B. Experience / Scrolling
- topbar completa desaparecida;
- activador mÃ­nimo de navegaciÃ³n visible;
- menÃº del sitio no ocupa espacio;
- micro-rail visible continuamente;
- transporte de audio compacto;
- historia vertical en primer plano.

### C. Mobile Navigation Open
- overlay de pantalla completa;
- solo Proyectos / Cuentas / Autor + X;
- scroll del documento bloqueado;
- navegaciÃ³n accesible;
- cierre limpio y retorno al estado previo.

Estos estados se modelarÃ¡n explÃ­citamente para evitar que mÃºltiples listeners independientes produzcan comportamientos contradictorios.

---

## 13. Archivos candidatos a modificaciÃ³n

Conservando separaciÃ³n de responsabilidades:

**index.html**
- nuevo copy del hero;
- nueva composiciÃ³n semÃ¡ntica de navegaciÃ³n;
- eliminaciÃ³n de carga pÃºblica de Glosa;
- carga de nuevo controlador mÃ³vil si resulta necesario;
- versiÃ³n de assets.

**assets/css/story-v3.css**
- fotografÃ­a y ficha del autor;
- tÃ­tulo responsive;
- transporte mÃ³vil;
- micro-rail;
- estados mÃ³viles;
- safe areas.

**assets/js/story-v3.js**
- autoplay;
- recuperaciÃ³n por primer gesto;
- montaje y actualizaciÃ³n del micro-rail;
- desacoplamiento del reproductor;
- sincronizaciÃ³n del segmento activo.

**assets/js/navigator.js**
- conservar navegador desktop;
- retirar la pÃ­ldora inferior mÃ³vil;
- no duplicar la responsabilidad del menÃº superior.

**Nuevo mÃ³dulo candidato: assets/js/mobile-shell.js**
- estado top/scrolled;
- apertura/cierre del menÃº fullscreen;
- focus management;
- bloqueo de scroll;
- activador mÃ­nimo.

Se crearÃ¡ solo si reduce acoplamiento frente a meter toda la lÃ³gica en navigator.js.

**assets/css/additions.css**
- retirar reglas muertas de Glosa o mover estilos nuevos solo si resulta imprescindible.

**sw.js**
- nuevo namespace/version de cachÃ©.

**.github/workflows/quality.yml**
- actualizar contratos estÃ¡ticos;
- agregar comprobaciones especÃ­ficas de navegaciÃ³n mÃ³vil, roadmap y autoplay.

**scripts/qa_phase3.py**
- ampliar el gate estructural solo en lo que corresponda al contrato vigente.

---## 14. QA obligatorio antes de declarar terminado

### Estructural
- cero referencias pÃºblicas a Glosa activa;
- cero redundancias de tÃ­tulo;
- tÃ­tulo nuevo presente exactamente una vez como hero;
- subtÃ­tulo nuevo presente;
- matrÃ­cula pendiente claramente aislada hasta recibir el dato;
- story-v3.js conserva 20 segmentos;
- no se modifica el contenido narrativo.

### Responsive
Validar al menos:
- 240 Ã— 320;
- 320 Ã— 568;
- 360 Ã— 800;
- 390 Ã— 844;
- 412 Ã— 915;
- 430 Ã— 932;
- 540 Ã— 960;
- 768 Ã— 1024;
- portrait y landscape donde sea posible.

En todos:
- tÃ­tulo en una sola lÃ­nea;
- sin overflow horizontal;
- autor centrado;
- rostro correctamente encuadrado;
- informaciÃ³n legible;
- roadmap visible;
- menÃº no invade contenido;
- overlay de navegaciÃ³n ocupa pantalla;
- reproductor no tapa texto.

### Comportamiento
- carga directa mÃ³vil;
- carga mediante ruta QR;
- scroll inicial;
- primer segmento;
- cambio de segmento;
- anterior/siguiente;
- autoavance;
- click/toque en palabras;
- apertura/cierre del menÃº;
- retorno a arriba;
- rotaciÃ³n de orientaciÃ³n.

### Autoplay
Se probarÃ¡n dos condiciones:
1. navegador que permite autoplay;
2. navegador que lo bloquea.

La segunda no se considera un fallo del producto si:
- el intento se hace inmediatamente;
- se detecta el rechazo;
- la interfaz queda lista;
- el siguiente gesto natural permite iniciar;
- nunca se muestra un estado falso de reproducciÃ³n.

### Evidencia
No se aceptarÃ¡ Ãºnicamente una inspecciÃ³n del DOM.

La aceptaciÃ³n final requiere:
- capturas reales de viewport;
- ejecuciÃ³n Playwright;
- evidencia del estado del reproductor;
- evidencia del rail;
- evidencia del menÃº colapsado/expandido;
- evidencia de al menos un navegador mÃ³vil real cuando estÃ© disponible.

---

## 15. Gating del ciclo

No se modifica cÃ³digo productivo hasta que este documento sea considerado el plan de referencia del ciclo.

DespuÃ©s comenzarÃ¡ la implementaciÃ³n en este orden:
1. shell mÃ³vil y navegaciÃ³n;
2. composiciÃ³n del autor;
3. hero y copy;
4. micro-rail;
5. transporte del reproductor;
6. autoplay;
7. eliminaciÃ³n pÃºblica de Glosa;
8. cache-busting;
9. QA estructural;
10. QA visual y funcional;
11. revisiÃ³n final desktop para confirmar no-regresiÃ³n.

Cada etapa deberÃ¡ producir evidencia antes de continuar con la siguiente cuando una modificaciÃ³n pueda afectar la anterior.

**Fase tÃ©cnica:** https://github.com/SeryMente/otrobuenprograma

---

## 16. Criterio de salida v1.6.0

La actualizaciÃ³n se podrÃ¡ considerar lista cuando:
- la barra superior mÃ³vil sea una sola pieza fina;
- al hacer scroll desaparezca y deje Ãºnicamente un activador mÃ­nimo;
- el activador abra el menÃº fullscreen y X lo cierre;
- la ficha del autor tenga la jerarquÃ­a solicitada y fotografÃ­a vertical centrada;
- la matrÃ­cula estÃ© incorporada sin romper la composiciÃ³n;
- el hero diga Â«Otro Gran Programa, una propuestaÂ» en una sola lÃ­nea;
- el subtÃ­tulo sea exactamente el solicitado;
- no exista Glosa pÃºblica;
- el relato conserve su lectura vertical;
- exista un micro-rail lateral persistente y tÃ¡ctil;
- el rail represente las 5 fases y 20 segmentos sin ocupar una columna de contenido;
- el reproductor no domine el primer viewport;
- el sistema intente autoplay inmediatamente en mÃ³vil;
- los bloqueos del navegador se gestionen sin estados falsos;
- no haya clipping ni overflow en los anchos de prueba;
- desktop permanezca funcional y visualmente estable;
- el Service Worker no sirva una ediciÃ³n anterior;
- todos los gates automatizados y visuales pasen.

---

## 17. Registro de decisiones

**D1.** La navegaciÃ³n mÃ³vil superior y el roadmap son problemas distintos y tendrÃ¡n controladores distintos.

**D2.** El roadmap serÃ¡ una capa superpuesta de micro-rail, no una columna de contenido responsive.

**D3.** La fuente de verdad del rail serÃ¡ el JSON narrativo; no se duplicarÃ¡n fases/segmentos manualmente.

**D4.** Glosa desaparece de la superficie pÃºblica, pero el archivo legado no se elimina preventivamente.

**D5.** Autoplay serÃ¡ best effort agresivo, nunca una promesa tÃ©cnicamente imposible.

**D6.** El primer gesto natural serÃ¡ utilizado como mecanismo silencioso de recuperaciÃ³n cuando exista bloqueo.

**D7.** El tÃ­tulo tendrÃ¡ una estrategia de ajuste de ancho para garantizar una sola lÃ­nea.

**D8.** La fotografÃ­a se ajustarÃ¡ mediante evidencia visual, especialmente object-position, y no solo mediante proporciones teÃ³ricas.

**D9.** No se modificarÃ¡ el contenido del relato para solucionar problemas de presentaciÃ³n.

**D10.** v1.5.11 permanece como versiÃ³n vigente hasta que el ciclo completo sea implementado y aceptado.

---

## 18. Dato de autor confirmado

La matrÃ­cula de la Universidad AutÃ³noma de Guadalajara fue localizada y contrastada en Notion.

**MatrÃ­cula:** 5125461

Fuentes de contraste: Oficio CECEQ / VHT-CECEQ / 2026-05 y Espejo vital / situaciÃ³n actual.

---

## 19. Estado final del ciclo de planificaciÃ³n

**PLAN LISTO.**

No se han modificado archivos productivos para implementar la actualizaciÃ³n.

El Ãºnico cambio persistente del ciclo de planificaciÃ³n es este documento, que servirÃ¡ como referencia canÃ³nica para la ejecuciÃ³n posterior.

## Referencia tÃ©cnica del repositorio

Repositorio: https://github.com/SeryMente/otrobuenprograma
Base verificada: main @ 909d23d98881867f1361d78c253272f75ae6eb6f
VersiÃ³n de partida: v1.5.11
VersiÃ³n objetivo: v1.6.0


## 20. Endurecimiento H1 — invariantes operativas

Este bloque prevalece sobre cualquier redacción anterior menos precisa. No amplía el alcance funcional.

**H1-01 · Estado de navegación.** La barra completa existe solo en TOP (`scrollY <= 8px`). Desde `scrollY > 8px`, la barra completa no vuelve a aparecer hasta regresar a TOP. El activador mínimo ocupa su lugar.

**H1-02 · Activador.** La representación gráfica puede ser casi invisible, pero el objetivo táctil será de al menos 44×44 px y tendrá `aria-label` claro. Discreto no significa inaccesible.

**H1-03 · Overlay.** Al abrir el menú móvil se bloquea el scroll del documento, se conserva un foco controlado dentro de la capa y se restaura el foco al activador al cerrar. Proyectos/Cuentas/Autor son las únicas opciones; `×` es el único control adicional.

**H1-04 · Exclusión de capas.** Mientras el menú está abierto, el rail y el transporte no reciben interacción. Al cerrar, recuperan exactamente su estado anterior; no se reinicia el relato.

**H1-05 · Rail independiente.** El micro-rail no participa en el grid ni modifica el ancho calculado de `.story-copy` o `.story-art`. Su geometría depende del viewport y de las safe areas, no de la capacidad horizontal restante del relato.

**H1-06 · Rail determinista.** Los segmentos 01–20 se asignan a las fases I–V de cuatro segmentos cada una. No se crea una segunda lista manual de fases o segmentos. El motor narrativo mantiene una única variable de segmento activo.

**H1-07 · Rail táctil.** Cada marcador visible podrá recibir toque dentro de un objetivo mínimo accesible, pero el dibujo seguirá ocupando solo una franja visual estrecha. El objetivo táctil no puede convertir el rail en una columna visual.

**H1-08 · Transporte.** El reproductor móvil debe tener una única posición fija/pegajosa definida. No habrá dos barras de audio competidoras. Sus coordenadas y z-index deben dejar libre texto, rail y safe areas.

**H1-09 · Hero.** El título debe permanecer en una sola línea. La aceptación no será visual subjetiva: en cada viewport de prueba, el título y su contenedor deben satisfacer `scrollWidth <= clientWidth`. No se permite ocultar texto ni truncarlo para cumplirlo.

**H1-10 · Fotografía.** El encuadre se valida sobre la imagen real. No se admite una solución que dependa de un ancho único ni que desplace el rostro fuera del eje central al cambiar de viewport.

**H1-11 · Glosa.** La retirada pública se comprueba por doble gate: ausencia de carga del módulo y ausencia de cualquier tab/pin/panel en el DOM ejecutado.

**H1-12 · Matrícula.** El dato confirmado para la ficha del autor es 5125461. No queda como placeholder.

---

## 21. Endurecimiento H1 — contrato de autoplay

El objetivo operativo es maximizar la probabilidad de iniciar la experiencia sin gesto, no fingir una capacidad que depende del navegador.

Secuencia obligatoria:
1. montar el primer segmento inmediatamente;
2. asignar la fuente y solicitar carga;
3. establecer `autoplay = true` antes del primer intento;
4. llamar `play()` en cuanto la fuente permita intentarlo;
5. aceptar únicamente una Promise resuelta o un evento `play` como evidencia de reproducción;
6. ante `NotAllowedError`, registrar el bloqueo y permanecer listo;
7. instalar un único recuperador temporal ligado al primer gesto natural del documento;
8. retirar ese recuperador al primer éxito o al desmontaje;
9. nunca repetir intentos en intervalos indefinidos.

No se usará audio silenciado como sustituto del requisito del usuario: la experiencia debe intentar comenzar con sonido audible.

Cuando exista `navigator.getAutoplayPolicy`, podrá consultarse como optimización diagnóstica; su ausencia no cambia el flujo.

El fallback visible solo aparece después de un rechazo real de reproducción, no antes ni por el simple transcurso de un temporizador.

**Referencia de plataforma:** los navegadores pueden bloquear autoplay audible y `play()` puede rechazar con `NotAllowedError`; el estado de la interfaz debe seguir el resultado real de la Promise/evento. MDN: https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay

---

## 22. Matriz mínima de aceptación H1

| ID | Obligación | Prueba |
|---|---|---|
| H1-A | Topbar solo en `scrollY <= 8` | Playwright + captura |
| H1-B | Overlay fullscreen + cierre + focus | Playwright |
| H1-C | Rail 5×4 determinista | DOM + captura |
| H1-D | Rail no reduce el ancho narrativo | medición de layout |
| H1-E | Transporte no colisiona | bounding boxes |
| H1-F | Título sin wrap/overflow | `scrollWidth <= clientWidth` |
| H1-G | Foto centrada en 320–540 px | capturas |
| H1-H | Glosa ausente | DOM + fuente cargada |
| H1-I | Autoplay intentado en carga | instrumentación |
| H1-J | Bloqueo de autoplay tratado sin falso estado | `NotAllowedError` |
| H1-K | Primer gesto recupera audio | Playwright |
| H1-L | Desktop no regresa al modo móvil | capturas + DOM |

Se requiere evidencia visual para H1-A, H1-C, H1-E, H1-F y H1-G.

---

## 23. Regla de contención

Un defecto no se compensará creando otra capa, otro botón, otro panel o una segunda implementación equivalente. La corrección debe actuar sobre la causa primaria.

Se rechaza cualquier cambio que introduzca una capacidad no solicitada, una segunda fuente de verdad, una nueva dependencia o una nueva superficie de interacción.

**Pregunta de revisión obligatoria por cambio:** ¿corrige una obligación ya definida en este plan? Si no, queda fuera.

---

## 24. Estado de endurecimiento

**PLAN ENDURECIDO H1 · LISTO PARA IMPLEMENTACIÓN.**

El código de producto sigue sin modificaciones por este ciclo de planificación.

Base: v1.5.11 · `909d23d98881867f1361d78c253272f75ae6eb6f`
Objetivo: v1.6.0
Repositorio: https://github.com/SeryMente/otrobuenprograma\n


## 25. Checkpoint CP-01 — entrada a implementación

**Estado:** IMPLEMENTACIÓN INICIADA.  
**Base:** main @ 2ce62f5fce4ea46b742829bb3edb43d32da9c561 · v1.5.11.

## 26. Checkpoint CP-02 — protocolo de entrega viva

Cada estado utilizable del sprint se publicará en main y quedará registrado aquí con su URL canónica para revisión independiente del resultado.

## 27. Checkpoint CP-03 — endurecimiento

Se corrigieron antes de publicación la transición de scroll para evitar salto de layout, la exclusividad del overlay y el recálculo del hero después de cargar fuentes.

## 28. Checkpoint CP-04 — primera entrega viva

Esta entrega cubre shell móvil, navegación fullscreen, hero/autor, matrícula 5125461, retirada pública de Glosa y cache-busting/Service Worker v1.6.0.

**URL canónica:** https://serymente.github.io/otrobuenprograma/  
**Siguiente:** CP-05 — micro-rail + transporte/autoplay.

## 29. Estado de persistencia

La especificación del sprint, sus endurecimientos H1 y el protocolo de checkpoints permanecen dentro de este documento como referencia canónica del ciclo. No se considera completo un requisito hasta que exista evidencia en código, pruebas y publicación.



## 30. Checkpoint CP-05 — segunda entrega viva

Micro-rail 5×4, transporte compacto y autoplay inmediato best-effort incorporados.

**URL canónica:** https://serymente.github.io/otrobuenprograma/



## 31. Checkpoint CP-06 — endurecimiento final de interacción

Se fija el stacking del activador móvil por encima del transporte y se endurece la suite browser para no depender de recursos externos que prolonguen `networkidle`. La prueba del rail centra explícitamente el relato antes de validar visibilidad.

**URL canónica:** https://serymente.github.io/otrobuenprograma/



## 32. Checkpoint CP-06.6 — corrección del gate E2E

Actions confirmó que el job de estáticos pasó completo y Chromium se instaló correctamente. El primer E2E falló por configuración del runner: se solicitó un proyecto `chromium` inexistente en ausencia de `playwright.config`. Se corrige eliminando ese selector explícito; no se altera el producto para acomodar un error del test runner.



## 33. Checkpoint CP-06.13 — corrección de descubrimiento E2E

La ejecución local en RDC reprodujo el fallo del CI: Chromium y Headless Shell se instalaron correctamente, pero Playwright devolvió `No tests found`. Causa: la suite estaba guardada como `.spec.mjs`, fuera del patrón de descubrimiento por defecto del runner. Se renombra a `.spec.js` y se actualiza el workflow. No se modifica la lógica de producto.



## 34. Checkpoint CP-06.14 — contrato explícito del runner

El runner seguía sin descubrir la suite aun con `.spec.js`. Se elimina la ambigüedad configurando explícitamente `testDir`/ `testMatch` y usando CommonJS en la suite. Es infraestructura de QA únicamente.



## 35. Checkpoint CP-06.15 — paquete correcto de Playwright Test

La prueba local identificó que el CLI `playwright` no expone `playwright/test`; la API de pruebas pertenece a `@playwright/test`. Se corrigen el import y ambos comandos CI. No se modifica el producto.



## 36. Checkpoint CP-06.16 — dependencia E2E persistente

El runner necesita que `@playwright/test` exista como dependencia del proyecto para resolver `require("@playwright/test")`. Se añade un `package.json` mínimo y privado exclusivamente para QA, sin dependencias de producción. CI instala esa dependencia sin generar lockfile y usa los comandos oficiales de Playwright.

Referencia: https://playwright.dev/docs/best-practices

