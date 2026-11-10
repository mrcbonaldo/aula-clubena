import { useEffect, useState } from 'react';
import { api } from '../api.js';

const moeda = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Cards com os números principais; recarrega sempre que "atualizar" muda
export default function Dashboard({ atualizar }) {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api.dashboard().then(setDados).catch((e) => setErro(e.message));
  }, [atualizar]);

  if (erro) return <div className="erro">{erro}</div>;
  if (!dados) return <p>Carregando painel...</p>;

  return (
    <section className="dashboard">
      <div className="kpi">
        <span>Total de leads</span>
        <strong>{dados.total}</strong>
      </div>
      <div className="kpi destaque">
        <span>Valor em Ganho</span>
        <strong>{moeda(dados.valorGanho)}</strong>
      </div>
      {dados.porStatus.map((s) => (
        <div key={s.status} className="kpi">
          <span className={`badge ${s.status}`}>{s.status}</span>
          <strong>{s.quantidade}</strong>
        </div>
      ))}
    </section>
  );
}
