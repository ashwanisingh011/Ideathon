import axios from 'axios';
import { Trade, Portfolio } from '../models/trade.js';
import User from '../models/User.js';

// Popular NSE stocks for quick search
export const POPULAR_STOCKS = [
  { symbol: 'RELIANCE.NS',  name: 'Reliance Industries' },
  { symbol: 'TCS.NS',       name: 'Tata Consultancy Services' },
  { symbol: 'INFY.NS',      name: 'Infosys' },
  { symbol: 'HDFCBANK.NS',  name: 'HDFC Bank' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank' },
  { symbol: 'SBIN.NS',      name: 'State Bank of India' },
  { symbol: 'WIPRO.NS',     name: 'Wipro' },
  { symbol: 'TATAMOTORS.NS',name: 'Tata Motors' },
  { symbol: 'BAJFINANCE.NS',name: 'Bajaj Finance' },
  { symbol: 'ADANIENT.NS',  name: 'Adani Enterprises' },
];

// ── Fetch live price from Yahoo Finance ──────────────────────────────────────
const fetchYahooPrice = async (symbol) => {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
  const { data } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    timeout: 8000,
  });

  const meta = data.chart.result[0].meta;
  return {
    symbol,
    price:        meta.regularMarketPrice,
    open:         meta.regularMarketOpen,
    high:         meta.regularMarketDayHigh,
    low:          meta.regularMarketDayLow,
    prevClose:    meta.chartPreviousClose,
    change:       +(meta.regularMarketPrice - meta.chartPreviousClose).toFixed(2),
    changePct:    +(((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100).toFixed(2),
    volume:       meta.regularMarketVolume,
    currency:     meta.currency,
    marketState:  meta.marketState,  // REGULAR | PRE | POST | CLOSED
  };
};

// ── Fetch historical OHLC data for chart ─────────────────────────────────────
const fetchOHLC = async (symbol, range = '1mo', interval = '1d') => {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
  const { data } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    timeout: 8000,
  });

  const result = data.chart.result[0];
  const timestamps = result.timestamp;
  const ohlcv = result.indicators.quote[0];

  return timestamps.map((ts, i) => ({
    time:   new Date(ts * 1000).toISOString().split('T')[0],
    open:   +ohlcv.open[i]?.toFixed(2),
    high:   +ohlcv.high[i]?.toFixed(2),
    low:    +ohlcv.low[i]?.toFixed(2),
    close:  +ohlcv.close[i]?.toFixed(2),
    volume: ohlcv.volume[i],
  })).filter(d => d.open && d.high && d.low && d.close);
};

