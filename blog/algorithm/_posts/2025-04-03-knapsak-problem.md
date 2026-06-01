---
layout: post
title:  "배낭 문제(Knapsack Problem)"
date:   2025-04-03
hide_last_modified: true
---

* toc  
{:toc .large-only}

알고리즘과 최적화 문제에서 정말 유명하고, 컴퓨터 과학뿐 아니라 실생활 응용에도 자주 나오는 문제, ***배낭 문제***에 대해서 알아보자

## 배낭 문제(Knapsack Problem)이란?

Knapsack Problem은 제한된 용량(capacity)을 가진 배낭에 아이템들을 넣되, 최대의 가치를 얻도록 선택하는 문제야.

## 문제 정의 (0/1 Knapsack Problem 기준)

**입력**

- 배낭의 최대 무게 : W

- n개의 아이템(각각 무게 w_i, 가치 v_i)

**조건**

- 각 아이템은 한 번만 선택할 수 있음 ((0 또는 1번 선택 → 그래서 0/1 Knapsack))

- 선택한 아이템들의 총 무게는 W를 넘을 수 없음

**목표**

- 선택한 아이템들의 총 가치의 합을 최대화

## 예제

~~~text
배낭 용량: W = 8

아이템 목록:
아이템 1: 무게 3, 가치 30
아이템 2: 무게 4, 가치 50
아이템 3: 무게 5, 가치 60

어떤 조합을 넣는 게 가장 이득일까?
~~~

가능한 조합

| 선택된 아이템 | 총 무게 | 총 가치 |
|:---:|:---:|:---:|
| 없음 | 0 | 0 |
| 1 | 3 | 30 |
| 2 | 4 | 50 |
| 3 | 5 | 60 |
| 1 + 2 | 7 | 80 ✅ 최선 |
| 1 + 3 | 8 | 90 ❌ 불가능 (넘음) |
| 2 + 3 | 9 | 110 ❌ 불가능 |

→ 정답: 아이템 1 + 아이템 2 (무게 7, 가치 80)

## 해결 방법

### Brute Force (모든 조합을 확인)

- 시간복잡도 : O(2^n)

- n이 작을 땐 괜찮지만, 클 땐 현실적으로 사용 불가능

### Dynamic Programming (DP)

**DP 테이블 정의**

- dp[i][w]: 처음 i개의 아이템을 고려했을 때, 무게 w 이하로 얻을 수 있는 최대 가치

**점화식**
~~~python
if w_i > w:
    dp[i][w] = dp[i-1][w]
else:
    dp[i][w] = max(dp[i-1][w], dp[i-1][w - w_i] + v_i)
~~~

- 시간복잡도 : O(n*W)

- 공간복잡도 : O(n*W) (→ O(W)로도 줄일 수 있음)

**Python 코드 예시**
~~~python
def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        for w in range(capacity + 1):
            if weights[i-1] > w:
                dp[i][w] = dp[i-1][w]
            else:
                dp[i][w] = max(dp[i-1][w],
                               dp[i-1][w - weights[i-1]] + values[i-1])
    return dp[n][capacity]
~~~

## 알아두면 좋은 포인트

- 탑다운(DP + 메모이제이션) vs 바텀업(DP 배열) 둘 다 구현 가능

- 대입면접/코딩테스트에 자주 등장함 (LeetCode, 백준, 프로그래머스 등)

- DP를 배울 때 필수 예제로 다뤄짐