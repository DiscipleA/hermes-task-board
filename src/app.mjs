import { addTask, toggleTask, selectTasks, countTasks } from './tasks.mjs';

export function mountBoard(document) {
  const form = document.getElementById('task-form');
  const title = document.getElementById('task-title');
  const list = document.getElementById('task-list');
  const search = document.getElementById('search');
  const counts = document.getElementById('counts');
  const emptyMessage = document.getElementById('empty-message');
  const filters = [...document.querySelectorAll('[data-filter]')];
  let tasks = [];
  let filter = 'all';

  function render() {
    const visible = selectTasks(tasks, { filter, query: search.value });
    list.replaceChildren();
    for (const task of visible) {
      const row = document.createElement('li');
      row.className = task.completed ? 'task completed' : 'task';
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.setAttribute('aria-label', `Mark ${task.title} ${task.completed ? 'active' : 'completed'}`);
      checkbox.addEventListener('change', () => {
        tasks = toggleTask(tasks, task.id);
        render();
        // Keep keyboard focus when a visible checkbox is replaced by rendering.
        const index = selectTasks(tasks, { filter, query: search.value }).findIndex(item => item.id === task.id);
        if (index >= 0) list.children[index].children[0].children[0].focus();
        else search.focus();
      });
      const text = document.createElement('span');
      text.textContent = task.title;
      label.append(checkbox, text);
      row.append(label);
      list.append(row);
    }
    const totals = countTasks(tasks);
    counts.textContent = `${totals.total} total · ${totals.active} active · ${totals.completed} completed · ${visible.length} shown`;
    emptyMessage.hidden = visible.length !== 0;
    for (const button of filters) button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    tasks = addTask(tasks, title.value.trim());
    title.value = '';
    render();
    title.focus();
  });
  search.addEventListener('input', render);
  for (const button of filters) {
    button.addEventListener('click', () => {
      filter = button.dataset.filter;
      render();
    });
  }
  render();
}
