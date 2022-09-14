const { Router } = require('express');
const router = Router();
const {fetchProjects} = require('../controllers/notificationsController');
const db = require('../database/index');
const {subscribe, getPublicVapidKey} = require('../controllers/subscriptionController');
const {sendTestNotification} = require('../controllers/testController');


router.post('/subscribe', subscribe);
router.get('/test-notification', sendTestNotification);
router.get('/fetch-projects', fetchProjects);
router.get('/get-public-vapid-key', getPublicVapidKey);

module.exports = router;