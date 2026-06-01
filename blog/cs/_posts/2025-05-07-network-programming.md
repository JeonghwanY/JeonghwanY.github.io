---
layout: post
title:  "CS:APP 11장 네트워크 프로그래밍 & Proxy 서버 C언어로 구현"
description: >
 우리가 웹을 검색하고, 이메일 메시지를 보내고, 온라인 게임을 하는 등의 모든 경우 우리는 네트워크 응용을 사용한다
date:   2025-05-08
tags: [네트워크]
hide_last_modified: true
---

* toc  
{:toc .large-only}

흥미로운 것은 모든 네트워크 응용들은 동일한 기본적인 프로그래밍 모델에 기초하고 있으며, 이들은 비슷한 전체 논리 구조를 가지며, 동일한 프로그래밍 인터페이스를 사용한다는 점이다. 개념들을 설명하고 난 후 개념들을 모두 연결해서 아주 작지만 실제로 동작하는 웹 서버를 개발할 것이다.

## 클라이언트 - 서버 프로그래밍 모델

** 모든 네트워크 응용 프로그램은 클라이언트-서버 모델에 기초하고 있다.** 아래와 같은 사진과 같이 한 개의 서버 프로세스와 한 개 이상의 클라이언트 프로세스로 구성된다.

![클라이언트 서버 모델](/assets/img/blog/cs/clientservertransaction.png)

1. 클라이언트가 한 개의 요청(request)을 서버에 보내는 것으로 트랜잭션을 개시한다. 예를 들어, 웹 브라우저가 파일을 필요로 할때, 웹 서버로 요청을 보낸다.

2. 서버는 요청을 받고, 해석하고, 자신의 자원들을 적절한 방법으로 조작한다. 예를 들어, 웹 서버가 브라우저로부터 요청을 받을 때, 디스크 파일을 읽는다.

3. 서버는 응답(response)을 클라이언트로 보내고, 그 후에 다음 요청을 기다린다. 예를 들어, 웹 서버는 이 파일을 다시 클라이언트로 돌려보낸다.

4. 클라이언트는 응답을 받고 이걸을 처리한다. 예를 들어, 웹 브라우저가 서버로부터 페이지를 한 개 받은 후, 이것을 스크린에 디스플레이한다.

## 네트워크

물리적으로 네트워크는 기하학적 위치로 구성된 **계층구조 시스템**이다 하위수준은 **LAN(Local Area Network)**으로 빌딩이나 캠퍼스에 설치된다. 가장 대중적인 LAN기술은 현재까지는 이더넷(Ehternet)이며, 시간에 따라서 엄청 발전되어 왔다. 이더넷(Ethernet)에 관련한 설명은 아래에 있다.

### NIC (Network Interface Card)

호스트에게 네트워크는 단지 또 다른 I/O 디바이스이다. 아래 사진과 같이 네트워크에서 수신한 데이터는 I/O와 메모리 버스를 거쳐서 어댑터에서 메모리로, 대개 DMA 전송으로 복사된다. 비슷하게 데이터는 또한 메모리에서 네트워크로 복사될 수 있다.

![호스트의 네트워크 구성](/assets/img/blog/cs/hosthardwareorganization.png)

### 이더넷 (Ethernet)

이더넷 세그먼트는 아래 사진과 같이 몇 개의 전선들과 허브라고 부르는 작은 상자로 구성된다. 한쪽 끝은 호스트의 어댑터에 연결되고, 다른 끝은 허브의 포트에 연결된다. 허브는 각 포트에서 수신한 모든 비트를 종속적으로 다른 모든 포트로 복사한다.

![이더넷 세그먼트](/assets/img/blog/cs/ethernetsegment.png)

- **이더넷 어댑터**는 어댑터의 비휘발성 메모리에 저장된 전체적으로 **고유한 48비트 주소**를 가진다.

- 호스트는 **프레임**이라고 부르는 비트들을 세그먼트의 다른 호스트에 보낼 수 있다.

- 각 **프레임**은 프레임의 **소스**와 **목적지**, 프레임의 **길이**를 식별할 수 있는 고정된 **헤더 비트**를 가지고 있으며, 그 뒤에 데이터 비트가 이어진다.

- 모든 호스트 어댑터는 이 프레임을 볼 수 있지만, 목적지 호스트만이 실제로 이것을 읽어들인다.

#### 더 큰 LAN - 브릿지의 등장

아래 사진에 나타난 것처럼 전선들과 브릿지라고 하는 작은 상자들을 사용해서 **다수의 이더넷 세그먼트가 연결되어 브릿지형 이더넷이라고 하는 더 큰 LAN을 구성할 수 있다.

![브릿지로 연결된 이더넷 세그먼트](/assets/img/blog/cs/bridgedethernetsegments.png)

- 브릿지형 이더넷에서 일부 선은 브릿지를 브릿지로 연결하고, 다른 선들은 브릿지를 허브로 연결한다.

- 각 선의 대역폭은 다를 수 있다. 우리의 예제에서 브릿지-브릿지선은 1Gb/s 대역폭을, 네 개의 허브-브릿지 선은 100Mb/s 대역폭을 가진다.

#### 브릿지와 허브의 차이점

- 브릿지는 허브보다 더 높은 전선의 대역폭을 가진다.

- 허브는 각 포트에서 수신한 모든 비트를 종속적으로 다른 모든 포트로 복사한다.

- 브릿지는 우수한 분산 알고리즘을 통해 필요한 경우 선택적으로 하나의 포트에서 다른 포트로 프레임을 복사한다.

### WAN (Wide Area Network)

계층구조의 상부에서 다수의 비호환성 LAN들은 라우터라고 부르는 특별한 컴퓨터에 의해서 연결될 수 있으며, **라우터는 네트워크 간 연결을 구성한다(상호연결 네트워크)**. 각 라우터는 이들이 연결되는 각 네트워크에 대해 어댑터(포트)를 가지고 있다. **라우터는 또한 고속의 point-to-point 전화 연결을 할 수 있으며, 이들은 WAN이라고 하는 네트워크의 사례다**. 이 이름은 이들이 LAN보다 지리적으로 더 넓은 지역에서 운용되기 때문에 불리게 되었다.

### internet

**internet의 중요한 특성은 이것이 매우 다르고 비호환적인 기술을 갖는 여러 가지 LAN과 WAN들로 이루어져 있다는 점이다**. internet 프로토콜은 두 가지 기본 기능을 제공해야 한다.

- 명명법(Naming Scheme) : internet 프로토콜은 호스트 주소를 위한 통일된 포맷을 정의해서 이 차이점들을 줄인다.

- 전달기법(Delivery Mechanism) : internet 프로토콜은 데이터 비트를 패킷(packet)이라고 부르는 비연속적인 단위로 묶는 통일된 방법을 정의해서 이 차이점을 줄인다. 패킷은 패킷 크기와 소스 및 목적지 호스트 주소를 포함하는 헤더와 소스 호스트가 보낸 데이터 비트를 포함하는 데이터로 구성된다. 이것을 Datagram이라고도 부른다.

전달기법 관련하여서 패킷화하는 과정은 아래 사진과 같다. 여기서 말하는 Datagram은 (1) → (2) 로 가는 방법이다.

![인터넷 패킷화 과정](/assets/img/blog/cs/internetpacket.png)

## 글로벌 IP 인터넷

인터넷 클라이언트 - 서버 응용의 기본적인 하드웨어 및 소프트웨어 구조는 아래 사진과 같으며, 이 구조는 1980년대 이후로 안정적이었다.

![클라이언트 서버 구조](/assets/img/blog/cs/clientserverstructure.png)

각 인터넷 호스트는 TCP/IP 프로토콜(Transmission Control Protocol/Internet Protocol)을 구현한 소프트웨어를 실행하며, 이것은 거의 모든 현대 컴퓨터 시스템에서 지원되고 있다.

관련한 프로토콜 HTTP/TCP/UDP 관련하여서는 [HTTP, TCP, UDP](../../computersystem/http-tcp-udp){:.heading.flip-title}을 참고하면 된다.

### IP 주소

IPv4 주소는 비부호형 32비트 정수다. 네트워크 프로그램은 IP주소를 아래와 같은 IP주소 구조체에 저장한다.

~~~c
/* IP address structure */
struct in_addr {
uint32_t s_addr; /* Address in network byte order (big-endian) */
};
~~~

TCP/IP는 네트워크 패킷 헤더에 포함되는 IP 주소 같은 모든 정수형 데이터 아이템에 대해서 통일된 **Network Byte Order(Big Endian 바이트 순서)**를 정의한다.

- Big Endian : 가장 큰 자릿값(최상위 바이트)을 가장 낮은 주소에, 그 다음 바이트를 뒤쪽 주소에 차례로 저장

- Little Endian : 반대로 최하위 바이트를 가장 낮은 주소에 두고, 큰 바이트로 갈수록 주소가 커짐. x86, ARM(Android/iOS) 같은 현대 CPU 대부분이 사용함

#### Dotted-decimal

IP 주소는 대게 사람들에게 dotted-decimal 표기라고 하는 형식으로 제시되며, 이것은 각 바이트가 십진수 값을 사용하고 다른 바이트들과는 점을 사용해서 구분된다. 아래와 같은 것이 dotted-decimal이다.

