const webspush = require('web-push');        

webspush.setVapidDetails('mailto:andresjosehr@gmail.com', process.env.PUBLIC_VAPID_KEY, process.env.PRIVATE_VAPID_KEY);

module.exports = webspush;