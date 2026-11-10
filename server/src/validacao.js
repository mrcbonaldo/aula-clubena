// Listas permitidas (iguais aos ENUMs do schema.sql)
export const STATUS = ['Novo', 'Contato', 'Qualificado', 'Proposta', 'Ganho', 'Perdido'];
export const ORIGENS = ['Instagram', 'Indicação', 'Site', 'WhatsApp', 'Outro'];

// Erro com código HTTP, tratado no middleware central
export class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

// Valida e normaliza o corpo de um lead; lança 400 se algo estiver errado
export function validarLead(body = {}) {
  const nome = String(body.nome ?? '').trim();
  const email = String(body.email ?? '').trim();
  const origem = body.origem ?? 'Outro';
  const status = body.status ?? 'Novo';
  const valor = Number(body.valor_estimado ?? 0);

  if (!nome) throw new ErroHttp(400, 'Nome é obrigatório');
  if (!email) throw new ErroHttp(400, 'E-mail é obrigatório');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ErroHttp(400, 'E-mail inválido');
  if (!ORIGENS.includes(origem)) throw new ErroHttp(400, 'Origem inválida');
  if (!STATUS.includes(status)) throw new ErroHttp(400, 'Status inválido');
  if (!Number.isFinite(valor) || valor < 0) throw new ErroHttp(400, 'Valor estimado inválido');

  return {
    nome,
    email,
    telefone: body.telefone?.trim() || null,
    empresa: body.empresa?.trim() || null,
    origem,
    valor_estimado: valor,
    status,
  };
}
