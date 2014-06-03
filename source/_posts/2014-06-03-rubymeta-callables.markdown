---
layout: post
title: "RubyMeta - Callables"
date: 2014-06-03 00:44:28 +0800
comments: true
categories: [Ruby, Excerpts]
---

## the Callables

> Package code, and call it later

+ **block**, evaluated in the scope which they're defined.
+ **proc**, which is basically a block turned object, and evaluated in the scope which they're defined.
+ **lambda**, which is a slight variation on a proc.
+ **method**, bound to an object, which are evaluated in that object’s scope. They can also be unbound from their scope and rebound to another object or class.

 **block** is not an object, while **proc** and **lambda** are Proc objects, and **method** is [in question](http://stackoverflow.com/questions/2602340/methods-in-ruby-objects-or-not).

## Blocks

The main point about blocks is that they are all inclusive and come ready to run. They contain both the **code** and **a set of bindings**.

**When you define the block, it simply grabs the bindings that are there at that moment**, and then it carries those bindings along when you pass the block into a method.

```ruby
def my_method
  x = "Goodbye"
  yield("cruel")
end

x = "Hello"
my_method {|y| "#{x}, #{y} world" } # => "Hello, cruel world"
```

**What if I define additional bindings inside a block?**

They disappear after the block ends.

**What's the meaning of "a block is a closure"?**

a block is a closure, this means a block captures the local bindings and carries them along with it.

**scope**

You can see bindings all over the scope.

`class`, `module`, and `def`, respectively. Each of these keywords acts like a **Scope Gate**.

**A subtle difference between `class`, `module` and `def`**

The code in a `class` or `module` definition is executed immediately. Conversely, the code in a method definition is executed later, when you eventually call the method.

**Whenever the program changes scope, some bindings are replaced by a new set of bindings. RIGHT?**

For `local_varialbes`, that's right, but `instance_variables`, `class_variables` and `global_variables` can go through the Scope Gate.

**What's the difference between Global Variables and Top-Level Instance Variables?**

when it comes to global variables, use them sparingly, if ever.

You can access a top-level instance variable whenever `main` takes the role of self. When any other object is `self`, the top-level instance variable is out of scope.

**How to cross the Scope Gate, and Why?**

Basicly use `Class.new`, `Module.new`, and `define_method`. You can also use these techniques:

+ Use Flat Scope
+ Use Shared Scope
+ Use Context Probe (`BasicObject#instance_eval`)

to mix code and bindings at will.

**What is Flat Scope?**

“flattening the scope,” meaning that the two scopes share variables as if the scopes were squeezed together. For short, you can call this spell a Flat Scope.

Use `Class.new`, `Module.new` and `define_method`.

**What is Shared Scope?**

```ruby
# use `def` to do seperate
def define_methods
  shared = 0

  Kernel.send :define_method, :counter do
  shared
  end

  Kernel.send :define_method, :inc do |x|
  shared += x
  end
end

define_methods


counter # => 0
inc(4)
counter # => 4
```

If you define multiple methods in the same Flat Scope, maybe protected by a Scope Gate, all those methods can share bindings. That’s called a **Shared Scope**.

**What is Context Probe?**

`instance_eval` has a slightly more flexible twin brother named `instance_exec`, that allows you to pass arguments to the block.

```ruby
class C
  def initialize
  @x = 1
  end
end

class D
  def twisted_method
  @y = 2
  C.new.instance_eval { "@x: #{@x}, @y: #{@y}" }
  end
end

D.new.twisted_method # => "@x: 1, @y: "
```

However, instance variables depend on `self`, so when `instance_eval` switches `self` to the receiver, all the instance variables in the caller fall out of scope.

**Clean Room**

Blank Slates are good candidates for Clean Room.

The ideal Clean Room doesn’t have many methods or instance variables, because the names of those methods and instance variables could clash with the names in the environment that the block comes from. For this reason, instances of `BasicObject` usually make for good Clean Rooms, because they’re Blank Slates.

You might think of using a `BasicObject` instead of an Object for your Clean Room. However, remember that `BasicObject` is also a Blank Slate, and as such it lacks some common methods such as puts.

**What's the different use for *Shared Scope* and *Clean Room*?**

*Shared Scope* is used in definition, to make variables(bindings) shared between methods, while *Clean Room* is used to run code, to help reduce the modifications on shared variables(like instance variables).

```ruby
# lambda which is called immediatley is the Shared Scope
lambda {
  setups = []
  events = []

Kernel.send :define_method, :event do |description, &block|
    events << {:description => description, :condition => block}
  end

  Kernel.send :define_method, :setup do |&block|
    setups << block
  end

  Kernel.send :define_method, :each_event do |&block|
    events.each do |event|
      block.call event
    end
  end

  Kernel.send :define_method, :each_setup do |&block|
    setups.each do |setup|
      block.call setup
    end
  end
}.call

load 'events.rb'

# env is created for each event to be a Clean Room
each_event do |event|
  env = Object.new
  each_setup do |setup|
    env.instance_eval &setup
  end
  puts "ALERT: #{event[:description]}" if env.instance_eval &(event[:condition])
end
```

**When is `yield` not enough to use?**

+ You want to pass the block to another method (or even another block).
+ You want to convert the block to a `Proc`.


## Proc Objects

as blocks are not objects, Ruby provides the standard library class `Proc`. A `Proc` is a block that has been turned into an object. You can create a `Proc` by passing the block to `Proc.new`. Later, you can evaluate the block-turned-object with `Proc#call`.

**Deferred Evaluation**

```ruby
inc = Proc.new {|x| x + 1 }
# more code...
inc.call(2) # => 3
```

**4 ways to create Procs +explicitly+**

```ruby
  Proc.new { |x| x + 1 }
proc { |x| x + 1 }
lambda { |x| x + 1 }
  -> x { x + 1 } # stabby lambda
```

**Ways to create Procs implicitly**

use `&` to convert block into a proc:

```ruby
def make_proc(&p)
  p
end

make_proc {|x| x + 1 }
```

**4 ways to call Procs**

```ruby
p.call(41)
p[41]
p === 41
p.(41)
```

**Use `&` to convert a block to Proc**

```ruby
def my_method(&the_proc)
  the_proc
end

p = my_method {|name| "Hello, #{name}!" }
p.class     # => Proc
p.call("Bill")  # => "Hello, Bill!"
```

**Use `&` to convert a Proc to block**

```ruby
def my_method(greeting)
    "#{greeting}, #{yield}!"
end

my_proc = proc { "Bill" }
my_method("Hello", &my_proc)
```

**What's a lambda?**

Procs created with `lambda` are called *lambdas*, while the others are simply called *procs*. (You can use the `Proc#lambda?` method to check whether the `Proc` is a lambda).


**Procs vs. Lambdas**

+ `return`

  `lambda` returns just returns from the lambda, while a proc returns from the scope where the proc itself was defined.

+ **arity**

  Call a `lambda` with the wrong arity, and it fails with an `ArgumentError`, while if there are too many arguments, a proc drops the excess arguments. If there are too few arguments, it assigns `nil` to the missing arguments.

Generally speaking, `lambdas` are more intuitive than procs because they’re more similar to methods. They’re pretty strict about arity, and they simply exit when you call `return`.

**About the tolerance on arguments**

method == lambda < proc == block

### Methods

By calling `Kernel#method`, you get the method itself as a Method object, which you can later execute with `Method#call`. In Ruby 2.1, you also have `Kernel#singleton_method`, that converts the name of a Singleton Method to a Method object.

**Conversions between methods and procs**

+ Use `Method#to_proc` to convert a method into proc.
+ Use `define_method` to convert a proc into method.

**An important difference between methods and procs**

a `lambda` is evaluated in the scope it’s defined in (it’s a closure, remember?), while a `Method` is evaluated in the scope of its object.


### Unbound Methods

`UnboundMethods` are like `Methods` that have been detached from their original class or module.

**You can’t call an `UnboundMethod`**, but you can use it to generate a normal method that you can call.

**generate**

+ use `Method#unbind`

```ruby
def foo; end
unbound = method(:foo).unbind
unbound.class   # => UnboundMethod
```

+ use `Module#instance_method`

```ruby
module MyModule
  def my_method
  42
  end
end

unbound = MyModule.instance_method(:my_method)
unbound.class   # => UnboundMethod
```

  *Note:* `instance_methods` is totally different, it's like `methods`, just return an array of symbols.

**usage**

+ bind the UnboundMethod to an object with `UnboundMethod#bind`. UnboundMethods that come from a class can only be bound to objects of the same class (or a subclass), while UnboundMethods that come from a module have no such limitation from Ruby 2.0 onwards.
+ use an UnboundMethod to define a brand new method by passing it to `Module#define_method`.

```ruby
String.class_eval do
define_method :another_method, unbound
end

"abc".another_method # => 42
```

**example**

In ActiveSupport, the 'autoloading' system includes a `Loadable` module, which redefines the standard `Kernel#load`. If a class includes `Loadable`, then `Loadable#load` gets lower then `Kernel#load` on its chain of ancestors.

And what if you want to stop using `Loadable#load` and go back to the plain vanilla `Kernel#load`?

```ruby # gems/activesupport-4.0.2/lib/active_support/dependencies.rb
module Loadable
  def exclude_from(base)
    base.class_eval { define_method :load, Kernel.instance_method(:load) }
  end
end
```
