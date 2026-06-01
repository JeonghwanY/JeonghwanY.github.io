---
layout: post
title:  "PintOS 2~3주차: Argument Passing & System Call 구현"
date:   2025-05-29
categories: cs
tags: [운영체제]
hide_last_modified: true
---

* toc
{:toc .large-only}

지난주 multiple-thread까지 구현했고, 이번 주부터는 PintOS 2~3주차 **argument passing**과 **system call**을 구현한다.

## 1. Argument Passing 기초

본격적인 구현 전에 알아둘 것이 있다. 커널은 User program 실행을 허가하기 전에, 초기 함수에 전달할 인자들을 레지스터에 올려둬야 한다. 이 인자들은 **호출 규약(calling convention)** 과 동일한 방식으로 전달된다.

### 1-1. 호출 규약

| 순서 | 동작 |
|:---:|:---|
| 1 | 정수 인자는 `%rdi`, `%rsi`, `%rdx`, `%rcx`, `%r8`, `%r9` 순서로 레지스터에 전달 |
| 2 | 호출자가 리턴 어드레스를 스택에 push하고 피호출자 첫 인스트럭션으로 점프 (x86-64 `CALL` 한 명령이 이 둘을 모두 수행) |
| 3 | 피호출자 실행 |
| 4 | 리턴 값이 있으면 `%rax`에 저장 |
| 5 | 피호출자가 `RET`로 스택의 리턴 어드레스를 pop해 그 주소로 점프하며 리턴 |

#### 예시: f(1, 2, 3)

세 정수 인자를 받는 `f()`를 `f(1, 2, 3)`으로 호출했을 때, 위 3번(피호출자 실행) 시점의 스택·레지스터 상태는 다음과 같다.

```
                             +----------------+
stack pointer --> 0x4747fe70 | return address |
                             +----------------+
RDI: 0x...0001   RSI: 0x...0002   RDX: 0x...0003
```

### 1-2. Argument Parsing 규칙

`/bin/ls -l foo bar` 같은 명령이 주어지면 다음 순서로 처리한다.

1. 명령을 단어로 쪼갠다: `/bin/ls`, `-l`, `foo`, `bar`
2. 단어들을 스택 맨 처음 부분에 놓는다 (순서 무관 — 포인터로 참조하기 때문)
3. 각 문자열의 주소와 경계용 널포인터를 **오른쪽 → 왼쪽** 순서로 push한다. 이들이 `argv`의 원소가 된다
   - 널포인터 경계는 `argv[argc]`가 널이라는 C 표준 요구를 만족시킨다
   - 이 순서 덕분에 `argv[0]`이 가장 낮은 가상 주소를 갖는다
   - word 크기 정렬 접근이 더 빠르므로, 첫 push 전에 스택 포인터를 **8의 배수로 반올림**한다
4. `%rsi`가 `argv` 주소(`argv[0]`의 주소)를, `%rdi`가 `argc`를 가리키게 한다
5. 마지막으로 가짜 "리턴 어드레스"를 push한다. Entry 함수는 리턴하지 않지만, 스택 프레임 구조를 다른 프레임과 동일하게 맞추기 위함이다

### 1-3. 스택 구조 예시

유저 프로그램 시작 직전의 스택·레지스터 상태다. 스택은 **아래 방향(높은 주소 → 낮은 주소)으로 커진다**는 점을 염두에 두자.

| Address | Name | Data | Type |
|:---:|:---:|:---:|:---:|
| 0x4747fffc | argv[3][...] | `'bar\0'` | char[4] |
| 0x4747fff8 | argv[2][...] | `'foo\0'` | char[4] |
| 0x4747fff5 | argv[1][...] | `'-l\0'` | char[3] |
| 0x4747ffed | argv[0][...] | `'/bin/ls\0'` | char[8] |
| 0x4747ffe8 | word-align | 0 | uint8_t[] |
| 0x4747ffe0 | argv[4] | 0 | char * |
| 0x4747ffd8 | argv[3] | 0x4747fffc | char * |
| 0x4747ffd0 | argv[2] | 0x4747fff8 | char * |
| 0x4747ffc8 | argv[1] | 0x4747fff5 | char * |
| 0x4747ffc0 | argv[0] | 0x4747ffed | char * |
| 0x4747ffb8 | return address | 0 | void (*) () |

레지스터는 `RDI: 4`(argc), `RSI: 0x4747ffc0`(argv) 상태가 된다.

## 2. Argument Passing 구현

PintOS의 `process_exec()`는 새 프로세스에 인자를 전달하는 기능이 없다. 단순히 파일 이름만 받던 것을, **공백 기준으로 여러 단어를 나누도록** 확장해야 한다. 첫 단어는 프로그램 이름, 그다음은 첫 번째 인자, …로 이어진다. `strtok_r()`로 구현하면 쉽다.

구현은 다음과 같다. 핵심 흐름은 ① 명령어를 토큰으로 분리 → ② 바이너리 로드 → ③ 인자 문자열·포인터·정렬·가짜 리턴 어드레스를 스택에 차례로 쌓기다.

```c
int
process_exec (void *f_name) {
	char *str = f_name;
	char *save_ptr, *token;
	char *argv[MAX_ARGS];
	int argc = 0;
	bool success;

	/* ① 공백 기준으로 토큰 분리 */
	token = strtok_r(str, " ", &save_ptr);
	while (token != NULL && argc < MAX_ARGS)
	{
		argv[argc++] = token;
		token = strtok_r(NULL, " ", &save_ptr);
	}

	char *file_name = argv[0];

	/* We cannot use the intr_frame in the thread structure.
	 * This is because when current thread rescheduled,
	 * it stores the execution information to the member. */
	struct intr_frame _if;

	_if.ds = _if.es = _if.ss = SEL_UDSEG;
	_if.cs = SEL_UCSEG;
	_if.eflags = FLAG_IF | FLAG_MBS;

	/* We first kill the current context */
	process_cleanup ();

	/* ② 바이너리 로드 */
	success = load (file_name, &_if);

	/* ③ 스택에 인자 쌓기 */
	if (success)
	{
		_if.R.rdi = argc;
		void *arg_addr[MAX_ARGS];
		void *start = _if.rsp;

		/* 인자 문자열을 역순으로 복사 */
		for(int i = argc - 1; i >= 0; i--)
		{
			size_t arg_size = strlen(argv[i]) + 1;
			start -= arg_size;
			memcpy (start, argv[i], arg_size);
			arg_addr[i] = start;
		}

		/* 16바이트 정렬 */
		uintptr_t align = (uintptr_t)start % 16;
		if (align != 0)
			start -= align;

		/* argv[argc] = NULL 경계 */
		start -= sizeof(char *);
		*(char **)start = NULL;

		/* argv 포인터들을 역순으로 push */
		for (int i = argc - 1; i >= 0; i--)
		{
			start -= sizeof(char *);
			*(char **)start = arg_addr[i];
		}

		_if.R.rsi = start; /* argv */

		/* 가짜 리턴 어드레스 */
		start -= sizeof(void *);
		*(void **)start = NULL;

		_if.rsp = start;
	}

	// hex_dump(_if.rsp, _if.rsp, USER_STACK - _if.rsp, true);

	/* If load failed, quit. */
	palloc_free_page (file_name);
	if (!success)
		return -1;

	/* Start switched process. */
	do_iret (&_if);
	NOT_REACHED ();
}
```

`hex_dump`는 스택이 의도대로 쌓였는지 디버깅할 때 주석을 풀어 확인하면 된다.