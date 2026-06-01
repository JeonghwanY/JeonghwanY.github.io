---
layout: post
title:  "이진 트리(Binary tree) 와 이진 검색 트리(Binary search tree)"
date:   2025-03-24
categories: algorithm
hide_last_modified: true
---

* toc  
{:toc .large-only}


트리란, 나무 모양과 비슷하다고 하여서 이름이 붙여졌다.

## 트리 용어

트리 용어에 대해 설명할게

- ***노드***와 ***가지***로 구성되며, 가장 위쪽에 있는 노드를 ***루트(root)*** / 가장 아래쪽에 있는 노드를 ***리프(leaf)***

- 비단말 노드 : 리프를 제외한 노드, 내부 노드라고도 함

- 노드 가지 위쪽의 노드는 ***부모*** / 노드 가지 아래쪽의 노드는 ***자식***

- 부모가 같은 노드를 ***형제***

- 어떤 노드에서 위쪽으로 가지를 따라가며 부모보다 높은 노드를 ***조상***이라고 함

- 어떤 노드에서 아래쪽으로 가지를 따라가며 자식보다 낮은 노드는 ***자손***

- ***레벨***이란, 가장 위쪽부터 0으로 시작하고 하나씩 내려갈때마다 1씩 증가

- 자식의 수를 ***차수***라고 하며, 모든 노드의 차수가 n이하인 트리를 ***n진 트리***라고 함

- 높이 : 루트에서 가장 멀리 있는 리프까지의 거리

- 서브트리 : 특정 노드를 루트로 잡고 새롭게 볼때 이런 용어를 씀

- 노드와 가지가 전혀 없는 트리를 ***빈 트리(None tree)*** 또는 ***널 트리(null tree)*** 라고 함

## 순서 트리와 무순서 트리

형제 노드의 순서 관계가 있는지에 따라, 순서 관계가 있으면 순서 트리(ordered tree), 구별하지 않으면 무순서 트리(unordered tree)라고 함.

다른 트리에서 보았을때, 순서 트리로 보면 같지 않지만, 무순서 트리로 보면 같을 수 있다.


### 순서 트리의 검색

2가지로 나뉘게 되는데, 아래와 같다

- 너비 우선 검색(Breadth-first search) : 폭 우선/가로 우선/수평 검색이라고 하며, 낮은 레벨부터 왼쪽에서 오른쪽으로 검색한다. 

- 깊이 우선 검색(Depth-first search) : 세로/수직 검색이라고 하며, 리프에 도달할 때까지 아래쪽으로 내려가면서 검색, 리프에 도달하면 부모에 다시 돌아가 다시 또 내려간다.

***깊이 우선 검색***은 세 종류의 스캔 방법이 있는데, 아래와 같다

- 전위 순회 : 노드 방문 -> 왼쪽 자식 -> 오른쪽 자식

- 중위 순회 : 왼쪽 자식 -> 노드 방문 -> 오른쪽 자식

- 후위 순회 : 왼쪽 자식 -> 오른쪽 자식 -> 노드 방문

## 이진 트리

노드가 왼쪽 자식과 오른쪽 자식만을 갖는 트리를 이진 트리라고 한다. 자식은 하나만 있거나 없어도 된다.

![이진 트리](/assets/img/blog/algorithm/이진트리.png)

- 이진 트리는 왼쪽 자식과 오른쪽 자식을 구분해. ***왼쪽 자식을 루트***로 하는 서브트리를 ***왼쪽 서브트리(left subtree)***, ***오른쪽 자식을 루트***로 하는 서브트리를 ***오른쪽 서브트리(right subtree)***라고 해.

![왼쪽 서브 트리](/assets/img/blog/algorithm/왼쪽서브트리.png)

예제 : 이진 트리(BinaryTree) Class
~~~python
class Node:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