~~~linux
linux> hostname -i
128.2.210.175
~~~

### 인터넷 도메인 이름

**DNS(Domain Name System)** 데이터베이스는 수백만 개의 호스트 엔트리로 구성되어 있으며, 이들 각각은 도메인 이름의 집합과 IP 주소 집합 사이의 매핑을 정의한다.

4가지의 매핑을 아래에 나열하겠다.

1. 가장 간단한 경우로, 도메인 이름과 IP 주소 사이의 일대일 매핑

~~~linux
linux> nslookup whaleshark.ics.cs.cmu.edu
Address: 128.2.210.175
~~~

2. 다수의 도메인 이름이 동일한 IP 주소에 매핑

~~~linux
linux> nslookup cs.mit.edu
Address: 18.62.1.6

linux> nslookup eecs.mit.edu
Address: 18.62.1.6
~~~

3. 다수의 도메인 이름들은 다수의 IP 주소로 매핑

~~~linux
linux> nslookup www.twitter.com
Address: 199.16.156.6
Address: 199.16.156.70
Address: 199.16.156.102
Address: 199.16.156.230

linux> nslookup twitter.com
Address: 199.16.156.102
Address: 199.16.156.230
Address: 199.16.156.6
Address: 199.16.156.70
~~~

4. 마지막으로, 일부 유효한 도메인 이름들은 어떤 IP 주소에도 매핑되어 있지 않다.

~~~linux
linux> nslookup edu
*** Can’t find edu: No answer
linux> nslookup ics.cs.cmu.edu
*** Can’t find ics.cs.cmu.edu: No answer
~~~

### 인터넷 연결

**인터넷 client와 server는 연결(connection)을 통해서 바이트 스트림을 주고받는 방식으로 통신한다**. 이 연결은 두개의 프로세스를 연결한다는 점에서 **point-to-point 연결**이다. 데이터가 동시에 양방향으로 흐를 수 있다는 의미에서 이것은 **완전양방향(full-duplex)**이다.

- 소켓(Socket)은 연결의 종단점이다.

- 각 소켓은 인터넷 주소와 16비트 정수 포트로 이루어진 소켓 주소를 가지며, 이것은 address : port로 나타낸다.

- 클라이언트의 소켓 주소 내의 포트는 클라이언트가 연결 요청을 할 때 커널이 자동으로 할당하며, 이것은 단기(Ephemeral) 포트라고 한다.

- 서버는 서비스에 연관된 포트를 사용한다.

인터넷 연결같은 경우 두 개의 종단점의 소켓 주소에 의해 유일하게 식별된다. 이 두개의 소켓 주소는 소켓 쌍이라고 알려져 있으며, 아래와 같이 tuple로 나타낸다.

![인터넷 연결의 구조](/assets/img/blog/cs/internetconnection.png)

## 소켓 인터페이스

소켓 인터페이스는 네트워크 응용을 만들기 위한 Unix I/O 함수들과 함께 사용되는 함수들의 집합이다. 이것은 모든 Unix 변종, 윈동, 매킨토시 시스템을 포함하는 대부분의 현대 시스템에서 구현되었다. 아래와 같은 그림은 전형적인 client-server transaction의 문맥에서 소켓 인터페이스의 개요를 보여준다.

![소켓 인터페이스 기반 네트워크 응용 프로그램의 개요](/assets/img/blog/cs/socketinterfaceoverview.png)

### 소켓 주소 구조체

**리눅스 커널의 관점에서 보면, 소켓은 통신을 위한 끝점이다. Unix 프로그램의 관점에서 보면 소켓은 해당 식별자를 가지는 열린 파일이다**.

- Unix 프로그램에서는 network도 파일처럼 여겨진다.

인터넷 소켓 주소는 아래 코드와 같이 프로토콜에 특화된 구조체로, 모든 포인터를 포괄적인 구조체로 캐스팅하도록 정의하는 것이었다.

~~~c
/* IP socket address structure */
struct sockaddr_in {
uint16_t sin_family; /* Protocol family (always AF_INET) */
uint16_t sin_port; /* Port number(16bit) in network byte order */
struct in_addr sin_addr; /* IP address in network byte order */
unsigned char sin_zero[8]; /* Pad to sizeof(struct sockaddr) */
};

/* Generic socket address structure (for connect, bind, and accept) */
struct sockaddr {
uint16_t sa_family; /* Protocol family */
char sa_data[14]; /* Address data */
};
~~~

위에 두가지 구조체가 등장하는데, 첫번째 구조체는 IPv4전용 주소 구조체이며, 두번째 구조체는 TCP, IPv6, IPv4, UDP 등 범용적으로 사용할 수 있는 구조체이다.

첫번째 구조체에서 두번째 구조체로 캐스팅할 필요가 있을 떄, 아래와 같은 타입을 사용한다.

~~~c
typedef struct sockaddr SA;
~~~

###  socket 함수

**Client**와 **server**는 소켓 식별자를 생성하기 위해 socket 함수를 사용한다.

~~~c
#include <sys/types.h>
#include <sys/socket.h>
int socket(int domain, int type, int protocol);

/* Returns: nonnegative descriptor if OK, −1 on error */
~~~

음이 아닌 정수를 반환하며, 이 정수는 식별자다. 이 식별자로 커널 내부의 소켓 자료구조를 찾아갈 수 있어서 프로그래머에게는 핸들(handle) 역할을 함

### connect 함수

**Client**는 connect함수를 호출해서 server와의 연결을 수립한다.

~~~c
#include <sys/socket.h>
int connect(int clientfd, const struct sockaddr *addr,
socklen_t addrlen);

/* Returns: 0 if OK, −1 on error */
~~~c

connect 함수는 소켓 주소 addr의 서버와 인터넷 연결을 시도하며, addrlen은 sizeof(sockaddr_in)이 된다. connect함수는 연결이 성공할 때까지 블록되어 있거나 에러가 발생한다. 만일 성공이라면, clientfd 식별자는 이제 읽거나 쓸 준비가 되었으며, 이 연결은 다음과 같은 소켓 쌍으로 규정된다.

~~~c
(x:y, addr.sin_addr:addr.sin_port)
~~~

### bind 함수

남아 있는 소켓 함수 bind, listen, accept는 server가 client와 연결을 수립하기 위해 사용한다.

~~~c
#include <sys/socket.h>
int bind(int sockfd, const struct sockaddr *addr,
socklen_t addrlen);

/* Returns: 0 if OK, −1 on error */
~~~

bind 함수는 kernel에게 addr에 있는 server의 소켓 주소를 소켓 식별자 sockfd와 연결하라고 물어본다.

### listen 함수

client는 연결 요청을 개시하는 능동적 개체이다. server는 client로부터의 연결 요청을 기다리는 수동적 개체이다. 그래서 socket함수가 함수가 만든 식별자는 한 연결의 클라이언트 쪽 끝에서 존재하는 능동 소켓에 대응된다. 서버는 listen함수를 호출해서 이 식별자를 client 대신에 server가 사용하게 될 것이라고 알려준다.

~~~c
#include <sys/socket.h>
int listen(int sockfd, int backlog);

/* Returns: 0 if OK, −1 on error */ 
~~~

listen 함수는 sockfd를 능동 소켓에서 듣기 소켓으로 변환하며, 듣기 소켓은 client로부터의 연결 요청을 승락할 수 있다.

### accept 함수

서버는 accept함수를 호출해서 client로부터의 연결 요청을 기다린다.

~~~c
#include <sys/socket.h>
int accept(int listenfd, struct sockaddr *addr, int *addrlen);

/* Returns: nonnegative connected descriptor if OK, −1 on error */
~~~

accept함수는 client로부터의 연결 요청이 듣기 식별자 listenfd에 도달하기를 기다리고, 그 후에 addr 내의 client의 소켓 주소를 채우고, Unix I/O 함수들을 사용해서 client와 통신하기 위해 사용될 수 있는 연결 식별자를 리턴한다.

#### 듣기 식별자와 연결 식별자

듣기 식별자와 연결 식별자 사이의 구분은 많은 학생들을 혼란스럽게 한다. 듣기 식별자는 client 연결 요청에 대해 끝점으로서의 역할을 한다. 이것은 대개 한 번 생성되며, 서버가 살아있는 동안 계속 존재한다. 연결 식별자는 client와 server 사이에 성립된 연결의 끝점이다. 이것은 server가 연결 요청을 수락할 때마다 생성되며, server가 client에 서비스하는 동안에만 존재한다.

accept함수의 flow를 그림을 통해서 설명해 보겠다. 듣기 식별자와 연결 식별자 구분에 도움이 될 것이다.

![듣기와 연결 식별자의 역할](/assets/img/blog/cs/listeningandconnecteddescriptor.png)

1. server는 accept를 호출하고, 이것은 연결 요청이 읽기 식별자에 도달하기를 기다리며, 명확하게 하기 위해서 이것을 식별자 3이라고 가정한다. 식별자 0 ~ 2는 표준 파일들을 위해 배정되어 있다는 점을 기억하라.

2. client는 connect함수를 호출하고, 이것은 listenfd로 연결 요청을 보낸다.

