import test from 'node:test';
import assert from 'node:assert/strict';
import { addTask, toggleTask, selectTasks, countTasks } from '../src/tasks.mjs';

const sample = () => [
  { id: 1, title: 'Read a chapter', completed: false },
  { id: 2, title: 'Write notes', completed: true },
  { id: 3, title: 'Read notes', completed: false },
];

test('adds a task without mutating the input', () => {
  const tasks = sample();
  const next = addTask(tasks, 'Prepare demo');
  assert.equal(tasks.length, 3);
  assert.deepEqual(next.at(-1), { id: 4, title: 'Prepare demo', completed: false });
});
test('adds the first task to an empty board', () => {
  assert.deepEqual(addTask([], 'First'), [{ id: 1, title: 'First', completed: false }]);
});
test('toggles completion without changing the original task', () => {
  const tasks = sample();
  const next = toggleTask(tasks, 1);
  assert.equal(next[0].completed, true);
  assert.equal(tasks[0].completed, false);
  assert.equal(toggleTask(next, 1)[0].completed, false);
});
test('ignores unknown task identifiers', () => {
  assert.deepEqual(toggleTask(sample(), 99), sample());
});
test('all filter returns every task', () => {
  assert.deepEqual(selectTasks(sample(), { filter: 'all' }), sample());
});
test('active filter excludes completed tasks', () => {
  assert.deepEqual(selectTasks(sample(), { filter: 'active' }).map(t => t.id), [1, 3]);
});
test('completed filter excludes active tasks', () => {
  assert.deepEqual(selectTasks(sample(), { filter: 'completed' }).map(t => t.id), [2]);
});
test('finds a same-case substring and trims query whitespace', () => {
  assert.deepEqual(selectTasks(sample(), { query: '  Read  ' }).map(t => t.id), [1, 3]);
});
test('combines search with the selected completion filter', () => {
  assert.deepEqual(selectTasks(sample(), { filter: 'completed', query: 'notes' }).map(t => t.id), [2]);
});
test('empty or whitespace-only search leaves the selected filter unchanged', () => {
  assert.deepEqual(selectTasks(sample(), { query: '   ' }), sample());
});
test('counts the whole board independently of visible search results', () => {
  assert.deepEqual(countTasks(sample()), { total: 3, active: 2, completed: 1 });
  assert.deepEqual(countTasks([]), { total: 0, active: 0, completed: 0 });
});
