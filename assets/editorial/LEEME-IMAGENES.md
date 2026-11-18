# GRIEGOS · revisión y biblioteca de imágenes

Fecha: 14 de noviembre de 2026. Copia revisada: GRIEGOS - WEB 2.

Se revisaron las 19 páginas HTML, los estilos, las referencias del catálogo y los datos de ODYSSEY. Se inspeccionaron visualmente los 11 banners y los dos recursos de marca. El análisis de rutas estáticas encontró 134 referencias a imágenes y ninguna ruta inexistente. Esto verifica archivos, no constituye una auditoría completa de funcionamiento de la web.

La carencia principal es de cobertura editorial: las bibliotecas y las fichas educativas se presentan con texto, tarjetas e iconos, sin imágenes propias. Los iconos cumplen una función de navegación y se conservan.

## Lo que ya existe

| Recurso | Cantidad | Evaluación |
| --- | ---: | --- |
| Fotos de productos | 64 | Las 64 referencias del catálogo apuntan a archivos existentes. No se detectó un producto registrado sin imagen. |
| Banners | 11 | Inicio, Store, categorías y el hero de Academy ya están cubiertos, con composiciones de escritorio y móvil. |
| Marca | 2 | Símbolo y logotipo blanco. Se mantienen intactos. |
| Iconos SVG | 25 | Recursos de interfaz; no necesitan reemplazarse por fotografías. |
| Carpeta training | 0 | No hay fotografías ni demostraciones técnicas de ejercicios en esta carpeta. |

## Huecos detectados y solución preparada

| Archivo JPG principal | Función | Ubicación propuesta |
| --- | --- | --- |
| [nutricion-fundamentos.jpg](nutricion-fundamentos.jpg) | Identificar la biblioteca y las guías de fundamentos con alimentos cotidianos; evitar asociar nutrición únicamente con suplementos. | `academy/nutrition/index.html`, `pages/odyssey/nutricion.html` |
| [calculadoras-metodo.jpg](calculadoras-metodo.jpg) | Dar una portada reconocible a las herramientas y comunicar medición y registro sin mostrar resultados inventados. | `academy/calculadoras/index.html`, `pages/odyssey/calculadoras.html` |
| [entrenamiento-gimnasio.jpg](entrenamiento-gimnasio.jpg) | Identificar los programas de gimnasio y separar visualmente entrenamiento de nutrición; se puede compartir entre ambos programas. | `academy/training/index.html`, `pages/odyssey/entrenamientos.html` |
| [entrenamiento-casa.jpg](entrenamiento-casa.jpg) | Distinguir el programa doméstico del de gimnasio y representar su equipo mínimo. | `pages/odyssey/programa.html?id=casa-tres-dias` |
| [nutricion-organizacion.jpg](nutricion-organizacion.jpg) | Representar planificación, compras y preparación cotidiana en la guía de organización semanal. | `pages/odyssey/recurso.html?area=nutrition&id=organizacion-semanal` |
| [progresion-control.jpg](progresion-control.jpg) | Hacer reconocible el artículo de sobrecarga progresiva mediante registro e incrementos pequeños. | `academy/recursos/index.html`, `academy/planes/index.html` |
| [suplementacion-criterio.jpg](suplementacion-criterio.jpg) | Comunicar revisión crítica de la información de un suplemento. Solo uso editorial: el envase no representa un producto a la venta. | `pages/odyssey/recurso.html?area=academy&id=suplementacion-responsable` |
| [identidad-legado.jpg](identidad-legado.jpg) | Explicar visualmente los tres ejes de GRIEGOS y conectar Store azul con Academy dorada sin alterar el logotipo. | `nosotros/index.html`, `index.html#esencia` |

La imagen de gimnasio puede compartirse entre los programas Base de fuerza y Torso / pierna. La de nutrición general puede acompañar tanto Fundamentos como Proteínas, carbohidratos y grasas. No es necesario producir una imagen distinta para cada calculadora ni añadir fotos a privacidad, condiciones o formularios solo para llenar espacio.

## Qué fotos reales falta recopilar

