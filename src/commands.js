import { calcular, formatarRespostaCalc } from './calc.js';
import { interpretarRolagem, formatarResposta } from './dice.js';
import {
  AJUDA_CALCULADORA,
  BOAS_VINDAS,
  COMANDO_DESCONHECIDO,
  GUIA,
} from './messages.js';

/**
 * Processa uma mensagem e retorna o texto de resposta.
 * Mensagens comuns, sem barra, são ignoradas.
 * @param {string} texto
 * @returns {string|null}
 */
export function processarComando(texto) {
  const original = String(texto ?? '').trim();
  const lower = original.toLowerCase();

  if (!original) return null;

  if (['/guia', '/menu'].includes(lower)) {
    return GUIA;
  }

  if (['/oi', '/start', '/inicio', '/início', '/help', '/ajuda'].includes(lower)) {
    return BOAS_VINDAS;
  }

  if (/^\/r\s*\d*d\d+/i.test(original)) {
    const resposta = interpretarRolagem(original);
    return resposta.sucesso ? formatarResposta(resposta.resultado) : resposta.erro;
  }

  if (/^\/calc(?:\s|$)/i.test(original)) {
    const expressao = original.replace(/^\/calc/i, '').trim();
    if (!expressao) return AJUDA_CALCULADORA;

    const resposta = calcular(expressao);
    return resposta.sucesso
      ? formatarRespostaCalc(expressao, resposta.resultado)
      : resposta.erro;
  }

  if (original.startsWith('/')) {
    return COMANDO_DESCONHECIDO;
  }

  return null;
}
