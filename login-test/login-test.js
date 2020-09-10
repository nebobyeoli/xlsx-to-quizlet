// const pptr = require('puppeteer');
const ppt = require('puppeteer-core');

const wsChromeEndpointUrl = 'ws://127.0.0.1:9222/devtools/browser/45ca84e5-a27b-49df-8cd9-b74d6f518ef3';

// ppt.launch({
//     executablePath: '"C:/Program Files (x86)/Google/Chrome/Application/chrome.exe" –remote-debugging-port=9222',
//     userDataDir: 'C:/Users/nikki/AppData/Local/Google/Chrome/User Data/Default',
//     headless : false
// }).then(async browser => {
//     await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36');
//     console.log(await page.evaluate('navigator.userAgent'));
// });

ppt.connect({
    browserWSEndpoint: wsChromeEndpointUrl,
    defaultViewport: null,
}).then(async browser => {

    // const brows = await ppt.connect({
    //     
    // })

    const page = await browser.newPage();

    // await page.setViewport({width:1920, height:0});
    await page.goto("https://quizlet.com/create-set");
    await page.screenshot('login-test/eg-quizlet.png');
    // await browser.close();
});
