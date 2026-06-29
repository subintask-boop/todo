# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 실행 방법

빌드 도구나 서버 없이 `index.html`을 브라우저에서 직접 열면 됩니다.

```
# 파일 탐색기에서 열기
start index.html

# 또는 Python 간이 서버 (localStorage가 file:// 프로토콜에서 동작하지 않는 브라우저 대응)
python -m http.server 8080
```

## 아키텍처

프레임워크 없는 순수 HTML/CSS/JS 싱글 페이지 앱. 세 파일로 구성됩니다.

- **`index.html`** — 마크업과 DOM 구조. `app.js`와 `style.css`를 로드.
- **`style.css`** — CSS 변수(`:root`)로 전체 디자인 토큰 관리.
- **`app.js`** — 모든 로직을 담당하는 단일 스크립트.

### app.js 구조

모듈 시스템 없이 전역 스코프에서 동작하며, 네 구역으로 나뉩니다.

1. **Persistence** (`load` / `save`) — `localStorage`의 `todos-v1` 키에 JSON 배열을 읽고 씁니다.
2. **Core operations** (`addTodo`, `toggleTodo`, `deleteTodo`, `updateText`, `clearCompleted`) — 상태(`todos` 배열)를 변경하고 즉시 `save()` → `render()`를 호출합니다.
3. **Rendering** (`render` / `createItem`) — 매번 `list.innerHTML = ''`으로 초기화한 뒤 현재 `filter` 값에 맞는 항목만 DOM으로 재구성합니다. 가상 DOM 없이 전체 재렌더링 방식입니다.
4. **Events** — form submit, 필터 버튼, 완료 삭제 버튼의 이벤트를 등록합니다.

### 데이터 모델

```js
// todos 배열의 각 항목
{ id: number, text: string, completed: boolean }
```

`id`는 `Date.now()`로 생성하므로 항상 고유합니다.

### 인라인 편집 흐름

`createItem` 내부의 클로저로 편집 상태를 관리합니다. textarea는 기본적으로 `readOnly = true`이고, 더블클릭 시 `startEdit()` → Enter/blur 시 `finishEdit()` → Esc 시 `cancelEdit()`로 전환됩니다. 편집 중 빈 텍스트로 저장하면 해당 항목이 삭제됩니다.
