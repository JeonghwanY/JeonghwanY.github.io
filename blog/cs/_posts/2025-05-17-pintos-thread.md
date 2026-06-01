---
layout: post
title:  "PintOS 1주차: Alarm Clock과 Priority Scheduling 구현"
date:   2025-05-17
categories: cs
tags: [운영체제]
hide_last_modified: true
---

* toc
{:toc .large-only}

PintOS 첫 주차 thread 구현을 다룬다. Busy Waiting을 Sleep/Wakeup으로 바꾸고,
Priority Scheduling(Preemption + Donation)을 구현한다.

## 1. Alarm Clock — Busy Waiting → Sleep/Wakeup

현재 thread는 busy waiting 방식으로 구동되고 있다.

### 1-1. Busy Waiting이란?

어떤 리소스를 기다릴 때 CPU를 계속 사용하면서 반복적으로 검사(polling)하는 방식이다.

![Busy-waiting](/assets/img/blog/cs/busywaiting.png)

문제점은 다음과 같다.

- **CPU 낭비**: 실제로는 '기다리기만' 하면서 CPU를 100% 사용
- **다른 작업 불가**: 기다리는 동안 다른 프로세스·스레드를 수행할 수 없음
- **에너지 비효율**: 특히 모바일·서버 환경에서 불필요한 전력 소모

### 1-2. 해결책: Blocking (Sleep/Wakeup)

OS는 busy waiting 대신 **Blocking(Sleep)** 기법을 쓴다. 기다릴 일이 생기면 CPU를 반납하고 Sleep 상태로 들어가며, 이벤트가 발생하면 OS가 다시 깨운다(Wakeup). 이를 **Interrupt-driven** 방식이라고도 한다.

| 항목 | Busy Waiting | Blocking |
|:---:|:---:|:---:|
| CPU 사용 | 기다리는 동안 100% | 기다릴 때 0% (다른 작업 실행) |
| 응답성 | 나쁨 (CPU 계속 점유) | 좋음 (필요할 때만 점유) |
| 에너지 소모 | 높음 | 낮음 |
| 시스템 처리량 | 낮음 | 높음 |

예를 들어 100개의 프로세스가 어떤 이벤트를 기다린다고 하자. Busy waiting이면 100개 모두 CPU를 쓰려 해 CPU가 1개면 다른 일을 전혀 못 한다. Blocking이면 99개는 잠자고 필요한 프로세스만 CPU를 쓰므로, CPU가 다른 요청도 병행 처리할 수 있다.

### 1-3. Sleep/Wakeup 구조 설계

`sleep_list`를 만들어 `wakeup_tick`(alarm 시간)만큼 재울 thread를 넣고, `wakeup_tick`에 도달하면 `ready_list`로 옮기는 구조로 바꾼다.

![Sleep-Wakeup](/assets/img/blog/cs/sleepwakeup.png)

먼저 `sleep_list`를 `ready_list`와 함께 선언하고, `global_tick`(sleep_list의 최소 wakeup_tick)을 선언한다. `global_tick`을 `INT64_MAX`로 초기화하는 이유는, sleep_list가 비었을 때 깨울 thread 확인 작업에 들어가지 않게 하기 위함이다.

```c
static int64_t global_tick = INT64_MAX;

static struct list ready_list;
static struct list sleep_list;
```

`thread_init`에서 `sleep_list`를 초기화한다.

```c
void
thread_init (void) {
	ASSERT (intr_get_level () == INTR_OFF);

	struct desc_ptr gdt_ds = { // x86 세그먼트 테이블 정의
		.size = sizeof (gdt) - 1,
		.address = (uint64_t) gdt
	};
	lgdt (&gdt_ds);

	/* Init the global thread context */
	lock_init (&tid_lock);          // 스레드 tid 할당 락
	list_init (&ready_list);        // ready 리스트
	list_init (&sleep_list);        // sleep 리스트
	list_init (&destruction_req);   // 삭제 예약된 스레드 리스트

	/* Set up a thread structure for the running thread. */
	initial_thread = running_thread ();
	init_thread (initial_thread, "main", PRI_DEFAULT);
	initial_thread->status = THREAD_RUNNING;
	initial_thread->tid = allocate_tid ();
}
```

깨울 기준이 되는 `wakeup_tick`을 `struct thread`에 추가한다.

```c
struct thread {
	tid_t tid;                    /* Thread identifier. */
	enum thread_status status;    /* Thread state. */
	char name[16];                /* Name (for debugging). */
	int64_t wakeup_tick;          // 깨울 시간
	int priority;                 /* Priority. */
	int original_priority;
	struct list donations;
	struct list_elem d_elem;
	struct lock *wait_on_lock;

	struct list_elem elem;        /* List element. */
};
```