- **Ropa deportiva:** existe una imagen conceptual de categoría, pero no hay fotografías individuales ni productos de ropa registrados en el catálogo. Para vender una prenda, fotografiar el artículo real de frente, espalda y detalles; registrar talla, color y material. El banner conceptual no demuestra stock.
- **Equipo y sedes, si se van a presentar en Nosotros o Contacto:** recopilar fotos propias del equipo, preparación de pedidos y puntos de atención que decidas hacer públicos. La pieza identidad-legado es una metáfora visual; no representa una sede real.
- **Ejercicios, si se añade una biblioteca de técnica:** producir fotos o vídeos de inicio y final del movimiento con revisión técnica. Las dos escenas de entrenamiento creadas aquí son portadas y no enseñan una ejecución.

## Criterio visual aplicado

- Base de GRIEGOS: negro #090B0F, carbón #15191F, blanco y azul #2864D9, tomados de styles/main.css.
- ODYSSEY: carbón cálido #100f0d y dorado antiguo #e4bf80, tomados de styles/odyssey-atmosphere.css.
- Continuidad con los banners existentes: hierro, piedra, libretas y luz lateral. La greca se utiliza como detalle cultural en la imagen de marca; no sustituye el símbolo original.
- Composiciones horizontales 3:2, con zonas oscuras que permiten incorporar titulares como HTML. No hay textos, precios, resultados ni promesas incrustados.
- Nutrición se ilustra con alimentos cotidianos presentes en las propias guías: arroz, frijoles, huevo y vegetales. No se prescribe una dieta ni se vincula el aprendizaje a comprar suplementos.
- El envase de suplementacion-criterio es genérico y conceptual. Utilizarlo únicamente como portada educativa.

## Archivos entregados

- **8 JPG principales de 1536 × 1024:** para portadas y secciones.
- **8 JPG de 768 × 512**, con sufijo -768: para tarjetas o pantallas pequeñas.
- **8 PNG originales** en originales/: para futuras ediciones, sin alterar los archivos generados.
- **[galeria.html](galeria.html):** vista de todas las imágenes, enlaces de descarga y ubicación propuesta; abre también con doble clic.
- **[manifest.json](manifest.json):** función, destinos, alt sugerido, dimensiones y prompt final completo de cada imagen.
- **[auditoria-referencias.json](auditoria-referencias.json):** evidencia del análisis de rutas previo a añadir esta biblioteca.

Generación: herramienta integrada image_gen. Las ocho imágenes fueron creadas para este encargo e inspeccionadas visualmente. Se conservan los PNG originales y se preparan derivados JPG de calidad 84 (web) y 80 (móvil), sin recortar ni deformar.

## Cómo utilizarlas

Desde la raíz de la web:

```html
<img
  src="assets/editorial/nutricion-fundamentos.jpg"
  srcset="assets/editorial/nutricion-fundamentos-768.jpg 768w,
          assets/editorial/nutricion-fundamentos.jpg 1536w"
  sizes="(max-width: 760px) 100vw, 800px"
  width="1536"
  height="1024"
  alt="Plato de arroz, frijoles, huevo y vegetales sobre una mesa oscura."
  loading="lazy"
  decoding="async"
>
```

Ajustar el prefijo de ruta desde cada página: ../assets/ desde academy/index.html o nosotros/index.html y ../../assets/ desde pages/odyssey/ o academy/nutrition/. Ajustar sizes al ancho real del componente.

Para tarjetas, conservar 3:2. Si se usa object-fit: cover en otra proporción, revisar el recorte; object-position: 65% 50% es un punto de partida porque los sujetos se sitúan principalmente a la derecha. La versión de 768 no es un recorte vertical: conserva la composición completa.

Si la imagen solo ambienta un titular que ya transmite todo su significado, usar alt="" para evitar repetición. Los títulos y enlaces se mantienen como HTML. Para una imagen que se convierte en hero visible al cargar, retirar loading="lazy" y reservar fetchpriority="high" únicamente para la imagen prioritaria.

**Alcance realizado:** archivos añadidos en assets/editorial. Las páginas existentes, los productos, los precios y los logos no se modificaron. La biblioteca queda preparada para integrarla donde se indica.

## Fuentes consultadas

- Código y recursos de esta copia local: index.html, store/index.html, academy/, pages/odyssey/, data/products.js, data/odyssey/, styles/main.css y styles/odyssey-atmosphere.css.
- [MDN: imágenes adaptables](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images): uso de srcset y sizes para ofrecer diferentes resoluciones.
- [W3C WAI: imágenes decorativas](https://www.w3.org/WAI/tutorials/images/decorative/): alt vacío cuando la imagen no aporta información adicional.

No se descargaron imágenes de terceros ni se inventaron fotografías de productos reales.

