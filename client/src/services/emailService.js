import API from './api';

export const sendEmail = async (payload, files = []) => {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    form.append(key, value);
  });
  files.forEach((file) => {
    form.append('attachments', file);
  });

  const res = await API.post('/emails', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

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
