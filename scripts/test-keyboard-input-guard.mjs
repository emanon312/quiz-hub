#!/usr/bin/env node

import assert from 'node:assert/strict';

const calls = [];
globalThis.window = globalThis;
globalThis.document = {
  querySelectorAll() { return []; },
};
globalThis.window.innerWidth = 390;
globalThis.window.innerHeight = 844;
globalThis.window.scrollY = 0;
globalThis.window.scrollTo = () => {};
window.Actions = {
  prevQuestion() { calls.push('prev'); },
  nextQuestion() { calls.push('next'); },
  checkAnswer() { calls.push('check'); },
  toggleAnswer() { calls.push('toggle'); },
};

const qOptions = { style: { display: 'block' } };
globalThis.document.getElementById = (id) => (id === 'qOptions' ? qOptions : null);

await import('../js/09-keyboard.js?test=keyboard-input-guard');

const ctx = {
  focusedOptIdx: 0,
  activeSetData() {
    return { userAnswers: {}, currentIdx: 0 };
  },
  filteredQuestions() {
    return [{ id: 1, type: 'single', opts: ['A. One', 'B. Two'] }];
  },
  saveData() { calls.push('save'); },
  renderQuestion() { calls.push('render'); },
  setFocusedOptIdx() { calls.push('focus'); },
};

function keyEvent(key, target) {
  let prevented = false;
  return {
    key,
    target,
    preventDefault() { prevented = true; },
    get prevented() { return prevented; },
  };
}

const formTargets = [
  { tagName: 'INPUT' },
  { tagName: 'TEXTAREA' },
  { tagName: 'SELECT' },
  { tagName: 'DIV', isContentEditable: true },
  {
    tagName: 'SPAN',
    closest(selector) {
      return selector.includes('contenteditable') ? { tagName: 'DIV' } : null;
    },
  },
];

for (const target of formTargets) {
  for (const key of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', '1', 'Enter']) {
    calls.length = 0;
    const event = keyEvent(key, target);
    window.Keyboard.handleKey(event, ctx);
    assert.deepEqual(calls, [], `${key} should be ignored while typing in ${target.tagName}`);
    assert.equal(event.prevented, false, `${key} should not prevent default while typing in ${target.tagName}`);
  }
}

calls.length = 0;
window.Keyboard.handleKey(keyEvent('ArrowRight', { tagName: 'DIV' }), ctx);
assert.deepEqual(calls, ['next'], 'global shortcuts should still work outside editable targets');

console.log('Keyboard input guard tests passed');
