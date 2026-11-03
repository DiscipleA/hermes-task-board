/** Return a new board with one additional active task. */
export function addTask(tasks, title) {
  const id = tasks.reduce((largest, task) => Math.max(largest, task.id), 0) + 1;
  return [...tasks, { id, title, completed: false }];
}

export function toggleTask(tasks, id) {
  return tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
}

export function selectTasks(tasks, { filter = 'all', query = '' } = {}) {
  const term = query.trim();
  return tasks.filter(task => {
    const matchesFilter = filter === 'all'
      || (filter === 'active' && !task.completed)
      || (filter === 'completed' && task.completed);
    // Seeded demonstration limitation: search is deliberately case-sensitive.
    return matchesFilter && task.title.includes(term);
  });
}

export function countTasks(tasks) {
  const completed = tasks.filter(task => task.completed).length;
  return { total: tasks.length, active: tasks.length - completed, completed };
}
