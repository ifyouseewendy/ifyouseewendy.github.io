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

## Chapter 29 - Lock-based Concurrent Data Structures

**Background**

Adding locks to a data structure to make it usable by threads makes the structure **thread safe**. There is always a standard method to make a concurrent data structure: add a big lock. But sometimes we need to ensure the scalability.

To evaluate the concurrent data structures, theres are two factors to concern:

- Correctness
- Performance. MORE CONCURRENCY ISN’T NECESSARILY FASTER. If the scheme you design adds a lot of overhead (for example, by acquiring and releasing locks frequently, instead of once), the fact that it is more concurrent may not be important. Build both alternatives (simple but less concurrent, and complex but more concurrent) and measure how they do.

Ideally, you’d like to see the threads complete just as quickly on multiple processors as the single thread does on one. Achieving this end is called **perfect scaling**.

**Guidelines**

- Be careful with acquisition and release of locks around control flow changes
- Enabling more concurrency does not necessarily increase performance
- Performance problems should only be remedied once they exist, avoiding premature optimization, is central to any performance-minded developer
- There is no value in making something faster if doing so will not improve the overall performance of the application.

**Concurrent Counters**

![os-lock_performance_concurrent_counters.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-lock_performance_concurrent_counters.png)

Traditional Counter

![os-lock_traditional_counter.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-lock_traditional_counter.png)

In this manner, it is similar to a data structure built with **monitors**, where locks are acquired and released automatically as you call and return from object methods.

The performance of the synchronized counter scales poorly.

Sloppy Counter

![os-lock_sloppy_counter.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-lock_sloppy_counter.png)

The sloppy counter works by representing a single logical counter via numerous local physical counters, one per CPU core, as well as a single global counter.
When a thread running on a given core wishes to increment the counter, it increments its local counter; access to this local counter is synchronized via the corresponding local lock.
How often this local-to-global transfer occurs is determined by a threshold, which we call S here (for sloppiness). The smaller S is, the more the counter behaves like the non-scalable counter above; the bigger S is, the more scalable the counter, but the further off the global value might be from the actual count.

![os-lock_sloppy_counter_scaling.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-lock_sloppy_counter_scaling.png)

**Concurrent Linked Lists**

![os-lock_concurrent_link_list.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-lock_concurrent_link_list.png)

One small tricky issue arises if malloc() happens to fail (a rare case); in this case, the code must also release the lock before failing the insert. This kind of exceptional control flow has been shown to be quite error prone; a recent study of Linux kernel patches found that a huge fraction of bugs (nearly 40%) are found on such rarely-taken code paths.

BE WARY OF LOCKS AND CONTROL FLOW

Many functions will begin by acquiring a lock, allocating some memory, or doing other similar stateful operations, when errors arise, the code has to undo all of the state before returning, which is error-prone. Thus, it is best to structure code to minimize this pattern.

Specifically, we can rearrange the code a bit so that the lock and release only surround the actual critical section in the insert code, and that a common exit path is used in the lookup code.

![os-lock_concurrent_link_list_optimized.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-lock_concurrent_link_list_optimized.png)

Once again we are in a situation where it does not scale particularly well. One technique that researchers have explored to enable more concurrency within a list is something called **hand-over-hand locking** (a.k.a. **lock coupling**).

Instead of having a single lock for the entire list, you instead add a lock per node of the list. When traversing the list, the code first grabs the next node’s lock and then releases the current node’s lock.

It enables a high degree of concurrency in list operations. However, in practice, it is hard to make such a structure faster than the simple single lock approach, as the overheads of acquiring and releasing locks for each node of a list traversal is prohibitive. Perhaps some kind of hybrid (where you grab a new lock every so many nodes) would be worth investigating.

**Concurrent Queues**

Look at a slightly more concurrent queue designed by Michael and Scott.

There are two locks, one for the head of the queue, and one for the tail. The goal of these two locks is to enable concurrency of enqueue and dequeue operations. One trick used by the Michael and Scott is to add a dummy node (allocated in the queue initialization code); this dummy enables the separation of head and tail operations.

![os-lock_concurrent_queue.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-lock_concurrent_queue.png)

**Concurrent Hash Table**

![os-lock_concurrent_hash_table.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-lock_concurrent_hash_table.png)

This concurrent hash table is straightforward, is built using the concurrent lists we developed earlier, and works incredibly well. The reason for its good performance is that instead of having a single lock for the entire structure, it uses a lock per hash bucket.

