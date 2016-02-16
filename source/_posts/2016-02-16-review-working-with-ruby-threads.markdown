---
layout: post
title: "[Review] Working With Ruby Threads"
date: 2016-02-16 13:07:05 +0800
comments: true
categories: ['Ruby', 'Concurrency']
---

{:.custom}
| **Book**    | Working With Ruby Threads
| **Author**  | [Jesse Storimer](http://www.jstorimer.com/)
| **Link**    | [www.jstorimer.com/products/working-with-ruby-threads](http://www.jstorimer.com/products/working-with-ruby-threads)

* TOC
{:toc}

## Concurrent != Parallel

- Making it execute in parallel is out of your hands. That responsibility is left to the underlying thread scheduler.
- Making it concurrent, you enable it to be parallelized when the underlying system allows it.

Example

1. You could complete Project A today, then complete Project B tomorrow. (Serial)
2. You could work on Project A for a few hours this morning, then switch to Project B for a few hours this afternoon, and then do the same thing tomorrow. Both projects will be finished at the end of the second day. (Concurrent)
3. Your agency could hire another programmer. He could work on Project B and you could work on Project A. Both projects will be finished at the end of the first day. (Concurrent && Parallel)

## The GIL and MRI

**MRI allows concurrent execution of Ruby code, but prevents parallel execution of Ruby code.**

The GIL prevents parallel execution of Ruby code, but it doesn't prevent concurrent execution of Ruby code. Remember that concurrent code execution is possible even on a single core CPU by giving each thread a turn with the resources.

MRI doesn't let a thread hog the GIL when it hits blocking IO. This is a no-brainer optimization for MRI. When a thread is blocked waiting for IO, it won't be executing any Ruby code. Hence, when a thread is blocking on IO, it releases the GIL so another thread can execute Ruby code.

Example

```ruby
require 'open-uri'
3.times.map do
  Thread.new do
    open('http://zombo.com')
  end
end.each(&:value)
```

Thread A gets the GIL. It starts executing Ruby code. It gets down to Ruby's Socket APIs and attempts to open a connection to zombo.com. At this point, while Thread A is waiting for its response, it releases the GIL. Now Thread B acquires the GIL and goes through the same steps.

Meanwhile, Thread A is still waiting for its response. Remember that the threads can execute in parallel, so long as they're not executing Ruby code. So it's quite possible for Thread A and Thread B to both have initiated their connections, and both be waiting for a response.

Under the hood, each thread is using a ppoll(2) system call to be notified when their connection attempt succeeds or fails. When the ppoll(2) call returns, the socket will have some data ready for consumption. At this point, the threads will need to execute Ruby code to process the data. So now the whole process starts over again.

**Why GIL Exists?**

MRI core developers have been calling the GIL a feature for some time now, rather than a bug. There are three reasons that the GIL exists:

- To protect MRI internals from race conditions. The same issues that can happen in your Ruby code can happen in MRI's C code. When it's running in a multithreaded context, it will need to protect critical parts of the internals with some kind of synchronization mechanism.
- To facilitate the C extension API
- To reduce the likelihood of race conditions in your Ruby code. It's important to note that the GIL only reduces entropy here; it can't rule it out all together. It's a bit like wearing fully body armour to walk down the street: it really helps if you get attacked, but most of the time it's just confining.

**MRI with blocking IO encourages a context switch while waiting for the thread to print to stdout**

```ruby
@counter = 0

5.times.map do
  Thread.new do
    temp = @counter
    temp = temp + 1
    @counter = temp
  end
end.each(&:join)

puts @counter
```

With no synchronization, even with a GIL, it's possible that a context switch happens between incrementing temp and assigning it back to counter. If this is the case, it's possible that two threads assign the same value to counter. In the end the result of this little snippet could be less than 5.

It's rare to get an incorrect answer using MRI with this snippet, but almost guaranteed if you use JRuby or Rubinius. If you insert a puts in the middle of the block passed to Thread.new, then it's very likely that MRI will produce an incorrect result. Its behaviour with blocking IO encourages a context switch while waiting for the thread to print to stdout.

**Compare to JRuby, and Rubinius**

![WWRT-multi_thread_prime_number_generation.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/WWRT-multi_thread_prime_number_generation.png)

GIL makes MRI run faster in single-threaded way, as no need to accquire or release locks for data structures. But also makes MRI run slower in multi-threaded way, as disabling on parellelism.

JRuby and Rubinius do indeed protect their internals from race conditions. But rather than wrapping a lock around the execution of all Ruby code, they protect their internal data structures with many fine-grained locks. Rubinius, for instance, replaced their GIL with about 50 fine-grained locks.

## Thread Execution

**Threads in Ruby**

There's always at least one: the main thread. The main thread has one special property that's different from other threads. When the main thread exits, all other threads are immediately terminated and the Ruby process exits.

The most important concept to grasp is that threads have a shared address space. A race condition involves two threads racing to perform an operation on some shared state.

`Thread#join`

When one thread raises an unhandled exception, it terminates the thread where the exception was raised, but doesn't affect other threads. Similarly, a thread that crashes from an unhandled exception won't be noticed until another thread attempts to join it.

`Thread#status`

- run: Threads currently running have this status.
- sleep: Threads currently sleeping, blocked waiting for a mutex, or waiting on IO, have this status.
- false: Threads that finished executing their block of code, or were successfully killed, have this status.
- nil: Threads that raised an unhandled exception have this status.
- aborting: Threads that are currently running, yet dying, have this status.

`Thread.stop`

This method puts the current thread to sleep and tells the thread scheduler to schedule some other thread. It will remain in this sleeping state until its alternate, Thread#wakeup is invoked.

`Thread.pass`

It asks the thread scheduler to schedule some other thread. Since the current thread doesn't sleep, it can't guarantee that the thread scheduler will take the hint.

Avoid `Thread#raise` and `Thread#kill`

It doesn't properly respect ensure blocks, which can lead to nasty problems in your code.

**How Many Threads Are Too Many?**

It depends, there will be a sweet spot between utilizing available resources and context switching overhead.

![WWRT-io_bound.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/WWRT-io_bound.png)
![WWRT-cpu_bound.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/WWRT-cpu_bound.png)

CPU-bound code is inherently bound by the rate at which the CPU can execute instructions. Creating more threads isn't necessarily faster. On the other hand, introducing more threads improved performance in these two examples by anywhere between 100% and 600%. Finding that sweet spot is certainly worth it.

**Thread safety**

When your code isn't thread-safe, the worst that can happen is that your underlying data becomes incorrect, yet your program continues as if it were correct.

The computer is unaware of thread-safety issues. The onus is on you to notice these problems and deal with them. This is one of the hardest problems when it comes to thread safety. There are no exceptions raised or alarm bells rung when the underlying data is no longer correct. Even worse, sometimes it takes a heavy load to expose a race condition like this.

Any concurrent modifications to the same object are not thread-safe.

## Mutual Exclusion

**Demo Snippet**

```ruby
# This class represents an ecommerce order
class Order
  attr_accessor :amount, :status

  def initialize(amount, status)
    @amount, @status = amount, status
  end

  def pending?
    status == 'pending'
  end

  def collect_payment
    puts "Collecting payment..."
    self.status = 'paid'
  end
end

# Create a pending order for $100
order = Order.new(100.00, 'pending')
mutex = Mutex.new

# Ask 5 threads to check the status, and collect
# payment if it's 'pending'
5.times.map do
  Thread.new do
    mutex.synchronize do
      if order.pending?
        order.collect_payment
      end
    end
  end
end.each(&:join)
```

The block of code inside of a `Mutex#synchronize` call is often called a critical section, pointing to the fact that this code accesses a shared resource and must be handled correctly.

**Memory Visibility (Volatility)**

```ruby
# With this line, it's possible that another thread
# updated the status already and this value is stale
status = order.status

# With this line, it's guaranteed that this value is
# consistent with any changes in other threads
status = mutex.synchronize { order.status }
```

The reason for this is due to low-level details. The kernel can cache in, for instance, L2 cache before it's visible in main memory. It's possible that after the status has been set to 'paid,' by one thread, another thread could still see the Order#status as 'pending' by reading the value from main memory before the change has propagated there.

The solution to this is something called a memory barrier. Mutexes are implemented with memory barriers, such that when a mutex is locked, a memory barrier provides the proper memory visibility semantics.

Scenarios around memory visibility are difficult to understand and reason about. That's one reason other programming languages have defined something called a memory model, a well-defined specification describing how and when changes to memory are visible in other threads.

Ruby has no such specification yet, so situations like this are tricky to reason about and may even yield different results with different runtimes. That being said, **mutexes carry an implicit memory barrier**. So, if one thread holds a mutex to write a value, other threads can lock the same mutex to read it and they will see the correct, most recent value.

**Performance**

Mutexes inhibit parallelism. Restrict the critical section to be as small as possible, while still preserving the safety of your data.

**The dreaded deadlock**

The `try_lock` method attempts to acquire the mutex, just like the lock method. But unlike lock, try_lock will not wait if the mutex isn't available. If another thread already owns the mutex, try_lock will return false. If it successfully acquires the mutex, try_lock will return true.

The downside to this approach is that another kind of issue can arise: **livelocking**. A livelock is similar to a deadlock in that the system is not progressing, but rather than threads stuck sleeping, they would be stuck in some loop with each other with none progressing.

A better solution is to define a mutex hierarchy. In other words, **any time that two threads both need to acquire multiple mutexes, make sure they do it in the same order**.

## Signaling Threads with Condition Variables

Condition variables provide an inter-thread control flow mechanism. A classic usage pattern is Producer-Consumer.

**Demo Snippet**

```ruby
require 'thread'
require 'net/http'

mutex    = Mutex.new
condvar  = ConditionVariable.new
results  = Array.new

Thread.new do
  10.times do
    response = Net::HTTP.get_response('dynamic.xkcd.com', '/random/comic/')
    random_comic_url = response['Location']

    mutex.synchronize do
      results << random_comic_url
      puts 'Produced result'
      condvar.signal # Signal the ConditionVariable
    end
  end
end

comics_received = 0

until comics_received >= 10
  mutex.synchronize do
    while results.empty?
      condvar.wait(mutex)
    end

    url = results.shift
    puts "You should check out #{url}"
  end

  comics_received += 1
end
```

1. `ConditionVariable#signal` will wake up exactly one thread that's waiting on this ConditionVariable.
2. `ConditionVariable#broadcast` will wake up all threads currently waiting on this ConditionVariable.

## Thread-safe Data Structures

**Implementing a thread-safe, blocking queue**

```ruby
require 'thread'

class BlockingQueue
  attr_reader :queue, :mutex, :cv

  def initialize
    @queue = Array.new
    @mutex = Mutex.new
    @cv    = ConditionVariable.new
  end

  def push(ele)
    @mutex.synchronize do
      @queue.push ele
      @cv.signal
    end
  end

  def pop
    @mutex.synchronize do
      while @queue.empty?
        @cv.wait(@mutex)
      end

      @queue.pop
    end
  end
end

bq = BlockingQueue.new

bq.push 'a'
bq.push 'b'

loop do
  puts bq.pop
end
```

**Queue, from the standard lib**

This is the only thread-safe data structure that ships with Ruby. Queue is very useful because of its blocking behaviour. Typically, you would use a Queue to distribute workloads to multiple threads, with one thread pushing to the queue, and multiple threads popping.

**Array and Hash**

Ruby doesn't ship with any thread-safe Array or Hash implementations. Thread-safety concerns would add overhead to their implementation, which would hurt performance for single-threaded use cases.

You might be thinking: "With all of the great concurrency support available to Java on the JVM, surely the JRuby Array and Hash are thread-safe?" They're not. For the exact reason mentioned above, using a thread-safe data structure in a single-threaded context would reduce performance.

**Immutable data structures**

When you need to share objects between threads, share immutable objects. It's very easy to pass out immutable objects to share, but if you need to have multiple threads modifying an immutable object you still need some form of synchronization.

Immutability is a nice guarantee to have, it's the simplest path to thread safety when sharing objects.

```ruby
require 'hamster/queue'
require 'atomic'

@queue_wrapper = Atomic.new(Hamster::Queue.new)

30.times do
  @queue_wrapper.update { |queue|
    queue.enqueue(rand(100))
  }
end

consumers = []

3.times do
  consumers << Thread.new do
    10.times do
      number = nil
      @queue_wrapper.update { |queue|
        number = queue.head
        queue.dequeue
      }

      puts "The cubed root of #{number} is #{Math.cbrt(number)}"
    end
  end
end

consumers.each(&:join)
```

## Writing Thread-safe Code

Any guideline has exceptions, but it's good to know when you're breaking one, and why.

Idiomatic Ruby code is most often thread-safe Ruby code.

**Avoid mutating globals**

Any time there is only one shared instance (aka. singleton), it's a global.

There are other things that fit this definition in Ruby:

- Constants
- The AST
- Class variables/methods

A slightly more nefarious example is the AST. Ruby, being such a dynamic language, allows you to change this at runtime. I don't imagine this would be a common problem, but I saw it come up as an issue with the kaminari rubygem. Some part of the code was defining a method dynamically, then calling alias_method with that method, then removing it.

Again, this has to be a rare example, but it's good to keep in mind that modifying the AST at runtime is almost always a bad idea, especially when multiple threads are involved. When I say 'runtime', I mean during the course of the lifecycle of the application. In other words, it's expected that the AST will be modified at startup time, most Ruby libraries depend on this behaviour in some way. However, in the case of a Rails application, once it's been initialized, changes to the AST shouldn't happen at runtime, just as it's rare to require new files in the midst of a controller action.

**Create more objects, rather than sharing one**

- Thread-locals
- Connection pools

A thread-local lets you define a variable that is global to the scope of the current thread. In other words, it's a global variable that is locally scoped on a per-thread basis.

```ruby
# Instead of
$redis = Redis.new
# use
Thread.current[:redis] = Redis.new
```

It's perfectly acceptable to tell users of your API that they should create one object for each thread, rather than trying to write difficult, thread-safe code that will increase your maintainenace costs.

This N:N connection mapping is fine for small numbers of threads, but gets out of hand when the number of threads starts to increase. For connections, a pool is often a better abstraction.

Resource pool still ensures that your threads aren't sharing a single connection, but doesn't require each thread to have its own. Implementing a connection pool is a good exercise in thread-safe programming, you'll probably need to make use of both thread-locals and mutexes to do it safely.

**Avoid lazy loading**

A common idiom in Ruby on Rails applications is to lazily load constants at runtime, using something similar to Ruby's `autoload`. But `autoload` in MRI is not thread-safe. It is thread-safe in recent versions of JRuby, but the best practice is simply to eager load files before spawning worker threads. This is done implicitly in Rails 4+, and can be enabled in Rails 3.x using the ` config.threadsafe!` configuration setting.

**Prefer data structures over mutexes**

Mutexes are notoriously hard to use correctly. For better or worse, you have a lot of things to decide when using a mutex.

- How coarse or fine should this mutex be?
- Which lines of code need to be in the critical section?
- Is a deadlock possible here?
- Do I need a per-instance mutex? Or a global one?

By leaning on a data structure, you remove the burden of correct synchronization from your code and depend on the semantics of the data structure to keep things consistent.

This only works if you choose not to share objects between threads directly. Rather than letting threads access shared objects and implementing the necessary synchronization, you pass shared objects through data structures.

**Finding bugs**

Like most bugs, if you can reproduce the issue, you can almost certainly track it down and fix it. However, some thread-safety issues may appear in production under heavy load, but can't be reproduced locally. In this case, there's no better solution than grokking the code.

Look at the code and assume that 2 threads will be accessing it simulatneously. Step through the possible scenarios. It can be helpful to jot these things down somewhere.

**Thread-safety on Rails**

- Gem dependencies
- The request is the boundary. Don't share objects between requests.

A good example of this is something like a `User.current` reference.

If you really need a global reference, follow the guidelines from the last chapter. Try using a thread-local, or else a thread-aware object that will preserve data correctness.

The same heuristic is applicable to a background job processor. Each job will be handled by a separate thread. A thread may process multiple jobs in its lifetime, but a job will only be processed by a single thread in its lifecycle.

Again, the path to thread safety is clear: create the necessary objects that you need in the body of the job, rather than sharing any global state.

## Wrap Your Threads in an Abstraction

**Single level of abstraction**

```ruby
module Enumerable
  def concurrent_each
    threads = []
    each do |element|
      threads << Thread.new { end yield element }
      threads.each(&:join)
    end
  end
end
```

This is a simple wrapper around Enumerable#each that will spawn a thread for each element being iterated over. It wouldn't be wise to use this code in production yet because it has no upper bound on the number of threads it will spawn.

**Actor model**

At a high level, an Actor is a long-lived 'entity' that communicates by sending messages.

In the Actor model, each Actor has an 'address'. If you know the address of an Actor, you can send it a message. These messages go to the Actor's mailbox, where they're processed asynchronously when the Actor gets around to it.

What sets Celluloid apart is that it takes this conceptual idea of the Actor model and marries it to Ruby's object model.

```ruby
require 'celluloid/autostart'
require 'net/http'

class XKCDFetcher
  include Celluloid

  def next
    response = Net::HTTP.get_response('dynamic.xkcd.com', '/random/comic/')
    random_comic_url = response['Location']

    random_comic_url
  end
end
```

Including the Celluloid module into any Ruby class will turn instances of that class into full-fledged Celluloid actors. When you create a new actor, you immediately know its 'address'. So long as you hold a reference to that object, you can send it messages. In Celluloid, sending messages to an actor equates to calling methods on an object.

```ruby
# this spawns a new thread containing a Celluloid actor
fetcher = XKCDFetcher.new

# these behave like regular method calls
fetcher.object_id
fetcher.inspect

# this will fire the `next` method without
# waiting for its result
fetcher.async.next
fetcher.async.next

# Celluloid kicks off that method asynchronously and returns you a Celluloid::Future object.
futures = []
10.times do
  futures << fetcher.future.next
end

# Calling #value on that future object will block until the value has been computed.
futures.each do |future|
  puts "You should check out #{future.value}"
end
```

## Into The Wild

**How Sidekiq Uses Celluloid**

![WWRT-how_sidekiq_uses_celluloid.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/WWRT-how_sidekiq_uses_celluloid.png)

The most obvious difference I see between the Sidekiq codebase and a more traditional Ruby codebase is the lack of dependence upon return values.

**Puma's Thread Pool Implementation**

At Puma's multi-threaded core is a thread pool implementation. Once initialized, the pool is responsible for receiving work and feeding it to an available worker thread. The ThreadPool also has an auto-trimming feature, whereby the number of active threads is kept to a minimum, but more threads can be spawned during times of high load. Afterwards, the thread pool would be trimmed down to the minimum again.

## Closing

The safest path to concurrency: (from JRuby wiki)

1. Don't do it.
2. If you must do it, don't share data across threads.
3. If you must share data across threads, don't share mutable data.
4. If you must share mutable data across threads, synchronize access to that data.
