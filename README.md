# [xlsx-to-quizlet](https://hearkour.github.io/xlsx-to-quizlet/)

This is a tryout, I don't know much

### Running [test-secret.html](https://hearkour.github.io/xlsx-to-quizlet/test-secret.html)

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
  <summary>Usless <b>l o g</b></summary>
  
  - #### Restored issue-env files: branch not working
  
  - `Deploy`ment
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
