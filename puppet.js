const puppeteer = require('puppeteer');

(async () => {
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
  console.log("HERE::::::::::::::");
  const browser = await puppeteer.launch({
    headless: true,
    args: minimal_args
  });

  function delay(time) {
    return new Promise(function(resolve) {
      setTimeout(resolve, time)
    });
  }

  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080
  })
  await page.goto('https://stream1.webrtc2ndi.life/video');
  await page.screenshot({
    path: 'example.png'
  });
  await page.screenshot({
    path: 'example1.png'
  });
  await page.screenshot({
    path: 'example2.png'
  });
  await page.screenshot({
    path: 'example3.png'
  });

  await page.click('#startNdiStreaming')
  console.log('before waiting');
  // await delay(50000);
  //console.log('after waiting');
  // await page.click('#stopNdiStreaming')
  // await browser.close();
})();
