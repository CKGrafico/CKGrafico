# Revisión semanal de artículos

Proyecto: `C:/Projects/Personal/CKGrafico`. Revisión prevista: lunes a las 09:00, Europe/Madrid. La tarea programada continúa en este chat y usa el navegador personal del usuario.

## Recopilación

Usa Browser/Computer Use con el Edge personal conectado. No leas cookies ni tokens y no llames a endpoints internos de LinkedIn. Abre [la página de artículos del autor](https://www.linkedin.com/in/quiquefdezguerra/recent-activity/articles/). No recopiles el feed de posts o republicaciones.

Recorre el listado y sus controles de carga o scroll. Abre los enlaces `/pulse/`, confirma que el autor es Quique Fdez Guerra y registra título original, URL, fecha, idioma y minutos de lectura. La selección de la web siempre incluye los tres artículos más recientes, independientemente de sus impresiones. No hace falta consultar estadísticas. Si varias publicaciones tienen la misma fecha, puedes desempatar usando “View stats” si sus impresiones están disponibles; no recopiles demographics ni información sobre otras personas.

Guarda el resultado privado en `C:/Users/quique.fernandez/.codex/cache/ckgrafico/linkedin-articles.json`. No lo añadas al repositorio, a documentos públicos ni a `dist/`. Su estructura es:

```json
{
  "checkedOn": "YYYY-MM-DD",
  "complete": true,
  "scope": "Qué listado se recorrió y si quedó completo",
  "source": "https://www.linkedin.com/in/quiquefdezguerra/recent-activity/articles/",
  "articles": [
    {
      "title": "Título original",
      "url": "https://www.linkedin.com/pulse/slug/",
      "publishedAt": "YYYY-MM-DD",
      "lang": "es",
      "readingMinutes": 6,
      "impressions": null
    }
  ]
}
```

`complete: true` significa que todos los artículos visibles se comprobaron. Documenta el alcance del inventario sin afirmar que cubre contenido que LinkedIn no mostró. Conserva el snapshot anterior si la nueva recopilación queda incompleta.

## Selección y generación

Ejecuta desde el proyecto:

```powershell
node scripts/writing.mjs C:/Users/quique.fernandez/.codex/cache/ckgrafico/linkedin-articles.json data/writing.json
node --test scripts/writing.test.mjs
node build.mjs
```

El selector toma los tres artículos más recientes y los ordena por fecha descendente. Si la fecha coincide, usa impresiones descendentes cuando estén disponibles y después la URL como orden estable. No impone preferencias de idioma. Si la colección está incompleta, conserva el archivo público anterior e investiga antes de publicar.

El archivo público contiene solo `checkedOn` y una lista con `title`, `url`, `publishedAt`, `lang` y `readingMinutes`. El build vuelve a validar esa estructura y escapa el texto al generar HTML. Ninguna métrica, enlace de analytics o dato de sesión debe llegar al sitio. Compara la lista `articles` con la selección publicada: si solo cambia `checkedOn`, no hace falta desplegar.

## Publicación

Antes de publicar, confirma en `origin/main` que existen `scripts/writing.mjs`, la sección `id="writing"` y el paso “Read weekly writing selection” de `.github/workflows/deploy.yml`. Si falta ese soporte, deja la selección local preparada e informa de que la instalación inicial en `main` sigue pendiente. No publiques como si estuviera instalada.

Una vez instalado, actualiza solamente `data/writing.json` en la rama remota `feature/linkedin-articles` de `CKGrafico/CKGrafico`. Si la rama no existe, créala desde el SHA actual de `main` con GitHub API. Usa la API de contenidos con el SHA actual del archivo para que una actualización concurrente no sea sobrescrita. En un conflicto vuelve a leer y compara antes de reintentar. Puedes usar el conector de GitHub o `gh`.

No hagas commits en `main`, no fusiones PRs, no uses force push y no publiques otros cambios locales. La rama de contenido solo aporta el JSON; el código que se despliega siempre es el de `main`.

Dispara el workflow existente `deploy.yml` con `workflow_dispatch` y ref `main`. Espera al resultado de ese run y comprueba el HTML público de `https://ckgrafico.com/`: debe contener los tres enlaces y títulos seleccionados dentro de `#writing`. No basta con que el dispatch sea aceptado ni con que el build local pase. Si el deploy falla, conserva el último sitio publicado y comunica la causa. Un siguiente deploy desde `main` también toma la última selección de esa rama.

La primera incorporación del soporte a `main` requiere el flujo habitual de revisión del repositorio. La protección actual de GitHub Pages solo admite `main`; no la modifiques para evitar ese paso.

## Informe del run

Registra cuántos artículos se enumeraron, qué títulos cambiaron y el resultado de generación o publicación. Distingue entre selección preparada, instalación inicial pendiente y despliegue verificado.
