---
layout: post
title: "[Review] Concurrency - Operating Systems Three Easy Pieces"
date: 2015-12-26 11:33:57 +0800
comments: true
categories: ['Books', 'OS']
---

{:.custom}
| **Book**    | Operating Systems: Three Easy Pieces
| **Author**  | [Remzi H. Arpaci-Dusseau](http://www.cs.wisc.edu/~remzi) and [Andrea C. Arpaci-Dusseau](http://www.cs.wisc.edu/~dusseau)
| **Link**    | [pages.cs.wisc.edu/~remzi/OSTEP](http://pages.cs.wisc.edu/~remzi/OSTEP/)

* TOC
{:toc}

# Concurrency

## Chapter 26 - Introduction

**Background**

With time sharing, we can take a single physical CPU and turn it into multiple virtual CPUs, thus enabling the illusion of multiple programs running at the same time, through time sharing.

With paging (base and bounds, segmentation), we can create the illusion of a large, private virtual memory for each process; this abstraction of the address space enables each program to behave as if it has its own memory when indeed the OS is secretly multiplexing address spaces across physical memory (and sometimes, disk).

But the abstraction of running program we use along is the process, and it’s a classic view of a single point of execution within a program. Now we introduce a new abstraction, thread. And  a **multi-threaded** program has more than one point of execution.

Perhaps another way to think of this is that each thread is very much like a separate process, except for one difference: they share the same address space and thus ca access the same data.

**Thread vs. Process**

![os-thread_vs_process.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-thread_vs_process.png)

Address space

![os-thread_address_space.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-thread_address_space.png)

**Advantage**

Efficiency, as they share the same address space.

- Save storage
- Easy context switching (no need to change page)

**Issues**

- **Sharing data**, that of accessing shared variables and the need to support atomicity for critical sections.
- **Waiting for another**, sleeping and waking interaction, where one thread must wait for another to complete some action before it continues.

**Shared Data**

The heart of the problem is **uncontrolled scheduling**.

It is a wonderful and hard problem, and should make your mind hurt (a bit). If it doesn’t, then you don’t understand! Keep working until your head hurts; you then know you’re headed in the right directinn.

![os-thread_sharing_data.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-thread_sharing_data.png)

**Key Concurrency Terms** (from Edsger Dijkstra)

A **critical section** is a piece of code that accesses a shared resource, usually a variable or data structure.

A **race condition** arises if multiple threads of execution enter the critical section at roughly the same time; both attempt to update the shared data structure, leading to a surprising (and perhaps un- desirable) outcome. The results depend on the timing execution of the code.

An **indeterminate** program consists of one or more races onditions; the output of the program varies from run to run, depending on which threads ran when. The outcome is thus not deterministic, something we usually expect from computer systems.

To avoid these problems, threads should use some kind of **mutual exclusion primitives**; doing so guarantees that only a single thread ever enters a critical section, thus avoiding racoes, and resulting in deterministic program outputs.

**Atomic**

Atomic operations are one of the most powerful underlying techniques in building computer systems.

The idea behind making a series of actions **atomic** is simply expressed with the phrase “all or nothing”; it should either appear as if all of the actions you wish to group together occurred, or that none of them occurred, with no in-between state visible. Sometimes, the grouping of many actions into a single atomic action is called a **transaction**.

In our theme of exploring concurrency, we’ll be using synchronization primitives to turn short sequences of instructions into atomic blocks of execution.

**The Wish For Atomicity**

Hardware guarantees the instructions is atomic, and provide a general set we call **synchronisation primitives** to ensure atomicity.

Hardware guarantees that the instructions execute atomically. It could not be interrupted mid-instruction, because that is precisely the guarantee we receive from the hardware: when an interrupt occurs, either the instruction has not run at all, or it has run to completion; there is no in-between state.

But, would we really want the hardware to support an “atomic update of B-tree” instruction?

No. Thus, what we will instead do is ask the hardware for a few useful instructions upon which we can build a general set of what we call **synchronization primitives**. By using these hardware synchronization primitives, in combination with some help from the operating system, we will be able to build multi-threaded code that accesses critical sections in a synchronized and controlled manner, and thus reliably produces the correct result despite the challenging nature of concurrent execution.

**Why in OS Class?**

“History” is the one-word answer; the OS was the first concurrent program, and many techniques were created for use within the OS. Later, with multi-threaded processes, application programmers also had to consider such things.

OS designers, from the very beginning of the introduction of the interrupt, had to worry about how the OS updates internal structures. Not surprisingly, page tables, process lists, file system structures, and virtually every kernel data structure has to be carefully accessed, with the proper synchronization primitives, to work correctly.

## Chapter 27 - Interlude: Thread API

**Guidelines**

There are a number of small but important things to remember when you use the POSIX thread library.

- **Keep it simple**. Above all else, any code to lock or signal between threads should be as simple as possible. Tricky thread interactions lead to bugs.
- Minimize thread interactions. Try to keep the number of ways in which threads interact to a minimum.
- **Each thread has its own stack**. If you have a locally-allocated variable inside of some function a thread is exe- cuting, it is essentially private to that thread; no other thread can (easily) access it. To share data between threads, the values must be in the heap or otherwise some locale that is globally accessible.
- **Be careful with how you pass arguments to, and return values from, threads.** In particular, any time you are passing a reference to a variable allocated on the stack, you are probably doing something wrong.
- **Check your return codes.** Of course, in any C and UNIX program- ming you do, you should be checking each and every return code, and it’s true here as well.
- **Always use condition variables to signal between threads.** While it is often tempting to use a simple flag, don’t do it.
- **Initialize locks and condition variables.** Failure to do so will lead to code that sometimes works and sometimes fails in very strange ways.
- **Use the manual pages.** On Linux, in particular, the pthread man pages (man -k pthread) are highly informative and discuss much of the nuances pre- sented here, often in even more detail.

**Thread Creation**

```c
#include <pthread.h>
int pthread_create(pthread_t * thread,
                     const pthread_attr_t *  attr,
                     void * (*start_routine)(void*),
                     void *  arg);
```

- `thread`, is a pointer to a structure of type pthread t; we’ll use this structure to interact with this thread
- `attr`, is used to specify any attributes this thread might have. Some examples include setting the stack size or perhaps in- formation about the scheduling priority of the thread.
- The third argument is the most complex, but is really just asking: which function should this thread start running in? In C, we call this a function pointer, and this one tells us the following is expected: a function name (`start routine`), which is passed a single argument of type void * (as indicated in the parentheses after start routine), and which returns a value of type void * (i.e., a void pointer).
- `arg`, is exactly the argument to be passed to the function where the thread begins execution.

***Why do we need these void pointers?***

Having a void pointer as an argument to the function start routine allows us to pass in any type of argument; having it as a return value allows the thread to return any type of result.

**Thread Completion**

```c
int pthread_join(pthread_t thread, void **value_ptr);
```

- `thread` is used to specify which thread to wait for
- `value_ptr` is a pointer to the return value you expect to get back. Because the routine can return anything, it is defined to return a pointer to void; because the pthread join() routine changes the value of the passed in argument, you need to pass in a pointer to that value, not just the value itself.

![os-thread_waiting_demo.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-thread_waiting_demo.png)

Note that one has to be extremely careful with how values are returned from a thread. In particular, never return a pointer which refers to something allocated on the thread’s call stack.

![os-thread_waiting_demo_wrong.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-thread_waiting_demo_wrong.png)

However, when it returns, the value is automatically deallocated (that’s why the stack is so easy to use, after all!), and thus, passing back a pointer to a now deallocated variable will lead to all sorts of bad results.

Not all code that is multi-threaded uses the join routine. For example, a multi-threaded web server might create a number of worker threads, and then use the main thread to accept requests and pass them to the workers, indefinitely. Such long-lived programs thus may not need to join.

**Locks**

Providing mutual exclusion to a critical section via locks.

```c
int pthread_mutex_lock(pthread_mutex_t *mutex);
int pthread_mutex_unlock(pthread_mutex_t *mutex);
```

When you have a region of code you realize is a critical section, and thus needs to be pro- tected by locks in order to operate as desired.

```c
pthread_mutex_t lock;

Pthread_mutex_init(&lock);

Pthread_mutex_lock(&lock);
x = x + 1; // or whatever your critical section is
Pthread_mutex_unlock(&olock);

// Always check for failure
void Pthread_mutex_init(pthread_mutex_t *mutex) {
    int rc = pthread_mutex_init(&lock, NULL); // dynamic initialisation, or PTHREAD_MUTEX_INITIALIZER
    assert(rc == 0); // always check success!
}
void Pthread_mutex_lock(pthread_mutex_t *mutex) {
    int rc = pthread_mutex_lock(mutex);
    assert(rc == 0);
}
void Pthread_mutex_unlock(pthread_mutex_t *mutex) {
    int rc = pthread_mutex_unlock(mutex);
    assert(rc == 0);
}
```

**Condition Variables**

Condition variables are useful when some kind of signaling must take place between threads, if one thread is waiting for another to do something before it can continue.

To use a condition variable, one has to in addition have a lock that is associated with this condition. When calling either of the above routines, this lock should be held.

```c
int pthread_cond_wait(pthread_cond_t *cond, pthread_mutex_t *mutex);
int pthread_cond_signal(pthread_cond_t *cond);
```

pthread_cond_wait(), puts the calling thread to sleep, ad thus waits for some other thread to signal it, usually when something in the program has changed that the now-sleeping thread might care about.

```c
pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t  cond = PTHREAD_COND_INITIALIZER;
Pthread_mutex_lock(&lock);
while (ready == 0)
    Pthread_cond_wait(&cond, &lock);
Pthread_mutex_unlock(&lock);
```

After initialization of the relevant lock and condition, a thread checks to see if the variable ready has yet been set to something other than zero. If not, the thread simply calls the wait routine in order to sleep until some other thread wakes it.

```c
Pthread_mutex_lock(&lock);
ready = 1;
Pthread_cond_signal(&cond);
Pthread_mutex_unlock(&lock);
```

Notice 1

When signaling (as well as when modifying the global variable ready), we always make sure to have the lock held. This ensures that we don’t accidentally introduce a race condition into our code.

Notice 2

Notice that the wait call takes a lock as its second parameter, whereas the signal call only takes a condition. The reason for this difference is that the wait call, in addition to putting the calling thread to sleep, releases the lock when putting said caller to sleep.

Imagine if it did not: how could the other thread acquire the lock and signal it to wake up? However, before returning after being woken, the pthread_cond_wait() re-acquires the lock, thus ensuring that any time the waiting thread is running between the lock acquire at the beginning of the wait sequence, and the lock release at the end, it holds the lock.

Notice 3

The waiting thread re-checks the condition in a while loop, instead of a simple if statement. Although it rechecks the condition (perhaps adding a little overhead), there are some pthread implementations that could spuriously wake up a waiting thread; in such a case, without rechecking, the waiting thread will continue thinking that the condition has changed even though it has not.

Notice 4

Don’t ever use these ad hoc synchronisations.

```c
// waitingnwhile (ready == 0)
    ; // spin

// signaling
ready = 1;
```

First, it performs poorly in many cases (spinning for a long time just wastes CPU cycles). Second, it is error prone.

**Others**

On the link line, you must also explicitly link with the pthreads library, by adding the -pthread flag.

```sh
prompt> gcc -o main main.c -Wall -pthread
```

## Chapter 28 - Locks

**The Basic Idea**

Programmers annotate source code with locks, putting them around critical sections, and thus ensure that any such critical section executes as if it were a single atomic instruction.

This lock variable (or just “lock” for short) holds the state of the lock at any instant in time. It is either available (or unlocked or free) and thus no thread holds the lock, or acquired (or locked or held), and thus exactly one thread holds the lock and presumably is in a critical section.

![os-lock_demo.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-lock_demo.png)

In general, we view thre
ads as entities created by the programmer but scheduled by the OS, in any fashion that the OS chooses. Locks yield some of that control back to the programmer; by putting a lock around a section of code, the programmer can guarantee that no more than a single thread can ever be active within that code.

The name that the **POSIX** library uses for a lock is a **mutex**, as it is used to provide **mutual exclusion** between threads.

**Building A Lock**

Some hardware support (in the form of a more powerful instruction) plus some operating system support (e.g., in the form of park() and unpark() primitives on Solaris, or futex on Linux).

**Evaluating Locks**

- The first is whether the lock does its basic task, which is to provide **mutual exclusion**. Basically, does the lock work, preventing multiple threads from entering a critical section?
- The second is **fairness**. Does each thread contending for the lock get a fair shot at acquiring it once it is free?
- The final criterion is **performance**, specifically the time overheads added by using the lock.

**Controlling Interrupts**

Turning off interrupts is only used in limited contexts as a mutual-exclusion primitive. For example, in some cases an operating system itself will use interrupt masking to guarantee atomicity when accessing its own data structures, or at least to prevent certain messy interrupt handling situations from arising. This usage makes sense, as the trust issue disappears inside the OS, which always trusts itself to perform privileged operations anyhow.

**Plain Solution**

Without hardware support, just use a flag.

![os-lock_plain_solution.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-lock_plain_solution.png)

The core issue is that the testing and setting part can be interrupted by context switch, and both thread enters the critical section.

You should get used to this thinking about concurrent programming. Maybe pretend yourself as a **malicious scheduler** to understand the concurrent execution.

![os-lock_no_mutal_exclusion.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-lock_no_mutal_exclusion.png)

**Test And Set (Atomic Exchange)**

Let hardware provides a transaction-like instrument to ensure the sequence of operations is performed **atomically**.

![os-lock_test_and_set.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-lock_test_and_set.png)

The key, of course, is that this sequence of operations is performed atomically. The reason it is called “test and set” is that it enables you to “test” the old value (which is what is returned) while simultaneously “setting” the memory location to a new value; as it turns out, this slightly more powerful instruction is enough to build a simple spin lock

![os-lock_spin_lock_by_test_and_set.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-lock_spin_lock_by_test_and_set.png)

By making both the test (of the old lock value) and set (of the new value) a single atomic operation, we ensure that only one thread acquires the lock.

**Compare-And-Swap**

![os-lock_compare_and_swap.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-lock_compare_and_swap.png)
![os-lock_spin_lock_by_compare_and_swap.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-lock_spin_lock_by_compare_and_swap.png)

compare-and-swap is a more powerful instruction than test-and-set. We will make some use of this power in the future when we briefly delve into **wait-free synchronisation**.

**Load-Linked and Store-Conditional**

Some platforms provide a pair of instructions that work in concert to help build critical sections. On the MIPS architecture, for example, the load-linked and store-conditional instructions can be used in tandem to build locks and other concurrent structures.

![os-lock_load_linked_store_conditional.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-lock_load_linked_store_conditional.png)
![os-lock_spin_lock_by_load_linked_store_conditional.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-lock_spin_lock_by_load_linked_store_conditional.png)

**Fetch-And-Add**

Fetch-and-add atomically increments a value while returning the old value at a particular address.

![os-lock_fetch_and_add.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-lock_fetch_and_add.png)

Fetch-and-add could build a *ticket lock*, this solution uses a ticket and turn variable in combination to build a lock. The basic operation is pretty simple: when a thread wishes to acquire a lock, it first does an atomic fetch-and-add on the ticket value; that value is now considered this thread’s “turn” (myturn). The globally shared lock->turn is then used to determine which thread’s turn it is; when (myturn == turn) for a given thread, it is that thread’s turn to enter the critical section. It has the advantage of the fairness, ensures progress for all threads. Once a thread is assigned its ticket value, it will be scheduled at some point in the future

![os-lock_ticket_lock_by_fetch_and_add.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-lock_ticket_lock_by_fetch_and_add.png)

**Spin Lock**

We use a while loop to endlessly check the value of a flag, this technique is known as **spin-waiting**. Spin-waiting wastes time waiting for another thread to release a lock. The waste is exceptionally high on a uniprocessor, where the thread that the waiter is waiting for cannot even run (at least, until a context switch occurs)!

**Spin lock** is the simplest type of lock to build, and simply spins, using CPU cycles, until the lock becomes available. To work correctly on a single processor, it requires a **preemptive scheduler**. (Remember that SJF is non-preemptive, but STCF is preemptive, which means permitting one thread to be interrupted).

Evaluating

- √ correctness, the spin lock only allows a single thread to enter the critical section at a time.
- X fairness, spin locks don’t provide any fairness guarantees. Indeed, a thread spinning may spin forever, under contention. Spin locks are not fair and may lead to starvation.
- X performance, bad in the single CPU case. The problem gets worse with N threads contending for a lock; N − 1 time slices may be wasted in a similar manner, simply spinning and waiting for a single thread to release the lock.

**Avoid Spinning by Yield**

> “just yield, baby!"

Hardware support alone cannot solve the problem. We’ll need OS support too! Assume an operating system primitive **yield()** which a thread can call when it wants to give up the CPU and let another thread run. A thread can be in one of three states (running, ready, or blocked); yield is simply a system call that moves the caller from the **running** state to the **ready** state, and thus promotes another thread to running. Thus, the yielding process essentially **deschedules** itself.

![os-lock_with_test_and_set_and_yield.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-lock_with_test_and_set_and_yield.png)

This approach eliminates the spinning time, but still costly when context switching. And we have not tackled the starvation problem at all. A thread may get caught in an endless yield loop while other threads repeatedly enter and exit the critical section.

**Avoid Spnning by Queues**

The scheduler determines which thread runs next; if the scheduler makes a bad choice, a thread runs that must either spin waiting for the lock (our first approach), or yield the CPU immediately (our second approach). Either way, there is potential for waste and no prevention of starvation.

Thus, we must explicitly exert some control over who gets to acquire the lock next after the current holder releases it.

![os-lock_with_test_and_set_and_yield_and_queue.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-lock_with_test_and_set_and_yield_and_queue.png)

This approach thus doesn’t avoid spin-waiting entirely; a thread might be interrupted while acquiring or releasing the lock, and thus cause other threads to spin-wait for this one to run again. However, the time spent spinning is quite limited (just a few instructions inside the lock and unlock code, instead of the user-defined critical section), and thus this approach may be reasonable.

With just the wrong timing, a thread will be about to park, assuming that it should sleep until the lock is no longer held. A switch at that time to another thread (say, a thread holding the lock) could lead to trouble, for example, if that thread then released the lock. The subsequent park by the first thread would then sleep forever (potentially). This problem is sometimes called the **wakeup/waiting race**.

Solaris solves this problem by adding a third system call: **setpark()**. By calling this routine, a thread can indicate it is about to park. If it then happens t be interrupted and another thread calls unpark before park is actually called, the subsequent park returns immediately instead of sleeping.

You might also notice the interesting fact that the flag does not get set back to 0 when another thread gets woken up. Why is this? Well, it is not an error, but rather a necessity! When a thread is woken up, it will be as if it is returning from park(); however, it does not hold the guard at that point in the code and thus cannot even try to set the flag to 1. Thus, we just pass the lock directly from the thread releasing the lock to the next thread acquiring it; flag is not set to 0 in-between.

**Linux Support**

Linux provides something called a **futex** which is similar to the Solaris interface but provides a bit more in-kernel functionality. Specifically, each futex has associated with it a specific physical memory location; associated with each such memory location is an in-kernel queue.

- `futex_wait(address, expected)` puts the calling thread to sleep, assouming the value at address is equal to expected. If it is not equal, the call returns immediately.
- `futex_wake(address)` wakes one thread that is wait- ing on the queue.

Linux approach has the flavor of an old approach that has been used on and off for years, , and is now referred to as a **two-phase lock**. A two-phase lock realizes that spinning can be useful, particularly if the lock is about to be released. So in the first phase, the lock spins for a while, hoping that it can acquire the lock. However, if the lock is not acquired during the first spin phase, a second phase is entered, where the caller is put to sleep, and only woken up when the lock becomes free later.