3. accept함수는 새로운 연결 식별자 connfd(이것은 식별자 4라고 가정한다)를 오픈하고, clientfd와 connfd 사이의 연결을 수립하고 응용에 connfd를 리턴한다. client는 또한 connect에서 return하고, 이 지점에서 client와 server는 clientfd와 connfd를 각각 읽고 쓰는 방법으로 data를 주고받을 수 있다.

### 호스트와 서비스 변환(getaddrinfo & getnameinfo)

리눅스는 getaddrinfo와 getnameinfo라고 하는 강력한 함수들을 제공하는데, 소켓 interface와 함께 이용될 때 매우 유용하다. 또한 우리가 특정 IP 프로토콜의 버전에 의존하지 않는 네트워크 프로그램을 작성하게 해준다.

#### getaddrinfo 함수

getaddrinfo함수는 host이름, host주소, service이름, port번호의 스트링 표시를 소켓 주소 구조체로 변환한다.

~~~c
#include <sys/types.h>
#include <sys/socket.h>
#include <netdb.h>
int getaddrinfo(const char *host, const char *service,
const struct addrinfo *hints,
struct addrinfo **result);

/* Returns: 0 if OK, nonzero error code on error */

void freeaddrinfo(struct addrinfo *result);
Returns: nothing
const char *gai_strerror(int errcode);

/* Returns: error message */
~~~

host와 service(소켓 주소의 두 개의 구성요소)가 주어지면, getaddrinfo는 각각이 host와 service에 대응되는 소켓 주소 구조체를 가리키는 addrinfo 구조체의 연결리스트를 가리키는 **result(pointer)를 return**한다. result로 부터의 연결 리스트는 아래 사진과 같다.

![getaddrinfo result의 자료구조](/assets/img/blog/cs/getaddrinfolinkedlist.png)

연결리스트로 반환하는 이유에 대해서는, 하나의 IP로 접속이 실패할 수 있기 때문에, 그것에 대한 backup용으로 여러개의 IP를 포함시키기 위함이다.

addrinfo에는 다음 같은 구조로 되어 있다.

~~~c
struct addrinfo {
int ai_flags; /* Hints argument flags */
int ai_family; /* First arg to socket function */
int ai_socktype; /* Second arg to socket function */
int ai_protocol; /* Third arg to socket function */
char *ai_canonname; /* Canonical hostname */
size_t ai_addrlen; /* Size of ai_addr struct */
struct sockaddr *ai_addr; /* Ptr to socket address structure */
struct addrinfo *ai_next; /* Ptr to next item in linked list */
};
~~~

기본적으로, host에 연관된 각각의 고유의 주소에 대해, getaddrinfo함수는 최대 세개의 addrinfo 구조체를 return할 수 있으며, 각각은 서로 다른 ai_socktype 필드를 갖는다 : 한 개는 연결을 위해, 하나는 datagram, 마지막 하나는 원시 소켓을 위해.

#### getnameinfo 함수

getnameinfo함수는 getaddrinfo의 역이다. 이것은 소켓 주소 구조체를 대응되는 host와 service이름 스트링으로 변환한다.

~~~c
#include <sys/socket.h>
#include <netdb.h>
int getnameinfo(const struct sockaddr *sa, socklen_t salen,
char *host, size_t hostlen,
char *service, size_t servlen, int flags);

/* Returns: 0 if OK, nonzero error code on error */
~~~

### open_clientfd함수

client는 open_clientfd를 호출해서 server와 연결을 설정한다. 여기 안에 socket interface함수들이 많이 포함되어 있다.

~~~c
int open_clientfd(char *hostname, char *port) {
    int clientfd;
    struct addrinfo hints, *listp, *p;

    /* Get a list of potential server addresses */
    memset(&hints, 0, sizeof(struct addrinfo));
    hints.ai_socktype = SOCK_STREAM; /* Open a connection */
    hints.ai_flags = AI_NUMERICSERV; /* ... using a numeric port arg. */
    hints.ai_flags |= AI_ADDRCONFIG; /* Recommended for connections */
    Getaddrinfo(hostname, port, &hints, &listp);

    /* Walk the list for one that we can successfully connect to */
    for (p = listp; p; p = p->ai_next) {
        /* Create a socket descriptor */
        if ((clientfd = socket(p->ai_family, p->ai_socktype, p->ai_protocol)) < 0)
            continue; /* Socket failed, try the next */

        /* Connect to the server */
        if (connect(clientfd, p->ai_addr, p->ai_addrlen) != -1)
            break; /* Success */
        Close(clientfd); /* Connect failed, try another */
    }

    /* Clean up */
    Freeaddrinfo(listp);
    if (!p) /* All connects failed */
        return -1;
    else /* The last connect succeeded */
        return clientfd;
}
~~~

함수를 실행하면 최종적으로 clientfd를 반환한다.

### open_listenfd함수

server는 open_listenfd함수를 호출해서 연결요청을 받을 준비가 된 듣기 식별자를 생성한다.

~~~c
int open_listenfd(char *port)
{
    struct addrinfo hints, *listp, *p;
    int listenfd, optval=1;

    /* Get a list of potential server addresses */
    memset(&hints, 0, sizeof(struct addrinfo));
    hints.ai_socktype = SOCK_STREAM; /* Accept connections */
    hints.ai_flags = AI_PASSIVE | AI_ADDRCONFIG; /* ... on any IP address */
    hints.ai_flags |= AI_NUMERICSERV; /* ... using port number */
    Getaddrinfo(NULL, port, &hints, &listp);

    /* Walk the list for one that we can bind to */
    for (p = listp; p; p = p->ai_next) {
        /* Create a socket descriptor */
        if ((listenfd = socket(p->ai_family, p->ai_socktype, p->ai_protocol)) < 0)
            continue; /* Socket failed, try the next */

        /* Eliminates "Address already in use" error from bind */
        Setsockopt(listenfd, SOL_SOCKET, SO_REUSEADDR,
                (const void *)&optval , sizeof(int));

        /* Bind the descriptor to the address */
        if (bind(listenfd, p->ai_addr, p->ai_addrlen) == 0)
            break; /* Success */
        Close(listenfd); /* Bind failed, try the next */
    }

    /* Clean up */
    Freeaddrinfo(listp);
    if (!p) /* No address worked */
        return -1;

    /* Make it a listening socket ready to accept connection requests */
    if (listen(listenfd, LISTENQ) < 0) {
        Close(listenfd);
        return -1;
    }
    return listenfd;
}
~~~

함수를 실행하면 최종적으로 listenfd를 반환한다.

## Echo client와 server

이것은 교제에 나오는 한 예제인데, client가 server에 data를 보내면 server가 다시 client에 똑같은 data를 보내는 방식의 소통이다. 나는 이걸 구현할 때, 우선 책에 나와있는 예제를 따라서 쳐 보았다.

- echoclient.c
~~~c
#include "csapp.h" // robust I/O 함수들과 네트워크 래퍼 함수들이 정의된 헤더

int main(int argc, char **argv)
{
    int clientfd; // 클라이언트 소켓 식별자
    char *host, *port, *buf[MAXLINE]; // 서버 호스트명, 포트 번호, 버퍼
    rio_t rio; // robust I/O 구조체

    // 명령줄 인자가 3개가 아니면 사용법 출력 후 종료
    if (argc != 3)
    {
        fprintf(stderr, "usage: %s <host> <port>\n", argv[0]); // 사용법 출력
        exit(0);
    }

    // 호스트명과 포트 번호를 명령줄 인자에서 가져옴
    host = argv[1]; // 호스트명
    port = argv[2]; // 포트 번호

    // 서버에 연결하기 위한 클라이언트 소켓 열기
    clientfd = Open_clientfd(host, port); // 호스트와 포트 번호로 클라이언트 소켓 열기

    // 클라이언트 소켓을 기반으로 robust I/O 구조체 초기화
    Rio_readinitb(&rio, clientfd); // 클라이언트 소켓을 기반으로 rio 구조체 초기화

    // 사용자로부터 한 줄씩 입력받아 서버에 전송하는 반복문
    while (Fgets(buf, MAXLINE, stdin) != NULL) // 표준 입력으로부터 한 줄 읽기
    {
        // 읽은 데이터를 서버에 전송
        Rio_writen(clientfd, buf, strlen(buf)); // 클라이언트 소켓을 통해 서버에 데이터 전송

        // 서버로부터 응답을 읽어와서 출력
        Rio_readlineb(&rio, buf, MAXLINE); // 서버로부터 한 줄 읽기
        
        // 읽은 데이터를 표준 출력으로 출력
        Fputs(buf, stdout);
    }

    Close(clientfd); // 클라이언트 소켓 닫기
    exit(0); // 프로그램 종료
}
~~~

- echoserveri.c
~~~c
#include "csapp.h"          // robust I/O 함수와 네트워크 함수 래퍼가 포함된 헤더 파일

void echo(int connfd);