class BinaryTree:
    def __init__(self):
        self.root = None

    # 왼쪽부터 차례대로 빈 자리에 노드를 추가 (완전 이진 트리 형태 유지)
    def insert(self, value):
        new_node = Node(value)
        if not self.root:
            self.root = new_node
            return

        from collections import deque
        queue = deque([self.root])
        while queue:
            node = queue.popleft()
            if not node.left:
                node.left = new_node
                return
            else:
                queue.append(node.left)

            if not node.right:
                node.right = new_node
                return
            else:
                queue.append(node.right)

    def preorder(self, node):
        if node:
            print(node.value, end=' ')
            self.preorder(node.left)
            self.preorder(node.right)

    def inorder(self, node):
        if node:
            self.inorder(node.left)
            print(node.value, end=' ')
            self.inorder(node.right)

    def postorder(self, node):
        if node:
            self.postorder(node.left)
            self.postorder(node.right)
            print(node.value, end=' ')

    def level_order(self):
        from collections import deque
        if not self.root:
            return
        queue = deque([self.root])
        while queue:
            node = queue.popleft()
            print(node.value, end=' ')
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)

    def height(self, node):
        if node is None:
            return -1
        return 1 + max(self.height(node.left), self.height(node.right))
~~~

## 완전 이진 트리

- 그럼 완전 이진 트리는 뭐냐, ***마지막 레벨 제외하고는 모든 노드가 가득 차 있어야 하는데, 이 의미는 자식이 모두 2개씩 있어야 한다는 점이다.***

- 마지막 레벨의 경우에는 왼쪽부터 오른쪽까지 노드가 순차적으로 채워진 경우여야 한다. 이때 모두 다 채우지 않아도 괜찮다

- 높이가 k 인 완전 이진 트리가 가질 수 있는 노드의 수는 최대 ***2^(k+1) - 1*** 이므로, n개의 노드를 저장할 수 있는 완전 이진 트리의 높이는 ***logn***이다.

### 균형 검색 트리

이진 검색 트리 같은 경우 오름차순(1,2,3,4)으로 노드가 삽입되면 트리의 높이가 길어진다. 그러면 선형 리스트 형식으로 되어 빠른 검색이 불가해 지는데, 그거를 방지하고자 높이(O(log n)) 제한 검색트리를 ***균형 검색트리(self-balancing search tree)***라고 해

- 이진 균형 검색 트리 : AVL 트리, 레드-블랙 트리

- 이진X 균형 검색 트리 : B 트리, 2-3 트리

## 이진 검색 트리

이진 검색 트리의 특징은 아래와 같아

- 왼쪽 서브트리 노드의 키값은 자신의 노드 키값보다 작아야 함 → 순서 트리

- 오른쪽 서브트리 노드의 카값은 자신의 노드 키값보다 커야 함 → 순서 트리

- 아쉽게도 완전 이진 트리가 아니야

이러한 특징 덕분에 ***중위순회시*** 노드값을 ***오름차순***으로 얻을 수 있어. 오름차순이면 ***이진 검색***과 같은 방식을 사용할 수 있지

또 구조가 단순하고 구조가 깨지지 않으면서 노드 삽입이 가능해

그러면 이진 검색 트리를 만들어보자

### 이진 검색 트리 노드 클래스 Node, BinarySearchTree 클래스

예제 : 노드 클래스 Node
~~~python
class Node:
    """이진 검색 트리의 노드"""
    def __init__(self, key: Any, value: Any, left: Node = None,
                 right: Node = None):
        """생성자"""
        self.key = key      # 키
        self.value = value  # 값
        self.left = left    # 왼쪽 포인터(왼쪽 자식 참조)
        self.right = right  # 오른쪽 포인터(오른쪽 자식 참조)
~~~

이진 검색 트리는 아래와 같이 4개의 필드로 구성돼. 

- key : 키(임의의 형)
- value : 값(임의의 형)
- left : 왼쪽 자식 노드를 참조(왼쪽 포인터)
- right : 오른쪽 자식 노드를 참조(오른쪽 포인터)

예제 : BinarySearchTree 클래스
~~~python
class BinarySearchTree:
    """이진 검색 트리"""

    def __init__(self):
        """초기화"""
        self.root = None  # 루트
~~~

Root에 None을 대입해 노드가 하나도 없는 빈 상태의 이진 검색 트리 생성

### 이진 검색 트리 search() 함수

~~~python
    def search(self, key: Any) -> Any:
        """키 key를 갖는 노드를 검색"""
        p = self.root           # 루트에 주목
        while True:
            if p is None:       # 더 이상 진행할 수 없으면
                return None     # 검색 실패
            if key == p.key:    # key와 노드 p의 키가 같으면
                return p.value  # 검색 성공
            elif key < p.key:   # key 쪽이 작으면
                p = p.left      # 왼쪽 서브 트리에서 검색
            else:               # key 쪽이 크면
                p = p.right     # 오른쪽 서브 트리에서 검색
