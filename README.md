# [xlsx-to-quizlet](https://nebobyeoli.github.io/xlsx-to-quizlet/)

This is a tryout, I don't know much

Link above is just a reader - quizlet uploader is in a seperate folder

<details>
  <summary>Notes to <b>SELF</b></summary>

  - Add empty .nojekyll file to use node_modules files

  - These are the same:

  ```javascript
  // onload
  XLSXreader.addEventListener('load', function(e) { });
  XLSXreader.onload = function(e) { };
  
  // onchange
  function handleFileSelect(e) { };
  XLSX_input.addEventListener('change', handleFileSelect, false);
  
  XLSX_input.onchange = function(e) { };
  ```
</details>

<details>
  <summary>Usless <b>l o g</b> (old*)</summary>
  
  - Restored issue-env files: <b>branch not working</b>
  
  - `❌ Uncaught ReferenceError: process is not defined ..`
  
    ~~Process is <b>NEVER</b> defined~~
  
  - `Deploy`ment:
    ```yaml
      # Not working
    - name: Deploy
      uses: JamesIves/github-pages-deploy-action@releases/v3  
    ```
    ```yaml
      # Working
    - name: Deploy
      uses: actions/checkout@v2
    ```
  
</details>
