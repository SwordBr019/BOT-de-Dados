/**
 * Calculadora aritmética sem eval/new Function.
 * Suporta +, -, *, /, parênteses, números decimais e porcentagem.
 */

class ErroExpressao extends Error {}

function normalizarExpressao(expressao) {
  return expressao
    .trim()
    .replace(/,/g, '.')
    .replace(/(\d+(?:\.\d+)?)\s*%\s*de\s*/gi, '$1% * ');
}

function tokenizar(expressao) {
  const tokens = [];
  let posicao = 0;

  while (posicao < expressao.length) {
    const caractere = expressao[posicao];

    if (/\s/.test(caractere)) {
      posicao += 1;
      continue;
    }

    if (/[+\-*/()%]/.test(caractere)) {
      tokens.push({ tipo: caractere, valor: caractere });
      posicao += 1;
      continue;
    }

    if (/\d|\./.test(caractere)) {
      const inicio = posicao;
      let pontos = 0;

      while (posicao < expressao.length && /\d|\./.test(expressao[posicao])) {
        if (expressao[posicao] === '.') pontos += 1;
        posicao += 1;
      }

      const texto = expressao.slice(inicio, posicao);
      if (pontos > 1 || texto === '.' || !/^\d*\.?\d+$/.test(texto)) {
        throw new ErroExpressao('Número inválido.');
      }

      const valor = Number(texto);
      if (!Number.isFinite(valor)) {
        throw new ErroExpressao('Número fora do limite permitido.');
      }

      tokens.push({ tipo: 'numero', valor });
      continue;
    }

    throw new ErroExpressao(`Caractere não permitido: ${caractere}`);
  }

  tokens.push({ tipo: 'fim', valor: null });
  return tokens;
}

function criarAvaliador(tokens) {
  let indice = 0;

  const atual = () => tokens[indice];
  const consumir = (tipo) => {
    if (atual().tipo !== tipo) {
      throw new ErroExpressao(`Era esperado "${tipo}".`);
    }
    const token = atual();
    indice += 1;
    return token;
  };

  const primaria = () => {
    if (atual().tipo === 'numero') {
      return consumir('numero').valor;
    }

    if (atual().tipo === '(') {
      consumir('(');
      const valor = expressaoCompleta();
      consumir(')');
      return valor;
    }

    throw new ErroExpressao('Número ou parêntese esperado.');
  };

  const percentual = () => {
    let valor = primaria();
    while (atual().tipo === '%') {
      consumir('%');
      valor /= 100;
    }
    return valor;
  };

  const unaria = () => {
    if (atual().tipo === '+') {
      consumir('+');
      return unaria();
    }
    if (atual().tipo === '-') {
      consumir('-');
      return -unaria();
    }
    return percentual();
  };

  const termo = () => {
    let valor = unaria();

    while (atual().tipo === '*' || atual().tipo === '/') {
      const operador = atual().tipo;
      consumir(operador);
      const direita = unaria();

      if (operador === '/' && direita === 0) {
        throw new ErroExpressao('Divisão por zero não é permitida.');
      }

      valor = operador === '*' ? valor * direita : valor / direita;
    }

    return valor;
  };

  const expressaoCompleta = () => {
    let valor = termo();

    while (atual().tipo === '+' || atual().tipo === '-') {
      const operador = atual().tipo;
      consumir(operador);
      const direita = termo();
      valor = operador === '+' ? valor + direita : valor - direita;
    }

    return valor;
  };

  return () => {
    const resultado = expressaoCompleta();
    consumir('fim');
    return resultado;
  };
}

/**
 * @param {string} expressao
 * @returns {{sucesso: boolean, resultado?: number, erro?: string}}
 */
export function calcular(expressao) {
  const original = String(expressao ?? '').trim();

  if (!original) {
    return {
      sucesso: false,
      erro: '❌ Nenhuma expressão informada.\nExemplo: /calc 10 + 5 * 2',
    };
  }

  if (original.length > 200) {
    return {
      sucesso: false,
      erro: '❌ A expressão é muito longa. Use no máximo 200 caracteres.',
    };
  }

  try {
    const normalizada = normalizarExpressao(original);
    const tokens = tokenizar(normalizada);
    const avaliar = criarAvaliador(tokens);
    const resultado = avaliar();

    if (!Number.isFinite(resultado)) {
      throw new ErroExpressao('Resultado inválido ou fora do limite.');
    }

    const arredondado = Math.round((resultado + Number.EPSILON) * 1_000_000) / 1_000_000;
    return { sucesso: true, resultado: arredondado };
  } catch (erro) {
    const motivo = erro instanceof ErroExpressao ? erro.message : 'Expressão inválida.';
    return {
      sucesso: false,
      erro: [
        `❌ Expressão inválida: *${original}*`,
        '',
        motivo,
        'Use apenas números, +, -, *, /, %, ( e ).',
        'Exemplo: /calc (10 + 5) * 2',
      ].join('\n'),
    };
  }
}

export function formatarRespostaCalc(expressaoOriginal, resultado) {
  const resultadoFormatado = Number(resultado).toLocaleString('pt-BR', {
    maximumFractionDigits: 6,
  });

  return [
    '🧮 *Calculadora*',
    '',
    `📝 Expressão: \`${expressaoOriginal}\``,
    '',
    `✅ *Resultado: ${resultadoFormatado}*`,
  ].join('\n');
}
