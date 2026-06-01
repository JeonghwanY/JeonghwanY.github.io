---
layout: post
title:  "PintOS 1주차 thread 구현"
description: >
 이 글에서는 PintOS 첫주차에 thread 구현에 관련하여서 다루겠다.
date:   2025-05-15
tags: [운영체제]
hide_last_modified: true
---

* toc  
{:toc .large-only}

이번 주차부터 PintOS 프로젝트가 시작 되었다. OS를 만드는 프로젝트이다 보니, 두려움이 있었지만, 다행히도 구현하기 위한 자료들이 hint를 많이 줘서 구현하는 데에는 크게 문제가 없었다. 다만 마지막 multiple donation에 관련한 코드들에 대해서는 조금 애먹는 부분이 있었다. 여기서는 Alarm Clock, Priority Scheduling에 대해서 다룰것이다. 그러면 thread 구현 처음부터 시작하겠다.

## Alarm Clock - Busy Waiting 에서 Sleep/Wakeup 방식으로의 변경

현재 thread 같은 경우 busy Waiting 방식으로 구동되고 있다.

### Busy Waiting이란?

아래 그림처럼 어떤 리소스를 기달리 때 CPU를 계속 사용하면서 반복적으로 검사(polling)하는 방식이야.

![Busy-waiting](/assets/img/blog/cs/busywaiting.png)

#### Busy Waiting의 문제점

- CPU 낭비 : 프로그램이 실제로는 '기다리기만'하고 있음에도 CPU를 100% 사용한다는 점.

- 다른 작업 불가 : 기다리는 동안 CPU가 다른 프로세스(또는 스레드)를 수행할 수가 없음.

- 에너지 비효율 : 특히 모바일, 서버 환경에서는 불필요한 전력 소모를 일으킨다.

#### Busy Waiting을 없애면?

OS는 Busy Waiting 대신 **"Blocking" (or "Sleep")**이라는 기법을 사용함.

- 기다려야 할 일이 생기면 CPU를 반납하고, 자신은 Sleep 상태로 들어간다.

- CPU는 바로 다른 프로세스를 실행할 수 있게 됨.

- 이벤트가 발생하면 OS가 해당 프로세스를 다시 깨운다(Wakeup).

- 이 방법을 "Interrupt-driven" 방식이라고도 해.

#### 그래서 효율이 왜 좋아지나?

**→ CPU 사용률, 시스템 자원 효율, 에너지 소모 관점 모두 개선되기 때문**

| 항목 | Busy Waiting | Blocking |
|:---:|:---:|:---:|
| CPU 사용 | 기다리는 동안 100% | 기다릴 때 0% (다른 작업 실행) |
| 웅답성 | 나쁨(CPU를 계속 점유) | 좋음(필요할 때만 CPU 점유) |
| 에너지 소모 | 높음 | 낮음 |
| 시스템 처리량 | 낮음 | 높음 |

- 시스템 전체로 보면 훨씬 많은 프로세스가 공정하게 실행될 수 있게 됨.

- 사용자가 체감하는 반응성도 좋아진다.

- 서버 입장에서도 **병렬 처리량(throughput)**이 훨씬 올라간다.

#### 간단한 예시

만약 100개의 프로세스가 어떤 이벤트를 기다린다고 해보자.

- Busy Waiting이면 100개 모두 CPU를 쓰려고 하니까,

    - CPU가 1개일 경우 전혀 다른 일을 못 해.

- Blocking이면,

    - 99개는 잠자고, 필요한 프로세스만 CPU를 쓴다.

    - CPU는 다른 요처도 병행 처리할 수 있어.

#### 요약

**Busy Waiting을 없애고 Blocking으로 바꾸면,**

- CPU 낭비 없이

- 동시에 여러 작업을 잘 처리할 수 있게 되고

- 에너지도 절약하고

- 사용자 응답성(인터렉티브성)도 좋아진다.

## Busy Waiting 에서 Sleep/Wakeup 방식으로의 병경 return

그러면 어떤 구조로 바꾸어야 할까? 아래와 같이 sleep_list를 하나 만들어서 wakeup_tick(alarm 시간)만큼 쉬게 할 thread를 넣어주고, wakeup_tick이 도달하면 ready_list에 넣어주는 구조로 바꾸어야 한다.

![Sleep-Wakeup](/assets/img/blog/cs/sleepwakeup.png)

그러기 위해선 sleep_list 구조체를 ready_list와 동일하게 thread.c 파일 상단에 선언해주고 global_tick(sleep_list의 최소 wakeup_tick값)을 선언해 주었다. 여기서 처음에 INT64_MAX값으로 선언한 이유는, global_tick은 sleep_list에 들어가서 깨울 thread가 있는지 확인하기 위함인데, 일단은 아무것도 없을때, 확인하러 들어가지 않게끔 하려고 MAX로 선언하였다.

