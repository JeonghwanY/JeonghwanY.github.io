---
layout: post
title:  "HTTP, TCP, UDP: 계층별 역할과 차이"
date:   2025-05-06
categories: cs
tags: [네트워크]
hide_last_modified: true
---

* toc
{:toc .large-only}

HTTP, TCP, UDP는 네트워크 통신에서 자주 등장하는 개념으로, 각각 TCP/IP 4계층 모델의
서로 다른 계층에 위치한다. 각 개념과 계층별 차이를 정리한다.

## 1. 개념 요약

| 프로토콜 | 설명 | 계층 (TCP/IP 기준) |
|:---:|:---|:---:|
| HTTP (HyperText Transfer Protocol) | 웹 브라우저와 서버 간 데이터 전송 (HTML·이미지 요청 등) | 애플리케이션 |
| TCP (Transmission Control Protocol) | 신뢰성 있는 연결 지향형 전송 (패킷 손실 검사·재전송) | 전송 |
| UDP (User Datagram Protocol) | 빠르지만 신뢰성 없는 비연결형 전송 | 전송 |

TCP/IP 계층 모델은 [OSI 7계층(OSI 7 Layer)](../../computersystem/osi-7-layer){:.heading.flip-title} 하단에서 다루니 참고하자.

## 2. 프로토콜 상세 비교

### 2-1. HTTP (애플리케이션 계층)

- Client-Server 구조 (브라우저가 서버에 요청)
- 요청/응답 방식 (GET, POST 등)
- **TCP 위에서 동작**한다 (즉, HTTP는 TCP를 기반으로 함)
- 예: 웹사이트 접속, API 호출

### 2-2. TCP (전송 계층)

- 연결 지향 (3-way handshake로 연결 수립)
- 데이터 순서 보장
- 손실된 패킷 재전송
- 속도는 상대적으로 느림
- 예: 웹서핑, 이메일, 파일 다운로드

### 2-3. UDP (전송 계층)

- 비연결형 (handshake 없이 즉시 전송)
- 데이터 순서·전송 보장 없음
- 빠르고 지연이 최소화됨
- 예: 실시간 스트리밍, VoIP, 게임

## 3. 계층별 흐름 예시

웹 브라우저로 웹 페이지에 접속할 때의 흐름이다.

| 순서 | 동작 | 계층 |
|:---:|:---|:---|
| 1 | HTTP 요청 생성 | 애플리케이션 |
| 2 | TCP 연결 수립 후 데이터 전송 | 전송 |
| 3 | IP 주소 기반 목적지 라우팅 | 인터넷 |
| 4 | Ethernet/Wi-Fi를 통한 실제 전송 | 네트워크 인터페이스 |

## 4. 정리 요약

| 항목 | HTTP | TCP | UDP |
|:---:|:---:|:---:|:---:|
| 계층 | 애플리케이션 | 전송 | 전송 |
| 연결 방식 | 연결 필요 (TCP 기반) | 연결 지향 | 비연결형 |
| 신뢰성 | TCP에 의존 | 높음 (재전송·순서 보장) | 낮음 (손실 허용) |
| 속도 | 중간 | 느림 | 빠름 |
| 용도 | 웹, API | 웹, 이메일 | 스트리밍, 게임, DNS |