![os-lock_scaling_hash_table.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-lock_scaling_hash_table.png)

AVOID PREMATURE OPTIMIZATION (KNUTH’S LAW)

> "Premature optimization is the root of all evil.”

Many operating systems utilized a single lock when first transitioning to multiprocessors, including Sun OS and Linux. In the latter, this lock even had a name, the **big kernel lock (BKL)**. When multi-CPU systems became the norm, only allowing a single active thread in the kernel at a time became a performance bottleneck. Thus, it was finally time to add the optimization of improved concurrency to these systems. Within Linux, the more straightforward approach was taken: replace one lock with many. Within Sun, a more radical decision was made: build a brand new operating system, known as Solaris, that incorporates concurrency more fundamentally from day one.

## Chapter 30 - Condition Variables

**Background**

There are many cases where a thread wishes to check whether a condition is true before continuing its execution. For example, a parent thread might wish to check whether a child thread has completed before continuing (this is often called a `join()`).

In multi-threaded programs, it is often useful for a thread to wait for some conditio to become true before proceeding. The simple approach, of just spinning until the condition becomes true, is grossly inefficient and wastes CPU cycles, and in some cases, can be incorrect.

**Definition and Routines**

To wait for a condition to become true, a thread can make use of what is known as a condition variable. A **condition variable** is an explicit queue that threads can put themselves on when some state of execution (i.e., some condition) is not as desired (by **waiting** on the condition); some other thread, when it changes said state, can then wake one (or more) of those waiting threads and thus allow them to continue (by **signaling** on the condition).

By allowing threads to sleep when some program state is not as desired, CVs enable us to neatly solve a number of important synchronization problems, including the famous (and still important) producer/consumer problem, as well as covering conditions.

A condition variable has two operations associated with it: **wait()** and **signal()**.

- The **wait()** call is executed when a thread wishes to put itself to sleep
- The **signal()** call is executed when a thread has changed something in the program and thus wants to wake a sleeping thread waiting on this condition.

![os-cv_waiting_demo.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-cv_waiting_demo.png)

***Is the state variable `done` necessary?***

![os-cv_waiting_demo_2.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-cv_waiting_demo_2.png)

Yes. Imagine the case where the child runs immediately and calls thr exit() immediately; in this case, the child will signal, but there is no thread asleep on the condition. When the parent runs, it will simply call wait and be stuck; no thread will ever wake it. From this example, you should appreciate the importance of the state variable done; it records the value the threads are interested in knowing. The sleeping, waking, and locking all are built around it.

***Is there a need to hold the lock while singaling?***

Although it is strictly not necessary in all cases, it is likely simplest and best to hold the lock while signaling when using condition variables. The generalization of this tip is correct: hold the lock when calling signal or wait, and you will always be in good shape.

**Producer/Consumer (Bounded Buffer)**

The producer/consumer problem, or sometimes as the bounded buffer problem, which was first posed by Dijkstra. Indeed, it was this very producer/consumer problem that led Dijkstra and his co-workers to invent the generalized **semaphore** (which can be used as either a lock or a condition variable).

A bounded buffer is also used when you pipe the output of one program into another, e.g.,

```sh
// grep process is the producer
// wc process is the consumer
// between them is an in-kernel bounded buffer
grep foo file.txt | wc -l
```

Basic operations: `put()` and `get()`

![os-cv_put_and_get_v1.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-cv_put_and_get_v1.png)

**Plain Solution**

![os-cv_producer_and_consumer_v1.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-cv_producer_and_consumer_v1.png)

**Single CV and If**

![os-cv_producer_and_consumer_single_cv_and_if.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-cv_producer_and_consumer_single_cv_and_if.png)

![os-cv_producer_and_consumer_single_cv_and_if_trace.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-cv_producer_and_consumer_single_cv_and_if_trace.png)

**Single CV and While**

Signaling a thread only wakes them up; it is thus a hint that the state of the world has changed (in this case, that a value has been placed in the buffer), but there is no guarantee that when the woken thread runs, the state will still be as desired. This interpretation of what a signal means is often referred to as **Mesa semantics**, after the first research that built a condition variable in such a manner. Virtually every system ever built employs Mesa semantincs.

Thanks to Mesa semantics, a simple rule to remember with condition variables is to **always use while loops**.

