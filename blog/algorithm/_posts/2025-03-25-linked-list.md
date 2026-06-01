---
layout: post
title:  "연결 리스트(Linked List)"
date:   2025-03-26
hide_last_modified: true
---

* toc  
{:toc .large-only}

데이터에 순서를 매겨 늘어놓은 자료구조를 ***리스트*** 라고 해. 여기서는 ***연결 리스트***, ***포인터를 이용한 연결 리스트***, ***커서를 이용한 연결 리스트***, ***원형 이중 연결 리스트***에 대해서 다뤄볼거야

## 연결 리스트

구조가 단순한 리스트이며, 아래 그림을 보면 A가 B에게, B가 C에게 차례대로 연락하는 비상 연락망 같은 구조야. 이런 구조에서는 건너뛰거나 뒤돌아 앞 사람에게 연락이 안되지

![연결 리스트 기본 구조](/assets/img/blog/algorithm/연결%20리스트의%20기본%20구조.png)

연결 리스트 각각의 원소를 노드(node)라고 해. 노드 안에는 데이터와 뒤쪽 노드를 가리키는(참조) 포인터(pointer)가 존재해.

- 맨 앞에 있는 노드를 ***머리 노드(head node)***

- 맨 끝에 있는 ***꼬리 노드(tail node)***

- 노드 바로 앞에 있는 노드를 ***앞쪽 노드(predecessor node)***

- 노드 바로 뒤쪽에 있는 노드를 ***뒤쪽 노드(successor node)***

### 배열로 연결 리스트 만들기

![배열로 연결 리스트 만들기](/assets/img/blog/algorithm/배열로연결리스트만들기.png)

위에서 설명했던 연결 리스트를 아래 구현해 봤어. 

- 뒤쪽 노드를 꺼내고 싶다면, 첫번째부터 시작해서 뒤쪽 노드 꺼내기를 이용해 인덱스 1씩 증가시켜서 원소에 접근할수 있어.

- 사진처럼 55의 데이터를 12와 33사이에 넣고 싶다면, 뒤쪽 노드를 하나씩 이동시켜야해. 원소 삭제도 마찬가지로 배열 안의 원소들을 이동시켜야해. 고로 ***데이터 삽입/삭제에 용이하지 않단 것이지***


## 포인터로 연결 리스트 만들기

배열 연결 리스트에서는 인덱스를 1씩 증가시키는 방식을 채택했지만, 이거는 노드마다 뒤쪽 노드를 가리키는 포인터가 포함되도록 구현하는 연결 리스트야. 대신에 클래스 Node를 사용해야해

- 데이터 삽입시, 노드용 인스턴스 생성

- 데이터 삭제시, 노드용 인스턴스 삭제

여기서 Node는 자신과 같은 클래스형의 인스턴스를 참조하기위한 참조용 필드 next를 보유해. 이와 같은 자신과 같은 클래스의 인스턴스를 참조하는 필드가 있는 구조를 ***자기 참조(self-referential)***형이라 해

![같은 클래스의 참조](/assets/img/blog/algorithm/같은클래스의참조.png)

위 사진을 보면, 뒤쪽 포인터 next에는 뒤쪽 노드에 대한 참조를 저장해. 만약 꼬리 노드라면, 뒤쪽 포인터 next에는 None이 저장돼

그러면 이제 포인터로 연결 리스트를 구현하는 함수에 대해서 알아보자

### 노드 클래스 __init__() 함수

노드 클래스 Node의 필드에는 2개가 있어

- data : 데이터(데이터라고 데이터가 아니야! 데이터에 대한 참조일뿐)

- next : 뒤쪽 포인터(뒤쪽 노드에 대한 참조)

예제 : __init__() 함수, 전달받은 data와 next를 해당 필드에 대입. 이때 주목 노드를 보면 next야, next를 생략하면 None으로 들어가.
~~~python
class Node:
    """연결 리스트용 노드 클래스"""

    def __init__(self, data: Any = None, next: Node = None):
        """초기화"""
        self.data = data  # 데이터
        self.next = next  # 뒤쪽 포인터
~~~

### LinkedList 클래스 __init__(), __len__() 함수, + 그 외

LinkedList 클래스 필드에는 3가지가 있어

- no : 리스트에 등록된 노드의 개수