int main(int argc, char **argv)
{
    int listenfd, connfd;   // 서버의 listen용 듣기 식별자와 클라이언트 연결용 연결 식별자
    socklen_t clientlen;    // 클라이언트 주소 구조체의 크기
    struct sockaddr_storage clientaddr; // 클라이언트 주소 or domain name 저장할 구조체
    char client_hostname[MAXLINE], client_port[MAXLINE]; // 클라이언트 호스트명과 포트 번호를 저장할 버퍼

    // 명령줄 인자가 2개가 아니면 사용법 출력 후 종료
    if (argc != 2)
    {
        fprintf(stderr, "usage: %s <port>\n", argv[0]); // 사용법 출력
        exit(0);
    }

    // 포트 번호를 인자로 받아 서버 리슨 소켓 열기
    listenfd = Open_listenfd(argv[1]); // argv[1] 포트 번호로 리슨 소켓 열기

    while (1)   // 반복형 서버: 클라이언트가 연결 올 때마다 반복
    {
        clientlen = sizeof(struct sockaddr_storage); // 클라이언트 주소 구조체 크기 초기화
        // 클라이언트 연결 요청을 수락하고 연결된 소켓 식별자(connfd) 반환
        connfd = Accept(listenfd, (SA *)&clientaddr, &clientlen);

        // 클라이언트 주소를 문자열로 변환하여 client_hostname과 client_port에 저장
        Getnameinfo((SA *)&clientaddr, clientlen, client_hostname, MAXLINE,
                    client_port, MAXLINE, 0);
        // 클라이언트의 호스트명과 포트 번호를 출력
        printf("Connected to (%s, %s)\n", client_hostname, client_port);
        // 클라이언트와 연결된 connfd를 인자로 하여 echo 함수 호출
        echo(connfd);
        // 클라이언트와의 연결 종료
        Close(connfd);
    }
    exit(0); // 프로그램 종료
}
~~~

한 번에 한 개씩의 client를 반복해서 실행하는 이런 종류의 서버를 반복서버(iterative server)라고 부른다.

- echo.c
~~~c
#include "csapp.h"          // robust I/O 함수와 관련 구조체를 포함한 헤더 파일 포함

// 클라이언트와 연결된 소켓 파일 디스크립터(connfd)를 인자로 받음
void echo(int connfd)
{
    size_t n;               // 읽은 바이트 수를 저장할 변수
    char buf[MAXLINE];      // 데이터를 읽어올 버퍼 (한 줄 최대 MAXLINE 크기)
    rio_t rio;              // robust I/O 버퍼 구조체

    // connfd(클라이언트와 연결된 소켓)를 기반으로 rio 구조체 초기화
    Rio_readinitb(&rio, connfd);

    // 클라이언트로부터 한 줄씩 데이터를 계속 읽어들이는 반복문
    while ((n = Rio_readlineb(&rio, buf, MAXLINE)) != 0)
    {
        // 읽은 바이트 수를 서버 로그로 출력
        printf("server received %zu bytes\n", n);

        // 읽은 데이터를 그대로 다시 클라이언트에게 돌려보냄 (Echo!)
        Rio_writen(connfd, buf, n);
    }
}
~~~

## 웹 기초

Web client와 server는 HTTP(Hypertext Transfer Protocol)라고 하는 텍스트 기반 응용수준 프로토콜을 사용해서 상호 연동한다. 

무엇이 FTP 같은 전통적인 파일 전송 서비스를 web service와 구별하게 해주는가?

- 주요 차이점은 web contents는 HTML(Hpertext Markup Language)이라는 언어로 작성될 수 있다는 것이다.

- HTML 프로그램(페이지)은 명령들(태그)을 포함하고 있어서 브라우제에게 여러 가지 텍스트와 그래픽 객체를 페이지에 어떻게 표시할지를 알려준다.

### 웹 컨텐츠

Web client와 server에게, contents는 연관된 MIME(Multipurpose Internet Mail Extensions) 타입을 갖는 바이트 배열이다. 아래는 많이 쓰이는 MIME 타입들이다.

| MIME type | Description |
|:---:|:---:|
| text/html | HTML page |
| text/plain | Unformatted text |
| application/postscript | Postscript document |
| image/gif | Binary image encoded in GIF format |
| image/png | Binary image encoded in PNG format |
| image/jpeg | Binary image encoded in JPEG format |

Web server는 두 가지 서로 다른 방법으로 client에게 contents를 제공한다.

- 디스크 파일을 가져와서 그 내용을 client에게 보낸다. 디스크 파일은 정적 컨텐츠라고 하며, 파일을 client에게 돌려주는 작업은 정적 컨텐츠 처리한다고 말한다.

- 실행파일을 돌리고, 그 출력을 client에게 보낸다. 실행파일이 런타임에 만든 출력을 동적 컨텐츠라고 하며, 프로그램을 실행하고 그 결과를 client에게 보내주는 과정을 동적 컨텐츠 처리한다고 말한다.

Web server가 return하는 모든 내용들은 server가 관리하는 file에 연관된다. 이 파일 각각은 URL(Universal Resource Locator)라고 하느 고유의 이름을 가진다. 예를 들어, 다음과 같은 URL은 

~~~url
https://www.google.com:80/index.html
~~~

포트 80에서 듣고있는 웹 서버가 관리하는 인터넷 호스트 www.google.com의 /index.html이라는 HTML 파일을 지정한다.

여기서 접두어는 

~~~url
https://www.google.com:80
~~~

이고, 접두어를 통해 어떤 종류의 서버에 접속해야 하는지 결정하고, 어디에 서버가 있는지, 서버가 무슨 포트를 듣고 있는지를 결정한다.

접미어는

~~~url
/index.html
~~~

이며, 자신의 파일 시스템 상의 파일을 검색하고, 이 요청이 정적 또는 동적 컨텐츠에 대한 것인지 결정한다.

실행파일을 위한 URL은 파일 이름 뒤에 프로그램의 인자를 포함할 수 있다. '?' 문자는 파일 이름과 인자를 구분하며, 각 인자는 '&'로 구분된다. 예를 들어, 다음의 URL은

~~~url
hppts://bluefish.ics.cs.cmu.edu:8000/cgi-bin/adder?15000&213
~~~

/cgi-bin/adder라는 실행파일을 식별하고, 이 파일은 두 개의 인자(15000과 213)와 함께 호출된다.

### 동적 컨텐츠의 처리

여기는 다시 한번 공부해보자.

## 소형 웹 서버(Tiny web server)

작은 웹 서버를 C와 html로 구현해보자

~~~c
/* $begin tinymain */
/*
 * tiny.c - A simple, iterative HTTP/1.0 Web server that uses the
 *     GET method to serve static and dynamic content.
 *
 * Updated 11/2019 droh
 *   - Fixed sprintf() aliasing issue in serve_static(), and clienterror().
 */
#include "csapp.h"

void doit(int fd);
void read_requesthdrs(rio_t *rp);
int parse_uri(char *uri, char *filename, char *cgiargs);
void serve_static(int fd, char *filename, int filesize);
void get_filetype(char *filename, char *filetype);
void serve_dynamic(int fd, char *filename, char *cgiargs);
void clienterror(int fd, char *cause, char *errnum, char *shortmsg,
                 char *longmsg);

int main(int argc, char **argv)
{
  int listenfd, connfd;
  char hostname[MAXLINE], port[MAXLINE];
  socklen_t clientlen;
  struct sockaddr_storage clientaddr;

  /* Check command line args */
  if (argc != 2)
  {
    fprintf(stderr, "usage: %s <port>\n", argv[0]);
    exit(1);
  }

  listenfd = Open_listenfd(argv[1]);
  while (1)
  {
    clientlen = sizeof(clientaddr);
    connfd = Accept(listenfd, (SA *)&clientaddr,
                    &clientlen); // line:netp:tiny:accept
    Getnameinfo((SA *)&clientaddr, clientlen, hostname, MAXLINE, port, MAXLINE,
                0);
    printf("Accepted connection from (%s, %s)\n", hostname, port);
    doit(connfd);  // line:netp:tiny:doit
    Close(connfd); // line:netp:tiny:close
  }
}

