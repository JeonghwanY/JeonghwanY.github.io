---
layout: post
title:  "시간과 공간 복잡도(w.BigO)"
date:   2025-03-18
hide_last_modified: true
---

* toc  
{:toc .large-only}

오늘 복잡도를 공부하면서 느낀것이 있다. 프로그래머로썬 해당 개념을 알아야 메모리를 효율적으로 사용 및 저장을 할수 있다는 것이다. 복잡도는 알고리즘의 효율성을 평가하는데, 시간과 공간 복잡도로 나뉜다. 아래에 Big-O와 같이 세부적인 설명을 할 것인데, 기준이 되는 값 n은 입력 크기라고 생각하면 된다.

## 시간 복잡도

백준 문제를 풀어봤다면, 시간 제한을 알것이다. 문제마다 다르지만, 1 ~ 2초에서 해결을 해야하는데, 이것과 관련 있는것이 시간 복잡도이다.
아래에는 시간 복잡도가 작은것부터 오름차순으로 설명을 진행해서 내려갈수록 실행 시간이 커진다는점 참고하면 된다.

### O(1), 상수 시간

입력 크기에 관계없이 1 만큼 실행 시간이 증가한다.

예제 :
~~~python
a=3
b=7
print(a+B)
~~~
예제 :
~~~python
def get_first_element(arr):
    return arr[0]
~~~

위 두 예제 같은 경우 저장하는 것을 제외 했을때, 계산 또는 실행이 한번만 실행되므로 1만큼 증가한다.

### O(log n), 로그 시간

로그 같은 경우 탐색을 하지만 효율적으로 탐색을 하기 때문에 탐색(O(n)) 보다 작은 O(log n) 으로 나타낸다고 보면 된다.

예제 :
~~~python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
~~~
이진 탐색 같은 경우 정렬이 된 상태에서 탐색을 하는건데, 반을 자르고 또 자르면서 검색한다는 점에서 일반 탐색보다 효율적이라고 한다.

### O(n), 선형 시간

선형 시간 같은 경우 for 문 같은 전체 순회하는 경우라고 생각하면 쉽다.

예제 :
~~~python
def find_element(arr, target):
    for num in arr:  # 리스트 전체 탐색
        if num == target:
            return True
    return False
~~~
### O(n log n), 로그-선형 시간

Quick Sort나 병합 정렬같은 효율적인 정렬 방법을 가리킨다. 버블 정렬 또는 삽입 정렬은 O(n^2) 로 시간 복잡도가 더 크다.

예제 : 예제는 따로 없다.

### O(n^2), 이차 시간

입력 크기에 따라 실행 시간이 제곱으로 증가함, Bubble sort, Insertion sort, and Straight insertion sort 같은 경우에 여기에 해당하고 for 의 for 문 같은 경우에도 여기에 해당한다.

예제 :
~~~python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n - i - 1):  # 중첩 루프
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
~~~
예제 :
~~~python
a = [1,2,3,4,5]
for i in a:
    for j in a:
        mult = i*j
~~~

### O(2^n), 지수 시간

입력 크기가 증가할수록 실행 시간이 급격히 증가함, 피보나치 재귀 같은 경우 한번 실행하면 2개의 피보나치 재귀가 실행된다는점을 생각해보면 이해하기 쉽다.

예제 :
~~~python
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)
~~~

### O(n!), 팩토리얼 시간

팩토리얼 생각하면 간단하다. 매우 비효율적이면서 Big-O 표기법중 최악의 경우이다.

팩토리얼까지 시간 복잡도를 설명했다. 시간 복잡도에 대한 개념이 있다면, 적용해 봐야 하지 않을까? 아래 경우 코드 효율화의 예를 들어봤다.

예제 : +와 -를 번갈아 출력하기 1(for 문 수정)
~~~python
print('+와 -를 번갈아 출력합니다.')
n = int(input('몇 개를 출력할까요?:'))

for i in range(1, n + 1):
    if i%2: #홀수
        print('+', end="")
    else:
        print('-', end="")

print()
~~~

위와 같은 코드의 경우 n이 10,000이라면, p.41
예제 :


## 공간 복잡도

공간 복잡도는 알고리즘이 사용하는 메모리 공간의 양이다. 공간 복잡도 같은경우 요새 메모리(하드웨어)의 발전으로 크게 중점을 두진 않는다. 두가지 메모리 공간을 고려해야 하는데, 아래와 같다.
- 고정 공간 : 입력 크기와 무관하게 일정한 공간을 사용 (예 : 변수 선언)

- 가변 공간 : 입력 크기에 따라 변화하는 공간 사용 (예 : 리스트, 재귀 호출 스택)

- O(1), 변수 1~2개만 사용(a, b = 0, 1)

- O(n), 길이 n의 배열 생성(arr = [0] * n)

- O(n^2), n * n 크기의 행렬 사용( matrix = [[0] * n for _in range(n)])