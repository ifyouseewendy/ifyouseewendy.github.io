---
layout: post
title: "Ruby Concurrency In Practice"
date: 2016-02-16 19:58:54 +0800
comments: true
categories: ['Ruby', 'Concurrency']
---

* TOC
{:toc}

## Guidance

### Safest path to concurrency

> from [JRuby wiki](https://github.com/jruby/jruby/wiki/Concurrency-in-jruby)

1. Don't do it.
2. If you must do it, don't share data across threads.
3. If you must share data across threads, don't share mutable data.
4. If you must share mutable data across threads, synchronize access to that data.

Do not communicate by sharing data; instead, share data by communicating

### Writing Thread-safe Code

**Avoid mutating globals**

- Constants
- The AST
- Class variables/methods

**Create more objects, rather than sharing one**

- Thread-locals
- Connection pools

**Avoid lazy loading**

- No autoload

**Prefer data structures over mutexes**

Mutexes are notoriously hard to use correctly. For better or worse, you have a lot of things to decide when using a mutex.

- How coarse or fine should this mutex be?
- Which lines of code need to be in the critical section?
- Is a deadlock possible here?
- Do I need a per-instance mutex? Or a global one?

By leaning on a data structure, you remove the burden of correct synchronization from your code and depend on the semantics of the data structure to keep things consistent.

**Wrap your threads in an abstraction**

- Actor model
- Reactor Pattern, event-driven I/O

## Into the Wild

**Primitives**

- [Thread](http://ruby-doc.org/core-2.2.2/Thread.html)
- [Mutex](http://ruby-doc.org/core-2.2.2/Mutex.html)
- [ConditionVariable](http://ruby-doc.org/core-2.2.2/ConditionVariable.html)

**Thread-safe Data Structure**

- [hamster](https://github.com/hamstergem/hamster) - Efficient, Immutable, Thread-Safe Collection classes for Ruby
- [thread_safe](https://github.com/ruby-concurrency/thread_safe) - Thread-safe collections for Ruby
- [atomic](https://github.com/ruby-concurrency/atomic) - Atomic references for Ruby (merged with concurrent-ruby)
- [connection_pool](https://github.com/mperham/connection_pool) - Generic connection pooling for Ruby

**Abstraction / Framework**

[celluloid](https://github.com/celluloid/celluloid)

Actor-based concurrent object framework for Ruby.

- [Reel](https://github.com/celluloid/reel/) - An "evented" web server based on Celluloid::IO
- [angelo](https://github.com/kenichi/angelo) - Sinatra-like DSL for Reel that supports WebSockets and SSE

[eventmachine](https://github.com/eventmachine/eventmachine)

EventMachine is an event-driven I/O and lightweight concurrency library for Ruby. It provides event-driven I/O using the Reactor pattern.

- [Thin](http://code.macournoyer.com/thin/), [Goliath](https://github.com/postrank-labs/goliath/) - Scalable event-driven servers. Examples:
- [em-http-request](https://github.com/igrigorik/em-http-request) - Asynchronous HTTP Client (EventMachine + Ruby)
- [em-synchrony](https://github.com/igrigorik/em-synchrony) - Fiber aware EventMachine clients and convenience classes

[puma](https://github.com/puma/puma)

A ruby web server built for concurrency

[concurrent-ruby](https://github.com/ruby-concurrency/concurrent-ruby)

Modern concurrency tools including agents, futures, promises, thread pools, supervisors, and more. Inspired by Erlang, Clojure, Scala, Go, Java, JavaScript, and classic concurrency patterns.
