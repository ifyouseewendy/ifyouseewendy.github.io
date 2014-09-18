---
layout: post
title: "Metaprogramming Ruby"
date: 2014-06-03 00:44:28 +0800
comments: true
categories: [Ruby, Excerpts]
---

# The Object Model

![the_object_model](https://dl.dropboxusercontent.com/s/a6qc1yd1cd57pkp/the_object_model.png?dl=1&token_hash=AAEBXb4OJ73P3xWWbPmIMOferP8_YHxQlS9d8l0hjEq2wQ&expiry=1400078501)

An object contains its instance variables and a reference to a class.

## Instance variable

Instance variables just spring into existence when you assign them a value, so you can have objects of the same class that carry different instance variables.

## Instance method

You can get a list of an object’s methods by calling `Object#methods`.

When you talk about the class, you call it an instance method, and when you talk about the object, you simply call it a method.

```ruby
String.instance_methods == "abc".methods # => true
String.methods == "abc".methods # => false
```

An object’s instance variables live in the object itself, and an object’s methods live in the object’s class. That’s why objects of the same class share methods but don’t share instance variables.

## Truth about classes

The truth about classes: classes themselves are nothing but objects.

The methods of an object are also the instance methods of its class. In turn, this means that the methods of a class are the instance methods of `Class`:

```ruby
Class.instance_methods(false) # => [:allocate, :new, :superclass]
```

***What's the difference between `class` and `superclass`?***

+ `class` is about the type which an object belongs to.
+ `superclass` is about inheritance, between classes.

The `superclass` of Class is Module—which is to say, every class is also a module. To be precise, a class is a module with three additional instance methods (new, allocate, and superclass) that allow you to create objects or arrange classes into hierarchies.

***Which to pick between Class and Module?***

Usually, you pick a module when you mean it to be included somewhere, and you pick a class when you mean it to be instantiated or inherited.

***What's an Object, and what's a Class?***

+ What’s an object? It’s a bunch of instance variables, plus a link to a class. The object’s methods don’t live in the object—they live in the object’s class, where they’re called the instance methods of the class.

+ What’s a class? It’s an object (an instance of Class), plus a list of instance methods and a link to a superclass. Class is a subclass of Module, so a class is also a module.

***What's the difference between `load` and `require`?***

You use load to execute code, and you use require to import libraries.

1. use `require`, no need to appends '.rb'.
2. `require` loads only once.

***As `load` executes codes, how does `load` avoid conlicts?***

`load('motd.rb', true)`

If you load a file this way, Ruby creates an anonymous module, uses that module as a Namespace to contain all the constants from motd.rb, and then destroys the module.

## Constant

classes are nothing but objects, class names are nothing but constants.

***How is a constant really different from a variable?***

The one important difference has to do with their scope.

Constants are arranged in a tree similar to a file system, where the names of modules and classes play the part of directories and regular constants play the part of files.


## Method lookup


***What does Ruby do, when you call a method?***

1. It finds the method. This is a process called method lookup.
2. It executes the method. To do that, Ruby needs something called `self`.

***How dos Ruby lookup methods?***

*“one step to the right, then up”* rule: go one step to the right into the receiver’s class, and then go up the ancestors chain until you find the method.

***What does ancestor chain look like, when `prepend` or `include` multiple modules?***

The `prepend` method. It works like `include`, but it inserts the module below the including class.

```ruby
class C
    include M1
    include M2

    prepend M3
    prepend M4
end

class D < C; end

D.ancestors # => ['M4', 'M3', 'C', 'M2', 'M1']
```

***What does Ruby do, when `prepend` or `include` a module multiple times?***

If that module is already in the chain, Ruby silently ignores the second inclusion. As a result, a module can only appear once in the same chain of ancestors.

**Basic ancestor chain**

```ruby
class MyClass; end
MyClass.ancestors # => [MyClass, Object, Kernel, BasicObject]
```

***What `private` really means?***

`private` methods come from two rules working together:

1. you need an explicit receiver to call a method on an object that is not yourself.
2. `private` methods can be called only with an **implicit `self`**.

Put these two rules together, and you’ll see that you can only call a `private` method on yourself. You can call this the “private rule.“

***What's the env when you start the `irb`?***

As soon as you start a Ruby program, you’re sitting within an object named `main` that the Ruby interpreter created for you.

## Refinement

Refinements are similar to Monkeypatches, but they’re not global. A Refinement is only active in two places:

+ The `refine` block itself.
+ The code starting from the place where you call `using` until the end of the module definition (if you’re in a module definition) or the end of the file (if you’re at the top level).

***Which has the precedence, Refinement or Method lookup?***

Refinements are like pieces of code patched right over a class, and they override normal method lookup. On the other hand, a Refinement works in a limited area of the program: the lines of code between the call to `using` and the end of the file, or the end of the module definition.

Code in an active Refinement takes precedence over code in the refined class, and also over code in modules that are included or prepended by the class. Refining a class is like slapping a patch right onto the original code of the class.

A trivia example about Refinement:

```ruby
class MyClass

  def my_method
    "original my_method()"
  end


  def another_method
    my_method
  end

end

module MyClassRefinement
  refine MyClass do
    def my_method
      "refined my_method()"
    end
  end
end

using MyClassRefinement
MyClass.new.my_method     # => "refine my_method()"
MyClass.new.another_method # => "original my_method()"
```

Even if you call `another_method` after the `using`, the call to `my_method` itself happens before the `using`—so it calls the original, unrefined version of the method.

A help reference, [Refinements in Ruby](http://timelessrepo.com/refinements-in-ruby) by The timeless repository.

# Methods

## Dynamic Dispatch

Why would you use `send` instead of the plain old dot notation? Because with `send`, the name of the method that you want to call becomes just a regular argument. You can wait literally until the very last moment to decide which method to call, while the code is running. This technique is called Dynamic Dispatch.

**An example of Dynamic Dispatch**

```ruby gems/pry-0.9.12.2/lib/pry/pry_instance.rb
def refresh(options={})
  defaults = {}
  attributes = [
          :input, :output, :commands, :print, :quiet,
          :exception_handler, :hooks, :custom_completions,
          :prompt, :memory_size, :extra_sticky_locals

        ]

  attributes.each do |attribute|
    defaults[attribute] = Pry.send attribute
  end

  # ...

  defaults.merge!(options).each do |key, value|
    send("#{key}=", value) if respond_to?("#{key}=")
  end

  true
end
```

***What's the concern about `send`?***

You can call any method with `send`, including private methods.

You can use `public_send` instead. It’s like send, but it makes a point of respecting the receiver’s privacy.

## Dynamic Method

There is one important reason to use `Module#define_method`(**private**) over the more familiar def keyword: `define_method` allows you to decide the name of the defined method at runtime.

## Ghost Method

`BasicObject#method_missing` (**private**)

Ghost Methods are usually icing on the cake, but some objects actually rely almost exclusively on them. They collect method calls through `method_missing` and forward them to the wrapped object.

***How can `respond_to?` missing methods?***

refernced from [Method_missing, Politely](http://blog.marc-andre.ca/2010/11/15/methodmissing-politely/) by Marc Andre.

```ruby
class StereoPlayer
  def method_missing(method, *args, &block)
    if method.to_s =~ /play_(\w+)/
      puts "Here's #{$1}"
    else
      super
    end
  end
end

p = StereoPlayer.new
# ok:
p.play_some_Beethoven # => "Here's some_Beethoven"
# not very polite:
p.respond_to? :play_some_Beethoven # => false

class StereoPlayer
  # def method_missing ...
  #   ...
  # end

  def respond_to?(method, *)
    method.to_s =~ /play_(\w+)/ || super
  end
end
p.respond_to? :play_some_Beethoven # => true

```

You can specialize `respond_to?`, but it doesnot make a missing method behaves exactly like a method.

```ruby
p.method :play_some_Beethoven
# => NameError: undefined method `play_some_Beethoven'
#               for class `StereoPlayer'
```

Ruby 1.9.2 introduces `respond_to_missing?` that provides for a clean solution to the problem. Instead of specializing `respond_to?` one specializes `respond_to_missing?`.

```ruby
class StereoPlayer
  # def method_missing ...
  #   ...
  # end

  def respond_to_missing?(method, *)
    method =~ /play_(\w+)/ || super
  end
end

p = StereoPlayer.new
p.play_some_Beethoven # => "Here's some_Beethoven"
p.respond_to? :play_some_Beethoven # => true
m = p.method(:play_some_Beethoven) # => #<Method: StereoPlayer#play_some_Beethoven>
# m acts like any other method:
m.call # => "Here's some_Beethoven"
m == p.method(:play_some_Beethoven) # => true
m.name # => :play_some_Beethoven
StereoPlayer.send :define_method, :ludwig, m
p.ludwig # => "Here's some_Beethoven"
```


***What about the constant missing?***

 `Module#const_missing`(**public**)

***What's the concern about `method_missing`?***

This is a common problem with Ghost Methods: since unknown calls become calls to `method_missing`, your object might accept a call that’s just plain wrong. Finding a bug like this one in a large program can be pretty painful.
To avoid this kind of trouble, take care not to introduce too many Ghost Methods.

Ghost Methods can be dangerous. You can avoid most of their problems by following a few basic recommendations (always call `super`, always redefine `respond_to_missing?`)

And you may call some methods `Object` or some others classes in ancestor chain defined.

***How to solve it? Blank Slate!***

Remove methods from an object to turn them into Ghost Methods.

+ Inheriting from `BasicObject` is the quicker way to define a Blank Slate in Ruby.

```ruby
im = BasicObject.instance_methods
im # => [:==, :equal?, :!, :!=, :instance_eval, :instance_exec, :__send__, :__id__]
```

+ Inheriting from `Object` by default, and remove method inherited.

  Don't hide `instance_eval` or any method beginning with `__`. One example of a reserved method is `BasicObject#__send__`, that behaves the same as send, but gives you a scary warning when you try to remove it.

```ruby
class Compter
  instance_methods.each do |m|
    undef_method m unless m.to_s =~ /^__|method_missing|respond_to/
  end
end
```

+ Or you can write a BlankSlate class to inherit.

```ruby
class BlankSlate

  def self.hide(name)
    return unless instance_methods.include? name.to_s
    return if name.to_s =~ /^__|method_missing|respond_to/
    @hidden_methods ||= {}
    @hidden_methods[name.to_sym] = instance_method(name)
    undef_method name
  end

  instance_methods.each{|m| hide m }
end
```

***What's the difference between `undef_method` and `remove_method`?***

+ The drastic `undef_method` removes any method, including the inherited ones.
+ The kinder `remove_method` removes the method from the receiver, but it leaves inherited methods alone.

***What's the boiling down facts between Ghost Method and really methods?***

Ghost Method are just a way to intercept method calls. Because of this fact, they behave different than actual methods.

***What's the choice between `define_method` and `method_missing`?***

There are times when Ghost Methods are your only viable option. This usually happens

+ When you have a large number of method calls.
+ When you don’t know what method calls you might need at runtime.

*Use Dynamic Methods if you can, and Ghost Methods if you have to.*


# Callables

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

***What if I define additional bindings inside a block?***

They disappear after the block ends.

***What's the meaning of "a block is a closure"?***

a block is a closure, this means a block captures the local bindings and carries them along with it.

**scope**

You can see bindings all over the scope.

`class`, `module`, and `def`, respectively. Each of these keywords acts like a **Scope Gate**.

**A subtle difference between `class`, `module` and `def`**

The code in a `class` or `module` definition is executed immediately. Conversely, the code in a method definition is executed later, when you eventually call the method.

***Whenever the program changes scope, some bindings are replaced by a new set of bindings. RIGHT?***

For `local_varialbes`, that's right, but `instance_variables`, `class_variables` and `global_variables` can go through the Scope Gate.

***What's the difference between Global Variables and Top-Level Instance Variables?***

when it comes to global variables, use them sparingly, if ever.

You can access a top-level instance variable whenever `main` takes the role of self. When any other object is `self`, the top-level instance variable is out of scope.

***How to cross the Scope Gate, and Why?***

You can use these techniques:

+ Use Flat Scope (`Class.new`, `Module.new`, and `define_method`)
+ Use Shared Scope
+ Use Context Probe (`BasicObject#instance_eval`)

to mix code and bindings at will.

***What is Flat Scope?***

“flattening the scope,” meaning that the two scopes share variables as if the scopes were squeezed together. For short, you can call this spell a Flat Scope.

Use `Class.new`, `Module.new` and `define_method`.

***What is Shared Scope?***

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

If you define multiple methods in the same Flat Scope, maybe protected by a Scope Gate, all those methods can share bindings. That’s called a **Shared Scope**

***What is Context Probe?***

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

***What's the different use for Shared Scope and Clean Room?***

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

***When is `yield` not enough to use?***

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

**4 ways to create Procs explicitly**

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

***What's a lambda?***

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


# Class Definitions

In Java and C#, defining a class is like making a deal between you and the compiler.

In Ruby, class definitions are different. When you use the class keyword, you aren’t just dictating how objects will behave in the future. On the contrary, you’re actually running code.

## The Current Class

Wherever you are in a Ruby program, you always have a current object: `self`. Likewise, you always have a current class (or module). As The Ruby interpreter always keeps a reference to the current class (or module), when you define a method, that method becomes an instance method of the current class.

Although you can get a reference to the current object through `self`, there’s no equivalent keyword to get a reference to the current class.

***How to keep track of the current class?***

+ At the top level of your program, the current class is `Object`, the class of `main`. (That’s why, if you define a method at the top level, that method becomes an instance method of `Object`).

```ruby
def foo; end
Object.instance_methods.grep(:foo)      # => []
Object.private_instance_methods.grep(:foo) # => [:foo]
```

+ In a method, the current class is the class of the current object.

+ When you open a class with the `class` keyword (or a module with the `module` keyword), that class becomes the current class.

***How can you open the class if you don’t know its name?***

Use `Module#class_eval`.

***What's the advantage of `Module#class_eval` other than `class`?***

+ `Module#class_eval` is actually more flexible than class. You can use `class_eval` on any variable that references the class, while `class` requires a constant.
+ `class` opens a new scope, losing sight of the current bindings, while `class_eval` has a *Flat Scope*.

***When to use `class_eval`, and when `instance_eval`?***

Use `instance_eval` to open an object that is not a class, and `class_eval` to open a class definition and define methods with `def`.

***What's the difference between `class_eval` and `instance_eval`?***

Both changes `self`, and `class_eval` changes the current_class to the caller's class, while `instance_eval` changes the current_class to the caller's singleton class.

**An interesting knowledge about `Class.new`**

```ruby
c = Class.new(Array) do
  def my_method
    'Hello!'
  end
end

MyClass = c
c.name  # => 'MyClass'
```

When you assign an anonymous class to a constant, Ruby understands that you’re trying to give a name to the class, and it does something special: it turns around to the class and says, “Here’s your new name.” Now the constant references the Class, and the Class also references the constant. If it weren’t for this trick, a class wouldn’t be able to know its own name

## Class Instance Variables

They’re just regular instance variables that happen to belong to an object of class `Class`. Because of that, a Class Instance Variable can be accessed only by the class itself— not by an instance or by a subclass.

No weird behaviors like Class Variables, which subclass and class share the same variable.

## Singleton Methods

```ruby
obj = Object.new
def obj.foo; puts 'foo'; end
```

A method which is specific to a single object, is called Singleton Methods.

You can also use `Object#define_singleton_method`: (Remeber `Module#define_method`?)

```ruby
obj.define_singleton_method :bar { puts 'bar' }
```

***What is the Class Macro?***

A method such as `attr_accessor` is called a Class Macro. Class Macros look like keywords, but they’re just regular class methods that are meant to be used in a class definition.

## Singleton Class

A singleton class is where an object’s Singleton Methods live

***How to get?***

+ Use the `<<` syntax.

```ruby
def obj.my_singleton_method; end
class << obj; instance_methods.grep(/my_/); end
```

+ Use `Object#singleton_class`

```ruby
obj.singleton_class.instance_methods.grep(/my_/)
```

**Singleton classes and inheritance**

![singleton_classes_and_inheritance](https://dl.dropboxusercontent.com/s/leu6dh1ro55u149/singleton_classes_and_inheritance.png?dl=1&token_hash=AAFdcu5UXq5RMpm7nkaQf_B5Und9FjuPF85b35aIWXjC1g&expiry=1400340965)

**7 rules of the Ruby object model**

> The Ruby object model is a beautiful place,” Bill notes, with a dreamy expres- sion on his face. “There are classes, singleton classes, and modules. There are instance methods, class methods, and Singleton Methods.

1. There is only one kind of object—be it a regular object or a module.
2. There is only one kind of module—be it a regular module, a class, or a singleton class.
3. There is only one kind of method, and it lives in a module—most often in a class.
4. Every object, classes included, has its own “real class,” be it a regular class or a singleton class.
5. Every class, with the exception of `BasicObject`, has exactly one ancestor— either a superclass, or a module. This means you have a single chain of ancestors from any class up to `BasicObject`.
6. The superclass of the singleton class of an object is the object’s class. The superclass of the singleton class of a class is the singleton class of the class’s superclass.
7. When you call a method, Ruby goes “right” in the receiver’s real class and then “up” the ancestors chain. That’s all there is to know about the way Ruby finds methods.

***Can object's Singleton Class touch the its Instance Variable?***

```ruby
# exampel 1

class MyClass
  def name; @name; end
  def name=(n); @name=n; end
end

obj = MyClass.new
obj.name = 'foo'
obj.name # => 'foo'

obj.instance_eval { def to_s; "My name is #@name"; end }
obj.to_s # => "My name is foo"

# example2

class MyClass
  @age = 42
  class << self
    def age; @age; end
  end
end

MyClass.age # => 42
```

Yes, it can. So I can assume the obj's Instance Variable lives in its Singleton Class.

***Can a module's singleton methods be included?***

No!

When a class includes a module, it gets the module’s instance methods—not the class methods. Class methods stay out of reach, in the module’s singleton class.

```ruby
module M
  def foo; puts 'foo'; end
  def self.bar; puts 'bar'; end
end

class C
  include M
end

C.new.foo # => 'foo'
C.new.bar # => NoMethodError

class C
  extend M
end

C.bar # => NoMethodError
C.foo # => 'foo'
```

***What's the difference between `Module#include` and `Object#extend`?***

+ `Module#include` includes a module in the receiver's class.
+ `Object#extend` includes a module in the receiver's singleton class.


## Method Wrapper

+ Around Alias
+ Refinement Wrapper
+ Prepended Wrapper(`Module#prepend`)

Selection: Prepended Wrapper > Refinement Wrapper > Around Alias

## Around Alias

**`alias` vs. `alias_method`**

```ruby
class MyClass
  alias :new_foo :foo
  alias_method :another_new_foo, :foo
end
```

+ `alias` is a keyword.
+ `alias_method` is an instance method of Module. `Module#alias_method`


***Can you alias a method before it defined?***

No!

```ruby
class MyClass
  alias_method :new_foo, :foo
  def foo; puts 'foo'; end
end

# => NameError: undefined method `foo' for class `MyClass'
```

***Can aliases break the class's encapsulation?***

Yes!

```ruby
class MyClass
  alias_method :new_foo, :foo

    private
      def foo; puts 'foo'; end
  end

  MyClass.new.foo     # => NoMethodError: private method `foo' called
  MyClass.new.new_foo # => 'foo'
```

***How to write an Around Alias?***

1. You alias a method.
2. You redefine it.
3. You call the old method from the new method.

**Downsides**

+ They pollute your classes with one additional method name. You can fix this small problem somehow by making the old version of the method `private` after you alias it.
+ The loading issue. You should never load an Around Alias twice, unless you want to end up with an exception when you call the method.

The main issue with Around Aliases, however, is that they are a form of Monkeypatching. Like all Monkeypatches, they can break existing code that wasn’t expecting the method to change.

### Refinement Wrapper

**Advantage over Around Alias**

If you call `super` from a refined method, you will call the original, unrefined method.

```ruby
module StringRefinement
    refine String do
    def length
    super > 5 ? 'long' : 'short'
  end
  end
end

using StringRefinement
"War and Peace".length # => "long"
```

### Prepended Wrapper

A method in a prepended module can override a method in the includer, and call the non- overridden version with `super`.

```ruby
module ExplicitString
  def length
  super > 5 ? 'long' : 'short'
  end
end

String.class_eval do
  prepend ExplicitString
end

"War and Peace".length # => "long"
```

***Advantage over Refinement Wrapper and Around Alias?***

It’s generally considered cleaner and more explicit than both a Refinement Wrapper and an Around Alias.

### An interesting quiz solving by Around Alias

Make it work:

```ruby
1 + 1 # => 3
```

You can solve this quiz with an Open Class. Just reopen `Fixnum`, and redefine `+` so that `(x+y)` becomes `(x+y+1)`. This is not as easy as it seems, however. The new version of + relies on the old version of +, so you need to wrap your old version with the new version.

```ruby
class Fixnum
  alias_method :old_plus, :+

  def +(value)
    self.old_plus(value).old_plus(1)
  end
end
```

# Eval and Binding

`Kernel#eval` Evaluates the Ruby expression(s) in string. If binding is given, which must be a `Binding` object, the evaluation is performed in its context.

```ruby
def get_binding(str)
  binding
end

str = 'hello'
eval "str + ' Fred'"                     # => "hello Fred"
eval "str + ' Fred'", get_binding('bye') # => "bye Fred"
```

`Kernel#binding` Returns a `Binding` object, describing the variable and method bindings at the point of call. This object can be used when calling eval to execute the evaluated command in this environment.

Ruby also provides a predefined constant named `TOPLEVEL_BINDING`, which is just a Binding of the top-level scope.

You can also use `Proc#binding` to return a `Binding` object.

```ruby
def get_proc(str)
  -> {}
end

eval "str + 'Fred'", get_proc('bye').binding # => "bye Fred"
```

***What's to concern when using `eval`?***

+ As it only accepts strings of codes but not blocks, it's not editor friendly(syntax highlighting) and hard to trace syntax errors.

+ Code Injection.

***What's the soluction Ruby provided for `eval` insecurity?***

+ Tainted Objects, `Object#tainted?`, `Object#untaint`

+ Safe Levels, `$SAFE`

    - 0, “hippie commune", where you can hug trees and format hard disks.
    - Any safe level greater than 0 also causes Ruby to flat-out refuse to evaluate tainted string.
    - 2, disallows most file-related operations.
    - 3, “military dictatorship,” where every object you create is tainted by default.

***How to write a Sandbox for `eval`?***

```ruby
class ERB
  def result(b=new_toplevel)
    if @safe_level
      proc {
        $SAFE = @safe_level
        eval(@src, b, (@filename || '(erb)'), 0)
      }.call
    else
      eval(@src, b, (@filename || '(erb)'), 0)
    end
  end
end
```


