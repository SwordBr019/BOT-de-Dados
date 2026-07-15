import test from 'node:test';
import assert from 'node:assert/strict';
import { calcular } from '../src/calc.js';

test('respeita a prioridade dos operadores', () => {
  assert.deepEqual(calcular('10 + 5 * 2'), { sucesso: true, resultado: 20 });
});

test('calcula expressões com parênteses', () => {
  assert.deepEqual(calcular('(10 + 5) * 2'), { sucesso: true, resultado: 30 });
});

test('calcula porcentagem de um valor', () => {
  assert.deepEqual(calcular('50% de 200'), { sucesso: true, resultado: 100 });
});

test('aceita vírgula decimal', () => {
  assert.deepEqual(calcular('2,5 * 4'), { sucesso: true, resultado: 10 });
});

test('bloqueia divisão por zero', () => {
  const resposta = calcular('10 / 0');
  assert.equal(resposta.sucesso, false);
});

test('bloqueia código e caracteres não matemáticos', () => {
  const resposta = calcular('process.exit()');
  assert.equal(resposta.sucesso, false);
});
