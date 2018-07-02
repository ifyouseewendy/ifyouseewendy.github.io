---
layout: post
title: "An Essential Difference Between OOP and FP"
date: 2018-07-01 23:03:54 -0400
comments: true
categories: ["Programming"]
---

A few months ago, I told my friend that I was learning Haskell recently. After giving him
a quick introduction, he asked me an intuitive but hard question that I was not able to give
the answer, "What is the difference between OOP and FP?".

I thought hard, I asked around and I took it on my way learning Haskell, but apparently there
are no easy answers, considering they usually appear at the opposite position on the spectrum
of programming paradgim.

Anyway, today when I was reviewing my notes for recapping type system in Haskell, the question
got popped up again. But this time, I think I've got an answer:

Other than the obvious language characteristics, **the essential difference between OOP and FP
is how they structure values and operations**. OOP groups values and operations together in the
objects, while FP separates values and operations apart strictly.

Seriously, is that an answer? I konw, it's not perfect, but definitely helpful to myself. I'll make
a detailed explanation.

## What is a program?

We use programming languages to write programs, which can be considered as a series of calculations
executed in many stacks of control flows. It's not hard to figure out that, in essence, a program is
about **operating values**.

As the definition for *turing complete* says, language is about *data-manipulation*.

> In computability theory, a system of data-manipulation rules (such as a computer's instruction set,
a programming language, or a cellular automaton) is said to be Turing complete or computationally
universal if it can be used to simulate any Turing machine.

## What is a value?

***The first question is what are basic values?***

No matter what language you are using, there must be

```
1
'c'
True # somehow boolean value can also be considered as a integer
```

***But what if I want to represent more compliated values?***

We use data structures:

+ List, `[1,2,3]`, a set of independent values
+ Tuple, `(1,2,3)`, several values compound over each other as one value
+ Tree, values structured with a purpose to be manipulated easily
+ Dictionary? It seems like a combination for value and algorithm

***Apparently, that's not enough for us to carve the real world. What's the ultimate way to represent data no matter how complicated it is?***

It depends on what mechanism a language supports. Here jumps in the discussion for difference between
OOP and FP language, which I'll take Ruby and Haskell as examples.

In Ruby, we use class to model the real world problem and use objects to hold values, which we also call
it state in OO.

```rb
class Person
  attr_accessor :name, :age
end

person = Person.new("Di", 18)
```

As we can see, class defines what pattern of data (`name` and `age`) we want to hold.
After initializing, an object will wrap the plain data `"Di"` and `18` together as a
whole new value.

In Haskell, we use type to model the real world values and everytime we create a customized type,
there will also come with a data constructor, which holds the values together.

```haskell
data Person = Person String Integer

person = Person "Di" 18
```

As a summary, no matter how complicated the value is, we can always represent it by
applying this kind of mechanisms the language provides over and over again.

## How to operate value?

By rules, laws, or formulas. In another saying, methods or functions.

In Ruby, we define methods in class definition to empower the object to apply onto its states.

```rb
class Person
  attr_accessor :name, :age

  def gets_older; age += 1; end
end

person = Person.new("Bart", 10)
```

When we call `person.gets_older`, we'll alter the `age` value by incrementing it by one. If we
have a peek into our memory, there will be data blobs like in below. Each object exists as
a bundle of values and operations.

```haskell
 +-----------------+   +-----------------+   +-----------------+
 |_class_: Person  |   |_class_: Person  |   |_class_: Person  |
 |                 |   |                 |   |                 |
 |name: "Bart"     |   |name: "Lisa"     |   |name: "Maggie"   |
 |age:  10         |   |age:  8          |   |age:  1          |
 |                 |   |                 |   |                 |
 |#gets_older      |   |#gets_older      |   |#gets_older      |
 +-----------------+   +-----------------+   +-----------------+
```

However, in Haskell, we make use of functions to operate values, with limits put on their types.


```haskell
data Person = Person String Integer
person = Person "Bart" 10

getsOlder :: Person -> Person
getsOlder (Person name age) = Person name (age+1)
```

When we call `getsOlder person`, we'll create a new copy of person data with `age` incremented
by one, conforming to immutability. As a comparison, if we look into our memory, we'll see what's
in below.

```haskell
 +-----------------+   +-----------------+   +-----------------+
 |_type_: Person   |   |_type_: Person   |   |_type_: Person   |
 |                 |   |                 |   |                 |
 |name: "Bart"     |   |name: "Lisa"     |   |name: "Maggie"   |
 |age:  10         |   |age: 8           |   |age: 1           |
 +-----------------+   +-----------------+   +-----------------+

+---------------------------------------------------------------+

 +---------------------+
 |_type_: Function     |
 |                     |
 |name: getsOlder      |
 |sig: Person -> Person|
 +---------------------+
```

## Wrap up

As a conclusion, I think OOP and FP take a different approach to operating values. OOP packs up
values and permitted operations together via objects, wheras FP separates values and operations
apart strictly.

*PS. How does polymorphism fit in the discussion?*

We can keep following the imaginary memory snapshot above. In OOP, it'll work as long as
objects repond to the same method, whereas in Haskell, we can loose the function to allow
more general types passed in.

In Ruby, it's about duck typing.

```rb
class Person
  def gets_older; age += 1; end
end

class Duck
  def gets_older; age += 1; end
end

def as_time_goes_by(a_living)
  a_living.gets_older # no matter it's a person or a duck
end
```

In Haskell, we use type to represent a set of values and typeclass to enforce rules on what kind
of operations can be applied onto the type (the set of values).

```haskell
data Person = Person String Integer deriving (Show)
data Duck = Duck Integer deriving (Show)

class Living a where
  getsOlder :: a -> a

instance Living Person where
  getsOlder (Person name age) = Person name (age+1)

instance Living Duck where
  getsOlder (Duck age) = Duck (age+1)

asTimeGoesBy :: Living a => a -> a
asTimeGoesBy living = getsOlder living
```
