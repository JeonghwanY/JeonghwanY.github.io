---
layout: post
title:  "전위 순회(Pre-Order Traversal)와 후위 순회(Post-Order Traversal)의 연관성"
date:   2025-04-16
hide_last_modified: true
---

* toc  
{:toc .large-only}

C언어를 통해 재귀 없이 Stack 2개를 활용하여 후위순회를 진행하는 코드를 보고 전위순회와 후위순회의 구조적 연관성이 있겠다는 생각이 들었다. 왜냐하면, 1개의 스택은 전위순회의 구조를 바꾼 형태였고 나머지 스택 하나는 그 한개의 스택을 역순으로 출력하기 위해 존재 했었기 때문이다.

## 전위 순회와 후위 순회의 구조적인 연관성

먼저 결론부터 얘기하자면, **전위 순회의 구조를 살짝 바꾸고 나온 결과를 뒤집으면 후위 순회 순서와 같아짐**

### 표준 전위 순회 vs 변형 전위 순회

- 표준 전위 순회 : (Root) → (Left) → (Right)

- 변형 전위 순회 : (Root) → (Right) → (Left)

### 변형 전위 순회를 뒤집으면?

- **뒤집은** 변형 전위 순회 : (Left) → (Right) → (Root)

- 표준 후위 순회 : (Left) → (Right) → (Root)

### 표준 전위 순회 / 변형 전위 순회 / 후위 순회 예제

~~~mathematica
        A
       / \
      B   C
     / \   \
    D   E   F
~~~

- 표준 전위 순회 (Root → Left → Right)
~~~mathematica
A → B → D → E → C → F
~~~
- 변형 전위 순회 (Root → Right → Left)
~~~mathematica
A → C → F → B → E → D
~~~
- 후위 순회 (Left → Right → Root)
~~~mathematica
D → E → B → F → C → A
~~~

### C언어 예제

~~~c
void postOrderIterativeS2(BSTNode *root)
{
	if (root == NULL)
		return;

	Stack *stk1 = malloc(sizeof(Stack));
	Stack *stk2 = malloc(sizeof(Stack));
	stk1->top = NULL;
	stk2->top = NULL;

	push(stk1, root);

	while (!isEmpty(stk1))
	{
		BSTNode *cur = pop(stk1);
		push(stk2, cur);

		if (cur->left)
			push(stk1, cur->left);
		if (cur->right)
			push(stk1, cur->right);
	}

	while (!isEmpty(stk2))
	{
		BSTNode *cur = pop(stk2);
		printf("%d, ", cur->item);
	}

	free(stk1);
	free(stk2);
}
~~~