~~~

코드를 보면 알겠지만, 가장 맨위의 root를 보고 왼쪽으로 갈지, 오른쪽으로 갈지 정함.

![이진 검색 트리 검색 성공](/assets/img/blog/algorithm/이진검색트리검색성공.png)

먼저 위의 사진은 성공 예시인데, 3을 찾는 예시이다. 성공하면 3을 반환한다

![이진 검색 트리 검색 실패](/assets/img/blog/algorithm/이진검색트리검색실패.png)

위 사진 같은 경우 실패 예시인데, 8을 찾는 예시이다. 실패하면 None을 반환한다

### 이진 검색 트리 add() 함수

~~~python
    def add(self, key: Any, value: Any) -> bool:
        """키가 key이고, 값이 value인 노드를 삽입"""

        def add_node(node: Node, key: Any, value: Any) -> None:
            """node를 루트로 하는 서브 트리에 키가 key이고, 값이 value인 노드를 삽입"""
            if key == node.key:
                return False  # key가 이진검색트리에 이미 존재
            elif key < node.key:
                if node.left is None:
                    node.left = Node(key, value, None, None)
                else:
                    add_node(node.left, key, value)
            else:
                if node.right is None:
                    node.right = Node(key, value, None, None)
                else:
                    add_node(node.right, key, value)
            return True

        if self.root is None:
            self.root = Node(key, value, None, None)
            return True
        else:
            return add_node(self.root, key, value)
~~~

노드 삽입시 이진 검색 트리의 조건을 유지해야 한다. 그래서 검색할 떄와 마찬가지로 삽입할 위치를 찾아낸 후 수행된다.

![이진 검색 트리 삽입](/assets/img/blog/algorithm/이진검색트리삽입.png)

사진을 보면 이해가 잘 될것이다. 

- 처음에는 중복 값 확인이 진행되며, 함수가 반복될때마다 진행된다. 중복되면 삽입 실패

- 이후에는 검색과 동일하게 흘러가는데, 마지막에 삽입이 진행된다

- 마지막 if문 충족조건을 보면 Node가 없는 빈 상태일 때 진행되는데, 왼쪽/오른쪽 포인터를 None인 Node를 생성한뒤 그 노드를 루트가 참조하다록 한다

### 이진 검색 트리 remove() 함수

~~~python
    def remove(self, key: Any) -> bool:
        """키가 key인 노드를 삭제"""
        p = self.root           # 스캔 중인 노드
        parent = None           # 스캔 중인 노드의 부모 노드
        is_left_child = True    # p는 parent의 왼쪽 자식 노드인지 확인

        while True:
            if p is None:       # 더 이상 진행할 수 없으면
                return False    # 그 키는 존재하지 않음

            if key == p.key:    # key와 노드 p의 키가 같으면
                break           # 검색 성공
            else:
                parent = p                  # 가지를 내려가기 전에 부모를 설정
                if key < p.key:             # key 쪽이 작으면
                    is_left_child = True    # 여기서 내려가는 것은 왼쪽 자식
                    p = p.left              # 왼쪽 서브 트리에서 검색
                else:                       # key 쪽이 크면
                    is_left_child = False   # 여기서 내려가는 것은 오른쪽 자식
                    p = p.right             # 오른쪽 서브 트리에서 검색

        if p.left is None:                  # p에 왼쪽 자식이 없으면
            if p is self.root:
                self.root = p.right
            elif is_left_child:
                parent.left = p.right       # 부모의 왼쪽 포인터가 오른쪽 자식을 가리킴
            else:
                parent.right = p.right      # 부모의 오른쪽 포인터가 오른쪽 자식을 가리킴
        elif p.right is None:               # p에 오른쪽 자식이 없으면
            if p is self.root:
                self.root = p.left
            elif is_left_child:
                parent.left = p.left        # 부모의 왼쪽 포인터가 왼쪽 자식을 가리킴
            else:
                parent.right = p.left       # 부모의 오른쪽 포인터가 왼쪽 자식을 가리킴
        else:
            parent = p
            left = p.left                   # 서브 트리 안에서 가장 큰 노드
            is_left_child = True
            while left.right is not None:   # 가장 큰 노드 left를 검색
                parent = left
                left = left.right
                is_left_child = False

            p.key = left.key                # left의 키를 p로 이동
            p.value = left.value            # left의 데이터를 p로 이동
            if is_left_child:
                parent.left = left.left     # left를 삭제
            else:
                parent.right = left.left    # left를 삭제
        return True
