import { STATUS } from '../constantes.js';

const moeda = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function LeadList({ leads, onEditar, onExcluir, onMudarStatus, onDetalhe }) {
  if (leads.length === 0) return <p>Nenhum lead encontrado.</p>;

  return (
    <div className="tabela-wrap">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Empresa</th>
            <th>Origem</th>
            <th>Valor</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l.id}>
              <td>
                <button className="link" onClick={() => onDetalhe(l)}>{l.nome}</button>
                <small>{l.email}</small>
              </td>
              <td>{l.empresa}</td>
              <td>{l.origem}</td>
              <td>{moeda(l.valor_estimado)}</td>
              <td>
                {/* Select colorido pelo status: trocar o valor chama a API */}
                <select
                  className={`badge ${l.status}`}
                  value={l.status}
                  onChange={(e) => onMudarStatus(l, e.target.value)}
                >
                  {STATUS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
              <td className="acoes">
                <button className="btn" onClick={() => onEditar(l)}>Editar</button>
                <button className="btn perigo" onClick={() => onExcluir(l)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
