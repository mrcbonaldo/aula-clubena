import { useState } from 'react';

import { ORIGENS, STATUS } from '../constantes.js';

const VAZIO = {
  nome: '', email: '', telefone: '', empresa: '',
  origem: 'Outro', valor_estimado: 0, status: 'Novo',
};

// Modal de cadastro e edição: o mesmo formulário serve para os dois casos
export default function LeadForm({ lead, onSalvar, onCancelar }) {
  const [form, setForm] = useState({ ...VAZIO, ...lead });
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Um único handler atualiza qualquer campo pelo atributo name
  const mudar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setSalvando(true);
    setErro('');
    try {
      await onSalvar(form);
    } catch (err) {
      setErro(err.message); // mensagem de validação vinda da API
      setSalvando(false);
    }
  }

  return (
    <div className="modal-fundo">
      <form className="modal" onSubmit={enviar}>
        <h2>{lead.id ? 'Editar lead' : 'Novo lead'}</h2>
        {erro && <div className="erro">{erro}</div>}

        <label>Nome *<input name="nome" value={form.nome} onChange={mudar} /></label>
        <label>E-mail *<input name="email" value={form.email} onChange={mudar} /></label>
        <label>Telefone<input name="telefone" value={form.telefone ?? ''} onChange={mudar} /></label>
        <label>Empresa<input name="empresa" value={form.empresa ?? ''} onChange={mudar} /></label>
        <label>Origem
          <select name="origem" value={form.origem} onChange={mudar}>
            {ORIGENS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>
        <label>Valor estimado (R$)
          <input name="valor_estimado" type="number" min="0" step="0.01"
            value={form.valor_estimado} onChange={mudar} />
        </label>
        <label>Status
          <select name="status" value={form.status} onChange={mudar}>
            {STATUS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>

        <div className="modal-acoes">
          <button type="button" className="btn" onClick={onCancelar}>Cancelar</button>
          <button className="btn primario" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