### 1-4. timer_sleep과 thread_sleep 수정

`timer_sleep`에서 busy waiting(`thread_yield` 루프)을 `thread_sleep` 호출로 바꾼다.

```c
void
timer_sleep (int64_t ticks) {
	int64_t start = timer_ticks ();

	ASSERT (intr_get_level () == INTR_ON);
	if (timer_elapsed(start) < ticks)
		thread_sleep(start + ticks);
}
```

`thread_sleep`은 `wakeup_tick`을 저장하고 sleep_list에 **정렬 삽입**(깨울 시간이 임박한 것이 앞에 오도록)한 뒤, `update_global_tick`으로 global_tick을 최소값으로 갱신하고 block한다.

```c
void
thread_sleep(int64_t ticks){
	if (thread_current() != idle_thread){
		enum intr_level old_level = intr_disable();
		struct thread *cur = thread_current();
		cur->wakeup_tick = ticks;

		list_insert_ordered(&sleep_list, &cur->elem, cmp_wakeup_tick, NULL); // 정렬 삽입
		update_global_tick();   // global tick 갱신
		thread_block();         // block 상태로 변경
		intr_set_level(old_level);
	}
}

static bool // 깨어날 순으로 오름차순 정렬
cmp_wakeup_tick(const struct list_elem *a_, const struct list_elem *b_, void *aux UNUSED){
	struct thread *a = list_entry(a_, struct thread, elem);
	struct thread *b = list_entry(b_, struct thread, elem);
	return a->wakeup_tick < b->wakeup_tick;
}

static void update_global_tick() { // global_tick을 최소값으로 갱신
	if (!list_empty(&sleep_list)){
		struct thread *a = list_entry(list_front(&sleep_list), struct thread, elem);
		global_tick = a->wakeup_tick;
	}
	else{
		global_tick = INT64_MAX;
	}
}
```

### 1-5. timer_interrupt에서 깨우기

`timer_interrupt`에서 `check_global_tick`으로 깨울 시간이 됐는지 확인하고, 됐다면 `wakeup_thread`를 실행한다.

```c
/* Timer interrupt handler. */
static void
timer_interrupt (struct intr_frame *args UNUSED) {
	ticks++;
	thread_tick (); // running 스레드의 CPU 사용량 업데이트
	if (check_global_tick(ticks))
		wakeup_thread (ticks); // 깨울 스레드 찾아가기
}

bool
check_global_tick(int64_t ticks){
	return ticks >= global_tick;
}

void
wakeup_thread (int64_t target_ticks){
	while (!list_empty(&sleep_list)) {
		struct list_elem *target_ele = list_front(&sleep_list);
		struct thread *target = list_entry(target_ele, struct thread, elem);

		if (target->wakeup_tick <= target_ticks) {
			list_remove(target_ele);
			thread_unblock(target);
		} else {
			break; // 정렬돼 있으므로 더 볼 필요 없음
		}
	}
	update_global_tick(); // 갱신
}
```

이렇게 수정하면 아래와 같은 결과가 나온다.

![Alarm-result](/assets/img/blog/cs/alarmresult.png)

## 2. Priority Scheduling — Preemption과 Donation

### 2-1. Preemption이란?

선취권이라는 뜻으로, `ready_list`에 thread가 들어갈 때 현재 running thread와 priority를 비교해, 새 thread가 더 높으면 running thread를 재우고 ready_list의 최고 우선순위 thread를 실행하는 것이다.

### 2-2. Preemption 구현

`thread_create`에서 thread를 ready_list에 넣은 뒤 `thread_ready_check`로, 현재 thread와 새 thread의 priority를 비교해 조건에 따라 `thread_yield`한다.

```c
tid_t
thread_create (const char *name, int priority,
		thread_func *function, void *aux) {
	struct thread *t;
	tid_t tid;

	ASSERT (function != NULL);

	t = palloc_get_page (PAL_ZERO);
	if (t == NULL)
		return TID_ERROR;

	init_thread (t, name, priority);
	tid = t->tid = allocate_tid ();

	t->tf.rip = (uintptr_t) kernel_thread;
	t->tf.R.rdi = (uint64_t) function;
	t->tf.R.rsi = (uint64_t) aux;
	t->tf.ds = SEL_KDSEG;
	t->tf.es = SEL_KDSEG;
	t->tf.ss = SEL_KDSEG;
	t->tf.cs = SEL_KCSEG;
	t->tf.eflags = FLAG_IF;

	thread_unblock (t);
	thread_ready_check(t);
	return tid;
}

void
thread_ready_check (struct thread *t){
	if ((thread_current() != idle_thread) && thread_current ()->priority < t->priority)
		thread_yield();
}
```

