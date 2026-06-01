---
layout: post
title:  "완전 탐색(Brute Force)"
date:   2025-03-19
hide_last_modified: true
---

* toc  
{:toc .large-only}

백준 문제 풀때, '일단 모든 경우의 수를 다 대입해보자' 라는 생각으로 문제 접근할 때가 있다. 이런 접근 방법이 완전 탐색이다. 당연 시간 복잡도는 높다. 

## 완전 탐색의 특징은 아래와 같다.

- 모든 경우의 수를 조건에 맞는지 확인
- 무식하지만, 입력 크기가 작다면 이런 접근도 괜찮다
- 시간 복잡도가 큼
- 재귀, 반복문, 백트래킹, 순열/조합, DFS/BFS 등을 활용함함

그러면 예제로 비슷한 경우를 따져보자자

### 단순 반복문 활용

예제 : 1부터 100까지의 숫자 중 7의 배수 찾기
~~~python
for i in range(1, 101):
    if i % 7 == 0:
        print(i, end=" ")
~~~
### 순열과 조합(itertools 활용)

예제 : 순열(Permutation) - 모든 순서를 고려한 경우
~~~python
from itertools import permutations

arr = [1, 2, 3]
perm = list(permutations(arr, 2))  # 2개씩 순서 고려하여 나열
print(perm)
# 결과: [(1, 2), (1, 3), (2, 1), (2, 3), (3, 1), (3, 2)]
~~~


예제 : 조합(Combination) - 순서는 고려하지 않고 특정 개수만큼 선택
~~~python
from itertools import combinations

arr = [1, 2, 3]
comb = list(combinations(arr, 2))  # 2개씩 선택 (순서 상관없음)
print(comb)
# 결과: [(1, 2), (1, 3), (2, 3)]
~~~

### 재귀함수 활용

예제 : 1부터 N까지 숫자의 모든 조합 출력
~~~python
def dfs(path, depth, n):
    if depth == n:
        print(path)
        return
    
    for i in range(1, n+1):
        if i not in path:  # 중복 방지
            dfs(path + [i], depth + 1, n)

dfs([], 0, 3)
~~~


### 백트래킹(Backtracking)

예제 : N-Queen 문제 (8x8 체스판에서 퀸 8개 배치)
~~~python
def is_valid(board, row, col):
    for i in range(row):
        if board[i] == col or abs(board[i] - col) == abs(i - row):
            return False
    return True

def solve_n_queens(n, board=[], row=0):
    if row == n:
        print(board)
        return
    
    for col in range(n):
        if is_valid(board, row, col):
            solve_n_queens(n, board + [col], row + 1)

solve_n_queens(4)
~~~
이렇게 완전 탐색의 경우의 수를 알아보았다. 그렇다면 탐색 방법의 특징과 시간 복잡도를 알아보자. 아래 표를 참고하면 된다.

| 탐색 방법 | 설명 | 시간 복잡도 |
|:---:|:---:|:---:|
| 완전탐색 | 모든 경우 탐색 | O(N!) (순열) |
| 백트래킹 | 가지치기 최적화 | O(N!) (최적화됨) |
| BFS/DFS | 그래프 탐색 | O(V+E) |
| 이진 탐색 | 정렬된 데이터에서 탐색 | O(log N) |

완전탐색 특성상 유용하지 않을것 같지만 앞으로 나열하는 경우에는 유용할수도 있겠다. 작은 범위의 모든 경우를 확인할 때, 정확한 최적해를 구해야 할 때, 모든 조합을 확인해야 할때(ex: 비밀번호 크래킹)나 백트래킹 적용 정 접근할때