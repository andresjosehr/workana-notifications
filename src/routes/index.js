const { Router } = require('express');
const router = Router();
const {fetchProjects, buildProposal} = require('../controllers/notificationsController');
const {fetchUpworkProjects} = require('../controllers/upwork/notificationsController');
const db = require('../database/index');
const {subscribe, getPublicVapidKey} = require('../controllers/subscriptionController');
const {sendTestNotification} = require('../controllers/testController');


router.post('/subscribe', subscribe);
router.get('/test-notification', sendTestNotification);

router.get('/get-public-vapid-key', getPublicVapidKey);

router.get('/build-bid/:id/:platform', buildProposal)

router.get('/fetch-projects', (req, res) => {
  try {
    fetchProjects(req, res, db);  
  } catch (error) {
    
  }

  try {
    fetchUpworkProjects(req, res, db);  
  } catch (error) {
    
  }
  
  

  res.status(200).json({message: 'Success'});
});


module.exports = router;