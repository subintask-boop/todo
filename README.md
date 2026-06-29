# Todo 앱

프레임워크 없이 순수 HTML/CSS/JS로 만든 심플한 할 일 관리 앱입니다.

## 기능

- 할 일 추가 / 삭제
- 완료 체크 토글
- 더블클릭으로 인라인 편집 (Enter 저장, Esc 취소)
- 전체 / 진행중 / 완료 필터
- 완료 항목 일괄 삭제
- `localStorage`에 자동 저장 (새로고침해도 유지)

## 실행

빌드 도구나 서버 없이 `index.html`을 브라우저에서 직접 열면 됩니다.

```bash
# 파일 탐색기에서 열기
start index.html

# 또는 Python 간이 서버 (file:// 프로토콜 미지원 브라우저 대응)
python -m http.server 8080
```

## 구조

```
todo/
├── index.html   # 마크업 및 DOM 구조
├── style.css    # CSS 변수 기반 디자인 토큰
└── app.js       # 전체 로직 (상태 관리 / 렌더링 / 이벤트)
```

## 데이터 모델

```js
// localStorage 'todos-v1' 키에 JSON 배열로 저장
{ id: number, text: string, completed: boolean }
```
