const { Router } = require('express');
const webspush = require('../webpush');
const router = Router();
let pushSubscription;

router.post('/subscribe', async (req, res) => {
  pushSubscription = req.body;
  res.status(200).json();
});



router.get('/noti', async (req, res) => {
  const payload = JSON.stringify({ title: 'Push Test', message: 'Hola mundo' });
  res.status(200).json();
  await webspush.sendNotification(pushSubscription, payload).catch(err => console.error(err));
});

module.exports = router;