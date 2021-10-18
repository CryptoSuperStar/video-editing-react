const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const getMeta = require('../middleware/meta');
const reformatVideo = require('../middleware/reformatVideo');
const {updateProject,
  createTempProjectController,
  clearTempProject,
  cutTempProjectController,
  createProjectController,
  getProjects,
  getProject,
  takeScreenShotController,
  addMediaToProject,
  updateCommentsController, deleteVideo} = require('../controllers/projects.controller');

router.post('/createTempProject', auth, getMeta, createTempProjectController);
router.put('/addMedia', auth, getMeta, addMediaToProject);
router.put('/updateComments/:projectId', updateCommentsController);
router.post('/takeScreenshot', auth, getMeta,  takeScreenShotController);
router.get('/clearTempProject/:projectId/:bucket', auth, clearTempProject);
router.post('/cutTempProject', auth, cutTempProjectController);
router.put('/updateProject', updateProject);
router.post('/createProject', auth, createProjectController)
router.get('/getProjects', auth, getProjects)
router.get('/getProject/:id', getProject)
router.put('/deleteVideo/:projectId', auth, deleteVideo);

module.exports = router;