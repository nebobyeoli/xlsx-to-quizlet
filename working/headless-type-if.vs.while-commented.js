// Note: userid and password MUST BE MODIFIED on usage

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

function getChromePath() {
    let chromePath;
    if      (process.platform == 'win32')   chromePath = 'c:/program files (x86)/google/chrome/application/chrome.exe';
    else if (process.platform == 'linux')   chromePath = '/usr/bin/google-chrome';
    else                                    chromePath = '/library/application support/google/chrome';
    return chromePath;
}

function headlessOptions() {
    return {
        executablePath: getChromePath(),
        headless: true,
        ignoreDefaultArgs: true,
        devtools: false,
        dumpio: true,
        defaultViewport: { width: 1280, height: 882 },
        args: [
            // '--incognito',
            // '--disable-canvas-aa',
            // '--disable-2d-canvas-clip-aa',
            // '--disable-gl-drawing-for-tests',
            // '--disable-dev-shm-usage',
            // '--no-zygote',
            // '--use-gl=swiftshader',
            // '--hide-scrollbars',
            '--mute-audio',
            '--no-first-run',
            '--disable-infobars',
            '--disable-breakpad',
            '--window-size=100,100',
            '--user-data-dir=./chromeData/temp',
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    };
}

async function addWord(page, word, def) {
    // page.keyboard.press('Tab')
    // .then(() => page.keyboard.type(word)
    // .then(() => page.keyboard.press('Tab')
    // .then(() => page.keyboard.type(def))));

    let log = '';

    while (await getFocusedValue(page) != word) await page.keyboard.type(word);
    log += await getFocusedValue(page) + '\t';
    await page.keyboard.press('Tab');
    
    while (await getFocusedValue(page) != def) await page.keyboard.type(def);
    log += await getFocusedValue(page) + '\t';
    await page.keyboard.press('Tab');

    // await page.keyboard.type(word);
    // if (getFocusedValue(page) == word) page.keyboard.press('Tab');
    // log += getFocusedValue(page) + '\t';
    //
    // await page.keyboard.type(def);
    // if (getFocusedValue(page) == def) page.keyboard.press('Tab');
    // log += getFocusedValue(page) + '\t';

    // page.keyboard.type(word);
    // if (getFocusedValue(page) == word) {
    //     page.keyboard.press('Tab');
    //     log += getFocusedValue(page) + '\t';
    //
    //     await page.keyboard.type(def);
    //     if (getFocusedValue(page) == def) {
    //         page.keyboard.press('Tab');
    //         log += getFocusedValue(page) + '\t';
    //     }
    // }

    console.log(log);

    // await page.keyboard.press('Tab');
    // // await aSleep(100);
    // await page.keyboard.type(word);
    // // await aSleep(100);
    // await page.keyboard.press('Tab');
    // // await aSleep(100);
    // await page.keyboard.type(def);
    // // await aSleep(100);
}

var query = { // Object for fetching selector values
    openLogin: 'div.UIModalBody > form > div.SignupWithEmailForm-belowForm > div.UIDiv.SignupWithEmailForm-alreadyHaveAccount > span > span > button',
    login: 'div.UIModalBody > form > button',
    reSignin: 'span.SiteHeader-signInBtn',

    id: '#username',
    pwd: '#password',

    title: 'div.CreateSetHeader-textarea.CreateSetHeader-title textarea',
    desc: 'div.CreateSetHeader-textarea.CreateSetHeader-description textarea',

    // terms: 'div.StudiableItems > div > div:nth-child(1) > div:nth-child(1) > div > div.TermContent.has-richTextToolbar.rt-clean-design > div.TermContent-inner > div.TermContent-inner-padding > div > div > div.TermContent-side.TermContent-side--word',
    // terml: 'div.StudiableItems > div > div:nth-child(1) > div:nth-child(1) > div > div.TermContent.has-richTextToolbar.rt-clean-design > div.TermContent-inner > div.TermContent-inner-padding > div > div > div.TermContent-side.TermContent-side--word > div > div > div.PMEditor.notranslate > div',
    // defs: 'div.StudiableItems > div > div:nth-child(1) > div:nth-child(1) > div > div.TermContent.has-richTextToolbar.rt-clean-design > div.TermContent-inner > div.TermContent-inner-padding > div > div > div.TermContent-side.TermContent-side--definition',
    // defl: 'div.StudiableItems > div > div:nth-child(1) > div:nth-child(1) > div > div.TermContent.has-richTextToolbar.rt-clean-design > div.TermContent-inner > div.TermContent-inner-padding > div > div > div.TermContent-side.TermContent-side--definition > div > div > div.RichTextEditor > div.PMEditor.notranslate > div',
    
    addCard: '#addRow > span > button',
    // addCard: 'span.TermContent-addRowButton button.UILinkButton',

    createSet: '#SetPageTarget > div > div.CreateSetPage-container > div > div > div.CreateSetPage-footer > div > button',
    // #SetPageTarget > div > div.CreateSetHeader.is-sticky.has-adz > div.CreateSetHeader-stickyPlaceholder > div > div > div > div.CreateSetHeader-infoButtonWrap > button
    // createSet: 'div.CreateSetHeader-infoButtonWrap button.UIButton',
    urlbox: 'div.ShareModalOptions-textarea textarea.UITextarea-textarea', // textarea of set url

    toCorF: 'div.UIModalBody > div:nth-child(3) > button', // add to class or folder
    selectToFolder: 'div.UIToggle > span:nth-child(2)',
    createNewFolder: 'div.UIDiv.SaveSetModal-createButton button.UILinkButton',
    addtoFolder: 'input.UISwitch-input',

    usrhead: 'img.Image-image',
    logout: '.SiteHeader-logoutLink button.UILink',
    seller: 'div.UpsellModal'
};

async function shoo(page) {
    let shooed = 'shoo!';
    page.$(query.seller).then(n => shooed = n);

    await page.keyboard.press('Escape');
    while (shooed != null) {
        console.log('shoo!');
        page.$(query.seller).then(n => shooed = n);
        await aSleep(500);
    }
}

async function logout(page) {
    await shoo(page);
    await page.click(query.usrhead);
    await page.click(query.logout);
    console.log('pending for logout');

    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 });
    console.log('logged out');
}

