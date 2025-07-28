import API from './api';

export const downloadFile = async (fileId) => {
  const link = document.createElement('a');
  link.href = `${process.env.REACT_APP_API_URL}/email-files/${fileId}/download`;
  link.target = '_blank';
  link.rel = 'noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
};
