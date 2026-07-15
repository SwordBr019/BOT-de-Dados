export const GUIA = [
  '📘 *Guia do Bot de Dados*',
  '',
  '🎲 *Rolagem de Dados (/rNdM):*',
  '- /rd12 → rola 1 dado de 12 lados',
  '- /r2d12 → rola 2 dados de 12 lados',
  '- /r7d13 → rola 7 dados de 13 lados',
  '- Com modificadores:',
  '  • /r2d6+3 → rola 2d6 e soma 3',
  '  • /rd20-1 → rola 1d20 e subtrai 1',
  '  • /r3d4*2 → rola 3d4 e multiplica por 2',
  '  • /r4d6/2 → rola 4d6 e divide por 2',
  '',
  '🧮 *Cálculos (/calc):*',
  '- /calc 10 + 5 * 2',
  '- /calc (10 + 5) * 2',
  '- /calc 50% de 200',
  '- /calc 50% * 300',
  '',
  'ℹ️ *Ajuda:*',
  '- /guia → mostra este guia',
].join('\n');

export const BOAS_VINDAS = [
  '🎲 *Bot de Dados — Pronto!*',
  '',
  'Olá! Posso ajudar com:',
  '',
  '🎲 Rolagem de dados → /r2d6+3',
  '🧮 Cálculos matemáticos → /calc 10 + 5',
  '',
  'Digite */guia* para ver todos os comandos.',
].join('\n');

export const COMANDO_DESCONHECIDO = [
  '❓ Comando não reconhecido.',
  '',
  'Comandos disponíveis:',
  '🎲 /rNdM — Rolar dados, como /r2d6 ou /rd20+5',
  '🧮 /calc — Calcular, como /calc 10 + 5 * 2',
  'ℹ️ /guia — Ver o guia completo',
].join('\n');

export const AJUDA_CALCULADORA = [
  '🧮 *Calculadora*',
  '',
  'Informe uma expressão depois de /calc.',
  '',
  'Exemplos:',
  '• /calc 10 + 5 * 2',
  '• /calc (10 + 5) * 2',
  '• /calc 50% de 200',
  '• /calc 50% * 300',
].join('\n');