![os-cv_producer_and_consumer_single_cv_and_while.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-cv_producer_and_consumer_single_cv_and_while.png)

![os-cv_producer_and_consumer_single_cv_and_while_trace.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-cv_producer_and_consumer_single_cv_and_while_trace.png)

**Two CVs and While**

Signaling is clearly needed, but must be more directed. **A consumer should not wake other consumers, only producers**, and vice-versa.

Use two condition variables, instead of one, in order to properly signal which type of thread should wake up when the state of the system changes. Producer threads wait on the condition empty, and signals fill. Conversely, consumer threads wait on fill and signal empty.

![os-cv_producer_and_consumer_single_two_cv_and_while.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-cv_producer_and_consumer_single_two_cv_and_while.png)

**Final Solution**

![os-cv_producer_and_consumer_final_solution.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-cv_producer_and_consumer_final_solution.png)

**Covering Conditions**

![os-cv_producer_and_consumer_covering_conditions.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-cv_producer_and_consumer_covering_conditions.png)

Assume there are zero bytes free; thread Ta calls `allocate(100)`, followed by thread Tb which asks for less memory by calling `allocate(10)`. Both Ta and Tb thus wait on the condition and go to sleep; there aren’t enough free bytes to satisfy either of these requests. At that point, assume a third thread, Tc, calls `free(50)`. Unfortunately, when it calls signal to wake a waiting thread, it might not wake the correct waiting thread, Tb, which is waiting for only 10 bytes to be freed; Ta should remain waiting, as not enough memory is yet free. Thus, the code in the figure does not work, as the thread waking other threads does not know which thread (or threads) to wake up.

The solution suggested by Lampson and Redell is straightforward: replace the `pthread_cond_signal()` call in the code above with a call to `pthread_cond_broadcast()`, which wakes up all waiting threads. Those threads will simply wake up, re-check the condition, and then go immediately back to sleep.

Lampson and Redell call such a condition a **covering condition**, as it covers all the cases where a thread needs to wake up (conservatively); the cost, is that too many threads might be woken.

In general, if you find that your program only works when you change your signals to broadcasts (but you don’t think it should need to), you probably have a bug; fix it! But in cases like the memory allocator above, broadcast may be the most straightforward solution available.

## Chapter 31 - Semaphores

**Background**

As we know now, one needs both locks and condition variables to solve a broad range of relevant and interesting concurrency problems. One of the first people to realize this years ago was Edsger Dijkstra. Dijkstra and colleagues invented the semaphore as a single primitive for all things related to synchronization; as you will see, one can use semaphores as both locks and condition variables.

**Definition**

A semaphore is an object with an integer value that we can manipulate with two routines; in the POSIX standard, these routines are sem `wait()` and sem `post()`. The initial value of the semaphore determines its behaviour.

Semaphores are a powerful and flexible primitive for writing concurrent programs. Some programmers use them exclusively, shunning locks and condition variables, due to their simplicity and utility.

In my view, semaphore is an primitive, which can be made by locks and condition variables, also can’t be used as locks and condition variables.

Initialization

![os-semaphore_init.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-semaphore_init.png)

Usage
![os-semaphore_definition.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-semaphore_definition.png)

- `sem_wait()` will either return right away (because the value of the semaphore was one or higher when we called `sem_wait()`), or it will cause the caller to suspend execution waiting for a subsequent post.
- `sem_post()` does not wait for some particular condition to hold like `sem_wait()` does. Rather, it simply increments the value of the semaphore and then, if there is a thread waiting to be woken, wakes one of them up.
- The value of the semaphore, when negative, is equal to the number of waiting threads

**Semaphores As Locks**

![os-semaphore_as_locks.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-semaphore_as_locks.png)

Because locks only have two states (held and not held), this usage is sometimes known as a **binary semaphore**.

**Semaphores As Condition Variables**

Semaphores are also useful when a thread wants to halt its progress waiting for a
 condition to become true. In this pattern of usage, we often find a thread waiting for something to happen, and a different thread making that something happen and then signaling that it has happened, thus waking the waiting thread.

![os-semaphore_as_cv.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-semaphore_as_cv.png)

**Producer/Consumer (Bounded Buffer)**

Plain Solution

![os-semaphore_producer_and_consumer_plain.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-semaphore_producer_and_consumer_plain.png)

