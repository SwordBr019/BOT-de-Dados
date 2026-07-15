import test from 'node:test';
import assert from 'node:assert/strict';
import { processarComando } from '../src/commands.js';

test('ignora mensagens comuns', () => {
  assert.equal(processarComando('olá'), null);
});

test('responde ao guia', () => {
  assert.match(processarComando('/guia'), /Guia do Bot de Dados/);
});

test('informa quando o comando é desconhecido', () => {
  assert.match(processarComando('/qualquer'), /não reconhecido/i);
});
