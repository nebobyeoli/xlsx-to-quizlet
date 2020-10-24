# [xlsx-to-quizlet](https://nebobyeoli.github.io/xlsx-to-quizlet/xlsx-mani)

This is a tryout, I don't know much

Link above is just a reader - quizlet uploader is in a seperate folder

## Commit

### Created terms-in-def plunger

- Replaces terms in defs to underscores
- File edit-download happens immediately-like after upload(s)

### Added functionality: create a single, joined xlsx file

- Single large function of XLSX_input onchange, commented to split into smaller functions
- largely split, child goes as `getxlsxJoined`
+ decided to set names as `*~joined` than `\*~full` : possibility of latter being confused with `all`

- Fixed issue spitters on receiving non-sheets as first/last files
- unexpected behavior above were caused by inner onload event, which takes execution after a slight delay
- buggers were buggy especially with wbBase

+ Need to fix: Created joinfile doesn't include all terms
+ Add this maybe: data.json structure example in README

<details>
  <summary>proper propriety proprietarietà</summary>

  - JS passes refs as refs, ref.properties as orig.properties

  ```javascript
  let str = 'string';
  const arr = [ 1, 2, 3 ];
  const obj = { a: 10, b: 20, c: 30 };

  let changeStr = str => str = 'edited-string';   // pass & access ref of variable
  let changeArr = arr => arr[0] = 1000;           // pass ref of var, access property of ref
  let changeObj = obj => obj.a = 0.001;           // pass ref of var, access property of ref

  changeStr(str);
  changeArr(arr);
  changeObj(obj);

  console.log('str:', str);   // output: str: string                      ref
  console.log('arr:', arr);   // output: arr: [ 1000, 2, 3 ]              orig
  console.log('obj:', obj);   // output: obj: { a: 0.001, b: 20, c: 30 }  orig
  ```
</details>

<details>
  <summary>logging the buggers</summary>
  
  - Restored issue-env files: <b>branch not working</b>
  
  - `❌ Uncaught ReferenceError: process is not defined ..`
  
    ~~Process is <b>*never*</b> defined~~
  
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