~~~

함수 길이가 많이 길어.. 이유는 삭제와 동시에 구조를 바꿔야 하기 때문인데, 최대한 짧게 설명해 볼게

먼저 key값을 찾아야 하고 key값을 찾을때마다 parent와 is_left_child가 update돼. p와 key가 같다면, p의 부모는 parent가 되고 왼쪽 자식이면 is_left_child=True / 오른쪽 자식이면 False가 돼

- 큰 두번째 if문을 가보면 왼쪽 자식이 None인지에 대한 조건이야. p가 루트 노드였다면, p.right이 머리 노드가 돼. p가 parent의 왼쪽 자식이었다면, parent.left가 p.right이 돼. p가 parent의 오른쪽 자식이었다면, parent.right가 p.right이 돼

- 큰 세번째 elif 문을 가보면 왼쪽 자식이 있고 오른쪽 자식이 없을때 해당 조건문에 들어가. p가 루트 노드였다면, 루트 노드를 p.left로 바꿔. p가 parent의 왼쪽 자식이었다면, parent.left가 p.left가 돼. p가 parent의 오른쪽 자식이었다면, parent.right가 p.left가 돼

- 마지막 else문이 관건이야. p가 2명의 자식을 보유하고 있을때의 조건이지. 이때부터 parent/left/is_left_child가 계속 업데이트 될건데, left가 오른쪽 자식이 없을때까지 update(left는 오른쪽으로 이동)될거야. left의 오른쪽 자식이 없다면, while 문을 빠져나와. p에다가 left 값을 넣고 left 값에 pdml 값을 넣어서 교환을 해. 그 다음에 left가 왼쪽 자식이라면, parent.left를 left.left로 바꿔(left 삭제). left가 오른쪽 자식이라면, parent.right를 left.left로 바꿔(left 삭제)

- ***마지막에서 왼쪽 갔다가 계속 오른쪽으로 가는 이유***는 : p값 보다는 작은데(left), p값에 가장 가까운(right)값을 찾으려는 이유야

### 이진 검색 트리 dump() 함수

~~~python
    def dump(self) -> None:
        """덤프(모든 노드를 키의 오름차순으로 출력)"""

        def print_subtree(node: Node):
            """node를 루트로 하는 서브 트리의 노드를 키의 오름차순으로 출력"""
            if node is not None:
                print_subtree(node.left)            # 왼쪽 서브 트리를 오름차순으로 출력
                print(f'{node.key}  {node.value}')  # node를 출력
                print_subtree(node.right)           # 오른쪽 서브 트리를 오름차순으로 출력

        print_subtree(self.root)
~~~

위에서 ***중위순회*** 언급을 했었는데, dump() 함수도 마찬가지로 중위순회로 오름차순 값을 print한다.

만약에 여기서 오름차순이 아닌 내림차순으로 출력하고 싶다면? 아래처럼 right를 먼저 작성하고 left를 맨 뒤쪽에 빼면 된다

~~~python
    def dump(self) -> None:
        """덤프(모든 노드를 키의 내림림차순으로 출력)"""

        def print_subtree(node: Node):
            """node를 루트로 하는 서브 트리의 노드를 키의 내림림차순으로 출력"""
            if node is not None:
                print_subtree(node.right)            # 오른쪽 서브 트리를 내림차순으로 출력
                print(f'{node.key}  {node.value}')  # node를 출력
                print_subtree(node.left)           # 왼쪽 서브 트리를 내림차순으로 출력

        print_subtree(self.root)
~~~

### 이진 검색 트리 min_key(), max_key() 함수

예제 : min_key() 함수
~~~python
    def min_key(self) -> Any:
        """가장 작은 키"""
        if self.root is None:
            return None
        p = self.root
        while p.left is not None:
            p = p.left
        return p.key
~~~

맨 왼쪽 자손을 찾아서 그 값을 반환한다. root 노드가 없으면 None 반환

예제 : max_key() 함수
~~~python
    def max_key(self) -> Any:
        """가장 큰 키"""
        if self.root is None:
            return None
        p = self.root
        while p.right is not None:
            p = p.right
        return p.key
~~~

맨 오른쪽 자손을 찾아서 그 값을 반환한다. root 노드가 없으면 None 반환