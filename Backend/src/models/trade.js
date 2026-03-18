import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol:     { type: String, required: true },   // e.g. "RELIANCE.NS"
  name:       { type: String },                   // e.g. "Reliance Industries"
  type:       { type: String, enum: ['BUY', 'SELL'], required: true },
  quantity:   { type: Number, required: true },
  price:      { type: Number, required: true },   // price at execution
  total:      { type: Number, required: true },   // quantity * price
}, { timestamps: true });

const portfolioSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  virtualCash:   { type: Number, default: 100000 },  // ₹1,00,000 starting balance
  holdings: [{
    symbol:       { type: String, required: true },
    name:         { type: String },
    quantity:     { type: Number, default: 0 },
    avgBuyPrice:  { type: Number, default: 0 },
  }],
}, { timestamps: true });

export const Trade     = mongoose.model('Trade', tradeSchema);
export const Portfolio = mongoose.model('Portfolio', portfolioSchema);