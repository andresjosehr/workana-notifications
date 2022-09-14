const notifier = require('node-notifier');
const open = require('open');


// Object
notifier.notify({
  title: 'My notification',
  message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
  icon: './workana.png',
});

notifier.on('click', function (notifierObject, options) {
  open('https://www.workana.com');
});