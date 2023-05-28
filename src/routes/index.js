const { Router } = require('express');
const router = Router();
const {fetchProjects, buildProposal} = require('../controllers/notificationsController');
const {fetchUpworkProjects} = require('../controllers/upwork/notificationsController');
const db = require('../database/index');
const {subscribe, getPublicVapidKey} = require('../controllers/subscriptionController');
const {sendTestNotification} = require('../controllers/testController');


router.post('/subscribe', subscribe);
router.get('/test-notification', sendTestNotification);
router.get('/fetch-projects', fetchProjects);
router.get('/get-public-vapid-key', getPublicVapidKey);

router.get('/build-bid/:id', buildProposal)


router.get('/fetch-upwork-projects', fetchUpworkProjects);

module.exports = router;