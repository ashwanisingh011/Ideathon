import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5173/api',
});

export const getUserProfile = (username) => {
  return API.get(`/user/${username}`);
};