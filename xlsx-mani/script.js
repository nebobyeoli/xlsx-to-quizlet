const indexHTML       = document.getElementById('index-html');
const XLSX_input      = document.getElementById('XLSX-input');
const download_joined = document.getElementById('download-joined');
const download_all    = document.getElementById('download-all');
const desc_joined     = document.getElementById('desc-joined');
const desc_all        = document.getElementById('desc-all');

const BLANK = '__________'; // you know what this is
var data = [];
var xlsxJoined = {};
var xlsxAll  = [];

if (indexHTML)
{
    indexHTML.onload = () => {
        download_joined.innerHTML = 'download joined';
        download_all.innerHTML = 'download all';
    };

    /*** Output files: XLSX.writeFile creates a complete download file ***/
    download_all.addEventListener('click', () => {
        xlsxAll.forEach(wb => XLSX.writeFile(wb.file, wb.name));
    });

    download_joined.addEventListener('click', () => {
        XLSX.writeFile(xlsxJoined.file, xlsxJoined.name);
    });

    XLSX_input.addEventListener('change', e =>
    {
        // check File API support
        if (!window.File || !window.FileList || !window.FileReader) {
            console.log('Your browser does not support File API');
            return;
        }

        // SNAPSHOT of e.target.files
        const FILES = e.target.files;

        // clearPrevious
        // Empty previous results
        data       = [];
        xlsxJoined = {};
        xlsxAll    = [];
        download_all.innerHTML  = 'download all';
        download_joined.innerHTML = 'download joined';

        let wbBase = null;        // workbook base
        let practicalEnd = false; // practical endpoint (e.g. when FILES[last] is a non-sheet)

        for (let i = 0; !practicalEnd && i < FILES.length; i++)
        {
            console.log(FILES[i].name);

            if (FILES[i].type.match('sheet')) {
                data.push({
                    name: FILES[i].name.slice(0, -5),
                    terms    : [],
                    korDefs1 : [],
                    korDefs2 : [],
                    engDefs  : []
                });
            }

            // single data arr item snapshot of current file
            const dataNow = data[data.length - 1];

            console.log('dataNow :', dataNow);

            const fileReader = new FileReader();
            fileReader.readAsArrayBuffer(FILES[i]);

            // 파일 로드: (거의 항상) 제일 나중에 실행됨
            fileReader.addEventListener('load', e =>
            {
                if (!FILES[i].type.match('sheet')) {
                    console.log('Only XLSXs allowed! :', FILES[i].name);
                    return;
                }

                // DO SOMETHING WITH the workbook HERE
                // write in data arr
                const workbook = XLSX.read(e.target.result, {type: 'array'});
                if (wbBase == null) wbBase = Object.assign({}, workbook);
                console.log('wbBase\':', wbBase)

                const korSh = workbook.Sheets['Kor_meanings']; // Kor worksheet
                const engSh = workbook.Sheets['Eng_meanings']; // Eng worksheet

                // insertBlankDef
                for (let j = 1; engSh['A' + j] != null; j++)
                {
                    let korTerm, korDef1, korDef2;
                    let engTerm = engSh['A' + j].v;
                    let engDef  = engSh['B' + j].v;

                    // regex flag: g = global, i = case-insensitive
                    engSh['B' + j].v = engDef.replaceAll(RegExp(engTerm, 'gi'), BLANK);

                    korTerm = rmSheetwrap(korSh['A' + j]);
                    korDef1 = rmSheetwrap(korSh['B' + j]);
                    korDef2 = rmSheetwrap(korSh['C' + j]);
                    engTerm = rmSheetwrap(engSh['A' + j]);
                    engDef  = rmSheetwrap(engSh['B' + j]);

                    dataNow.terms   .push(engTerm);
                    dataNow.korDefs1.push(korDef1);
                    dataNow.korDefs2.push(korDef2);
                    dataNow.engDefs .push(engDef);
                }

                workbook.Strings = [];

                // updateWbStrings
                // updateWorkbookStrings
                // apply on workbook strings
                for (let i = 0; i < dataNow.terms.length; i++) {
                    let term    = dataNow.terms     [i];
                    let korDef1 = dataNow.korDefs1  [i];
                    let korDef2 = dataNow.korDefs2  [i];
                    workbook.Strings.push               ({ t: term,     r: `<t>${term   }</t>`, h: term     });
                    workbook.Strings.push               ({ t: korDef1,  r: `<t>${korDef1}</t>`, h: korDef1  });
                    if (korDef2) workbook.Strings.push  ({ t: korDef2,  r: `<t>${korDef2}</t>`, h: korDef2  });
                }

                dataNow.engDefs.forEach(engDef => {
                    workbook.Strings.push               ({ t: engDef,   r: `<t>${engDef}</t>`,  h: engDef   });
                })

                // setColsWidth
                // set column width
                workbook.Sheets['Kor_meanings'] = Object.assign(korSh, {
                    '!cols': [
                        { wch: 14.38 },
                        { wch: 49.38 },
                        { wch: 39.38 }
                    ]
                });

                workbook.Sheets['Eng_meanings'] = Object.assign(engSh, {
                    '!cols': [
                        { wch: 14.38 },
                        { wch: 255   }
                    ]
                });

                // Store download file on xlsxAll arr
                xlsxAll.push({ file: workbook, name: FILES[i].name });

                download_all.innerHTML += `<br>${FILES[i].name}`;
            });

            fileReader.addEventListener('loadend', e => {
                // 모든 파일 읽기 과정이 끝났을 때
                // onloadEndfile
                if (i == FILES.length - 1) {
                    sortData();
                    console.log ('completed data :', data);
                    console.log ('xlsxJoined :',     xlsxJoined);
                    console.log ('xlsxAll :',        xlsxAll);
                    xlsxJoined = getxlsxJoined(data, wbBase);
                    download_joined.innerHTML += `<br>${xlsxJoined.name}`;
                    practicalEnd = true;
                }
            });
        }

        // 이 아래에 있는 것들은 fileReader.onload 전에 실행됨
        // 따라서 이곳에 코드를 작성하는 것은 의미 없음.
        // as well as spitting out unexpected behavior
    });
}

