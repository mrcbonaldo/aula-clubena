// Camada única de acesso à API: os componentes nunca chamam fetch direto
async function requisicao(url, opcoes = {}) {
  const resp = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opcoes,
  });
  if (resp.status === 204) return null;
  const dados = await resp.json().catch(() => ({}));
  // Se a API devolveu erro, lança com a mensagem dela para a tela exibir
  if (!resp.ok) throw new Error(dados.erro || 'Erro na requisição');
  return dados;
}

export const api = {
  // Filtros viram query string; URLSearchParams cuida de acentos e espaços
  listarLeads: ({ status = '', busca = '' } = {}) =>
    requisicao(`/api/leads?${new URLSearchParams({ status, busca })}`),
  criarLead: (lead) => requisicao('/api/leads', { method: 'POST', body: JSON.stringify(lead) }),
  atualizarLead: (id, lead) =>
    requisicao(`/api/leads/${id}`, { method: 'PUT', body: JSON.stringify(lead) }),
  mudarStatus: (id, status) =>
    requisicao(`/api/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  dashboard: () => requisicao('/api/dashboard'),
  buscarLead: (id) => requisicao(`/api/leads/${id}`),
  listarInteracoes: (id) => requisicao(`/api/leads/${id}/interacoes`),
  criarInteracao: (id, anotacao) =>
    requisicao(`/api/leads/${id}/interacoes`, { method: 'POST', body: JSON.stringify({ anotacao }) }),
  excluirLead: (id) => requisicao(`/api/leads/${id}`, { method: 'DELETE' }),
};