- head : 머리 노드에 대한 참조

- current : 현재 주목하고 있는 노드에 대한 참조, 포인터이기도 해

예제 : __init__() 함수, 노드가 하나도 없는 빈 연결 리스트 생성, 머리 노드를 참조하기 위한 Node형 필드 head에 None 입력한다. 그 이유는 아직 아무 데이터가 없기 때문
~~~python
class LinkedList:
    """연결 리스트 클래스"""

    def __init__(self) -> None:
        """초기화"""
        self.no = 0          # 노드의 개수
        self.head = None     # 머리 노드
        self.current = None  # 주목 노드
~~~

예제 : __len__() 함수, 연결리스트의 개수를 반환하는 함수
~~~python
    def __len__(self) -> int:
        """연결 리스트의 노드 개수를 반환"""
        return self.no
~~~

좀더 나아가 보자, 아래거를 이해하면 Node에 대해서 이해력도 높아질거야

만약에 연결 리스트가 비어 있다면? (no == 0)함수를 사용해도 되겠지만, head가 없을것이기 때문에 아래와 같은 함수로 확인이 가능해
~~~python
head is None
~~~

노드가 1개만일때는? head 말고 더 없을테니까 head의 next값은 참조하고 있는게 없을거야. 그러면 아래와 같아지겠지
~~~python
head.next is None
~~~

그렇다면 노드가 2개일때는? 헤드 뒤에 뒤쪽 노드(successor node) 가 존재할테고 그 노드의 next값은 None이겠지?
~~~python
head.next.next is None
~~~

### LinkedList 클래스 search(), __contains__() 함수

검색 같은 경우 선형 검색(처음부터 차례대로 검색)을 사용

예제 : search() 함수
~~~python
    def search(self, data: Any) -> int:
        """data와 값이 같은 노드를 검색"""
        cnt = 0
        ptr = self.head
        while ptr is not None:
            if ptr.data == data:
                self.current = ptr
                return cnt
            cnt += 1
            ptr = ptr.next
        return -1
~~~

검색이 성공하면, cnt를 반환하고 검색이 실패하면 -1을 반환한다.

예제 : __contains__() 함수
~~~python
    def __contains__(self, data: Any) -> bool:
        """연결 리스트에 data가 포함되어 있는가?"""
        return self.search(data) >= 0
~~~

위 search 함수 사용하는데, self 에 data와 같은 같이 있는지 판단, True or False 반환

### LinkedList 클래스 add_first(), add_last() 함수

예제 : add_first() 함수
~~~python
    def add_first(self, data: Any) -> None:
        """맨 앞에 노드를 삽입"""
        ptr = self.head  # 삽입 전의 머리 노드
        self.head = self.current = Node(data, ptr)
        self.no += 1
~~~

- A포인터에 현재!머리 노드를 저장

- 현재! 머리 노드에 노드(date, ptr(A포인터로써 원래의 머리노드를 참조))가 추가된다.

#### 중요!!!!중요

- 여기서 self.current가 왜 중간에 삽입이 되었을까? 궁금하지 않아? 저 수식(A=B=C)같은 경우에 결국에는 C를 A와 B에 저장하겠다는 거야. 그렇다면 current는 왜 있냐. 가장 마지막에 함수를 쓰면 current값이 update가 될거야. 내가 아래에 더 함수를 더 나열할건데, 아래에 current를 기준으로 함수를 사용해. 이점 알아두면 돼

예제 : add_last() 함수
~~~python
    def add_last(self, data: Any):
        """맨 끝에 노드를 삽입"""
        if self.head is None :    # 리스트가 비어 있으면
            self.add_first(data)  # 맨앞에 노드 삽입
        else:
            ptr = self.head
            while ptr.next is not None:
                ptr = ptr.next  # while문을 종료할 때 ptr은 꼬리 노드를 참조
            ptr.next = self.current = Node(data, None)
            self.no += 1
~~~

- 먼저 리스트가 비어있는지 확인

- ptr is None을 찾을때까지 순차적으로 노드를 탐색

- prt이 None을 갖고있는 ptr.next를 찾았을때, 추가할 노드의 정보(next : None으로)를 대입한다.

- LinkedList의 number를 1추가

### LinkedList 클래스 remove_first(), remove_last() 함수