// sort data arr
function sortData() {
    for (let j = 0; j < data.length; j++)
        for (let k = 0; k < data.length - 1 - j; k++) {
            if (data[k].name > data[k + 1].name) {
                let t = data[k]; data[k] = data[k + 1]; data[k + 1] = t;
            }
        }
}

// remove characters of wrapcharArr[] on first and last of langsheetCell
function rmWrapchar(str, wrapcharArr)
{
    wrapcharArr.forEach(c => {
        while (str.charAt(0) == c) str = str.slice(1);
        while (str.slice(-1) == c) str = str.slice(0, -1);
    })
    return str;
}

// rmWrapchar on properties of sheetCell
// langsheetCell: like korSh['A' + j], korSh['B' + j], engSh['B' + j]
function rmSheetwrap(sheetCell)
{
    if (sheetCell) {
        sheetCell.v = rmWrapchar(sheetCell.v, [' ', '　']).replaceAll(' ,', ',');
        sheetCell.h = sheetCell.w = sheetCell.v;
        sheetCell.r = `<t>${sheetCell.v}</t>`;
        return sheetCell.v;
    }
    else return null;
}

function getxlsxJoined(data, wbBase)
{
    const dataStr = [];
    const dataSheet = {
        'Kor_meanings': { '!ref': null },
        'Eng_meanings': { '!ref': null }
    };

    let rows = 0;
    let fileName = 'Day ';

    /*** Appending for joined data xlsx ***/
    data.forEach((Day_N, n) =>
    {
        fileName += `${ Day_N.name.split('Day ')[1] }, `;
        rows += Day_N.terms.length;

        /** Kor_meanings **/
        for (let i = 0; i < Day_N.terms.length; i++)
        {
            let row = (n * 40) + (i + 1);

            let term = Day_N.terms[i];
            let korDef1 = Day_N.korDefs1[i];
            let korDef2 = Day_N.korDefs2[i];

            /* Strings */
            dataStr.push                ({ t: term,    r: `<t>${term}</t>`,    h: term    });
            dataStr.push                ({ t: korDef1, r: `<t>${korDef1}</t>`, h: korDef1 });
            if (korDef2) dataStr.push   ({ t: korDef2, r: `<t>${korDef2}</t>`, h: korDef2 });

            /* Sheets */
            dataSheet['Kor_meanings'][`A${row}`] = {
                't': 's',
                'v': term, 'h': term, 'w': term, 'r': `<t>${term}</t>`
            };
            dataSheet['Kor_meanings'][`B${row}`] = {
                't': 's',
                'v': korDef1, 'h': korDef1, 'w': korDef1, 'r': `<t>${korDef1}</t>`
            };
            if (korDef2) dataSheet['Kor_meanings'][`C${row}`] = {
                't': 's',
                'v': korDef2, 'h': korDef2, 'w': korDef2, 'r': `<t>${korDef2}</t>`
            };
        }

        /** Eng_meanings **/
        for (let i = 0; i < Day_N.terms.length; i++)
        {
            let row = (n * 40) + (i + 1);

            let term = Day_N.terms[i];
            let engDef = Day_N.engDefs[i];

            /* Strings */
            dataStr.push                ({ t: engDef,  r: `<t>${engDef}</t>`,  h: engDef  });

            /* Sheets */
            dataSheet['Eng_meanings'][`A${row}`] = {
                't': 's',
                'v': term, 'h': term, 'w': term, 'r': `<t>${term}</t>`
            };
            dataSheet['Eng_meanings'][`B${row}`] = {
                't': 's',
                'v': engDef, 'h': engDef, 'w': engDef, 'r': `<t>${engDef}</t>`
            };
        }
    });

    /* Sheets.!margins */
    dataSheet['Kor_meanings']['!margins'] =
    dataSheet['Eng_meanings']['!margins'] = {
        'left': 0.75, 'right': 0.75,
        'top': 1, 'bottom': 1,
        'header': 0.5, 'footer': 0.5
    };

    /* Sheets.!cols */
    dataSheet['Kor_meanings']['!cols'] = [
        { 'wch': 14.38 }, { 'wch': 49.38 }, { 'wch': 39.38 }
    ];
    dataSheet['Eng_meanings']['!cols'] = [
        { 'wch': 14.38 }, { 'wch': 255 }
    ];

    dataSheet['Kor_meanings']['!ref'] = `A1:C${rows}`;
    dataSheet['Eng_meanings']['!ref'] = `A1:B${rows}`;

    /*** Append dataSheet ***/
    wbBase.Sheets  = dataSheet;
    wbBase.Strings = dataStr;

    /*** Output file ***/
    return { file: wbBase, name: `${fileName.slice(0, -2)}.xlsx` };
}
