---
layout: post
title:  "동기화 기법 3대장: Lock / Semaphore / Condition Variable"
date:   2025-05-10
tags: [운영체제]
hide_last_modified: true
---

* toc
{:toc .large-only}

Lock, Semaphore, Condition Variable은 모두 동기화(Synchronization) 기법으로,
여러 스레드·프로세스가 공유 자원을 엉키지 않게 사용하도록 만드는 기술이다.

## 1. 동기화란?

동기화(Synchronization)는 여러 스레드나 프로세스가 **공유 자원**을 사용할 때, 충돌이나 오류 없이 올바르게 작동하도록 순서를 맞춰주는 기술이다.

## 2. 왜 동기화가 필요할까?

여러 스레드·프로세스가 같은 메모리, 같은 파일, 같은 네트워크 리소스를 **아무 조정 없이 동시에** 건드리면 문제가 터진다. 값이 꼬이고(데이터 레이스), 프로그램이 이상하게 동작하거나(논리 오류), 심하면 죽을 수도 있다(crash).

### 동기화가 없으면 생기는 문제

#### 2-1. 데이터 레이스 (Data Race)

두 스레드가 동시에 같은 데이터를 읽고 수정해 예상 못 한 값이 생기는 문제다.

```c
// counter를 1000번 증가시키는 코드
counter++;
```

- A 스레드가 `counter`를 읽고, B 스레드도 거의 동시에 읽으면
- 둘 다 `counter = 5`를 보고, 둘 다 `counter = 6`을 저장한다
- 두 번 증가해야 하는데 한 번만 증가한 꼴이 된다 (동시 수정이 제대로 합쳐지지 않음)

#### 2-2. 교착상태 (Deadlock)

서로 Lock을 잡은 채 영원히 기다리는 상황이다.

- A는 프린터 락을 잡고 스캐너 락을 기다림
- B는 스캐너 락을 잡고 프린터 락을 기다림
- 둘 다 서로를 기다리며 멈춰버린다

#### 2-3. 기아 (Starvation)

어떤 스레드가 계속 자원을 못 받아 굶는 문제다. 높은 우선순위 스레드가 자원을 계속 차지하면, 낮은 우선순위 스레드는 기회조차 얻지 못한다.

## 3. 동기화의 목적

| 목표 | 설명 |
|:---:|:---|
| 일관성 유지 | 데이터가 꼬이지 않게 한다 |
| 공정성 보장 | 모든 스레드가 자원을 쓸 기회를 갖는다 |
| 교착상태 방지 | 스레드들이 서로 영원히 기다리지 않게 한다 |
| 효율적인 협력 | 여러 스레드가 협력해 작업할 수 있게 한다 |

## 4. 동기화 기법들

| 기법 | 설명 |
|:---:|:---|
| Lock / Mutex | 임계 구역 보호 (하나만 진입) |
| Semaphore | 자원의 개수 관리 (여러 개 가능) |
| Condition Variable | 조건이 충족될 때까지 대기·깨우기 |
| Monitor | Lock + Condition을 합친 고급 추상화 |
| Barrier | 여러 스레드가 한 지점에 다 모일 때까지 대기 |

이 글에서는 가장 기본이 되는 **Lock, Semaphore, Condition Variable** 세 가지를 다룬다.

## 5. Lock (Mutex 포함)

**Critical Section**(공유 자원에 접근하는 코드 블록)을 한 번에 하나의 스레드만 실행하도록 막는 기법으로, 보통 뮤텍스(Mutex)로 구현한다.

| 항목 | 내용 |
|:---:|:---|
| 기본 기능 | 진입 시 lock, 작업 후 unlock |
| 기본 상태 | 잠금(Locked) / 잠금 해제(Unlocked) |
| 소유권 | 있음 (lock한 스레드만 unlock 가능) |
| 주 용도 | 공유 데이터·임계 구역 보호 |

```c
pthread_mutex_t lock;
pthread_mutex_lock(&lock);
// critical section (공유 데이터 접근)
pthread_mutex_unlock(&lock);
```

## 6. Semaphore

**자원의 개수**를 세는 정수 변수를 관리해 자원 접근을 조율하는 도구다.

| 항목 | 내용 |
|:---:|:---|
| 기본 기능 | `wait(P)`: 자원 요청 / `signal(V)`: 자원 반환 |
| 기본 상태 | 0 이상 정수 |
| 소유권 | 없음 (누구나 wait·signal 호출 가능) |
| 주 용도 | 여러 리소스의 접근 제한 (예: 프린터 5대) |

- **Binary Semaphore**: 0/1만 관리 (뮤텍스와 비슷)
- **Counting Semaphore**: 2개 이상의 리소스 관리

```c
sem_t sem;
sem_wait(&sem);   // 자원 요청
// critical section
sem_post(&sem);   // 자원 반환
```

## 7. Condition Variable (조건 변수)

스레드를 **특정 조건이 될 때까지 기다리게** 하는 도구다. 단독으로는 쓸 수 없고 **Lock과 함께** 써야 한다.

| 항목 | 내용 |
|:---:|:---|
| 기본 기능 | `wait`: 조건 대기 / `signal`: 조건 성취 시 알림 |
| 기본 상태 | 조건을 기다리는 대기열 |
| 소유권 | Lock과 함께 사용 (Lock을 보유해야 wait 가능) |
| 주 용도 | 상태 변화에 따라 스레드 깨우기 |

- `wait()`: 조건이 만족될 때까지 슬립 (이때 Lock을 잠시 반납)
- `signal()`: 대기 중인 스레드 하나 깨우기
- `broadcast()`: 대기 중인 스레드 모두 깨우기

```c
pthread_mutex_t lock;
pthread_cond_t cond;

pthread_mutex_lock(&lock);
while (조건이 false) {
    pthread_cond_wait(&cond, &lock);
}
// 조건 만족 시 수행
pthread_mutex_unlock(&lock);
```

`wait()`할 때 Lock을 잠시 반납하고, 조건이 충족되면 다시 Lock을 잡은 채 깨어난다. 조건 검사를 `if`가 아니라 `while`로 하는 이유는, 깨어났을 때 조건이 여전히 거짓일 수 있기 때문이다(spurious wakeup 방지).

## 8. 요약 비교

| 기법 | 주 용도 | 특징 | 주의할 점 |
|:---:|:---|:---|:---|
| Lock / Mutex | 임계 구역 보호 | 하나만 진입 허용 | 교착 상태(deadlock) 조심 |
| Semaphore | 여러 자원 수 조절 | 카운트 기반 | signal/wait 짝 관리 |
| Condition Variable | 조건 기다리기 | Lock과 세트로 사용 | signal/broadcast 구분해 사용 |