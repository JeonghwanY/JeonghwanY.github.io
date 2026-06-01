---
layout: post
title:  "Lazy Loading"
description: >
 메모리를 무한대로 사용할 수 있을까?
date:   2025-06-10
tags: [운영체제]
hide_last_modified: true
---

* toc  
{:toc .large-only}

먼저 여기서 처음 들어보는 개념이 있다면, [Paging](../../computersystem/paging){:.heading.flip-title}글에서 개념을 참고해 본다.

## Lazy Loading 이란?

> "필요해질 때까지 실제 데이터를 읽어들이지 않고, 최소한의 메타데이터만 준비해 두었다가 첫 접근 시점에 비로소 불러오는 기법"
> (메모리·스토리지·웹 모두 같은 핵심 아이디어를 공유합니다.)

## 가상메모리에서의 Lazy Loading = Demand Paging

| 시점 | 커널이 하는 일 | 이득 |
|:---:|:---|:---|
| exec 시 | - 각 세그먼트의 page table entry를 P=0(not-present)로만 채우고<br/>- "어느 파일 오프셋에서 몇 바이트를 읽으면 되는지" 보조 정보를 보관 | - 프로세스 시작 시간이 빨라짐<br/>- 실제로 쓰이지 않는 코드는 끝까지 안 올려도 됨 |
| 첫 접근(Page Fault) | 1. HW가 페이지 폴트를 발생시켜 커널에 트랩<br/>2. 커널 lazy loader가<br/>- 파일에서 해당 범위만큼 읽어 오거나(File backed)<br/>- 0으로 초기화(Anon page)<br/>- `install_page()`→P=1로 바꿈<br/>3. 사용자 코드 재시작 | - 실제 사용량만큼만 메모리 소비<br/>- I/O 병목이 줄어듬 |

PintOS Project3에서 구현하는 `uninit_new()`/`vm_try_handle_fault()`**흐름**이 정확히 이 구조다. 실행 파일을 로드할 때에는 `lazy_load_segment()`를 등록해 두고, 페이지 폴트가 오면 `file_read_at()`으로 필요한 바이트만 채운 뒤 PTE를 present로 갱신한다.

## 추가 활용

| 영역 | Lazy Loading의 형태 | 주의할 점 |
|:---:|:---:|:---|
| 파일 mmap | 매핑만 걸어 두고 실제 I/O는 첫 접근 때 수행 → 페이지 캐시에 올라감 | - Dirty page write-back 정책<br/>- `msync`, `munmap` 시점 처리 |
| Copy-on Write(COW) | fork후 부모·자식이 같은 물리 페이지 공유하다가 쓰기 폴트 시 복사 | - PTE의 R/W 비트 관리<br/>- race condition 방지 위한 락 |
| Web Frontend | `<img loading="lazy">`, React lazy import 등 | - LCP, CLS 같은 Web-Vitals 모니터링 |
| 모듈/플러그인 Loader | 필요 함수만 `dlopen()`/`LoadLibrary()` | - 호출 경로 예외 처리<br/>- 초기화 지연이 성능에 미치는 영향 측정 |

## 장점과 단점

### 장점

- 메모리 footpring ↓, 시작 latency ↓

- I/O를 실제 필요 시점으로 분산해 **burst I/O** 완화

- COW와 결합하면 fork 성능 개선

### 단점

- 첫 접근 시 **페이지 폴트 오버헤드(context switch + I/O)**

- 커널 코드가 더 복잡해지고 동기화 비용 증가

- 예측 불가한 지연이 실시간 워크로드에 영향을 줄 수 있음

## 정리

Lazy Loading = 데이터 · 코드를 **"나중에, 진짜 필요할 때"** 불러오자는 철저한 지연 전략이다. 운영체제에서는 demand paging 형태로 구현되어 프로세스 시작 시간을 줄이고 메모리 자원을 절약한다. PintOS Project3의 핵심 과제이므로, **보조 정보 구조체 설계, PTE 플래그 관리, 동기화**에 특히 신경 쓰자