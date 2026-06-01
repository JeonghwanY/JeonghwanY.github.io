---
layout: post
title:  "Multi-Level Feedback Queue Scheduler (MLFQS)"
date:   2025-05-26
categories: cs
tags: [운영체제]
hide_last_modified: true
---

* toc
{:toc .large-only}

**MLFQS(Multi-Level Feedback Queue Scheduler)** 는 우선순위 기반의 CPU 스케줄링 알고리즘이다. 일반적인 OS 스케줄러 정책 중 하나로, PintOS Project 1의 스케줄러 확장에서 구현 대상이 된다.
CPU 사용량에 따라 우선순위를 자동 조정한다.

## 1. MLFQS 개념

MLFQS는 **스레드의 우선순위를 동적으로 자동 조정**한다. CPU 사용량에 따라 우선순위를 점차 낮추거나 높여, 사용자 개입 없이 공정한 CPU 사용을 유도한다. 단순히 우선순위 큐를 여러 개 쌓은 구조가 아니라, **"시간 공유 시스템에서 공정성과 응답성을 동시에 달성하려는 전략"** 이라고 볼 수 있다.

### Feedback Queue란?

"Feedback"이라는 이름처럼, 이 스케줄러는 **프로세스의 행동을 관찰한 뒤 그 정보로 우선순위를 조정**한다. 사용자가 직접 우선순위를 설정하지 않아도, 시스템이 "이 프로세스는 CPU를 오래 잡으니 우선순위를 낮추자", "이 프로세스는 CPU를 거의 못 썼으니 기회를 주자" 같은 판단을 스스로 한다.

## 2. MLFQS의 목표

| 목표 | 설명 |
|:---:|:---|
| 공정성 (Fairness) | 모든 프로세스가 CPU를 적절히 나눠 쓰게 함 |
| 응답성 (Responsiveness) | 짧은 작업·I/O 중심 작업이 빠르게 응답하게 함 |
| 기아 방지 (Starvation Prevention) | 우선순위가 낮은 프로세스도 언젠가 CPU 기회를 받게 함 |

## 3. 주요 구성 요소

| 요소 | 설명 |
|:---:|:---|
| 다단계 큐 (Multi-Level Queues) | 여러 우선순위 큐가 있고 높은 큐가 먼저 실행. 새 프로세스는 높은 큐에서 시작하며, CPU를 오래 점유하면 낮은 큐로 이동(이것이 feedback) |
| 피드백 메커니즘 | CPU를 많이 쓰면 우선순위↓, 적게 쓰면↑. I/O-bound 프로세스의 starvation 방지 |
| nice 값 | 사용자가 설정하는 양보 값. 기본 0, 범위 -20~20. 클수록 우선순위가 낮아짐 |
| recent_cpu | 최근 CPU 사용량. 클수록 우선순위가 낮아짐 |
| load_avg | 시스템 전체의 부하 수준. 모든 스레드의 recent_cpu 계산에 사용 |
| Aging | 시간이 지나면 recent_cpu가 감소하고, 부하가 줄면 priority가 회복 → 기아 방지 |

## 4. 우선순위 계산식

```c
priority = PRI_MAX - (recent_cpu / 4) - (nice * 2)
```

- `PRI_MAX`는 가장 높은 우선순위 (일반적으로 63)
- `recent_cpu`와 `nice`에 따라 우선순위가 실시간으로 갱신된다

## 5. 어떤 문제를 해결하나? — CPU-bound vs I/O-bound

| 유형 | 특징 | 예시 |
|:---:|:---|:---|
| CPU-bound | 계산만 계속하는 프로그램 | 수치 시뮬레이션 |
| I/O-bound | 디스크·키보드 입력 등 기다리는 작업이 많음 | 텍스트 에디터 |

단순 우선순위 스케줄링은 CPU-bound가 CPU를 계속 차지할 위험이 크다. MLFQS에서는 CPU-bound의 우선순위가 점점 낮아지고 I/O-bound의 우선순위는 회복되어, 둘 사이가 공정해진다.

## 6. 활용처

- Unix/Linux 스케줄러
- Windows 일부 버전
- PintOS의 학습용 구현

## 7. PintOS 구현 시 포인트

- `thread_set_priority()`를 무시하고, 자동 계산된 우선순위를 사용한다
- 타이머 인터럽트마다 `recent_cpu`, `load_avg`, `priority`를 업데이트해야 한다
- PintOS는 커널에서 부동소수점을 쓸 수 없으므로, **고정소수점(fixed-point) 연산**으로 계산해야 정확하다