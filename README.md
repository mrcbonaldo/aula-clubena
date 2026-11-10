# CRM de Leads (aula-clubena)

CRM simples para controle de leads, feito para uma aula ao vivo.
Node.js + Express + MySQL no backend, React + Vite no frontend.

## O que faz

- Cadastro, edição e exclusão de leads (nome, e-mail, telefone, empresa, origem, valor estimado, status).
- Funil: Novo, Contato, Qualificado, Proposta, Ganho, Perdido, com troca de status direto na lista.
- Busca por nome ou empresa e filtro por status.
- Detalhe do lead com histórico de anotações.
- Dashboard: total de leads, quantidade por status e valor total em Ganho.

## Estrutura

```
server/   API (Express + mysql2, sem ORM) e schema.sql
client/   Interface (React + Vite)
docker-compose.yml   Opcional: sobe MySQL + API + client juntos
```

## Opção A: rodar com Docker (mais rápido)

Pré-requisito: Docker Desktop.

1. Crie o `.env` da raiz e preencha as duas senhas (valores à sua escolha):
   ```bash
   cp .env.example .env
   ```
2. Suba tudo (o `schema.sql` é carregado sozinho na primeira vez):
   ```bash
   docker compose up -d --build
   ```
3. Abra http://localhost:5173 (a API fica em http://localhost:3001).

Parar: `docker compose down`. Voltar ao seed original: `docker compose down -v` e subir de novo.
O MySQL do Docker fica na porta **3307** da sua máquina.

## Opção B: rodar sem Docker

Pré-requisitos: Node 20+ e MySQL 8 instalados.

1. Instale as dependências:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
2. Crie o banco, as tabelas e o seed (10 leads de exemplo):
   ```bash
   mysql -u SEU_USUARIO -p < server/schema.sql
   ```
3. Configure a conexão: copie `server/.env.example` para `server/.env` e preencha
   `DB_USER` e `DB_PASS` (e `DB_HOST` / `DB_PORT` se o MySQL não estiver em `localhost:3306`).
   O arquivo `.env` não é versionado.
4. Rode a API (terminal 1):
   ```bash
   cd server && npm run dev
   ```
5. Rode o client (terminal 2):
   ```bash
   cd client && npm run dev
   ```
6. Abra http://localhost:5173. O Vite encaminha `/api` para `localhost:3001`.

Teste rápido da API: `curl http://localhost:3001/api/health` deve responder `{"ok":true,"leads":10}`.

## API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/leads?status=&busca=` | Lista leads (filtros opcionais) |
| GET | `/api/leads/:id` | Busca um lead |
| POST | `/api/leads` | Cria lead (201) |
| PUT | `/api/leads/:id` | Atualiza lead |
| PATCH | `/api/leads/:id/status` | Troca só o status |
| DELETE | `/api/leads/:id` | Exclui lead e suas anotações (204) |
| GET | `/api/leads/:id/interacoes` | Lista anotações do lead |
| POST | `/api/leads/:id/interacoes` | Cria anotação (201) |
| GET | `/api/dashboard` | Total, quantidade por status e valor em Ganho |

Erros voltam como `{ "erro": "mensagem" }` com 400 (validação), 404 (não encontrado) ou 500.

## Testes (opcional)

Cinco testes unitários da validação de lead, com o test runner nativo do Node:

```bash
cd server && npm test
```

## Decisões de simplicidade

- Sem ORM: SQL direto com `mysql2`, sempre parametrizado (`?`).
- Status e origem são `ENUM` do MySQL, em vez de tabelas de apoio.
- Sem react-router: lista e detalhe alternam por estado do React.
- O `PUT` atualiza o lead inteiro; campos omitidos voltam ao padrão (origem "Outro", valor 0, status "Novo").
- Sem autenticação, como pede o escopo.
- Docker e testes são extras opcionais, fora do escopo original da aula.
- O `schema.sql` apaga e recria as tabelas: rodar de novo volta ao estado inicial.

## Segredos

Nenhuma senha vai para o Git: `.env` (raiz e `server/`) é ignorado, e os arquivos `.env.example` só documentam os nomes das variáveis.
