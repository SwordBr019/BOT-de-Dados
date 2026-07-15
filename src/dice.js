import { randomInt } from 'node:crypto';

/**
 * Rola um dado usando o gerador criptográfico do Node.js.
 * @param {number} lados
 * @returns {number}
 */
export function rolarDado(lados) {
  return randomInt(1, lados + 1);
}

/**
 * Interpreta comandos como /rd20, /r2d6+3 e /r4d6/2.
 * @param {string} comando
 * @param {(lados: number) => number} gerador
 * @returns {{sucesso: boolean, resultado?: object, erro?: string}}
 */
export function interpretarRolagem(comando, gerador = rolarDado) {
  const entrada = comando
    .replace(/^\/r/i, '')
    .replace(/\s+/g, '')
    .replace(/,/g, '.')
    .toLowerCase();

  const match = entrada.match(/^(\d+)?d(\d+)([+\-*/])?(\d+(?:\.\d+)?)?$/i);

  if (!match) {
    return {
      sucesso: false,
      erro: [
        `❌ Formato inválido: *${comando}*`,
        '',
        'Use: /rNdM ou /rdM',
        'Exemplos: /r2d6+3, /rd20, /r3d8-1',
        '',
        'Digite */guia* para ver todos os exemplos.',
      ].join('\n'),
    };
  }

  const qtd = Number.parseInt(match[1] || '1', 10);
  const lados = Number.parseInt(match[2], 10);
  const operador = match[3] || null;
  const modificador = match[4] === undefined ? null : Number.parseFloat(match[4]);

  if (qtd < 1 || qtd > 100) {
    return {
      sucesso: false,
      erro: `❌ Quantidade inválida: *${qtd}*. Use entre 1 e 100 dados.`,
    };
  }

  if (lados < 2 || lados > 10_000) {
    return {
      sucesso: false,
      erro: `❌ Número de lados inválido: *${lados}*. Use entre 2 e 10000 lados.`,
    };
  }

  if (operador && modificador === null) {
    return {
      sucesso: false,
      erro: '❌ Modificador incompleto. Exemplo correto: /r2d6+3',
    };
  }

  if (operador === '/' && modificador === 0) {
    return {
      sucesso: false,
      erro: '❌ Divisão por zero não é permitida.',
    };
  }

  const rolagens = Array.from({ length: qtd }, () => gerador(lados));

  if (rolagens.some((valor) => !Number.isInteger(valor) || valor < 1 || valor > lados)) {
    throw new RangeError('O gerador de dados retornou um valor fora do intervalo permitido.');
  }

  const somaBase = rolagens.reduce((soma, valor) => soma + valor, 0);
  let total = somaBase;

  if (operador && modificador !== null) {
    const operacoes = {
      '+': () => somaBase + modificador,
      '-': () => somaBase - modificador,
      '*': () => somaBase * modificador,
      '/': () => somaBase / modificador,
    };
    total = operacoes[operador]();
  }

  total = Math.round((total + Number.EPSILON) * 1_000_000) / 1_000_000;

  return {
    sucesso: true,
    resultado: {
      qtd,
      lados,
      rolagens,
      somaBase,
      operador,
      modificador,
      total,
    },
  };
}

function formatarNumero(valor) {
  return Number(valor).toLocaleString('pt-BR', {
    maximumFractionDigits: 6,
  });
}

function quebrarRolagens(rolagens, porLinha = 15) {
  const linhas = [];
  for (let i = 0; i < rolagens.length; i += porLinha) {
    linhas.push(rolagens.slice(i, i + porLinha).join(', '));
  }
  return linhas.join('\n');
}

function obterEmojiDado(lados) {
  const tabela = {
    4: '🔺',
    6: '🎲',
    8: '🔷',
    10: '🔟',
    12: '🔮',
    20: '⭐',
    100: '💯',
  };
  return tabela[lados] || '🎲';
}

/**
 * Formata o resultado para envio no WhatsApp.
 * @param {object} resultado
 * @returns {string}
 */
export function formatarResposta(resultado) {
  const {
    qtd,
    lados,
    rolagens,
    somaBase,
    operador,
    modificador,
    total,
  } = resultado;

  const notacao = `${qtd}d${lados}${operador ? `${operador}${formatarNumero(modificador)}` : ''}`;
  const linhas = [
    `${obterEmojiDado(lados)} *Rolagem: ${notacao}*`,
    '',
    '🎲 Resultados:',
    quebrarRolagens(rolagens),
  ];

  if (qtd > 1) {
    linhas.push('', `➕ Soma dos dados: *${formatarNumero(somaBase)}*`);
  }

  if (operador && modificador !== null) {
    linhas.push(`🔢 Modificador: ${operador}${formatarNumero(modificador)}`);
  }

  linhas.push('', `✅ *Total: ${formatarNumero(total)}*`);
  return linhas.join('\n');
}