The condition variable (semaphore based) controls the execution order, which can let multiple threads enter the critical section at the same time. It still needs a lock.

Adding Mutual Exclusion

![os-semaphore_producer_and_consumer_add_mutex.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-semaphore_producer_and_consumer_add_mutex.png)

The consumer holds the mutex and is waiting for the someone to signal full. The producer could si!gnal full but is waiting for the mutex. Thus, the producer and consumer are each stuck waiting for each other: a classic deadlock.

To avoid the deadlock, we can simply move the mutex acquire and release to be just around the critical section. The result is a simple and working bounded buffer, a commonly-used pattern in multi-threaded programs.

![os-semaphore_producer_and_consumer_add_mutex_correctly.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-semaphore_producer_and_consumer_add_mutex_correctly.png)

**Reader-Writer Locks**

Another classic problem stems from the desire for a more flexible **locking primitive** that admits that different data structure accesses might require different kinds of locking.

Imagine a number of concurrent list operations, including inserts and simple lookups. While inserts change the state of the list (and thus a traditional critical section makes sense), lookups simply read the data structure; as long as we can guarantee that no insert is on-going, we can allow many lookups to proceed concurrently. The special type of lock we will now develop to support this type of operation is known as a **reader-writer lock**.

![os-semaphore_reader_writer_lock.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-semaphore_reader_writer_lock.png)

Once a reader has acquired a read lock, more readers will be allowed to acquire the read lock too; however, any thread that wishes to acquire the write lock will have to wait until all readers are finished; the last one to exit the critical section calls sem `post()` on “writelock” and thus enables a waiting writer to acquire the lock.

This approach works (as desired), but does have some negatives, especially when it comes to fairness. In particular, it would be relatively easy for readers to starve writers. It should be noted that reader-writer locks should be used with some caution. They often add more overhead (especially with more sophisticated implementations), and thus do not end up speeding up performance as compared to just using simple and fast locking primitives.

SIMPLE AND DUMB CAN BE BETTER (HILL’S LAW)

You should never underestimate the notion that the simple and dumb approach can be the best one. Always try the simple and dumb approach first.

**The Dining Philosophers**

One of the most famous concurrency problems posed, and solved, by Dijkstra, is known as the dining philosopher’s problem.

There are five “philosophers” sitting around a table. Between each pair of philosophers is a single fork (and thus, five total). The philosophers each have times where they think, and don’t need any forks, and times where they eat. In order to eat, a philosopher needs two forks, both the one on their left and the one on their right. The contention for these forks, and the synchronization problems that ensue, are what makes this a problem we study in concurrent programming.

![os-semaphore_dinning_philosophers.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-semaphore_dinning_philosophers.png)

Broken Solution

![os-semaphore_dinning_philosophers_deadlock_solution.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-semaphore_dinning_philosophers_deadlock_solution.png)

The problem is deadlock. If each philosopher happens to grab the fork on their left before any philosopher can grab the fork on their right, each will be stuck holding one fork and waiting for another, forever.

A Solution: Breaking The Dependency

![os-semaphore_dinning_philosophers_solution.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-semaphore_dinning_philosophers_solution.png)

**Implement Semaphores**

![os-semaphore_implementation.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-semaphore_implementation.png)

## Chapter 32 - Common Concurrency Problems

**Background**

Lu et al has made a study, which analyzes a number of popular concurrent applications in great detail to understand what types of bugs arise in practice.

![os-concurrency_bugs.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-concurrency_bugs.png)

**Non-Deadlock Bugs**

- Atomicity violation bugs. The desired serializability among multiple memory accesses is violated (i.e. a code region is intended to be atomic, but the atomicity is not enforced during execution). Solve by locks.
- Order violation bugs. The desired order between two (groups of) memory accesses is flipped (i.e., A should always be executed before B, but the order is not enforced during execution). Solve by condition variables.

**Deadlock Bugs**

Deadlock occurs, for example, when a thread (say Thread 1) is holding a lock (L1) and waiting for another one (L2); unfortunately, the thread (Thread 2) that holds lock L2 is waiting for L1 to be released.

![os-concurrency_deadlock_dependency.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-concurrency_deadlock_dependency.png)

**Caused by**

One reason is that in large code bases, complex dependencies arise between cmponents. The design of locking strategies in large systems must be carefully done to avoid deadlock in the case of **circular dependencies** that may occur naturally in the code.

