---
layout: post
title: "[Review] Design Patterns in Ruby"
date: 2014-10-17 17:40:01 +0800
comments: true
categories: [Ruby, Books]
---

{:.custom}
| **Book**    | Design Patterns in Ruby
| **Author**  | Russ Olsen
| **Link**    | [designpatternsinruby.com](http://designpatternsinruby.com/)

* TOC
{:toc}

## Meta Design Pattern

+ Seperate out the things that change from thos that stay the same.
+ Program to an interface, not an implementation.
+ Prefer composition over inheritance.
+ Delegate, delegate, delegate.

Others:

+ YAGNI, You ain’t gonna need it.
+ A pattern is not just about code: Intent is critical.

**Seperate out the things that change from thos that stay the same.**

A key goal of software engineering is to build systems that allow us to contain the damage. In an ideal system, all changes are local.

You get there by separating the things that are likely to change from the things that are likely to stay the same. If you can identify which aspects of your system design are likely to change, you can isolate those bits from the more stable parts.

But how do you keep the changing parts from infecting the stable parts? *Program to an interface, not an implementation.*

**Program to an interface, not an implementation.**

A good start is to write code that is less tightly coupled to itself in the first place.

The idea here is to program to the most general type you can.

**Prefer composition over inheritance.**

The trouble is that inheritance comes with some unhappy strings attached. When you create a subclass of an existing class, you are not really creating two separate entities: Instead, you are making two classes that are bound together by a common implementation core. Inheritance, by its very nature, tends to marry the subclass to the superclass.

If our goal is to build systems that are not tightly coupled together, to build systems where a single change does not ripple through the code like a sonic boom, breaking the glassware as it goes, then probably we should not rely on inheritance as much as we do.

We can assemble the behaviors we need through composition. In short, we try to avoid saying that an object is *a kind of* something and instead say that it *has* something.

**Delegate, delegate, delegate.**

The combination of composition and delegation is a powerful and flexible alternative to inheritance. We get most of the benefits of inheritance, much more flexibility, and none of the unpleasant side effects. Of course, nothing comes for free. Delegation requires an extra method call, as the delegating object passes the buck along. This extra method call will have some performance cost—but in most cases, it will be very minor.

Another cost of delegation is the boilerplate code you need to write.

**YAGNI, You ain’t gonna need it.**

You Ain’t Gonna Need It (YAGNI for short). The YAGNI principle says simply that you should not implement features, or design in flexibility, that you don’t need right now.

A well-designed system is one that will flex gracefully in the face of bug fixes, changing requirements, the ongoing march of technology, and inevitable redesigns. The YAGNI principle says that you should focus on the things that you need right now, building in only the flexibility that you know you need.

The use of design patterns has somehow become associated with a particularly virulent strain of over-engineering, with code that tries to be infinitely flexible at the cost of being understandable, and maybe even at the cost of just plain working. The proper use of design patterns is the art of making your system just flexible enough to deal with the problems you have today, but no more.

Your system will not work better because you used all 23 of the GoF design patterns in every possible combination. Your code will work better only if it focuses on the job it needs to do right now.

## About Design Pattern

Background

> In 1995, Erich Gamma, Richard Helm, Ralph Johnson, and John Vlissides set out to redirect all the effort going into building redundant software wheels into something more useful. That year, building on the work of Christopher Alexander, Kent Beck, and others, they published Design Patterns: Elements of Reusable Object-Oriented Software. The book was an instant hit, with the authors rapidly becoming famous (at least in software engineering circles) as the Gang of Four (GoF).

Focus on some key questions:

+ How do objects like the ones you tend to find in most systems relate to one another?
+ How should they be coupled together?
+ What should they know about each other?
+ How can we swap out parts that are likely to change frequently?

It’s commonly agreed that the most useful thing about patterns is the way in which they form a vocabulary for articulating design decisions during the normal course of development conversations among programmers.

Design patterns are little spring-loaded solutions to common programming problems. And a reckless use of every design pattern on the menu to solve nonexistent problems gives design patterns a bad name in some circles.

**With Ruby**

With Ruby, we no longer need to pull out relatively heavyweight design patterns to solve tiny problems. Instead, Ruby allows you to do simple things simply. 

+ Like a Command object in the GoF sense is essentially a wrapper around some code that knows how to do one specific thing, to run a particular bit of code at some time. Of course, that is also a fairly accurate description of a Ruby code block object or a `Proc`.

+ Internal Domain Specific Languages. I believe that his treatment of the subject, as an evolution of the Interpreter pattern, is the first significant reference work in publication on the topic.

The Ruby programming language makes implementing patterns so easy that sometimes they fade into the background.

+ Ruby is dynamically typed.
+ Ruby has code closures.
+ Ruby classes are real objects.
+ Ruby has an elegant system of code reuse.

The traditional implementations of many design patterns work, but they make you work, too. Ruby allows you to concentrate on the real problems that you are trying to solve instead of the plumbing.

The increasing industry recognition of the value of dynamic and flexible languages such as Ruby has plunged us into yet another wisdom gap.

> Design Patterns was published in the need for wisdom. 
> 
> Bruce Tate is fond of pointing out that when a new programming technique or language pops up, there is frequently a wisdom gap. The industry needs time to come to grips with the new technique, to figure out the best way to apply it. How many years had to elapse between the first realization that object-oriented programming was the way to go and the time when we really began to use object-oriented technology effectively? Those years were the object-oriented wisdom gap.



## Design Pattern Classification

**Creational** (5)

+ Factory Method
+ Abstract Factory
+ Builder
+ Prototype
+ Singleton

**Structural** (7)

+ Facade
+ Adapter
+ Proxy
+ Decorator
+ Bridge
+ Composite
+ Flyweight

**Behavioural** (11)

+ Template Method
+ Observer
+ State
+ Strategy
+ Chain of Responsibility
+ Command
+ Visitor
+ Mediator
+ Memento
+ Iterator
+ Interpreter



## The Template Method

Basic idea is *Seperate out the things that change from thos that stay the same.* 

### Description

![template-method](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/template-method.png)

1. Extract the common part into an abstract base class
2. Create some hook methods as the interface
3. Let the subclass to implement it

The Template Method pattern is simply a fancy way of saying that if you want to vary an algorithm, one way to do so is to code the invariant part in a base class and to encapsulate the variable parts in methods that are defined by a number of subclasses.

The abstract base class controls the higher-level processing through the template method; the sub-classes simply fill in the details.

Non-abstract methods that can be overridden in the concrete classes of the Template Method pattern are called **hook methods**.

Duck typing is a trade-off: You give up the compile-time safety of static typing, and in return you get back a lot of code clarity and programming flexibility.

### Using and Abusing

The Template Method pattern is at its best when it is at its leanest—that is, when every abstract method and hook is there for a reason. Try to avoid creating a template class that requires each subclass to override a huge number of obscure methods just to cover every conceivable possibility. You also do not want to create a template class that is encrusted with a multitude of hook methods that no one will ever override.

### In the Wild

There is another very common example of the Template Method pattern that is perhaps so pervasive that it is hard to see. Think about the `initialize` method that we use to set up our objects. All we know about `initialize` is that it is called sometime toward the end of the process of creating a new object instance and that it is a method that we can override in our class to do any specific initialization. Sounds like a hook method to me.

`Class#new` calls `allocate` first, then `initialise`. Every class inherits the `new` method, and defines its own concrete `initialise` method. So, we can treat `Class#new` as a template method, and `initialise` as a hook method.


## The Strategy

Basic idea is *Delegate, delegate, delegate* and *Prefer composition over inheritance*.

### Description

![strategy](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/strategy.png)

1. Pull the algorithm out into a seperate "strategy" object.
2. All of the startegy objects support the same interface. 
3. Let the context choose.

Given that all of the strategy objects look alike from the outside, the user of the strategy—called the **context** class by the GoF—can treat the strategies like interchangeable parts.

### Comparing to the Template Method

The Template Method pattern is built around inheritance.

No matter how carefully you design your code, your subclasses are tangled up with their superclass: It is in the nature of the relationship. On top of this, inheritance-based techniques such as the Template Method pattern limit our runtime flexibility. Once we have selected a particular variation of the algorithm—in our example, once we have created an instance of HTMLReport—changing our mind is hard.

```ruby
# The Template Method
report = HTMLReport.new
report.output_report
report = PlainTextReport.new
report.output_report
```

Because the Strategy pattern is based on composition and delegation, rather than on inheritance, it is easy to switch strategies at runtime.

```ruby
# The Strategy
report = Report.new(HTMLFormatter.new)
report.output_report
report.formatter = PlainTextFormatter.new
report.output_report
```

### Sharing Data between the Context and Strategy

1. *Pass in everything that the strategy needs as arguments when the context calls the methods on the strategy object.* The downside of doing things this way is that if there is a lot of complex data to pass between the context and the strategy, then, well, you are going to be passing a lot of complex data around without any guarantee that it will get used.
2. Having the context object pass a reference to itself to the strategy object.

### Using and Abusing

Particular attention to the details of the interface between the context and the strategy as well as to the coupling between them. Remember, the Strategy pattern will do you little good if you couple the context and your first strategy so tightly together that you cannot wedge a second or a third strategy into the design.

### In the Wild

Ruby code blocks, which are essentially code wrapped up in an instant object (the Proc object), are wonderfully useful for creating quick, albeit simple, strategy objects.  

Use Proc as the lightweight strategy object. 

```ruby
class Report
  attr_reader :title, :text
  attr_accessor :formatter

  def initialize(&formatter)
    @title = 'Monthly Report'
    @text = [ 'Things are going', 'really, really well.' ]
    @formatter = formatter
  end
  
  def output_report
    @formatter.call( self )
  end
end
```

## The Observer

### Description

![observer](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/observer.png)

The aiming is to build a system that is highly integrated—that is, a system where every part is aware of the state of the whole.

The GoF called this idea of building a clean interface between the source of the news that some object has changed and the consumers of that news the Observer pattern. The class with the news is the **subject**, and the objects which are interested in getting the news are the **observor**.

> It has always seemed to me that the Observer pattern is somewhat misnamed. While the observer object gets top billing—in fact, the only billing—it is actually the subject that does most of the work. It is the subject that is responsible for keeping track of the observers. It is also the subject that needs to inform the observers that a change has come down the pike.


### Code Usage

```ruby
module Subject
  def initialize
    @observers=[]
  end
  
  def add_observer(observer)
    @observers << observer
  end
  
  def delete_observer(observer)
    @observers.delete(observer)
  end
  
  def notify_observers
    @observers.each do |observer|
      observer.update(self)
    end
  end
end

class Employee
  include Subject
  
  attr_reader :name, :address
  attr_reader :salary
  
  def initialize(name, title, salary)
   super()
   @name = name
   @title = title
   @salary = salary
  end
  
  def salary=(new_salary)
    @salary = new_salary
    notify_observers
  end
end
```

The Ruby standard library comes with a fine, prebuilt [Observable](http://ruby-doc.org/stdlib-1.9.3/libdoc/observer/rdoc/Observable.html) module that provides all of the support you need to make your object, well, observable.

With the observable module, the observable object must:

1. assert that it has `#changed`
2. call `#notify_observers`

```ruby
require 'observer'
class Employee
  include Observable
  
  attr_reader :name, :address
  attr_reader :salary
  
  def initialize( name, title, salary)
   @name = name
   @title = title
   @salary = salary
  end
  
  def salary=(new_salary)
    @salary = new_salary
    changed
    notify_observers(self)
  end
end
```

### Interfaces. Pull or Push?

The key decisions that you need to make when implementing the Observer pattern all center on the interface between the subject and the observer.

Just have a single method in the observer whose only argument is the subject. The GoF term for this strategy is the **pull** method, because the observers have to pull whatever details about the change that they need out of the subject.

The other possibility—logically enough termed the **push** method—has the subject send the observers a lot of details about the change:

```ruby
observer.update_salary(self, old_salary, new_salary)
observer.update_title(self, old_title, new_title)
```

The advantage in providing more details is that the observers do not have to work quite as hard to keep track of what is going on. The disadvantage of the push model is that if all of the observers are not interested in all of the details, then the work of passing the data around goes for naught.

### Using and Abusing

*The frequency and timing of the updates.* The subject class can help with all of this by avoiding broadcasting redundant updates. Just because someone updates an object, it does not mean that anything really changed.

```ruby
def salary=(new_salary)
  old_salary = @salary
  @salary = new_salary
  if old_salary != new_salary
    changed
    notify_observers(self)
  end
end
```

*The consistency of the subject as it informs its observers of changes.*

```ruby
fred = Employee.new("Fred", "Crane Operator", 30000)

fred.salary = 1000000
# Warning! Inconsistent state here!
fred.title = 'Vice President of Sales'


# Don't inform the observers just yet
fred.salary = 1000000
fred.title = 'Vice President of Sales'

# Now inform the observers!
fred.changes_complete
```

*Badly behaved observers.* Like responds by raising an exception?

### In the Wild

Use Proc as Observers. Just use `call` as the interface when notifying observers.

```ruby
module Subject
  def notify_observers
    @observers.each do |observer|
      observer.call(self)
    end
  end
end
```

ActiveRecord::Observer has been deprecated from Rails 4.0, but we can still get the feature by the extracted gem. [rails-observers](https://github.com/rails/rails-observers)

## Composite

### Description

![composite](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/composite.png)

1. **component**, a common interface or base class for all of your objects.
2. **leaf**, the class doing simple, indivisible building blocks of process.
3. **composite**, a component, also a higher-level object that is build from subcomponents.

The GoF called the design pattern for our “*the sum acts like one of the parts*” situation the Composite pattern. You will know that you need to use the Composite pattern when you are trying to build a hierarchy or tree of objects, and you do not want the code that uses the tree to constantly have to worry about whether it is dealing with a single object or a whole bushy branch of the tree. Once you grasp its *recursive nature*, the Composite pattern is really quite simple.

### Code Usage

```ruby
class CompositeTask < Task
  def initialize(name)
    super(name)
    @sub_tasks = []
  end
  
  def add_sub_task(task)
    @sub_tasks << task
  end
  
  def remove_sub_task(task)
    @sub_tasks.delete(task)
  end
  
  def get_time_required
    time=0.0
    @sub_tasks.each {|task| time += task.get_time_required}
    time
  end
end

class MakeBatterTask < CompositeTask
  def initialize
    super('Make batter')
    add_sub_task( AddDryIngredientsTask.new )
    add_sub_task( AddLiquidsTask.new )
    add_sub_task( MixTask.new )
  end
end
```

### Concerns

***How to handle the difference between a composite and a leaf?***

The goal of the Composite pattern is to make the leaf objects *more or less* indistinguishable from the composite objects. But there is one unavoidable difference between a composite and a leaf: The composite has to manage its children, which probably means that it needs to have a method to get at the children and possibly methods to add and remove child objects. The leaf classes, of course, really do not have any children to manage; that is the nature of leafyness.

As I say, how you handle this decision is mostly a matter of taste: Make the leaf and composite classes different, or burden the leaf classes with embarrassing methods that they do not know how to handle. My own instinct is to leave the methods off of the leaf classes. Leaf objects cannot handle child objects, and we may as well admit it.

***How to traverse the tree structrue which the composite pattern make?***

Each composite object holds references to its subcomponents but the child components do not know a thing about their parents, it is easy to traverse the tree from the root to the leaves but hard to go the other way.

Add a parent reference in the component class.

```ruby
class Task
  attr_accessor :name, :parent
  
  def initialize(name)
    @name = name
    @parent = nil
  end
end

class CompositeTask < Task
  def initialize(name)
    super(name)
    @sub_tasks = []
  end
  
  def add_sub_task(task)
    @sub_tasks << task
    task.parent = self
  end
  
  def remove_sub_task(task)
    @sub_tasks.delete(task)
    task.parent = nil
  end
end
```

### Using and Abusing

The error that crops up so frequently with the Composite pattern is assuming that the tree is only one level deep—that is, assuming that all of the child components of a composite object are, in fact, leaf objects and not other composites.

Remember, the power of the Composite pattern is that it allows us to build arbitrarily deep trees.

### In the Wild


## The Iterator

### Description

Provide a way to access the elements of an aggregate object sequentially without exposing its underlying representation.

Iterators in Ruby are a great example of what is right with the language. Instead of providing special-purpose external iterator objects for each aggregate class, Ruby relies on the very flexible idea of Proc objects and code blocks to build internal iterators.

**external iterator**, the iterator is a separate object from the aggregate.

```java
# in java
ArrayList list = new ArrayList();
list.add("red");
list.add("green");
list.add("blue");
for( Iterator i = list.iterator(); i.hasNext();) {
        System.out.println( "item: " + i.next());
}
```

**internal iterator**, the code block-based iterators, all of the iterating action occurs inside the aggregate object.

```ruby
# in ruby
def for_each_element(array)
  i= 0
  while i < array.length
    yield(array[i])
    i += 1
  end
end

a = [10, 20, 30]
for_each_element(a) {|element| puts("The element is #{element}")}
```

### Internal Iterators vs. External Iterators

With Internal Iterator, the main advantage is simplicity and code clarity.

With External Iterator

1. You have more flexibility on iteration control. With an external iterator, you won’t call `next` until you are good and ready for the next element. With an internal iterator, by contrast, the aggregate relentlessly pushes the code block to accept item after item.

    *If you are trying to merge the contents of two sorted arrays into a single array that was itself sorte?*
  
    the merge is actually fairly easy with an external iterator, simply create an iterator for the two input arrays and then merge the arrays by repeatedly pushing the smallest value from either of the iterators onto the output array.

2. A second advantage of external iterators is that, because they are external, you can share them—you can pass them around to other methods and objects. Of course, this is a bit of a double-edged sword: You get the flexibility but you also have to know what you are doing. In particular, beware of multiple threads getting hold of a non-thread-safe external iterator.

### The Inimitable Enumerable

To mix in `Enumerable`, you need only make sure that your internal iterator method is named `each` and that the individual elements that you are going to iterate over have a reasonable implementation of the `<=>` comparison operator. 

```ruby
class Account
  attr_accessor :name, :balance
  
  def initialize(name, balance)
    @name = name
    @balance = balance
  end
  
  def <=>(other)
    balance <=> other.balance
  end
end

class Portfolio
  include Enumerable
  
  def initialize
    @accounts = []
  end
  
  def each(&block)
    @accounts.each(&block)
  end
  
  def add_account(account)
    @accounts << account
  end
end

my_portfolio.any? {|account| account.balance > 2000}
my_portfolio.all? {|account| account.balance > = 10}
```

### Using and Abusing

The main danger is this: What happens if the aggregate object changes while you are iterating through it?

You may use a shallow copy when initializing.

```ruby
class ChangeResistantArrayIterator
  def initialize(array)
    @array = Array.new(array)
    @index = 0
  end
  ...
```

A Ruby trick example.

```ruby
array=['red', 'green', 'blue', 'purple']

array.each do | color |
  puts(color)
  if color == 'green'
    array.delete(color)
  end
end

# red
# green
# purple
```

*Finally, a multithreaded program is a particularly dangerous home for iterators.* You need to take all of the usual care to ensure that one thread does not rip the aggregate rug out from under your iterator.

### In the Wild

**IO**

The neat thing about the IO object is that it is amphibious—it does both internal and external iterators.

```ruby
f = File.open('names.txt')
while not f.eof?
  puts(f.readline)
end
f.close

f = File.open('names.txt')
f.each {|line| puts(line)}
f.close
```

**Pathname** [API](http://ruby-doc.org/stdlib-2.1.0/libdoc/pathname/rdoc/Pathname.html)

Pathname tries to offer one-stop shopping for all your directory and path manipulation needs.

```ruby
pn.each_filename {|file| puts("File: #{file}")}
# File: usr
# File: local
# File: lib
# File: ruby
# File: 1.8

pn.each_entry {|entry| puts("Entry: #{entry}")}
# Entry: .
# Entry: ..
# Entry: i686-linux
# Entry: shellwords.rb
# Entry: mailread.rb
# ...
```

**ObjectSpace** [API](http://www.ruby-doc.org/core-2.1.3/ObjectSpace.html)

ObjectSpace provides a window into the complete universe of objects that exist within your Ruby interpreter. The fundamental iterator supplied by ObjectSpace is the `each_object` method. It iterates across all of the Ruby objects—everything that is loaded into your Ruby interpreter:

```ruby
ObjectSpace.each_object {|object| puts("Object: #{object}")}

# If you supply the argument, each_object will iterate over only
# the instances of that class or module.
ObjectSpace.each_object(Numeric) {|n| puts("The number is #{n}")}
```

Try this execellent `subclasses_of` method:

```ruby
def subclasses_of(superclass)
  subclasses = []
 
  ObjectSpace.each_object(Class) do |k|
    next if !k.ancestors.include?(superclass) || superclass == k || k.to_s.include?('::') || subclasses.include?(k.to_s)
    subclasses << k.to_s
  end
 
  subclasses
end
 
subclasses_of(Numeric)
# => ["Complex", "Rational", "Bignum", "Float", "Fixnum", "Integer"]
```

## The Command

### Description

![command](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/command.png)

The idea of factoring out the action code into its own object is the essence of the Command pattern.

The key thing about the Command pattern is that it separates the thought from the deed. When you use this pattern, you are no longer simply saying, “Do this”; instead, you are saying, “Remember how to do this,” and, sometime later, “Do that thing that I told you to remember.”

Command pattern can be useful in

1. Keeping track of what you need to do, or what you have already done
2. Undo or redo
3. Queuing up comands

### Keep Track of What You Have Done

```ruby
class Command
  attr_reader :description
  
  def initialize(description)
    @description = description
  end
  
  def execute
  end
end

class CreateFile < Command
  def initialize(path, contents)
    super("Create file: #{path}")
    @path = path
    @contents = contents
  end
  
  def execute
    f = File.open(@path, "w")
    f.write(@contents)
    f.close
  end
end
```

**Use Composite**

When we are trying to keep track of what we are about to do—or have done—we will need a class to collect all of our commands. Hmm, a class that acts like a command, but really is just a front for a number of subcommands. Sounds like a composite:

```ruby
class CompositeCommand < Command
  def initialize
    @commands = []
  end
  
  def add_command(cmd)
    @commands << cmd
  end
  
  def execute
    @commands.each {|cmd| cmd.execute}
  end
  
  def description
    description = ''
    @commands.each {|cmd| description += cmd.description + "\n"}
    description
  end
end

cmds = CompositeCommand.new
cmds.add_command(CreateFile.new('file1.txt', "hello world\n"))
cmds.add_command(CopyFile.new('file1.txt', 'file2.txt'))
cmds.add_command(DeleteFile.new('file1.txt'))

cmds.execute
```

### Undo or Redo

Every undoable command that we create has two methods. Along with the usual `execute` method, which does the thing, we add an `unexecute` method, which undoes the same thing.

As delete a file maybe destructive, so we need to save the contents of the original file.

```ruby
class DeleteFile < Command
  def initialize(path)
    super "Delete file: #{path}"
    @path = path
  end
  
  def execute
    if File.exists?(@path)
      @contents = File.read(@path)
    end
    f = File.delete(@path)
  end

  def unexecute
    if @contents
      f = File.open(@path,"w")
      f.write(@contents)
      f.close
    end
  end
end  
```

Creating a file with CreateFile could be destructive, too: The file that we are trying to create might already exist and be overwritten as we create the new file. In a real system, we would need to deal with this possibility as well as with a host of issues related to file permissions and ownership. 

```ruby
class CreateFile < Command
  def initialize(path, contents)
    super "Create file: #{path}"
    @path = path
    @contents = contents
  end
  
  def execute
    f = File.open(@path, "w")
    f.write(@contents)
    f.close
  end
  def unexecute
    File.delete(@path)
  end
end
```

Finnaly, add an `unexecute` method to the `CompositeCommad` class.

```ruby
class CompositeCommand < Command
  # ...
  
  def unexecute
    @commands.reverse.each { |cmd| cmd.unexecute }
  end

  # ...
end
```

### Queuing Up Commands

> For example, it frequently takes a minor computer-time eternity to connect to a database. If you need to perform a number of database operations over time, you sometimes face the unpleasant choice of (1) leaving the connection open for the whole time, thereby wasting a scarce resource, or (2) wasting the time it takes to open and close the connection for each operation.

The Command pattern offers one way out of this kind of bind. Instead of performing each operation as a stand-alone task, you accumulate all of these commands in a list. Periodically, you can open a connection to the database, execute all of your commands, and flush out this list.

### Using and Abusing

The key thing about the Command pattern is that it separates the thought from the deed. When you use this pattern, you are no longer simply saying, “Do this”; instead, you are saying, “Remember how to do this,” and, sometime later, “Do that thing that I told you to remember.” Make sure that you really need that complexity before you pull the Command pattern out of your bag of tricks.

**Creation Time versus Execution Time**

Assuming you really do need the Command pattern, to make it work you have to be sure that the initial thought is complete. You have to carefully think through the circumstances in which the command object will find itself when it is executed versus when it was created. Yes, this key file was open, and that vital object was initialized when I created the command. Will it all still be there for me when the command is executed?

### In the Wild

**ActiveRecord::Migration**

```ruby
class CreateBookTable < ActiveRecord::Migration
  # execute
  def self.up
    create_table :books do |t|
      t.column :title, :string
      t.column :author, :string
    end
  end
  
  # unexecute
  def self.down
    drop_table :books
  end
end
```

**Madeleine**

[repo](https://github.com/ghostganz/madeleine)

> Imagine how slow your system would be if you had to write out a whole airport’s worth of seat assignments every time someone changed his or her mind and wanted that aisle seat after all.

Madeleine is a transactional, high-performance, object persistence framework that does not need any object relational mapping for the simple reason that it does not use a relational database—or any other kind of database, for that matter. Instead, Madeleine relies on the Ruby Marshal package, a facility for converting live Ruby objects into bytes and for turning those bytes back into objects. Unfortunately, being able to marshal your objects to a file is not by itself a complete solution to application persistence.

[Example gist using Madeleine](https://gist.github.com/ifyouseewendy/c0a3ec5da222779885f0)

## The Adapter

### Description

An adapter is an object that crosses the chasm between the interface that you have and the interface that you need.

![the adapter](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/adapter.png)

The client expects the target to have a certain interface. But unknown to the client, the target object is really an adapter, and buried inside of the adapter is a reference to a second object, the adaptee, which actually performs the work.

### Adapt or Modify?

The choice of using an adapter or modifying the object really comes down to how well you understand the class in question and the issue of encapsulation.

Lean toward modifying the class in the following circumstances:

+ The modifications are simple and clear.
+ You understand the class you are modifying and the way in which it is used.

Lean toward an adapter solution in the following situations:

+ The interface mismatch is extensive and complex. 
+ You have no idea how this class works.

Engineering is all about trade-offs. Adapters preserve encapsulation at the cost of some complexity. Modifying a class may buy you some simplification, but at the cost of tinkering with the plumbing.

### Using and Abusing

One of the advantages that Ruby’s duck typing gives to adapter writers is that it allows us to create adapters that support only that part of the target interface that the client will actually use. Partially implemented adapters are something of a double-edged sword: On the one hand, it is very convenient to implement only what you absolutely need; on the other hand, your program can come to grief if the client decides to call a method that you didn’t think you needed.


### In the Wild

`ActiveRecord` deals with all of these differences by defining a standardized interface, encapsulated in a class called `AbstractAdapter`. The `AbstractAdapter` class defines the interface to a database that is used throughout `ActiveRecord`. 

`AbstractAdapter` defines a standard method to execute a SQL select statement and return the results, called `select_all`. Each individual adapter implements the `select_all` method in terms of the API of the underlying database system.

## The Proxy

### Description

![the proxy](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/proxy.png)

The Proxy pattern is essentially built around a little white lie. The counterfeit object, called the **proxy** by the GoF, has a reference to the real object, the **subject**, hidden inside. Whenever the client code calls a method on the proxy, the proxy simply forwards the request to the real object.

Inside the proxy is hidden a reference to the other, real object—an object that the GoF referred to as the subject.

Once we have a proxy, we have a place to stand squarely between the client and the real object. The proxy provides the ideal pinch point to exert control.

The proxy serves as a pinch point between the client and the subject:

+ “Is this operation authorized?” asks the protection proxy.
+ “Does the subject actually live on this other machine?” asks the remote proxy. 
+ “Have I actually created the subject yet?” asks the virtual proxy. 

In short, the proxy controls access to the subject.

### The Protection Proxy

A proxy that controls access to the subject.

```ruby
require 'etc'

class AccountProtectionProxy
  def initialize(real_account, owner_name)
    @subject = real_account
    @owner_name = owner_name
  end
  
  def deposit(amount)
    check_access
    return @subject.deposit(amount)
  end
  
  def withdraw(amount)
    check_access
    return @subject.withdraw(amount)
  end
  
  def check_access
    if Etc.getlogin != @owner_name
      raise "Illegal access: #{Etc.getlogin} cannot access account."
    end
  end
end
```

The advantage of using a proxy for protection is that it gives us a nice separation of concerns: The proxy worries about who is or is not allowed to do what. The only thing that the real bank account object need be concerned with is, well, the bank account.

By splitting the protection cleanly off from the workings of the real object, we can minimize the chance that any important information will inadvertently leak out through our protective shield.

### The Remove Proxy

You could hide the complexity behind a remote proxy, an object that lives on the client machine and looks, to the client code, just like the real BankAccount object. When a request comes in, the remote proxy goes through all the horror of packaging up the request, sending it over the network, waiting for a response, unpacking the response, and returning the answer to the unsuspecting client.

From the client’s point of view, it called a method on what it thought was the real BankAccount object and sometime later—perhaps an unusually long time later—the answer came back. This is how virtually all remote procedure call (RPC) systems work.

```ruby
require 'soap/wsdlDriver'

wsdl_url = 'http://www.webservicex.net/WeatherForecast.asmx?WSDL'

proxy = SOAP::WSDLDriverFactory.new( wsdl_url ).create_rpc_driver
weather_info = proxy.GetWeatherByZipCode('ZipCode'=>'19128')
```

Once the proxy object is set up, the client code no longer has to worry about the fact that the service actually lives at www.webservicex.net. Instead, it simply calls GetWeatherByZipCode and leaves all of the network details to the proxy.

### The Virtual Proxy

In a sense, the virtual proxy is the biggest liar of the bunch. It pretends to be the real object, but it does not even have a reference to the real object until the client code calls a method. Only when the client actually calls a method does the virtual proxy scurry off and create or otherwise get access to the real object.

```ruby
class VirtualAccountProxy

  def initialize(starting_balance=0)
    @starting_balance=starting_balance
  end
  
  def deposit(amount)
    s = subject
    return s.deposit(amount)
  end
  
  def withdraw(amount)
    s = subject
    return s.withdraw(amount)
  end
  
  def balance
    s = subject
    return s.balance
  end
  
  def subject
    @subject || (@subject = BankAccount.new(@starting_balance))
  end
end  
```

That approach tangles the proxy and the subject up a little more than we might like. We can improve on this strategy by applying a little of that Ruby code block magic:

```ruby
class VirtualAccountProxy
  def initialize(&creation_block)
    @creation_block = creation_block
  end
  
  # Other methods omitted ...
  
  def subject
    @subject || (@subject = @creation_block.call)
  end
end
```

**Leverage Ruby**

Use ghost method `method_missing` and dynamic dispatch `send`.

```ruby
class VirtualProxy
  def initialize(&creation_block)
    @creation_block = creation_block
  end
  
  def method_missing(name, *args)
    s = subject
    s.send( name, *args)
  end
  
  def subject
    @subject = @creation_block.call unless @subject
    @subject
  end
end

array = VirtualProxy.new { Array.new }
array << 'hello'
array << 'out'
array << 'there'
```

### Using and Abusing

Overusing `method_missing`, like overusing inheritance, is a great way to obscure your code.

### In the Wild

**drb using a remote proxy**

```ruby
# server
class MathService
  def add(a, b)
    return a + b
  end
end

require 'drb/drb'

math_service=MathService.new
DRb.start_service("druby://localhost:3030", math_service)
DRb.thread.join

# client
require 'drb/drb'
DRb.start_service
 
# the client-side math_service is actually a remote proxy to the real
# math service, which is running inside the server-side Ruby interpreter.
math_service = DRbObject.new_with_uri("druby://localhost:3030")
sum=math_service.add(2,2)
```


## The Decorator

> But what if you simply need to vary the responsibilities of an object? What do you do when sometimes your object needs to do a little more, but sometimes a little less?


### Description

![decorator](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/decorator.png)

The ConcreteComponent is the “real” object, the object that implements the basic component functionality.

The Decorator pattern is a straightforward technique that you can use to assemble exactly the functionality that you need at runtime. The Decorator class has a reference to a Component—the next Component in the decorator chain—and it implements all of the methods of the Component type. 

Each decorator supports the same core interface, but adds its own twist on that interface. The key implementation idea of the Decorator pattern is that the decorators are essentially shells: Each takes in a method call, adds its own special twist, and passes the call on to the next component in line. 

The Decorator pattern lets you start with some basic functionality and layer on extra features, one decorator at a time.

### Why Not The Template Method?

The trouble is that the inheritance-based approach requires you to come up with all possible combinations of features up-front, at design time.

![out-of-control inheritance](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/out-of-control-inheritance.png)

### Code Usage

```ruby
class WriterDecorator
  def initialize(real_writer)
    @real_writer = real_writer
  end
  
  def write_line(line)
    @real_writer.write_line(line)
  end
  
  def pos
    @real_writer.pos
  end
  
  def rewind
    @real_writer.rewind
  end
  
  def close
    @real_writer.close
  end
end

class NumberingWriter < WriterDecorator
  def initialize(real_writer)
    super(real_writer)
    @line_number = 1
  end
  
  def write_line(line)
    @real_writer.write_line("#{@line_number}: #{line}")
    @line_number += 1
   end
end

writer = NumberingWriter.new(SimpleWriter.new('final.txt'))
writer.write_line('Hello out there')
```

**Fowardable module** [API](http://www.ruby-doc.org/stdlib-2.0/libdoc/forwardable/rdoc/Forwardable.html)

Ruby provides the **Forwardable** module provides delegation of specified methods to a designated object, using the methods `def_delegator` and `def_delegators`.

```ruby
require 'forwardable'

class WriterDecorator
  extend Forwardable

  def_delegators :@real_writer, :write_line, :rewind, :pos, :close

  def initialize(real_writer)
    @real_writer = real_writer
  end
end
```

The forwardable module is more of a precision weapon than the `method_missing` technique. But the `method_missing` technique really shines when you want to delegate large numbers of calls.

**Dynamic Alternatives - Wrapping Methods**

+ Around Alias
+ Refinement Wrapper
+ Prepended Wrapper

Check [this](http://blog.ifyouseewendy.com/blog/2014/06/03/metaprogrammingi-ruby/#method-wrapper).

**Dynamic Alternatives - Decorating with Modules**

```ruby
w = SimpleWriter.new('out')
w.extend(NumberingWriter)
w.extend(TimeStampingWriter)

w.write_line('hello')
```

With both of these techniques, it is hard to undo the decoration. Unwrapping an aliased method is likely to be tedious, and you simply cannot un-include a module.

### Using and Abusing

+ The classic Decorator pattern is loved more by the folks who build the thing than by those who use it.
+ One thing to keep in mind when implementing the Decorator pattern is that you need to keep the component interface simple.
+ Another potential drawback of the Decorator pattern is the performance overhead associated with a long chain of decorators.
+ Finally, one drawback of the method-aliasing technique for decorating objects is that it tends to make your code harder to debug.

### In the Wild

**`alias_method_chain` in ActiveSupport**

```ruby
def write_line(line)
  puts(line)
end

def write_line_with_timestamp(line)
  write_line_without_timestamp("#{Time.new}: #{line}")
end

alias_method_chain :write_line, :timestamp
```

The `alias_method_chain` method will rename the original `write_line` method to `write_line_without_timestamp` and rename `write_line_with_timestamp` to plain old `write_line`, essentially creating a chain of methods. The nice thing about `alias_method_chain` is that, as its name suggests, you can chain together a number of enhancing methods.

### Adapter, Proxy or Decorator

They are all "*one object stands for another*", and the basic idea is *Delegate, delegate, delegate*.

+ **The Adapter** hides the fact that some object has the wrong interface by wrapping it with an object that has the right interface. 
+ **The Proxy** also wraps another object, but not with the intent of changing the interface. Instead, the proxy has the same interface as the object that it is wrapping. The proxy isn’t there to tre; it is there to control. Proxies are good for tasks such as enforcing security, hiding the fact that an object really lives across the network, and delaying the creation of the real object until the last possible moment. 
+ **The Decorator** enables you to layer features on to a basic object.


## Singleton

A singleton class has exactly one instance, and access to that one instance is available globally.

### Code Usage

1. Creating the class variable and initializing it with the singleton instance
2. Creating the class-level `instance` method
3. Make `new` private.

```ruby
class SimpleLogger
  # Lots of code deleted...
  
  @@instance = SimpleLogger.new
  
  def self.instance
    return @@instance
  end
  
  # make sure there is only one
  private_class_method :new
end

logger1 = SimpleLogger.instance   # Returns the logger
logger2 = SimpleLogger.instance   # Returns exactly the same logger
```

Creating the singleton instance before you actually need it is called *eager instantiation*.

**Singleton module** [API](http://www.ruby-doc.org/stdlib-1.9.3/libdoc/singleton/rdoc/Singleton.html)

```ruby
require 'singleton'

class SimpleLogger
  include Singleton
  
  # Lots of code deleted...
end
```

The Singleton module, waits until someone calls instance before it actually creates its singleton. This technique is known as *lazy instantiation*.

### Alternatives

**Global Variables and Constants**

1. If you use a global variable or a constant for this purpose, there is no way to delay the creation of the singleton object until you need it.
2. Neither of these techniques does anything to prevent someone from creating a second or third instance of your supposedly singleton class.

**Class and Module methods**

Lazy initialization remains and all of those `self.methods` and `@@variables` makes a strange feel.

### Using and Abusing

**Don't expect the Singleton module really prevent anything**

```ruby
require 'singleton'

class Manager
  include Singleton
  
  def manage_resources
    puts("I am managing my resources")
  end
end
```

Use `public_class_method`.

```ruby
m = Manager.new # => private method 'new' called for Manager:Class

class Manager
  public_class_method :new
end

m = Manager.new
```

Use `clone`

```ruby
m = Manager.instance.clone
# => TypeError: can't clone instance of singleton Manager

Foo = Manager.clone
Foo.instance.manage_resources
# => I am managing my resources
```

The Ruby philosophy is that if you decide to circumvent the very clear intent of the author of the ClassBasedLogger class by cloning it, the language is there to help you out. You are in the driver’s seat, not the language. By keeping almost everything open to modification, Ruby allows you to do the things that you say you want to do—but it is up to you to say the right things.

**Coupling concern**

Create a singleton, and you have just made it possible for widely separated bits of your program to use that singleton as a secret channel to communicate with each other and, in the process, tightly couple themselves to each other. The horrible consequences of this coupling are why software engineering got out of the global variable business in the first place.

There is only one solution to this problem: *Don’t do that*.

**Considering the count, Do I really only need one instance?**

**a Need-to-Know Basis**

Another mistake that many people make is to spread the knowledge of a class’s singleton-ness far and wide.

```ruby
require 'singleton'

class DatabaseConnectionManager
  include Singleton
  
  def get_connection
    # Return the database connection...
  end
end
```

*Which classes are actually aware that DatabaseConnectionManager is a singleton?*

```ruby
class PreferenceManager
  def initialize
    @reader = PrefReader.new
    @writer = PrefWriter.new
    @preferences = { :display_splash=>false, :background_color=>:blue }
  end
  
  def save_preferences
    preferences = {}
    # Preference are in
    @writer.write(@preferences)
  end
  
  def get_preferences
    @preferences = @reader.read
  end
end

class PrefWriter
  def write(preferences)
    connection = DatabaseConnectionManager.instance.get_connection
    # Write the preferences out
  end
end

class PrefReader
  def read
    connection = DatabaseConnectionManager.instance.get_connection
    # Read the preferences and return them...
  end
end
```

A better approach might be to concentrate the knowledge that `DatabaseConnectionManager` is a singleton in the `PreferenceManager` class and simply pass it into the preference reader and writer:

```ruby
class PreferenceManager
  def initialize
    @reader = PrefReader.new
    @writer = PrefWriter.new
    @preferences = { :display_splash=>false, :background_color=>:blue }
  end
  
  def save_preferences
    preferences = {}
    # Preference are in
    @writer.write(DatabaseConnectionManager.instance, @preferences)
  end
  
  def get_preferences
    @preferences = @reader.read(DatabaseConnectionManager.instance)
  end
end
```

**Test Interferes**

As the Singleton saves the state, there is one exceedingly nasty thing about the Singleton pattern is the way that it interferes with unit testing.

One way to deal with this problem is to create two classes: an ordinary (i.e., non-singleton) class that contains all of the code, and a subclass of the first class that is a singleton. 

```ruby
require 'singleton'

class SimpleLogger
  # All of the logging functionality in this class...
end

class SingletonLogger < SimpleLogger
  include Singleton
end
```

The actual application code uses the `SingletonLogger`, while the tests can use the plain old, non-singleton `Logger` class.

### In the Wild

**Inflections in ActiveSupport**

The `Inflections` class is a singleton, which saves space and ensures that the same inflection rules are available everywhere.

**Rake::Application in rake** [API](http://ruby-doc.org/stdlib-2.0/libdoc/rake/rdoc/Rake/Application.html)

As it runs, rake—like most build tools—reads in information about what it needs to do: which directories to create, which files to copy, and so on. All of this information needs to be available to all of the moving parts of rake, so rake stores it all in a single object (the `Rake::Application` object, to be precise) that is available as a singleton to the entire rake program.

## Factory

> picking the right class for the circumstances

### Description

![factory](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/factory.png)

The GoF called this technique of pushing the “which class” decision down on a subclass the Factory Method pattern.

+ The **creators** are the base and concrete classes that contain the factory methods.
+ The **products** are the objects being created.

At its heart, this pattern is really just the Template Method pattern applied to the problem of creating new objects. In both the Factory Method pattern and the Template Method pattern, a generic part of the algorithm is coded in the generic base class, and subclasses fill in the blanks left in the base class.  

**Parameterized Factory Method**

Parameterized factory method is a method that can produce either a plant or an animal, depending on the symbol that is passed in:

```ruby
class Pond
  def initialize(number_animals, number_plants)
    @animals = []
    number_animals.times do |i|
      animal = new_organism(:animal, "Animal#{i}")
      @animals << animal
    end
    
    @plants = []
    number_plants.times do |i|
      plant = new_organism(:plant, "Plant#{i}")
      @plants << plant
    end
  end
  # ...
end

class DuckWaterLilyPond < Pond
  def new_organism(type, name)
    if type == :animal
      Duck.new(name)
    elsif type == :plant
      WaterLily.new(name)
    else
      raise "Unknown organism type: #{type}"
    end
  end
end

pond = DuckWaterLilyPond.new(3, 2)
```

**Claasses Are Just Objects, Too**

While the GoF concentrated on inheritance-based implementations of their factories, we can get the same results with much less code by taking advantage of the fact that in Ruby, classes are just objects.

```ruby
class Pond
  def initialize(number_animals, animal_class,
                 number_plants, plant_class)
    @animal_class = animal_class
    @plant_class = plant_class
    
    @animals = []
    number_animals.times do |i|
      animal = new_organism(:animal, "Animal#{i}")
      @animals << animal
    end
    
    @plants = []
    number_plants.times do |i|
      plant = new_organism(:plant, "Plant#{i}")
      @plants << plant
    end
  end
  
  def simulate_one_day
    @plants.each {|plant| plant.grow}
    @animals.each {|animal| animal.speak}
    @animals.each {|animal| animal.eat}
    @animals.each {|animal| animal.sleep}
  end
  
  def new_organism(type, name)
    if type == :animal
      @animal_class.new(name)
    elsif type == :plant
      @plant_class.new(name)
    else
      raise "Unknown organism type: #{type}"
    end
  end
end

pond = Pond.new(3, Duck, 2, WaterLily)
pond.simulate_one_day
```

### Abstract Factory

![abstract factory](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/abstract-factory.png)


An object dedicated to creating a compatible set of objects is called an abstract factory. 

The problem is that you need to create sets of compatible objects. The solution is that you write a separate class to handle that creation.

The important thing about the abstract factory is that it encapsulates the knowledge of which product types go together. You can express that encapsulation with classes and subclasses, or you can get to it by storing the class objects as we did in the code above. Either way, you end up with an object that knows which kind of things belong together.

```ruby
class PondOrganismFactory
  def new_animal(name)
    Frog.new(name)
  end
  def new_plant(name)
    Algae.new(name)
  end
end

class JungleOrganismFactory
  def new_animal(name)
    Tiger.new(name)
  end
  def new_plant(name)
    Tree.new(name)
  end
end

class Habitat
  def initialize(number_animals, number_plants, organism_factory)
    @organism_factory = organism_factory
    
    @animals = []
    number_animals.times do |i|
      animal = @organism_factory.new_animal("Animal#{i}")
      @animals << animal
    end
    
    @plants = []
    number_plants.times do |i|
      plant = @organism_factory.new_plant("Plant#{i}")
      @plants << plant
    end
  end
end

jungle = Habitat.new(1, 4, JungleOrganismFactory.new)
jungle.simulate_one_day

pond = Habitat.new( 2, 4, PondOrganismFactory.new)
pond.simulate_one_day  
```

**Claasses Are Just Objects, Too**

```ruby
class OrganismFactory
  def initialize(plant_class, animal_class)
    @plant_class = plant_class
    @animal_class = animal_class
  end
  
  def new_animal(name)
    @animal_class.new(name)
  end
  
  def new_plant(name)
    @plant_class.new(name)
  end
end

jungle_organism_factory = OrganismFactory.new(Tree, Tiger)
pond_organism_factory = OrganismFactory.new(WaterLily, Frog)

jungle = Habitat.new(1, 4, jungle_organism_factory)
jungle.simulate_one_day
pond = Habitat.new( 2, 4, pond_organism_factory)
pond.simulate_one_day
```

**Naming**

Another way that we can simplify the implementation of abstract factories is to rely on a consistent naming convention for the product classes. 

### Factory && Abstract Factory

+ The Factory Method pattern is really the Template Method pattern applied to object creation.
+ the Abstract Factory pattern is simply the Strategy pattern applied to the same problem.

### Using and Abusing

Not every object needs to be produced by a factory. (*You Ain't Goona Need It*).

Engineers do have a tendency to build the Queen Mary (or perhaps the Titanic?) when a canoe will suffice. If you have a choice of exactly one class at the moment, put off adding in a factory.

### In the Wild

**Base in ActiveRecord**

```ruby
adapter = "mysql"
method_name = "#{adapter}_connection"
Base.send(method_name, config)
```


## Builder

### Description

Builder pattern, a pattern designed to help you configure those complex objects. The builder class takes charge of assembling all of the components of a complex object.

![builder](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/buidler.png)

The client of the builder object the **director** because it directs the builder in the construction of the new object (called the **product**). Builders not only ease the burden of creating complex objects, but also hide the implementation details.

The idea behind the Builder pattern is that if your object is hard to build, if you have to write a lot of code to configure each object, then you should factor all of that creation code into a separate class, the builder.

The builders are less concerned about picking the right class and more focused on helping you configure your object.

+ Take control of configuring your object
+ Prevent you from constructing an invalid object

### Code Usage

```ruby
class ComputerBuilder
  attr_reader :computer
  
  def initialize
    @computer = Computer.new
  end
  
  def turbo(has_turbo_cpu=true)
    @computer.motherboard.cpu = TurboCPU.new
  end
  
  def display=(display)
    @computer.display=display
  end
  
  def memory_size=(size_in_mb)
    @computer.motherboard.memory_size = size_in_mb
  end
  
  def add_cd(writer=false)
    @computer.drives << Drive.new(:cd, 760, writer)
  end
  
  def add_dvd(writer=false)
    @computer.drives << Drive.new(:dvd, 4000, writer)
  end
  
  def add_hard_disk(size_in_mb)
    @computer.drives << Drive.new(:hard_disk, size_in_mb, true)
  end
end

builder = ComputerBuilder.new
builder.turbo
builder.add_cd(true)
builder.add_dvd
builder.add_hard_disk(100000)

computer = builder.computer
```

### Builders Can Ensure Sane Objects

That final “give me my object” method makes an ideal place to check that the configuration requested by the client really makes sense and that it adheres to the appropriate business rules.

```ruby
def computer
  raise "Not enough memory" if @computer.motherboard.memory_size < 250
  raise "Too many drives" if @computer.drives.size > 4
  hard_disk = @computer.drives.find {|drive| drive.type == :hard_disk}
  raise "No hard disk." unless hard_disk
  @computer
end
```

### Resuable Buidlers

An important issue to consider when writing and using builders is whether you can use a single builder instance to create multiple objects. 

One way to deal with this issue is to equip your builder with a `reset` method, which reinitializes the object under construction.

```ruby
class LaptopBuilder
  # Lots of code omitted...
  def reset
    @computer = LaptopComputer.new
  end
end
```

The reset method will let you reuse the builder instance, but it also means that you have to start the configuration process all over again for each computer. If you want to perform the configuration once and then have the builder produce any number of objects based on that configuration, you need to store all of the configuration information in instance attributes and create the actual product only when the client asks for it.

### Better Builders with Magic Methods

Use ghost method `method_missing`.

```ruby
def method_missing(name, *args)
  words = name.to_s.split("_")
  return super(name, *args) unless words.shift == 'add'
  words.each do |word|
    next if word == 'and'
    add_cd if word == 'cd'
    add_dvd if word == 'dvd'
    add_hard_disk(100000) if word == 'harddisk'
    turbo if word == 'turbo'
  end
end

builder.add_dvd_and_harddisk
builder.add_turbo_and_dvd_and_harddisk
```

### Using and Abusing

It is usually fairly easy to spot code that is missing a builder: You can find the same object creation logic scattered all over the place. Another hint that you need a builder is when your code starts producing invalid objects.

Builder pattern sometimes creeps up on you as your application becomes increasingly complex.

### In the Wild


## Interpreter

### Description

Interpreter pattern, which suggests that sometimes the best way to solve a problem is to invent a new language for just that purpose. 

![Interpreter](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/interpreter.png)

The heart of the Interpreter pattern is the abstract syntax tree.

The GoF called such values or conditions supplied at the time the AST is interpreted the `context`.

1. The parser reads in the program text and produces a data structure, called an abstract syntax tree (AST).
2. The AST is evaluated against some set of external conditions, or context, to produce the desired computation.

> ASTs are, in fact, specialized examples of the Composite pattern, with the nonterminal expressions playing the parts of the composites.


You can supply your clients with an API for building up the tree in code, or you can write a parser that takes strings and turns them into the AST.

### With a Parser

```ruby
class Parser
  def initialize(text)
    @tokens = text.scan(/\(|\)|[\w\.\*]+/)
  end
  
  def next_token
    @tokens.shift
  end
  
  def expression
    token = next_token
    if token == nil
      return nil
    elsif token == '('
      result = expression
      raise 'Expected )' unless next_token == ')'
      result
    elsif token == 'all'
      return All.new
    elsif token == 'writable'
      return Writable.new
    elsif token == 'bigger'
      return Bigger.new(next_token.to_i)
    elsif token == 'filename'
      return FileName.new(next_token)
    elsif token == 'not'
      return Not.new(expression)
    elsif token == 'and'
      return And.new(expression, expression)
    elsif token == 'or'
      return Or.new(expression, expression)
    else
      raise "Unexpected token: #{token}"
    end
  end
end  

parser = Parser.new "and (and(bigger 1024)(filename *.mp3)) writable"
ast = parser.expression
```

**Let XML or YAML Do The Parsing**

Keep in mind that the main motivation behind building an interpreter is to give your users a natural way to express the kind of processing that needs to be done.

**Racc**

Racc is modeled (and named) after the venerable UNIX YACC utility. Racc takes as input a description of the grammar for your language and spits out a parser, written in Ruby for that language.

### Without a Parser

Internal Domain-Specifc Languages.

You may implement your Interpreter pattern in such a way that users could write their pro-grams in actual Ruby code. Maybe you could design your AST API in such a way that the code flows so naturally that your users might be unaware that they are, in fact, writing Ruby code.

### Using and Abusing

+ The complexity issue. (The sheer number of components is why the Interpreter pattern is in practice limited to relatively simple languages.)
+ Program efficiency, it is probably best to limit your use of the Interpreter pattern to areas that do not demand high performance.

### In the Wild

**SQL**

**HTML**

**Ruby**, of course, an interpreted language.

**regular expression**


## Domain-Specific Languages

### Description

The DSL pattern suggests that you should focus on the language itself, not on the interpreter.

External DSLs are external in the sense that there is a parser and an interpreter for the DSL, and there are the programs written in the DSL.

An internal DSL, according to Fowler, is one in which we start with some implementation language, perhaps Ruby, and we simply bend that one language into being our DSL.

### Using and Abusing

1. You are limited to what you can parse with a Ruby-based internal DSL.
2. Error messages.

### In the Wild

The most prominent example of a pure internal DSL in the Ruby world is probably rake, Ruby’s answer to ant or make. 

**rake**, Ruby's answer to ant or make.

## Custom Objects

Meta-programming certainly takes a different tack in producing the right object, at its heart this pattern focuses on leveraging the flexibility of Ruby.

+ We can start with a simple object and add individual methods or even whole modules full of methods to it. 
+ Using `class_eval`, we can generate completely new methods at runtime.
+ We can take advantage of Ruby’s reflection facilities, which allow a program to examine its own structure

A note:

> The `attr_accessor` method and its friends live in the module `Module`, which is included by the `Object` class. If you go looking for the Ruby code for `attr_accessor`, `attr_reader`, and `attr_writer`, however, you are destined to be disappointed. For the sake of efficiency—but purely for efficiency—these methods are written in C.

### Custom-Tailoring Technique

This custom-tailoring technique is particularly useful when you have lots of orthogonal features that you need to assemble into a single object.

Of course, there really is no rule that says you need to start your customizations with a plain-vanilla instance of Object. In real life, you will likely want to start with an instance of a class that provides some base level of functionality and then tweak the methods from there.

```ruby
def new_animal(diet, awake)
  animal = Object.new
  if diet == :meat
    animal.extend(Carnivore)
  else
    animal.extend(Herbivore)
  end
  
  ...
end  
```

No matter whether you tailor your objects one method at a time or in module-sized chunks, the ultimate effect is to create a customized object, uniquely made to order for the requirements of the moment.


### Reflections

> If you are meta-programming new functionality into your classes on the fly, how can you tell what any given instance can do?

Reflection features like `public_methods` and `respond_to?` are handy anytime but become real assets as you dive deeper and deeper into meta-programming, when what your objects can do depends more on their history than on their class.

### Using and Abusing

Tests are absolutely mandatory for systems that use a lot of meta-programming.

## Convention Over Configuration

> The common message is that you should not just take your language as you find it, but rather mold it into something closer to the tool that you need to solve the problem at hand.

### Description

The Convention Over Configuration pattern suggests that you define a convention that a sensible engineer might use anyway.

+ Try to deduce how your users will behave.

+ You can give your user a kick start by supplying him or her with a model, a template, or an example to follow. You could also supply a utility to generate the outline or **scaffold** of a class. It is easy to discount the value of this scaffold-generating script.

### Using and Abusing

One danger in building convention-based systems is that your convention might be incomplete, thereby limiting the range of things that your system can do.

> Our message gateway, for example, does not really do a thorough job of transforming host names into Ruby class names. The code in this chapter will work fine with a simple host name like *russolsen.com*, transforming it into *RussOlsenDotCom*. But feed our current system something like *icl-gis.co*m and it will go looking for the very illegal *Icl-gisDotComAuthorizer* class.

Another potential source of trouble is the possibility that a system that uses a lot of conventions may seem like it is operating by magic to the new user. Configuration files may be a pain in the neck to write and maintain, but they do provide a sort of road map—perhaps a very complicated and hard-to-interpret road map, but a map nevertheless—to the inner workings of the system. A well-done convention-based system, by contrast, needs to supply its operational road map in the form of (gasp!) **documentation**.

Also keep in mind that as the convention magic becomes deeper and more complex, you will need ever more thorough unit tests to ensure that your conventions behave, well, conventionally. 

## Reference

+ [Examples from the book Design Patterns](https://github.com/nslocum/design-patterns-in-ruby) by [Nick Slocum](https://github.com/nslocum)
