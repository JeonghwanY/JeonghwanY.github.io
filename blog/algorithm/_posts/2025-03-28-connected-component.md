---
layout: post
title:  "그래프의 연결 요소(Connected component)"
date:   2025-03-28
hide_last_modified: true
---

* toc  
{:toc .large-only}

그래프의 기본 요소에 대해서 설명을 해줬고, 이제는 더 나아가서 그래프의 연결 요소를 찾아볼거야

## 그래프의 연결 요소 찾기

### 연결 요소란?

- 무방향 그래프에서 모든 정점들이 경로로 연결된 하나의 묶음(예 : 친구 관계 그래프에서, 서로 연결된 친구들의 집단을 찾는 것)

- 그래프가 완전히 연결되어 있지 않다면, 여러 개의 연결 요소(묶음)가 존재할 수 있다

### 무방향 그래프에서의 연결 요소 찾기

예시 :
~~~python
graph = {
    1: [2],
    2: [1],
    3: [4],
    4: [3],
    5: []  # 혼자 떨어진 노드
}
~~~
위 그래프를 보면 {1, 2}, {3, 4}, {5} 로 연결 요소(묶음)이 3개가 나와

그렇다면 저 연결 요소를 어떻게 뽑아낼 수 있을까? DFS와 BFS 둘다 사용할 수 있어

예제 : DFS
~~~python
def dfs(graph, v, visited, component):
    visited[v] = True # 노드 방명록 싸인
    component.append(v) # 노드 리스트에 추가
    for neighbor in graph[v]: # 노드의 이웃들 하나씩
        if not visited[neighbor]: # 이웃 중에서 방문 안한 사람 중에서
            dfs(graph, neighbor, visited, component) # 방문 드가자

def find_connected_components(graph):
    visited = {node: False for node in graph} # 먼저 방명록 초기화
    components = [] # 연결 요소용 리스트

    for node in graph: # 그래프의 모든 노드 하나씩
        if not visited[node]: # 노드 하나씩인데, 방문 안한 노드중에서
            component = [] # 리스트 초기화
            dfs(graph, node, visited, component) # 그래프, 노드, 방명록, 리스트 송부
            components.append(component) # 이웃끼리의 리스트 component 추가
    
    return components

# 테스트
graph = {
    1: [2],
    2: [1],
    3: [4],
    4: [3],
    5: []
}

components = find_connected_components(graph)
print("연결 요소들:", components)
# 출력 결과 : [[1, 2], [3, 4], [5]]
~~~

재귀 사용

예제 : BFS
~~~python
from collections import deque

def bfs(graph, start, visited, component):
    queue = deque([start]) # start(노드)를 queue에 추가
    visited[start] = True # start(노드) 방명록 서명

    while queue: # 큐가 있다면
        v = queue.popleft() # 디큐해서 v로 저장 여기서는 start(노드)
        component.append(v) # 리스트에 start(노드) 추가
        for neighbor in graph[v]: # start(노드)의 모든 이웃중 한명씩
            if not visited[neighbor]: # 방문 안했다면
                visited[neighbor] = True # 방문 서명하고
                queue.append(neighbor) # 리스트에 추가

def find_connected_components_bfs(graph):
    visited = {node: False for node in graph} # 먼저 방명록 초기화
    components = [] # 연결 요소용 리스트

    for node in graph: # 그래프의 모든 노드 하나씩
        if not visited[node]: # 방문 안했다면
            component = [] # 리스트 초기화
            bfs(graph, node, visited, component) # graph, 노드, 방명록, 리스트 송부
            components.append(component) # 이웃끼리의 리스트 추가

    return components

# 테스트
graph = {
    1: [2],
    2: [1],
    3: [4],
    4: [3],
    5: []
}

print(find_connected_components_bfs(graph))
# 출력 결과 : [[1, 2], [3, 4], [5]]
~~~

큐 사용

#### 이렇게 구할 수가 있는데, DFS는 재귀 깊이 초과에 주의해야해. 만약 노드가 많다면 BFS를 사용하자

무방향 그래프에서의 연결 요소를 찾아 보았으니까. 이젠 방향 그래프에서의 강한 연결 요소를 찾아보자

### 방향 그래프에서의 강한 연결 요소 찾기

대표적으로 ***Tarjan 알고리즘***과 ***Kosaraju 알고리즘***이 있어

#### 강한 연결 요소(Strongly Connected Component)란?

- 방향 그래프에서, 모든 정점에서 서로 도달 가능한 최대 그룹을 얘기해

- 즉, 어떤 두 노드 u, v 가 있을 때, u → v 도 가고, v → u 도 갈 수 잇으면 → 같은 SCC

#### Tarjan 알고리즘 (DFS 기반, O(V + E))

