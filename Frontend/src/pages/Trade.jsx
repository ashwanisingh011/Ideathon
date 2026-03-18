import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  getPopularStocks, getStockPrice, getStockChart,
  getPortfolio, buyStock, sellStock, getTradeHistory
} from '../services/api';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  TrendingUp, TrendingDown, ArrowLeft, Search,
  Wallet, BarChart2, ShoppingCart, DollarSign, Zap
} from 'lucide-react';

const RANGES = [
  { label: '1D', range: '1d',  interval: '5m'  },
  { label: '1W', range: '5d',  interval: '1h'  },
  { label: '1M', range: '1mo', interval: '1d'  },
  { label: '3M', range: '3mo', interval: '1d'  },
  { label: '1Y', range: '1y',  interval: '1wk' },
];

const duo = {
  green:      '#58cc02',
  greenDark:  '#46a302',
  greenLight: '#d7ffb8',
  blue:       '#1cb0f6',
  blueDark:   '#1899d6',
  blueLight:  '#ddf4ff',
  red:        '#ff4b4b',
  redLight:   '#ffdfe0',
  yellow:     '#ffc800',
  bg:         '#f7f7f7',
  white:      '#ffffff',
  border:     '#e5e7eb',
  text:       '#3c3c3c',
  muted:      '#afafaf',
};

