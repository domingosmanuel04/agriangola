# AgriAngola OS

**A infraestrutura digital do agronegócio angolano.**

Marketplace + ERP agrícola + CRM + logística + fintech-ready + AgriAI + mapas + dados — concebido para Angola, com arquitectura multi-país.

> Do campo ao mercado. Tudo num só lugar.

## Arranque local

Pré-requisitos: Node 20+, Docker.

```bash
cp .env.example .env
docker compose up -d postgres redis
npm install
cd apps/api && npx prisma db push && npx prisma db seed && cd ../..
npm run dev:api
npm run dev:web
```

Redis no host usa a porta **6389** (6379 no contentor) para evitar conflito com outros serviços locais. PostgreSQL usa **5432**.

- Web: http://localhost:5173
- API: http://localhost:3001/api/v1
- OpenAPI: http://localhost:3001/api/docs

### Contas de demonstração

Palavra-passe: `AgriDemo2026!`

| Perfil | Email |
| --- | --- |
| Produtora (Malanje) | maria.nzinga@agriangola.ao |
| Cooperativa | coop.kwanza@agriangola.ao |
| Comprador retalho | super.kikolo@agriangola.ao |
| Hotel / empresa | hotel.baia@agriangola.ao |
| Transportador | trans.planalto@agriangola.ao |
| Administrador | admin@agriangola.ao |

Os dados de semente estão identificados como **demonstração**.

## MVP incluído

Cadastro e login, perfis, marketplace, ofertas e procuras, matching (AgriMatch), cotações e negociação, pedidos e contratos, reputação, dashboards, mapa de Angola, notificações, logística básica, administração / Control Tower, AgriAI, PWA/offline-first, analytics.

Módulos avançados (financiamento, seguros, exportação, agentes autónomos, GraphQL) estão modelados na base de dados e na API, prontos a activar sem reconstruir o sistema.

## Princípios

- API-first (`/api/v1` + Swagger)
- Offline-first (PWA + fila local de mutações)
- RBAC por perfil e papéis na organização
- AgriScore **nunca** é apresentado como garantia de crédito
- Pagamentos via adaptadores — sem armazenar dados financeiros sensíveis
- IA preenche → utilizador confirma → sistema executa

## Stack

React + Vite + TypeScript · NestJS · PostgreSQL · Redis · Prisma · Docker