예제 : remove_first() 함수
~~~python
    def remove_first(self) -> None:
        """머리 노드를 삭제"""
        if self.head is not None:  # 리스트가 비어 있으면
            self.head = self.current = self.head.next
        self.no -= 1
~~~

first 용어를 통해 알겠지만, 머리 노드를 삭제하는 함수이다.

- 먼저 머리 노드가 None이면 안됨

- 머리 노드에 다음 노드 대입

- number 1개 감소


예제 : remove_last() 함수
~~~python
    def remove_last(self):
        """꼬리 노드 삭제"""
        if self.head is not None:
            if self.head.next is None :  # 노드가 1개 뿐이라면
                self.remove_first()      # 머리 노드를 삭제
            else:
                ptr = self.head  # 스캔 중인 노드
                pre = self.head  # 스캔 중인 노드의 앞쪽 노드

                while ptr.next is not None:
                    pre = ptr
                    ptr = ptr.next # while문 종료시 ptr은 꼬리 노드를 참조하고 pre는 맨끝에서 두 번째 노드 참조
                pre.next = None  # pre는 삭제 뒤 꼬리 노드
                self.current = pre
                self.no -= 1
~~~

이번것은 꼬리 노드를 삭제하는 함수이다.

- 먼저 머리 노드가 None이면 안됨

- 머리 노드밖에 없다면, 머리 노드를 삭제한다

- 머리 노드외에도 더 있다면, 임의의 변수 ptr과 pre가 생성됨. 이때 ptr과 pre는 머리 노드임

- ptr.next가 None이 아니라면, pre는 ptr의 값이 되고 ptr은 자기보다 앞 노드를 참조(위에서 보면 알겠지만, 처음에만 pre와 ptr이 같지 나중에는 ptr이 꼬리 노드를 참조하고 pre는 꼬리 노드의 앞쪽 노드이다)

- 이제 알겠지만 pre.next가 None이 되면서 꼬리 노드가 짤리게 돼

- number 1 감소하면서 마무리

### LinkedList 클래스 remove(), remove_current_node() 함수

예제 : remove_last() 함수
~~~python
    def remove(self, p: Node) -> None:
        """노드 p를 삭제"""
        if self.head is not None:
            if p is self.head:       # p가 머리 ​​노드이면
                self.remove_first()  # 머리 노드를 삭제
            else:
                ptr = self.head

                while ptr.next is not p:
                    ptr = ptr.next
                    if ptr is None:
                        return  # ptr은 리스트에 존재하지 않음
                ptr.next = p.next
                self.current = ptr
                self.no -= 1
~~~

특정 노드를 삭제하고 싶다면 remove_last()함수를 써야해

- 먼저 머리 노드가 None이면 안돼, 만약 특정 노득가 머리 노드라면 -> 머리 노드를 삭제

- 먼저 포인터(ptr)을 머리 노드로 지정하고 포인터의 next가 특정 노드가 아니라면, 다음 노드로 넘어감

- 포인터의 next가 특정 노드라면, 포인터의 next를 특정 노드의 next로 바꿔. 쉽게 설명하면, 특정 노드는 뒤에 있고 포인터는 앞에 있으니까 포인터의 넥스트는 특정 노드 뒤쪽 노드 참조로 바꿔 버리는 거지

- 만약에 포인터의 next가 특정 노드로 나온게 없다면 return으로 끝나


예제 : remove_current_node() 함수
~~~python
    def remove_current_node(self) -> None:
        """주목 노드를 삭제"""
        self.remove(self.current)
~~~

이제야 current가 쓰이게 되었네. 아까부터 current가 계속 업데이트 됐었잖아? 업데이트 될때마다 current 값이 바뀌게 되는데, 그 값을 지워버리는 함수야

### LinkedList 클래스 clear(), next() 함수

예제 : clear() 함수
~~~python
    def clear(self) -> None:
        """전체 노드를 삭제"""
        while self.head is not None:  # 전체가 비어 있게 될 때까지
            self.remove_first()       # 머리 노드를 삭제
        self.current = None
        self.no = 0
~~~

모든 노드를 지울때, 쓰는 함수로써 머리 노드가 None이라면 수행이 안되지만, 그렇지 않다면 머리 노드를 계속 삭제한다.

