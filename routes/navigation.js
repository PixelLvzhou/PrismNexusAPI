const express = require('express');
const { 
  getNavigations, 
  getAllNavigations, 
  createNavigation, 
  updateNavigation, 
  deleteNavigation 
} = require('../controllers/navigationController');
const { authenticateToken } = require('../middleware/auth');
const { requireNavManagePermission } = require('../middleware/admin');

const router = express.Router();

router.get('/navigation', authenticateToken, getNavigations);

router.get('/navigation/all', authenticateToken, requireNavManagePermission, getAllNavigations);

router.post('/navigation', authenticateToken, requireNavManagePermission, createNavigation);

router.put('/navigation/:id', authenticateToken, requireNavManagePermission, updateNavigation);

router.delete('/navigation/:id', authenticateToken, requireNavManagePermission, deleteNavigation);

module.exports = router;