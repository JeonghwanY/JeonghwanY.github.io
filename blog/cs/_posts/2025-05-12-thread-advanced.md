---
layout: post
title:  "스레드(Thread) 심화"
description: >
 스레드는 프로세스(process) 내에서 실제로 작업을 수행하는 실행 단위이다.
date:   2025-05-13
tags: [운영체제]
hide_last_modified: true
---

* toc  
{:toc .large-only}

스레드의 기초적인 개념에 대해서는 [스레드(Thread)](../../computersystem/thread){:.heading.flip-title}에서 다루었다.

## 스레드 스케줄링 전략 (Scheduling Policy)

스레드를 선택할 때 사용하는 "우선순위"나 "기준"을 말해. 주요 방식은 다음과 같아.

### FIFO (First-In, First-Out, 선입선출)

- 먼저 Ready 상태가 된 스레드가 먼저 CPU를 사용.

- 단순하고 공정하지만, 긴 작업이 먼저 오면 다른 짧은 작업이 오래 기다려야 할 수 있음.

### Round Robin (라운드 로빈)

- 각 스레드에 시간 조각(time slice 또는 quantum)을 나눠서 순서대로 CPU를 줌.

- 한 번에 오래 점유 못하고, 조금만 CPU를 쓰고 다른 스레드에게 넘김.

- 반응성 좋은 시스템을 만드는 데 유리해 (예: 서버, 게임).

### Priority Scheduling (우선순위 스케줄링)

- 스레드마다 우선순위를 부여하고, 우선순위가 높은 스레드를 먼저 실행.

- Priority Inversion(우선순위 반전) 문제가 생길 수 있어 → 별도로 대응 필요(Mutex 상속 같은 기법 사용).

### Shortest Job First (SJF)

- 실행 시간이 짧은 작업을 먼저 실행.

- 평균 대기 시간은 최적이지만, 스레드의 실행 시간을 미리 알아야 해서 실제로는 구현이 어려움.

### Multilevel Queue Scheduling (다단계 큐 스케줄링)

- 스레드를 여러 "큐"로 나눔 (예: 인터랙티브 작업, 배치 작업)

- 각 큐마다 다른 스케줄링 정책을 적용

- 큐 간에도 우선순위를 정할 수 있어.

## 스케줄링 타이밍 (Scheduling Timing)

언제 스케줄링을 트리거할까? (스레드를 바꿀까?)에 대한 이야기야.

### 선점형 스케줄링 (Preemptive Scheduling)

- 스레드가 실행 중이어도, 운영체제가 강제로 뺏어서 다른 스레드에 CPU를 넘김.

- 예를 들어 시간 조각(time quantum)이 다 되면 강제 전환.

- 멀티태스킹 시스템(리눅스, 윈도우)은 거의 다 이 방식을 씀.

### 비선점형 스케줄링 (Non-Preemptive Scheduling)

- 스레드가 자발적으로 양보(yield) 하기 전까지 CPU를 계속 쓴다.

- 스레드가 블로킹 되거나 명시적으로 종료할 때만 다른 스레드에게 CPU를 넘긴다.

- 단순하지만 하나의 스레드가 CPU를 계속 점유하면 시스템 전체가 멈춘다.

### 요약

| 방식 | 특징 | 장단점 |
|:---:|:---:|:---:|
| 선점형 | 운영체제가 강제 전환 | 응답성 좋음, 구현 복잡 |
| 비선점형 | 스레드가 자발적 양보 | 구현 간단, 응답성 낮을 수 있음 |

## User-Level Thread(ULT) vs Kernel-Level Thread(KLT) 스케줄링 차이

| 항목 | ULT | KLT |
|:---:|:---:|:---:|
| 스케줄링 주체 | 사용자 레벨 라이브러리 | 운영체제 커널 |
| 컨텍스트 스위칭 비용 | 작음(빠름) | 큼(느릴 수 있음) |
| 블로킹 처리 | 하나 블록되면 전체 블록 | 개별적으로 블록 처리 가능 |
| 예시 | Green Thread, Lightweight Thread | pthreads(Linux), Windows threads |

특히 ULT에서는 "한 스레드가 Block되면 프로세스 전체가 Block" 되는 문제가 있어서, 실제 상용 시스템에서는 KLT를 기반으로 스케줄링하는 경우가 많아.

## 실전에서 스케줄링은 어떻게 동작할까?

운영체제 커널은 보통 다음과 같은 상황에서 스케줄링을 발동시켜

- 스레드가 Sleep()이나 Wait()을 호출하여 Block될 때

- 스레드가 타임슬라이스(time slice)를 다 써버렸을 때

- 스레드가 종료되었을 때

- 인터럽트가 발생했을 때(예 : 타이머 인터럽트)

- 다른 스레드가 높은 우선순위로 등장했을 때

타이머 인터럽트로 주기적으로 선점(preemption)을 유발하는 것이 선점형 스케줄링 시스템의 핵심이다!

## 현대 OS 예시

| OS | 기본 스케줄링 정책 |
|:---:|:---:|
| Linux | Completely Fair Scheduler (CFS) |
| Windows | Multilevel Feedback Queue |
| macOS | Hybrid (Priority + Multilevel) |

- Lunux CFS는 "모든 스레드가 공평하게 CPU를 나눠 갖자"는 원칙을 따르는 아주 세련된 알고리즘이야.

- Windows는 인터랙티브 작업에 우선순위를 두는 편.

- macOS도 우선순위와 타임 슬라이스를 조합해서 하이브리드 방식으로 스케줄링함.

## 심화 : CFS(Completely Fair Scheduler) 아주 간단 설명

Linux의 기본 스케줄러인 CFS는 이렇게 동작해

- 각 스레드가 CPU를 쓴 "시간"을 트래킹한다.

- "가장 적게 CPU를 쓴 스레드"에게 CPU를 넘긴다.

- 실행 가능한 스레드들을 "Red-Black Tree"라는 자료구조에 정렬해 관리한다.

- O(log N) 시간에 가장 공정한 스레드를 찾아낼 수 있다.

> 즉, "CPU를 공평하게 쓸 기회를 준다"는 게 핵심!

## 스레드 스케줄링 요약

- 스레드 스케줄링은 "누구를 언제 CPU에 태울지"를 결정하는 것.

- 스케줄링 전략(FIFO, Round Robin, Priority 등) + 스케줄링 타이밍(선점형/비선점형)이 기본 개념.

- 현대 운영체제는 거의 선점형 + 우선순위 + 공정성을 조합한 복합적 방식을 사용.