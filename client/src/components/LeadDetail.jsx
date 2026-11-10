import { useEffect, useState } from 'react';
import { api } from '../api.js';

const moeda = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dataHora = (d) => new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

// Detalhe do lead: dados principais + histórico de anotações
export default function LeadDetail({ leadId, onVoltar }) {
  const [lead, setLead] = useState(null);
  const [interacoes, setInteracoes] = useState([]);
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Busca lead e interações em paralelo ao abrir
  useEffect(() => {
    Promise.all([api.buscarLead(leadId), api.listarInteracoes(leadId)])
      .then(([l, i]) => { setLead(l); setInteracoes(i); })
      .catch((e) => setErro(e.message));
  }, [leadId]);

  async function adicionar(e) {
    e.preventDefault();
    setSalvando(true);
    setErro('');
    try {
      const nova = await api.criarInteracao(leadId, texto);
      setInteracoes([nova, ...interacoes]); // a mais nova no topo
      setTexto('');
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <button className="btn" onClick={onVoltar}>← Voltar</button>
      {erro && <div className="erro" style={{ marginTop: 12 }}>{erro}</div>}
      {!lead ? (
        !erro && <p>Carregando...</p>
      ) : (
        <>
          <div className="card">
            <h1>{lead.nome}</h1>
            <span className={`badge ${lead.status}`}>{lead.status}</span>
            <dl>
              <dt>E-mail</dt><dd>{lead.email}</dd>
              <dt>Telefone</dt><dd>{lead.telefone || '-'}</dd>
              <dt>Empresa</dt><dd>{lead.empresa || '-'}</dd>
              <dt>Origem</dt><dd>{lead.origem}</dd>
              <dt>Valor estimado</dt><dd>{moeda(lead.valor_estimado)}</dd>
              <dt>Criado em</dt><dd>{dataHora(lead.criado_em)}</dd>
            </dl>
          </div>

          <div className="card">
            <h2>Anotações</h2>
            <form className="nova-nota" onSubmit={adicionar}>
              <textarea
                rows="3"
                placeholder="Ex.: Liguei, pediu proposta até sexta."
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
              />
              <button className="btn primario" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Adicionar anotação'}
              </button>
            </form>

            {interacoes.length === 0 ? (
              <p>Nenhuma anotação ainda.</p>
            ) : (
              <ul className="notas">
                {interacoes.map((i) => (
                  <li key={i.id}>
                    <small>{dataHora(i.criado_em)}</small>
                    <p>{i.anotacao}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </>
  );
}
