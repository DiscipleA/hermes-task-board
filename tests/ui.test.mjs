import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { mountBoard } from '../src/app.mjs';

// A deliberately small DOM adapter exercises real event handlers without dependencies.
// This is not a browser, layout, screen-reader, or end-to-end accessibility test.
class Element extends EventTarget {
  constructor(tagName = 'div') {
    super();
    Object.assign(this, { tagName, children: [], attributes: {}, value: '', checked: false, dataset: {}, hidden: false, textContent: '' });
  }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  focus() { this.focused = true; }
}
function fixture() {
  const elements = Object.fromEntries(['task-form', 'task-title', 'task-list', 'search', 'counts', 'empty-message'].map(id => [id, new Element()]));
  const filters = ['all', 'active', 'completed'].map(filter => {
    const button = new Element('button');
    button.dataset.filter = filter;
    return button;
  });
  const document = {
    getElementById: id => elements[id],
    querySelectorAll: selector => { assert.equal(selector, '[data-filter]'); return filters; },
    createElement: tag => new Element(tag),
  };
  mountBoard(document);
  const add = title => {
    elements['task-title'].value = title;
    const event = new Event('submit', { cancelable: true });
    elements['task-form'].dispatchEvent(event);
    assert.equal(event.defaultPrevented, true);
  };
  return { elements, filters, add };
}

test('initial UI announces an empty board', () => {
  const { elements } = fixture();
  assert.equal(elements['task-list'].children.length, 0);
  assert.equal(elements['counts'].textContent, '0 total · 0 active · 0 completed · 0 shown');
  assert.equal(elements['empty-message'].hidden, false);
});
test('submitting a task renders literal text and clears the input', () => {
  const { elements, add } = fixture();
  add('<img src=x onerror=alert(1)>');
  const [row] = elements['task-list'].children;
  assert.equal(row.children[0].children[1].textContent, '<img src=x onerror=alert(1)>');
  assert.equal(elements['task-title'].value, '');
  assert.equal(elements['empty-message'].hidden, true);
});
test('checkbox events update counts and completion', () => {
  const { elements, add } = fixture();
  add('Review');
  elements['task-list'].children[0].children[0].children[0].dispatchEvent(new Event('change'));
  assert.equal(elements['counts'].textContent, '1 total · 0 active · 1 completed · 1 shown');
  assert.equal(elements['task-list'].children[0].children[0].children[0].checked, true);
});
test('native filter buttons and search events update visible rows', () => {
  const { elements, filters, add } = fixture();
  add('Read'); add('Write');
  elements['search'].value = 'Read';
  elements['search'].dispatchEvent(new Event('input'));
  assert.equal(elements['task-list'].children.length, 1);
  filters[2].dispatchEvent(new Event('click'));
  assert.equal(elements['task-list'].children.length, 0);
  assert.equal(filters[2].attributes['aria-pressed'], 'true');
  assert.equal(filters[0].attributes['aria-pressed'], 'false');
  assert.equal(elements['empty-message'].hidden, false);
});
test('HTML supplies native controls, associated labels, status and local assets', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /<label for="task-title">/);
  assert.match(html, /<label for="search">/);
  assert.match(html, /role="status"/);
  assert.match(html, /<button type="submit">/);
  assert.match(html, /type="module" src="\.\/src\/main\.mjs"/);
  assert.doesNotMatch(html, /(?:src|href)="https?:/);
  const app = await readFile(new URL('../src/app.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(app, /innerHTML/);
});
