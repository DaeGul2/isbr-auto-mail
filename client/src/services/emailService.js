import API from './api';

export const sendEmail = async (data) => {
  const res = await API.post('/emails', data);
  return res.data;
};

export const fetchEmails = async (page = 1, limit = 10) => {
  const res = await API.get('/emails', {
    params: { page, limit },
  });
  return res.data;
};

export const fetchEmailById = async (id) => {
  const res = await API.get(`/emails/${id}`);
  return res.data;
};

export const deleteEmail = async (id) => {
  const res = await API.delete(`/emails/${id}`);
  return res.data;
};
