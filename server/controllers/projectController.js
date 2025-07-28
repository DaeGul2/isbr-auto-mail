const { Project, Email } = require('../db');

// ✅ 프로젝트 목록 조회 (이미 구현됨)
const getAllProjects = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const result = await Project.findAndCountAll({
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  res.json({
    total: result.count,
    page,
    limit,
    projects: result.rows,
  });
};

// ✅ 단일 프로젝트 조회
const getProjectById = async (req, res) => {
  const { id } = req.params;
  const project = await Project.findByPk(id);

  if (!project) {
    return res.status(404).json({ message: '프로젝트를 찾을 수 없습니다.' });
  }

  res.json(project);
};

// ✅ 프로젝트 생성
const createProject = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: '프로젝트명을 입력해주세요.' });
  }

  const newProject = await Project.create({ name });
  res.status(201).json(newProject);
};

// ✅ 프로젝트 수정
const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const project = await Project.findByPk(id);
  if (!project) {
    return res.status(404).json({ message: '프로젝트를 찾을 수 없습니다.' });
  }

  project.name = name || project.name;
  await project.save();

  res.json(project);
};

// ✅ 프로젝트 삭제
const deleteProject = async (req, res) => {
  const { id } = req.params;

  const project = await Project.findByPk(id);
  if (!project) {
    return res.status(404).json({ message: '프로젝트를 찾을 수 없습니다.' });
  }

  await project.destroy();
  res.json({ message: '삭제 완료' });
};

// ✅ 특정 프로젝트 내 이메일 목록
const getEmailsByProject = async (req, res) => {
  const { projectId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const result = await Email.findAndCountAll({
    where: { projectId },
    order: [['id', 'DESC']],
    limit,
    offset,
  });

  res.json({
    total: result.count,
    page,
    limit,
    emails: result.rows,
  });
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getEmailsByProject,
};
