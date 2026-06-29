'use strict';

const STORAGE_KEY = 'todos-v1';

// State
let todos = load();
let filter = 'all';

// DOM refs
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const countLabel = document.getElementById('count-label');
const clearBtn = document.getElementById('clear-btn');
const footer = document.getElementById('footer');
const dateEl = document.getElementById('date');

// Init date
dateEl.textContent = new Date().toLocaleDateString('ko-KR', {
  year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
});

// ── Persistence ──────────────────────────────────────────────────────────────

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// ── Core operations ──────────────────────────────────────────────────────────

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  todos.unshift({ id: Date.now(), text: trimmed, completed: false });
  save();
  render();
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) { todo.completed = !todo.completed; save(); render(); }
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  save();
  render();
}

function updateText(id, newText) {
  const trimmed = newText.trim();
  if (!trimmed) { deleteTodo(id); return; }
  const todo = todos.find(t => t.id === id);
  if (todo) { todo.text = trimmed; save(); }
}

function clearCompleted() {
  todos = todos.filter(t => !t.completed);
  save();
  render();
}

// ── Rendering ────────────────────────────────────────────────────────────────

function visible(todo) {
  if (filter === 'active') return !todo.completed;
  if (filter === 'completed') return todo.completed;
  return true;
}

function render() {
  list.innerHTML = '';

  const shown = todos.filter(visible);
  const active = todos.filter(t => !t.completed).length;
  const hasCompleted = todos.some(t => t.completed);

  if (shown.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty-state';
    li.textContent = filter === 'completed' ? '완료된 항목이 없습니다.' :
                     filter === 'active'    ? '진행 중인 항목이 없습니다.' :
                                             '할 일을 추가해보세요!';
    list.appendChild(li);
  } else {
    shown.forEach(todo => list.appendChild(createItem(todo)));
  }

  // Footer
  if (todos.length === 0) {
    footer.classList.add('hidden');
  } else {
    footer.classList.remove('hidden');
    countLabel.textContent = `${active}개 남음`;
    clearBtn.style.visibility = hasCompleted ? 'visible' : 'hidden';
  }
}

function createItem(todo) {
  const li = document.createElement('li');
  li.className = 'todo-item' + (todo.completed ? ' completed' : '');
  li.dataset.id = todo.id;

  // Checkbox
  const check = document.createElement('input');
  check.type = 'checkbox';
  check.className = 'todo-check';
  check.checked = todo.completed;
  check.setAttribute('aria-label', '완료 토글');
  check.addEventListener('change', () => toggleTodo(todo.id));

  // Text (contenteditable span → textarea for editing)
  const text = document.createElement('textarea');
  text.className = 'todo-text';
  text.value = todo.text;
  text.rows = 1;
  text.setAttribute('aria-label', '할 일 내용');
  text.readOnly = true;

  // Auto-grow textarea
  function autoGrow() {
    text.style.height = 'auto';
    text.style.height = text.scrollHeight + 'px';
  }
  autoGrow();

  text.addEventListener('dblclick', () => startEdit());
  text.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); finishEdit(); }
    if (e.key === 'Escape') { cancelEdit(); }
    if (!text.readOnly) autoGrow();
  });
  text.addEventListener('blur', () => { if (!text.readOnly) finishEdit(); });

  let originalText = todo.text;

  function startEdit() {
    if (todo.completed) return;
    text.readOnly = false;
    text.classList.add('editing');
    text.focus();
    originalText = text.value;
    // Place cursor at end
    const len = text.value.length;
    text.setSelectionRange(len, len);
  }

  function finishEdit() {
    text.readOnly = true;
    text.classList.remove('editing');
    updateText(todo.id, text.value);
    autoGrow();
  }

  function cancelEdit() {
    text.value = originalText;
    text.readOnly = true;
    text.classList.remove('editing');
    autoGrow();
  }

  // Delete button
  const del = document.createElement('button');
  del.className = 'delete-btn';
  del.setAttribute('aria-label', '삭제');
  del.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;
  del.addEventListener('click', () => deleteTodo(todo.id));

  li.append(check, text, del);
  return li;
}

// ── Events ───────────────────────────────────────────────────────────────────

form.addEventListener('submit', e => {
  e.preventDefault();
  addTodo(input.value);
  input.value = '';
  input.focus();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.toggle('active', b === btn));
    render();
  });
});

clearBtn.addEventListener('click', clearCompleted);

// ── Bootstrap ────────────────────────────────────────────────────────────────

render();