예제 : next() 함수
~~~python
    def next(self) -> bool:
        """주목 노드를 한 칸 뒤로 진행"""
        if self.current is None or self.current.next is None:
            return False  # 진행할 수 없음
        self.current = self.current.next
        return True
~~~

현재 주목 노드(current node)가 None 또는 next가 None이 아니라면 주목노드를 next인 노드로 바꿔

### LinkedList 클래스 print_current_node(), print() 함수

예제 : print_current_node() 함수
~~~python
    def print_current_node(self) -> None:
        """주목 노드를 출력"""
        if self.current is None:
            print('주목 노드가 존재하지 않습니다.')
        else:
            print(self.current.data)
~~~

현재 주목 노드가 None이라면 '주목 노드가 존재하지 않습니다.' 문구를 띄우고, None이 아니라면 현재 주목 노드의 data 값을 print한다

예제 : print() 함수
~~~python
    def print(self) -> None:
        """모든 노드를 출력"""
        ptr = self.head

        while ptr is not None:
            print(ptr.data)
            ptr = ptr.next
~~~

포인터를 먼저 머리노드로 입력 후, 머리 노드 부터 뒤쪽까지 None이 나올때까지 옮겨가면서 data 값을 print한다

### 각 함수 수행 후 주목(current) 노드의 값 정리

| 함수 | 주목 노드 |
|:---:|:---:|
| __init__() | None |
| __len__() | 변화 X |
| search() | 검색 성공시, 검색된 노드 |
| __contains__() | 변화 X |
| add_first() | 머리 노드 |
| add_last() | 꼬리 노드 |
| remove_first() | 머리 노드 |
| remove_last() | 꼬리 노드 |
| remove() | 삭제한 노드의 앞쪽 노드 |
| remove_current_node() | 삭제한 노드의 앞쪽 노드 |
| clear() | None |
| next() | 주목 노드 한칸 뒤로 이동 |
| print_current_node() | 변화 X |
| print() | 변화 X |


## 커서로 연결 리스트 만들기


![커서 연결 리스트](/assets/img/blog/algorithm/커서연결리스트.png)

위 사진을 보면 뒤쪽 포인터는 뒤쪽 노드가 저장되는 원소의 인덱스야. 여기서는 이 포인터를 "커서"라고 칭해. 여기서 A의 뒤쪽 커서 4는 노드 B를 가리키는거지.

***꼬리 노드***의 뒤쪽 커서는 -1이고 ***머리 노드***는 위에 보면 인덱스 1을 기리키니까 A가 머리 노드이지

그렇다면 노드를 추가하면 어떻게 될까

![커서 연결 리스트 원소 추가](/assets/img/blog/algorithm/커서연결리스트원소추가.png)

위 사진 같은 경우 Z가 추가가 된건데, 보면 머리 인덱스값과 6번 인덱스에 값이 추가된것을 확인할 수 있다. 따로 원소들을 대이동할 필요 없다는 것이다.

그러면, 커서로 연결 리스트를 구현하는 함수에 대해 알아보자

### 선형 리스트 클래스 __init__(), __len__() 함수

Null = -1 값을 포함하고 시작해

예제 : 선형 리스트 클래스, init() 함수
~~~python
from __future__ import annotations
from typing import Any, Type

Null = -1

class ArrayLinkedList:
    """선형 리스트 클래스(배열 커서 버전)"""

    def __init__(self, capacity: int):
        """초기화"""
        self.head = Null                   # 머리 노드
        self.current = Null                # 주목 노드
        self.max = Null                    # 사용 중인 맨끝 레코드
        self.deleted = Null                # 프리 리스트의 머리 노드
        self.capacity = capacity           # 리스트의 크기
        self.n = [Node()] * self.capacity  # 리스트 본체
        self.no = 0
~~~

선형 리스트 클래스에는 총 필드가 7개 있어

예제 : len() 함수, 연결리스트의 개수를 반환하는 함수
~~~python
    def __len__(self) -> int:
        """선형 리스트의 노드 수를 반환"""
        return self.no
~~~

### 선형 리스트 클래스 get_insert_index(), delete_index() 함수

