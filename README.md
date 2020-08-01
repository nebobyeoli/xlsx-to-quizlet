# [xlsx-to-quizlet](https://nebobyeoli.github.io/xlsx-to-quizlet/)

This is a tryout, I don't know much

## Notes to SELF

- Add empty .nojekyll file to use node_modules files

- These are the same:

```javascript
XLSXreader.addEventListener('load', function(e) { });

XLSXreader.onload = function(e) { };
```
and also
```javascript
function handleFileSelect(e) { };
XLSX_input.addEventListener('change', handleFileSelect, false);

XLSX_input.onchange = function(e) { };
```