`thread_unblock`은 priority 기준 정렬 삽입으로 수정한다.

```c
void
thread_unblock (struct thread *t) {
	enum intr_level old_level;

	ASSERT (is_thread (t));

	old_level = intr_disable ();
	ASSERT (t->status == THREAD_BLOCKED);
	list_insert_ordered (&ready_list, &t->elem, cmp_priority, NULL);
	t->status = THREAD_READY;
	intr_set_level (old_level);
}
```

`thread_yield`도 마찬가지로 정렬 삽입한다.

```c
void
thread_yield (void) {
	struct thread *curr = thread_current ();
	enum intr_level old_level;

	ASSERT (!intr_context ());

	old_level = intr_disable ();
	if (curr != idle_thread)
		list_insert_ordered (&ready_list, &curr->elem, cmp_priority, NULL);
	do_schedule (THREAD_READY);
	intr_set_level (old_level);
}
```

`thread_set_priority`는 running thread의 priority가 ready_list 최대 priority보다 낮아지면 preemption되도록 `thread_ready_check`를 추가한다.

```c
/* Sets the current thread's priority to NEW_PRIORITY. */
void
thread_set_priority (int new_priority) {
	thread_current ()->priority = new_priority;
	if (!list_empty(&ready_list))
		thread_ready_check(list_entry(list_front(&ready_list), struct thread, elem));
}
```

이 3개 함수를 고치면 preemption 구현은 완료다.

### 2-3. 동기화와 Donation 개념

semaphore, condition variable, lock의 개념은 [동기화 기법 3대장](../../computersystem/lock-semaphore-condition){:.heading.flip-title}에, Donation의 개념은 [Donation](../../computersystem/donation){:.heading.flip-title}에 정리해두었다. 여기서 구현할 Donation의 세 가지 경우는 다음과 같다.

| 종류 | 상황 | 원리 |
|:---:|:---|:---|
| One Donation | lock의 waiter 리스트가 있을 때 | waiter 중 가장 높은 priority로 donation |
| Nested Donation | lock을 가진 thread가 또 다른 lock의 waiter일 때 | 가장 높은 priority 기준으로 요청 중인 lock 쪽으로 연쇄 donation |
| Multiple Donation | 하나의 thread가 여러 lock을 가질 때 | 모든 lock의 waiter 중 가장 높은 priority로 donation |

![Donation One](/assets/img/blog/cs/donationone.png)
![Nested Donation](/assets/img/blog/cs/nesteddonation.png)

Multiple Donation에서 가장 높은 priority를 내준 thread에게 lock 권한을 넘기면, 아래 사진 기준 T1은 T4보다 낮은(나머지 중 최고) priority를 갖게 되고 일할 권한은 T4가 가진다.

![Multiple Donation](/assets/img/blog/cs/multipledonation.png)

다른 예로, T3가 T4에게 lock을 넘긴 뒤를 보면, T3의 priority가 계속 높아 T4는 아직 일하지 못한다. T3가 (T6가 요청한) lock을 넘기고 T6가 모든 일을 마쳐야만 T4가 일할 수 있다.

![Multiple Donation](/assets/img/blog/cs/multipledonated.png)
![Multiple Donation](/assets/img/blog/cs/t3stillrunning.png)

### 2-4. Donation 구현

`struct thread`에 donation 관련 필드를 추가한다. donations 리스트, 거기에 넣을 `d_elem`, 기다리는 lock을 명시할 `*wait_on_lock`, 그리고 priority가 변했다가 복원되도록 `original_priority`를 둔다.

```c
struct thread {
	tid_t tid;
	enum thread_status status;
	char name[16];
	int64_t wakeup_tick;          // 깨울 시간
	int priority;
	int original_priority;
	struct list donations;
	struct list_elem d_elem;
	struct lock *wait_on_lock;

	struct list_elem elem;
}
```

`init_thread`에서 donations 리스트를 초기화하고 `original_priority`를 저장한다.

```c
static void
init_thread (struct thread *t, const char *name, int priority) {
	ASSERT (t != NULL);
	ASSERT (PRI_MIN <= priority && priority <= PRI_MAX);
	ASSERT (name != NULL);

	memset (t, 0, sizeof *t);
	t->status = THREAD_BLOCKED;
	strlcpy (t->name, name, sizeof t->name);
	t->tf.rsp = (uint64_t) t + PGSIZE - sizeof (void *);
	t->priority = priority;
	t->magic = THREAD_MAGIC;
	list_init (&(t->donations)); // donations 리스트
	t->original_priority = priority;
}
```

