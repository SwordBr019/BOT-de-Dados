# 🎲 Bot de Dados para WhatsApp — Baileys

Versão limpa do projeto enviado, migrada de **Venom-Bot** para **Baileys 7**, com QR Code exibido no terminal por meio do **qrcode-terminal**.

O bot responde a comandos de rolagem de dados e cálculos matemáticos. Ele não precisa instalar Chrome ou abrir navegador.

## Requisitos

- Node.js 20 ou superior
- WhatsApp com acesso a **Dispositivos conectados**
- Internet no computador onde o bot ficará ligado

## Instalação no Windows

1. Extraia a pasta do projeto.
2. Abra a pasta.
3. Clique na barra de endereço do Explorador, digite `cmd` e pressione Enter.
4. Execute:

```bash
npm install
npm start
```

Também é possível executar `INICIAR.bat`; na primeira vez, ele instala as dependências automaticamente.

## Primeiro acesso

1. O QR Code aparecerá no terminal.
2. No celular, abra **WhatsApp → Dispositivos conectados → Conectar dispositivo**.
3. Escaneie o QR Code.
4. A sessão será salva na pasta `auth/`.

Nas próximas execuções, normalmente não será necessário escanear novamente.

## Comandos

### Rolagem de dados

| Comando | Resultado |
|---|---|
| `/rd12` | Rola 1 dado de 12 lados |
| `/r2d12` | Rola 2 dados de 12 lados |
| `/r7d13` | Rola 7 dados de 13 lados |
| `/r2d6+3` | Rola 2d6 e soma 3 |
| `/rd20-1` | Rola 1d20 e subtrai 1 |
| `/r3d4*2` | Rola 3d4 e multiplica por 2 |
| `/r4d6/2` | Rola 4d6 e divide por 2 |

### Calculadora

| Comando | Resultado |
|---|---|
| `/calc 10 + 5 * 2` | Respeita a prioridade matemática |
| `/calc (10 + 5) * 2` | Aceita parênteses |
| `/calc 50% de 200` | Calcula porcentagem |
| `/calc 50% * 300` | Usa porcentagem em expressão |

### Ajuda

- `/guia` ou `/menu`
- `/oi`, `/ajuda`, `/help` ou `/start`

## Configurações opcionais

Copie `.env.example` para `.env` e altere os valores desejados:

```env
AUTH_DIR=auth
ALLOW_GROUPS=true
MARK_AS_READ=true
LOG_LEVEL=silent
```

Por padrão, o bot responde em conversas privadas e em grupos. Para desativar respostas em grupos, use `ALLOW_GROUPS=false`.

## Testes

```bash
npm test
```

## Estrutura

```text
dados-bot-baileys/
├── index.js
├── src/
│   ├── calc.js
│   ├── commands.js
│   ├── dice.js
│   ├── messages.js
│   └── text.js
├── test/
├── .env.example
├── .gitignore
├── INICIAR.bat
├── package.json
└── README.md
```

## Observações importantes

- Baileys usa o protocolo de dispositivos conectados do WhatsApp e não é a API oficial WhatsApp Business.
- Evite spam, disparos em massa e automações abusivas.
- A pasta `auth/` contém dados da sessão. Não envie essa pasta para outras pessoas e não publique em repositórios.
- O `useMultiFileAuthState` utilizado aqui é adequado para projeto local e demonstração. Para operação profissional com muitos usuários, use armazenamento próprio de autenticação e banco de dados.
