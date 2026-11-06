# Revisión semanal de artículos

Proyecto: `C:/Projects/Personal/CKGrafico`. Revisión prevista: lunes a las 09:00, Europe/Madrid. La tarea programada continúa en este chat y usa el navegador personal del usuario.

## Recopilación

Usa Browser/Computer Use con el Edge personal conectado. No leas cookies ni tokens y no llames a endpoints internos de LinkedIn. Abre [la página de artículos del autor](https://www.linkedin.com/in/quiquefdezguerra/recent-activity/articles/). No recopiles el feed de posts o republicaciones.

Enumera los enlaces `/pulse/` del listado y recorre los controles de carga o el scroll si aparecen. Abre cada artículo, confirma que es de Quique Fdez Guerra y registra título original, URL, fecha, idioma y minutos de lectura. Usa el enlace “View stats” del artículo para encontrar su analítica; no construyas IDs de analytics por intuición. En algunas navegaciones el contenido se presenta en un iframe: toma sus controles del estado actual de la página.

Lee “Impressions” del post que comparte el artículo. “Article views”, reacciones y miembros alcanzados son métricas distintas y no sustituyen a las impresiones. No recopiles demographics ni información sobre otras personas. Si no existe “View stats”, usa `impressions: null` y explica la ausencia. Si el enlace existe pero falla la carga, marca la recopilación como incompleta.

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
      "impressions": 123,
      "articleViews": 12,
      "analyticsUrl": "URL observada mediante View stats"
    }
  ]
}
```

`complete: true` significa que todos los artículos enumerados se comprobaron. La falta normal de “View stats” en un artículo antiguo se registra como desconocida y no equivale a un fallo de carga. Documenta el alcance del inventario sin afirmar que cubre contenido que LinkedIn no mostró. Conserva el snapshot anterior si la nueva recopilación queda incompleta.

## Selección y generación

Ejecuta desde el proyecto:

```powershell
node scripts/writing.mjs C:/Users/quique.fernandez/.codex/cache/ckgrafico/linkedin-articles.json data/writing.json
node --test scripts/writing.test.mjs
node build.mjs
```

El selector toma hasta tres artículos por impresiones acumuladas descendentes. Desempata por publicación más reciente y después por URL. No impone una ventana temporal ni preferencias de idioma. Si no hay métricas válidas, la colección está incompleta o falta una métrica de un destacado anterior, no reemplaza el archivo público. Investiga y comunica el problema.

El archivo público contiene solo `checkedOn` y una lista con `title`, `url`, `publishedAt`, `lang` y `readingMinutes`. El build vuelve a validar esa estructura y escapa el texto al generar HTML. Ninguna métrica, enlace de analytics o dato de sesión debe llegar al sitio. Compara la lista `articles` con la selección publicada: si solo cambia `checkedOn`, no hace falta desplegar.

## Publicación

Antes de publicar, confirma en `origin/main` que existen `scripts/writing.mjs`, la sección `id="writing"` y el paso “Read weekly writing selection” de `.github/workflows/deploy.yml`. Si falta ese soporte, deja la selección local preparada e informa de que la instalación inicial en `main` sigue pendiente. No publiques como si estuviera instalada.

Una vez instalado, actualiza solamente `data/writing.json` en la rama remota `feature/linkedin-articles` de `CKGrafico/CKGrafico`. Si la rama no existe, créala desde el SHA actual de `main` con GitHub API. Usa la API de contenidos con el SHA actual del archivo para que una actualización concurrente no sea sobrescrita. En un conflicto vuelve a leer y compara antes de reintentar. Puedes usar el conector de GitHub o `gh`.

No hagas commits en `main`, no fusiones PRs, no uses force push y no publiques otros cambios locales. La rama de contenido solo aporta el JSON; el código que se despliega siempre es el de `main`.

Dispara el workflow existente `deploy.yml` con `workflow_dispatch` y ref `main`. Espera al resultado de ese run y comprueba el HTML público de `https://ckgrafico.com/`: debe contener los tres enlaces y títulos seleccionados dentro de `#writing`. No basta con que el dispatch sea aceptado ni con que el build local pase. Si el deploy falla, conserva el último sitio publicado y comunica la causa. Un siguiente deploy desde `main` también toma la última selección de esa rama.

La primera incorporación del soporte a `main` requiere el flujo habitual de revisión del repositorio. La protección actual de GitHub Pages solo admite `main`; no la modifiques para evitar ese paso.

## Informe del run

Registra cuántos artículos se enumeraron, cuántos ofrecían impresiones, qué títulos cambiaron y el resultado de generación o publicación. Distingue entre selección preparada, instalación inicial pendiente y despliegue verificado. No afirmes que un artículo sin estadísticas tiene cero impresiones.
