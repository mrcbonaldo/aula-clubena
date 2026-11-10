import { Router } from 'express';
import { pool } from '../db.js';
import { ErroHttp, STATUS, validarLead } from '../validacao.js';

const router = Router();

// Express 4 não captura erros de async sozinho: este helper repassa ao middleware de erro
const rota = (fn) => (req, res, next) => fn(req, res).catch(next);

// Busca um lead ou lança 404
async function buscarLead(id) {
  const [rows] = await pool.query('SELECT * FROM leads WHERE id = ?', [id]);
  if (rows.length === 0) throw new ErroHttp(404, 'Lead não encontrado');
  return rows[0];
}

// GET /api/leads?status=&busca=  (filtros opcionais)
router.get('/', rota(async (req, res) => {
  const { status, busca } = req.query;
  const filtros = [];
  const params = [];

  if (status) {
    filtros.push('status = ?');
    params.push(status);
  }
  if (busca) {
    filtros.push('(nome LIKE ? OR empresa LIKE ?)');
    params.push(`%${busca}%`, `%${busca}%`);
  }

  // Só montamos o texto fixo do WHERE; os valores sempre vão em params (?)
  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
  const [rows] = await pool.query(`SELECT * FROM leads ${where} ORDER BY criado_em DESC`, params);
  res.json(rows);
}));

router.get('/:id', rota(async (req, res) => {
  res.json(await buscarLead(req.params.id));
}));

router.post('/', rota(async (req, res) => {
  const l = validarLead(req.body);
  const [r] = await pool.query(
    `INSERT INTO leads (nome, email, telefone, empresa, origem, valor_estimado, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [l.nome, l.email, l.telefone, l.empresa, l.origem, l.valor_estimado, l.status],
  );
  res.status(201).json(await buscarLead(r.insertId)); // 201 = criado
}));

router.put('/:id', rota(async (req, res) => {
  await buscarLead(req.params.id); // garante o 404
  const l = validarLead(req.body);
  await pool.query(
    `UPDATE leads SET nome = ?, email = ?, telefone = ?, empresa = ?,
     origem = ?, valor_estimado = ?, status = ? WHERE id = ?`,
    [l.nome, l.email, l.telefone, l.empresa, l.origem, l.valor_estimado, l.status, req.params.id],
  );
  res.json(await buscarLead(req.params.id));
}));

// PATCH muda só o status (usado na troca inline da lista)
router.patch('/:id/status', rota(async (req, res) => {
  const { status } = req.body ?? {};
  if (!STATUS.includes(status)) throw new ErroHttp(400, 'Status inválido');
  await buscarLead(req.params.id);
  await pool.query('UPDATE leads SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json(await buscarLead(req.params.id));
}));

// Histórico de interações (anotações) do lead, da mais recente para a mais antiga
router.get('/:id/interacoes', rota(async (req, res) => {
  await buscarLead(req.params.id); // 404 se o lead não existir
  const [rows] = await pool.query(
    'SELECT * FROM interacoes WHERE lead_id = ? ORDER BY criado_em DESC, id DESC',
    [req.params.id],
  );
  res.json(rows);
}));

router.post('/:id/interacoes', rota(async (req, res) => {
  await buscarLead(req.params.id);
  const anotacao = String(req.body?.anotacao ?? '').trim();
  if (!anotacao) throw new ErroHttp(400, 'Anotação é obrigatória');
  const [r] = await pool.query('INSERT INTO interacoes (lead_id, anotacao) VALUES (?, ?)', [
    req.params.id,
    anotacao,
  ]);
  const [[nova]] = await pool.query('SELECT * FROM interacoes WHERE id = ?', [r.insertId]);
  res.status(201).json(nova);
}));

router.delete('/:id', rota(async (req, res) => {
  await buscarLead(req.params.id);
  await pool.query('DELETE FROM leads WHERE id = ?', [req.params.id]);
  res.status(204).end(); // 204 = sem conteúdo
}));

export default router;
