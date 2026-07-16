---
layout: post
title: "Neo4j vs Neptune"
date: 2026-07-05
categories: ai
hide_last_modified: true
# sitemap: false
---

* toc
{:toc .large-only}

## Neo4j vs Neptune

비교 항목,Neo4j,Amazon Neptune
아키텍처 타입,Native Graph (그래프 전용 엔진),Non-Native Graph (클라우드 최적화 스토리지)
관계 탐색 메커니즘,인덱스 프리 인접성 (포인터 이동),고도화된 쿼드 스토어 인덱싱 검색
기본 쿼리 언어,Cypher,"Gremlin, SPARQL, openCypher"
확장성 (Scaling),샤딩(Sharding) 및 클러스터링 직접 구성 필요,AWS 관리형 자동 확장 (최대 15개 복제본)
최적의 시나리오,"5단계 이상의 복잡하고 깊은 관계 분석, 실시간 추천 알고리즘","대규모 트래픽 처리, 엔터프라이즈급 AWS 인프라 통합 환경"

| 비교 항목 | Neo4j | Amazon Neptune |
|-----------|--------|----------------|
| **아키텍처 타입** | Native Graph (그래프 전용 엔진) | Non-Native Graph (클라우드 최적화 스토리지) |
| **관계 탐색 메커니즘** | 인덱스 프리 인접성(Index-Free Adjacency, 포인터 이동) | 고도화된 쿼드 스토어 인덱싱 검색 |
| **기본 쿼리 언어** | Cypher | Gremlin, SPARQL, openCypher |
| **확장성 (Scaling)** | 샤딩(Sharding) 및 클러스터링 직접 구성 필요 | AWS 관리형 자동 확장 (최대 15개 읽기 복제본) |
| **최적의 시나리오** | 5단계 이상의 복잡하고 깊은 관계 분석, 실시간 추천 알고리즘 | 대규모 트래픽 처리, 엔터프라이즈급 AWS 인프라 통합 환경 |


Neo4j는 포인터를 직접 타는 '인덱스 프리 인접성' 덕분에 깊은 관계 연산 자체의 순수 성능은 뛰어나다. 
Amazon Neptune은 완전 관리형 서비스라 대형 대외 사업에서 인프라 아키텍처를 설계할 때 자동 확장성(Auto-scaling)과 고가용성(HA)확보 측면에서 운영 공수를 극적으로 줄여줄 수 있는 장점이 있다.

프로젝트의 연산 복잡도와 클라우드 아키텍처 환경에 따라 아키텍처 선택을 달리 해야 할 것 같다.