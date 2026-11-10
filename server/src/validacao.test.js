// Testes unitários da validação (usa o test runner nativo do Node, sem bibliotecas extras)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validarLead, ErroHttp } from './validacao.js';

const valido = { nome: 'Ana', email: 'ana@x.com' };

// Confere que a função lança ErroHttp 400 com a mensagem esperada
const rejeita = (body, mensagem) =>
  assert.throws(() => validarLead(body), (e) => e instanceof ErroHttp && e.status === 400 && e.message === mensagem);

test('aceita lead mínimo e aplica os padrões', () => {
  const lead = validarLead(valido);
  assert.equal(lead.origem, 'Outro');
  assert.equal(lead.status, 'Novo');
  assert.equal(lead.valor_estimado, 0);
});

test('remove espaços do nome e transforma campos vazios em null', () => {
  const lead = validarLead({ ...valido, nome: '  Ana  ', telefone: '  ', empresa: '' });
  assert.equal(lead.nome, 'Ana');
  assert.equal(lead.telefone, null);
  assert.equal(lead.empresa, null);
});

test('rejeita nome ausente ou só com espaços', () => {
  rejeita({ email: 'ana@x.com' }, 'Nome é obrigatório');
  rejeita({ nome: '   ', email: 'ana@x.com' }, 'Nome é obrigatório');
});

test('rejeita e-mail ausente ou inválido', () => {
  rejeita({ nome: 'Ana' }, 'E-mail é obrigatório');
  rejeita({ nome: 'Ana', email: 'sem-arroba' }, 'E-mail inválido');
});

test('rejeita origem, status e valor inválidos', () => {
  rejeita({ ...valido, origem: 'TikTok' }, 'Origem inválida');
  rejeita({ ...valido, status: 'Quase' }, 'Status inválido');
  rejeita({ ...valido, valor_estimado: -10 }, 'Valor estimado inválido');
});
