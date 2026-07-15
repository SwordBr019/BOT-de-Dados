function desembrulhar(conteudo) {
  let atual = conteudo;

  for (let i = 0; i < 5 && atual; i += 1) {
    if (atual.ephemeralMessage?.message) {
      atual = atual.ephemeralMessage.message;
      continue;
    }
    if (atual.viewOnceMessage?.message) {
      atual = atual.viewOnceMessage.message;
      continue;
    }
    if (atual.viewOnceMessageV2?.message) {
      atual = atual.viewOnceMessageV2.message;
      continue;
    }
    if (atual.documentWithCaptionMessage?.message) {
      atual = atual.documentWithCaptionMessage.message;
      continue;
    }
    break;
  }

  return atual;
}

/**
 * Extrai texto ou legenda dos formatos mais comuns de mensagem do WhatsApp.
 * @param {object | null | undefined} mensagem
 * @returns {string}
 */
export function extrairTexto(mensagem) {
  const conteudo = desembrulhar(mensagem?.message);
  if (!conteudo) return '';

  return (
    conteudo.conversation ||
    conteudo.extendedTextMessage?.text ||
    conteudo.imageMessage?.caption ||
    conteudo.videoMessage?.caption ||
    conteudo.documentMessage?.caption ||
    conteudo.buttonsResponseMessage?.selectedDisplayText ||
    conteudo.listResponseMessage?.title ||
    ''
  ).trim();
}
