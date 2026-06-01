---
layout: post
title:  "위상 정렬(Topological sort)"
date:   2025-03-28
hide_last_modified: true
---

* toc  
{:toc .large-only}

위상 정렬 같은 경우 방향 그래프에서만 가능한 개념이야

## 위상 정렬이란?

방향 그래프에서 모든 노드들을 "선 후 관계"를 지키면서 나열한 순서를 말해

- 어떤 작업이 먼저 수행되어야 다른 작업을 할 수 있을 때, 그 작업 순서를 정해주는 것이지

예를 들어 (과목1 → 과목2 → 과목3) 와 같은 관계가 있으면

- 과목 1을 들어야 과목 2를 들을 수 있고

- 과목 2를 들어야 과목 3을 들을 수 있다면, 위상 정렬 결과는 아래와 같아

~~~css
[과목1, 과목2, 과목3]
~~~

위상 정렬이 가능한 조건으로는, ***방향 그래프***이어야 하고 사이클이 없어야 해

그러면 파이썬 함수를 통해 알아보자

## 진입차수(in-degree)를 이용한 방법 (Kahn’s Algorithm, BFS 기반)

~~~python
from collections import deque, defaultdict

def topological_sort(graph):
    indegree = {node: 0 for node in graph} # indegree 에 모든 노드에 0 저장
    for u in graph: # 그래프의 모든 노드 하나씩
        for v in graph[u]: # 노드 하나의 이웃
            indegree[v] += 1 # indegree[이웃]에 1 증가, 최종적으로는 C와 F가 값이 많다
                                                                   # 아래는 진입 차수(in-degree) == 0 분류
    queue = deque([node for node in graph if indegree[node] == 0]) # queue라는 데크에 indegree[node] == 0  
    result = [] # 리스트 생성                                        # 인 것들을 추가 (A,B)

    while queue: # 큐에 노드가 있다면
        node = queue.popleft() # 큐에서 첫번째 원소를 팝한것을 노드에 저장, queue -1
        result.append(node) # result에 노드 추가

        for neighbor in graph[node]: # 노드의 이웃들중 하나씩
            indegree[neighbor] -= 1 # 이웃의 indegree를 1 감소
            if indegree[neighbor] == 0: # 여기서 이웃의 indegree가 0이 되면
                queue.append(neighbor) # 다시 큐에 추가

    # 사이클이 있을 경우 예외 처리
    if len(result) != len(graph): # 사이클이 있으면 만족 하지 않음
        return "사이클 있음! 위상 정렬 불가"
    return result # result 값 출력

graph = {
    'A': ['C'],
    'B': ['C', 'D'],
    'C': ['E'],
    'D': ['F'],
    'E': ['H', 'F'],
    'F': ['G'],
    'G': [],
    'H': []
}
print(topological_sort(graph)) # 출력 : ['A', 'B', 'C', 'D', 'E', 'H', 'F', 'G']
~~~

## DFS 기반 위상 정렬

재귀적으로 모든 하위 작업을 먼저 처리한 후, 스택에 넣음

~~~python
def dfs_topological_sort(graph):
    visited = set() # set으로 집합 자료형 구조 생성
    stack = [] # 빈 스택 생성

    def dfs(v):
        visited.add(v) # visited set에 노드 추가 
        for neighbor in graph[v]: # 노드의 모든 이웃들 하나씩
            if neighbor not in visited: # 이웃이 visited에 없다면
                dfs(neighbor) # dfs 함수 시행
        stack.append(v) # 끝나면 노드를 stack에 추가

    for node in graph: # 그래프의 모든 노드 하나씩
        if node not in visited: # 방문한적이 없다면
            dfs(node) # dfs 함수 실행

    return stack[::-1]  # 역순으로 반환

graph = {
    'A': ['C'],
    'B': ['C', 'D'],
    'C': ['E'],
    'D': ['F'],
    'E': ['H', 'F'],
    'F': ['G'],
    'G': [],
    'H': []
}

print(dfs_topological_sort(graph)) # 출력 : ['B', 'D', 'A', 'C', 'E', 'F', 'G', 'H']
~~~

### 위상 정렬 마무리

그렇다면 어디에 위상 정렬이 나올까?

| 예시 | 설명 |
|:---:|:---:|
| 과목 선수 관계 | 특정 과목을 듣기 위해 어떤 과목부터 들어야 하는지 |
| 빌드 순서 | 모듈을 빌드할 때 의존성 해결 |
| 작업 스케일링 | 어떤 작업이 먼저 완료되어야 다음 작업 가능할 때 |
| 컴파일러 최적화화 | 명령어 재배치 |
