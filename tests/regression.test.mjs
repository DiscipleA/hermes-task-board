import test from 'node:test';
import assert from 'node:assert/strict';
import { selectTasks } from '../src/tasks.mjs';

const tasks = [
  { id: 1, title: 'Read Chapter', completed: false },
  { id: 2, title: 'READ notes', completed: true },
  { id: 3, title: 'Write summary', completed: false },
];

test('search matches task titles case-insensitively and trims surrounding whitespace', () => {
  assert.deepEqual(
    selectTasks(tasks, { query: '  rEaD  ' }).map(task => task.id),
    [1, 2],
    'search should ignore letter case and trim surrounding whitespace',
  );
});

test('case-insensitive search still respects the completion filter', () => {
  assert.deepEqual(
    selectTasks(tasks, { filter: 'completed', query: '  read  ' }).map(task => task.id),
    [2],
    'search should remain composable with completion filters',
  );
});
