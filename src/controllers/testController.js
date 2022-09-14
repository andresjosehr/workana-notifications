const {query} = require('../database/index');
const webspush = require('../webpush');

const sendTestNotification = async (req, res) => {
  const payload = JSON.stringify({ title: 'Push Test', message: 'Hola mundo' });
  const subscriptions = await query("SELECT * FROM machine_keys");

  subscriptions.forEach(async e => {
      await webspush.sendNotification(JSON.parse(e.subscription), payload).catch(err => console.error(err));
  });

  res.status(200).json();

}

module.exports = {
  sendTestNotification
}