이제 핵심부다. **Multiple과 Nested donation이 함께 나온다.** `lock_acquire`에서 `lock->holder`가 있으면 donation이 가능하도록 `mult_donation`을 실행한다(One donation 기능 포함). `mult_donation`은 각 lock에 대해 priority가 최대인 thread의 `d_elem`이 donations 리스트에 들어가게 하고, 끝날 때쯤 조건부로 `nested_donation`을 부른다.

```c
void
lock_acquire (struct lock *lock) {
	ASSERT (lock != NULL);
	ASSERT (!intr_context ());
	ASSERT (!lock_held_by_current_thread (lock));

	if (lock->holder != NULL)
	{
		mult_donation(lock);
	}

	sema_down (&lock->semaphore);
	lock->holder = thread_current ();
	thread_current()->wait_on_lock = NULL;
}

void
mult_donation(struct lock *lock)
{
	struct thread *lock_holder = lock->holder;
	enum intr_level old_level;

	ASSERT (!intr_context ());
	old_level = intr_disable ();

	thread_current()->wait_on_lock = lock;
	if (list_empty(&lock->semaphore.waiters))
		list_insert_ordered(&lock_holder->donations, &thread_current()->d_elem, cmp_priority_d_elem, NULL);
	else
	{
		struct list_elem *elem = list_begin(&lock->semaphore.waiters);
		struct thread *thread = list_entry(elem, struct thread, elem);
		if (thread->priority < thread_current()->priority)
		{
			list_remove(&thread->d_elem);
			list_insert_ordered(&lock_holder->donations, &thread_current()->d_elem, cmp_priority_d_elem, NULL);
		}
	}

	if (lock_holder->priority < thread_current()->priority)
	{
		lock_holder->priority = thread_current()->priority;

		if (lock_holder->wait_on_lock != NULL)
			nested_donation(lock_holder->wait_on_lock);
	}
	intr_set_level (old_level);
}

void
nested_donation (struct lock *lock)
{
	if (lock->holder != NULL)
	{
		if (lock->holder->priority < thread_current()->priority)
		{
			lock->holder->priority = thread_current()->priority;

			if(lock->holder->wait_on_lock != NULL)
				nested_donation(lock->holder->wait_on_lock);
		}
	}
}
```

`lock_release`에서는 donations 리스트가 비었으면 `original_priority`로 복원하고, 있으면 해제하는 lock의 waiter를 donations에서 빼준 뒤 자신의 priority를 (original과 donation 최대값 중 큰 쪽으로) 맞춘다.

```c
void
lock_release (struct lock *lock) {
	ASSERT (lock != NULL);
	ASSERT (lock_held_by_current_thread (lock));

	if (list_empty(&lock->holder->donations))
	{
		thread_current()->priority = thread_current()->original_priority;
	}
	else
	{
		enum intr_level old_level;
		ASSERT (!intr_context ());
		old_level = intr_disable ();

		if (!list_empty(&lock->semaphore.waiters))
		{
			struct list_elem *elem = list_begin(&lock->semaphore.waiters);
			struct thread *thread = list_entry(elem, struct thread, elem);
			list_remove(&thread->d_elem);
		}
		struct list_elem *donation_elem = list_max(&thread_current()->donations, cmp_priority, NULL);
		int donation_max = list_entry(donation_elem, struct thread, d_elem)->priority;

		if (thread_current()->original_priority > donation_max)
			thread_current()->priority = thread_current()->original_priority;
		else
			thread_current()->priority = donation_max;

		intr_set_level (old_level);
	}

	lock->holder = NULL;
	sema_up (&lock->semaphore);
}
```

마지막으로 도중에 priority를 바꾸는 `thread_set_priority`도 donation을 고려해 수정한다. donation을 받은 상태라면 original_priority만 갱신하고 현재 priority는 유지해야 한다.

```c
void
thread_set_priority (int new_priority)
{
	thread_current ()->original_priority = new_priority;
	if (new_priority > thread_current()->priority)
		thread_current()->priority = new_priority;
	else if(list_empty(&thread_current()->donations)){
		thread_current()->priority = new_priority;
	}
	if (!list_empty(&ready_list))
		thread_ready_check(list_entry(list_front(&ready_list), struct thread, elem));
}
```

여기까지 구현하면 아래와 같은 결과를 볼 수 있다.

![1주차 결과](/assets/img/blog/cs/projectoneresult.png)

## 3. 주의사항

- list에 변경 작업이 있을 때는 **interrupt를 끄고**, 작업 후 다시 켜는 것이 좋다.