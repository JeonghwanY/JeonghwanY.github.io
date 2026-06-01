---
layout: post
title:  "해시 테이블(Hash table), 해시법(Hashing)"
date:   2025-03-24
hide_last_modified: true
---

* toc  
{:toc .large-only}


긁어모음, 뒤죽박죽이라는 의미를 가진 해시라는 단어가 파이썬에서는 어떻게 쓰일까.
데이터를 키(key)와 값(value)의 쌍으로 저장하는 자료구조인 딕셔너리(dict) 또는 해시(hashing)를 배워보자. 

해시 테이블에 대해서 먼저 보여주자면, 아래는 그냥 13개의 원소를 갖고 있는는 리스트이고
~~~python
a=[5, 6, 14, 20, 29, 34, 37, 51, 69, 75]
~~~
## 아래는 헤시 테이블이야

| 키 | 5 | 6 | 14 | 20 | 29 | 34 | 37 | 51 | 69 | 75 |
|:---:|:---:|:---:|
| 해시값(13으로 나눈 나머지) | 5 | 6 | 1 | 7 | 3 | 8 | 11 | 12 | 4 | 10 |

만약 위 테이블에 35라는 수를 추가하고 싶을때, 35와 35를 13으로 나눈 나머지인 9가 같이 저장돼

| 키 | 5 | 6 | 14 | 20 | 29 | 34 | 35 | 37 | 51 | 69 | 75 |
|:---:|:---:|:---:|
| 해시값(13으로 나눈 나머지) | 5 | 6 | 1 | 7 | 3 | 9 | 8 | 11 | 12 | 4 | 10 |

이렇게 되면 정렬이 안깨지면서 원소 이동도 필요 없게 되는거지

이렇게 키를 해시값으로 변환하는 과정을 해시 함수(Hash function)라고 하고 해시 테이블에서 만들어진 원소를 버킷(bucket)이라고 한대

### 해시 테이블의 특징은 아래와 같아

- 데이터를 저장할 떄, 키(key: 사슴 느낌)를 해시 함수에 넣어서 나온 결과값(해시값 : 척추동물 느낌)을 기반으로 저장 위치를 정해

- 덕분에 데이터를 빠르게 검색, 삽입, 삭제가 가능 

- 평균 시간 복잡도는 O(1)

- 다양한 자료형을 값으로 쓸 수 있어

- 같은 해시값에 키의 값은 중복될 수 없어서, 같은 값을 넣으면 기존 값이 덮어씌워짐

## 해시 충돌

그렇다면, 다른 가정을 한번 해보자 위 테이블에 18을 추가할때, 나머지인 5가 이미 있잖아? 그런데 괜찮아 왜냐하면 1:1 대응이 아니어도 되거든. 예를 들어, 이름 : 철수 와 이름 : 관수 같은 느낌이지. 1:1이 아닌 n:1로 가져가면 돼. 이렇게 버킷이 중복되는 현상을 충돌(collision)이야

2가지 방법으로 대처가 가능해

- 체인법 : 해시값이 같은 원소를 연결 리스트로 관리

- 오픈 주소법 : 빈 버킷을 찾을 때까지 해시를 반복

만약 충돌이 나지 않게 된다면, 검색/추가/삭제의 시간 복잡도는 모두 O(1)이야. 그렇다고 해시 테이블을 크게 만들면 메모리를 낭비하니 이것도 주의하자.

해시 충돌을 예방하고자 할때 해시 테이블의 크기는 ***소수***로 하자

### 체인법(Chain)

그러면 체인법을 먼저 알아보자. 체인법은 해시값이 같은 데이터를 체인 모양의 연결 리스트로 연결하는 방법이라고 하며, 오픈 해시법(Open hashing)이라고도 한대.

그냥 같은 해시값/버킷에 리스트 구조로 여러 개의 데이터를 저장한다 생각하면 되고, 이 리스트가 너무 길어지면 성능 저하가 발생하니 주의하자.

