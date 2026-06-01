---
layout: post
title:  "동적 메모리 할당 (malloc, calloc, realloc, free)"
date:   2025-04-11
tags: [운영체제,c]
hide_last_modified: true
---

* toc  
{:toc .large-only}


---

## 정적 vs 동적 할당

| | 정적 할당 | 동적 할당 |
|---|---|---|
| 영역 | 스택 | 힙 |
| 크기 | 고정 (컴파일 타임) | 유동 (런타임) |
| 관리 | 자동 해제 | `free()` 직접 호출 |
| 크기 한계 | 작음 (MB) | 큼 (GB도 가능) |
| 사용 예 | `int arr[10]` | `malloc(n * sizeof(int))` |

---

## 함수별 정리
![함수별비교](/assets/img/blog/cs/함수별비교.png)
### `malloc` — 기본 할당

```c
void* malloc(size_t size);
```

- 지정한 바이트만큼 힙에 할당
- 초기화 없음 → 쓰레기값(garbage) 주의
- 실패 시 `NULL` 반환

```c
int* arr = (int*)malloc(5 * sizeof(int));
if (!arr) return -1;  // NULL 체크 필수
```

---

### `calloc` — 0 초기화 할당

```c
void* calloc(size_t n, size_t size);
```

- `n`개 요소 × `size` 바이트 할당
- 전체를 0으로 초기화 → 배열에 적합
- 실패 시 `NULL` 반환

```c
int* arr = (int*)calloc(5, sizeof(int));  // 모두 0
```

> `malloc`보다 약간 느리지만, 초기화 누락 버그를 원천 차단

---

### `realloc` — 크기 변경

```c
void* realloc(void* ptr, size_t new_size);
```

- 기존 할당 블록의 크기를 확장하거나 축소
- 뒤에 공간 있으면 **제자리 확장** (주소 그대로)
- 뒤에 공간 없으면 **새 위치로 이동** 후 데이터 복사 → 기존 블록 자동 해제
- 새로 늘어난 부분은 초기화 안 됨
- 실패 시 `NULL` 반환 (기존 포인터는 유효한 상태로 유지)

```c
// 잘못된 방법 — 실패시 ptr이 NULL이 되어 기존 메모리 누수
ptr = realloc(ptr, new_size);

// 올바른 방법
int* tmp = realloc(ptr, new_size);
if (tmp) ptr = tmp;
```
### REALLOC 내부동작
![내부동작](/assets/img/blog/cs/REALLOC내부동작.png)

---

### `free` — 메모리 해제

```c
void free(void* ptr);
```

- 동적 할당된 메모리 반납. **사용 후 반드시 호출**
- 해제 후 포인터를 `NULL`로 초기화하는 습관 권장

```c
free(ptr);
ptr = NULL;  // 댕글링 포인터 방지
```

#### `free` 하면 안 되는 경우

| 잘못된 예 | 이유 |
|---|---|
| 스택 변수에 `free(&x)` | 동적 할당된 메모리만 해제 가능 |
| 같은 포인터 두 번 `free` | Double free → 힙 손상 |
| `free` 후 포인터 재사용 | 댕글링 포인터 → Undefined Behavior |
| `free` 없이 종료 | 메모리 누수 |

---

## 한눈에 비교

| 함수 | 초기화 | 주요 용도 |
|---|---|---|
| `malloc` | 없음 | 빠르게 할당만 필요할 때 |
| `calloc` | 0으로 초기화 | 배열 등 초기화가 중요할 때 |
| `realloc` | 새 영역 없음 | 크기를 동적으로 바꿔야 할 때 |
| `free` | — | 사용 후 반드시 호출 |

### 안전한 패턴
![안전한패턴](/assets/img/blog/cs/안전한패턴.png)

---

## 체크리스트

- [ ] `malloc` / `calloc` 반환값 NULL 체크
- [ ] 동적 할당 사용 후 `free()` 호출
- [ ] `realloc`은 반환값을 임시 변수에 먼저 받기
- [ ] `free()` 후 포인터에 `NULL` 대입
- [ ] 스택 변수에 `free()` 하지 않기