Another reason is due to the nature of **encapsulation**. As software developers, we are taught to hide details of implementations and thus make software easier to build in a modular way.

![os-concurrency_deadlock_by_encapsulation.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-concurrency_deadlock_by_encapsulation.png)

**Conditions for Deadlock**

- **Mutual exclusion**: Threads claim exclusive control of resources that they require (e.g., a thread grabs a lock).
- **Hold-and-wait**: Threads hold resources allocated to them (e.g.,locks that they have already acquired) while waiting for additional resources (e.g., locks that they wish to acquire).
- **No preemption (hold)**: Resources (e.g., locks) cannot be forcibly removed from threads that are holding them.
- **Circular wait (wait)**: There exists a coircular chain of threads such that each thread holds one more resources (e.g., locks) that are being requested by the next thread in the chain.

**Prevention Based on Four Conditions**

Mutual Exclusion

To avoid the need for mutual exclusion at all. Herlihy had the idea that one could design various data structures to be **wait-free**. The idea here is simple: using powerful hardware instructions, you can build data structures in a manner that does not require explicit locking.

![os-concurrency_deadlock_wait_free.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-concurrency_deadlock_wait_free.png)

However, this will fail if some other thread successfully swapped in a new head in the meanwhile, causing this thread to retry again with the new head.

Hold-and-wait

The hold-and-wait requirement for deadlock can be avoided by acquiring all locks at once, atomically.

![os-concurrency_deadlock_hold_and_wait.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-concurrency_deadlock_hold_and_wait.png)

By first grabbing the lock prevention, this code guarantees that no untimely thread switch can occur in the midst of lock acquisition and thus deadlock can once again be avoided.

Note that the solution is problematic for a number of reasons. As before, encapsulation works against us: when calling a routine, this approach requires us to know exactly which locks must be held and to acquire them ahead of time. This technique also is likely to decrease concurrency as all locks must be acquired early on (at once) instead of when they are truly needed.

No Preemption

Because we generally view locks as held until unlock is called, multiple lock acquisition often gets us into trouble because when waiting for one lock we are holding another. Many thread libraries provide a more flexible set of interfaces to help avoid this situation. Specifically, a `trylock()` routine will grab the lock (if it is available) or return -1 indicating that the lock is held right now and that you should try again later if you want to grab that lock.

![os-concurrency_deadlock_no_preemption.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-concurrency_deadlock_no_preemption.png)

One new problem does arise, however: **livelock**. It is possible (though perhaps unlikely) that two threads could both be repeatedly attempting this sequence and repeatedly failing to acquire both locks. In this case, both systems are running through this code sequence over and over again (and thus it is not a deadlock), but progress is not being made, hence the name lovelock. One could add a random delay before looping back and trying the entire thing over again, thus decreasing the odds of repeated interference among competing threads.

Another issues arises due to encapsulation: if one of these locks is buried in some routine that is getting called, the jump back to the beginning becomes more complex to implement.

Circular Wait

The best solution in practice is to be careful, develop a lock acquisition order, and thus prevent deadlock from occurring in the first place.

- The most straightforward way to do that is to provide a **total ordering** on lock acquisition. For example, if there are only two locks in the system (L1 and L2), you can prevent deadlock by always acquiring L1 before L2. Such strict ordering ensures that no cyclical wait arises; hence, no deadlock.
- A **partial ordering** can be a useful way to structure lock acquisition so as to avoid deadlock.

**Avoidance via Scheduling**

Instead of deadlock prevention, in some scenarios deadlock avoidance is preferable. Avoidance requires some global knowledge of which locks various threads might grab during their execution, and subsequently schedules said threads in a way as to guarantee no deadlock can occur.

![os-concurrency_deadlock_avoid_via_scheduling.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-concurrency_deadlock_avoid_via_scheduling.png)

Unfortunately, they are only useful in very limited environments, for example, in an embedded system where one has full knowledge of the entire set of tasks that must be run and the locks that they need. Further, such approaches can limit concurrency. Thus, avoidance of deadlock via scheduling is not a widely-used general-purpose solution

**Detect and Recover**

One final general strategy is to allow deadlocks to occasionally occur, and then take some action once such a deadlock has been detected.

Many database systems employ deadlock detection and recovery techniques. A deadlock detector runs periodically, building a resource graph and checking it for cycles. In the event of a cycle (deadlock), the system needs to be restarted.

