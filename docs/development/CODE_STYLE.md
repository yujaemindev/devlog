# Code Style Guide

이 프로젝트의 Vue/Nuxt 코드는 아래 규칙을 기본으로 합니다.

## Vue SFC

- Vue 컴포넌트는 Composition API와 `<script setup>`을 사용합니다.
- SFC 블록 순서는 `<template>` → `<script setup>` → `<style>` 순서로 작성합니다.
- 컴포넌트는 템플릿에서 PascalCase로 사용합니다.
- 재사용 컴포넌트 파일은 PascalCase 파일명을 사용합니다.
  - 예: `WorkflowSection.vue`, `ProjectCard.vue`
- Nuxt 라우트 파일은 URL 구조를 우선하므로 기존 pages 디렉터리의 kebab-case/동적 라우트 규칙을 따릅니다.
  - 예: `chatgpt-local-mcp.vue`, `[slug].vue`
- props는 `defineProps()`, emits는 `defineEmits()`을 사용합니다.
- DOM 참조와 브라우저 API는 `ref`, `onMounted`, `onBeforeUnmount` 등 Composition API 생명주기를 사용합니다.

## JavaScript / TypeScript

- 들여쓰기: 공백 2칸
- 문자열: double quote
- 세미콜론: 사용
- 여러 줄 배열/객체/인자: trailing comma 사용
- 중괄호 스타일: 1TBS
- 단일 인자 arrow function은 불필요한 괄호를 생략합니다.
- 파일 끝에는 newline을 둡니다.
- 디버깅용 `console` 호출은 커밋 전에 제거합니다. ESLint에서는 warning으로 표시합니다.

## 포맷과 Lint

Nuxt ESLint의 stylistic rules를 사용합니다. 별도 Prettier 설정을 두지 않고 ESLint를 코드 스타일의 단일 기준으로 사용합니다.

검사:

~~~bash
npm run lint
~~~

자동 수정:

~~~bash
npm run lint:fix
~~~

타입 검사:

~~~bash
npm run typecheck
~~~

코드 변경 후 기본 검증 순서는 다음과 같습니다.

~~~bash
npm run lint
npm run typecheck
npm test
~~~

GitHub Pages 경로나 정적 자산을 변경한 경우에는 추가로 다음 명령을 실행합니다.

~~~bash
npm run test:pages
~~~

## ESLint 설정 위치

스타일 기본값은 `nuxt.config.ts`의 `eslint.config.stylistic`에서 관리합니다.

- `indent: 2`
- `quotes: "double"`
- `semi: true`
- `commaDangle: "always-multiline"`
- `braceStyle: "1tbs"`
- `arrowParens: false`

Vue 구조 규칙은 `eslint.config.mjs`에서 관리합니다.

- `vue/component-api-style`: `script-setup` 강제
- `vue/component-name-in-template-casing`: PascalCase 강제
- `vue/block-order`: template → script → style 순서 강제

새로운 스타일 규칙을 추가할 때는 코드 전체에 적용 가능한지 확인한 뒤 `npm run lint:fix`와 `npm run typecheck`를 함께 실행합니다.