~~~c
static int64_t global_tick = INT64_MAX;

static struct list ready_list;
static struct list sleep_list;
~~~

thread_init이 될때, sleep_list가 초기화 되면서 list로써의 기능을 할 수 있게 list_init함수를 써주었다.

~~~c
void
thread_init (void) {
	ASSERT (intr_get_level () == INTR_OFF);

	/* Reload the temporal gdt for the kernel
	 * This gdt does not include the user context.
	 * The kernel will rebuild the gdt with user context, in gdt_init (). */
	struct desc_ptr gdt_ds = { // x86 에서 세그먼트 테이블 정의
		.size = sizeof (gdt) - 1,
		.address = (uint64_t) gdt
	};
	lgdt (&gdt_ds);

	/* Init the globla thread context */
	lock_init (&tid_lock); // 쓰레드 tid 할당 락 (세마포어로 되어있음)
	list_init (&ready_list); // 쓰레드 ready 리스트
	list_init (&sleep_list); // 쓰레드 sleep 리스트
	list_init (&destruction_req); //삭제 예약된 스레드들의 리스트

	/* Set up a thread structure for the running thread. */
	initial_thread = running_thread ();
	init_thread (initial_thread, "main", PRI_DEFAULT);
	initial_thread->status = THREAD_RUNNING;
	initial_thread->tid = allocate_tid ();
}
~~~

sleep_list에서 깨울 thread의 기준이 되는 wakeup_tick을 struct thread에 추가해준다

~~~c
struct thread {
	/* Owned by thread.c. */
	tid_t tid;                          /* Thread identifier. */
	enum thread_status status;          /* Thread state. */
	char name[16];                      /* Name (for debugging purposes). */
	int64_t wakeup_tick;				// 깨울시간
	int priority;                       /* Priority. */
	int original_priority;
	struct list donations;
	struct list_elem d_elem;
	struct lock *wait_on_lock;

	/* Shared between thread.c and synch.c. */
	struct list_elem elem;              /* List element. */
};
~~~

위 과정을 진행하였으면, 이제 timer_sleep에서 Busy Waiting을 Sleep/Wakeup 구조로 바꿀 때가 되었다.

~~~c
void
timer_sleep (int64_t ticks) {
	int64_t start = timer_ticks ();

	ASSERT (intr_get_level () == INTR_ON);
	// while (timer_elapsed (start) < ticks)
	// 	thread_yield ();
	if (timer_elapsed(start) < ticks) 
		 thread_sleep(start + ticks);
}
~~~

위에서 thread_sleep으로 넘어가니, thread_sleep에서도 구조를 바꿔줘야 한다.

wakeup_tick에 ticks값이 저장되도록 하고, sleep_list에 정렬 삽입을 통해 깨울 시간이 임박한것이 제일 앞에 오게끔 한다. 그런 후 updat_global_tick 함수 같은 경우 편의상 추가했는데, 이 함수를 통해서 global_tick이 sleep_list에서 최소값으로 갱신되게끔 한다. 함수 내용은 아래에 추가하였다.

~~~c
void
thread_sleep(int64_t ticks){
	if (thread_current() != idle_thread){
		enum intr_level old_level = intr_disable();
		struct thread *cur = thread_current();
		cur->wakeup_tick = ticks;

		// 정렬 삽입
		list_insert_ordered(&sleep_list, &cur->elem, cmp_wakeup_tick, NULL);

		// global tick 갱신
		update_global_tick();


		thread_block(); // block 상태로 변경
		intr_set_level(old_level); // 인터럽트 disable 해제
	}
}

static bool // 추가 함수 : 깨어날 순으로 오름차순 정렬 함수
cmp_wakeup_tick(const struct list_elem *a_, const struct list_elem *b_, void *aux UNUSED){ 
	struct thread *a = list_entry(a_, struct thread, elem);
	struct thread *b = list_entry(b_, struct thread, elem);

	return a->wakeup_tick < b->wakeup_tick;
}

static void update_global_tick() { // 추가 함수 : global_ticks 작은 값으로 초기화
	if (!list_empty(&sleep_list)){
	struct thread *a = list_entry(list_front(&sleep_list), struct thread, elem);
	global_tick = a->wakeup_tick;
	}

	else{
		global_tick = INT64_MAX;
	}
}
~~~

timer_interrupt에서는 global_tick을 확인해주는 check_global_tick 함수를 통해서 wakeup_thread가 실행되게끔 한다.

