import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5001/api',
});

// User calls
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const registerUser = (userData) => API.post('/auth/register', userData);
export const getUserProfile = (username) => API.get(`/users/${username}`);
export const updateProgress = (progressData) => API.post('/users/progress', progressData);
export const getLeaderboard = () => API.get('/users/leaderboard');

// Content calls
export const getModules = () => API.get('/content/modules');
export const getLessons = (moduleId) => API.get(`/content/modules/${moduleId}/lessons`);
export const getQuestions = (lessonId) => API.get(`/content/lessons/${lessonId}/questions`);
export const getModuleContentBundle = (moduleId) => API.get(`/content/modules/${moduleId}/bundle`);

// AI calls
export const generateQuestionsData = (data) => API.post('/ai/generate-question', data);
export const generateDailyContestData = (data) => API.post('/ai/daily-contest', data);
export const generateModuleAIContent = (moduleId, data) => API.post(`/ai/module-content/${moduleId}`, data);
export const getCurrentDayContestQuestions = (username, count = 5) =>
    API.get(`/ai/daily-contest/${username}/current`, { params: { count } });


// ── Trading calls (add these to your existing api.js) ──────────────────────

// Stock data
export const getPopularStocks = () => API.get('/trade/stocks/popular');
export const getStockPrice = (symbol) => API.get(`/trade/stocks/${symbol}`);
export const getStockChart = (symbol, range = '1mo', interval = '1d') =>
  API.get(`/trade/stocks/${symbol}/chart`, { params: { range, interval } });

// Portfolio
export const getPortfolio = (userId) => API.get(`/trade/portfolio/${userId}`);

// Trades
export const buyStock  = (data) => API.post('/trade/buy', data);
export const sellStock = (data) => API.post('/trade/sell', data);
export const getTradeHistory = (userId) => API.get(`/trade/history/${userId}`);

export default API;