import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL;

export const loginWithCode = async (code) => {
  const res = await axios.post(`${BASE_URL.replace(/\/$/, '')}/auth/login`, { code });
  return res.data; // { token }
};
