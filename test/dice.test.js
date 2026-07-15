import test from 'node:test';
import assert from 'node:assert/strict';
import { interpretarRolagem } from '../src/dice.js';

test('interpreta um d20 sem quantidade explícita', () => {
  const resposta = interpretarRolagem('/rd20', () => 13);
  assert.equal(resposta.sucesso, true);
  assert.deepEqual(resposta.resultado.rolagens, [13]);
  assert.equal(resposta.resultado.total, 13);
});

test('soma modificador', () => {
  const valores = [4, 5];
  const resposta = interpretarRolagem('/r2d6+3', () => valores.shift());
  assert.equal(resposta.sucesso, true);
  assert.equal(resposta.resultado.somaBase, 9);
  assert.equal(resposta.resultado.total, 12);
});

test('aceita espaços no comando', () => {
  const resposta = interpretarRolagem('/r 2d6 + 3', () => 2);
  assert.equal(resposta.sucesso, true);
  assert.equal(resposta.resultado.total, 7);
});

test('rejeita divisão por zero', () => {
  const resposta = interpretarRolagem('/r2d6/0');
  assert.equal(resposta.sucesso, false);
});

test('limita quantidade de dados', () => {
  const resposta = interpretarRolagem('/r101d6');
  assert.equal(resposta.sucesso, false);
});
