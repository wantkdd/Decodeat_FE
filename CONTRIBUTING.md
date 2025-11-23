# 기여 가이드 (Contributing Guide)

DecodEat 프로젝트에 관심을 가져주셔서 감사합니다! 이 문서는 프로젝트에 기여하는 방법을 안내합니다.

## 📋 목차

- [시작하기](#-시작하기)
- [개발 환경 설정](#-개발-환경-설정)
- [브랜치 전략](#-브랜치-전략)
- [커밋 컨벤션](#-커밋-컨벤션)
- [Pull Request 프로세스](#-pull-request-프로세스)
- [코드 스타일](#-코드-스타일)
- [테스트](#-테스트)

## 🚀 시작하기

### 필수 요구사항

- Node.js 18 이상
- pnpm (권장 패키지 매니저)
- Git

### 저장소 포크 및 클론

1. 이 저장소를 포크합니다
2. 포크한 저장소를 로컬에 클론합니다

```bash
git clone https://github.com/YOUR_USERNAME/Decodeat_FE.git
cd Decodeat_FE
```

3. 원본 저장소를 upstream으로 추가합니다

```bash
git remote add upstream https://github.com/wantkdd/Decodeat_FE.git
```

## 🛠 개발 환경 설정

1. 의존성 설치

```bash
pnpm install
```

2. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성합니다:

```bash
cp .env.example .env
```

`.env` 파일에서 필요한 환경 변수를 설정합니다.

3. 개발 서버 실행

```bash
pnpm dev
```

4. 린트 검사

```bash
pnpm lint
```

## 🌿 브랜치 전략

### Git-flow

- **main**: 프로덕션 배포 브랜치
- **feature**: 기능 개발 브랜치

### 브랜치 네이밍 규칙

```
feature/이름-기능제목#이슈번호
```

예시:
- `feature/wantkdd-login#12`
- `feature/yujin-nutrition-chart#34`

### 작업 흐름

1. **최신 코드 동기화**
   ```bash
   git checkout main
   git pull upstream main
   ```

2. **새 브랜치 생성**
   ```bash
   git checkout -b feature/이름-기능제목#이슈번호
   ```

3. **코드 작성 및 커밋**
   - 기능 구현
   - 테스트 작성 (권장)
   - 커밋 (아래의 커밋 컨벤션 참고)

4. **원격 저장소에 푸시**
   ```bash
   git push origin feature/이름-기능제목#이슈번호
   ```

5. **Pull Request 생성**

## 📝 커밋 컨벤션

커밋 메시지는 다음 형식을 따릅니다:

```
<type>: <subject> #<issue-number>
```

### Type 목록

| Type | 설명 | 예시 |
|------|------|------|
| `feat` | 새로운 기능 추가 | `feat: 카카오 로그인 기능 구현 #12` |
| `fix` | 버그 수정 | `fix: 제품 상세 페이지 로딩 오류 수정 #34` |
| `design` | UI/CSS 변경 | `design: 마이페이지 반응형 스타일 적용 #56` |
| `refactor` | 코드 리팩토링 | `refactor: useAuth 훅 로직 개선 #78` |
| `docs` | 문서 수정 | `docs: README 설치 가이드 업데이트` |
| `test` | 테스트 코드 추가/수정 | `test: 로그인 컴포넌트 테스트 추가 #90` |
| `chore` | 빌드/패키지 설정 변경 | `chore: vite 설정 업데이트` |
| `style` | 코드 포맷팅 (기능 변경 없음) | `style: prettier 적용` |

### 좋은 커밋 메시지 예시

```bash
feat: 영양소 백과사전 페이지 추가 #42
fix: 이미지 업로드 시 압축 오류 수정 #43
design: 검색 페이지 모바일 레이아웃 개선 #44
refactor: API 에러 처리 로직 통합 #45
```

## 🔄 Pull Request 프로세스

### PR 생성 전 체크리스트

- [ ] 최신 main 브랜치와 동기화했는가?
- [ ] 린트 에러가 없는가? (`pnpm lint`)
- [ ] 빌드가 성공하는가? (`pnpm build`)
- [ ] 코드에 주석이 필요한 부분에 작성했는가?
- [ ] 관련 이슈 번호를 명시했는가?

### PR 템플릿

Pull Request 생성 시 다음 정보를 포함해주세요:

```markdown
## 📌 관련 이슈
- Closes #이슈번호

## 🔨 변경 사항
- 변경 내용 1
- 변경 내용 2

## 📸 스크린샷 (UI 변경 시)
<!-- 스크린샷 첨부 -->

## ✅ 체크리스트
- [ ] 린트 검사 통과
- [ ] 빌드 성공
- [ ] 테스트 작성 (해당되는 경우)
```

### 리뷰 프로세스

1. PR을 생성하면 팀원 1명이 리뷰합니다
2. 리뷰어는 코드 품질, 로직, 스타일을 확인합니다
3. 수정 요청이 있으면 반영 후 다시 리뷰를 요청합니다
4. Approve를 받으면 main 브랜치에 merge합니다

## 💅 코드 스타일

### TypeScript

- **타입 안전성**: `any` 사용을 피하고 명시적인 타입을 사용합니다
- **인터페이스**: Props는 인터페이스로 정의하고 JSDoc 주석을 추가합니다
- **네이밍**:
  - 컴포넌트: PascalCase (`ProductCard`)
  - 변수/함수: camelCase (`getUserInfo`)
  - 상수: UPPER_SNAKE_CASE (`API_BASE_URL`)
  - 파일명: PascalCase (컴포넌트), camelCase (유틸리티)

### React

- **함수형 컴포넌트** 사용
- **Hooks**: 커스텀 훅은 `use`로 시작
- **Props 분해**: 컴포넌트 파라미터에서 직접 분해
  ```tsx
  const MyComponent = ({ title, onClose }: Props) => { ... }
  ```

### 파일 구조

```
src/
├── components/     # 재사용 가능한 컴포넌트
├── pages/         # 페이지 컴포넌트
├── hooks/         # 커스텀 훅
├── apis/          # API 통신
├── utils/         # 유틸리티 함수
├── types/         # TypeScript 타입 정의
└── constants/     # 상수
```

### 주석

- **JSDoc**: 함수와 컴포넌트에 JSDoc 주석 작성
  ```tsx
  /**
   * 사용자 정보를 가져오는 훅
   * @returns 사용자 정보 객체
   */
  export const useUser = () => { ... }
  ```
- **복잡한 로직**: 이해하기 어려운 로직에는 설명 주석 추가
- **TODO/FIXME**: 임시 해결책에는 TODO 주석 추가

### 포맷팅

프로젝트는 Prettier를 사용합니다. 코드 작성 후 자동 포맷팅을 실행하세요:

```bash
pnpm format  # (설정되어 있는 경우)
```

## 🧪 테스트

테스트 작성은 권장사항이지만 필수는 아닙니다. 테스트를 작성하는 경우:

- **단위 테스트**: 유틸리티 함수, 커스텀 훅
- **컴포넌트 테스트**: 주요 UI 컴포넌트
- **통합 테스트**: 사용자 플로우

```bash
# 테스트 실행 (설정된 경우)
pnpm test
```

## ❓ 질문이나 도움이 필요한 경우

- GitHub Issues에 질문을 올려주세요
- 팀원에게 직접 문의하세요

## 📄 라이선스

기여하신 코드는 프로젝트 라이선스를 따릅니다.

---

다시 한 번 기여에 감사드립니다! 🎉
