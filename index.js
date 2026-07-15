'use strict';

import 'dotenv/config';
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
} from 'baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';

import { processarComando } from './src/commands.js';
import { extrairTexto } from './src/text.js';

const AUTH_DIR = process.env.AUTH_DIR?.trim() || 'auth';
const ALLOW_GROUPS = process.env.ALLOW_GROUPS == null
  ? true
  : String(process.env.ALLOW_GROUPS).toLowerCase() === 'true';
const MARK_AS_READ = String(process.env.MARK_AS_READ ?? 'true').toLowerCase() === 'true';
const LOG_LEVEL = process.env.LOG_LEVEL?.trim() || 'silent';

const logger = pino({ level: LOG_LEVEL });
const mensagensRecentes = new Map();
let encerrando = false;
let tentativaReconexao = 0;
let socketAtivo = null;
let timerReconexao = null;

function banner() {
  console.log('');
  console.log('╔══════════════════════════════════════╗');
  console.log('║       🎲 BOT DE DADOS v2.0          ║');
  console.log('║       WhatsApp · Baileys             ║');
  console.log('╚══════════════════════════════════════╝');
  console.log('');
}

function chaveMensagem(key) {
  if (!key?.id) return null;
  return `${key.remoteJid || 'sem-jid'}:${key.id}`;
}

function guardarMensagem(mensagem) {
  const chave = chaveMensagem(mensagem?.key);
  if (!chave || !mensagem.message) return;

  mensagensRecentes.set(chave, mensagem);

  if (mensagensRecentes.size > 500) {
    const primeiroId = mensagensRecentes.keys().next().value;
    mensagensRecentes.delete(primeiroId);
  }
}

function obterCodigoDesconexao(erro) {
  return erro?.output?.statusCode ?? erro?.statusCode ?? erro?.data?.statusCode;
}

function deveIgnorarJid(jid) {
  if (!jid) return true;
  if (jid === 'status@broadcast') return true;
  if (jid.endsWith('@newsletter')) return true;
  if (jid.endsWith('@broadcast')) return true;
  if (!ALLOW_GROUPS && jid.endsWith('@g.us')) return true;
  return false;
}

async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  let version;
  try {
    const versao = await fetchLatestBaileysVersion();
    version = versao.version;
    console.log(`📦 Versão do protocolo WhatsApp: ${version.join('.')}`);
  } catch {
    console.log('⚠️ Não foi possível consultar a versão mais recente do protocolo; usando a versão interna do Baileys.');
  }

  const socket = makeWASocket({
    ...(version ? { version } : {}),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    logger,
    printQRInTerminal: false,
    markOnlineOnConnect: false,
    syncFullHistory: false,
    shouldSyncHistoryMessage: () => false,
    generateHighQualityLinkPreview: false,
    getMessage: async (key) => {
      const chave = chaveMensagem(key);
      return chave ? mensagensRecentes.get(chave)?.message : undefined;
    },
  });

  socketAtivo = socket;

  socket.ev.on('creds.update', saveCreds);

  socket.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('\n📱 Escaneie o QR Code com o WhatsApp:');
      console.log('WhatsApp → Dispositivos conectados → Conectar dispositivo\n');
      qrcode.generate(qr, { small: true });
      console.log('\n⏳ Aguardando a leitura do QR Code...\n');
    }

    if (connection === 'open') {
      tentativaReconexao = 0;
      console.log('✅ Bot conectado e pronto para receber comandos!');
      console.log(`👥 Respostas em grupos: ${ALLOW_GROUPS ? 'ativadas' : 'desativadas'}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    if (connection === 'close' && !encerrando) {
      const codigo = obterCodigoDesconexao(lastDisconnect?.error);
      const saiuDaConta = codigo === DisconnectReason.loggedOut;

      if (saiuDaConta) {
        console.error('❌ A sessão foi desconectada pelo WhatsApp.');
        console.error(`Apague a pasta "${AUTH_DIR}" e execute o bot novamente para gerar outro QR Code.`);
        return;
      }

      tentativaReconexao += 1;
      const atraso = Math.min(1_000 * 2 ** Math.min(tentativaReconexao, 5), 30_000);
      console.log(`⚠️ Conexão encerrada (código: ${codigo ?? 'desconhecido'}). Reconectando...`);
      clearTimeout(timerReconexao);
      timerReconexao = setTimeout(() => iniciarBot().catch(exibirErroFatal), atraso);
    }
  });

  socket.ev.on('messages.upsert', async ({ type, messages }) => {
    if (type !== 'notify') return;

    for (const mensagem of messages) {
      guardarMensagem(mensagem);

      const jid = mensagem?.key?.remoteJid;
      if (mensagem?.key?.fromMe || deveIgnorarJid(jid)) continue;

      const texto = extrairTexto(mensagem);
      if (!texto) continue;

      const resposta = processarComando(texto);
      if (!resposta) continue;

      const hora = new Date().toLocaleTimeString('pt-BR');
      console.log(`[${hora}] 📩 ${jid}: ${texto}`);

      try {
        if (MARK_AS_READ) {
          await socket.readMessages([mensagem.key]);
        }

        await socket.sendMessage(jid, { text: resposta }, { quoted: mensagem });
        console.log(`[${hora}] ✉️ Resposta enviada.`);
      } catch (erro) {
        console.error(`[${hora}] ❌ Falha ao responder:`, erro?.message || erro);
      }
    }
  });

}


async function encerrar(sinal) {
  if (encerrando) return;
  encerrando = true;
  clearTimeout(timerReconexao);
  console.log(`\n🛑 Encerrando o bot (${sinal})...`);

  try {
    socketAtivo?.end(new Error(`Processo encerrado por ${sinal}`));
  } finally {
    process.exit(0);
  }
}

process.once('SIGINT', () => encerrar('SIGINT'));
process.once('SIGTERM', () => encerrar('SIGTERM'));

function exibirErroFatal(erro) {
  console.error('\n❌ Não foi possível iniciar o bot:', erro?.stack || erro);
  process.exitCode = 1;
}

banner();
iniciarBot().catch(exibirErroFatal);