void doit(int fd)
{ // fd : 클라이언트 소켓 파일 디스크립터(웹브라우저 연결)
  // 이 함수를 통해 요청을 읽고 응답을 보내는 한 사이클이 이루어짐.

  // 변수 선언
  int is_static;    // 정적인 파일 요청인지 여부
  struct stat sbuf; // stat()으로 얻는 파일 정보 구조체
  char buf[MAXLINE], method[MAXLINE], uri[MAXLINE], version[MAXLINE];
  // buf : 전체 요청 줄 저장
  //  method : GET, POST 같은 요청 방식
  //  uri : 요청된 자원경로 ex) index.html
  char filename[MAXLINE], cgiargs[MAXLINE];
  // filename : 실제 서버 상의 파일경로
  // cgiargs : CGI 프로그램에 넘길 인자
  rio_t rio;

  // 클라이언트 요청 한줄읽기
  Rio_readinitb(&rio, fd);
  Rio_readlineb(&rio, buf, MAXLINE);
  printf("Request line: %s", buf);
  printf("%s", buf);
  // HTTP 요청의 첫줄은 이런 형태 : GET /index.html HTTP/1.1.
  // 이 줄을 buf에 저장한다.

  // 요청 파싱  파싱 : 어떤 문자열 데이터를 구조적으로 쪼개서 의미를 이해하는 과정
  sscanf(buf, "%s %s %s", method, uri, version);

  // GET이외의 메서드는 거절한다
  if (strcasecmp(method, "GET"))
  {
    clienterror(fd, method, "501", "Not inplemented", "Tiny does not implement this method");
    return;
  } // 대소문자 구분 없이 "GET"인지 확인, POST,PUT 등이 오면 501 에러 반환

  // 요청 헤더 읽기
  read_requesthdrs(&rio); // 나머지 요청 헤더들을 읽고 무시함

  // URI 파싱(정적VS동적)
  is_static = parse_uri(uri, filename, cgiargs);
  // ex) index,html -> 정적 | cgi-bin/adder?arg1=1&arg2=2 -> 동적
  //  filename : 실제 서버 경로로 바뀜 | cgiargs : CGI 인자 저장

  // 파일 존재 확인
  if (stat(filename, &sbuf) < 0)
  {
    clienterror(fd, filename, "404", "Not found", "Tiny couldn't find this file");
    return; // 파일이 없으면 404 Not Found
  }
  // 정적 파일 제공
  if (is_static)
  {
    if (!(S_ISREG(sbuf.st_mode)) || !(S_IRUSR & sbuf.st_mode))
    {
      clienterror(fd, filename, "403", "Forbidden", "Tiny couldn't read the file");
      return; // 정적 파일이 일반 파일인지, 읽을 수 있는지 확인
    }
    serve_static(fd, filename, sbuf.st_size);
    // serve_static()으로 파일 전송
  }
  else
  { // CGI 프로그램 실행
    if (!(S_ISREG(sbuf.st_mode)) || !(S_IXUSR & sbuf.st_mode))
    {
      clienterror(fd, filename, "403", "Forbidden", "Tiny couldn't run the CGI program");
      return; // 실행 가능한 CGI 프로그램인지 확인
    }
    serve_dynamic(fd, filename, cgiargs);
    // serve_dynamic()으로 CGI 실행 후 결과 전송
  }
}
// 함수 헤더 ,이 함수는 에러 응답을 만드는 데 필요한 모든 정보를 받아서 사용한다.
void clienterror(int fd, char *cause, char *errnum, char *shortmsg, char *longmsg)
{
  // fd:클라이언트와 연결된 소켓, cause:에러 원인 ex파일이름 , errnum : 상태코드 ex)404
  // shortmsg:짧은 설명 ex)Not Found , longmsg : 긴 설명 ex) Tiny couldn't find this file
  //  이 함수는 에러 응답을 만드는 데 필요한 모든 정보를 받아서 사용한다.

  char buf[MAXLINE], body[MAXBUF];
  // buf : HTTP 헤더를 담는 용도 | body : HTML 본문(에러 메세지 페이지)

  // HTML 본문(body) 작성
  sprintf(body, "<html><title>Tiny Error</title>");
  sprintf(body, "%s<body bgcolor=\"ffffff\">\r\n", body);
  sprintf(body, "%s%s: %s\r\n", body, errnum, shortmsg);
  sprintf(body, "%s<p>%s: %s\r\n", body, longmsg, cause);
  sprintf(body, "%s<hr><em>The Tiny Web server</em>\r\n", body);
  // HTML 페이지를 한 줄씩 누적해서 작성

  // HTTP헤더와 본문을 출력
  sprintf(buf, "HTTP/1.0 %s %s\r\n", errnum, shortmsg);
  Rio_writen(fd, buf, strlen(buf));
  // HTTP/1.0 404 Not Found 같은 상태 줄 출력
  sprintf(buf, "Content-type: text/html\r\n");
  Rio_writen(fd, buf, strlen(buf));
  // Content-type은 text/html(브라우저가 HTML로 렌더링 하도록)
  sprintf(buf, "Content-length: %d\r\n\r\n", (int)strlen(body));
  Rio_writen(fd, buf, strlen(buf));
  // Content-length는 본문 길이
  Rio_writen(fd, body, strlen(body));
  // 마지막에 실제 HTML 본물 출력
}
void read_requesthdrs(rio_t *rp)
{
  //	•	rp: robust I/O 구조체 포인터 (Rio_readlineb 사용을 위한 스트림)
  //  •	역할: HTTP 요청 헤더를 한 줄씩 읽다가 빈 줄 "\r\n"이 나오면 멈춰.
  //  •	이유: HTTP 요청 헤더는 빈 줄로 끝난다는 규칙이 있기 때문.

  // 버퍼 선언
  char buf[MAXLINE];

  // 첫번째 줄 읽기
  Rio_readlineb(rp, buf, MAXLINE);

  // 빈 줄까지 반복해서 읽기
  while (strcmp(buf, "\r\n"))
  {                                  // 지금 읽은 줄이 빈 줄인지 확인
    printf("Header: %s",buf);
    Rio_readlineb(rp, buf, MAXLINE); // 빈줄(\r\n)이 나오기 전까지 계속 읽고 출력
    //printf("%s", buf);               // 헤더의 끝 줄은 빈 줄로 표시되므로 이 조건으로 반복 종료
  }
  return;
}
int parse_uri(char *uri, char *filename, char *cgiargs)
{ // 요청된 URI가 정적인지(dynamic인지) 판단하고,해당하는 파일 이름과 CGI 인자를 추출
  //	•	uri: 클라이언트가 요청한 경로 (예: /index.html, /cgi-bin/adder?x=1&y=2)
  //  •	filename: 실제 서버 파일 경로로 변환되어 담길 곳
  //  •	cgiargs: CGI 인자 문자열이 담길 곳
  //  •	리턴값:
  //    •	1이면 정적(static) 콘텐츠
  //    •	0이면 동적(dynamic) 콘텐츠
  char *ptr;
  if (!strstr(uri, "cgi-bin"))
  { // 정적 콘텐츠라면
    //  •	strstr(uri, "cgi-bin")ㄹ이 NULL이면, "cgi-bin"이 없다는 뜻 → 정적 콘텐츠
    //  •	예: /index.html, /images/logo.png 등
    strcpy(cgiargs, "");             // CGI 인자는 없음
    strcpy(filename, ".");           // 현재 디렉터리 기준 시작
    strcat(filename, uri);           // 파일 경로 완성
    if (uri[strlen(uri) - 1] == '/') // URI가 폴더로 끝나면
      strcat(filename, "home.html"); // 기본 파일로 home.html 사용
    return 1;                        // 정적 콘텐츠임을 반환
  }
  else
  {
    ptr = index(uri, '?'); // '?' 위치 찾기 (cgi 인자 구분자)

    if (ptr)
    {                           // 인자가 있는 경우
      strcpy(cgiargs, ptr + 1); // ? 뒤 내용 복사
      *ptr = '\0';              // ? 기준으로 문자열 자르기
    }
    else
    {
      strcpy(cgiargs, ""); // 인자 없음
    }

    strcpy(filename, "."); // 경로 시작
    strcat(filename, uri); // 파일 경로 완성
    return 0;              // 동적 콘텐츠임을 반환
  }
  /*어떤 친구가 웹서버에 와서 무언가를 요청했어.
    •	요청 주소에 "cgi-bin"이 없으면 "파일 보여달라"는 거고,
    •	있으면 "계산 좀 해줘"라는 뜻이야.

  그래서 서버는 이렇게 판단해:
    •	"정적이면, 파일 경로만 만들어주고"
    •	"동적이면, 실행파일이랑 인자도 준비해!"*/
}
void serve_static(int fd, char *filename, int filesize)
{
  // 정적인 파일(HTML, 이미지 등)을 클라이언트에게 보내는 핵심 함수
  /*•	fd: 클라이언트와 연결된 소켓
    •	filename: 클라이언트가 요청한 파일 이름
    •	filesize: 파일 크기 (이미 stat으로 구했음)  */

  // 변수 선언
  int srcfd;                                  // 파일 디스크립터
  char *srcp, filetype[MAXLINE], buf[MAXBUF]; // srcp:메모리에 매핑된 파일 주소
  // filetype : MIME 타입 저장할 버퍼 , buf : 응답 헤더 저장용

  get_filetype(filename, filetype); // MIME 타입 결정
  // •	filetype에 따라 브라우저가 어떻게 해석할지 결정됨 (text/html, image/jpeg 등)

  sprintf(buf, "HTTP/1.0 200 OK\r\n");
  sprintf(buf + strlen(buf), "Server: Tiny Web Server\r\n");
  sprintf(buf + strlen(buf), "Connection: close\r\n");
  sprintf(buf + strlen(buf), "Content-length: %d\r\n", filesize);
  sprintf(buf + strlen(buf), "Content-type: %s\r\n\r\n", filetype);
  //	마지막 줄에 빈 줄 \r\n\r\n은 본문 시작을 알리는 신호
  Rio_writen(fd, buf, strlen(buf)); // 클라이언트로 헤더 전송

  printf("Response headers:\n%s", buf);

  srcfd = Open(filename, O_RDONLY, 0);                        // 파일 열기
  srcp = malloc(filesize);
  if (srcp == NULL) {
      Close(srcfd);
      fprintf(stderr, "Error: malloc failed for file %s (size: %d)\n", filename, filesize);

      // 클라이언트에 HTTP 500 오류 응답 전송
      sprintf(buf, "HTTP/1.0 500 Internal Server Error\r\n");
      sprintf(buf + strlen(buf), "Content-type: text/html\r\n\r\n");
      sprintf(buf + strlen(buf), "<html><body><p>Server error: memory allocation failed.</p></body></html>\r\n");
      Rio_writen(fd, buf, strlen(buf));
      return;
  }

  //srcp = Mmap(0, filesize, PROT_READ, MAP_PRIVATE, srcfd, 0); // 파일을 메모리에 매핑

  Rio_readn(srcfd,srcp,filesize);
  // Mmap : 파일을 메모리에 통째로 올림(성능 좋고 코드 간결함)
  Close(srcfd); // 파일 디스크립터는 닫아도 메모리엔 살아있음

  Rio_writen(fd, srcp, filesize); // 파일 내용을 클라이언트로 전송
  free(srcp);
  //Munmap(srcp, filesize);         // 메모리 해제, 매핑 해제
}
void get_filetype(char *filename, char *filetype)
//  •	확장자를 보고 MIME 타입 결정
//  •	브라우저가 어떻게 렌더링할지를 결정하는 중요한 역할
{
  if (strstr(filename, ".html"))
    strcpy(filetype, "text/html");
  else if (strstr(filename, ".gif"))
    strcpy(filetype, "image/gif");
  else if (strstr(filename, ".mpg"))
    strcpy(filetype, "video/mp4");
  else if (strstr(filename, ".png"))
    strcpy(filetype, "image/png");
  else if (strstr(filename, ".jpg"))
    strcpy(filetype, "image/jpeg");
  else
    strcpy(filetype, "text/plain");
}
void serve_dynamic(int fd, char *filename, char *cgiargs)
{
  //  •	fd: 클라이언트와 연결된 소켓
  //  •	filename: 실행할 CGI 프로그램 경로 (예: ./cgi-bin/adder)
  //  •	cgiargs: CGI 프로그램에 넘겨줄 인자 (예: x=1&y=2)

  // 버퍼와 exec 인자 준비
  char buf[MAXLINE], *emptylist[] = {NULL};
  // buf : HTTP 헤더를 담을 임시 버퍼 | emptylist:execve()함수에서 사용할 프로그램 인자 리스트(여기선없대)

  // HTTP 응답 헤더 전송
  sprintf(buf, "HTTP/1.0 200 OK\r\n");
  Rio_writen(fd, buf, strlen(buf));
  // CGI 프로그램을 실행하기 전에 최소한의 응답 헤더를 먼저 전송
  sprintf(buf, "Server: Tiny Web Server\r\n");
  Rio_writen(fd, buf, strlen(buf));
  // 이후에 실제 프로그램의 출력 stdout이 이어짐

  // 자식 프로세스 생성 후 CGI 실행
  if (Fork() == 0){  // 자식 프로세스 | fork()로 새 프로세스를 생성
    setenv("QUERY_STRING", cgiargs, 1);   // 환경 변수 설정 (인자 전달) | adder.c에서 사용하는 getenv("QUERY_STRING")가능하게 설정
    Dup2(fd, STDOUT_FILENO);              // Dup2()를 통해 stdout을 클라이언트 소켓으로 리다이렉션
    Execve(filename, emptylist, environ); // Execve()로 CGI 실행 (출력은 fd로 감) , 실행되면 그 아래 코드는 실행 안됨
  }
  Wait(NULL); //부모 프로세스는 자식이 끝날 때 까지 기다림(좀비 프로세스 방지)
}
~~~

