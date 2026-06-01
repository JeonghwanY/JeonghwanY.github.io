---
layout: post
title:  "Page Replacement Policy: 어떤 페이지를 희생시킬까?"
date:   2025-06-10
categories: cs
tags: [운영체제]
hide_last_modified: true
---

* toc
{:toc .large-only}

무한대처럼 보이는 가상 메모리도 물리적 한계에 부딪히면 희생양(victim)을 골라야 한다.
그 희생양을 고르는 규칙, Page Replacement Policy를 살펴본다.

## 1. 왜 Page Replacement Policy가 필요한가?

가상 메모리는 프로세스마다 "거의 무한대"처럼 보이는 주소 공간을 제공하지만, 실제 물리 프레임 수는 제한적이다. 그래서 다음 상황이 생긴다.

1. page fault가 발생해 새 페이지를 적재해야 한다
2. 그런데 여유 프레임이 없으면, 커널은 한 프레임을 비워야 한다
3. 어떤 페이지를 **희생(victim)** 으로 내보낼지 정하는 규칙이 **Page Replacement Policy**다

목표는 **디스크 I/O 횟수(=페이지 폴트율)를 최소화**해 전체 성능을 높이는 것이다.

## 2. 정책 설계 시 고려 요소

| 관점 | 설명 |
|:---|:---|
| 효율성 | 낮은 페이지 폴트율, 적은 CPU 오버헤드 |
| 공정성 | 공유 시 특정 프로세스만 희생되지 않도록 |
| Stack Property | 프레임 수를 늘리면 절대 폴트가 늘지 않는 성질 (OPT·LRU가 가짐) |
| 실현 가능성 | 하드웨어 지원(Reference/Dirty 비트) 유무, 구현 복잡도 |
| 전역 vs 로컬 | 전역(global): 전체 시스템에서 victim 선정 / 로컬(local): fault를 낸 프로세스의 working set 안에서만 선정 |

## 3. 대표 알고리즘

| 알고리즘 | 동작 | 특징 |
|:---:|:---|:---|
| OPT / MIN | 가장 먼 미래에 참조될 페이지 제거 | 이론적 최적. 실현 불가능 → 벤치마킹용 하한선(lower bound) |
| FIFO | 들어온 순서대로 제거 | 구현 간단. Belady's Anomaly 발생 가능 |
| Second-Chance / Clock | FIFO 큐 + 참조 비트(A) 검사. A=1이면 0으로 clear 후 뒤로 회전, A=0이면 victim | 간단·저렴, LRU 근사 |
| LRU | 가장 오래 사용되지 않은 페이지 제거 | Stack Property 보장. 정확한 LRU는 하드웨어 타임스탬프 필요 → 보통 근사 사용 |
| LFU / NFU | 누적 참조 횟수 기반 제거 | "cold yet used" 페이지가 안 쫓겨나는 문제 → aging 필요 |
| Working-Set / WSClock | 최근 Δ 참조 내 사용된 페이지 집합 유지 (WSClock은 Clock에 timestamp 추가) | working set 근사, 쓰기 I/O 분산 |
| Random | 무작위 victim | LRU 추적 비용이 클 때 사용 (예: 일부 GPU MMU) |

### LRU 근사 방법

정확한 LRU는 비용이 커서, 실제로는 다음 근사를 쓴다.

- **N-비트 Aging**: 주기마다 R 비트를 상위로 시프트
- **카운터 기반**: 하드웨어가 마지막 접근 시각을 기록 (32/64비트)
- **Enhanced Clock / Clock-Pro**: 인접 시계 방식

## 4. Belady's Anomaly

Stack Property가 없는 FIFO 계열에서 나타나는 현상이다. **프레임을 늘렸는데 오히려 페이지 폴트가 더 많아질 수 있다** (예: 3프레임보다 4프레임이 더 많은 폴트). 정책 선택 시 주의해야 한다.

## 5. 실제 OS 사례

| OS | 구현 요지 |
|:---:|:---|
| Linux (5.x) | Multi-gen LRU. Active/Inactive 목록으로 hot/cold 구분, `kswapd`가 백그라운드 스캔하며 cold & dirty 우선 정리 |
| Windows | Working-Set + Clock 아키텍처. 프로세스마다 WS 크기 자동 조절, 전역 밸런서가 과점유 시 회수 |
| PintOS Project 3 | Clock 알고리즘을 직접 구현. `struct frame` 리스트 + 핸드 포인터 유지, `pml4_is_accessed()`로 R 비트를 확인해 second-chance 부여 |

## 6. 성능 분석 방법

1. **Trace 재생**: 메모리 참조 시퀀스를 돌려 폴트 카운트 비교
2. **실험 변수**: 프레임 수, Δ(working-set 윈도), R/Dirty 비트 리셋 주기
3. **Thrashing 탐지**: 폴트율 급증 + CPU 사용률↓ → 정책·resident set 튜닝 필요

## 7. 요약

- Page Replacement Policy는 **희생 페이지를 고르는 규칙**이다
- 이상적인 OPT는 불가능하므로, **LRU 근사나 Clock 계열**이 실용적이다
- 정책마다 **복잡도·메모리 오버헤드·성능·공정성**의 trade-off가 있다
- 실제 커널은 다단계 큐 + 참조/더티 비트로 LRU를 근사하고, 백그라운드 데몬(`kswapd` 등)으로 지속 튜닝한다
- PintOS 같은 교육용 OS에서는 **Clock(Second-Chance)** 구현이 가장 흔하며, R/Dirty 비트 처리·프레임 테이블 관리·swap I/O 동기화가 핵심이다