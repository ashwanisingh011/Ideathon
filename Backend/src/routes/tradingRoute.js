import express from 'express';
import {
  getPopularStocks,
  getStockPrice,
  getStockChart,
  getPortfolio,
  buyStock,
  sellStock,
  getTradeHistory,
} from '../controllers/tradingController.js';

const router = express.Router();

// Stock data
router.get('/stocks/popular',          getPopularStocks);
router.get('/stocks/:symbol',          getStockPrice);
router.get('/stocks/:symbol/chart',    getStockChart);

// Portfolio
router.get('/portfolio/:userId',       getPortfolio);

// Trades
router.post('/buy',                    buyStock);
router.post('/sell',                   sellStock);
router.get('/history/:userId',         getTradeHistory);

export default router;