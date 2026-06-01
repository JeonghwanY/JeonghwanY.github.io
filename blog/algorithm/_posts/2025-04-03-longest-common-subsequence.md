---
layout: post
title:  "최장 공통 부분 수열(Longest Common Subsequence)"
date:   2025-04-03
tags: [공통, 부분, 수열, LCS, Longest, Common, Subsequence]
hide_last_modified: true
---

* toc  
{:toc .large-only}

## 최장 공통 부분 수열(Longest Common Subsequence)이란?

**LCS (최장 공통 부분 수열)**은 두 개의 시퀀스(문자열 또는 리스트)에서 순서를 유지하면서 공통으로 등장하는 가장 긴 부분 수열을 찾는 문제야.

- 여기서 “부분 수열”은 일부 문자를 삭제만 가능하고, 순서는 유지하는 형태야.

#### 예시

~~~text
A = "ABCDGH"
B = "AEDFHR"
~~~

- 가능한 공통 부분 수열 : "ADH"

- 이게 가장 긴 공통 부분 수열이기 때문에, LCS = "ADH", 길이는 3

## 부분 수열 vs 부분 문자열 [예시("ABCDEF")]

| 용어 | 의미 | 예시("ABCDEF") |
|:---:|:---:|:---:|
| 부분 문자열 | 연속된 문자 | "BCD", "ABC" |
| 부분 수열 | 순서만 지킴, 연속 X | "ACE", "ADF" |

LCS는 부분 수열로서 연속되지 않아도 됨

## 알고리즘 설명 (DP 방식)

LCS는 작은 문제들을 쪼개서 푸는 전형적인 동적 계획법(DP) 문제야

### 점화식(Recurrence Relation)

~~~python
for i in range(1, m+1):
    for j in range(1, n+1):
        if A[i-1] == B[j-1]:
            dp[i][j] = dp[i-1][j-1] + 1 # dp[i][j]는 A의 앞 i개, B의 앞 j개를 비교했을 때의
        else:                           # 최장 공통 부분 수열 길이를 저장
            dp[i][j] = max(dp[i-1][j], dp[i][j-1])
~~~

### DP 테이블 구조

- 크기: (len(A)+1) x (len(B)+1)

- dp[i][j]는 A의 앞 i개, B의 앞 j개를 비교했을 때의 LCS 길이

## LCS 자체 구하기 (문자열 복원)

~~~python
def lcs_string(A, B):
    m, n = len(A), len(B)
    dp = [[0]*(n+1) for _ in range(m+1)]

    for i in range(1, m+1):
        for j in range(1, n+1):
            if A[i-1] == B[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])

    # 문자열 복원
    i, j = m, n
    lcs_result = []
    while i > 0 and j > 0:
        if A[i-1] == B[j-1]:
            lcs_result.append(A[i-1])
            i -= 1
            j -= 1
        elif dp[i-1][j] > dp[i][j-1]:
            i -= 1
        else:
            j -= 1

    return ''.join(reversed(lcs_result))
~~~

## 실전에서의 활용

| 분야 | 활용 예시 |
|:---:|:---:|
| 버전 비교 | Git, diff 명령어 |
| 텍스트 비교 | 문서 유사도 비교, 표절 검사 |
| 생물 정보학 | DNA, 단백질 서열 분석 |
| 에디터 | 변경 사항 하이라이트 |
| 추천 시스템 | 사용자 행동 시퀸스 비교 |

## 시각화 (예시 테이블)

~~~text
A = "ABCBDAB"
B = "BDCAB"

      B D C A B
    0 0 0 0 0 0
A 0 0 0 0 1 1
B 0 1 1 1 1 2
C 0 1 1 2 2 2
B 0 1 1 2 2 3
D 0 1 2 2 2 3
A 0 1 2 2 3 3
B 0 1 2 2 3 4
~~~

LCS : BCAB (길이 : 4)

## 알아두면 좋은 팁

- LCS는 시간복잡도 O(m*n) (문자열 길이가 커지면 느려짐)

- LCS 길이를 활용해서 문자열 유사도 계산 가능(유사도 = (LCS 길이) / (최대 문자열 길이))

- LCS를 3개 이상 문자열로 확장한 문제도 존재함 (난이도 ↑)