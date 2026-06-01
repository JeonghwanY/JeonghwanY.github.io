---
layout: post
title:  "정수론(Number Theory)"
date:   2025-03-19
hide_last_modified: true
---

* toc  
{:toc .large-only}

알고리즘 최적화와 암호학에 활용할 수 있는 정수론은 수학적인 성질을 다뤄, 소수(prime number)/최대공약수(GCD)/최소공배수(LCM)/모듈러 연산(modular arithmetic)을 포함한다.

그러면 아래 정수론을 정리한 표를 보여주겠다. 솔직히 확장 유클리드부터는 처음 들어보는 이야기이다...

| 개념 | 설명 | 코드 |
|:---:|:---:|:---:|
| 소수 판별 | O(√N)으로 특정 수가 소수인지 확인 | is_prime(n) |
| 소인수 분해 | 정수를 소수들의 곱으로 분해 | prime_factors(n) |
| 최대공약수 | 유클리드 호제법 사용 (O(log N))	 | gcd(a, b) |
| 최소공배수 | lcm(a, b) = a × b / gcd(a, b) | lcm(a, b) |
| 확장 유클리드 | ax + by = gcd(a, b) 해 구하기 | extended_gcd(a, b) |
| 모듈러 역원 | ax ≡ 1 (mod m)를 만족하는 x 찾기 | mod_inverse(a, m) |
| 빠른 거듭제곱 | O(log N)으로 거듭제곱 계산 | mod_pow(base, exp, mod) |
| 에라토스테네스의 체 | N 이하 모든 소수 찾기 (O(N log log N)) | sieve(n) |

위 함수들이 어떻게 되어 있는지 보자

### 소수 (Prime Number)

예제 : 소수는 1과 자기 자신으로만 나누어지는 수입니다.
~~~python
def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True

print(is_prime(29))  # True
print(is_prime(30))  # False
~~~

### 소인수 분해 (Prime Factorization)

예제 : 소수를 곱하여 특정 정수를 표현하는 것
~~~python
def prime_factors(n):
    factors = []
    d = 2
    while d * d <= n:
        while n % d == 0:
            factors.append(d)
            n //= d
        d += 1
    if n > 1:
        factors.append(n)
    return factors

print(prime_factors(60))  # [2, 2, 3, 5]
~~~

### 최대공약수(GCD) & 최소공배수(LCM)

예제 : 최대공약수(GCD, Greatest Common Divisor): 두 수의 공통된 약수 중 가장 큰 값
~~~python
import math

# math 라이브러리 사용
print(math.gcd(48, 18))  # 6

# 직접 구현
def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

print(gcd(48, 18))  # 6
~~~


예제 : 최소공배수(LCM, Least Common Multiple): 두 수의 공통된 배수 중 가장 작은 값
~~~python
def lcm(a, b):
    return a * b // gcd(a, b)

print(lcm(48, 18))  # 144
~~~


### 확장 유클리드 알고리즘 (Extended Euclidean Algorithm)

예제 : 방정식 ax + by = gcd(a, b) 의 해를 찾는 알고리즘, 모듈러 역원(modular inverse) 계산에 사용됨
~~~python
def extended_gcd(a, b):
    if b == 0:
        return a, 1, 0
    g, x1, y1 = extended_gcd(b, a % b)
    x = y1
    y = x1 - (a // b) * y1
    return g, x, y

print(extended_gcd(30, 20))  # (10, 1, -1)
~~~


### 모듈러 역원 (Multiplicative Inverse)

예제 : ax ≡ 1 (mod m) 를 만족하는 x 를 찾는 문제
~~~python
def mod_inverse(a, m):
    g, x, _ = extended_gcd(a, m)
    if g != 1:
        return None  # 역원이 존재하지 않음
    return x % m

print(mod_inverse(3, 7))  # 5 (3 * 5 ≡ 1 (mod 7))
~~~



### 빠른 거듭제곱 (Fast Exponentiation)

예제 : 일반적인 거듭제곱은 O(N) 시간이 걸리지만, 거듭제곱을 분할정복하면 O(log N) 에 계산 가능
~~~python
def mod_pow(base, exp, mod):
    result = 1
    while exp > 0:
        if exp % 2 == 1:  # 홀수일 때
            result = (result * base) % mod
        base = (base * base) % mod
        exp //= 2
    return result

print(mod_pow(3, 200, 13))  # 9
~~~



### 에라토스테네스의 체 (Sieve of Eratosthenes)

예제 : 범위 내 소수를 빠르게 찾는 알고리즘 (N까지의 모든 소수를 구할 때 효율적)
~~~python
def sieve(n):
    is_prime = [True] * (n + 1)
    is_prime[0] = is_prime[1] = False
    for i in range(2, int(n ** 0.5) + 1):
        if is_prime[i]:
            for j in range(i * i, n + 1, i):
                is_prime[j] = False
    return [i for i in range(n + 1) if is_prime[i]]

print(sieve(50))  # [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]
~~~