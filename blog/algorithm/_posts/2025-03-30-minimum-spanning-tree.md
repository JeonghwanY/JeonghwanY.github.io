---
layout: post
title:  "최소 신장 트리(MST, Minimum Spanning Tree)"
date:   2025-03-30
hide_last_modified: true
---

* toc  
{:toc .large-only}

그래프에서 모든 정점을 최소 비용으로 연결하는 최소 신장 트리에 대해 설명해볼게. 트리, 먼저 신장 트리, 최소 신장 트리의 용어에 대해 설명하자면 아래와 같아.

- ***트리*** : 사이클 없는 연결 그래프

- ***신장 트리*** : 그래프의 모든 정점을 연결하는 사이클이 없는 트리

- ***최소 신장 트리*** : 여러 신장 트리 중에서 간선들의 가중치 합이 가장 작은 것

그렇다면 내가 이미 설명한 최단 경로를 찾는 다익스트라, 플로이드 와샬, 벨만 포드랑 최소 신장 트리는 뭐가 다를까? 최소 신장 트리를 배우기 이전에 차이점을 짚고 가자. 아래는 차이점을 정리한 표이다

| 항목 | 최소 신장 트리(MST) | 최단 경로 알고리즘 (다익스트라 등) |
|:---:|:---:|:---:|
| 목적 | 모든 정점을 최소 비용으로 연결 | 한 정점에서 다른 정점까지 최단 거리 계산 |
| 결과 | 간선들의 집합 (트리 구조) | 거리 값 (그리고 경로) |
| 간선 선택 기준 | 전체 그래프에서 가중치 작은 간선을 골라 사이클 없이 연결 | 출발점 기준으로 최단 거리 갱신 |
| 모든 정점과 연결? | O (신장 트리이기 때문) | X (도달할 수 없는 정점은 제외) |
| 가중치 음수 가능? | O (크루스칼 가능, 프림은 불가) | 알고리즘마다 다름 (다익스트라는 불가능, 벨만-포드는 가능) |

최소 신장 트리의 알고리즘에는 ***크루스칼(Kruskal)과 프림(Prim)***알고리즘이 있어. 이 두개 알고리즘에 대해 설명할게

## 크루스칼(Kruskal) 알고리즘 기본

- 모든 간선을 가중치 기준으로 정렬함

- 사이클이 생기지 않도록 간선을 하나씩 선택해서 트리를 완성

### 크루스칼 알고리즘 시각화

좀 더 이해하기 쉽도록 시각화 자료를 사용해볼게

~~~mathematica
   A ---1--- B
   | \       |
   3    2    4
   |       \ |
   C ---5--- D
~~~
- 정점 : A, B, C, D

- 간선들 (가중치 포함) : (A-B:1), (A-C:3), (A-D:2), (B-D:4), (C-D:5)

먼저 기본에 따라서 가중치를 정렬한다

- 간선들 (가중치 정렬) : (A-B:1), (A-D:2), (A-C:3), (B-D:4), (C-D:5)

이후로 사이클이 생기는 것들을 제외한다. 여기서 사이클이란 하나의 루프가 생성되는것을 말한다.

- 선택: (A-B) ✅

- 선택: (A-D) ✅

- 선택: (A-C) ✅

- 스킵: (B-D) ❌ (사이클 생김)

- 스킵: (C-D) ❌ (사이클 생김)

그러면 MST가 완성이 된다

- MST : (A-B), (A-D), (A-C) 로 총 간선 3(정점4에서-1)개가 나온다

### 크루스칼(Kruskal) 알고리즘 함수

~~~python
# 1. 입력: 간선 리스트 (가중치, 정점1, 정점2)
edges = [
    (1, 'A', 'B'),
    (3, 'A', 'C'),
    (2, 'A', 'D'),
    (4, 'B', 'D'),
    (5, 'C', 'D')
]

# 2. 간선 정렬
edges.sort()  # 가중치 기준 정렬됨

# 3. 유니온 파인드를 위한 부모 노드 초기화
parent = {}

def find(x):
    # 경로 압축 기법 사용
    if parent[x] != x: # parent[원소 값]가 원소와 다르다면
        parent[x] = find(parent[x]) # parent[원소 값] 의 최종 root를 저장한다
    return parent[x] # root 값 반환

def union(x, y):
    root_x = find(x)
    root_y = find(y)
    if root_x != root_y:
        parent[root_y] = root_x  # 두 집합을 합침

# 4. 정점 초기화
for edge in edges:
    _, u, v = edge # edges의 _에 가중치, u에 시작점, v에 마지막점 하나씩 저장
    if u not in parent: # u가 parent에 없다면
        parent[u] = u # parent에 u 저장
    if v not in parent: # v가 parent에 없다면
        parent[v] = v # parent에 v 저장

# 5. MST 구성
mst = [] # mst라는 빈 리스트 생성
for weight, u, v in edges: # edges 원소들의 가중치, 처음값, 마지막값 하나씩
    if find(u) != find(v):  # ↑ 사이클 안 생기면, 루트값 비교, 트리 납작하게
        union(u, v) # parent 트리를 납작하게 만듦
        mst.append((u, v, weight)) # 사이클 없는 간선만 mst에 처음값, 마지막값, 가중치 저장

# 6. 결과 출력
print("최소 신장 트리:", mst)
~~~

먼저 첫번째 정렬한 것이 핵심인거 같아. 정렬을 안했으면 긴것들이 mst에 들어갈 수 있으니까

## 프림(Prim) 알고리즘 기본

