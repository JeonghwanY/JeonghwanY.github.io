---
layout: post
title:  "PintOS Out Of Memory 개념"
description: >
 PintOS Out Of Memory test를 위한 기본 개념을 설명하겠다.
date:   2025-05-26
tags: [운영체제]
hide_last_modified: true
---

* toc  
{:toc .large-only}

## Demand Paging (요구 페이징)

Demand Paging은 운영체제가 실제로 필요할 때만 메모리 페이지를 로드하는 기법으로, 메모리 사용을 효율적으로 하기 위해 가상 메모리 시스템에서 사용되는 중요한 기술이다.

### 1. 기본 개념

**기존 방식(Pre-paging)**

- 프로그램 시작 시 모든 페이지를 한 번에 메모리에 로드함

- 단점 : 필요 없는 페이지도 로드돼서 메모리 낭비가 심함

**Demand Paging**

- 프로그램 실행 시, 필요한 최소한의 페이지만 먼저 메모리에 올림

- 나머지 페이지는 프로그램이 실제로 접근할 때 메모리에 로드

### 2. 동작 방식

1. 프로세스 실행 시작

    - 코드와 데이터 전체를 메모리에 올리지 않음

    - 페이지 테이블에 해당 페이지가 현재 메모리에 없다고 표시

2. 접근 시도 → Page fault 발생