~~~html
<html>
<head><title>test</title></head>
<body> 
<img align="middle" src="godzilla.gif">
<br>
<br>
Dave O'Hallaron
</body>
</html>

~~~

이렇게 구현하라고 책에 나와 있었고 여기에 동영상 파일을 넣으라는 과제가 있어서 진행했다. 바뀐 부분은 아래와 같다.

tiny.c 파일에 아래와 같은 코드를 추가하고
~~~c
    strcpy(filetype, "video/mp4");
  else if (strstr(filename, ".png"))
~~~

html 파일에는 아래와 같은 코드와 videoplayback.mp4파일을 디렉토리에 저장했다.
~~~html
<video width="320" height="240" controls>
  <source src="videoplayback.mp4" type="video/mp4">
~~~

## 소형 웹 서버(Tiny web server) + 프록시 서버

Tiny 서버 구현 후 프록시 서버도 구현하라는 과제가 주어졌어서, 프록시에 대한 개념을 먼저 알아보았다.

### 웹 프록시란?

웹 브라우저와 웹 서버 사이에 중간자 역할을 하는 프로그램이다. 브라우저는 직접 서버에 요청하지 않고, 프록시 서버에 요청을 보낸다. 프록시는 그 요청을 웹 서버로 전달하고, 받은 응답을 다시 브라우저에게 돌려주며 마무리.

## 프록시 서버

프록시 서버에서 사용할 코드는 아래와 같이 나왔다.

~~~c
#include "csapp.h"

#define MAX_CACHE_SIZE 1049000
#define MAX_OBJECT_SIZE 102400

static const char *user_agent_hdr =
    "User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:10.0.3) Gecko/20120305 "
    "Firefox/10.0.3\r\n";

void doit(int connfd);
int parse_uri(char *uri, char *hostname, char *path, char *port);
void build_http_header(char *http_header, char *hostname, char *path);

int main(int argc, char **argv) {
    int listenfd, connfd;
    socklen_t clientlen;
    struct sockaddr_storage clientaddr;
    char port[10], host[MAXLINE];

    if (argc != 2) {
        fprintf(stderr, "Usage: %s <port>\n", argv[0]);
        exit(1);
    }

    listenfd = Open_listenfd(argv[1]);
    while (1) {
        clientlen = sizeof(clientaddr);
        connfd = Accept(listenfd, (SA *)&clientaddr, &clientlen);
        Getnameinfo((SA *)&clientaddr, clientlen, host, MAXLINE, port, MAXLINE, 0);
        printf("Accepted connection from (%s, %s)\n", host, port);
        doit(connfd);
        Close(connfd);
    }
}

void doit(int connfd) {
    char buf[MAXLINE], method[MAXLINE], uri[MAXLINE], version[MAXLINE];
    char hostname[MAXLINE], path[MAXLINE], port[10];
    char http_header[MAXLINE];
    rio_t rio_client, rio_server;
    int serverfd;

    Rio_readinitb(&rio_client, connfd);
    if (!Rio_readlineb(&rio_client, buf, MAXLINE)) return;
    sscanf(buf, "%s %s %s", method, uri, version);

    // URI 앞 '/' 제거 ("/http://..." → "http://...")
    if (uri[0] == '/')
        memmove(uri, uri + 1, strlen(uri));

    printf("Received URI: %s\n", uri);

    if (strcasecmp(method, "GET")) {
        printf("Proxy does not implement the method %s\n", method);
        return;
    }

    if (parse_uri(uri, hostname, path, port) < 0) {
        printf("URI parsing failed: %s\n", uri);
        return;
    }

    build_http_header(http_header, hostname, path);
    serverfd = Open_clientfd(hostname, port);
    if (serverfd < 0) {
        printf("Connection to server %s:%s failed.\n", hostname, port);
        return;
    }

    Rio_readinitb(&rio_server, serverfd);
    Rio_writen(serverfd, http_header, strlen(http_header));

    size_t n;
    while ((n = Rio_readlineb(&rio_server, buf, MAXLINE)) > 0) {
        Rio_writen(connfd, buf, n);
    }
    Close(serverfd);
}

int parse_uri(char *uri, char *hostname, char *path, char *port) {
  char *hostbegin, *pathbegin, *portpos;
  
  if (strncasecmp(uri, "http://", 7) != 0)
      return -1;

  hostbegin = uri + 7;
  pathbegin = strchr(hostbegin, '/');

  if (pathbegin) {
      strcpy(path, pathbegin);
  } else {
      strcpy(path, "/");
  }

  // 이제 host:port만 분리할 수 있게 별도로 복사해놓자
  char hostcopy[MAXLINE];
  if (pathbegin) {
      int len = pathbegin - hostbegin;
      strncpy(hostcopy, hostbegin, len);
      hostcopy[len] = '\0';
  } else {
      strcpy(hostcopy, hostbegin);
  }

  portpos = strchr(hostcopy, ':');
  if (portpos) {
      *portpos = '\0';
      strcpy(hostname, hostcopy);
      strcpy(port, portpos + 1);
  } else {
      strcpy(hostname, hostcopy);
      strcpy(port, "80");
  }

  return 0;
}

void build_http_header(char *http_header, char *hostname, char *path) {
    char buf[MAXLINE];

    sprintf(http_header, "GET %s HTTP/1.0\r\n", path);
    sprintf(buf, "Host: %s\r\n", hostname);
    strcat(http_header, buf);
    strcat(http_header, user_agent_hdr);
    strcat(http_header, "Connection: close\r\n");
    strcat(http_header, "Proxy-Connection: close\r\n\r\n");
}
~~~

