---
layout: post
title:  "Demand-zero memory"
description: >
 Demand-zero memory(또는 zero-filled-on-demand page)는 
 운영체제가 “필요해질 때(demand)” 처음 접근되는 순간에만 물리 페이지를 연결하고, 
 그 페이지의 모든 바이트를 0으로 채워서(zero-fill) 사용자 프로세스에 넘겨주는 메모리 할당 기법이다
date:   2025-04-28
tags: [운영체제]
hide_last_modified: true
---

* toc  
{:toc .large-only}

**Demand-zero memory(또는 zero-filled-on-demand page)**는 운영체제가 **“필요해질 때(demand)”** 처음 접근되는 순간에만 물리 페이지를 연결하고, 그 페이지의 모든 바이트를 0으로 채워서(zero-fill) 사용자 프로세스에 넘겨주는 메모리 할당 기법

## 동작 흐름

1. 가상 주소 공간만 잡아 두기

- 프로그램이 malloc, VirtualAlloc(..., MEM_RESERVE), 스택 확대, BSS(전역/정적 0-초기화 변수) 등으로 "새 메모리를" 요구하면,

- 커널은 대응되는 물리 페이지 없이 가상 주소 범위를 예약해 두고, PTE(Page-Table Entry)에 "아직 물리 페이지 없음, demand-zero"라는 플래그를 세워 둠

2. 첫 접근 → 페이지 폴트(page fault)

- CPU가 그 주소를 읽거나 쓰려고 하면 PTE에 실제 프레임이 없으므로 페이지 폴트가 발생

3. 커널이 물리 페이지 할당 & 0으로 초기화

- 커널의 Zero Page List에서 이미 0으로 클리어돼 있는 여유 페이지를 하나 꺼내오거나,

- 여유 페이지가 없다면 새 페이지를 확보한 뒤 memset(page, 0, PAGE_SIZE)로 0-필(fill) 한다

4. PTE 갱신 후 재시도

- PTE를 "valid + 해당 물리 프레임"으로 고쳐 놓고, fault 된 명령을 재실행하면 이제 정상적으로 0값이 보임

## 왜 쓰일까?

| 장점 | 설명 |
|:---:|:---:|
| 메모리 절약 | 큰 배열/구조체를 "0으로 초기화"해 예약만 해 놓고, 실제로 접근한 부분만 물리 메모리를 소비함 |
| 보안 & 안정성 | 항상 0으로 채워 주므로, 이전 프로세스의 잔류 데이터가 노출되지 않음 |
| 속도(평균) | 초기화 루프를 사용자 코드에서 돌릴 필요가 없고, 커널은 미리 0-클리어 해 둔 zero-page 풀을 재사용해 페이지 폴트 처리 시간을 최소화함 |

## 언제 볼 수 있을까?

- Windows - MEM_COMMIT 없이 VirtualAlloc으로 예약만 한 뒤 접근할 때, 또는 일반 HeapAlloc/new 내부적으로

- Linux/Unix - 익명 매핑 mmap(..., MAP_ANONYMOUS)·스택·BSS·brk/sbrk 등

- 하이퍼바이저/가상머신 - 게스트가 처음 쓰는 시점까지 진짜 호스트 RAM을 배정하지 않는 ballooning 기법과 결합되기도 함

## 요약

Demand-zero memory = "필요할 때 0으로 초기화된 물리 페이지를 뒤늦게 붙이는 가상 메모리 기술"

→ 프로그램 입장에서는 '이미 0으로 초기화돼 있는 새 메모리'를 즉시 얻은 것처럼 보이지만, 실제 RAM은 첫 사용 시점까지 쓰이지 않아 메모리를 아끼고 보안을 높여 줌

### 나만의 요약

1. 물리 메모리 같은 경우 첫 사용 전까지는 메모리 할당이 되지 않음

2. 하지만 가상 메모리에서는 공간이 확보된 상태

3. 실제 사용시에는 page fault 되면서 물리 메모리 할당이 이루어짐, PTE의 Not-present → Present로 갱신