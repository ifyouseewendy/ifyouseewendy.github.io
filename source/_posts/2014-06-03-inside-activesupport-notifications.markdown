---
layout: post
title: "Inside ActiveSupport Notifications"
date: 2014-06-03 00:45:35 +0800
comments: true
categories: [Ruby, Excerpts]
---

+ Read API doc first, [ActiveSupport::Notifications](ActiveSupport::Notifications).
+ About hooks inside Rails for instrumentation, check the edge doc on [Active Support Instrumentation](http://edgeguides.rubyonrails.org/active_support_instrumentation.html).

Then let's read through the **ActiveSupport::Notifications** source code.

## ActiveSupport::Notifications

###File name

[activesupport/lib/active_support/notifications.rb](https://github.com/rails/rails/blob/master/activesupport%2Flib%2Factive_support%2Fnotifications.rb)

###Dependency

+ `active_support/notifications/instrumenter`
+ `active_support/notifications/fanout`
+ `active_support/per_thread_registry`

###Brief

1. A class attribute accessor `notifier`, which is initialized by `Fanout.new`.
2. Several class methods as the interfaces exposed, which encapsulate `notifer` to do the real work.
3. A class named **InstrumentationRegistry**.

###Specification

####Class Variables

`self.notifier = Fanout.new`


####Class Methods

+ `subscribe`, `unsubscribe` and `publish` all delegate to `notifier`, like

    ```ruby
    def subscribe(*args, &block)
      notifier.subscribe(*args, &block)
    end
    ```

+ `subscribed(callback, *args, &block)`, `subscribe` while `block` is running, and `unsubscribe` while running is over.

    ```ruby
    def subscribed(callback, *args, &block)
      subscriber = subscribe(*args, &callback)
      yield
    ensure
      unsubscribe(subscriber)
    end
    ```

+ `instrument(name, payload = {})`

    ```ruby
    def instrument(name, payload = {})
      if notifier.listening?(name)
        instrumenter.instrument(name, payload) { yield payload if block_given? }
      else
        yield payload if block_given?
      end
    end
    ```

`notifier.listening?(name)` is checking if there are subscribers listening on the event name.

***And what's an instrumenter?***

Check out the **ActiveSupport::Notifications::Instrumenter** below or skip this part temporally.

Let's talk about **InstrumentationRegistry** first, it is a sub-class defined in **ActiveSupport::Notifications**. It extends **ActiveSupport::PerThreadRegistry** to keep thread safe, and defines `#instrumenter_for` used for recording **Instrumenter** instance for specific `notifier`.

```ruby
# This class is a registry which holds all of the +Instrumenter+ objects
# in a particular thread local. To access the +Instrumenter+ object for a
# particular +notifier+, you can call the following method:
#
#   InstrumentationRegistry.instrumenter_for(notifier)
#
# The instrumenters for multiple notifiers are held in a single instance of
# this class.
class InstrumentationRegistry # :nodoc:
  extend ActiveSupport::PerThreadRegistry

  def initialize
    @registry = {}
  end

  def instrumenter_for(notifier)
    @registry[notifier] ||= Instrumenter.new(notifier)
  end
end
```

Then look back in **ActiveSupport::Notifications** for its usage:

```ruby
def instrumenter
  InstrumentationRegistry.instance.instrumenter_for(notifier)
end
```

Extending **ActiveSupport::PerThreadRegistry** gives **InstrumentationRegistry** the `instance` class methods, returns a thread local **InstrumentationRegistry** instance. Check the **ActiveSupport::PerThreadRegistry** [api](http://api.rubyonrails.org/classes/ActiveSupport/PerThreadRegistry.html) for details.



## ActiveSupport::Notifications::Fanout

###File name

[activesupport/lib/active_support/notifications/fanout.rb](https://github.com/rails/rails/blob/master/activesupport%2Flib%2Factive_support%2Fnotifications%2Ffanout.rb)

###Dependency

+ `mutex_m`, a Ruby Std-lib module. [api](http://www.ruby-doc.org/stdlib-2.1.2//libdoc/mutex_m/rdoc/Mutex_m.html)
+ `thread_safe`, a collection of thread-safe versions of common core Ruby classes. [api](https://github.com/headius/thread_safe)

###Brief

This is a default queue implementation that ships with Notifications. It just pushes events to all registered log subscribers.

This class is thread safe. All methods are reentrant.

###Specification

####Instance Variables

`@subscribers`, an array, records the subscribers.

`@listeners_for`, a reverse map(hash). It maps the event name to the subscribers. Initialized by `ThreadSafe::Cache.new`, [thread_safe](https://github.com/headius/thread_safe) gem says:

> `ThreadSafe::Cache` also exists, as a hash-like object, and should have
much better performance characteristics esp. under high concurrency than
`ThreadSafe::Hash`. However, `ThreadSafe::Cache` is not strictly semantically
equivalent to a ruby `Hash` -- for instance, it does not necessarily retain
ordering by insertion time as `Hash` does. For most uses it should do fine
though, and we recommend you consider `ThreadSafe::Cache` instead of
`ThreadSafe::Hash` for your concurrency-safe hash needs. It understands some
options when created (depending on your ruby platform) that control some of the
internals.

####Instance Methods

+ `subscribe(pattern = nil, block = Proc.new)`

    `ActiveSupport::Notifications.subscribe` use this method on `notifier` to subscribe event name based on `pattern` and a `block` to do the instrumentation callback.

    It initialize a *subscriber* with `Subscribers.new pattern, block`, use `synchronize`(for thread safe) to record *subscriber* into `@subscribers`, and clear the `@listeners_for`, then returns the *subscriber*.

    ```ruby
    def subscribe(pattern = nil, block = Proc.new)
      subscriber = Subscribers.new pattern, block
      synchronize do
        @subscribers << subscriber
        @listeners_for.clear
      end
      subscriber
    end
    ```

+ `unsubscribe(subscriber)`

    ```ruby
    synchronize do
      @subscribers.reject! { |s| s.matches?(subscriber) }
        @listeners_for.clear
      end
    end
    ```

    Note the `matches?` method on subscriber. Every subscriber object defines this method, **Subscribers::Evented** and **Subscribers::Timed** defines it like this:

    ```ruby
    def matches?(subscriber_or_name)
      self === subscriber_or_name ||
        @pattern && @pattern === subscriber_or_name
    end
    ```

    Unsubscribe a subscriber object or unsubscribe based on the `@pattern` matching.

    **Subscribers::AllMessages** alias `matches?` to `===`, just do the type matching.

+ `start`, `finish`, `publish(name, id, payload)`

    just delegates to subscribers based on the event name.

    ```ruby
    def start(name, id, payload)
      listeners_for(name).each { |s| s.start(name, id, payload) }
    end
    ```

+ `listeners_for(name)`

    a helper method, equals fetch or set on `@listeners_for`, returns the subscribers based on the event name.

    ```ruby
    def listeners_for(name)
      # this is correctly done double-checked locking (ThreadSafe::Cache's lookups have volatile semantics)
      @listeners_for[name] || synchronize do
        # use synchronisation when accessing @subscribers
        @listeners_for[name] ||= @subscribers.select { |s| s.subscribed_to?(name) }
      end
    end
    ```

+ `listening?(name)`

  a helper method, checks if `listeners_for(name).any?`.

+ `wait`

  as this is a sync queue, this method is left blank.

####Modules

+ **Subscribers**

    **Subscribers** defines a class method `new` and three sub-classes: **Evented**, **Timed**, and **AllMessages**. **Timed** inheritates **Evented**, and **AllMessages** encapsulates an **Evented** object.

    About `self.new(pattern, listener)`, remember where does `Subscribers.new` get called?

    It's in `Fanout#subscribe(pattern = nil, block = Proc.new)`. If the `block` can duck-typing `:start` and `:finish`, it'll initialize a subscriber by **Evented** with `pattern` and `block` recorded, otherwise by **Timed**. And if `pattern` is nil, which means calling `ActiveSupport::Notifications.subscribe` without event name, `Subscribers.new` returns an **AllMessages** object which initialized with a subscriber defined above. Otherwise(if `pattern` presents) returns a subscriber directly.

    Normally we use `ActiveSupport::Notifications.subscribe` in two ways:

     + subscribe all events, which means no `pattern` passed, and a **Subscribers::AllMessages** instance saved.
     + the `block` we pass to `ActiveSupport::Notifications.subscribe` won't respond to `start` and `finish`, which means a **Subscribers::Timed** instance saved.


    These two ways have no conflicts: if passing a nil pattern and a block, it just returns an **Subscribers::AllMessages** instance which has a **Subscribers::Timed** instance wrapped.

    So let's check it out what does a **Subscribers::Timed** instance respond?

    ```ruby
    def start(name, id, payload)
      timestack = Thread.current[:_timestack] ||= []
      timestack.push Time.now
    end

    def finish(name, id, payload)
      timestack = Thread.current[:_timestack]
      started = timestack.pop
      @delegate.call(name, started, Time.now, id, payload)
    end

    def publish(name, *args)
      @delegate.call name, *args
    end

    def subscribed_to?(name)
      @pattern === name.to_s
    end

    def matches?(subscriber_or_name)
      self === subscriber_or_name ||
        @pattern && @pattern === subscriber_or_name
    end
    ```


## ActiveSupport::Notifications::Instrumenter

###File name

[activesupport/lib/active_support/notifications/instrumenter.rb](https://github.com/rails/rails/blob/master/activesupport%2Flib%2Factive_support%2Fnotifications%2Finstrumenter.rb)

###Dependency

`securerandom`, [api](http://ruby-doc.org/stdlib-2.1.0/libdoc/securerandom/rdoc/SecureRandom.html)

###Brief

###Specification

####Instance Variables

`@id`, with an `attr_reader`, generated by `SecureRandom.hex(10)`.

`@notifier`, records the **Fanout** instance.

####Instance Methods

+ `start(name, payload)`, `finish(name, payload)`

    ```ruby
    def start(name, payload)
      @notifier.start name, @id, payload
    end

    def finish(name, payload)
      @notifier.finish name, @id, payload
    end
    ```

+ `instrument(name, payload={})`

    ```ruby
    def instrument(name, payload={})
      start name, payload
      begin
        yield payload
      rescue Exception => e
        payload[:exception] = [e.class.name, e.message]
        raise e
      ensure
        finish name, payload
      end
    end
    ```

    Where does this method get called? in `ActiveSupport::Notifications.instrument`:

    ```ruby
    instrumenter.instrument(name, payload) { yield payload if block_given? }
    ```

    The processing begins with `start`, ends with `finish`, instrumenter delegates it to `@notifier`, and `notifier` turns to `@subscribers` which are listening for the event name. And what does `@subscribers` do with `start` and `finish`? Normally we use subscriber objects defined by `Subscribers::Timed`, which use `start` to save a beginning timestamp, and `finish` to save an ending timestamp, and calling the block user passed.

    Attention on the control flow, the events get sent even if an error occurs in the passed-in block.




## ActiveSupport::Notifications::Event

###File name

[activesupport/lib/active_support/notifications/instrumenter.rb](https://github.com/rails/rails/blob/master/activesupport%2Flib%2Factive_support%2Fnotifications%2Finstrumenter.rb)

###Dependency

###Specification

Note that this class has a `@children` instance variable recording associations between events, and these two methods:

```ruby
def <<(event)
  @children << event
end

def parent_of?(event)
  @children.include? event
end
```


## Main Working Flow

### ActiveSupport::Notifications.subscribe

1. `ActiveSupport::Notifications.subscribe(name) {|*args| }`.
2. in **Notficiations.subscribe**, `notifier.subscribe(*args, &block)`.
3. in **Fanout#subscribe**, `subscriber = Subscribers.new pattern, block`, then records subscriber into `@subscribers`.

### ActiveSupport::Notifications.instrument


  1. `ActiveSupport::Notifications.instrument(name, payload) { }`.
  2. in **Notficiations.instrument**, `instrumenter.instrument(name, payload) { yield payload if block_given? }`.
  3. in **Instrumenter#instrument**, `@notifier.start`, `yield payload` and then `@notifier.finish`.
  4. in **Fanout::Subscribers::Timed#start**, records beginning time.
  5. in **Fanout::Subscribers::Timed#finish**, records ending time, and passing `name, start_time, end_time, id, payload` to the subscribers callbacks.


## MISC

***How does ActiveSupport::Notifications keep thread safe?***

`extend` **ActiveSupport::PerThreadRegistry** in **InstrumentationRegistry**.

## Reference

Unit test:

+ [activesupport/test/notifications_test.rb](https://github.com/rails/rails/blob/master/activesupport%2Ftest%2Fnotifications_test.rb)
+ [activesupport/test/notifications/evented_notification_test.rb](https://github.com/rails/rails/blob/master/activesupport%2Ftest%2Fnotifications%2Fevented_notification_test.rb)
+ [activesupport/test/notifications/instrumenter_test.rb](https://github.com/rails/rails/blob/master/activesupport%2Ftest%2Fnotifications%2Finstrumenter_test.rb)

[On Notifications, Log Subscribers, and Bringing Sanity to Rails' Logging](http://www.paperplanes.de/2012/3/14/on-notifications-logsubscribers-and-bringing-sanity-to-rails-logging.html)  
[#249 Notifications in Rails 3](http://railscasts.com/episodes/249-notifications-in-rails-3)  
[Digging Deep with ActiveSupport::Notifications](https://speakerdeck.com/nextmat/digging-deep-with-activesupportnotifications)