또한, 해시 함수가 해시 테이블 크기보다 작거나 같은 정수를 고르게 생성해야 해. 그래서 해시 테이블의 크기는 소수를 선호한대, 나눠서 값이 잘 안 떨어지니까?

체인법으로 해시 함수 구현해보기 위해 차근차근 예제를 보자

~~~python
from __future__ import annotations
from typing import Any, Type
import hashlib

class Node:
    """해시를 구성하는 노드"""

    def __init__(self, key: Any, value: Any, next: Node) -> None:
        """초기화"""
        self.key   = key    # 키
        self.value = value  # 값
        self.next  = next   # 뒤쪽 노드를 참조
~~~

Node 클래스는 나도 모르지만, 여기서 배워보자. Node 클래스는 개별 버킷을 나타내고 아래와 같이 3개의 필드가 있어. 키 값에 해시 함수를 적용해 해시값을 구한대.

- key : 키(임의의 자료형)
- value : 값(임의의 자료형)
- next : 뒤쪽 노드를 참조(Node형)


~~~python
class ChainedHash:
    """체인법을 해시 클래스 구현"""

    def __init__(self, capacity: int) -> None:
        """초기화"""
        self.capacity = capacity             # 해시 테이블의 크기를 지정
        self.table = [None] * self.capacity  # 해시 테이블(리스트)을 선언

    def hash_value(self, key: Any) -> int:
        """해시값을 구함"""
        if isinstance(key, int):
            return key % self.capacity
        return(int(hashlib.sha256(str(key).encode()).hexdigest(), 16) % self.capacity)
~~~
ChainedHash 클래스는 필드 2개로만 구성이 돼

- capacity : 해시 테이블의 크기(배열 table의 원소 수)를 가리키고

- table : 해시 테이블을 저장하는 list형 배열을 가리켜

위의 __init__함수 같은 경우 원소 수가 capacity(배열 table의 원소 수)인 list형의 배열 table을 생성하고 모든 원소를 None으로 한다는 얘기야. 해시 테이블의 각 버킷은 맨 앞부터 table[0], table[1], ..., table[capacity-1] 순으로 접근할 수 있다.

지금은 table의 모든 원소는 None이고 버킷은 capacity 만큼 있다.

### hash_value() : 해시 함수 만들기인데, 위 처음에 설명한거처럼 이해해

그런데, key가 int형인 경우와 아닌 경우에 따라서 함수가 변해

- key가 int : key를 해시의 크기 capacity로 나눈 나머지를 해시값

- key != int : 문자열/리스트/클래스형 등은 나눌 수 없기 때문에, 아래 표와 같이 표준 라이브러리로 형 변환을 해야 해시값을 얻을 수가 있어.

| sha256 알고리즘 | hashlib 모듈에서 제공되며, 주어진 바이트 문자열의 해시값을 구하는 해시 알고림의 생성자 |
|:---:|:---:|
| encode() 함수 | hashlib.sha256에 바이트 문자열의 인수를 전달하면, key를 str형 문자열로 변환한 뒤 그 문자열을 encode() 함수에 전달하여 바이트 문자열을 생성한다|
| hexdigest() 함수 | sha256 알고리즘에서 해시값을 16진수 문자열로 꺼냄 |
| int() 함수 | hexdigest() 함수로 꺼낸 문자열을 16진수 int형으로 변환 |

#### 키로 원소를 검색하는 search() 함수

~~~python
    def search(self, key: Any) -> Any:
        """키가 key인 원소를 검색하여 값을 반환"""
        hash = self.hash_value(key)  # 검색하는 키의 해시값
        p = self.table[hash]         # 노드를 노드

        while p is not None:
            if p.key == key:
                 return p.value  # 검색 성공
            p = p.next           # 뒤쪽 노드를 주목

        return None              # 검색 실패
~~~

search 함수는 key인 원소를 검색.