const fmt = (n) => n != null
  ? `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  : '—';
const fmtPct = (n) => n != null ? `${n > 0 ? '+' : ''}${n}%` : '—';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: duo.white, border: `2px solid ${duo.border}`,
      borderRadius: 16, padding: '10px 16px', boxShadow: `0 4px 0 ${duo.border}`,
    }}>
      <p style={{ color: duo.muted, fontSize: 11, fontWeight: 700, marginBottom: 2 }}>{label}</p>
      <p style={{ color: duo.blue, fontWeight: 800, fontSize: 16 }}>{fmt(payload[0]?.value)}</p>
    </div>
  );
};

const card = {
  background: duo.white, borderRadius: 20,
  border: `2px solid ${duo.border}`, boxShadow: `0 4px 0 ${duo.border}`,
  padding: 20, marginBottom: 16,
};

const Trading = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab]                     = useState('market');
  const [popularStocks, setPopularStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [chartData, setChartData]         = useState([]);
  const [chartRange, setChartRange]       = useState(RANGES[2]);
  const [portfolio, setPortfolio]         = useState(null);
  const [tradeHistory, setTradeHistory]   = useState([]);
  const [quantity, setQuantity]           = useState(1);
  const [loading, setLoading]             = useState(false);
  const [chartLoading, setChartLoading]   = useState(false);
  const [toast, setToast]                 = useState(null);
  const [search, setSearch]               = useState('');
  const [searching, setSearching]         = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getPopularStocks();
        setPopularStocks(res.data.data);
        if (res.data.data.length > 0) selectStock(res.data.data[0]);
      } catch { showToast('Failed to load stocks', 'error'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!user?._id) return;
    loadPortfolio();
    loadHistory();
  }, [user]);

  const loadPortfolio = async () => {
    try { const res = await getPortfolio(user._id); setPortfolio(res.data.data); } catch {}
  };
  const loadHistory = async () => {
    try { const res = await getTradeHistory(user._id); setTradeHistory(res.data.data); } catch {}
  };
  const selectStock = async (stock) => {
    setSelectedStock(stock); setQuantity(1);
    loadChart(stock.symbol, chartRange);
  };
  const loadChart = async (symbol, rangeObj) => {
    setChartLoading(true);
    try { const res = await getStockChart(symbol, rangeObj.range, rangeObj.interval); setChartData(res.data.data); }
    catch {} finally { setChartLoading(false); }
  };
  const handleRangeChange = (r) => { setChartRange(r); if (selectedStock) loadChart(selectedStock.symbol, r); };
  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const symbol = search.includes('.') ? search.toUpperCase() : `${search.toUpperCase()}.NS`;
      const res = await getStockPrice(symbol);
      const stock = { symbol, name: symbol, ...res.data.data };
      setPopularStocks(prev => [stock, ...prev.filter(s => s.symbol !== symbol)]);
      selectStock(stock); setSearch('');
    } catch { showToast('Stock not found', 'error'); }
    finally { setSearching(false); }
  };
  const handleBuy = async () => {
    if (!selectedStock || !user?._id) return;
    try {
      const res = await buyStock({ userId: user._id, symbol: selectedStock.symbol, name: selectedStock.name, quantity: Number(quantity) });
      showToast(`🎉 ${res.data.message}`); loadPortfolio();
    } catch (err) { showToast(err.response?.data?.message || 'Buy failed', 'error'); }
  };
  const handleSell = async () => {
    if (!selectedStock || !user?._id) return;
    try {
      const res = await sellStock({ userId: user._id, symbol: selectedStock.symbol, quantity: Number(quantity) });
      showToast(`✅ ${res.data.message}`); loadPortfolio();
    } catch (err) { showToast(err.response?.data?.message || 'Sell failed', 'error'); }
  };

  const isUp = selectedStock?.changePct >= 0;
  const chartColor = isUp ? duo.green : duo.red;
  const totalPnL = portfolio?.holdings?.reduce((acc, h) => acc + (h.pnl || 0), 0) || 0;

  const btnBase = {
    flex: 1, border: 'none', borderRadius: 14, padding: '14px 0',
    fontWeight: 900, fontSize: 15, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: 'Nunito, sans-serif', transition: 'transform 0.1s, box-shadow 0.1s',
  };

  return (
    <div style={{ minHeight: '100vh', background: duo.bg }}>
      <div style={{ maxWidth: '768px', margin: '0 auto', minHeight: '100vh', background: duo.white, fontFamily: "'Nunito', sans-serif", paddingBottom: 80 }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, padding: '12px 24px', borderRadius: 16, fontWeight: 800,
          fontSize: 14, boxShadow: '0 4px 0 rgba(0,0,0,0.15)',
          background: toast.type === 'error' ? duo.red : duo.green,
          color: '#fff', whiteSpace: 'nowrap',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 40, background: duo.white,
        borderBottom: `2px solid ${duo.border}`, padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: `0 2px 0 ${duo.border}`,
      }}>
        <button onClick={() => navigate('/home')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: duo.muted }}>
          <ArrowLeft size={26} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={22} color={duo.green} />
          <span style={{ fontWeight: 900, fontSize: 18, color: duo.text }}>Viksit Markets</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: duo.greenLight, borderRadius: 20, padding: '4px 12px',
          border: `2px solid ${duo.green}`,
        }}>
          <Zap size={14} color={duo.green} />
          <span style={{ fontWeight: 800, fontSize: 13, color: duo.greenDark }}>{user?.xp ?? 0} XP</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: duo.white, borderBottom: `2px solid ${duo.border}`, padding: '0 16px', gap: 4 }}>
        {['market', 'portfolio', 'history'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '14px 16px', fontWeight: 800, fontSize: 13, border: 'none',
            background: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1,
            color: tab === t ? duo.green : duo.muted,
            borderBottom: tab === t ? `3px solid ${duo.green}` : '3px solid transparent',
            transition: 'all 0.15s',
          }}>
            {t}
          </button>
        ))}
      </div>

      {/* ── MARKET TAB ───────────────────────────────────────────────────── */}
      {tab === 'market' && (
        <div>
          {/* Search */}
          <div style={{ padding: '12px 16px', background: duo.white, borderBottom: `2px solid ${duo.border}` }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search NSE symbol (e.g. INFY)..."
                style={{
                  flex: 1, background: duo.bg, border: `2px solid ${duo.border}`,
                  borderRadius: 12, padding: '10px 16px', fontSize: 14, fontWeight: 700,
                  color: duo.text, outline: 'none', fontFamily: 'Nunito, sans-serif',
                }}
              />
              <button onClick={handleSearch} disabled={searching} style={{
                background: duo.blue, border: 'none', borderRadius: 12,
                padding: '10px 16px', cursor: 'pointer', boxShadow: `0 4px 0 ${duo.blueDark}`,
              }}>
                <Search size={18} color="#fff" />
              </button>
            </div>
          </div>

          {/* Horizontal stock scroller */}
          <div style={{ background: duo.white, borderBottom: `2px solid ${duo.border}`, overflowX: 'auto' }}>
            <div style={{ display: 'flex' }}>
              {loading ? (
                <div style={{ padding: 20, color: duo.muted, fontWeight: 700 }}>Loading...</div>
              ) : popularStocks.map((s) => (
                <button key={s.symbol} onClick={() => selectStock(s)} style={{
                  padding: '12px 16px', border: 'none', cursor: 'pointer', minWidth: 100,
                  textAlign: 'left', transition: 'all 0.15s',
                  background: selectedStock?.symbol === s.symbol ? duo.blueLight : 'transparent',
                  borderBottom: selectedStock?.symbol === s.symbol ? `3px solid ${duo.blue}` : '3px solid transparent',
                }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: duo.text }}>{s.symbol.replace('.NS', '')}</div>
                  <div style={{ fontWeight: 800, fontSize: 12, marginTop: 2, color: (s.changePct ?? 0) >= 0 ? duo.green : duo.red }}>
                    {fmtPct(s.changePct)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stock detail */}
          {selectedStock && (
            <div style={{ padding: 16 }}>
              {/* Header card */}
              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 900, fontSize: 22, color: duo.text }}>{selectedStock.symbol?.replace('.NS', '')}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20,
                        background: selectedStock.marketState === 'REGULAR' ? duo.greenLight : '#fff8e1',
                        color: selectedStock.marketState === 'REGULAR' ? duo.greenDark : '#b45309',
                        border: `1.5px solid ${selectedStock.marketState === 'REGULAR' ? duo.green : duo.yellow}`,
                      }}>
                        {selectedStock.marketState || 'CLOSED'}
                      </span>
                    </div>
                    <div style={{ color: duo.muted, fontWeight: 700, fontSize: 13, marginTop: 2 }}>{selectedStock.name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 900, fontSize: 26, color: duo.text }}>{fmt(selectedStock.price)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 2 }}>
                      {isUp ? <TrendingUp size={14} color={duo.green} /> : <TrendingDown size={14} color={duo.red} />}
                      <span style={{ fontWeight: 800, fontSize: 13, color: isUp ? duo.green : duo.red }}>
                        {fmt(selectedStock.change)} ({fmtPct(selectedStock.changePct)})
                      </span>
                    </div>
                  </div>
                </div>
                {/* OHLV */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 16 }}>
                  {[['Open', selectedStock.open], ['High', selectedStock.high], ['Low', selectedStock.low], ['Prev', selectedStock.prevClose]].map(([label, val]) => (
                    <div key={label} style={{ background: duo.bg, borderRadius: 12, padding: '10px 12px', border: `2px solid ${duo.border}` }}>
                      <div style={{ color: duo.muted, fontSize: 10, fontWeight: 800, marginBottom: 3 }}>{label}</div>
                      <div style={{ fontWeight: 800, fontSize: 12, color: duo.text }}>{fmt(val)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart card */}
              <div style={card}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                  {RANGES.map(r => (
                    <button key={r.label} onClick={() => handleRangeChange(r)} style={{
                      padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                      fontWeight: 800, fontSize: 12, fontFamily: 'Nunito, sans-serif',
                      background: chartRange.label === r.label ? duo.blue : duo.bg,
                      color: chartRange.label === r.label ? '#fff' : duo.muted,
                      boxShadow: chartRange.label === r.label ? `0 3px 0 ${duo.blueDark}` : `0 3px 0 ${duo.border}`,
                    }}>
                      {r.label}
                    </button>
                  ))}
                </div>
                {chartLoading ? (
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: duo.muted, fontWeight: 700 }}>
                    Loading chart...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="duoGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={chartColor} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={duo.border} />
                      <XAxis dataKey="time" tick={{ fill: duo.muted, fontSize: 10, fontWeight: 700, fontFamily: 'Nunito' }}
                        tickLine={false} axisLine={false} tickFormatter={v => v?.slice(5)} interval="preserveStartEnd" />
                      <YAxis tick={{ fill: duo.muted, fontSize: 10, fontWeight: 700, fontFamily: 'Nunito' }}
                        tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} domain={['auto', 'auto']} width={65} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="close" stroke={chartColor} strokeWidth={2.5}
                        fill="url(#duoGrad)" dot={false} activeDot={{ r: 5, fill: chartColor, stroke: '#fff', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Buy/Sell card */}
              <div style={card}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, fontWeight: 800, color: duo.muted, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Quantity</label>
                    <input type="number" min="1" value={quantity}
                      onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{
                        width: '100%', background: duo.bg, border: `2px solid ${duo.border}`,
                        borderRadius: 12, padding: '12px 16px', fontSize: 16, fontWeight: 800,
                        color: duo.text, outline: 'none', fontFamily: 'Nunito, sans-serif', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, fontWeight: 800, color: duo.muted, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Total Cost</label>
                    <div style={{
                      background: duo.greenLight, border: `2px solid ${duo.green}`,
                      borderRadius: 12, padding: '12px 16px', fontSize: 16, fontWeight: 800, color: duo.greenDark,
                    }}>
                      {fmt((selectedStock.price || 0) * quantity)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={handleBuy}
                    onMouseDown={e => { e.currentTarget.style.transform='translateY(3px)'; e.currentTarget.style.boxShadow='0 1px 0 '+duo.greenDark; }}
                    onMouseUp={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=`0 4px 0 ${duo.greenDark}`; }}
                    style={{ ...btnBase, background: duo.green, color: '#fff', boxShadow: `0 4px 0 ${duo.greenDark}` }}>
                    <ShoppingCart size={16} /> BUY
                  </button>
                  <button onClick={handleSell}
                    onMouseDown={e => { e.currentTarget.style.transform='translateY(3px)'; e.currentTarget.style.boxShadow='0 1px 0 #cc0000'; }}
                    onMouseUp={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 0 #cc0000'; }}
                    style={{ ...btnBase, background: duo.red, color: '#fff', boxShadow: '0 4px 0 #cc0000' }}>
                    <DollarSign size={16} /> SELL
                  </button>
                </div>

                <div style={{ marginTop: 12, textAlign: 'center', fontWeight: 700, fontSize: 13, color: duo.muted }}>
                  Available cash: <span style={{ color: duo.green, fontWeight: 900 }}>{fmt(portfolio?.virtualCash)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PORTFOLIO TAB ─────────────────────────────────────────────────── */}
      {tab === 'portfolio' && (
        <div style={{ padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { icon: <Wallet size={20} color={duo.blue} />, label: 'Cash', val: fmt(portfolio?.virtualCash), color: duo.blue, bg: duo.blueLight, br: duo.blue },
              { icon: <BarChart2 size={20} color={totalPnL >= 0 ? duo.green : duo.red} />, label: 'Total P&L', val: fmt(totalPnL), color: totalPnL >= 0 ? duo.green : duo.red, bg: totalPnL >= 0 ? duo.greenLight : duo.redLight, br: totalPnL >= 0 ? duo.green : duo.red },
            ].map((c, i) => (
              <div key={i} style={{ background: c.bg, border: `2px solid ${c.br}`, borderRadius: 20, padding: 16, boxShadow: `0 4px 0 ${c.br}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  {c.icon}
                  <span style={{ fontSize: 11, fontWeight: 800, color: duo.muted, textTransform: 'uppercase', letterSpacing: 1 }}>{c.label}</span>
                </div>
                <div style={{ fontWeight: 900, fontSize: 20, color: c.color }}>{c.val}</div>
              </div>
            ))}
          </div>

          <div style={{ fontWeight: 800, fontSize: 11, color: duo.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>Holdings</div>

          {!portfolio?.holdings?.length ? (
            <div style={{ ...card, textAlign: 'center', color: duo.muted, fontWeight: 700, padding: 40 }}>
              🌱 No holdings yet. Buy some stocks to get started!
            </div>
          ) : portfolio.holdings.map((h, i) => (
            <div key={i} style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 16, color: duo.text }}>{h.symbol?.replace('.NS', '')}</div>
                <div style={{ fontWeight: 700, fontSize: 12, color: duo.muted, marginTop: 2 }}>{h.quantity} shares · avg {fmt(h.avgBuyPrice)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 900, fontSize: 15, color: duo.text }}>{fmt(h.currentValue)}</div>
                <div style={{ fontWeight: 800, fontSize: 12, marginTop: 2, color: h.pnl >= 0 ? duo.green : duo.red }}>
                  {h.pnl >= 0 ? '+' : ''}{fmt(h.pnl)} ({fmtPct(h.pnlPct)})
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── HISTORY TAB ───────────────────────────────────────────────────── */}
      {tab === 'history' && (
        <div style={{ padding: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 11, color: duo.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>Trade History</div>

          {!tradeHistory.length ? (
            <div style={{ ...card, textAlign: 'center', color: duo.muted, fontWeight: 700, padding: 40 }}>📋 No trades yet.</div>
          ) : tradeHistory.map((t, i) => (
            <div key={i} style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 14, fontWeight: 900, fontSize: 11,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: t.type === 'BUY' ? duo.greenLight : duo.redLight,
                  color: t.type === 'BUY' ? duo.greenDark : duo.red,
                  border: `2px solid ${t.type === 'BUY' ? duo.green : duo.red}`,
                }}>
                  {t.type}
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 15, color: duo.text }}>{t.symbol?.replace('.NS', '')}</div>
                  <div style={{ fontWeight: 700, fontSize: 12, color: duo.muted, marginTop: 2 }}>
                    {t.quantity} shares · {new Date(t.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 900, fontSize: 15, color: duo.text }}>{fmt(t.total)}</div>
                <div style={{ fontWeight: 700, fontSize: 12, color: duo.muted, marginTop: 2 }}>@ {fmt(t.price)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
};

export default Trading;