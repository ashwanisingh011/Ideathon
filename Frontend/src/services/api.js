import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5001/api',
});

// User calls
export const loginUser = (username) => API.post('/users/login', { username });
export const getUserProfile = (username) => API.get(`/users/${username}`);
export const updateProgress = (progressData) => API.post('/users/progress', progressData);
export const getLeaderboard = () => API.get('/users/leaderboard');

// Content calls
export const getModules = () => API.get('/content/modules');
export const getLessons = (moduleId) => API.get(`/content/modules/${moduleId}/lessons`);
export const getQuestions = (lessonId) => API.get(`/content/lessons/${lessonId}/questions`);

export default API;