DON’T ALWAYS DO IT PERFECTLY (TOM WEST’S LAW)

Tom West says famously, “Not everything worth doing is worth doing well”, which is a terrific engineering maxim. If a bad thing happens rarely, certainly one should not spend a great deal of effort to prevent it, particularly if the cost of the bad thing occurring is small.

**Others**

Perhaps the best solution is to develop new concurrent programming models: in systems such as **MapReduce** (from Google), programmers can describe certain types of parallel computations without any locks whatsoever.

## Chapter 33 - Event-based Concurrency (Advanced)

**Background**

A different style of concurrent programming is often used in both GUI-based applications as well as some types of internet servers. This style, known as event-based concurrency, has become popular in some modern systems, including server-side frameworks such as node.js, but its roots are found in C/UNIX systems that we’ll discuss below.

Event-based servers give control of scheduling to the application itself, but do so at some cost in complexity and difficulty of integration with other aspects of modern systems (e.g., paging). Because of these challenges, no single approach has emerged as best; thus, both threads and events are likely to persist as two different approaches to the same concurrency problem for many years to come.

The problem that event-based concurrency addresses is two-fold.

- The first is that managing concurrency correctly in multi-threaded applications can be challenging.
- The second is that in a multi-threaded application, the developer has little or no control over what is scheduled at a given moment in time; rather, the programmer simply creates threads and then hopes that the underlying OS schedules them in a reasonable manner across available CPUs.

**The Basic Idea: An Event Loop**

The approach is quite simple: you simply wait for something (i.e., an “event”) to occur; when it does, you check what type of  event it is and do the small amount of work it requires (which may include issuing I/O requests, or scheduling other events for future handling, etc.). That’s it!

![os-event_loop.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-event_loop.png)

Importantly, when a handler processes an event, it is the only activity taking place in the system; thus, deciding which event to handle ext is equivalent to scheduling. This explicit control over scheduling is one of the fundamental advantages of the event- based approach.

But there is a big question: how exactly does an event-based server determine which events are taking place, in particular with regards to network and disk I/O? Specifically, how can an event server tell if a message has arrived for it?

**An Important API: select() (or poll())**

In most systems, a basic API is available, via either the **select()** or **poll()** system calls. Either way, these basic primitives give us a way to build a non-blocking event loop, which simply checks for incoming packets, reads from sockets with messages upon them, and replies as needed.

What these interfaces enable a program to do is simple: check whether there is any incoming I/O that should be attended to.

![os-event_select_api.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-event_select_api.png)

First, note that it lets you check whether descriptors can be reand from as well as written to; the former lets a server determine that a new packet has arrived and is in need of processing, whereas the latter lets the service know when it is OK to reply (i.e., the outbound queue is not full).

Second, note the timeout argument. One common usage here is to set the timeout to `NULL`, which causes `select()` to block indefinitely, until some descriptor is ready. However, more robust servers will usually specify some kind of timeout; one common technique is to set the timeout to zero, and thus use the call to `select()` to return immediately.

Now linux uses **epoll**, FreeBSD (Mac OS) uses **kqueue**, and Windows uses **IOCP**.

BLOCKING VS. NON-BLOCKING INTERFACES

- Blocking (or synchronous) interfaces do all of their work before returning to the caller. The usual culprit in blocking calls is I/O of some kind.
- Non-blocking (or asynchronous) interfaces begin some work but return immediately, thus letting whatever work that needs to be done get done in the background. Non-blocking interfaces can be used in any style of programming (e.g., with threads), but are essential in the event-based approach, as a call that blocks will halt all progress.

DON’T BLOCK IN EVENT-BASED SERVERS

Event-based servers enable fine-grained control over scheduling of tasks. However, to maintain such control, no call that blocks the execution the caller can ever be made; failing to obey this design tip will result in a blocked event-based server.

![os-event_select_code_demo.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-event_select_code_demo.png)

Advantage

With a single CPU and an event-based application, the problems found in concurrent programs are no longer present. Specifically, because only one event is being handled at a time, there is no need to acquire or release locks; the event-based server cannot be interrupted by another thread because it is decidedly single threaded. Thus, concurrency bugs common in threaded programs do not manifest in the basic event-based approach.

**Issue: Blocking System Calls**

For example, imagine a request comes from a client into a server to read a file from disk and return its contents to the requesting client (much like a simple HTTP request). Both the open() and read() calls may issue I/O requests to the storage system (when the needed metadata or data is not in memory already), and thus may take a long time to service.

