import test from 'tape';

import prompt, { _injected, inject, prompt as _prompt } from '..';

const { prompts } = prompt;

test('basics', (t) => {
  t.plan(4);
  t.equal(typeof prompts, 'object');
  t.equal(typeof prompt, 'function');
  t.equal(typeof _prompt, 'function');
  t.equal(typeof inject, 'function');
});

test('prompts', (t) => {
  t.plan(25);

  const types = [
    'text',
    'password',
    'invisible',
    'number',
    'confirm',
    'list',
    'toggle',
    'select',
    'multiselect',
    'autocompleteMultiselect',
    'autocomplete',
    'date',
  ];

  for (const p of types) {
    t.true(p in prompts, `${prompts[p].name} exists`);
    t.equal(typeof prompts[p], 'function', `${prompts[p].name} is typeof function`);
  }

  t.equal(Object.keys(prompts).length, types.length, 'all prompts are exported');
});

test('injects', (t) => {
  const injected = [1, 2, 3];
  inject(injected);
  t.same(_injected, injected, 'injects array of answers');

  prompt({ type: 'text', name: 'a', message: 'a message' }).then((foo) => {
    t.same(foo, { a: 1 }, 'immediately returns object with injected answer');
    t.same(_injected, [2, 3], 'deletes the first answer from internal array');

    prompt([
      { type: 'text', name: 'b', message: 'b message' },
      { type: 'text', name: 'c', message: 'c message' },
    ]).then((bar) => {
      t.same(bar, { b: 2, c: 3 }, 'immediately handles two prompts at once');
      t.same(_injected, [], 'leaves behind empty internal array when exhausted');
      t.end();
    });
  });
});
