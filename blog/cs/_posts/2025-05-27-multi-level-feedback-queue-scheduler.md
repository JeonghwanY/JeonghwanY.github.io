---
layout: post
title:  "Multi-Level Feedback Queue Scheduler"
description: >
 MLFQS는 Multi-Level Feedback Queue Scheduler의 줄임말로, 우선순위 기반의 CPU 스케줄링 알고리즘이다.
date:   2025-05-26
tags: [운영체제]
hide_last_modified: true
---

* toc  
{:toc .large-only}

MLFQS는 **Multi-Level Feedback Queue Scheduler**의 줄임말로, 우선순위 기반의 CPU 스케줄링 알고리즘이다. 일반적인 운영체제 스케줄러에서 사용되는 정책 중 하나로, 특히 PintOS Project 1의 스케줄러 확장에서 구현 대상이다.

## MLFQS 개념

MLFQS는 **스레드의 우선순위를 자동으로 동적으로 조정**함. 이 방식은 CPU 사용량에 따라 스레드의 우선순위를 점차 낮추거나 높이며, **사용자 개입 없이 공정한 CPU 사용**을 유도한다. 단순히 우선순위 큐를 여러 개 쌓아놓은 구조가 아니라, **"시간 공유 시스템에서 공정성과 응답성을 동시에 달성하려는 전략"**이라고 볼 수 있다.

### 기본 개념: Feedback Queue란?

**Feedback** 이라는 말에서 알 수 있듯, 이 스케줄러는 **프로세스의 행동을 관찰한 뒤, 그 정보를 기반으로 우선순위를 조정**함

- 사용자가 직접 우선순위를 설정하지 않아도

- 시스템이 **자동으로 "이 프로세스는 CPU를 오래 잡고 있으니 우선순위를 낮춰야겠다"**, 또는 ****거의 CPU를 못 써봤네, 기회를 줘야지"** 같은 판단을 함

### MLFQS의 목표

1. **공정성(Fairness)** : 모든 프로세스가 CPU를 적절히 나눠 쓸 수 있도록 함

2. **응답성(Responsiveness)** : 짧은 작업 또는 I/O 중심 작업은 빠르게 응답하게 함

3. **기아 현상 방지(Starvation Prevention)** : 우선순위가 낮은 프로세스도 언젠가는 CPU를 쓸 기회를 받음

### 주요 특징

1. 다단계 큐(Multi-Level Queues)

    - 여러개의 우선순위 큐가 있고, 높은 우선순위의 큐가 항상 먼저 실행됨

    - 새로운 프로세스는 높은 우선순위 큐에서 시작

    - CPU를 오래 점유하면 점점 더 낮은 큐로 이동 → 이걸 "feedback"이라고 함

2. 피드백 메커니즘

    - CPU를 많이 사용하면 우선순위를 낮추고, 적게 사용하면 우선순위를 높임

    - 이를 통해 I/O-bound 프로세스가 starvation 되지 않도록 함

3. nice 값

    - 프로세스의 우선순위를 낮추려는 의도적인 값(사용자가 설정)

    - 각 스레드는 `nice` 값을 가짐 (기본값 : 0, 범위 : -20 ~ 20)

    - `nice`값이 클수록 우선순위는 낮아짐

4. recent_cpu 값

    - 최근 CPU 사용량을 나타내며, 이 값이 클수록 우선순위가 낮아짐

5. load_avg

    - 시스템 전체의 부하 수준

    - 전체 시스템의 load 정도를 나타내는 값

    - 모든 스레드의 recent_cpu 값을 계산할 때 사용됨

6. Aging Mechanism (시간이 지나면서 회복)

    - 우선순위가 낮아진 프로세스의 경우 시간이 지나면서 recent_cpu가 감소

    - 시스템 부하가 줄어들면 priority 회복

    - 위 두 특징을 통해 **기아 현상(Starvation)**을 방지

### MLFQS 우선순위 계산 식

~~~c
priority = PRI_MAX - (recent_cpu / 4) - (nice * 2)
~~~

- `PIR_MAX`는 가장 높은 우선순위 (일반적으로 63)

- `recent_cpu`와 `nice`에 따라 실시간으로 우선순위 갱신

### 어떤 문제를 해결하려는 걸까?

#### CPU-bound vs I/O-bound

- CPU-bound : 계산만 계속하는 프로그램 (예 : 수치 시뮬레이션)

- I/O-bound : 디스크나 키보드 입력 등 기다리는 작업이 많은 프로그램 (예 : 텍스트 에디터)

단순한 우선순위 기반 스케줄링은 CPU-bound가 계속 CPU를 차지해버릴 가능성이 큼. MLFQS는 CPU-bound의 우선순위가 점점 낮아지고, I/O-bound는 우선순위가 회복돼서 공정해짐

### 정리

| 요소 | 역할 |
|:---:|:---:|
| Multi-level Queues | 우선순위에 따라 여러 큐를 사용 |
| Feedback | CPU 점유 시간에 따라 큐를 상향/하향 이동 |
| Automatic Priority Adjustment | recent_cpu와 nice값을 기반으로 계산 |
| Aging | 기아방지, 낮은 우선순위도 복구 가능 |

**MLFQ가 쓰이는 곳

- Unix/Linux 스케줄러

- Windows 일부 버전

- PintOS에서의 학습용 구현

### PintOS에서 MLFQS를 구현할 때의 포인트

- `thread_set_priority()`를 무시하고 자동 계산된 우선순위를 사용함

- 타이머 인터럽트가 발생할 때마다 recent_cpu, load_avg, priority 값을 업데이트해야 함

- 고정소수점 연산을 사용해야 정확한 계산 가능