~~~c
/* Timer interrupt handler. */
static void // timer_interrupt 가 일어났을때 확인할 것 !
timer_interrupt (struct intr_frame *args UNUSED) {
	ticks++;
	thread_tick (); // running 스레드의 cpu 사용량 업데이트
	if (check_global_tick(ticks))
		wakeup_thread (ticks); // 깨울친구 찾아가기
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
			break;
		}
	}
	//갱신
	update_global_tick(); 
}
~~~

이렇게 수정한다면, 아래와 같이 결과가 나온다.

![Alarm-result](/assets/img/blog/cs/alarmresult.png)

## Priority Scheduling - Preemption기능과 Priority Donation 우선순위 기능 구현

구현에 앞서, Preemption과 Priority Donation 기능에 대해 설명하겠다.

### Preemption

Preemption이란 선취권이라는 뜻으로 여기서는 ready_list에 thread가 들어갈 때, 현재 작동중인 running_thread와의 priority를 비교했을 때, running_thread보다 높다면 running_thread를 재우고 ready_list에서 제일 높은 priority를 갖는 thread를 running 시키겠다는 의미이다.

### Preemption 구현

먼저 thread_create() 될때, priority가 설정되면서 ready_list에 넣어진다. 그렇지만, 여기서 ready_list에 넣어진 후 위에서 언급한 기능 추가를 위해 thread_ready_check()함수를 썼다. 이 함수는 현재 작동중인 thread의 priority와 thread_create되는 thread의 priority를 비교하고 그 조건에 따라서 thread_yield()되는 함수이다.

~~~c
tid_t
thread_create (const char *name, int priority,
		thread_func *function, void *aux) {
	struct thread *t;
	tid_t tid;

	// 새로운 스레드를 생성할 때 커널 스택 할당
	// 실행할 함수로 start_process를 등록
	// 이 스레드를 ready_list에 추가함

	ASSERT (function != NULL);

	/* Allocate thread. */
	t = palloc_get_page (PAL_ZERO);
	if (t == NULL)
		return TID_ERROR;

	/* Initialize thread. */
	init_thread (t, name, priority);
	tid = t->tid = allocate_tid ();

	/* Call the kernel_thread if it scheduled.
	 * Note) rdi is 1st argument, and rsi is 2nd argument. */
	t->tf.rip = (uintptr_t) kernel_thread;
	t->tf.R.rdi = (uint64_t) function;
	t->tf.R.rsi = (uint64_t) aux;
	t->tf.ds = SEL_KDSEG;
	t->tf.es = SEL_KDSEG;
	t->tf.ss = SEL_KDSEG;
	t->tf.cs = SEL_KCSEG;
	t->tf.eflags = FLAG_IF;

	/* Add to run queue. */
	thread_unblock (t);
	thread_ready_check(t);
	return tid;
}

void
thread_ready_check (struct thread *t){
	if ((thread_current() != idle_thread) && thread_current ()->priority < t->priority)
		thread_yield();
}
~~~

thread_unblock 함수에서는 priority 기준으로 ready_list에 들어가게끔 수정해준다.

~~~c
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
~~~

현재 thread가 priority가 낮은 이유로 thread_yield가 된다고 했을 때, 이때도 마찬가지로 ready_list에 정렬되어서 들어가게 수정했다.

~~~c
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
~~~

thread_set_priority 함수는 도중에 running_thread의 priority를 바꾸는 함수인데, 이때 ready_list의 최대 priority보다 낮게 변경되면, 이때도 preemption을 위해 아래와 같이 thread_ready_check()함수를 추가해 줬다.

~~~c
/* Sets the current thread's priority to NEW_PRIORITY. */
void
thread_set_priority (int new_priority) {
	thread_current ()->priority = new_priority;
	// list_sort(&ready_list, cmp_priority, NULL);
	if (!list_empty(&ready_list))
		thread_ready_check(list_entry(list_front(&ready_list), struct thread, elem));
}
~~~

위 3가지 함수를 고치면, preemption구현은 완료된 상태이다.

### Synchronization 

그렇다면, 위에서 언급한 semaphore, condition variable, lock에 대해서 설명하자면, [동기화 기법 3대장 : Lock/Semaphore/Condition Variable](../../computersystem/lock-semaphore-condition){:.heading.flip-title}에 나와 있다.

### Donation

Donation도 마찬가지로 개념은 [Donation](../../computersystem/donation){:.heading.flip-title}에 나와 있다. 개념 외적으로, 여기서 구현할 Donation에 대해 알려주겠다.


#### One Donation

가장 기본적인 Donation으로, lock이 된 semaphore의 waiter리스트에 있는 thread중 priority가 제일 높은 값으로 donation되는것이다.

