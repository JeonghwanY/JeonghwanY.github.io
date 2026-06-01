---
layout: post
title:  "Datagram Socket과 Stream Socket: UDP와 TCP 소켓 비교"
date:   2025-05-05
tags: [네트워크]
hide_last_modified: true
---

* toc
{:toc .large-only}

네트워크 통신 방식에 따라 소켓은 크게 두 종류로 나뉜다. UDP 기반의 **Datagram Socket**과 TCP 기반의 **Stream Socket**이다.

## 1. Datagram Socket (UDP 기반)

| 항목 | 내용 |
|:---:|:---|
| 기반 프로토콜 | UDP (User Datagram Protocol) |
| 연결 방식 | 비연결형 (Connectionless) |
| 신뢰성 | 없음 — 순서 보장 X, 재전송 X, 확인 응답 X |
| 오버헤드 | 작음 (빠르고 단순) |
| 용도 | 스트리밍(비디오/오디오), 실시간 게임, DNS 요청 |

C에서는 `socket()`의 두 번째 인자에 `SOCK_DGRAM`을 넘긴다.

```c
int sockfd = socket(AF_INET, SOCK_DGRAM, 0);  // SOCK_DGRAM이 핵심
```

### 내부 동작

- 데이터를 전송하면 **데이터그램(Datagram)** 단위로 만들어진다
- 각 데이터그램은 독립적으로 처리된다 (순서·재전송을 신경 쓰지 않음)
- 수신 측이 없어도 전송은 진행되므로, **전송 성공 여부를 알 수 없다**

연결 상태를 유지하지 않고 `sendto`/`recvfrom`에서 주소를 직접 지정한다.

```c
// 송신자
sendto(sockfd, msg, len, 0, (struct sockaddr *)&addr, sizeof(addr));

// 수신자
recvfrom(sockfd, buf, BUFLEN, 0, (struct sockaddr *)&from, &fromlen);
```

## 2. Stream Socket (TCP 기반)

| 항목 | 내용 |
|:---:|:---|
| 기반 프로토콜 | TCP (Transmission Control Protocol) |
| 연결 방식 | 연결형 (Connection-oriented) — 통신 전 3-way handshake 필요 |
| 신뢰성 | 높음 — 순서 보장, 오류 검출, 재전송 |
| 흐름 제어 | 수신자가 감당할 수 있는 만큼만 전송 |
| 혼잡 제어 | 네트워크 상황에 따라 전송 속도 조절 |
| 용도 | 웹 서비스(HTTP), 이메일(SMTP), 파일 전송(FTP) |

속도는 느릴 수 있지만 신뢰성이 높다. C에서는 `SOCK_STREAM`을 넘긴다.

```c
int sockfd = socket(AF_INET, SOCK_STREAM, 0);  // SOCK_STREAM이 핵심
```

### 2-1. 연결 설정: 3-way handshake

**3-way handshake**는 양쪽 통신자가 연결을 동기화하고 준비됐는지 확인하는 과정이다.

| 단계 | 송신자 | 수신자 | 내용 |
|:---:|:---:|:---:|:---|
| 1 | Client | Server | `SYN`, seq = x (연결 요청) |
| 2 | Server | Client | `SYN + ACK`, seq = y, ack = x+1 (수락 + 서버도 연결 요청) |
| 3 | Client | Server | `ACK`, seq = x+1, ack = y+1 (서버의 수락 확인) |

이 과정을 거치면 양쪽 모두 연결이 성립되어 데이터를 주고받을 수 있다.

### 2-2. 데이터 전송

1. 데이터는 **스트림(stream)** 으로 보내지며, 내부적으로 작은 단위로 나뉘어 전송된다
2. 각 패킷은 **시퀀스 번호(sequence number)** 를 가진다
3. 수신자는 받은 데이터를 순서대로 조립하고, `ACK`로 확인 메시지를 보낸다
4. 손실된 패킷은 재전송한다

### 2-3. 연결 종료: 4-way handshake

| 단계 | 전송 | 플래그 | 설명 |
|:---:|:---:|:---:|:---|
| 1 | A → B | `FIN` | A가 종료 요청 |
| 2 | B → A | `ACK` | B가 확인 |
| 3 | B → A | `FIN` | B도 종료 요청 |
| 4 | A → B | `ACK` | A가 확인하고 종료 |

## 3. 비교 요약

| 항목 | Datagram Socket (UDP) | Stream Socket (TCP) |
|:---:|:---:|:---:|
| 연결 여부 | 비연결 (Connectionless) | 연결 (Connection-oriented) |
| 연결 과정 | 없음 | 3-way handshake 필요 |
| 오류 처리 | 없음 | ACK + 재전송 |
| 신뢰성 | 낮음 | 높음 |
| 순서 보장 | 안 됨 | 됨 (시퀀스 번호 기반) |
| 속도 | 빠름 | 상대적으로 느림 |
| 오버헤드 | 작음 | 큼 |
| 사용 예시 | 실시간 전송, DNS 등 | 웹, 이메일, 파일 전송 등 |