예제 : get_insert_index() 함수, 
~~~python
    def get_insert_index(self):
        """다음에 삽입할 레코드의 첨자를 구합니다"""
        if self.deleted == Null:  # 삭제 레코드는 존재하지 않습니다
            if self.max+1 < self.capacity:
                self.max += 1
                return self.max   # 새 레코드를 사용
            else:
                return Null       # 크기 초과
        else:
            rec = self.deleted                # 프리 리스트에서
            self.deleted = self.n[rec].dnext  # 맨 앞 rec를 꺼내기
            return rec
~~~

아직 조사중....


## 원형 이중 연결 리스트의 기반

### 원형 리스트(Circular list)

**원형 리스트(Circular list)**는 연결 리스트의 꼬리 노드가 다시 머리 노드를 가리킨다. 고리 모양으로 늘어선 데이터를 표현하는 데 알맞은 리스트 구조이다.

### 이중 연결 리스트(Doubly linked list)

**이중 연결 리스트(Doubly linked list)**는 기존 연결 리스트의 앞쪽 노드 찾지 못하는 단점을 개선한 리스트 구조이다. 그럼 어떻게 앞쪽 노드로 갈 수 있냐? 기존 next 포인터 뿐만 아니고 previous 포이터도 주어지기 때문에 앞쪽 노드로 갈 수 있다.

| data | 데이터에 대한 참조(임의의 형) |
|:---:|:---:|
| prev | 앞쪽 노드에 대한 참조(앞쪽 포인터 : Node형) |
| next | 뒤쪽 노드에 대한 참조(뒤쪽 포인터 : Node형) |

## 원형 이중 연결 리스트(Circular doubly linked list)

원형 이중 연결 리스트는 원형 리스트와 이중 연결 리스트를 결한한 형태이다

이제 원형 이중 연결 리스트의 함수에 대해 알아보자

### 노드 클래스 __init__() 함수

~~~python
class Node:
    """원형 이중 연결 리스트용 노드 클래스"""

    def __init__(self, data: Any = None, prev: Node = None,
                       next: Node = None) -> None:
        """초기화"""
        self.data = data          # 데이터
        self.prev = prev or self  # 앞쪽 포인터
        self.next = next or self  # 뒤쪽 포인터
~~~

- 원형 이중 연결 리스트용 노드 클래스 Node는 필드 3개(data, prev, next)로 구성됨

- __init__() 함수는 노드의 초기화를 수행하기 위해 매개변수 data, prev, next로 전달받은 값에 해당 필드에 대입.

- prev, next로 전달받은 값이 None이면, prev와 next에 None이 아닌 self 대입

- 그 결과 앞쪽 포인터와 뒤쪽 포인터는 자신의 인스턴스를 참조 → self.prev = self

### DoubleLinkedList 클래스 __init__(), __len__(), is_empty() 함수

~~~python
class DoubleLinkedList:
    """원형 이중 연결 리스트 클래스"""

    def __init__(self) -> None:
        """초기화"""
        self.head = self.current = Node()  # 더미 노드를 생성
        self.no = 0

    def __len__(self) -> int:
        """선형 리스트의 노드 수를 반환"""
        return self.no

    def is_empty(self) -> bool:
        """리스트가 비어 있는가?"""
        return self.head.next is self.head  
~~~

- __init__() 함수는 비어 있는 이중 연결 리스트를 생성. 데이터가 없는 노드를 1개 생성하는 것이다. 이때 prev와 next는 Node의 __init__() 함수 동작으로 자신의 노드를 참조. head와 current가 참조하는 곳은 생성한 더미 노드

- __len__() 함수는 리스트에 등록되어 있는 데이터 개수를 반환

- is_empty() 함수는 리스트가 비어 있는지 확인하는데, 더미 노드의 뒤쪽 포인터 head.next가 더미 노디인 head를 참조하면 비어있는것이 확인된다. True or False로 반환

- 원형 이중 연결 리스트를 나타내는 클래스로 필드 3개로 구성됨

| no | 리스트에서 노드의 개수 |
|:---:|:---:|
| head | 머리 노드에 대한 참조 |
| current | 주목 노드에 대한 참조(주목 포인터) |

### DoubleLinkedList 클래스 search(), __contains__() 함수

