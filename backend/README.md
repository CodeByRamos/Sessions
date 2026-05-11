# Sessions FastAPI Backend

Este backend é a base da migração gradual para uma API separada. O frontend continua funcional com as API Routes do Next.js, enquanto os domínios vão sendo movidos aos poucos para FastAPI.

## Rodar localmente

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Variáveis

```bash
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/sessions
CORS_ORIGINS_RAW=http://localhost:3000
```

## Endpoints iniciais

- `GET /health`
- `GET /sessions`

## Ordem sugerida de migração

1. Sessions públicas e detalhes de session.
2. Crew e mensagens.
3. Circuitos e moderação.
4. Badges.
5. Media upload.
6. Auth e perfis, quando a estratégia de sessão estiver definida.
