---
layout: post
title:  "스레드(Thread) 심화: 스케줄링 전략과 타이밍"
date:   2025-05-12
categories: cs
tags: [운영체제]
hide_last_modified: true
---

* toc
{:toc .large-only}

스레드는 프로세스(process) 내에서 실제로 작업을 수행하는 실행 단위다.
이 글에서는 스레드 스케줄링 전략과 타이밍, 현대 OS의 스케줄러를 다룬다.


## 1. 스레드 스케줄링 전략 (Scheduling Policy)

어떤 스레드를 CPU에 태울지 고를 때 쓰는 "기준"이다.

| 전략 | 동작 | 특징 |
|:---:|:---|:---|
| FIFO (선입선출) | 먼저 Ready가 된 스레드가 먼저 CPU 사용 | 단순·공정하지만, 긴 작업이 앞서면 짧은 작업이 오래 대기 |
| Round Robin | 각 스레드에 시간 조각(quantum)을 주고 순서대로 순환 | 한 번에 오래 점유 못함. 반응성 좋은 시스템(서버·게임)에 유리 |
| Priority Scheduling | 우선순위가 높은 스레드를 먼저 실행 | Priority Inversion(우선순위 반전) 문제 → Mutex 상속 등으로 대응 |
| Shortest Job First (SJF) | 실행 시간이 짧은 작업을 먼저 실행 | 평균 대기 시간은 최적이나, 실행 시간을 미리 알아야 해 구현이 어려움 |
| Multilevel Queue | 스레드를 여러 큐(인터랙티브·배치 등)로 나눠 큐마다 다른 정책 적용 | 큐 간에도 우선순위 부여 가능 |

> **Priority Inversion(우선순위 반전)**: 낮은 우선순위 스레드가 락을 쥔 채로, 높은 우선순위 스레드가 그 락을 기다리느라 더 낮은 우선순위 스레드보다 늦게 실행되는 역전 현상.

## 2. 스케줄링 타이밍 (Scheduling Timing)

"언제 스레드를 바꿀까"에 대한 이야기다.

| 방식 | 동작 | 장단점 |
|:---:|:---|:---|
| 선점형 (Preemptive) | 실행 중이어도 OS가 강제로 CPU를 뺏어 다른 스레드에 넘김 (예: quantum 소진 시 강제 전환) | 응답성 좋음, 구현 복잡. 리눅스·윈도우 등 대부분 채택 |
| 비선점형 (Non-Preemptive) | 스레드가 자발적으로 양보(yield)하거나 블로킹·종료할 때만 전환 | 구현 간단, 한 스레드가 CPU를 계속 점유하면 시스템 전체가 멈출 수 있음 |

## 3. ULT vs KLT 스케줄링 차이

| 항목 | User-Level Thread (ULT) | Kernel-Level Thread (KLT) |
|:---:|:---|:---|
| 스케줄링 주체 | 사용자 레벨 라이브러리 | 운영체제 커널 |
| 컨텍스트 스위칭 비용 | 작음 (빠름) | 큼 (느릴 수 있음) |
| 블로킹 처리 | 하나가 블록되면 전체 블록 | 개별적으로 블록 처리 가능 |
| 예시 | Green Thread, Lightweight Thread | pthreads(Linux), Windows threads |

ULT는 "한 스레드가 블록되면 프로세스 전체가 블록"되는 문제가 있어, 실제 상용 시스템에서는 KLT 기반 스케줄링을 쓰는 경우가 많다.

## 4. 실전에서 스케줄링은 언제 발동될까?

운영체제 커널은 보통 다음 상황에서 스케줄링을 발동한다.

- 스레드가 `Sleep()`이나 `Wait()`을 호출해 블록될 때
- 스레드가 타임슬라이스(time slice)를 다 썼을 때
- 스레드가 종료되었을 때
- 인터럽트가 발생했을 때 (예: 타이머 인터럽트)
- 더 높은 우선순위의 스레드가 등장했을 때

**타이머 인터럽트로 주기적으로 선점(preemption)을 유발**하는 것이 선점형 스케줄링 시스템의 핵심이다.

## 5. 현대 OS의 스케줄링

| OS | 기본 스케줄링 정책 |
|:---:|:---|
| Linux | Completely Fair Scheduler (CFS) |
| Windows | Multilevel Feedback Queue |
| macOS | Hybrid (Priority + Multilevel) |

- **Linux CFS**: "모든 스레드가 공평하게 CPU를 나눠 갖자"는 원칙의 세련된 알고리즘
- **Windows**: 인터랙티브 작업에 우선순위를 두는 편
- **macOS**: 우선순위와 타임 슬라이스를 조합한 하이브리드 방식

### CFS(Completely Fair Scheduler) 간단 설명

Linux의 기본 스케줄러 CFS는 다음과 같이 동작한다.

1. 각 스레드가 CPU를 쓴 "시간"을 추적한다
2. **가장 적게 CPU를 쓴 스레드**에게 CPU를 넘긴다
3. 실행 가능한 스레드들을 **Red-Black Tree**로 정렬해 관리한다
4. 덕분에 O(log N) 시간에 가장 공정한 스레드를 찾아낼 수 있다

> 핵심은 "CPU를 공평하게 쓸 기회를 준다"는 것이다.

## 6. 요약

- 스레드 스케줄링은 **"누구를 언제 CPU에 태울지"** 를 결정하는 것이다
- 기본 개념은 **스케줄링 전략**(FIFO, Round Robin, Priority 등) + **스케줄링 타이밍**(선점형/비선점형)으로 나뉜다
- 현대 OS는 거의 **선점형 + 우선순위 + 공정성**을 조합한 복합 방식을 쓴다