~~~python
    def search(self, data: Any) -> Any:
        """data와 값이 같은 노드를 검색"""
        cnt = 0
        ptr = self.head.next  # 현재 스캔 중인 노드
        while ptr is not self.head:
            if data == ptr.data:
                self.current = ptr
                return cnt  # 검색 성공
            cnt += 1
            ptr = ptr.next  # 뒤쪽 노드에 주목
        return -1           # 검색 실패

    def __contains__(self, data: Any) -> bool:
        """연결 리스트에 data가 포함되어 있는가?"""
        return self.search(data) >= 0
~~~

- search() 함수 처음에는 head.next로 시작을 한다. head는 더미 노드이며, 값을 계속 찾다가 한바퀴 돌아오게 될 때 더미노드이자 head에 가게됨다. 이 때 while문에서 탈락한다

- 찾으려는 값을 찾으면 count 값을 반환한다

- __contains__() 함수는 리스트에 데이터와 값이 같은 노드가 존재하는지 판단하는 함수이며, 존재하면 True 그렇지 않으면 False 반환

#### p가 참조하는 노드의 위치 판단하기

| p.prev is head | p는 머리 노드인가? (더미 노드 미포함) |
|:---:|:---:|
| p.prev.prev is head | p는 맨 앞에서 2번째 노드인가? (더미 노드 미포함) |
| p.next is head | p는 꼬리 노드인가? |
| p.next.next is head | p는 맨 끝에서 2번째 노드인가? |

### DoubleLinkedList 클래스 print_current_nod(), print(), print_reverse() 함수

~~~python
    def print_current_node(self) -> None:
        """주목 노드를 출력"""
        if self.is_empty():
            print('주목 노드는 없습니다.')
        else:
            print(self.current.data)

    def print(self) -> None:
        """모든 노드를 출력"""
        ptr = self.head.next  # 더미 노드의 뒤쪽 노드
        while ptr is not self.head:
            print(ptr.data)
            ptr = ptr.next

    def print_reverse(self) -> None:
        """모든 노드를 역순으로 출력"""
        ptr = self.head.prev  # 더미 노드의 앞쪽 노드
        while ptr is not self.head:
            print(ptr.data)
            ptr = ptr.prev
~~~

- print_current_nod() 함수는 주목 노드의 데이터를 출력하는 함수로써 리스트가 비어 있으면 '주목 노드는 없습니다.' 출력

- print() 함수는 리스트의 모든 노드를 맨 앞부터 맨 끝까지 순서대로 출력

- print_reverse() 함수는 모든 노드를 맨 끝부터 맨 앞까지 순서대로 출력

### DoubleLinkedList 클래스 next(), prev() 함수

~~~python
    def next(self) -> bool:
        """주목 노드를 한 칸 뒤로 이동"""
        if self.is_empty() or self.current.next is self.head:
            return False  # 이동할 수 없음
        self.current = self.current.next
        return True

    def prev(self) -> bool:
        """주목 노드를 한 칸 앞으로 이동"""
        if self.is_empty() or self.current.prev is self.head:
            return False  # 이동할 수 없음
        self.current = self.current.prev
        return True
~~~

- next() 함수는 주목 노드를 한 칸 뒤로 이동시키는 함수인데, 리스트가 비어있지 않아야 하고 주목 노드에 뒤쪽 노드가 존재해야 이동한다

- prev() 함수는 주목 노드를 한 칸 앞으로 이동시키는 함수로서 리스트가 비어있지 않아야 하고 주목 노드에 앞쪽 노드가 존재해야 이동한다

### DoubleLinkedList 클래스 add(), add_first(), add_last() 함수

~~~python
    def add(self, data: Any) -> None:
        """주목 노드의 바로 뒤에 노드를 삽입"""
        node = Node(data, self.current, self.current.next) # data, prev, next 순
        self.current.next.prev = node # 다음 노드의 이전값에 자기 자신 저장
        self.current.next = node # 본인의 앞 위치의 next 에 자기 자신 저장
        self.current = node # 주목 노드에 자기 본인 저장 
        self.no += 1

    def add_first(self, data: Any) -> None:
        """맨 앞에 노드를 삽입"""
        self.current = self.head  # 더미 노드 head의 바로 뒤에 삽입
        self.add(data)

    def add_last(self, data: Any) -> None:
        """맨 뒤에 노드를 삽입"""
        self.current = self.head.prev  # 꼬리 노드 head.prev의 바로 뒤에 삽입
        self.add(data)
~~~

