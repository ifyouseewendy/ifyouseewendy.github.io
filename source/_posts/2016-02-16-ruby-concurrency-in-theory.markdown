---
layout: post
title: "Ruby Concurrency In Theory"
date: 2016-02-16 19:35:19 +0800
comments: true
categories: ['Ruby', 'Concurrency']
---

* TOC
{:toc}

## What is concurrency?

### Concurrency vs. Paralelism

- Concurrency is about dealing with lots of things at once.
- Parallelism is about doing lots of things at once.
- Not the same, but related.
- One is about structure (design), one is about execution.
- Concurrency provides a way to structure a solution to solve a problem that may (but not necessarily) be parallelizable.

### Concurrency plus communication

- Concurrency is a way to structure a program by breaking it into pieces that can be executed independently.
- Communication is the means to coordinate the independent executions.
- This is the Go model and (like Erlang and others) it's based on CSP (Communicating Sequential Processes)

*Reference*

+ [Concurrency is not Parallelism (it's better) - Rob Pike](http://concur.rspace.googlecode.com/hg/talk/concur.html#title-slide)

## What does Ruby support?

### GIL

A global interpreter lock (GIL) is a mutual-exclusion lock held by a programming language interpreter thread to avoid sharing code that is not thread-safe with other threads. In implementations with a GIL, there is always one GIL for each interpreter process.

Global interpreter lock (GIL) is a mechanism used in computer language interpreters to synchronize the execution of threads so that only one native thread can execute at a time. An interpreter that uses GIL always allows exactly one thread to execute at a time, even if run on a multi-core processor.

**Benefits**

- increased speed of single-threaded programs (no necessity to acquire or release locks on all data structures separately)
- easy integration of C libraries that usually are not thread-safe
- ease of implementation

**Drawbacks**

Limits the amount of parallelism reachable through concurrency of a single interpreter process with multiple threads. Hence a significant slowdown for CPU-bound thread.

![RCIT-native_threads.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/RCIT-native_threads.png)

![RCIT-threads_with_GIL.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/RCIT-threads_with_GIL.png)

*Reference*

+ [Global Interpreter Lock - Wikipedia](https://en.wikipedia.org/wiki/Global_interpreter_lock)

### Ruby Support

Ruby 1.8, uses only a single native thread and runs all Ruby threads within that one native thread. A single OS thread is allocated for the Ruby interpreter, a GIL lock is instantiated, and Ruby threads ('Green Threads'), are spooled up by our program. This means that threads can never run in parallel, even on multicore CPUs.

Ruby 1.9, allocates a native thread for each Ruby thread. But because some of the C libraries used in this implementation are not themselves thread-safe. Ruby never allows more than one of its native threads to run at the same time. Now the GIL is the bottleneck, and Ruby will never take advantage of multiple cores!

Ruby 1.9, also provides Fiber.

Ruby concurrency without parallelism can still be very useful, though, for tasks that are IO-heavy (e.g., network I/O, disk I/O).  Ruby can release the lock on the GIL on that thread while it blocks on I/O. There is a reason threads were, after all, invented and used even before multi-core servers were common.

![RCIT-ruby_support.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/RCIT-ruby_support.png)

*Reference*

+ [Ruby, Concurrency, and You - Engine Yard](https://blog.engineyard.com/2011/ruby-concurrency-and-you)

### Fiber

Fibers are primitives for implementing light weight cooperative concurrency in Ruby (think lightweight threads, minus the thread scheduler and less overhead). Basically they are a means of creating code blocks that can be paused and resumed, much like threads. A fiber is a unit of execution that must be manually scheduled by the application. Fibers run in the context of the threads that schedule them. Each thread can schedule multiple fibers.

As opposed to other stackless light weight concurrency models, each fiber comes with a small 4KB stack. This enables the fiber to be paused from deeply nested function calls within the fiber block.

Normal usage: start an async operation, yield the fiber, and then make the callback resume the fiber once the operation is complete.

**Compered to Thread**

Fibers are never preempted, the scheduling must be done by the programmer and not the VM.

**Why Fiber?**

In general, fibers do not provide advantages over a well-designed multithreaded application. However, using fibers can make it easier to port applications that were designed to schedule their own threads. The availability of Fibers allows Actor-style programming, without having to worry about overhead.

**Why Fiber is called a semi-coroutine?**

Coroutines (cooperative multitasking) are computer program components that generalize subroutines for nonpreemptive multitasking, by allowing multiple entry points for suspending and resuming execution at certain locations. Coroutines are well-suited for implementing more familiar program components such as cooperative tasks, exceptions, event loop, iterators, infinite lists and pipes.

Asymmetric Coroutines can only transfer control back to their caller, where Coroutines are free to transfer control to any other Coroutine, as long as they have a handle to it.

We may infer that Ruby encapsulate a Fiber::Core which supports coroutine, and only expose Fiber as a semi-coroutine data structure.

**What’s the performance of Fiber?**

Fibers are much faster to create than threads, they eat much less memory too.

*Reference*

* [Fiber - Ruby Doc](http://ruby-doc.org/core-2.2.2/Fiber.html)
* [Ruby 1.9 adds Fibers for lightweight concurrency - Werner Schuster](http://www.infoq.com/news/2007/08/ruby-1-9-fibers)
* [Coroutine - Wikipedia](https://en.wikipedia.org/wiki/Coroutine#Implementations_for_Ruby)
* [Ruby Fibers Vs Ruby Threads - oldmoe](http://oldmoe.blogspot.jp/2008/08/ruby-fibers-vs-ruby-threads.html)

## How to enhance concurrency by Ruby?

### Basics

**How to provide more concurrency?**

- Multi processing (parallelism), like Resque, Unicorn. Simply to fork a running process to multiply its processing power.
- Multi threading, like Sidekiq, Puma and Thin. Lighter than processes, requiring less overhead. At some point, you may find it necessary to use a thread pool.
- Background processing
- Rely on other concurrency models (event, actor, message-passing)

**Multi-processing vs. Multi-threading**

![RCIT-multi_processing_vs_multi_threading.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/RCIT-multi_processing_vs_multi_threading.png)

**Thread Pooling**

A key configuration parameter for a thread pool is typically the number of threads in the pool. These threads can either be instantiated all at once (i.e., when the pool is created) or lazily (i.e., as needed until the maximum number of threads in the pool has been created).

`Queue` and `SizedQueue` are thread-safe data structures in Ruby, maybe the only two.

[demo snippet](https://gist.github.com/ifyouseewendy/a8fc663ae575843f9e8f)

*Reference*

* [Multi-core, Threads & Message Passing - Ilya Grigorik](https://www.igvita.com/2010/08/18/multi-core-threads-message-passing/)
* [Threads Suck -  Adam Wiggins](http://adam.herokuapp.com/past/2009/8/13/threads_suck/)
* [Why Events Are A Bad Idea - Rob von Behren, Jeremy Condit and Eric Brewer](https://www.usenix.org/legacy/events/hotos03/tech/full_papers/vonbehren/vonbehren_html/index.html)

### Concurrency Model: Software Transactional Memory

Software transactional memory (STM) is a concurrency control mechanism analogous to database transactions for controlling access to shared memory in concurrent computing. It is an alternative to lock-based synchronization. STM is a strategy implemented in software, rather than as a hardware component.

- A thread completes modifications to shared memory without regard for what other threads might be doing, recording every read and write that it is performing in a log.
- Instead of placing the onus on the writer to make sure it does not adversely affect other operations in progress, it is placed on the reader, who after completing an entire transaction verifies that other threads have not concurrently made changes to memory that it accessed in the past.
- This final operation, in which the changes of a transaction are validated and, if validation is successful, made permanent, is called a commit. A transaction may also abort at any time, causing all of its prior changes to be rolled back or undone. If a transaction cannot be committed due to conflicting changes, it is typically aborted and re-executed from the beginning until it succeeds.

Clojure has STM support built into the core language.

*Reference*

+ [Software transactional memory - Wikipedia](https://en.wikipedia.org/wiki/Software_transactional_memory)

### Concurrency Model: Actor Model

The actor model has its theoretical roots in concurrency modelling and message passing concepts.

The basic operation of an Actor is easy to understand: like a thread, it runs concurrently with other Actors. However, unlike threads it is not pre-emptable. Instead, each Actor has a mailbox and can call a routine named “receive” to check its mailbox for new messages. The “receive” routine takes a filter, and if no messages in an Actor’s mailbox matches the filter, the Actor sleeps until it receives new messages, at which time it’s rescheduled for execution.

Well, that’s a bit of a naive description. In reality the important part about Actors is that they cannot mutate shared state simultaneously. That means there are no race conditions or deadlocks because there are no mutexes, conditions, and semaphores, only messages and mailboxes.

Actors are an approach to concurrency which has proven remarkably successful in languages like Erlang and Scala. They emphasize message passing as the only means of exchanging state, as opposed to threaded approaches like mutexes, conditions, and semaphores which hopefully guard access and mutation of any shared state, emphasis on the hopefully. Using messaging eliminates several problems in multithreaded programming, including many types of race conditions and deadlocks which result from hope dying in the cold light of reality.

**Message Passing**

The fundamental idea of the actor model is to use actors as concurrent primitives that can act upon receiving messages in different ways:

- Send a finite number of messages to other actors.
- Spawn a finite number of new actors.
- Change its own internal behavior, taking effect when the next incoming message is handled.

For communication, the actor model uses asynchronous message passing. In particular, it does not use any intermediate entities such as channels. Instead, each actor possesses a mailbox and can be addressed. These addresses are not to be confused with identities, and each actor can have no, one or multiple addresses. When an actor sends a message, it must know the address of the recipient. In addition, actors are allowed to send messages to themselves, which they will receive and handle later in a future step.

Messages are sent asynchronously and can take arbitrarily long to eventually arrive in the mailbox of the receiver. Also, the actor models makes no guarantees on the ordering of messages. Queuing and dequeuing of messages in a mailbox are atomic operations, so there cannot be a race condition.

There is no shared state and the interaction between actors is purely based on asynchronous messages.

![RCIT-actor_message_passing.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/RCIT-actor_message_passing.png)

**Implementation**

- Thread-based Actors - the actor is internally backed by a dedicated thread. This obviously limits scalability and requires the thread to suspend and block when waiting for new messages.
- Event-driven Actors - which does not directly couple actors to threads. Instead, a thread pool can be used for a number of actors. This approach uses a continuation closure to encapsulate the actor and its state. Conceptually, this implementation is very similar to an event loop backed by a threadpool.

**Reactor Pattern**

The reactor design pattern is an event handling pattern for handling service requests delivered concurrently to a service handler by one or more inputs. The service handler then demultiplexes the incoming requests and dispatches them synchronously to the associated request handlers.

The reactor pattern completely separates application specific code from the reactor implementation, which means that application components can be divided into modular, reusable parts. Also, due to the synchronous calling of request handlers, the reactor pattern allows for simple coarse-grain concurrency while not adding the complexity of multiple threads to the system.

*Reference*

* [Actor Model - Wikipedia](https://en.wikipedia.org/wiki/Actor_model)
* [Philosophy - Revactor](http://revactor.github.io/philosophy/)
* [Ruby Concurrency with Actors - Pat Eyler](http://on-ruby.blogspot.jp/2008/01/ruby-concurrency-with-actors.html)
* [Reactor Pattern - Wikipedia](https://en.wikipedia.org/wiki/Reactor_pattern)
* [Actor-based Concurrency - Benjamin Erb](http://berb.github.io/diploma-thesis/original/054_actors.html#02)
