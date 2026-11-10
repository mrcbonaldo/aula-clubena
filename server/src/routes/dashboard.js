import { Router } from 'express';
import { pool } from '../db.js';
import { STATUS } from '../validacao.js';

const router = Router();

// GET /api/dashboard: total, quantidade por status e valor total em Ganho
router.get('/', async (req, res, next) => {
  try {
    const [linhas] = await pool.query(
      'SELECT status, COUNT(*) AS quantidade, SUM(valor_estimado) AS valor FROM leads GROUP BY status',
    );
    // Garante todos os status na resposta, inclusive os com 0 leads
    const porStatus = STATUS.map((status) => {
      const l = linhas.find((x) => x.status === status);
      return { status, quantidade: l ? l.quantidade : 0 };
    });
    res.json({
      total: porStatus.reduce((soma, s) => soma + s.quantidade, 0),
      porStatus,
      valorGanho: Number(linhas.find((x) => x.status === 'Ganho')?.valor ?? 0),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