// ── GET /api/trade/stocks/popular ────────────────────────────────────────────
export const getPopularStocks = async (req, res) => {
  try {
    const prices = await Promise.all(
      POPULAR_STOCKS.map(async (s) => {
        try {
          const p = await fetchYahooPrice(s.symbol);
          return { ...s, ...p };
        } catch {
          return { ...s, price: null, error: true };
        }
      })
    );
    res.json({ success: true, data: prices });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/trade/stocks/:symbol ────────────────────────────────────────────
export const getStockPrice = async (req, res) => {
  try {
    const data = await fetchYahooPrice(req.params.symbol.toUpperCase());
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stock data. Try again.' });
  }
};

// ── GET /api/trade/stocks/:symbol/chart?range=1mo&interval=1d ───────────────
export const getStockChart = async (req, res) => {
  const { range = '1mo', interval = '1d' } = req.query;
  try {
    const data = await fetchOHLC(req.params.symbol.toUpperCase(), range, interval);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch chart data.' });
  }
};

// ── GET /api/trade/portfolio/:userId ─────────────────────────────────────────
export const getPortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.params.userId });
    if (!portfolio) {
      portfolio = await Portfolio.create({ userId: req.params.userId });
    }

    // Enrich holdings with live prices
    const enriched = await Promise.all(
      portfolio.holdings
        .filter(h => h.quantity > 0)
        .map(async (h) => {
          try {
            const live = await fetchYahooPrice(h.symbol);
            const currentValue = live.price * h.quantity;
            const investedValue = h.avgBuyPrice * h.quantity;
            return {
              ...h.toObject(),
              currentPrice: live.price,
              currentValue: +currentValue.toFixed(2),
              investedValue: +investedValue.toFixed(2),
              pnl:          +(currentValue - investedValue).toFixed(2),
              pnlPct:       +(((currentValue - investedValue) / investedValue) * 100).toFixed(2),
              change:       live.change,
              changePct:    live.changePct,
            };
          } catch {
            return h.toObject();
          }
        })
    );

    res.json({
      success: true,
      data: {
        virtualCash: portfolio.virtualCash,
        holdings:    enriched,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── POST /api/trade/buy ───────────────────────────────────────────────────────
export const buyStock = async (req, res) => {
  const { userId, symbol, name, quantity } = req.body;
  if (!userId || !symbol || !quantity || quantity <= 0) {
    return res.status(400).json({ message: 'userId, symbol, and quantity are required.' });
  }

  try {
    const live = await fetchYahooPrice(symbol.toUpperCase());
    const total = +(live.price * quantity).toFixed(2);

    let portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) portfolio = await Portfolio.create({ userId });

    if (portfolio.virtualCash < total) {
      return res.status(400).json({ message: `Insufficient funds. Need ₹${total}, have ₹${portfolio.virtualCash.toFixed(2)}` });
    }

    // Deduct cash
    portfolio.virtualCash = +(portfolio.virtualCash - total).toFixed(2);

    // Update or add holding
    const holdingIdx = portfolio.holdings.findIndex(h => h.symbol === symbol.toUpperCase());
    if (holdingIdx >= 0) {
      const h = portfolio.holdings[holdingIdx];
      const newQty = h.quantity + quantity;
      h.avgBuyPrice = +((h.avgBuyPrice * h.quantity + live.price * quantity) / newQty).toFixed(2);
      h.quantity = newQty;
    } else {
      portfolio.holdings.push({ symbol: symbol.toUpperCase(), name, quantity, avgBuyPrice: live.price });
    }

    await portfolio.save();

    // Log trade
    await Trade.create({ userId, symbol: symbol.toUpperCase(), name, type: 'BUY', quantity, price: live.price, total });

    // Award XP
    await User.findByIdAndUpdate(userId, { $inc: { xp: 10 } });

    res.json({ success: true, message: `Bought ${quantity} shares of ${symbol} at ₹${live.price}`, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── POST /api/trade/sell ──────────────────────────────────────────────────────
export const sellStock = async (req, res) => {
  const { userId, symbol, quantity } = req.body;
  if (!userId || !symbol || !quantity || quantity <= 0) {
    return res.status(400).json({ message: 'userId, symbol, and quantity are required.' });
  }

  try {
    const live = await fetchYahooPrice(symbol.toUpperCase());
    const total = +(live.price * quantity).toFixed(2);

    const portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) return res.status(404).json({ message: 'Portfolio not found.' });

    const holdingIdx = portfolio.holdings.findIndex(h => h.symbol === symbol.toUpperCase());
    if (holdingIdx < 0 || portfolio.holdings[holdingIdx].quantity < quantity) {
      return res.status(400).json({ message: 'Not enough shares to sell.' });
    }

    // Add cash back
    portfolio.virtualCash = +(portfolio.virtualCash + total).toFixed(2);

    // Reduce holding
    portfolio.holdings[holdingIdx].quantity -= quantity;

    await portfolio.save();

    // Log trade
    await Trade.create({ userId, symbol: symbol.toUpperCase(), type: 'SELL', quantity, price: live.price, total });

    // Award XP
    await User.findByIdAndUpdate(userId, { $inc: { xp: 10 } });

    res.json({ success: true, message: `Sold ${quantity} shares of ${symbol} at ₹${live.price}`, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET /api/trade/history/:userId ───────────────────────────────────────────
export const getTradeHistory = async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: trades });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};