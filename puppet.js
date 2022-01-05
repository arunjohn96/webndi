const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const puppeteer = require('puppeteer');
const port = 9001;
var browser;
app.use(express.json())
app.post('/bot/url', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  console.log(req.body);
  let url = req.body.url
  console.log(url);
  startBot(url)
    .then(() => {
      res.send({
        message: 'success',
        data: req.body
      })
    })
    .catch((err) => {
      res.send({
        message: 'failed',
        error: err
      })
    })
})
async function startBot(url) {
  console.log(browser);
  if(typeof browser !== 'undefined'){
    await browser.close()
  }
  const minimal_args = [
    '--autoplay-policy=user-gesture-required',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-breakpad',
    '--disable-client-side-phishing-detection',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-dev-shm-usage',
    '--disable-domain-reliability',
    '--disable-extensions',
    '--disable-features=AudioServiceOutOfProcess',
    '--disable-hang-monitor',
    '--disable-ipc-flooding-protection',
    '--disable-notifications',
    '--disable-offer-store-unmasked-wallet-cards',
    '--disable-popup-blocking',
    '--disable-print-preview',
    '--disable-prompt-on-repost',
    '--disable-renderer-backgrounding',
    '--disable-setuid-sandbox',
    '--disable-speech-api',
    '--disable-sync',
    '--hide-scrollbars',
    '--ignore-gpu-blacklist',
    '--metrics-recording-only',
    '--mute-audio',
    '--no-default-browser-check',
    '--no-first-run',
    '--no-pings',
    '--no-sandbox',
    '--no-zygote',
    '--password-store=basic',
    '--use-gl=swiftshader',
    '--use-mock-keychain',
  ];
  console.log("Launching Headless Browser::::::::::::");
  browser = await puppeteer.launch({
    headless: true,
    ignoreHTTPSErrors: true,
    args: minimal_args
  });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080
  })
  // await page.goto('http://localhost:9000/stream/video');
  var PUPPET_URL = url
  await page.goto(`${PUPPET_URL}`);
  console.log("Navigated to Page::::::::::::: ", PUPPET_URL, "IP:::");
  await page.click('#startNdiStreaming')
  console.log("Starting NDI :::::::::::::");
};
server.listen(port, () => console.log(`Server is running on port ${port}`));