해시값이 동일하고 key 값은 다른 원소중에 제일 마지막에 있는것 찾는다 했을때, 먼저 해시값을 찾고 해시값을 순차적으로 찾아간다.

만약 해시값에 대해 해시테이블에 존재하지 않으면 검색 실패

조금 더 자세하게 알려주면,

- 해시 함수를 사용하여 키를 해시값으로 변환

- 해시값을 인덱스로 하는 버킷에 주목

- 버킷이 참조하는 연결 리스트를 맨 앞부터 차례로 스캔

### 원소를 추가하는 add() 함수

add 함수는 키가 key 이고 값이 value인 원소를 추가한다.

~~~python
    def add(self, key: Any, value: Any) -> bool:
        """키가 key이고 값이 value인 원소를 삽입"""
        hash = self.hash_value(key)  # 삽입하는 키의 해시값
        p = self.table[hash]         # 주목하는 노드

        while p is not None:
            if p.key == key:
                return False         # 삽입 실패
            p = p.next               # 뒤쪽 노드에 주목

        temp = Node(key, value, self.table[hash])
        self.table[hash] = temp      # 노드를 삽입
        return True                  # 삽입 성공
~~~

add함수의 lifecycle을 정리하자면 아래와 같다

- 해시값을 먼저 구한다

- 해시값을 인덱스로 하는 버킷에 주목

- 버킷이 비어 있다면, value를 저장하는 노드 생성/ 버킷이 참조하는 연결 리스트가 있으면, 연결 리스트 맨 앞부터 선형 검색을 진행 -> 키와 같은 값이 발견되면 추가 실패, 그렇지 않고 맨끝까지 같은 키가 없다!? 그러면 해시캆인 리스트의 맨 앞에 노드 추가

### 원소를 삭제하는 remove() 함수

add와는 다르게 값이 value는 보지 않고 키가 key인 원소를 삭제한다

~~~python
    def remove(self, key: Any) -> bool:
        """키가 key인 원소를 삭제"""
        hash = self.hash_value(key)  # 삭제할 키의 해시값
        p = self.table[hash]         # 주목하고 있는 노드
        pp = None                    # 바로 앞 주목 노드

        while p is not None:
            if p.key == key:  # key를 발견하면 아래를 실행
                if pp is None:
                    self.table[hash] = p.next
                else:
                    pp.next = p.next
                return True  # key 삭제 성공
            pp = p
            p = p.next       # 뒤쪽 노드에 주목
        return False         # 삭제 실패(key가 존재하지 않음)
~~~

remove함수의 lifecycle을 정리하자면 아래와 같다

- 해시값을 먼저 구한다

- 해시값을 인덱스로 하는 버킷에 주목

- 버킷이 참조하는 연결 리스트를 맨 앞부터 선형 검색, 키와 같은 값이 발견되면 그 노드를 버킷에서 삭제(삭제한다는 의미는 되쪽 원소에 앞쪽 원소 참조를 넣거나 앞쪽 원소가 없을때, 버킷에 참조를 대입하면 노드는 삭제됨)

- 여기서도 마찬가지로 선형 검색중 키를 못찾으면 삭제 실패

### 원소를 출력하는 dump() 함수

모든 원소를 보고 싶나? 그러면 dump를 사용해보자

~~~python
    def dump(self) -> None:
        """해시 테이블을 덤프"""
        for i in range(self.capacity):
            p = self.table[i]
            print(i, end='')
            while p is not None:
                print(f'  → {p.key} ({p.value})', end='')  # 해시 테이블에 있는 키와 값을 출력
                p = p.next
            print()
~~~

해시 테이블이 지워지진 않는다. table[0] 부터 table[capacity -1] 까지 뒤쪽 노드를 찾아가면서 각 노드의 키와 값을 출력하는 작업 반복. 

이렇게 체인법의 해시 함수들을 나열하였고 이제 오픈 주소법에 대해서 알아보자

