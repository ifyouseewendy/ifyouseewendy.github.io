---
layout: post
title: "[Review] Guidance from POODR"
date: 2015-01-29 15:20:13 +0800
comments: true
categories: 
---

{:.custom}
| **Book**    | Practical Object Oriented Design in Ruby
| **Author**  | Sandi Metz
| **Link**    | [www.poodr.com](http://www.poodr.com/)

* TOC
{:toc}

# Object-Oriented Design


Object-oriented design (OOD) requires that you shift from thinking of the world as a collection of predefined procedures to modeling the world as a series of messages that pass between objects.

Object-oriented applications are made up of parts that interact to produce the behavior of the whole. The parts are *objects*; interactions are embodied in the *messages* that pass between them.

Object-oriented design is about managing dependencies. In the absence of design, unmanaged dependencies wreak havoc because objects know too much about one another.

Design is thus an art, the art of arranging code, and design is more the art of preserving changeability than it is the act of achieving perfection. You must not only write code for the feature you plan to deliver today, you must also create code that is amenable to being changed later. It doesn’t guess the future; it preserves your options for accommodating the future. It doesn’t choose; it leaves you room to move.

The trick to getting the most bang for your design buck is to acquire an understanding of the theories of design and to apply these theories appropriately, at the right time, and in the right amounts. 

Well-designed applications are constructed of reusable code. Small, trustworthy self- contained objects with minimal context, clear interfaces, and injected dependencies are inherently reusable.


## The Tools of Design

### Design Principles

+ **SOLID**

    + Single Responsibility
    + Open-Closed
    + Liskov Substitution
    + Interface Segregation
    + Dependency Inversion

+ **DRY**, Don't Repeat Yourself
+ **LoD**, Law of Demeter

### Design Patterns

by Gof

## The Act of Design

### How Design Fails

+ Lack of it. Successful but undesigned applications carry the seeds of their own destruction; they are easy to write but gradually become impossible to change. “Yes, I can add that feature, but it will break everything.”
+ Overdesign. Aware of OO design techniques but do not yet understand how to apply them. “No, I can’t add that feature; it wasn’t designed to do that.”
+ Seperated from the act of programming. Design is a process of progressive discovery that relies on a feedback loop. The iterative techniques of the Agile software movement are thus perfectly suited to the creation of well-designed OO applications. The iterative nature of Agile development allows design to adjust regularly and to evolve naturally. 

### When to Design

> Agile believes that your customers can’t define the software they want before seeing it, so it’s best to show them sooner rather than later. If this premise is true, then it logically follows that you should build software in tiny increments, gradually iterating your way into an application that meets the customer’s true need. The Agile experience is that this collaboration produces software that differs from what was initially imagined; the resulting software could not have been anticipated by any other means. 

If Agile is correct, then

1. there is absolutely no point in doing a Big Up Front Design (BUFD) (because it cannot possibly be correct)
2. no one can predict when the application will be done (because you don’t know in advance what it will eventually do)

Agile processes guarantee change and your ability to make these changes depends on your application’s design. If you cannot write well-designed code you’ll have to rewrite your application during every iteration.

# Guidance


Focus on object,

+ Single **Responsibility**
+ Manage **Dependencies**

Focus on message,

+ **Interface**, creating flexible interfaces
+ **Duck Typing**, reducing costs with Duck Typing
+ **Inheritance**, acquiring behavior through inheritance
+ **Module**, sharing **role** behavior with modules
+ **Composition**, combining objects with composition
+ **Tests**, designing cost-effective tests

## Designing Classes with a Single Responsibility


SRP requires that a class be **cohesive**, that everything in a class is related to its central purpose, the class is said to be highly cohesive or to have a single responsibility.

### Depend on Behavior, Not Data

"Don’t Repeat Yourself" (DRY) is a shortcut for this idea.

+ Hide instance variables
+ Hide data structures

### Enforce Single Responsibility Everywhere

+ Extract extra responsibilities from methods

    Methods, like classes, should have a single responsibility. All of the same reasons apply; having just one responsibility makes them easy to change and easy to reuse.

+ Isolate extra responsibilities in classes

    Postponing decisions until you are absolutely forced to make them. Any decision you make in advance of an explicit requirement is just a guess. Don’t decide; preserve your ability to make a decision later.

## Manage Dependencies

To collaborate, an object must know something know about others. *Knowing* creates a dependency, or *coupling* creates a dependency.

Dependency management is core to creating future-proof applications.

An object has a dependency when it knows

+ The name of another class.
+ The name of a message that it intends to send to someone other than self.
+ The arguments that a message requires.
+ The order of those arguments.
+ Knowing the name of a message you plan to send to someone other than self.
+ Tests on code.

### Inject Dependencies


```ruby
# before
class Gear
  ...
  
  def gear_inches
    ratio * Wheel.new(rim, tire).diameter
  end
end

# after
class Gear
  attr_reader :chainring, :cog, :wheel
  def initialize(chainring, cog, wheel)
    @chainring = chainring
    @cog       = cog
    @wheel     = wheel
  end
  
  def gear_inches
    ratio * wheel.diameter
  end
end
``` 

Gear previously had explicit dependencies on the Wheel class and on the type and order of its initialization arguments, but through injection these dependencies have been reduced to a single dependency on the diameter method.

### Isolate Dependencies

**Isolate Instance Creation**

If you are so constrained that you cannot change the code to inject a Wheel into a Gear, you should isolate the creation of a new Wheel inside the Gear class.

```ruby
class Gear
  ...

  def gear_inches
    ratio * wheel.diameter
  end
  
  def wheel
    @wheel ||= Wheel.new(rim, tire)
  end
```
    
+ Isolate Vulnerable External Messages

External messages, that is, messages that are "sent to someone other than self."

```ruby
class Gear
  ...

  def gear_inches
    ratio * diameter
  end
  
  def diameter
    wheel.diameter
  end
```

### Remove Argument-Order Dependencies

+ Use Hashes for Initialization Arguments
+ Explicitly Define Defaults
+ Isolate Multiparameter Initialization, use a wrapper.

### Managing Dependency Direction

Depend on things that change less often than you do.

+ Some classes are more likely than others to have changes in requirements.
+ Concrete classes are more likely to change than abstract classes.
+ Changing a class that has many dependents will result in widespread consequences.

Depend on abstractions.

## Creating Flexible Interfaces

> Interface within a class, make up its public interface.

Public Interfaces

+ Reveal its primary responsibility
+ Are expected to be invoked by others
+ Will not change on a whim
+ Are safe for others to depend on
+ Are thoroughly documented in the tests

Private Interfaces

+ Handle implementation details
+ Are not expected to be sent by other objects
+ Can change for any reason whatsoever
+ Are unsafe for others to depend on
+ May not even be referenced in the tests

Well-defined public interfaces consist of stable methods that expose the responsibilities of their underlying classes (public methods should read like a description of responsibilities).


### Finding the Public Interface

#### Focus Messages between Domain Objects

Nouns in the application that have both data and behavior are called domain objects. Domain objects are easy to find but they are not at the design center of your application. Design experts notice domain objects without concentrating on them; they focus not on these objects but on the messages that pass between them.

#### Use Sequence Diagrams

They explicitly specify the messages that pass between objects, and because objects should only communicate using public interfaces, sequence diagrams are a vehicle for exposing, experimenting with, and ultimately defining those interfaces.

#### Asking for “What” Instead of Telling “How”

#### Seeking Contect Independence

The best possible situation is for an object to be completely independent of its context. An object that could collaborate with others without knowing who they are or what they do could be reused in novel and unanticipated ways.

The technique for collaborating with others without knowing who they are—dependency injection. 

### The Law of Demeter

It prohibits routing a message to a third object via a second object of a different type. “Only talk to your immediate neighbors” or “use only one dot.”

Delegation is tempting as a solution to the Demeter problem because it removes the visible evidence of violations.

Listening to Demeter means paying attention to your point of view. If you shift to a message-based perspective, the messages you find will become public interfaces in the objects they lead you to discover. However, if you are bound by the shackles of existing domain objects, you’ll end up assembling their existing public interfaces into long message chains and thus will miss the opportunity to find and construct flexible public interfaces.



## Reductin Costs with Duck Typing

> Interface, across classes and is independent of any single class. The interface represents a set of messages where the messages themselves define the interface. It’s almost as if the interface defines a virtual class; that is, any class that implements the required methods can act like the interface kind of thing.

**Duck types** are public interfaces that are not tied to any specific class. These across-class interfaces add enormous flexibility to your application by replacing costly dependencies on class with more forgiving dependencies on messages.

### Polymorphism

**Polymorphism** in OOP refers to the ability of many different objects to respond to the same message. Senders of the message need not care about the class of the receiver; receivers supply their own specific version of the behavior. Polymorphic methods honor an implicit bargain; they agree to be inter- changeable from the sender’s point of view.

A single message thus has many (poly) forms (morphs).

There are a number of ways to achieve polymorphism:

+ Duck Typing
+ Inheritance
+ Behavior Sharing (module)

### Recognizing Hidden Ducks

+ Case statements that switch on class
+ `kind_of?` and `is_a?`
+ `responds_to?`

### Guidance

When you create duck types you must both document and test their public inter- faces. Fortunately, good tests are the best documentation.

The decision to create a new duck type relies on judgment. The purpose of design is to lower costs; bring this measuring stick to every situation. If creating a duck type would reduce unstable dependencies, do so. Use your best judgment.

## Acquiring Behavior Through Inheritance

### Inheritance

Inheritance is, at its core, a mechanism for **automatic message delegation**. It defines a forwarding path for not-understood messages. It creates relationships such that, if one object cannot respond to a received message, it delegates that message to another. You don’t have to write code to explicitly delegate the message, instead you define an inheritance relationship between two objects and the forwarding happens automatically.

When your problem is one of needing numerous specializations of a stable, common abstraction, inheritance can be an extremely low-cost solution.

### Recognizing Where to Use Inheritance

The inheritance exactly solves: that of highly related types that share common behavior but differ along some dimension.  

Inheritance provides a way to define two objects as having a relationship such that when the first receives a message that it does not understand, it automatically forwards, or delegates, the message to the second. It’s as simple as that.  

Duck types cut across classes, they do not use classical inheritance to share common behavior. Duck types share code via Ruby modules.

#### Finding the Abstraction

It almost never makes sense to create an abstract superclass with only one sub-class.  

Creating a hierarchy has costs; the best way to minimize these costs is to maximize your chance of getting the abstraction right before allowing subclasses to depend on it. While the two bikes you know about supply a fair amount of information about the common abstraction, three bikes would supply a great deal more. If you could put this decision off until FastFeet asked for a third kind of bike, your odds of finding the right abstraction would improve dramatically.

When deciding between refactoring strategies, indeed, when deciding between design strategies in general, it’s useful to ask the question: “What will happen if I’m wrong?”

### Using Templage Methods

#### Template Method

This technique of defining a basic structure in the superclass and sending messages to acquire subclass-specific contributions is known as the template method pattern.

#### Implementing Every Template Method

Any class that uses the template method pattern must supply an implementation for every message it sends, and creating code that fails with reasonable error messages takes minor effort in the present but provides value forever.

```ruby
class Bicycle
  #...
  def default_tire_size
    raise NotImplementedError, "This #{self.class} cannot respond to:"
  end 
end
```

### Manging Coupling

When a subclass sends `super` it’s effectively declaring that it knows the algorithm; it depends on this knowledge. If the algorithm changes, then the subclasses may break even if their own specializations are not otherwise affected.

#### Decoupling Subclasses Using Hook Messages

Instead of allowing subclasses to know the algorithm and requiring that they send `super`, superclasses can instead send `hook` messages, ones that exist solely to provide subclasses a place to contribute information by implementing matching methods. This strategy removes knowledge of the algorithm from the subclass and returns control to the superclass.

```ruby
class Bicycle
  def initialize(args={})
    @size = args[:size]
    @chain = args[:chain] || default_chain
    @tire_size = args[:tire_size] || default_tire_size
    
    post_initialize(args)   # Bicycle both sends
  end
    
  def post_initialize(args) # and implements this 
    nil
  end
  # ...
end

class RoadBike < Bicycle

  def post_initialize(args)         # RoadBike can 
    @tape_color = args[:tape_color] # optionally
  end                               # override it
  # ...
end
```

This change allows RoadBike to know less about Bicycle, reducing the coupling between them and making each more flexible in the face of an uncertain future. New subclasses need only implement the `hook` methods.


## Sharing Role Behavior with Modules

### Understanding Roles

Modules thus provide a perfect way to allow objects of different classes to play a common role using a single set of code.

The rules for modules are the same as for classical inheritance. If a module sends a message it must provide an implementation, even if that implementation merely raises an error indicating that users of the module must implement the method.

This is-a versus behaves-like-a difference definitely matters, each choice has distinct consequences.

### Writing Inheritable Code

The usefulness and maintainability of inheritance hierarchies and modules is in direct proportion to the quality of the code. 

#### Recognize the Antipatterns

There are two antipatterns that indicate that your code might benefit from inheritance.

+ An object that uses a variable with a name like `type` or `category` to determine what message to send to `self` contains two highly related but slightly different types.
+ When a sending object checks the class of a receiving object to determine what message to send, you have overlooked a duck type. In addition to sharing an interface, duck types might also share behavior. When they do, place the shared code in a module and include that module in each class or object that plays the role.

#### Insist on the Abstraction

Superclasses should not contain code that applies to some, but not all, subclasses. This restriction also applies to modules: the code in a module must apply to all who use it.

Subclasses that override a method to raise an exception like “does not implement” are a symptom of this problem. When subclasses override a method to declare that they *do not do that thing* they come perilously close to declaring that they *are not that thing*.

#### Honor the Contract

Subclasses agree to a contract; they promise to be substitutable for their superclasses.

Subclasses that fail to honor their contract are difficult to use. They’re “special” and cannot be freely substituted for their superclasses. These subclasses are declaring that they are not really a kind-of their superclass 

**Liskov Substitution Principle (LSP)**, which in mathematical terms says that a subtype should be substitutable for its supertype. Named after Barbara Liskov.


#### Use the Template Method Pattern

The abstract code defines the algorithms and the concrete inheritors of that abstraction contribute specializations by overriding these template methods.

Modules, therefore, should use the template method pattern to invite those that include them to supply specializations, and should implement hook methods to avoid forcing includers to send `super`.

#### Preemptively Decouple Classes

Avoid writing code that requires its inheritors to send `super`; instead use hook messages to allow subclasses to participate while absolving them of responsibility for knowing the abstract algorithm. Writing code that requires subclasses to send `super` adds an additional dependency; avoid this if you can.

Hook methods solve the problem of sending `super`, but, unfortunately, only for adjacent levels of the hierarchy.

#### Create Shallow Hierarchies

The limitations of hook methods are just one of the many reasons to create shallow hierarchies.

Because objects depend on everything above them, a deep hierarchy has a large set of built-in dependencies, each of which might someday change.

Another problem with deep hierarchies is that programmers tend to be familiar with just the classes at their tops and bottoms; that is, they tend to understand only the behavior implemented at the boundaries of the search path.

## Combining Objects with Composition

Composition is the act of combining distinct parts into a complex whole such that the whole becomes more than the sum of its parts.

### Aggregation: A Special Kind of Composition

Delegation creates dependencies; the receiving object must recognize the message and know where to send it. Composition often involves delegation but the term means something more. A composed object is made up of parts with which it expects to interact via well-defined interfaces.

Composition indicates a *has-a* relationship where the contained object has no life inde- pendent of its container.

Aggregation is exactly like composition except that the contained object has an independent life.

### Deciding Between Inheritance and Composition

+ Remember that classical inheritance is a code arrangement technique. For the cost of arranging objects in a hierarchy, you get message delegation for free. 
+ Composition is an alternative that reverses these costs and benefits. Composition allows objects to have structural independence, but at the cost of explicit message delegation.

The general rule is that, faced with a problem that composition can solve, you should be biased towards doing so. If you cannot explicitly defend inheritance as a better solution, use composition.

#### Inheritance

**Benefits**

Inheritance is a better solution when its use provides high rewards for low risk.

Use of inheritance results in code that can be described as open–closed; hierarchies are open for extension while remaining closed for modification. 

You need look no farther than the source of object-oriented languages themselves to see the value of organizing code using inheritance.

**Costs**

You might be fooled into choosing inheritance to solve the wrong kind of problem. If you make this mistake a day will come when you need to add behavior but find there’s no easy way do so.

Even when inheritance makes sense for the problem, you might be writing code that will be used by others for purposes you did not anticipate.

The very high cost of making changes near the top of an incorrectly modeled hierarchy. In this case, the leveraging effect works to your disadvantage; small changes break everything.

The impossibility of adding behavior when new subclasses represent a mixture of types.

Inheritance, therefore, is a place where the question “*What will happen when I’m wrong?*” assumes special importance. Inheritance by definition comes with a deeply embedded set of dependencies. Subclasses depend on the methods defined in their superclasses and on the automatic delegation of messages to those superclasses. This is classical inheritance’s greatest strength and biggest weakness.

**Guidance**

Your consideration of the use of inheritance should be tempered by your *expectations about the population who will use your code*. If you are writing code for an in-house application in a domain with which you are intimately familiar, you may be able to predict the future well enough to be confident that your design problem is one for which inheritance is a cost-effective solution.

Avoid writing frameworks that require users of your code to subclass your objects in order to gain your behavior. Their application’s objects may already be arranged in a hierarchy; inheriting from your framework may not be possible.

#### Composition

Composed objects do not depend on the structure of the class hierarchy, and they delegate their own messages.

**Benefits**

When using composition, the natural tendency is to create many small objects that con- tain straightforward responsibilities that are accessible through clearly defined interfaces. These small objects have a single responsibility and specify their own behavior. They are transparent.

By their very nature, objects that participate in composition are small, structurally independent, and have well-defined interfaces. This allows their seamless transition into pluggable, interchangeable components.

**Costs**

The composed object must explicitly know which messages to delegate and to whom. Identical delegation code may be needed by many different objects. Composition provides no way to share this code.

Composition is excellent at prescribing rules for assembling an object made of parts but doesn’t provide as much help for the problem of arranging code for a collection of parts that are very nearly identical.

### Guidance

Composition, classical inheritance, and behavior sharing via modules are competing techniques for arranging code.

+ Use inheritance for *is-a* Relationships.
+ Use Duck Types for *behaves-like-a* Relationships
+ Use Composition for *has-a* Relationships


## Designing Cost-Effective Tests

An understanding of object-oriented design, good refactoring skills, and the ability to write efficient tests form a **three-legged stool** upon which changeable code rests.

Your overall goal is to create well-designed applications that have acceptable test coverage. 

### Intentional Testing

#### Knowing Your Intentions

The true purpose of testing, just like the true purpose of design, is to reduce costs.

It is common for programmers who are new to testing to find themselves in the unhappy state where the tests they write do cost more than the value those tests provide, and who therefore want to argue about the worth of tests. The solution to the problem of costly tests, however, is not to stop testing but instead to get better at it.

1. Finding Bugs
2. Supplying Documentation
3. Deferring Design Decisions
4. Supporting Abstractions
5. Exposing Design Flaws. When the design is bad, testing is hard. The best way to achieve this goal is to write loosely coupled tests about only the things that matter.

#### Knowing What to Test

##### Remove the Duplicate

One simple way to get better value from tests is to write fewer of them. The safest way to accomplish this is to test everything just once and in the proper place.

Removing duplication from testing lowers the cost of changing tests in reaction to application changes, and putting tests in the right place guarantees they’ll be forced to change only when absolutely necessary.

##### Message Model

![origins_of_messages](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/origins_of_messages.png)

Think of an object-oriented application as a series of messages passing between a set of black boxes. Tests should concentrate on the incoming or outgoing messages that cross an object’s boundaries.

+ Incoming Message

    Objects should make assertions about *state* only for messages in their own public interfaces.

+ Outgoing Message

    - *query*, outgoing messages have no side effects and thus matter only to their senders.
    - *command*, outgoing messages do have side effects (a file gets written, a database record is saved, an action is taken by an observer). It is the responsibility of the sending object to prove that they are properly sent. Proving that a message gets sent is a test of behavior, not state.


**Conclusion**

Incoming messages should be tested for the state they return. Outgoing command messages should be tested to ensure they get sent. Outgoing query messages should not be tested.

#### Knowing When to Test

You should write tests first, whenever it makes sense to do so.

Done at the correct time and in the right amounts, testing, and writing code test-first, will lower your overall costs. Gaining these benefits requires applying object-oriented design principles everywhere, both to the code of your application and to the code in your tests.

*What novices do?*

Novices often write code that is far too coupled; they combine unrelated responsibilities and bind many dependencies into every object. 

It is an unfortunate truth that the most complex code is usually written by the least qualified person.

Novice programmers don’t yet have the skills to write simple code.

#### Knowing How to Test

![bdd_and_tdd](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/bdd_and_tdd.png)

+ **BDD** takes an outside-in approach, creating objects at the boundary of an application and working its way inward, mock-ing as necessary to supply as-yet-unwritten objects.
+ **TDD** takes an inside-out approach, usually starting with tests of domain objects and then reusing these newly created domain objects in the tests of adjacent layers of code.

**Testing point-of-view**

Your tests could stand completely inside of the object under test, with effective access to all of its internals. This is a bad idea.

It’s better for tests to assume a viewpoint that sights along the edges of the object under test, where they can know only about messages that come and go.

### Testing Incoming Messages

+ Deleting Unused Interfaces

    Do not test an incoming message that has no dependents; delete it. 

+ Proving the Public Interface

+ Isolating the Object Under Test

+ Injecting Dependencies as Roles

    Object-oriented design tells you to inject dependencies because it believes that specific concrete classes will vary more than these roles, or conversely, roles will be more stable than the classes from which they were abstracted.

    - Creating Test Doubles
    - Using Tests to Document Roles

### Testing Private Methods

Dealing with private methods requires judgment and flexibility.

The rules-of-thumb for testing private methods are thus: Never write them, and if you do, never ever test them, unless of course it makes sense to do so.

### Testing Outgoing Messages

+ Ignoring Query Messages
+ Proving Command Messages

    The responsibility for testing a message’s return value lies with its receiver. **Mocks** are tests of behavior, as opposed to tests of state. Instead of making assertions about what a message returns, mocks define an expectation that a message will get sent. 
    
### Testing Duck Types

The desire to test duck types creates a need for shareable tests for roles, and once you acquire this role-based perspective you can use it to your advantage in many situations. From the point of view of the object under test, every other object is a role and dealing with objects as if they are representatives of the roles they play loosens coupling and increases flexibility, both in your application and in your tests.

+ Testing Roles. Extract a module, test it and include in every role.
+ Using Role Tests to Validate Doubles.

### Testing Inherited Code

+ Specifying the Inherited Interface

    Write a shared test for the common contract and include this test in every object.

+ Specifying Subclass Responsibilities

    - Confirming Subclass Behavior. The *BicycleInterfaceTest* and the *BicycleSubclassTest*, combined, take all of the pain out of testing the common behavior of subclasses. These tests give you confidence that subclasses aren’t drifting away from the standard.
    - Confirming Superclass Enforcement. Test the template method.

+ Testing Unique Behavior

    - Testing Concrete Subclass Behavior. It’s important to test these specializations without embedding knowledge of the superclass into the test.
    - Testing Abstract Superclass Behavior. Because Bicycle used tem- plate methods to acquire concrete specializations you can stub the behavior that would normally be supplied by subclasses. Even better, because you understand the Liskov Substitution Principle, you can easily manufacture a testable instance of Bicycle by creating a new subclass for use solely by this test.