하나의 DFS로 SCC를 찾는 고급 알고리즘으로 재귀적으로 방문하여, low-link 값을 이용해 SCC 판별

- DFS 도중 ***역방향 간선(back edge)***을 통해 자기 자신으로 돌아올 수 있는지를 체크

- stack을 활용해 SCC 구성 추적

~~~python
def tarjans_scc(graph):
    index = 0
    indices = {}
    lowlinks = {}
    stack = []
    on_stack = set()
    sccs = []

    def dfs(v):
        nonlocal index # nonlocal 같은 경우 외부 함수의 지역 변수 수정
        indices[v] = lowlinks[v] = index # indices[노드] 와 lowlinks[노드] 에 index(0) 저장
        index += 1 # 인덱스 1증가
        stack.append(v) # 스택에 노드 추가
        on_stack.add(v) # on_stack에다가도 노드 추가

        for w in graph[v]: # 노드의 이웃?
            if w not in indices: # 이웃이 indices에 없다면
                dfs(w) # 그 이웃 노드 dfs 수행
                lowlinks[v] = min(lowlinks[v], lowlinks[w]) # lowlinks[노드]에 노드의 이웃 또는 자신의 최솟값 저장
            elif w in on_stack: # 이웃이 on_stack에 있다면
                lowlinks[v] = min(lowlinks[v], indices[w]) # lowlinks[노드]에 lowlink[노드]와 indices[이웃]의 최솟값 저장

        # SCC 발견
        if lowlinks[v] == indices[v]: # lowlinks[노드] == indices[노드] 가 같다면
            scc = [] # 리스트 초기화
            while True: 
                w = stack.pop() # w 에 stack 팝된걸 저장
                on_stack.remove(w) # stack에서 w를 제거
                scc.append(w) # scc에 w 추가
                if w == v: # w 가 노드와 같다면
                    break
            sccs.append(scc) # w가 노드와 같지 않다면 sccs에 추가

    for node in graph: # 그래프의 모든 노드 하나씩
        if node not in indices: # indices 리스트에 없는 노드라면
            dfs(node) # 노드 데리고 dfs함수 실행

    return sccs

graph = {
    0: [1],
    1: [2],
    2: [0, 3],
    3: [4],
    4: []
}
print(tarjans_scc(graph))  # 출력 : [[4], [3], [0, 2, 1]]
~~~

#### Kosaraju 알고리즘 (두 번의 DFS, O(V + E))

SCC 찾는 데 있어서 가장 직관적인 방법으로 

- 정방향 DFS 후 → 노드 종료 순서 기록

- 그래프를 뒤집고(Transpose) 역방향 DFS 순회하여 SCC 추출

~~~python
from collections import defaultdict

def kosaraju_scc(graph):
    visited = set()
    stack = []

    # 1단계: 정방향 DFS로 종료 순서 기록
    def dfs1(v):
        visited.add(v)
        for w in graph[v]:
            if w not in visited:
                dfs1(w)
        stack.append(v)

    for node in graph:
        if node not in visited:
            dfs1(node)

    # 2단계: 그래프 뒤집기 (Transpose)
    reversed_graph = defaultdict(list)
    for u in graph:
        for v in graph[u]:
            reversed_graph[v].append(u)

    # 3단계: 종료 순서대로 역방향 DFS
    visited.clear()
    sccs = []

    def dfs2(v, component):
        visited.add(v)
        component.append(v)
        for w in reversed_graph[v]:
            if w not in visited:
                dfs2(w, component)

    while stack:
        v = stack.pop()
        if v not in visited:
            component = []
            dfs2(v, component)
            sccs.append(component)

    return sccs

graph = {
    0: [1],
    1: [2],
    2: [0, 3],
    3: [4],
    4: []
}
print(kosaraju_scc(graph))  # 예: [[4], [3], [0, 2, 1]]
~~~

Tarjan vs Kosaraju 차이점은 아래와 같아

| 항목 | Tarjan 알고리즘 | Kosaraju 알고리즘 |
|:---:|:---:|:---:|
| 방식 | DFS 1회, low-link 계산 | DFS 2회, 역방향 그래프 사용 |
| 시간복잡도 | O(V + E) | O(V + E) |
| 메모리 | 스택 필요 | 역방향 그래프 추가 필요 |
| 특징 | 한 번의 DFS로 끝남 | 더 직관적, 구현이 쉬움 |

방향 그래프에서 서로 연결된 컴포넌트를 묶고 싶을 때의 예는 아래와 같아

- 웹페이지 간 링크 순환 감지

- 모듈 간 순환 의존성 탐지

- 컴파일 의존성 정리

- 2-SAT 문제 해결의 핵심 알고리즘