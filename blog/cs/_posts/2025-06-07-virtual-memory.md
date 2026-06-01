---
layout: post
title:  "PintOS 4~5주차 lazy loading & swap구현"
description: >
 이 글에서는 PintOS 4~5주차 lazy loading & swap 구현에 관련하여서 다루겠다.
date:   2025-06-08
tags: [운영체제]
hide_last_modified: true
---

* toc  
{:toc .large-only}

이전에 만들었던 thread와 user program에 더해서 이번주 부터는 가상 메모리에 관한 함수를 구현해야 한다.

## 구현에 필요한 개념들

구현하기에 앞서서 사전에 알아두어야 하는 개념들에 대해서 링크를 걸어 두었으니 참고하도록 한다.

[PML4](../../computersystem/pml4){:.heading.flip-title}, [Paging](../../computersystem/paging){:.heading.flip-title}, [Lazy Loading](../../computersystem/lazy-loading){:.heading.flip-title}, [Anonymous & File-backed Page](../../computersystem/anon-file){:.heading.flip-title}, [Swap Disk](../../computersystem/swap-disk){:.heading.flip-title}, [Direct Memory Access](../../computersystem/dma){:.heading.flip-title}, [Page Replacement Policy](../../computersystem/page-replacement-policy){:.heading.flip-title}

## 가상 메모리 구조

위 개념들을 보았다면, 이제 PintOS의 가상 메모리 구조가 어떻게 되어 있는지 보자.

![가상 메모리 구조](/assets/img/blog/cs/virtualmemorylayout.png)

PintOS의 가상 메모리 구조는 위와 같다. 코드를 보면 알겠지만, `palloc_get_page(PAL_USER)` 같은 경우 user pool에 할당되고  `malloc()` 같은 경우 kernel pool에 할당된다.

## 자원 관리 개요

아래와 같은 자료 구조들을 설계하고 구현해야 Project3를 완료할 수 있다. 모든 테이블을 구현할 필요는 없다. 한 개의 테이블은 필요할 것이고 서로 연관된 자원들을 통합된 자료구조로 전부, 또는 부분적으로 합치는 것이 더 편리할 수 있다.

### Supplemental page table(보조 페이지 테이블)

- 페이지 테이블을 보조해서, 페이지 폴트 핸들링이 가능하도록 해준다. 우리 팀의 코드같은 경우 `vm_alloc_page_with_initializer()`시 spt에 항상 넣게끔 설정해 두었다.

### Frame table(보조 페이지 테이블)

- 물리 프레임의 eviction policy(직역하면 “쫓아내기 정책”)를 효율적으로 구현하도록 해준다. 나중에 swap in/out 구현을 시작할 때, 어떤 데이터를 내보낼지 그리고 어떤 데이터를 끌어올지 고민하게 될 것이다. 그 시기에 효율적으로 구현하기 위해 필요한 테이블이다.

### Swap table(스왑 테이블)

- 스왑 슬롯이 사용되는 것을 추적한다. 하지만 우리 팀은 스왑 테이블은 사용하지 않았다.