## 오픈 주소법(open addressing)

오픈 주소법은 충돌이 발생했을 때 재해시(rehashing)를 수행하여 빈 버킷을 찾는 방법을 말하며 ***닫힌 해시법(closed hashing)*** 이라고 해. 

### 원소 추가하기

~~~python
    def add(self, key: Any, value: Any) -> bool:
        """키가 key이고 값이 value인 요소를 추가"""
        if self.search(key) is not None:
            return False             # 이미 등록된 키

        hash = self.hash_value(key)  # 추가하는 키의 해시값
        p = self.table[hash]         # 버킷을 주목
        for i in range(self.capacity):
            if p.stat == Status.EMPTY or p.stat == Status.DELETED:
                self.table[hash] = Bucket(key, value, Status.OCCUPIED)
                return True
            hash = self.rehash_value(hash)  # 재해시
            p = self.table[hash]
        return False                        # 해시 테이블이 가득 참
~~~

- 쉽게 설명하자면, 충돌이 발생하면 재해시를 위한 해시 함수를 수행해. 만약 또 충돌하면 재해시를 위한 해시 함수를 또 수행하고...

- 이처럼 오픈 주소법은 빈 버킷이 나올 떄까지 재해시를 반복하므로 ***선형 탐사법(linear probing)*** 이라고도 해

- 만약 모든 버킷이 다 찼다면? 그럼 추가하기를 실패해

### 원소 삭제하기

~~~python
    def remove(self, key: Any) -> int:
        """키가 key인 갖는 요소를 삭제"""
        p = self.search_node(key)  # 버킷을 주목
        if p is None:
            return False           # 이 키는 등록되어 있지 않음
        p.set_status(Status.DELETED)
        return True
~~~

- 원소를 삭제하기 전에, ***EMPTY/OCCUPIED/DELETED*** 같은 속성이 오픈 주소법의 버킷에 등록되어 있다는걸 알아야 해

- 키를 못찾으면 실패하고, 키를 찾으면 DELETED 속성을 부여하고 끝나

### 원소 검색하기

~~~python
    def search_node(self, key: Any) -> Any:
        """키가 key인 버킷을 검색"""
        hash = self.hash_value(key)  # 검색하는 키의 해시값
        p = self.table[hash]         # 버킷을 주목

        for i in range(self.capacity):
            if p.stat == Status.EMPTY:
                break
            elif p.stat == Status.OCCUPIED and p.key == key:
                return p
            hash = self.rehash_value(hash)  # 재해시
            p = self.table[hash]
        return None
~~~

- 원소 추가하는것과 비슷하게 처음에는 해시값의 버킷을 검색해. 검색했을때 EMPTY 상태면 실패. 왜냐하면 EMPTY였었다면 추가한적도 없고 삭제한적도 없는데, 뭐하러 더 재해시를 하겠어

- status가 OCCUPIED 이면서 key값이 찾으려는 키값과 같으면, 버킷(인덱스)를 반환해

- 만약 OCCUPIED 이면서 key 값이 다르거나 or DELETED면 뒤쪽으로 순차적으로 검색해


## 마무리

해시법과 해시 테이블같은 경우 동시에 설명해야 하는 내용이라 설명을 순조롭게 못한거 같은데, 다 읽고 한번더 읽으면 괜찮지 않을까 싶다

해시법의 충돌 방지용으로 체인법과 오픈 주소법을 설명했는데, 둘의 특징을 간단하게 정리해본다면 아래와 같을거 같아

| 체인법 | 버킷을 참조하는 노드 제한이 없음 | 제한이 없지만 노드가 많아지면 메모리에 부하가 많이 걸릴 수 있어 |
|:---:|:---:|:---:|
| 오픈 주소법 | 버킷 갯수에 따라서 원소 추가 불가 | 제한은 있지만 메모리 부하 걱정은 덜해도 될거 같아 |