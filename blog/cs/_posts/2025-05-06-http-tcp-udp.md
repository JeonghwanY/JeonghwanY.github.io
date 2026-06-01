---
layout: post
title:  "HTTP, TCP, UDP"
description: >
 HTTP, TCP, UDP는 네트워크 통신에서 자주 등장하는 개념들이고, 이들은 OSI 7계층 모델 또는 TCP/IP 4계층 모델의 서로 다른 계층에 위치해 있어. 아래에 각 개념과 계층별 차이점을 정리해줄게
date:   2025-05-06
tags: [네트워크]
hide_last_modified: true
---

* toc  
{:toc .large-only}

## 개념 요약

| 프로토콜 | 설명 | 위치하는 계층 (TCP/IP 기준) |
|:---:|:---:|:---:|
| HTTP (HyperText Transfer Protocol) | 웹 브라우저와 서버 간의 데이터 전송 (ex. HTML, 이미지 요청 등) | 애플리케이션 계층 |
| TCP (Transmission Control Protocol) | 신뢰성 있는 연결 지향형 데이터 전송 (패킷 손실 검사 및 재전송) | 전송 계층 |
| UDP (User Datagram Protocol) | 빠르지만 신뢰성 없는 연결less형 데이터 전송 | 전송 계층 |

TCP/ IP 게층 모델에 관하여서는 [OSI 7 계층(OSI7 Layer)](../../computersystem/osi-7-layer){:.heading.flip-title}의 하단에 잠깐 다루니 참고하도록 하자

## 각 프로토콜 상세 비교

### 1. HTTP

- 계층 : application 계층

- 특징 :

    - client-server 구조 (browser가 server에 요청)

    - 요청/응답 방식(GET, POST 등)

    - TCP 위에서 동작함 (즉, HTTP는 TCP를 기반으로 함)

    - 예 : 웹사이트 접속, API 호출

### 2. TCP

- 계층 : 전송 계층

- 특징 : 

    - 연결 지향 (3-way handshake로 연결 수립)

    - 데이터 순서 보장

    - 손실된 패킷 재전송

    - 속도는 상대적으로 느림

    - 예 : 웹서핑, 이메일, 파일 다운로드

### 3. UDP

- 계층 : 전송 계층

- 특징 :

    - 비연결형 (handshake 없이 즉시 전송)

    - 데이터 순서/전송 보장 없음

    - 빠름, 지연 최소화

    - 예 : 실시간 스트리밍, VoIP, 게임

## 계층별 차이 예시로 이해하기

웹 브라우저로 웹 페이지 접속 시 흐름 :

1. HTTP 요청 생성 → (애플리케이션 계층)

2. TCP 연결 수립 후 데이터 전송 → (전송 계층)

3. IP 주소 기반으로 목적지 라우팅 → (인터넷 계층)

4. Ethernet/Wi-Fi를 통해 실제 전송 → (네트워크 인터페이스 계층)

## 정리 요약

| 항목 | HTTP | TCP | UDP |
|:---:|:---:|:---:|:---:|
| 계층 | application | 전송 | 전송 |
| 연결 방식 | 연결 필요 (TCP 기반) | 연결 지향 | 비연결형 |
| 신뢰성 | TCP에 의존 | 높음 (재전송, 순서 보장) | 낮음 (손실 허용) |
| 속도 | 중간 | 느림 | 빠름 |
| 용도 | 웹, API | 웹, 이메일 | 스트리밍, 게임, DNS |