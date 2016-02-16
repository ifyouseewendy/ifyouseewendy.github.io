---
layout: post
title: "Ruby Concurrency Article Collection"
date: 2016-02-16 20:04:50 +0800
comments: true
categories: ['Ruby', 'Concurrency']
---

This an article collection about concurrency in Ruby, which benefits me a lot and to be continued.

> [Threads, Not Just for Optimisations - Jesse Storimer](http://www.jstorimer.com/blogs/workingwithcode/7766063-threads-not-just-for-optimizations)

Threads can help us organize our programs.

When a signal is delivered to a multithreaded process that has established a signal handler, the kernel arbitrarily selects one thread in the process to which to deliver the signal and invokes the handler in that thread. So Ruby uses a dedicated thread to handle incoming Unix signals. This has nothing to do with speeding things up, it's just good programming practice.

When you spawn a new Unix process using fork, you really should either wait for it to finish using Process.wait, or detach from it using Process.detach. The reason is that when the process exits, it leaves behind some information about its exit status. This status info can't be cleaned up until it's been consumed by the parent process using Process.wait. When you use something like Process.spawn or backticks, Process.wait is called internally to cleanup the aforementioned status info. So Process.detach is just a thin wrapper around Process.wait, using a background thread to wait for the return value of Process.wait, while the main thread continues execution concurrently. Again, this has nothing to do with speed, but allows the proper housekeeping to be done without burdening the program with extra state.

> [Concurrency is not Parallelism (it's better) - Rob Pike](http://concur.rspace.googlecode.com/hg/talk/concur.html#title-slide)

Go provides

- concurrent execution (coroutines. They're a bit like threads, but they're much cheaper. Goroutines are multiplexed onto OS threads as required. When a goroutine blocks, that thread blocks but no other goroutine blocks.)
- synchronization and messaging (channels)
- multi-way concurrent control (select)

Concurrency vs. Paralelism

- Concurrency is about dealing with lots of things at once.
- Parallelism is about doing lots of things at once.
- Not the same, but related.
- One is about structure (design), one is about execution.
- Concurrency provides a way to structure a solution to solve a problem that may (but not necessarily) be parallelizable.

Concurrency plus communication

- Concurrency is a way to structure a program by breaking it into pieces that can be executed independently.
- Communication is the means to coordinate the independent executions.
- This is the Go model and (like Erlang and others) it's based on CSP (Communicating Sequential Processes)

> [Ruby, Concurrency, and You - Engine Yard](https://blog.engineyard.com/2011/ruby-concurrency-and-you)

![RCAC-ruby_support.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/RCAC-ruby_support.png)

> [Concurrency in JRuby](https://github.com/jruby/jruby/wiki/Concurrency-in-jruby)

In general, the safest path to writing concurrent code in JRuby is the same as on any other platform:

- Don't do it, if you can avoid it.
- If you must do it, don't share data across threads.
- If you must share data across threads, don't share mutable data.
- If you must share mutable data across threads, synchronize access to that data.

Thread Safety refers to the ability to perform operations against a shared structure across multiple threads and know there will be no resulting errors or data integrity issues.

Volatility refers to the visibility of changes across threads on multi-core systems that may have thread or core-specific views of system memory.

Atomicity refers to the ability to perform a write to memory based on some view of that memory and to know the write happens before the view is invalid.

> + [Nobody understands the GIL - Part 1 - Jesse Storimer](http://www.jstorimer.com/blogs/workingwithcode/8085491-nobody-understands-the-gil%0A)
> + [Nobody understands the GIL - Part 2: Implementation - Jesse Storimer](http://www.jstorimer.com/blogs/workingwithcode/8100871-nobody-understands-the-gil-part-2-implementation)
> + [Does the GIL Make Your Ruby Code Thread-Safe? - Jesse Storimer](http://www.rubyinside.com/does-the-gil-make-your-ruby-code-thread-safe-6051.html)

It's possible for all of the Ruby implementations to provide thread-safe data structures, but that requires extra overhead that would make single-threaded code slower.

For the MRI core team, the GIL protects the internal state of the system. With a GIL, they don't require any locks or synchronization around the internal data structures. If two threads can't be mutating the internals at the same time, then no race conditions can occur. For you, the developer, this will severely limit the parallelism you get from running your Ruby code on MRI.

All that the GIL guarantees is that MRI's native C implementations of Ruby methods will be executed atomically (but even this has caveats). This behaviour can sometimes help us as Ruby developers, but the GIL is really there for the protection of MRI internals, not as a dependable API for Ruby developers. So the GIL doesn't 'solve' thread-safety issues.

Don't communicate by sharing state; share state by communicating.

> [Parallelism is a Myth in Ruby - Ilya Grigorik](https://www.igvita.com/2008/11/13/concurrency-is-a-myth-in-ruby/)

![RCAC-ruby_gil.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/RCAC-ruby_gil.png)

> [Everything You Know About GIL is Wrong - Jerry D'Antonio](https://github.com/jdantonio/Everything-You-Know-About-the-GIL-is-Wrong-RubyConf-2015)

Summary

- Concurrency is not parallelism
- The GIL protects Ruby’s internal state when the operating system context switches
    - The GIL does not provide thread safety guarantees to user code
    - But it imposes an implicit memory model
- The GIL prevents true parallelism in Ruby
- But Ruby is pretty good at multiplexing threads performing blocking I/O

Concurrency vs. Parallelism

Non-concurrent programs gain no benefit from running on multiple processors. Concurrent programs get parallelism for free when the runtime supports it.

- Parallelism requires two processor cores. No matter the language/runtime, a processor core can only execute one instruction at a time.
- Concurrency can happen when there is only one core. Concurrency is about design, improved performance is a side effect

Ruby is selfish

- Ruby is an interpreted language
    - Ruby is compiled to bytecode within the interpreter
    - Ruby is free to optimize and reorder your code
- Every Ruby operation is implemented in C
- The Ruby runtime is just another program; it is under the control of the compiler and the operating system
    - The C compiler is free to optimize and reorder instructions during compilation
    - An operating system context switch can occur at any point in the running C code
- The GIL protects Ruby, not your code

Ruby is thread safe, your code isn’t.

- Every individual read and write to memory is guaranteed to be thread-safe in Ruby
    - The GIL prevents interleaved access to memory used by the runtime
    - The GIL prevents interleaved access to individual variables
    - Ruby itself will never become corrupt
- Ruby makes no guarantees about your code

[Memory model](https://www.wikiwand.com/en/Memory_model_(programming))

- “In computing, a memory model describes the interactions of threads through memory and their shared use of the data.” Wikipedia
- Defines visibility, volatility, atomicity, and synchronization barriers
    - Java’s current memory model was adopted in 2004 as part of Java
    - The C and C++ memory models were adopted in 2011 with C11 and C++11
    - [The Go Memory Model](https://golang.org/ref/mem)
- Ruby does NOT have a documented memory model. The GIL provides an implied memory model but no guarantees

I/O

Ruby programs which perform significant I/O generally benefit from concurrency.

- I/O in Ruby programs is blocking
- I/O within Ruby is asynchronous

You can’t spell GIL without I/O. The GIL exists to maintain the internal consistency of the Ruby runtime. I/O operations are slow, which is why asynchronous I/O was invented. While I/O is in progress the Ruby thread is blocked so it cannot change the internal state, so Ruby allows other threads to do useful work. All Ruby I/O calls unlock the GIL, as do backtick and `system` calls. When Ruby thread is waiting on I/O it does not block other threads.

> [Ruby concurrency explained - Matt Aimonetti](http://merbist.com/2011/02/22/concurrency-in-ruby-explained/)

The thing to keep in mind is that the concurrency models are often defined by the programming language you use. The advantage of the Java threaded approach is that the memory is shared between the threads so you are saving in memory (and startup time), each thread can easily talk to each other via the shared memory. The advantage of PHP is that you don’t have to worry about locks, deadlocks, threadsafe code and all that mess hidden behind threads.

Others programming languages like Erlang and Scala use a third approach: the actor model. The actor model is somewhat a bit of a mix of both solutions, the difference is that actors are a like threads which don’t share the same memory context. Communication between actors is done via exchanged messages ensuring that each actor handles its own state and therefore avoiding corrupt data (two threads can modify the same data at the same time, but an actor can’t receive two messages at the exact same time).

Actors/Fibers

Ruby 1.9, developers now have access to a new type of “lightweight” threads called Fibers. Fibers are not actors and Ruby doesn’t have a native Actor model implementation but some people wrote some actor libs on top of fibers. A fiber is like a simplified thread which isn’t scheduled by the VM but by the programmer. Fibers are like blocks which can be paused and resumed from the outside of from within themselves.

How do fibers help with concurrency? The answer is that they are part of a bigger solution. Ruby 1.9 gave us fibers which allow for a more granular control over the concurrency scheduling, combined with non-blocking IO, high concurrency can be achieved. Fiber allow developers to manually control the scheduling of “concurrent” code but also to have the code within the fiber to auto schedule itself.  Well, the only problem is that if you are doing any type of blocking IO in a fiber, the entire thread is blocked and the other fibers aren’t running. So avoid blocking IOs.

Non blocking IOs/Reactor pattern

The reactor pattern is quite simple to understand really. The heavy work of making blocking IO calls is delegated to an external service (reactor) which can receive concurrent requests. The service handler (reactor) is given callback methods to trigger asynchronously based on the type of response received.

When a request comes in and your code makes a DB query, you are blocking any other requests from being processed. To avoid that, we could wrap our request in a fiber, trigger an async DB call and pause the fiber so another request can get processed as we are waiting for the DB. Once the DB query comes back, it wakes up the fiber it was trigger from, which then sends the response back to the client. Technically, the server can still only send one response at a time, but now fibers can run in parallel and don’t block the main tread by doing blocking IOs (since it’s done by the reactor).

This is the approach used by Twisted, EventMachine and Node.js. Ruby developers can use EventMachine or an EventMachine based webserver like Thin as well as EM clients/drivers to make non blocking async calls.

> [Node.js: What is a good comparison of the reactor pattern vs actor model? - Sean Byrnes](https://www.quora.com/Node-js/What-is-a-good-comparison-of-the-reactor-pattern-vs-actor-model)

The reactor model follows a purely event driven system where the entire system can be implemented as a single-threaded process with a series of event generators and event handlers. In most implementations there is a "event loop" that continues to run which takes all of the generated events, sends them to all registered event handles and then starts over again.

An actor model is a more abstract method of breaking up execution into different processes that interact with each other. While it is possible to do this similarly to the reactor model, I see this mostly as a series of processes running in different threads and exchanging information through messages or protocols.

> [Ruby Concurrency and Parallelism: A Practical Tutorial](http://www.toptal.com/ruby/ruby-concurrency-and-parallelism-a-practical-primer?utm_source=rubyweekly&utm_medium=email)

- Ruby concurrency is when two tasks can start, run, and complete in overlapping time periods. It doesn’t necessarily mean, though, that they’ll ever both be running at the same instant (e.g., multiple threads on a single-core machine).
- Parallelism is when two tasks literally run at the same time.

> [Ruby Fibers Vs Ruby Threads](http://oldmoe.blogspot.jp/2008/08/ruby-fibers-vs-ruby-threads.html)

Fibers are much faster to create than threads, they eat much less memory too.
