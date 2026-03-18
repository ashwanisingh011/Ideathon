import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5001/api',
});

export const getUserProfile = (username) => {
  return API.get(`/users/${username}`);
};