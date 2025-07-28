const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getEmailsByProject,
} = require('../controllers/projectController');

router.get('/', getAllProjects);                      // 전체 프로젝트 조회
router.get('/:id', getProjectById);                   // 단일 조회
router.post('/', createProject);                      // 생성
router.put('/:id', updateProject);                    // 수정
router.delete('/:id', deleteProject);                 // 삭제
router.get('/:projectId/emails', getEmailsByProject); // 프로젝트 내 이메일 목록

module.exports = router;
