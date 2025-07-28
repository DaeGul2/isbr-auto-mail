import API from './api';

// 프로젝트 생성
export const createProject = async (name) => {
  const res = await API.post('/projects', { name });
  return res.data;
};

// 프로젝트 수정
export const updateProject = async (id, name) => {
  const res = await API.put(`/projects/${id}`, { name });
  return res.data;
};

// 프로젝트 삭제
export const deleteProject = async (id) => {
  const res = await API.delete(`/projects/${id}`);
  return res.data;
};

// 단일 프로젝트 조회
export const fetchProjectById = async (id) => {
  const res = await API.get(`/projects/${id}`);
  return res.data;
};

// 프로젝트 목록 조회 (페이지네이션)
export const fetchProjects = async (page = 1, limit = 20) => {
  const res = await API.get('/projects', {
    params: { page, limit },
  });
  return res.data;
};

// 특정 프로젝트 내 이메일 조회 (페이지네이션)
export const fetchEmailsByProject = async (projectId, page = 1, limit = 20) => {
  const res = await API.get(`/projects/${projectId}/emails`, {
    params: { page, limit },
  });
  return res.data;
};