With a thread-based server, this is no issue: while the thread issuing the I/O request suspends (waiting for the I/O to complete), other threads can run, thus enabling the server to make progress. Indeed, this natural **overlap** of I/O and other computation is what makes thread-based programming quite natural and straight-forward.

With an event-based approach, however, there are no other threads to run: just the main event loop. And this implies that if an event handler issues a call that blocks, the entire server will do just that: block until the call completes.

We thus have a rule that must be obeyed in event-based systems: no blocking calls are allowed.

Solution: Asynchronous I/O

To overcome this limit, many modern operating systems have intro- duced new ways to issue I/O requests to the disk system, referred to generically as asynchronous I/O. These interfaces enable an application to issue an I/O request and return control immediately to the caller, before the I/O has completed; additional interfaces enable an application to determine whether various I/Os have completed.

The APIs revolve around a basic structure, the struct aiocb or **AIO control block** in common terminology.

![os-event_aio_control_block.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-event_aio_control_block.png)

- An application can periodically poll the system via a call to aio error() to determine whether said I/O has yet completed.
- Some systems provide an approach based on the interrupt. This method uses UNIX signals to inform applications when an asynchronous I/O completes, thus removing the need to repeatedly ask the system.

In systems without asynchronous I/O, the pure event-based approach cannot be implemented. However, clever researchers have derived methods that work fairly well in their place. For example, Pai et al describe a hybrid approach in which events are used to process network packets, and a thread pool is used to manage outstanding I/Os.

UNIX SIGNALS

A huge and fascinating infrastructure known as **signals** is present in all mod ern UNIX variants. At its simplest, signals provide a way to communicate with a process. Specifically, a signal can be delivered to an application; doing so stops the application from whatever it is doing to run a **signal handler**, i.e., some code in the application to handle that signal. When finished, the process just resumes its previous behaviour. A program can be configured to catch that signal. Or when a signal is sent to a process not config- ured to handle that signal, some default behavior is enacted; for SEGV, the process is killed.

**Issue: State Management**

When an event handler issues an asynchronous I/O, it must package up some program state for the next event handler to use when the I/O finally completes; this additional work is not needed in thread-based programs, as the state the program needs is on the stack of the thread. Adya et al. call this work **manual stack management**, and it is fundamental to event-based programming.

Solution: Continuation

Use an old programming language construct known as a **continuation**. Though it sounds complicated, the idea is rather simple: basically, record the needed information to finish processing this event in some data structure; when the event happens (i.e., when the disk I/O completes), look up the needed information and process the event.

![os-event_state_management.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-event_state_management.png)

Record the socket descriptor (sd) in some kind of data structure (e.g., a hash table), indexed by the file descriptor (fd). When the disk I/O completes, the event handler would use the file descriptor to look up the continuation, which will return the value of the socket descriptor to the caller.

**What Is Still Difficult With Events**

Multiple CPUS. When systems moved from a single CPU to multiple CPUs, some of the simplicity of the event-based approach disappeared. Specifically, in order to utilize more than one CPU, the event server has to run multiple event handlers in parallel; when doing so, the usual synchronization problems (e.g., critical sections) arise, and the usual solutions (e.g., locks) must be employed. Thus, on modern multicore systems, simple event handling without locks is no longer possible.

Implicit blocking. It does not integrate well with certain kinds of systems activity, such as paging. For example, if an event-handler page faults, it will block, and thus the server will not make progress until the page fault completes. Even though the server has been structured to avoid explicit blocking, this type of implicit blocking due to page faults is hard to avoid and thus can lead to large performance problems when prevalent.

API changes all the time. That event-based code can be hard to manage over time, as the exact semantics of various routines changes]. For example, if a routine changes from non-blocking to blocking, the event handler that calls that routine must also change to accommodate its new nature, by ripping itself into two pieces. Because blocking is so disastrous for event-based servers, a programmer must always be on the lookout for such changes in the semantics of the APIs each event uses.

Async network I/O. Though asynchronous disk I/O is now possible on most platforms, it has taken a long time to get there, and it never quite integrates with asynchronous network I/O in as simple and uniform a manner as you might think. For example, while one would simply like to use the select() interface to manage all outstanding I/Os, usually some combination of select() for networking and the AIO calls for disk I/O are required.
