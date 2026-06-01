---
layout: post
title:  "그래프(Graph)"
date:   2025-03-28
hide_last_modified: true
---

* toc  
{:toc .large-only}

## 그래프(Graph) 자료구조에 사용되는 용어 

vertex, edge, node, arc에 대해 설명하고자 해

### Vertex(정점)

- 그래프에서의 '점', 즉 개체 하나하나를 의미함.

- 예: 사람, 도시, 웹페이지 등

- 예시 코드에서: 'A', 'B', 'C' 같은 것

- 📌 Node와 같은 뜻이야! (자세한 건 아래에서)

~~~python
graph = {
    'A': ['B', 'C'],
    'B': ['A'],
    'C': ['A']
}
~~~

여기서 'A', 'B', 'C'는 모두 vertex 또는 node라고 할 수 있어.

### Edge(간선)

- 두 vertex를 연결하는 선

- 예: 길, 친구 관계, 링크 등

- 양방향 혹은 단방향일 수 있음

~~~python
# A -- B
#  \
#   C

# 간선: A-B, A-C
~~~

- 위 코드에서는 ('A', 'B'), ('A', 'C')가 edge야.

- 양방향 그래프에서는 ('A', 'B') == ('B', 'A')

- 단방향 그래프에서는 다름 → 이게 아래 'Arc'와 연결됨

### Node(노드)

- 사실상 Vertex와 같은 의미

- 그래프 이론에서는 보통 vertex, 트리에서는 보통 node라고 함

- Node ≈ Vertex

### Arc(호)

- 단방향 간선, 방향이 있는 edge라고 생각하면 됨

- 예: A → B

~~~python
# 단방향 그래프
graph = {
    'A': ['B'],  # A → B
    'B': ['C'],  # B → C
    'C': []
}
~~~
여기서 (A, B)는 Arc, (B, A)는 없음.

### 그래프 용어 정리 마무리

그러면 각 용어에 대해 정리하면, 아래와 같아

| 용어 | 의미 | 비고 |
|:---:|:---:|:---:|
| Vertex | 그래프에서의 "정점" | Node와 같은 말 |
| Node | 구조에서의 "점" | Tree에서 사용하는 말 |
| Edge | 두 정점을 연결하는 선 | 양방향/단방향 모두 가능 |
| Arc | 방향이 있는 간선 | 단방향 edge |

파이썬에서 그래프 구현할 때는 ***딕셔너리 / 리스트 of 튜플/ 인접 행렬***을 보통 사용한다고 하니 참고하자


## 그래프 표현 방식

그래프란? 그래프는 ***노드(정점, Vertex)***와 ***간선(Edge)***로 구성된 자료구조야.

그래프의 표현 방식에 대해 알아볼게

### 인접 리스트 (Adjacency List)

가장 많이 쓰이는 방식으로 딕셔너리와 리스트로 구성돼 있어. 공간 복잡도 O(V+E). 연결 여부 확인 느릴 수 있음

~~~python
# 단방향 그래프
graph = {
    1: [2, 3],
    2: [4],
    3: [4],
    4: []
}
~~~

- 1은 2, 3과 연결됨

- 2는 4와 연결됨

- 연결된 노드를 리스트로 관리

### 인접 행렬 (Adjacency Matrix)

이차원 배열로 표현하는 방식이야. 공간 복잡도 O(V^2)이지만 O(1)로 간선 존재 여부 확인 가능

~~~python
graph = [
    [0, 1, 1, 0],  # node 0
    [0, 0, 0, 1],  # node 1
    [0, 0, 0, 1],  # node 2
    [0, 0, 0, 0],  # node 3
]
~~~

- graph[0][1] == 1 인데, 이 뜻은 0과 1이 연결되었다는 의미야

- 연결 여부만 보면 빠르지만, 메모리 소모 많음 (노드 수가 많으면 비효율적)

### 간선 리스트 (Edge List)

간선만 따로 리스트로 관리하는 방법이야

~~~python
edges = [
    (1, 2),
    (1, 3),
    (2, 4),
    (3, 4)
]
~~~

- 1은 2와 3과 연결되어 있다는 얘기야

- 보통 알고리즘 문제에서 그래프를 입력받을 때 자주 나와

- 이후 인접 리스트나 행렬로 변환해서 사용하는 경우 많음

## 방향 그래프 vs 무방향 그래프

여기서 방향 그래프(간선이 한 방향만 가능, 예 : 트위터 팔로우) 와 무방향 그래프(간선이 양방향, 예 : 친구 관계)의 차이점에 대해 다루고 갈게

***인접 리스트를 통해 비교해보자***

~~~python
graph = {
    1: [2],
    2: [],
}
~~~

위 아래를 비교해 보았을때, 위에는 1이 2로 가지만 2는 1로 가지 않으므로 ***방향 그래프***라고 볼 수 있고 
아래는 1에서 2로, 2에서 1로 가서 ***무방향 그래프***를 인접 리스트로 표현한것이지지

~~~python
graph = {
    1: [2],
    2: [1],
}
~~~

### 가중치 그래프 (Weighted Graph)

***서울에서 인천가는 버스***와 ***서울에서 부산가는 버스***의 ***가격***은 다르지? 그거를 표현할 수 있는게 가중치 그래프이고, ***가격외에도 거리, 시간에 대해 데이터***를 추가할 수 있어

~~~python
graph = {
    1: [(2, 4), (3, 1)],  # (노드, 비용)
    2: [(4, 2)],
    3: [(4, 5)],
    4: []
}
~~~

다익스트라(Dijkstra) 알고리즘에서 많이 사용한대

### 그래프 순회 (탐색)

BFS와 DFS를 통해 그래프 탐색도 가능한데, BFS와 DFS의 자세한 부분은 다음 블로그 포스팅을 참고하면 돼

~~~python
# DFS 예시
def dfs(graph, v, visited):
    visited[v] = True
    print(v, end=' ')
    for neighbor in graph[v]:
        if not visited[neighbor]:
            dfs(graph, neighbor, visited)

visited = {node: False for node in graph}
dfs(graph, 1, visited)
~~~

## 그래프 표현 방식 마무리

- 노드 번호가 0부터 시작하면 리스트로 표현

- 노드 번호가 1 이상이거나 알파벳이면 딕셔너리가 더 편해

- 파이썬에서는 아래와 같이 collections.defaultdict(list)를 쓰면 간편하게 그래프 만들 수 있어

~~~python
from collections import defaultdict

graph = defaultdict(list)
edges = [(1, 2), (1, 3), (2, 4)]
for u, v in edges:
    graph[u].append(v)
~~~

- 더 복잡한 그래프 연산이 필요하다면 networkx라는 라이브러리도 있으니 참고해

~~~bash
pip install networkx
~~~

↑가상환경에 설치

~~~python
import networkx as nx

G = nx.Graph()
G.add_edges_from([(1, 2), (1, 3)])
nx.shortest_path(G, 1, 3)
~~~