크루스칼이 간선 중심이라면, 프림은 정점 중심으로 최소 신장 트리를 만들어 나가는 방식이야. 시작 정점 하나를 기준으로, 가장 가까운 정점을 하나씩 연결하면서 트리를 확장해 나가는 방식

알기쉽게 시각화를 예로 들어보자

### 프림 알고리즘 시각화

~~~mathematica
   A ---1--- B
   |         |
   3         4
   |         |
   C ---5--- D
~~~

간선 목록 (가중치 포함) : (A-B:1), (A-C:3), (B-D:4), (C-D:5)

🎯 프림 알고리즘 동작 (시작점: A)

1️⃣ 초기 상태
- 시작 정점: A

- MST에 A 추가

- 후보 간선: (A-B:1), (A-C:3)

2️⃣ (A-B:1) 선택
- 정점 B 추가

- 후보 간선: (A-C:3), (B-D:4)

3️⃣ (A-C:3) 선택
- 정점 C 추가

- 후보 간선: (B-D:4), (C-D:5)

4️⃣ (B-D:4) 선택
- 정점 D 추가 → 끝!

📌 MST 구성:

- (A-B), (A-C), (B-D)

### 프림(Prim) 알고리즘 함수

~~~python
import heapq
from collections import defaultdict

# 1. 그래프 정의 (인접 리스트 형태)
graph = defaultdict(list)
graph['A'].extend([('B', 1), ('C', 3)])
graph['B'].extend([('A', 1), ('D', 4)])
graph['C'].extend([('A', 3), ('D', 5)])
graph['D'].extend([('B', 4), ('C', 5)])

# 2. 프림 알고리즘 함수
def prim(start): # A가 start
    visited = set() # visited라는 집합 자료형 생성
    mst = [] # 나중에 반환할 빈 mst 생성
    total_weight = 0 # 총 가중치 0으로 시작
    pq = [] # heapq 사용할 리스트 생성

    # 시작 정점에서 연결된 간선을 모두 큐에 추가
    visited.add(start) # 자신의 값 visited에 추가
    for neighbor, weight in graph[start]: # graph start의 모든 이웃과 가중치 하나씩
        heapq.heappush(pq, (weight, start, neighbor)) # pq에 가중치, start, 이웃 추가, 처음에는 (1,'A','B'), (3,'A','C')

    while pq: # pq에 원소가 있을 때
        weight, u, v = heapq.heappop(pq) # pq에서 팝한거를 weight, u, v에 저장
        if v not in visited: # v가 visited에 없다면 
            visited.add(v) # 추가
            mst.append((u, v, weight)) # u, v, 가중치를 mst에 저장
            total_weight += weight # 총 가중치에 가중치 추가
            for neighbor, w in graph[v]: # 이웃의 이웃들과 가중치 하나씩
                if neighbor not in visited: # 이웃이 visited에 없으면
                    heapq.heappush(pq, (w, v, neighbor)) # pq에 가중치, 시작, 이웃을 push 한다

    return mst, total_weight

# 3. 실행
mst_result, cost = prim('A') # prim('A') 를 실행해서 mst_result와 cost를 받아온다
print("최소 신장 트리:", mst_result)
print("총 비용:", cost)
~~~

Prim 알고리즘도 마찬가지로 heapq를 사용해서 push 되는 값들이 최솟값이다. 이것이 특징이라고 생각이 된다.

## 마무리

### 공통점 (크루스칼 & 프림)

| 항목 | 설명 |
|:---:|:---:|
| 💡 목표 | 모든 정점을 최소 비용으로 연결하는 MST 찾기 |
| 🌐 입력 | 가중치가 있는 무방향 그래프 |
| 🔁 동작 방식 | 가장 작은 비용의 간선을 선택해 하나씩 추가 |
| 🚫 사이클 방지 | 사이클이 생기면 간선 추가 X |
| 📦 결과 | 간선 수 = 정점 수 - 1 인 트리 구조 |

### 차이점 (크루스칼 & 프림)

| 항목 | 크루스칼(Kruskal) | 프림(Prim) |
|:---:|:---:|:---:|
| ⚙️ 알고리즘 방식 | 간선 중심 (Edge-based) | 정점 중심 (Vertex-based) |
| 📊 시작 방법 | 간선 전체를 정렬한 후 하나씩 선택 | 하나의 정점에서 시작, 주변 확장 |
| 🔁 선택 기준 | 가중치 작은 간선부터 차례로 선택 | 가장 가까운 정점을 선택 |
| 🛠 자료구조 | 유니온-파인드 (Disjoint Set) 사용 | 우선순위 큐 (Heap) 사용 |
| 🔄 간선 정렬 필요 | O (처음에 전체 간선 정렬) | X (큐에서 최소 간선 선택) |
| 📈 효율 | 간선 수가 적은 그래프에 유리 | 간선 수가 많은 그래프에 유리 |
| ⛔ 사이클 확인 방법 | 유니온-파인드로 확인 | 방문 여부로 확인 |
| 💥 가중치 음수 | O (문제 없음) | O (가능, 다익스트라와는 다름) |

### 비유 (크루스칼 & 프림)

| 알고리즘 | 비유 |
|:---:|:---:|
| 크루스칼 | "전국 도로 목록을 정리해서, 가장 싸고 필요 없는 건 빼면서 도로 연결해 나가는 느낌" |
| 프림 | "서울에서 시작해서, 점점 가까운 도시를 하나씩 연결해서 전국으로 확장해 나가는 느낌" |