- add() 함수는 주목 노드 바로 뒤에 노드를 삽입하는데, 삽입하면서 다음 노드의 prev 값과 이전 노드의 next 값, 그리고 마지막으로 주목노드에 자기 자신을 저장한다

- add_first() 함수는 주목노드를 머리노드로 바꾼 후 맨 앞쪽에 add() 함수 실행

- add_last() 함수는 주목노드를 꼬리노드로 바꾼 후 맨 뒤쪽에 add() 함수 실행

### DoubleLinkedList 클래스 remove_current_node(), remove(p) 함수

~~~python
    def remove_current_node(self) -> None:
        """주목 노드 삭제"""
        if not self.is_empty():
            self.current.prev.next = self.current.next
            self.current.next.prev = self.current.prev
            self.current = self.current.prev
            self.no -= 1
            if self.current is self.head:
                self.current = self.head.next

    def remove(self, p: Node) -> None:
        """노드 p를 삭제"""
        ptr = self.head.next

        while ptr is not self.head:
            if ptr is p:  # p를 발견
                self.current = p
                self.remove_current_node()
                break
            ptr = ptr.next
~~~

- remove_current_node() 함수는 주목 노드를 삭제하는 함수로써 먼저 리스트가 비어있는지 확인한다. 주목 노드의 이전값의 next를 주목노드의 next 값으로 바꾸고 주목 노드의 이후값의 prev를 주목 노드의 이전값으로 저장한다. 그리고 주목노드를 앞쪽 노드로 바꾸고 노드의 수를 1 뺀다. 모든 과정 진행 후에 주목 노드가 머리 노드가 된다면, 주목노드 값을 첫번째 노드로 저장해

- remove(p)함수는 p를 찾을때까지 주목 노드를 update하고 찾았다면 remove_current_node()함수를 수행하게 된다. 만약 못 찾으면 아무일도 일어나지 않게 된다

### DoubleLinkedList 클래스 remove_first(), remove_last(), clear() 함수

~~~python
    def remove_first(self) -> None:
        """머리 노드 삭제"""
        self.current = self.head.next  # 머리 노드 head.next를 삭제
        self.remove_current_node()

    def remove_last(self) -> None:
        """꼬리 노드 삭제"""
        self.current = self.head.prev  # 꼬리 노드 head.prev를 삭제
        self.remove_current_node()

    def clear(self) -> None:
        """모든 노드를 삭제"""
        while not self.is_empty():  # 리스트 전체가 빌 때까지
            self.remove_first()  # 머리 노드를 삭제
        self.no = 0
~~~

- remove_first() 함수는 주목 노드를 맨 앞 노드로 바꾼 후 remove_current_node()함수를 수행

- remove_last() 함수는 주목 노드를 맨 뒤 노드로 바꾼 후 remove_current_node()함수를 수행

- clear() 함수는 모든 노드를 삭제하는 함수로써 모든 노드가 빌 때까지 remove_first() 함수 수행. 수행 후 number 0으로 저장

### DoubleLinkedListIterator 클래스

반복문 수행을 위해서 아래와 같이 Iterator 클래스 사용이 가능해

~~~python
    def __iter__(self) -> DoubleLinkedListIterator:
        """반복자를 반환"""
        return DoubleLinkedListIterator(self.head)

    def __reversed__(self) -> DoubleLinkedListReverseIterator:
        """내림차순 반복자를 반환"""
        return DoubleLinkedListReverseIterator(self.head)

class DoubleLinkedListIterator:
    """DoubleLinkedList의 반복자용 클래스"""

    def __init__(self, head: Node):
        self.head = head
        self.current = head.next

    def __iter__(self) -> DoubleLinkedListIterator:
        return self

    def __next__(self) -> Any:
        if self.current is self.head:
            raise StopIteration
        else:
            data = self.current.data
            self.current = self.current.next
            return data

class DoubleLinkedListReverseIterator:
    """DoubleLinkedList의 내림차순 반복자용 클래스"""

    def __init__(self, head: Node):
        self.head = head
        self.current = head.prev

    def __iter__(self) -> DoubleLinkedListReverseIterator:
        return self

    def __next__(self) -> Any:
        if self.current is self.head:
            raise StopIteration
        else:
            data = self.current.data
            self.current = self.current.prev
            return data
~~~