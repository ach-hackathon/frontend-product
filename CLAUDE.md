# CLAUDE.md — Eventigo Frontend

## Project

- **Stack**: React 19, Vite 7, TypeScript 5 (strict mode)
- **Architecture**: Feature-Sliced Design (FSD)
- **Package manager**: npm
- **Data fetching**: TanStack Query v5

## Commands

```bash
npm run dev              # dev server (Vite)
npm run build            # production build
npm run preview          # preview production build
npm run test             # Vitest (все тесты)
npm run test <path>      # один тест — предпочтительно при разработке
npm run lint             # ESLint
npm run typecheck        # tsc --noEmit
npm run generate:types   # openapi-typescript → src/shared/api/types.ts
```

**После каждой серии изменений обязательно:**
1. `npm run typecheck` — исправить все ошибки
2. `npm run lint` — исправить все ошибки
3. `npm run test <изменённый файл>` — убедиться что тесты проходят

## Architecture

Используем **Feature-Sliced Design (FSD)**. Подробная документация: https://feature-sliced.design

Слои сверху вниз, каждый импортирует только из слоёв **ниже**:

```
app → pages → widgets → features → entities → shared
```

```
src/
  app/        # Инициализация: провайдеры, роутер, глобальные стили
  pages/      # Только композиция виджетов, без логики
  widgets/    # Самодостаточные блоки UI
  features/   # Бизнес-действия пользователя (мутации, формы)
  entities/   # Бизнес-сущности (queries, типы, UI сущности)
  shared/     # Без бизнес-логики: ui-kit, утилиты, api-клиент
    api/
      client.ts    # Базовый fetch-wrapper — всегда использовать его
      types.ts     # Автогенерация из Swagger (не редактировать!)
    ui/            # UI kit: Button, Input, Modal...
    lib/           # Утилиты: formatDate, cn и др.
    config/env.ts  # Переменные окружения
```

**Ключевые файлы для понимания проекта:**
- Пример entity: `src/entities/event/`
- Пример feature: `src/features/create-event/`
- API-клиент: `src/shared/api/client.ts`

## FSD — Важные правила

- Кросс-импорты между слайсами одного слоя **запрещены**
- Каждый слайс экспортирует только через `index.ts`
- Импорт по внутреннему пути запрещён: `@/entities/event/ui/EventCard` ❌
- Query hooks (чтение) → `entities/[name]/model/queries.ts`
- Мутации → `features/[name]/model/use[Action].ts`

## API Integration

- **Base URL**: `https://api.stg.eventigo.io` (env: `VITE_API_URL`)
- **Auth**: `Authorization: Bearer <token>`
- **Swagger**: `https://api.stg.eventigo.io/swagger/index.html`
- **Типы**: `npm run generate:types` → `src/shared/api/types.ts` (не редактировать)

Всегда использовать `apiRequest` из `src/shared/api/client.ts`. Прямой `fetch` запрещён.

## Code Conventions

- Компоненты: named export, props-интерфейс в том же файле
- Слайс/папка: `kebab-case` | Компонент: `PascalCase` | Хук: `use` + `camelCase`
- API-объект: `camelCase` + `Api` (eventApi) | DTO: `PascalCase` + `Dto` (CreateEventDto)
- Импорты: только абсолютные через `@/`
- `default export` для компонентов — запрещён
- `any` — запрещён | `as` — только с комментарием почему

### TypeScript 5

- `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` включены
- Использовать `satisfies` для валидации типов без сужения
- Использовать `const` type parameters (TS 5.0) для строгих дженериков

## Testing

- Тестовый файл — рядом с файлом: `EventCard.test.tsx` рядом с `EventCard.tsx`
- Запускать один тест во время разработки: `npm run test src/entities/event`
- Писать тест **до** реализации (TDD)
- Не изменять тесты во время реализации
- Не тестировать то, что ловит TypeScript

## Git

- Формат коммитов: Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`)
- Коммитить часто — по завершению каждого логического шага
- Не упоминать "Claude" или "AI" в сообщениях коммитов

## Error Handling

- Все API-ошибки — класс `ApiError` из `src/shared/api/client.ts`
- Мутации: обрабатывать в `onError` колбэке `useMutation`
- Компоненты: поле `error` из `useQuery` + React 19 Error Boundary
- Не глотать ошибки молча — всегда логировать или пробрасывать

## Common Mistakes Claude Makes Here

<!-- Заполнять по мере работы с проектом -->
- При создании нового слайса — не забывать создавать `index.ts` с публичным API
- Не импортировать `eventApi` напрямую из features — только через `entities/event`
- При добавлении query — добавлять ключ в `eventKeys`, не создавать inline строки
- `useEffect` для загрузки данных — заменять на TanStack Query

## Rules — НЕ делать

- ❌ Нарушать порядок импортов FSD
- ❌ Кросс-импорты между слайсами одного слоя
- ❌ Импортировать по внутреннему пути — только через `index.ts`
- ❌ `fetch` напрямую — только через `apiRequest`
- ❌ `useEffect` для загрузки данных — только TanStack Query
- ❌ `default export` для компонентов
- ❌ Бизнес-логика в `pages/` — только композиция
- ❌ Редактировать `src/shared/api/types.ts` вручную
- ❌ Хранить серверные данные в локальном стейте
