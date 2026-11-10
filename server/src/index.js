import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { pool } from './db.js';
import leadsRouter from './routes/leads.js';
import dashboardRouter from './routes/dashboard.js';
import { ErroHttp } from './validacao.js';

const app = express();
app.use(cors());
app.use(express.json());

// Rota de saúde: confirma que a API e o banco estão respondendo
app.get('/api/health', async (req, res, next) => {
  try {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM leads');
    res.json({ ok: true, leads: total });
  } catch (err) {
    next(err);
  }
});

app.use('/api/leads', leadsRouter);
app.use('/api/dashboard', dashboardRouter);

// Middleware de erro central: erros esperados (ErroHttp) viram 4xx, o resto vira 500
app.use((err, req, res, next) => {
  if (err instanceof ErroHttp) return res.status(err.status).json({ erro: err.message });
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API rodando em http://localhost:${port}`));
