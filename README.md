# RotaUni

Aplicativo de caronas universitárias (React Native + Expo) — Passageiros e Motoristas se encontram no campus para ir a algum lugar. Integra um servidor backend dedicado para caronas, autenticação/perfil, reservas, histórico e avaliação mútua. Perfis carregam `course` e `rating` pode ser nulo quando ainda não existem avaliações.

## Como executar

```bash
npx expo start -c
```

> `-c` (ou `--clear`) limpa o cache do bundler — use sempre que alterar variáveis `EXPO_PUBLIC_*`, pois elas são embutidas no bundle no boot.

1. Suba o servidor backend (API REST remota) na porta 8080 (para device físico, use o IP da máquina, não `localhost`).
2. Configure o `.env.local` (copie de `.env.example`) — detalhes abaixo.
3. Escaneie o QR (Expo Go) ou rode em emulador.

Validação estática:

```bash
npx tsc --noEmit    # tipos
npm run lint        # ESLint (Expo)
```

## Fontes de dados: chaveamento mock/http

Cada módulo de domínio tem **duas implementações de repositório** com a mesma interface (padrão Repository + Fábrica central de binding):

- `src/services/rides/` — caronas (`RidesRepository`)
- `src/services/auth/` — contas/login (`UserAccountRepository`)
- `src/services/user/` — perfil (`UserRepository`)
- `src/services/booking/` — reserva ativa (`BookingRepository`)
- `src/services/history/` — histórico/finalização (`RideHistoryRepository`)
- `src/services/rating/` — avaliações (`RatingRepository`)
- `src/services/api/api-client.ts` — cliente HTTP único (fetch, `get/post/delete`, `ApiError`)

Estrutura por módulo:

```text
src/services/booking/
├── booking.repository.ts        # interface + FÁBRICA (chaveamento + fail-fast + log)
├── local-booking.repository.ts  # implementação local (AsyncStorage) — modo mock
└── http-booking.repository.ts   # implementação HTTP (API REST remota) — modo http
```

A fábrica decide em tempo de import quais classe instanciar; **hooks e telas importam apenas a fábrica** (`import { bookingRepository } from '@/services/booking/booking.repository'`) e nada sabem sobre o modo ativo.

## Variáveis de ambiente (`.env.local`)

```env
# Master: aplica a todos os módulos de uma vez
EXPO_PUBLIC_DATA_SOURCE=http          # 'http' | 'mock'
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.106:8080

# Overrides opcionais por módulo (têm prioridade sobre a master)
# EXPO_PUBLIC_RIDES_DATA_SOURCE=http
# EXPO_PUBLIC_AUTH_DATA_SOURCE=http
# EXPO_PUBLIC_BOOKING_DATA_SOURCE=http
# EXPO_PUBLIC_HISTORY_DATA_SOURCE=http
# EXPO_PUBLIC_RATING_DATA_SOURCE=http
```

Resolução em cada fábrica: `override do módulo || master || 'mock'`. Não definir nada roda o app inteiro em mock (protótipo local, AsyncStorage) — útil para desenvolver sem backend.

### Fail-fast (sem fallback silencioso)

Se a fonte **resolvida** for `http` (via override ou master) e `EXPO_PUBLIC_API_BASE_URL` estiver ausente, o app **falha no boot** com erro explícito, por exemplo:

```
EXPO_PUBLIC_BOOKING_DATA_SOURCE=http exige EXPO_PUBLIC_API_BASE_URL definida. Consulte .env.example.
```

Isso é deliberado: o app não degrada silenciosamente de HTTP para mock em runtime — se o backend estiver fora, os erros de rede propagam até a tela.

### Logs de boot (`__DEV__`)

Em desenvolvimento, cada fábrica loga a fonte ativa no console (5 linhas no boot):

```
[RotaUni] Rides Data Source: HTTP (http://192.168.1.106:8080)
[RotaUni] Auth Data Source: HTTP (...)
[RotaUni] Booking Data Source: HTTP (...)
[RotaUni] History Data Source: HTTP (...)
[RotaUni] Rating Data Source: HTTP (...)
```

Em `mock` o log mostra `[RotaUni] <Módulo> Data Source: MOCK`. Use esses logs para confirmar que o `.env.local` surtiu efeito após `expo start -c`.

## O que cada modo faz

| Módulo | `mock` (AsyncStorage) | `http` (API REST remota) |
|---|---|---|
| rides | `src/data/rides.ts` (dados fixos) | `GET /api/v1/rides`, `GET /api/v1/rides/{id}`; estados incluem `CANCELLED` |
| auth | contas locais + SHA-256 iterativo | `POST /api/v1/auth/register`, `POST /auth/login` (token simulado) |
| user | perfil local | `GET /api/v1/users/me` (header `X-User-Id`) |
| booking | 1 reserva ativa no device | `POST /api/v1/bookings`, `GET /bookings/active`, `DELETE /bookings/{id}` (vagas controladas pelo backend) |
| history | histórico local | `POST /api/v1/bookings/{id}/finalize`, `GET /api/v1/rides/history` |
| rating | avaliações locais | `POST /api/v1/ratings` (o repositório resolve o `historyId` via histórico); o backend também agrega avaliações do passageiro |

Erros legíveis de negócio vêm do backend em contrato partilhado: 400 carona lotada / já avaliada, 409 e-mail ou reserva duplicada, 401 login inválido. A tela de login trata 401 retornando `null`; o cadastro traduz 409 em `EMAIL_ALREADY_EXISTS`.

## Reset no modo HTTP

A tela **Perfil** oferece "Resetar dados locais". Em `mock`, limpa de fato os dados do dispositivo. Em `http`, os dados (contas, histórico, avaliações) pertencem ao backend e não são limpos — o reset só encerra a **sessão local** do dispositivo; o confirm avisa isso explicitamente.

## Estrutura geral

```text
src/
├── app/            # telas (Expo Router, file-based routing)
├── components/     # componentes de UI reutilizáveis
├── constants/      # tema e cores
├── data/           # mocks de dados (modo mock)
├── domain/         # tipos de domínio (Ride, Booking, Rating...)
├── hooks/          # hooks de estado por módulo (use-ride, use-rating...)
├── services/       # repositórios por módulo + api-client (veja acima)
├── state/          # app-provider (sessão, reserva, registro, logout)
└── storage/        # adapter AsyncStorage + StorageKeys
```