![Donation One](/assets/img/blog/cs/donationone.png)

#### Nested Donation

아래 사진처럼, lock을 갖고 있는 thread가 또 다른 lock의 waiter일때의 경우에 적용되는데, priority가 제일 높은 thread 기준으로 요청하고 있는 lock쪽으로 donation이 되는 원리이다.

![Nested Donation](/assets/img/blog/cs/nesteddonation.png)

#### Multiple Donation

하나의 thread가 여러개의 lock을 갖고 있을때의 경우이다. 이런 경우에는, 모든 lock에 대한 waiter중 제일 높은 priority가 donation되는것이다. 제일 높은 priority를 내준 thread에게 lock 권한을 넘겨주면, 알래 사진 기준으로 T1의 priority는 T4보다 낮은 제일 높은 priority를 갖게 되고 일할 권한은 T4가 가지게 된다.

![Multiple Donation](/assets/img/blog/cs/multipledonation.png)

다른 예를 들어보자, 아래 그림을 보았을때, T3가 T4에게 lock을 넘겨준 후의 얘기이다. 보면, T3의 priority는 계속 높기 때문에, T4는 일을 아직 하지 못한다. T3가 T6가 요청한 lock을 넘겨주고 T6가 모든일을 마쳤을 경우에만, T4가 일을 할 수 있다.

![Multiple Donation](/assets/img/blog/cs/multipledonated.png)
![Multiple Donation](/assets/img/blog/cs/t3stillrunning.png)

### Priority Donation 구현

먼저 thread의 구조체에 donations list, donations list에 넣을 d_elem, 특정 lock에 기다리고 있다는 것을 명시하기 위한 *wait_on_lock을 추가해줘야 한다. 그리고 priority가 계속 변하고 되돌아오기 위해 original_priority를 추가해 줬다.

~~~c
struct thread {
	/* Owned by thread.c. */
	tid_t tid;                          /* Thread identifier. */
	enum thread_status status;          /* Thread state. */
	char name[16];                      /* Name (for debugging purposes). */
	int64_t wakeup_tick;				// 깨울시간
	int priority;                       /* Priority. */
	int original_priority;
	struct list donations;
	struct list_elem d_elem;
	struct lock *wait_on_lock;


	/* Shared between thread.c and synch.c. */
	struct list_elem elem;              /* List element. */
}
~~~

위에서 추가해준 donations list를 초기화해 주고, original_priority를 priority로 저장한다.

~~~c
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
	list_init (&(t->donations)); // 쓰레드 donations리스트
	t->original_priority = priority;
}
~~~

이제 조금 복잡해진다. Multiple donation과 Nested donation이 같이 나오니 주의깊게 보자. 먼저 lock->holder가 없다면 바로 lock을 얻을 수 있기 때문에, 그 반대인 lock->holder가 있으면 donation이 될 수 있게끔 mult_donation함수를 실행시킨다. 여기서 mult_donation은 One donation 기능도 포함되어 있다. mult_donation을 통해 donations list에 들어가는데, 각 lock에 대해서 priority가 최대인 thread의 d_elem이 들어갈 수 있게끔 함수를 짰다.

mult_donation 함수가 끝날때쯤 nested_donation이 조건부로 실행된다.

~~~c
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
~~~

lock_release에서는 donations 리스트가 없으면 original_priority로 변경되게끔 하였고, donations 리스트가 있고 그 donations리스트에 lock되어있는 semaphore의 waiter가 있으면 donations리스트에서 waiter를 빼준다. 그리고 자신의 priority를 최대값으로 맞추기 위한 작업을 진행해 준다.

~~~c
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
~~~

마지막으로 도중에 priority를 바꾸는 함수 thread_set_priority()를 고쳐주어야 하는데, 아래와 같이 구현했다.

~~~c
void
thread_set_priority (int new_priority) 
{
	thread_current ()->original_priority = new_priority;
	if (new_priority > thread_current()->priority)
		thread_current()->priority = new_priority;
	else if(list_empty(&thread_current()->donations)){
		thread_current()->priority = new_priority;
	}
	// list_sort(&ready_list, cmp_priority, NULL);
	if (!list_empty(&ready_list))
		thread_ready_check(list_entry(list_front(&ready_list), struct thread, elem));
}
~~~

이렇게 다 구현을 한다면, 아래와 같은 결과를 볼 수 있다.

![1주차 결과](/assets/img/blog/cs/projectoneresult.png)

## 주의사항 

- list에 변경 작업이 있을시에는 interrupt를 끄고 작업후에는 키는것이 좋다고 한다.