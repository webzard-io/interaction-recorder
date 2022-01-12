module.exports = {
  launch: {
    headless: true,
    product: 'chrome',
    devtools: false,
    // we need to ignore this flag to controll scrollbar by page.mouse in headless mode
    ignoreDefaultArgs: ['--hide-scrollbars'],
  },
};