이거는 시행착오를 겪으며 나온 코드이다. 이거를 구현하기 위해서 AWS EC2 instance 2개를 만들었고, 하나는 tiny server 그리고 하나는 proxy server로 만들었다. 내 컴퓨터로는 client로 사용을 했다. 아래 사진으로 proxy server와 main server가 연결된것을 확인할 수 있다. 

![프록시 서버와 메인 서버 연결](/assets/img/blog/cs/proxytinyconnected.png)

다만 아쉬웠던 점이 하나 있었다. 이렇게 구현을 하면 아래 사진과 같이 메인서버의 주소를 URI로써 넣어줘야 했다.

![메인 서버 URI](/assets/img/blog/cs/mainserveruri.png)

이렇게 되면, 프록시로써의 기능이 없는거 아닌가? 라는 생각을 했고 그걸 바꾸고 싶었다. 그래서 doit함수에서 아래부분을,

~~~c
    if (parse_uri(uri, hostname, path, port) < 0) {
        printf("URI parsing failed: %s\n", uri);
        return;
    }
~~~

아래와 같이 바꾸었다. 이미 AWS EC2 instance를 만들었기 때문에, IP 주소에 대한 정보는 있는 상태였다.

~~~c
  // 고정된 최종 서버 정보
  strcpy(hostname, "15.164.219.65");
  strcpy(port, "8080");
  strcpy(path, uri);  // 예: "/home.html", "/godzilla.jpg"
~~~

이렇게 진행을 해서 아래 사진과 같이 프록시로써의 기능을 충분히 하는것을 확인하였다.

![doit함수 수정 후](/assets/img/blog/cs/afterdoitrevision.png)

## 프록시 서버 쓰레딩과 캐싱 기능 추가

팀원들과 같이 쓰레딩과 캐싱 기능도 추가하였는데, 완성 코드는 아래와 같다.

~~~c
#include "csapp.h"
#include <limits.h>  /* ULONG_MAX 정의를 위해 추가 */

#define MAX_CACHE_SIZE 1049000
#define MAX_OBJECT_SIZE 102400

/* 캐시 구조체 및 관련 데이터 정의 */
typedef struct {
    char *url;          /* 캐시된 URL */
    char *content;      /* 캐시된 웹 객체 내용 */
    size_t content_size; /* 객체 크기 */
    unsigned long timestamp; /* LRU를 위한 타임스탬프 */
    int is_valid;       /* 유효한 캐시 항목인지 여부 */
    int readers;        /* 현재 읽고 있는 스레드 수 */
    pthread_rwlock_t rwlock; /* 읽기/쓰기 락 */
} cache_entry_t;

/* 캐시 구조체 */
typedef struct {
    cache_entry_t *entries; /* 캐시 항목 배열 */
    int num_entries;       /* 총 항목 수 */
    int max_entries;       /* 최대 허용 항목 수 */
    size_t current_size;   /* 현재 캐시 크기 (바이트) */
    pthread_mutex_t mutex; /* 캐시 전체 락 */
} cache_t;

/* 전역 캐시 변수 */
cache_t cache;

/* 스레드 함수 인자를 위한 구조체 정의 */
typedef struct {
    int connfd;
} thread_args;

static const char *user_agent_hdr =
    "User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:10.0.3) Gecko/20120305 "
    "Firefox/10.0.3\r\n";

/* 함수 프로토타입 */
void doit(int connfd);
int parse_uri(char *uri, char *hostname, char *path, char *port);
void build_http_header(char *http_header, char *hostname, char *path);
void *thread(void *vargp);

/* 캐시 관련 함수 프로토타입 */
void cache_init(int max_entries);
void cache_free(void);
cache_entry_t *cache_find(char *url);
void cache_add(char *url, char *content, size_t content_size);
void cache_evict_lru(size_t required_size);
unsigned long get_timestamp(void);

int main(int argc, char **argv) {
    int listenfd, connfd;
    socklen_t clientlen;
    struct sockaddr_storage clientaddr;
    char port[10], host[MAXLINE];
    pthread_t tid;
    thread_args *args;

    if (argc != 2) {
        fprintf(stderr, "Usage: %s <port>\n", argv[0]);
        exit(1);
    }

    // SIGPIPE 신호 무시 설정 (연결이 끊어진 소켓에 쓰기 시도할 때 발생)
    Signal(SIGPIPE, SIG_IGN);
    
    // 캐시 초기화 (MAX_CACHE_SIZE / MAX_OBJECT_SIZE 객체의 10배)
    cache_init(100);
    printf("Cache initialized with max size %d bytes\n", MAX_CACHE_SIZE);

    listenfd = Open_listenfd(argv[1]);
    while (1) {
        clientlen = sizeof(clientaddr);
        connfd = Accept(listenfd, (SA *)&clientaddr, &clientlen);
        Getnameinfo((SA *)&clientaddr, clientlen, host, MAXLINE, port, MAXLINE, 0);
        printf("Accepted connection from (%s, %s)\n", host, port);
        
        // 스레드 인자 구조체 할당
        args = (thread_args *)Malloc(sizeof(thread_args));
        args->connfd = connfd;
        
        // 새 스레드 생성하여 클라이언트 요청 처리
        Pthread_create(&tid, NULL, thread, args);
        // 메인 스레드는 바로 다음 연결을 기다림 (connfd를 닫지 않음)
    }
    
    // 여기에 도달하지 않지만 안전을 위해 추가
    cache_free();
    return 0;
}

void doit(int connfd) {
  char buf[MAXLINE], method[MAXLINE], uri[MAXLINE], version[MAXLINE];
  char hostname[MAXLINE], path[MAXLINE], port[10];
  rio_t rio_client;
  int serverfd;

  // 클라이언트 요청 라인 읽기
  Rio_readinitb(&rio_client, connfd);
  if (!Rio_readlineb(&rio_client, buf, MAXLINE)) return;
  printf("Request line: %s", buf);

  // 요청 라인 파싱
  sscanf(buf, "%s %s %s", method, uri, version);

  // GET 요청만 처리
  if (strcasecmp(method, "GET")) {
      printf("Proxy does not implement the method %s\n", method);
      return;
  }

  // URI 파싱하여 hostname, path, port 추출
  if (parse_uri(uri, hostname, path, port) < 0) {
      printf("URI parsing failed: %s\n", uri);
      return;
  }
  
  // 전체 URL을 캐시 키로 사용
  char url_key[MAXLINE];
  sprintf(url_key, "http://%s:%s%s", hostname, port, path);
  
  // 캐시에서 URL 검색
  cache_entry_t *entry = cache_find(url_key);
  if (entry) {
      // 캐시 히트: 캐시된 내용을 클라이언트에게 전송
      printf("Cache hit for %s\n", url_key);
      Rio_writen(connfd, entry->content, entry->content_size);
      cache_read_complete(entry);
      return;
  }
  
  // 캐시 미스: 서버에 요청
  printf("Cache miss for %s\n", url_key);
  
  // 서버 연결
  serverfd = Open_clientfd(hostname, port);
  if (serverfd < 0) {
      printf("Connection to server %s:%s failed.\n", hostname, port);
      return;
  }
  
  // 서버에 보낼 HTTP 요청 헤더 작성
  char request_hdrs[MAXLINE], host_hdr[MAXLINE], other_hdrs[MAXLINE];
  sprintf(request_hdrs, "GET %s HTTP/1.0\r\n", path);
  
  // 클라이언트 헤더 읽기 및 필요한 헤더 수정 또는 추가
  int is_host_hdr_seen = 0;
  other_hdrs[0] = '\0';
  
  while (Rio_readlineb(&rio_client, buf, MAXLINE) > 0) {
      // 헤더의 끝 확인 (빈 줄)
      if (!strcmp(buf, "\r\n")) break;
      
      // Host 헤더 확인
      if (!strncasecmp(buf, "Host:", 5)) {
          is_host_hdr_seen = 1;
          strcpy(host_hdr, buf);
      }
      // Connection 또는 Proxy-Connection 헤더는 건너뜀
      else if (!strncasecmp(buf, "Connection:", 11) || 
               !strncasecmp(buf, "Proxy-Connection:", 17)) {
          continue;
      }
      // User-Agent 헤더는 건너뜀 (나중에 추가됨)
      else if (!strncasecmp(buf, "User-Agent:", 11)) {
          continue;
      }
      // 그 외 헤더는 그대로 전달
      else {
          strcat(other_hdrs, buf);
      }
  }
  
  // HTTP 요청 헤더 완성
  if (!is_host_hdr_seen) {
      sprintf(host_hdr, "Host: %s\r\n", hostname);
  }
  
  // 최종 HTTP 요청 헤더 조합
  strcat(request_hdrs, host_hdr);
  strcat(request_hdrs, user_agent_hdr);
  strcat(request_hdrs, "Connection: close\r\n");
  strcat(request_hdrs, "Proxy-Connection: close\r\n");
  strcat(request_hdrs, other_hdrs);
  strcat(request_hdrs, "\r\n");  // 헤더의 끝
  
  printf("Forwarding request to server %s:%s\n%s", hostname, port, request_hdrs);
  
  // 서버에 요청 전송
  rio_t rio_server;
  Rio_readinitb(&rio_server, serverfd);
  Rio_writen(serverfd, request_hdrs, strlen(request_hdrs));
  
  // 서버로부터 응답을 받아 클라이언트에게 전달하고 캐싱
  size_t n;
  size_t total_size = 0;
  char cache_buf[MAX_OBJECT_SIZE];
  int cacheable = 1;  // 객체가 캐시 가능한지 여부
  
  // 응답을 버퍼 단위로 읽어 전달
  while ((n = Rio_readnb(&rio_server, buf, MAXLINE)) > 0) {
      // 클라이언트에게 전송
      Rio_writen(connfd, buf, n);
      
      // 캐시 가능한 크기이면 응답을 캐시 버퍼에 저장
      if (cacheable && total_size + n <= MAX_OBJECT_SIZE) {
          memcpy(cache_buf + total_size, buf, n);
          total_size += n;
      } else if (total_size + n > MAX_OBJECT_SIZE) {
          cacheable = 0;  // 최대 객체 크기를 초과하여 캐시 불가능
      }
  }
  
  // 모든 응답을 받았으면 캐시에 저장
  if (cacheable && total_size > 0) {
      cache_add(url_key, cache_buf, total_size);
      printf("Cached %zu bytes for %s\n", total_size, url_key);
  }
  
  Close(serverfd);
}

