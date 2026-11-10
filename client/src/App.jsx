import { useEffect, useState } from 'react';
import { api } from './api.js';
import LeadList from './components/LeadList.jsx';
import LeadForm from './components/LeadForm.jsx';
import Dashboard from './components/Dashboard.jsx';
import LeadDetail from './components/LeadDetail.jsx';
import { STATUS } from './constantes.js';

export default function App() {
  const [leads, setLeads] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  // null = modal fechado | {} = novo lead | lead existente = edição
  const [editando, setEditando] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [busca, setBusca] = useState('');
  // Lead aberto no detalhe (null = mostra a lista)
  const [detalhe, setDetalhe] = useState(null);

  async function carregar() {
    try {
      setErro('');
      setLeads(await api.listarLeads({ status: filtroStatus, busca }));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  // Recarrega ao abrir e sempre que o filtro ou a busca mudam.
  // O setTimeout espera 300ms sem digitação, para não chamar a API a cada tecla (debounce)
  useEffect(() => {
    const t = setTimeout(carregar, 300);
    return () => clearTimeout(t);
  }, [filtroStatus, busca]);

  // Feedback rápido que some sozinho
  function avisar(texto) {
    setAviso(texto);
    setTimeout(() => setAviso(''), 3000);
  }

  async function salvar(dados) {
    if (editando.id) await api.atualizarLead(editando.id, dados);
    else await api.criarLead(dados);
    setEditando(null);
    avisar('Lead salvo com sucesso!');
    carregar();
  }

  // Troca de status inline: atualiza só a linha alterada, sem recarregar a lista
  async function mudarStatus(lead, status) {
    try {
      const atualizado = await api.mudarStatus(lead.id, status);
      setLeads((atual) => atual.map((l) => (l.id === lead.id ? atualizado : l)));
      avisar(`Status de ${lead.nome}: ${status}`);
    } catch (e) {
      setErro(e.message);
    }
  }

  async function excluir(lead) {
    if (!window.confirm(`Excluir o lead "${lead.nome}"?`)) return;
    try {
      await api.excluirLead(lead.id);
      avisar('Lead excluído.');
      carregar();
    } catch (e) {
      setErro(e.message);
    }
  }

  // Sem biblioteca de rotas: alternamos entre lista e detalhe por estado
  if (detalhe) {
    return (
      <div className="container">
        <LeadDetail leadId={detalhe.id} onVoltar={() => { setDetalhe(null); carregar(); }} />
      </div>
    );
  }

  return (
    <div className="container">
      <header className="topo">
        <h1>CRM de Leads</h1>
        <button className="btn primario" onClick={() => setEditando({})}>
          + Novo lead
        </button>
      </header>

      {/* Muda quando a lista muda (salvar, excluir, trocar status), então os números se atualizam */}
      <Dashboard atualizar={leads} />

      <div className="filtros">
        <input
          placeholder="Buscar por nome ou empresa..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
          <option value="">Todos os status</option>
          {STATUS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {aviso && <div className="aviso">{aviso}</div>}
      {erro && <div className="erro">{erro}</div>}
      {carregando ? (
        <p>Carregando...</p>
      ) : (
        <LeadList leads={leads} onEditar={setEditando} onExcluir={excluir} onMudarStatus={mudarStatus} onDetalhe={setDetalhe} />
      )}

      {editando && (
        <LeadForm lead={editando} onSalvar={salvar} onCancelar={() => setEditando(null)} />
      )}
    </div>
  );
}
