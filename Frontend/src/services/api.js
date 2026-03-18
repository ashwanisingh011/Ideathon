import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5001/api',
});

// User calls
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const registerUser = (userData) => API.post('/auth/register', userData);
export const getUserProfile = (username) => API.get(`/users/${username}`);
export const updateProgress = (progressData) => API.post('/users/progress', progressData);

// Content calls
export const getModules = () => API.get('/content/modules');
export const getLessons = (moduleId) => API.get(`/content/modules/${moduleId}/lessons`);
export const getQuestions = (lessonId) => API.get(`/content/lessons/${lessonId}/questions`);

// AI calls
export const generateQuestionsData = (data) => API.post('/ai/generate-question', data);
export const generateDailyContestData = (data) => API.post('/ai/daily-contest', data);
export const getCurrentDayContestQuestions = (username, count = 5) =>
    API.get(`/ai/daily-contest/${username}/current`, { params: { count } });

export default API;