---
layout: post
title:  "Datagram Socket과 Stream Socket"
description: >
 Datagram Socket과 Stream Socket은 네트워크 통신 방식에 따라 소켓을 분류한 두 가지 종류이며, 각각은 UDP와 TCP를 기반으로 두고 있음
date:   2025-05-06
tags: [네트워크]
hide_last_modified: true
---

* toc  
{:toc .large-only}

네트워크 통신 방식에 따라 소켓을 분류한 두 가지 종류 Datagram Socket과 Stream Socket을 알려줄게

## Datagram Socket (UDP 기반)

- 기반 프로토콜 : UDP (User Datagram Protocol)

- 연결 방식 : 비연결형 (Connectionless)

- 특징 :

    - **비연결형** : 연결 없이 바로 데이터 전송

    - **신뢰성 없음** : 순서 보장 X, 재전송 X, 확인 응답 X

    - **오버헤드 작음** : 빠르고 단순

- 용도 예시 :

    - 스트리밍 (비디오/오디오)

    - 실시간 게임

    - DNS 요청

예제 : C에서의 예시 (Datagram Socket)
~~~c
int sockfd = socket(AF_INET, SOCK_DGRAM, 0);  // SOCK_DGRAM이 핵심
~~~

### Datagram Socket (UDP)의 내부 동작

- Data를 전송하면, 해당 data는 Datagram(데이터그램)으로 만들어짐

- 각 Datagram은 독립적으로 처리됨(순서/재전송 신경 안 씀)

- 수신 측이 없어도 전송은 진행됨

> 전송 성공 여부는 알 수 없음

예제 : Data 전송 예
~~~c
// 송신자
sendto(sockfd, msg, len, 0, (struct sockaddr *)&addr, sizeof(addr));

// 수신자
recvfrom(sockfd, buf, BUFLEN, 0, (struct sockaddr *)&from, &fromlen);
~~~
> `sendto`나 `recvfrom`에서 연결 상태를 유지하지 않고 주소를 직접 지정함

## Stream Socket (TCP 기반)

- 기반 프로토콜 : TCP (Transmission Control Protocol)

- 연결 방식 : 연결형 (Connection-oriented)

- 특징 :

    - **연결지향형** : 먼저 연결을 설정한 후 데이터를 주고받음, 통신 전에 연결(3-way handshake) 필요

    - **신뢰성** : 순서 보장, 오류 검출, 재전송

    - **흐름 제어** : 수신자가 감당할 수 있을 만큼만 전송

    - **혼잡 제어** : 네트워크 상황에 따라 전송 속도 조절

    - 속도는 느릴 수 있지만 신뢰성 높음

- 용도 예시 :

    - 웹 서비스 (HTTP)

    - 이메일 (SMTP)

    - 파일 전송 (FTP)

예제 : C에서의 예시 (Stream Socket)
~~~c
int sockfd = socket(AF_INET, SOCK_STREAM, 0);  // SOCK_STREAM이 핵심
~~~

### Stream Socket (TCP)의 내부 동작 + TCP 연결 설정 : 3-way handshake

**3way handshake**는 양쪽 통신자가 연결을 동기화하고 준비됐는지 확인하는 과정

**과정 요약**

1. client → server : `SYN` 플래그 세팅된 패킷 전송 (연결 요청)

2. server → client : `SYN + ACK` 패킷 전송 (요청 수락 + 서버도 연결 요청)

3. client → server : `ACK` 전송 (서버의 연결 수락)

> 이 과정을 거친 뒤 양쪽 모두 연결이 되었고, 데이터를 주고받을 수 있어

**예시 흐름**

| 단계 | 송신자 | 수신자 | 내용 |
|:---:|:---:|:---:|:---:|
| 1 | Client | Server | SYN, seq = x |
| 2 | Server | Client | SYN + ACK, seq = y, ack = x+1 |
| 3 | Client | Server | ACK, seq = x+1, ack = y+1 |

**TCP 데이터 전송**

1. 데이터는 스트림(stream)으로 보내짐. 내부적으로 작은 단위로 나뉘어 전송됨.

2. 각 패킷은 시퀸스 번호(sequence number)를 가짐

3. 수신자는 받은 순서대로 조립하고, ACK로 확인 메시지 보냄

4. 손실되면 재전송함

**TCP 연결 종료 : 4-way handshake**

| 단계 | 전송 | 인자 | 설명 |
|:---:|:---:|:---:|:---:|
| 1 | A → B | `FIN` | A가 종료 요청 |
| 2 | B → A | `ACK` | B가 확인 |
| 3 | B → A | `FIN` | B도 종료 요청 |
| 4 | A → B | `ACK` | A가 확인하고 종료 |

## 비교 요약

| 항목 | Datagram Socket (UDP) | Stream Socket (TCP) |
|:---:|:---:|:---:|
| 연결 여부 | 비연결 (Connectionless) | 연결 (Connection-oriented) |
| 연결 과정 | 없음 | 3-way handshake 필요 |
| 오류 처리 | 없음 | ACK + 재전송 |
| 신뢰성 | 낮음 | 높음 |
| Data 순서 보장 | 안됨 | 됨(시퀸스 번호로 순서 보장) |
| 속도 | 빠름 | 상대적으로 느림 |
| 오버헤드 | 작음 | 큼 |
| 사용 예시 | 실시간 전송, DNS 등 | 웹, 이메일, 파일 전송 등 |