function aSleep(milliseconds) {
    return new Promise(r => setTimeout(r, milliseconds));
}

function getFocused(node) {
    if (node.focused) return node;
    for (const child of node.children || []) {
        const focusedNode = getFocused(child);
        if (focusedNode) return focusedNode;
    }
}

async function getFocusedName(page) {
    let focus = getFocused(await page.accessibility.snapshot());
    return focus ? focus.name : undefined;
}

async function getFocusedValue(page) {
    let focus = getFocused(await page.accessibility.snapshot());
    return focus ? focus.value : undefined;
}

exports.run = async function () {

    const browser = await puppeteer.launch(headlessOptions());
    const page = await browser.newPage();

    await enableStealth(page);
    console.log('prepared');

    await page.goto('https://quizlet.com/create-set', { waitUntil : "networkidle2" });
    console.log('connected');

    try {
        await page.waitForSelector(query.openLogin, { timeout: 800 });
    } catch {
        console.log('already logged in');
        await logout(page);
        await page.goto('https://quizlet.com/create-set', { waitUntil: "networkidle2" });
        console.log('restart goto page');
    }
    await page.click(query.openLogin);

    await page.type(query.id, 'userid');
    await page.type(query.pwd, 'password');

    await page.click(query.login);
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    console.log('newly logged in');

    await page.keyboard.press('Escape');
    await shoo(page);

    const title = 'Biology - Chapter 22: Evolution';
    const desc = 'Add a description';

    // await page.type(query.title, title);
    // await aSleep(2000);
    // await page.type(query.desc, desc);
    // await aSleep(600);

    while (await getFocusedValue(page) != title) await page.keyboard.type(title);
    await page.keyboard.press('Tab');
    while (await getFocusedValue(page) != desc) await page.keyboard.type(desc);
    await page.keyboard.press('Tab');

    // await page.keyboard.type(title);
    // if (getFocusedValue(page) == title) page.keyboard.press('Tab');
    // await page.keyboard.type(desc);
    // if (getFocusedValue(page) != desc) page.keyboard.press('Tab');

    const terms = ['Alliteration','Allusion','Bill of Rights','Base','Culture','Cytoplasm','Diffusion','DNA','Element','Energy'];
    const defs  = ['Repetition of initial consonant sounds','A reference to another work of literature, person, or event','The first ten amendments to the Constitution','A substance that decreases the hydrogen ion concentration in a solution.','Beliefs, customs, and traditions of a specific group of people.','A jellylike fluid inside the cell in which the organelles are suspended','Movement of molecules from an area of higher concentration to an area of lower concentration.','A complex molecule containing the genetic information that makes up the chromosomes.','A pure substance made of only one kind of atom','the ability to do work'];
    
// // i starts from 0
// function getTermS(i) {
//     return `div.StudiableItems > div > div:nth-child(1) > div:nth-child(${i*2+1}) > div > div.TermContent.has-richTextToolbar.rt-clean-design > div.TermContent-inner > div.TermContent-inner-padding > div > div > div.TermContent-side.TermContent-side--word`;
// }
// function getTermL(i) {
//     return `div.StudiableItems > div > div:nth-child(1) > div:nth-child(${i*2+1}) > div > div.TermContent.has-richTextToolbar.rt-clean-design > div.TermContent-inner > div.TermContent-inner-padding > div > div > div.TermContent-side.TermContent-side--word > div > div > div.PMEditor.notranslate > div`;
// }
// function getDefS(i) {
//     return `div.StudiableItems > div > div:nth-child(1) > div:nth-child(${i*2+1}) > div > div.TermContent.has-richTextToolbar.rt-clean-design > div.TermContent-inner > div.TermContent-inner-padding > div > div > div.TermContent-side.TermContent-side--word`;
// }
// function getDefL(i) {
//     return `div.StudiableItems > div > div:nth-child(1) > div:nth-child(${i*2+1}) > div > div.TermContent.has-richTextToolbar.rt-clean-design > div.TermContent-inner > div.TermContent-inner-padding > div > div > div.TermContent-side.TermContent-side--definition > div > div > div.RichTextEditor > div.PMEditor.notranslate > div`;
// }

    // // Add words
    // for (let i = 0; i < terms.length; i++) {await page.click(query.addCard); await aSleep(100);}
    // for (let i = 0; i < terms.length; i++) {
    //     await page.type(getTermS(i), terms[i])
    //     console.log(page.evaluate(() => document.querySelector(`div.StudiableItems > div > div:nth-child(1) > div:nth-child(${i*2+1}) > div > div.TermContent.has-richTextToolbar.rt-clean-design > div.TermContent-inner > div.TermContent-inner-padding > div > div > div.TermContent-side.TermContent-side--word > div > div > div.PMEditor.notranslate > div`)).catch(e => console.error(`i = ${i}\nnth-child = ${i*2-1}\n`+e)));
    //     await page.type(getDefS(i), defs[i])
    //     // await Promise.all([
    //     // ]);
    // }

    // orig add terms
    // *login doesn't use getFocusedValue check: working use of page.type than page.keyboard.type
    for (let i = 0; i < terms.length; i++) {
        await addWord(page, terms[i], defs[i]);
        // console.log(terms[i] + '\t' + defs[i]);
        if (await getFocusedName(page) == '+ Add card') await page.keyboard.press('Enter');
    }

    console.log('words added');

    await page.click(query.createSet);
    // await page.keyboard.press('Tab');
    // await page.keyboard.press('Tab');
    // await page.keyboard.press('Tab');
    // await page.keyboard.press('Enter');

    console.log('saving...');
    await page.waitForSelector(query.urlbox);

    console.log('created set');
    let url = page.url().slice(0, -5);
    console.log('-'.repeat(url.length));
    console.log('Link to created set:');
    console.log(url);
    console.log('-'.repeat(url.length));

    await page.click(query.toCorF);
    await page.click(query.selectToFolder);
    await page.click(query.addtoFolder);
    console.log('added set to folder 워드마스터');

    await logout(page);

    console.log('Cleaning up...');
    await browser.close();
    fs.rmdir('chromeData', { recursive: true, maxRetries: 5, retryDelay: 800 }, err => err ? console.error(err) : console.log('removed chromeData temp folder'))
}

exports.run().catch(err => console.error(err));

async function enableStealth(page) {
// From https://intoli.com/blog/not-possible-to-block-chrome-headless/
// In   https://stackoverflow.com/questions/50663992/puppeteer-queryselector-returns-null/50710920

    // Pass the User-Agent Test.
    // const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' + 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
    const userAgent = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0';
    await page.setUserAgent(userAgent);

    // Pass the Webdriver Test.
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    // Pass the Chrome Test.
    await page.evaluateOnNewDocument(() => {
        window.navigator.chrome = { runtime: {} };
    });

    // Pass the Permissions Test.
    await page.evaluateOnNewDocument(() => {
        const originalQuery = window.navigator.permissions.query;
        return window.navigator.permissions.query = (parameters) => {
            parameters.name === 'notifications' ?
            Promise.resolve({ state: Notification.permission }) :
            originalQuery(parameters);
        };
    });

    // Pass the Plugins Length Test.
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    });

    // Pass the Languages Test.
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    });
}
