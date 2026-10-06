# QA visual móvil · v1.6.1

## Hallazgo

La comparación visual posterior al cierre de v1.6.0 mostró que la composición seguía separándose del objetivo en el primer viewport móvil.

### Delta medido

| Elemento | v1.6.0 | Objetivo v1.6.1 | Delta |
|---|---:|---:|---:|
| Fotografía del autor, ancho | 126 px | 126 px | 0 px |
| Fotografía del autor, alto | 200 px | 70.875 px (16:9) | −129.125 px |
| Relación ancho/alto | 0.630 | 1.778 | +1.148 |
| Restricción del título | nowrap | multilínea contenida | eliminación de restricción |
| Líneas esperadas del hero en 320×568 | forzada a 1 línea | 4 | +3 líneas visibles |
| Líneas esperadas del hero en 390×844 | forzada a 1 línea | 4 | +3 líneas visibles |

El recorte apaisado reduce la altura ocupada por la foto en 64.6%. Ese ahorro pertenece directamente al presupuesto vertical del primer viewport: no se compensa con esconder contenido, truncar texto o reducir artificialmente la tipografía.

## Corrección aplicada

- assets/css/story-v3.css: fotografía móvil en 126 px × 16:9, con object-position: 60% 40%.
- assets/css/story-v3.css: hero móvil sin nowrap, ancho máximo controlado y composición editorial multilínea.
- scripts/qa_mobile_v16.spec.js: ratio de fotografía, ausencia de overflow, wrapping y captura de cada viewport.
- .github/workflows/quality.yml: contrato visual mínimo y artefactos de captura actualizados a v1.6.1.
- sw.js e index.html: cache busting v1.6.1 para impedir que GitHub Pages conserve la composición anterior.

## Criterio de cierre visual

No se considera cerrado el cambio mientras 320×568 y 390×844 no cumplan simultáneamente:

1. foto apaisada, compacta y centrada;
2. identidad completa visible;
3. hero completamente legible, sin overflow;
4. jerarquía del hero iniciando inmediatamente después de la ficha;
5. rail/transporte sin intrusión sobre el contenido visible.

Referencia de implementación: https://github.com/SeryMente/otrobuenprograma/blob/main/assets/css/story-v3.css
