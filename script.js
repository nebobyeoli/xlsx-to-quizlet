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

indexHTML.onload = () => {
    download_joined.innerHTML = 'download joined';
    download_all.innerHTML = 'download all';
};

// Note.
// Output files: XLSX.writeFile creates a complete download file

download_all.addEventListener('click', () => {
    xlsxAll.forEach(wb => {console.log('wb.file:', wb.file); XLSX.writeFile(wb.file, wb.name);});
});

download_joined.addEventListener('click', () => {
    XLSX.writeFile(xlsxJoined.file, xlsxJoined.name);
});

XLSX_input.addEventListener('change', e => {
    // check File API support
    if (window.File && window.FileList && window.FileReader) {
        clearPrevious();
        editInLoop_xlsxData(e.target.files); // IMPORTANT: FILES is passed as SNAPSHOT of e.target.files
    }
    else console.log('Your browser does not support File API');
});

function editInLoop_xlsxData(FILES)
{
    let wbBase = null;        // workbook base
    let practicalEnd = false; // practical endpoint (e.g. when FILES[last] is a non-sheet)

    for (let i = 0; !practicalEnd && i < FILES.length; i++)
    {
        console.log(FILES[i].name);

        if (FILES[i].type.match('sheet')) addDataSpace(FILES, i);

        // single data arr item snapshot of current file
        const dataNow = data[data.length - 1];
        console.log('dataNow :', dataNow);

        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(FILES[i]);

        // 파일 로드: (거의 항상) 제일 나중에 실행됨
        fileReader.addEventListener('load', e => {
            const workbook = onLoadSinglefile(FILES[i], e, dataNow);
            console.log(workbook)
            if   (workbook == null) return;
            if   (wbBase   == null) wbBase = Object.assign({}, workbook);
        });

        fileReader.addEventListener('loadend', () => {
            practicalEnd = onLoadendfile(i, FILES, wbBase);
        });
    }

    // 여기에 코드가 있으면 fileReader.onload 전에 실행됨
    // 따라서 이곳에 코드를 작성하는 것은 의미 없음.
    // as well as spitting out unexpected behavior
}

function onLoadSinglefile(FILE, e, dataNow)
{
    if (!FILE.type.match('sheet')) {
        console.log('Only XLSXs allowed! :', FILE.name);
        return null;
    }

    // DO SOMETHING WITH the workbook HERE
    // write in data arr
    const workbook = XLSX.read(e.target.result, { type: 'array' });

    const korSh = workbook.Sheets['Kor_meanings']; // Kor worksheet
    const engSh = workbook.Sheets['Eng_meanings']; // Eng worksheet

    insertBlankDef       (dataNow,  korSh, engSh);
    updateWorkbookStrings(workbook, dataNow);
    setColsWidth         (workbook, korSh, engSh);

    // Store download file on xlsxAll arr
    console.log('workbook:', workbook)
    xlsxAll.push({ file: workbook, name: FILE.name });

    download_all.innerHTML += `<br>${FILE.name}`;
    return workbook;
}

// Get full-joined single xlsx output file
function getxlsxJoined(data, wbBase)
{
    const dataStr = [];
    const dataSheet = {
        'Kor_meanings': { '!ref': null },
        'Eng_meanings': { '!ref': null }
    };

    let rows = 0;
    let fileName = 'Day ';

    /** Append for joined data xlsx **/
    data.forEach((Day_N, n) => {
        // Join each Day_N
        fileName += `${ Day_N.name.split('Day ')[1] }, `;
        rows     +=     Day_N.terms.length;

        for (let i = 0; i < Day_N.terms.length; i++) {
            set_Strings (Day_N,    i, dataStr  );
            set_Sheets  (Day_N, n, i, dataSheet);
        }
    });

    /* Sheets.!margins / Sheets.!cols */
    add_margins_cols(dataSheet);

    /* Sheets.!ref */
    dataSheet['Kor_meanings']['!ref'] =// `A1:B${rows}`;
    dataSheet['Eng_meanings']['!ref'] = `A1:B${rows}`;

    // Append dataSheet
    wbBase.Sheets  = dataSheet;
    wbBase.Strings = dataStr;

    // Output file
    return { file: wbBase, name: `${fileName.slice(0, -2)}.xlsx` };
}

// Push new saveSpace in data arr
function addDataSpace(FILES, i) {
    data.push({
        name: FILES[i].name.slice(0, -5),
        terms:   [],
        korDefs: [],
        engDefs: []
    });
}

// Replace terms in each def with BLANK
function insertBlankDef(dataNow, korSh, engSh)
{
    // default: terms are stored on column A
    let colChars = ['A', 'B', 'C'];
    let rowStart = 1;

    console.log(`korSh['A1']`, korSh['A1']==null)

    // if terms are stored on column C
    if (korSh['A1'] == null) {
        colChars = ['C', 'D', 'E'];
        rowStart = 3;
    }

    for (let j = 0; engSh[`${colChars[0]}${rowStart + j}`] != null; j++)
    {
        let korTerm = korSh[`${colChars[0]}${rowStart + j}`];
        let korDef  = korSh[`${colChars[1]}${rowStart + j}`];
        let korDef2 = korSh[`${colChars[2]}${rowStart + j}`];
        let engTerm = engSh[`${colChars[0]}${rowStart + j}`];
        let engDef  = engSh[`${colChars[1]}${rowStart + j}`];

        console.log(`aa ${colChars[0]}${rowStart + j}`, engTerm.v)

        // regex flag: g = global, i = case-insensitive
        engDef .v = engDef.v.replaceAll(RegExp(engTerm.v, 'gi'), BLANK);

        korTerm.v = rmSheetwrap(korTerm);
        korDef .v = rmSheetwrap(korDef);
        if (korDef2) korDef.v += `, ${rmSheetwrap(korDef2)}`;
        engTerm.v = rmSheetwrap(engTerm);
        engDef .v = rmSheetwrap(engDef);

        dataNow.terms  .push(engTerm.v);
        dataNow.korDefs.push(korDef.v);
        dataNow.engDefs.push(engDef.v);
    }
}

