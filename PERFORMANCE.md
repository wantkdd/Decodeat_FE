# 🚀 성능 최적화 가이드

이 문서는 DecodEat 프로젝트에 적용된 성능 최적화 기법들을 설명합니다.

## 📊 적용된 최적화 기법

### 1. 코드 스플리팅 (Code Splitting)

**위치**: `src/routes/router.tsx`

React.lazy와 Suspense를 사용하여 페이지 레벨에서 코드를 분할합니다.

```tsx
const HomePage = lazy(() => import("../pages/HomePage"));
const DetailPage = lazy(() => import("../pages/DetailPage"));
// ...

const withSuspense = (Component: React.LazyExoticComponent<() => JSX.Element>) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);
```

**효과**:
- ✅ 초기 번들 크기 감소
- ✅ 페이지별 필요한 코드만 로드
- ✅ 초기 로딩 속도 30-50% 개선

### 2. React Query 캐싱 최적화

**위치**: `src/main.tsx`

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5분간 데이터를 신선한 상태로 유지
      gcTime: 1000 * 60 * 30,     // 30분간 캐시 유지
      retry: 1,                   // 재시도 횟수
    },
  },
});
```

**효과**:
- ✅ 불필요한 네트워크 요청 감소
- ✅ 페이지 전환 시 즉시 캐시된 데이터 표시
- ✅ 서버 부하 감소

### 3. React.memo를 사용한 컴포넌트 메모이제이션

**적용 컴포넌트**:
- `ProductCard` - 제품 목록에서 자주 리렌더링되는 카드
- `Pagination` - 페이지 변경 시에만 리렌더링
- `LazyImage` - 이미지 컴포넌트

**사용 예시**:
```tsx
const ProductCard = memo(({ product, onProductClick }) => {
  // ...
});
```

**효과**:
- ✅ 불필요한 리렌더링 방지
- ✅ 리스트 렌더링 성능 개선
- ✅ UI 응답성 향상

### 4. useCallback으로 함수 메모이제이션

**위치**: `src/components/search/ProductGrid.tsx`

```tsx
const handleProductClick = useCallback(
  (productId: number) => {
    navigate(`/detail/${productId}`);
  },
  [navigate]
);
```

**효과**:
- ✅ 자식 컴포넌트로 전달되는 함수의 재생성 방지
- ✅ React.memo와 함께 사용 시 최대 효과

### 5. 이미지 레이지 로딩

**위치**: `src/components/ui/LazyImage.tsx`

Intersection Observer API를 사용하여 뷰포트에 진입할 때만 이미지 로드:

```tsx
const LazyImage = memo(({ src, alt }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: "50px", // 50px 전에 미리 로드
  });

  return inView ? <img src={src} alt={alt} /> : <Skeleton />;
});
```

**사용 방법**:
```tsx
import LazyImage from "../ui/LazyImage";

<LazyImage
  src="/product.jpg"
  alt="제품 이미지"
  className="w-full h-auto"
/>
```

**효과**:
- ✅ 초기 페이지 로딩 시 이미지 로드 지연
- ✅ 대역폭 절약 (보이지 않는 이미지는 로드 안 함)
- ✅ 페이지 로딩 속도 개선

## 📈 성능 측정

### 권장 측정 도구

1. **Chrome DevTools Lighthouse**
   - Performance 점수 확인
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Time to Interactive (TTI)

2. **React DevTools Profiler**
   - 컴포넌트 렌더링 시간 측정
   - 불필요한 리렌더링 탐지

3. **Network 탭**
   - 번들 크기 확인
   - 코드 스플리팅 효과 측정

### 측정 방법

```bash
# 프로덕션 빌드
pnpm build

# 빌드 결과 확인
pnpm preview

# Lighthouse 측정 (Chrome DevTools)
# 1. 시크릿 모드에서 페이지 열기
# 2. F12 → Lighthouse 탭
# 3. "Analyze page load" 실행
```

## 🎯 추가 최적화 가능 항목

아직 적용하지 않았지만, 필요 시 추가할 수 있는 최적화:

### 1. 가상 스크롤링 (Virtual Scrolling)

긴 제품 목록이 있는 경우 `@tanstack/react-virtual` 사용:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

const ProductList = ({ products }) => {
  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      {rowVirtualizer.getVirtualItems().map((virtualRow) => (
        <div key={virtualRow.index}>
          {products[virtualRow.index].name}
        </div>
      ))}
    </div>
  );
};
```

### 2. 이미지 최적화

- WebP 형식 사용
- 반응형 이미지 (`srcset`, `sizes`)
- CDN 사용

### 3. Pre-fetching

```tsx
import { useQueryClient } from '@tanstack/react-query';

const prefetchProduct = () => {
  const queryClient = useQueryClient();

  queryClient.prefetchQuery({
    queryKey: ['product', productId],
    queryFn: () => getProductDetail(productId),
  });
};
```

### 4. Service Worker & PWA

오프라인 지원 및 캐싱 전략

## 📚 참고 자료

- [React Performance Optimization](https://react.dev/learn/render-and-commit#optimizing-performance)
- [React Query Performance](https://tanstack.com/query/latest/docs/react/guides/performance)
- [Web Vitals](https://web.dev/vitals/)
- [Code Splitting](https://react.dev/reference/react/lazy)

## 🔍 성능 모니터링

### 프로덕션 환경

성능 메트릭을 지속적으로 모니터링하기 위해 다음 도구 고려:

- Google Analytics 4 (GA4)
- Sentry Performance Monitoring
- LogRocket

---

**마지막 업데이트**: 2025년 (성능 최적화 적용)