int parse_uri(char *uri, char *hostname, char *path, char *port) {
    char *hostbegin, *hostend, *pathbegin;
    
    // URI에 http:// 접두사가 없는 경우 (driver.sh는 완전한 URL을 요구함)
    if (strncasecmp(uri, "http://", 7) != 0) {
        // 이미 경로만 있는 경우 (예: /home.html)
        if (uri[0] == '/') {
            // localhost로 간주하고 기본 경로 사용
            strcpy(hostname, "localhost");
            strcpy(path, uri);
            strcpy(port, "80");
            return 0;
        }
        fprintf(stderr, "Error: Invalid URI format (no http://): %s\n", uri);
        return -1;
    }

    // http:// 이후의 호스트 시작 위치
    hostbegin = uri + 7;
    
    // 경로 부분 찾기 (첫 번째 '/')
    pathbegin = strchr(hostbegin, '/');
    
    if (pathbegin) {
        // 호스트 부분의 마지막 위치
        hostend = pathbegin;
        // 경로 복사
        strcpy(path, pathbegin);
    } else {
        // 경로가 없으면 루트 경로로 설정
        hostend = hostbegin + strlen(hostbegin);
        strcpy(path, "/");
    }

    // 임시 호스트 문자열 생성 및 복사
    char hostcopy[MAXLINE];
    strncpy(hostcopy, hostbegin, hostend - hostbegin);
    hostcopy[hostend - hostbegin] = '\0';

    // 호스트에서 포트 번호 분리
    char *portPos = strchr(hostcopy, ':');
    if (portPos) {
        *portPos = '\0';
        strcpy(hostname, hostcopy);
        strcpy(port, portPos + 1);
    } else {
        strcpy(hostname, hostcopy);
        strcpy(port, "80");
    }

    printf("Parsed URI - Host: '%s', Path: '%s', Port: '%s'\n", hostname, path, port);
    return 0;
}

void build_http_header(char *http_header, char *hostname, char *path) {
    char buf[MAXLINE];

    sprintf(http_header, "GET %s HTTP/1.0\r\n", path);
    sprintf(buf, "Host: %s\r\n", hostname);
    strcat(http_header, buf);
    strcat(http_header, user_agent_hdr);
    strcat(http_header, "Connection: close\r\n");
    strcat(http_header, "Proxy-Connection: close\r\n\r\n");
}

/* 스레드 함수 구현 */
void *thread(void *vargp) {
    thread_args *args = (thread_args *)vargp;
    int connfd = args->connfd;
    
    // 스레드를 detach 상태로 만들어 자원을 자동으로 반환하도록 함
    Pthread_detach(pthread_self());
    
    // 메모리 누수 방지를 위해 할당된 인자 구조체 해제
    Free(vargp);
    
    // 클라이언트 요청 처리
    doit(connfd);
    
    // 연결 종료
    Close(connfd);
    
    return NULL;
}

/* 캐시 초기화 함수 */
void cache_init(int max_entries) {
    cache.entries = (cache_entry_t *)Calloc(max_entries, sizeof(cache_entry_t));
    cache.num_entries = 0;
    cache.max_entries = max_entries;
    cache.current_size = 0;
    pthread_mutex_init(&cache.mutex, NULL);
    
    for (int i = 0; i < max_entries; i++) {
        cache.entries[i].is_valid = 0;
        cache.entries[i].url = NULL;
        cache.entries[i].content = NULL;
        cache.entries[i].content_size = 0;
        cache.entries[i].timestamp = 0;
        cache.entries[i].readers = 0;
        pthread_rwlock_init(&cache.entries[i].rwlock, NULL);
    }
}

/* 캐시 해제 함수 */
void cache_free(void) {
    pthread_mutex_lock(&cache.mutex);
    for (int i = 0; i < cache.max_entries; i++) {
        if (cache.entries[i].is_valid) {
            Free(cache.entries[i].url);
            Free(cache.entries[i].content);
        }
        pthread_rwlock_destroy(&cache.entries[i].rwlock);
    }
    Free(cache.entries);
    pthread_mutex_unlock(&cache.mutex);
    pthread_mutex_destroy(&cache.mutex);
}

/* 현재 시간 반환 */
unsigned long get_timestamp(void) {
    struct timeval tv;
    gettimeofday(&tv, NULL);
    return tv.tv_sec * 1000000 + tv.tv_usec;
}

/* 캐시에서 URL에 해당하는 항목 찾기 */
cache_entry_t *cache_find(char *url) {
    pthread_mutex_lock(&cache.mutex);
    for (int i = 0; i < cache.max_entries; i++) {
        if (cache.entries[i].is_valid && strcmp(cache.entries[i].url, url) == 0) {
            // 읽기 락 획득
            pthread_rwlock_rdlock(&cache.entries[i].rwlock);
            // 타임스탬프 갱신
            cache.entries[i].timestamp = get_timestamp();
            pthread_mutex_unlock(&cache.mutex);
            return &cache.entries[i];
        }
    }
    pthread_mutex_unlock(&cache.mutex);
    return NULL;
}

/* 캐시 항목 읽기 완료 */
void cache_read_complete(cache_entry_t *entry) {
    pthread_rwlock_unlock(&entry->rwlock);
}

/* LRU 정책에 따라 캐시에서 항목 제거 */
void cache_evict_lru(size_t required_size) {
    unsigned long min_timestamp = ULONG_MAX;
    int lru_index = -1;

    // 가장 오래 사용되지 않은 항목 찾기
    for (int i = 0; i < cache.max_entries; i++) {
        if (cache.entries[i].is_valid && cache.entries[i].timestamp < min_timestamp) {
            min_timestamp = cache.entries[i].timestamp;
            lru_index = i;
        }
    }

    if (lru_index != -1) {
        // 쓰기 락 획득
        pthread_rwlock_wrlock(&cache.entries[lru_index].rwlock);
        
        // 해당 항목의 메모리 해제
        Free(cache.entries[lru_index].url);
        Free(cache.entries[lru_index].content);
        
        // 캐시 항목 무효화
        cache.entries[lru_index].url = NULL;
        cache.entries[lru_index].content = NULL;
        cache.entries[lru_index].is_valid = 0;
        
        // 캐시 크기 갱신
        cache.current_size -= cache.entries[lru_index].content_size;
        cache.num_entries--;
        
        // 쓰기 락 해제
        pthread_rwlock_unlock(&cache.entries[lru_index].rwlock);
    }
}

/* 캐시에 새로운 항목 추가 */
void cache_add(char *url, char *content, size_t content_size) {
    if (content_size > MAX_OBJECT_SIZE) {
        return; // 최대 객체 크기 초과하면 캐시하지 않음
    }

    pthread_mutex_lock(&cache.mutex);

    // 필요한 경우 공간 확보
    while (cache.current_size + content_size > MAX_CACHE_SIZE || cache.num_entries >= cache.max_entries) {
        cache_evict_lru(content_size);
    }

    // 빈 슬롯 찾기
    int empty_slot = -1;
    for (int i = 0; i < cache.max_entries; i++) {
        if (!cache.entries[i].is_valid) {
            empty_slot = i;
            break;
        }
    }

    if (empty_slot == -1) {
        pthread_mutex_unlock(&cache.mutex);
        return; // 빈 슬롯이 없음
    }

    // 쓰기 락 획득
    pthread_rwlock_wrlock(&cache.entries[empty_slot].rwlock);
    
    // 새 항목 초기화
    cache.entries[empty_slot].url = strdup(url);
    cache.entries[empty_slot].content = Malloc(content_size);
    memcpy(cache.entries[empty_slot].content, content, content_size);
    cache.entries[empty_slot].content_size = content_size;
    cache.entries[empty_slot].timestamp = get_timestamp();
    cache.entries[empty_slot].is_valid = 1;
    
    // 캐시 상태 갱신
    cache.current_size += content_size;
    cache.num_entries++;
    
    // 쓰기 락 해제
    pthread_rwlock_unlock(&cache.entries[empty_slot].rwlock);
    pthread_mutex_unlock(&cache.mutex);
}
~~~