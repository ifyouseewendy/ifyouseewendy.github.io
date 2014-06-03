---
layout: post
title: "RubyMeta - Class Definitions"
date: 2014-06-03 00:44:01 +0800
comments: true
categories: [Ruby, Excerpts]
---

In Java and C#, defining a class is like making a deal between you and the compiler.

In Ruby, class definitions are different. When you use the class keyword, you aren’t just dictating how objects will behave in the future. On the contrary, you’re actually running code.

## The Current Class

Wherever you are in a Ruby program, you always have a current object: `self`. Likewise, you always have a current class (or module). As The Ruby interpreter always keeps a reference to the current class (or module), when you define a method, that method becomes an instance method of the current class.

Although you can get a reference to the current object through `self`, there’s no equivalent keyword to get a reference to the current class.

**How to keep track of the current class?**

+ At the top level of your program, the current class is `Object`, the class of `main`. (That’s why, if you define a method at the top level, that method becomes an instance method of `Object`).

```ruby
def foo; end
Object.instance_methods.grep(:foo)      # => []
Object.private_instance_methods.grep(:foo) # => [:foo]
```

+ In a method, the current class is the class of the current object.

+ When you open a class with the `class` keyword (or a module with the `module` keyword), that class becomes the current class.

**How can you open the class if you don’t know its name?**

Use `Module#class_eval`.

**What's the advantage of `Module#class_eval` other than `class`?**

+ `Module#class_eval` is actually more flexible than class. You can use `class_eval` on any variable that references the class, while `class` requires a constant.
+ `class` opens a new scope, losing sight of the current bindings, while `class_eval` has a *Flat Scope*.

**When to use `class_eval`, and when `instance_eval`?**

Use `instance_eval` to open an object that is not a class, and `class_eval` to open a class definition and define methods with `def`.

**What's the difference between `class_eval` and `instance_eval`?**

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

**What is the Class Macro?**

A method such as `attr_accessor` is called a Class Macro. Class Macros look like keywords, but they’re just regular class methods that are meant to be used in a class definition.

## Singleton Class

A singleton class is where an object’s Singleton Methods live

**How to get?**

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

**Can object's Singleton Class touch the its Instance Variable?**

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

**Can a module's singleton methods be included?**

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

**What's the difference between `Module#include` and `Object#extend`?**

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


**Can you alias a method before it defined?**

No!

```ruby
class MyClass
  alias_method :new_foo, :foo
  def foo; puts 'foo'; end
end

# => NameError: undefined method `foo' for class `MyClass'
```

**Can aliases break the class's encapsulation?**

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

**How to write an Around Alias?**

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

**Advantage over Refinement Wrapper and Around Alias?**

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

