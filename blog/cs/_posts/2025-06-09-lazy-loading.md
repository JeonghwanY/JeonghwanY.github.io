---
layout: post
title:  "Lazy Loading: 진짜 필요할 때 불러오는 전략"
date:   2025-06-09
categories: cs
tags: [운영체제]
hide_last_modified: true
---

* toc
{:toc .large-only}

처음 보는 개념이 있다면 [Paging](../../computersystem/paging){:.heading.flip-title} 글을 먼저 참고하자.

메모리를 무한대로 쓸 수 없다면, 데이터를 어떻게 효율적으로 올릴까?
그 답 중 하나인 Lazy Loading을 살펴본다.

## 1. Lazy Loading이란?

> "필요해질 때까지 실제 데이터를 읽지 않고 최소한의 메타데이터만 준비해 두었다가, 첫 접근 시점에 비로소 불러오는 기법"

이 핵심 아이디어는 메모리·스토리지·웹에서 모두 동일하게 공유된다.

## 2. 가상 메모리에서의 Lazy Loading = Demand Paging

| 시점 | 커널이 하는 일 | 이득 |
|:---:|:---|:---|
| exec 시 | 각 세그먼트의 PTE를 P=0(not-present)으로만 채우고, "어느 파일 오프셋에서 몇 바이트를 읽을지" 보조 정보를 보관 | 프로세스 시작이 빨라지고, 안 쓰이는 코드는 끝까지 안 올려도 됨 |
| 첫 접근 (Page Fault) | ① HW가 page fault를 발생시켜 커널에 트랩 → ② lazy loader가 파일에서 해당 범위를 읽거나(File-backed) 0으로 초기화(Anon)한 뒤 `install_page()`로 P=1로 변경 → ③ 사용자 코드 재시작 | 실제 사용량만큼만 메모리 소비, I/O 병목 감소 |

PintOS Project 3에서 구현하는 `uninit_new()` / `vm_try_handle_fault()` 흐름이 정확히 이 구조다. 실행 파일을 로드할 때 `lazy_load_segment()`를 등록해 두고, page fault가 오면 `file_read_at()`으로 필요한 바이트만 채운 뒤 PTE를 present로 갱신한다.

## 3. 다른 영역에서의 활용

Lazy Loading은 OS 밖에서도 같은 원리로 널리 쓰인다.

| 영역 | 형태 | 주의할 점 |
|:---:|:---|:---|
| 파일 mmap | 매핑만 걸고 실제 I/O는 첫 접근 때 수행 (페이지 캐시에 적재) | dirty page write-back 정책, `msync`·`munmap` 시점 처리 |
| Copy-on-Write (COW) | fork 후 부모·자식이 물리 페이지를 공유하다가, 쓰기 폴트 시 복사 | PTE의 R/W 비트 관리, race condition 방지용 락 |
| Web Frontend | `<img loading="lazy">`, React lazy import 등 | LCP·CLS 같은 Web Vitals 모니터링 |
| 모듈/플러그인 로더 | 필요한 함수만 `dlopen()` / `LoadLibrary()` | 호출 경로 예외 처리, 초기화 지연의 성능 영향 측정 |

## 4. 장점과 단점

| 장점 | 단점 |
|:---|:---|
| 메모리 footprint↓, 시작 latency↓ | 첫 접근 시 page fault 오버헤드 (context switch + I/O) |
| I/O를 실제 필요 시점으로 분산해 burst I/O 완화 | 커널 코드가 복잡해지고 동기화 비용 증가 |
| COW와 결합하면 fork 성능 개선 | 예측 불가한 지연이 실시간 워크로드에 영향 가능 |

## 5. 정리

Lazy Loading은 데이터·코드를 **"나중에, 진짜 필요할 때"** 불러오는 철저한 지연 전략이다. 운영체제에서는 demand paging 형태로 구현되어 프로세스 시작 시간을 줄이고 메모리를 절약한다. PintOS Project 3의 핵심 과제이므로, **보조 정보 구조체 설계, PTE 플래그 관리, 동기화** 세 가지에 특히 신경 쓰자.