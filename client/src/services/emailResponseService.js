import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL;

export const getEmailResponseStatus = async (token) => {
  const res = await axios.get(`${BASE_URL}/email-responses/${token}`);
  return res.data;
};

export const submitEmailResponse = async (token, { status, comment }) => {
  const res = await axios.post(`${BASE_URL}/email-responses/${token}`, {
    status,
    comment,
  });
  return res.data;
};
