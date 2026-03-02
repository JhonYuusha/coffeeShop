require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

// Form HTML (token)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const paymentRoutes = require('./routes/payment.routes');
app.use('/api/payment', paymentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Backend rodando na porta ${PORT}`);
});