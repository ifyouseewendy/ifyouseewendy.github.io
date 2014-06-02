---
layout: post
title: "RubyMeta - The Object Model"
date: 2014-06-03 00:39:43 +0800
comments: true
categories:  [Ruby, Excerpts]
---

## The Object Model

![the_object_model](https://dl.dropboxusercontent.com/s/a6qc1yd1cd57pkp/the_object_model.png?dl=1&token_hash=AAEBXb4OJ73P3xWWbPmIMOferP8_YHxQlS9d8l0hjEq2wQ&expiry=1400078501)

An object contains its instance variables and a reference to a class.

### Instance variable

Instance variables just spring into existence when you assign them a value, so you can have objects of the same class that carry different instance variables.

### Instance method

You can get a list of an object’s methods by calling `Object#methods`.

When you talk about the class, you call it an instance method, and when you talk about the object, you simply call it a method.

  String.instance_methods == "abc".methods # => true
  String.methods == "abc".methods # => false

An object’s instance variables live in the object itself, and an object’s methods live in the object’s class. That’s why objects of the same class share methods but don’t share instance variables.

### Truth about classes

The truth about classes: classes themselves are nothing but objects.

The methods of an object are also the instance methods of its class. In turn, this means that the methods of a class are the instance methods of `Class`:

  Class.instance_methods(false) # => [:allocate, :new, :superclass]

**What's the difference between `class` and `superclass`?**

+ `class` is about the type which an object belongs to.
+ `superclass` is about inheritance, between classes.

The `superclass` of Class is Module—which is to say, every class is also a module. To be precise, a class is a module with three additional instance methods (new, allocate, and superclass) that allow you to create objects or arrange classes into hierarchies.

**Which to pick between Class and Module?**

Usually, you pick a module when you mean it to be included somewhere, and you pick a class when you mean it to be instantiated or inherited.

**What's an Object, and what's a Class?**

+ What’s an object? It’s a bunch of instance variables, plus a link to a class. The object’s methods don’t live in the object—they live in the object’s class, where they’re called the instance methods of the class.

+ What’s a class? It’s an object (an instance of Class), plus a list of instance methods and a link to a superclass. Class is a subclass of Module, so a class is also a module.

**What's the difference between `load` and `require`?**

You use load to execute code, and you use require to import libraries.

That’s why require has no second argument: those leftover class names are probably the reason why you imported the file in the first place. Also, that’s why require only tries to load each file once, while load executes the file again every time you call it.

**As `load` executes codes, how does `load` avoid conlicts?**

`load('motd.rb', true)`

If you load a file this way, Ruby creates an anonymous module, uses that module as a Namespace to contain all the constants from motd.rb, and then destroys the module.

### Constant

classes are nothing but objects, class names are nothing but constants.

**How is a constant really different from a variable?**

The one important difference has to do with their scope.

Constants are arranged in a tree similar to a file system, where the names of modules and classes play the part of directories and regular constants play the part of files.


### Method lookup


**What does Ruby do, when you call a method?**

1. It finds the method. This is a process called method lookup.
2. It executes the method. To do that, Ruby needs something called `self`.

**How dos Ruby lookup methods?**

*“one step to the right, then up”* rule: go one step to the right into the receiver’s class, and then go up the ancestors chain until you find the method.

**What does ancestor chain look like, when `prepend` or `include` multiple modules?**

The `prepend` method. It works like `include`, but it inserts the module below the including class.

  class C
      include M1
      include M2

      prepend M3
      prepend M4
  end

  class D < C; end

  D.ancestors # => ['M4', 'M3', 'C', 'M2', 'M1']

**What does Ruby do, when `prepend` or `include` a module multiple times?**

If that module is already in the chain, Ruby silently ignores the second inclusion. As a result, a module can only appear once in the same chain of ancestors.

**Basic ancestor chain**

  class MyClass; end
  MyClass.ancestors # => [MyClass, Object, Kernel, BasicObject]

**What `private` really means?**

`private` methods come from two rules working together:

1. you need an explicit receiver to call a method on an object that is not yourself.
2. `private` methods can be called only with an **implicit `self`**.

Put these two rules together, and you’ll see that you can only call a `private` method on yourself. You can call this the “private rule.“

**What's the env when you start the `irb`?**

As soon as you start a Ruby program, you’re sitting within an object named `main` that the Ruby interpreter created for you.

### Refinement

Refinements are similar to Monkeypatches, but they’re not global. A Refinement is only active in two places:

+ The `refine` block itself.
+ The code starting from the place where you call `using` until the end of the module definition (if you’re in a module definition) or the end of the file (if you’re at the top level).

**Which has the precedence, Refinement or Method lookup?**

Refinements are like pieces of code patched right over a class, and they override normal method lookup. On the other hand, a Refinement works in a limited area of the program: the lines of code between the call to using and the end of the file, or the end of the module definition.

Code in an active Refinement takes precedence over code in the refined class, and also over code in modules that are included or prepended by the class. Refining a class is like slapping a patch right onto the original code of the class.

A trivia example about Refinement:


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

Even if you call `another_method` after the `using`, the call to `my_method` itself happens before the `using`—so it calls the original, unrefined version of the method.


