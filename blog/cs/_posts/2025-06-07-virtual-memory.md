---
layout: post
title:  "PintOS 4~5주차: Lazy Loading & Swap 구현"
date:   2025-06-07
tags: [운영체제]
hide_last_modified: true
---

* toc
{:toc .large-only}

PintOS 4~5주차 가상 메모리 구현(lazy loading & swap)
이전에 만든 thread와 user program에 더해, 이번 주부터는 **가상 메모리** 관련 함수를 구현한다.

## 1. 구현에 필요한 개념들

구현 전에 알아둬야 할 개념들을 링크로 정리해뒀다.

[PML4](../../computersystem/pml4){:.heading.flip-title} · [Paging](../../computersystem/paging){:.heading.flip-title} · [Lazy Loading](../../computersystem/lazy-loading){:.heading.flip-title} · [Anonymous & File-backed Page](../../computersystem/anon-file){:.heading.flip-title} · [Swap Disk](../../computersystem/swap-disk){:.heading.flip-title} · [Direct Memory Access](../../computersystem/dma){:.heading.flip-title} · [Page Replacement Policy](../../computersystem/page-replacement-policy){:.heading.flip-title}

## 2. 가상 메모리 구조

위 개념들을 살펴봤다면, PintOS의 가상 메모리 구조를 보자.

![가상 메모리 구조](/assets/img/blog/cs/virtualmemorylayout.png)

할당 함수에 따라 사용하는 풀(pool)이 다르다.

| 함수 | 할당 위치 |
|:---:|:---|
| `palloc_get_page(PAL_USER)` | user pool |
| `malloc()` | kernel pool |

## 3. 자원 관리 개요

Project 3를 완료하려면 다음 자료구조들을 설계·구현해야 한다. 모든 테이블을 다 만들 필요는 없다. 최소 한 개의 테이블은 필요하며, 서로 연관된 자원들을 하나의 통합 자료구조로 합치는 편이 더 편리할 수 있다.

| 자료구조 | 역할 | 우리 팀 적용 |
|:---:|:---|:---|
| Supplemental Page Table (SPT) | 페이지 테이블을 보조해 page fault 핸들링을 가능하게 함 | `vm_alloc_page_with_initializer()` 시 항상 SPT에 등록 |
| Frame Table | 물리 프레임의 eviction(쫓아내기) 정책을 효율적으로 구현. swap in/out 시 무엇을 내보내고 끌어올지 결정 | 사용 |
| Swap Table | 스왑 슬롯의 사용 여부를 추적 | 사용하지 않음 |

### 3-1. Supplemental Page Table

기본 페이지 테이블(PML4)은 가상 주소 ↔ 물리 주소 매핑만 담는다. 하지만 lazy loading에서는 "아직 메모리에 없는 페이지"의 정보(어디서 로드할지, 어떤 타입인지)를 별도로 들고 있어야 한다. 이를 보관하는 것이 SPT다. 우리 팀은 `vm_alloc_page_with_initializer()` 호출 시 항상 SPT에 페이지를 등록하도록 설계했다.

### 3-2. Frame Table

물리 프레임이 부족할 때 어떤 프레임을 쫓아낼지(eviction) 고르려면, 현재 사용 중인 프레임 목록이 필요하다. Frame Table이 이 역할을 하며, swap in/out 구현 시 핵심이 된다.

### 3-3. Swap Table

스왑 슬롯의 사용 여부를 추적하는 테이블이다. 우리 팀은 이 테이블을 별도로 두지 않고 다른 방식으로 처리했다.

## 4. Lazy Loading 구현

> (구현 코드 및 설명 작성 예정)

## 5. Swap 구현

> (구현 코드 및 설명 작성 예정)