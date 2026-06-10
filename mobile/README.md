# 📱 AgroSat Mobile

App mobile do **AgroSat** — monitoramento agrícola no celular do produtor.
Feito em **React Native + Expo (SDK 54)** com TypeScript.

O app funciona de forma autônoma: se o backend Spring Boot estiver no ar ele
consome os dados reais; se não estiver, cai automaticamente em **dados mockados**
de demonstração (ver [`src/services/api.ts`](src/services/api.ts)). Ou seja, dá
para apresentar o app mesmo sem subir a API.

## Telas

| Tela | Arquivo | O que mostra |
|------|---------|--------------|
| 🌾 **Dashboard** | [`src/screens/DashboardScreen.tsx`](src/screens/DashboardScreen.tsx) | Propriedade, NDVI (índice de vegetação) com status colorido e indicadores rápidos (temperatura, umidade, chuva) |
| ⚠️ **Alertas** | [`src/screens/AlertasScreen.tsx`](src/screens/AlertasScreen.tsx) | Lista de alertas de seca/praga por severidade + botão "Verificar riscos agora" |
| 📡 **Sensores** | [`src/screens/SensoresScreen.tsx`](src/screens/SensoresScreen.tsx) | Leituras IoT (umidade do solo, temperatura) com barras de progresso |

Navegação por abas inferiores ([`App.tsx`](App.tsx)).

## Pré-requisitos

- **Node.js 18+** (testado com Node 24)
- **npm**
- Para rodar no celular: app **Expo Go** instalado (Android/iOS)
- Para emulador: Android Studio (emulador) ou Xcode (simulador iOS, só no macOS)

## Como rodar

```bash
cd mobile
npm install        # instala as dependências
npm start          # inicia o Metro bundler + QR code do Expo
```

Depois, escolha como abrir:

| Comando | Onde abre |
|---------|-----------|
| `npm start` | mostra QR code — escaneie com o **Expo Go** no celular |
| `npm run android` | abre no emulador/dispositivo **Android** |
| `npm run ios` | abre no simulador **iOS** (macOS) |
| `npm run web` | abre no **navegador** (jeito mais rápido de testar) |

> 💡 Para a demo mais simples, use `npm run web` — abre direto no navegador,
> sem precisar de emulador nem celular.

## Conectar no backend (opcional)

Por padrão o app aponta para `http://localhost:8080/api`
(constante `BASE_URL` em [`src/services/api.ts`](src/services/api.ts)).

- **Web / emulador na mesma máquina:** `localhost:8080` funciona direto — basta
  subir a API com `mvn spring-boot:run` na raiz do projeto.
- **Celular físico (Expo Go):** `localhost` aponta para o próprio celular. Troque
  `BASE_URL` pelo **IP da sua máquina na rede local**, ex.:
  `http://192.168.0.10:8080/api`.

Se a API não responder, o app usa os dados mockados automaticamente.

## Estrutura

```
mobile/
├── App.tsx                 # navegação por abas (Dashboard / Alertas / Sensores)
├── index.ts                # entrypoint do Expo
├── app.json                # config do Expo (SDK 54)
├── src/
│   ├── screens/            # as 3 telas
│   ├── services/api.ts     # cliente HTTP com fallback para mock
│   └── types.ts            # tipos compartilhados
└── assets/                 # ícones e splash
```

## Verificação

```bash
npx tsc --noEmit          # checagem de tipos (passa limpo)
npx expo export --platform web   # gera o bundle web em dist/ (valida o build)
```

## Observações sobre versões

O projeto usa **Expo SDK 54**. O `npx expo-doctor` aponta alguns pacotes em
versões um pouco abaixo das recomendadas pelo SDK (ex.: `react-native` 0.78 vs
0.81 esperado). O app **compila, passa no typecheck e gera o bundle web** assim
mesmo. Se quiser alinhar tudo às versões exatas do SDK 54:

```bash
npx expo install --check
```

Isso pode ser necessário para rodar no **Expo Go nativo** mais recente, que
espera os módulos nativos da versão certa do SDK.