// 모든 파일 읽기 과정이 끝났을 때
function onLoadendfile(i, FILES, wbBase) {
    if (i == FILES.length - 1) {
        sortData();
        console.log('completed data :', data);
        console.log('xlsxJoined :', xlsxJoined);
        console.log('xlsxAll :', xlsxAll);
        xlsxJoined = getxlsxJoined(data, wbBase);
        download_joined.innerHTML += `<br>${xlsxJoined.name}`;
        return true;
    }
    return false;
}

// Set colummn width
function setColsWidth(workbook, korSh, engSh) {
    if (korSh['A1']) {
        workbook.Sheets['Kor_meanings'] = Object.assign(korSh, {
            '!cols': [
                { wch: 16  },
                { wch: 50  },
                { wch: 40  }
            ]
        });

        workbook.Sheets['Eng_meanings'] = Object.assign(engSh, {
            '!cols': [
                { wch: 16  },
                { wch: 200 }
            ]
        });
    }

    else {
        workbook.Sheets['Kor_meanings'] = Object.assign(korSh, {
            '!cols': [
                { wch: 2   },
                { wch: 8   },
                { wch: 16  },
                { wch: 50  }
            ]
        });

        workbook.Sheets['Eng_meanings'] = Object.assign(engSh, {
            '!cols': [
                { wch: 2   },
                { wch: 8   },
                { wch: 16  },
                { wch: 200 }
            ]
        });
    }
}

// Apply on workbook Strings
function updateWorkbookStrings(workbook, dataNow) {
    workbook.Strings = [];

    for (let i = 0; i < dataNow.terms.length; i++) {
        let term   = dataNow.terms     [i];
        let korDef = dataNow.korDefs  [i];
        // let korDef2 = dataNow.korDefs2  [i];
        workbook.Strings.push               ({ t: term,   r: `<t>${term  }</t>`, h: term    });
        workbook.Strings.push               ({ t: korDef, r: `<t>${korDef}</t>`, h: korDef  });
    }

    dataNow.engDefs.forEach(engDef => {
        workbook.Strings.push               ({ t: engDef, r: `<t>${engDef}</t>`, h: engDef  });
    });
}

// Empty previous results
function clearPrevious() {
    data       = [];
    xlsxJoined = {};
    xlsxAll    = [];
    download_all.innerHTML    = 'download all';
    download_joined.innerHTML = 'download joined';
    console.clear();
}

// Sort data arr
function sortData() {
    for (let j = 0; j < data.length; j++)
        for (let k = 0; k < data.length - 1 - j; k++) {
            if (data[k].name > data[k + 1].name) {
                let t = data[k]; data[k] = data[k + 1]; data[k + 1] = t;
            }
        }
}

// Remove characters of wrapcharArr[] on first and last of langsheetCell
function rmWrapchar(str, wrapcharArr) {
    wrapcharArr.forEach(c => {
        while (str.charAt(0) == c) str = str.slice(1);
        while (str.slice(-1) == c) str = str.slice(0, -1);
    })
    return str;
}

// Remove wrapchar on properties of sheetCell
// langsheetCell: like korSh['A' + j], korSh['B' + j], engSh['B' + j]
function rmSheetwrap(sheetCell) {
    if (sheetCell) {
        sheetCell.v = rmWrapchar(sheetCell.v, [' ', '　', ',']).replaceAll(' ,', ',');
        sheetCell.h = sheetCell.w = sheetCell.v;
        sheetCell.r = `<t>${sheetCell.v}</t>`;
        return sheetCell.v;
    }
    else return null;
}

function set_Sheets(Day_N, n, i, dataSheet) {
    let row    = (n * 40) + (i + 1);
    let term   = Day_N.terms[i];
    let korDef = Day_N.korDefs[i];
    let engDef = Day_N.engDefs[i];

    /* Sheets */
    dataSheet['Kor_meanings'][`A${row}`] =
    dataSheet['Eng_meanings'][`A${row}`] = {
        't': 's',
        'v': term, 'h': term, 'w': term, 'r': `<t>${term}</t>`
    };

    dataSheet['Kor_meanings'][`B${row}`] = {
        't': 's',
        'v': korDef, 'h': korDef, 'w': korDef, 'r': `<t>${korDef}</t>`
    };

    dataSheet['Eng_meanings'][`B${row}`] = {
        't': 's',
        'v': engDef, 'h': engDef, 'w': engDef, 'r': `<t>${engDef}</t>`
    };
}

function set_Strings(Day_N, i, dataStr) {
    let term   = Day_N.terms[i];
    let korDef = Day_N.korDefs[i];
    let engDef = Day_N.engDefs[i];

    /* Strings */
    dataStr.push                ({ t: term,   r: `<t>${term}</t>`,   h: term   });
    dataStr.push                ({ t: korDef, r: `<t>${korDef}</t>`, h: korDef });
    dataStr.push                ({ t: engDef, r: `<t>${engDef}</t>`, h: engDef });
}

function add_margins_cols(dataSheet) {
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
}
