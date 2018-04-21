---
layout: post
title: "A Peep at Types in Haskell"
date: 2018-04-21 10:15:19 -0400
comments: true
categories: ['Programming']
---

Functional programming is a shining and trending topic on the other side of the spectrum of programming, which has been
proven to be a better choice in some specific area of problem solving. I could still remember the mind blowing of various
ideas and thoughts in FP when I first learnt Elm two years ago. It just shows me yet another possibility of thinking
after being immersed in the world I took for granted, all kinds of the imperative languages, C, Java, Ruby, Javascript.
It's a whole new world.

Recently, I picked up the FP learning by taking part in a book reading club in the company I work, for
["Haskell Programming from first principles"](http://haskellbook.com/). My girlfriend was teasing me that I've never
showed up in a Haskell class at the university, why the heck you talk about it all the time now. I should admit that I might
still feel bored if I could jump back in time. It's just I don't have the mind power or experience to think about the
problem in a big picture at that time. Anyway, I'm glad it's never too late. It's been two months for the fun journey.
I want to share some thoughts on it.

I just finished reading about algebraic data types in Haskell. Basically, it's done talking about type systems in the
book. By getting to know types in Haskell, I questioned about why type exists all the time. I cannot help myself
thinking about how would I solve the same problem in OO world, like what is the difference about how data is
structured between OO and FP. Gradually, keeping punching my head, I feel like I start to see something through. I start
to realize that, **programming is all about data and operations**. Different paradigms, OO and FP, are two different
approaches. Under the big picture, languages choose to implement different characteristics, like
inheritance, encapsulation, polymorphism, prototype, immutability, static and dynamic types, etc, to reach a same goal,
to represent and manipulate data in an effective way.

Since it's all about data, what is data? I consider it as a general name for all possible values, like primitive ones, `1, 'a',
True`, which are usually bulit into the language, like a list `[]` and a map `{}`, working as a group of values following some basic
simple rules. To better fit the language into modeling various realistic problems, OO introduces class, which packs up the states
(data) and methods (operation) together (In some sense, class is a set of data and rules applied onto the data). In the meantime, FP
provides a different path, with type as a representation of a set of data and function (operation) as a way to transform data. For
example, in OO `obj` has a state `value`, and `obj.foo` might migrate the state. In FP, we just do `foo(value)`
directly. (The limitation or visibility of the operation comes from encapsulation in OO, but type matching in FP)

So what is type? Type, in short, is a set of values (data). For example, `Int8` is a built-in type in Haskell as a set of 256
numbers, starting from -128 to 127, `Char` is a set of all possible charaters, `String` is a list of `Char`. How
to represent a binary tree:

```
	  2
  /   \
1      3
```

What exactly do we need to know about the tree? Three nodes with three values, and the connections among them.

In OO, we are going to create a structure regarding the node, with a state recording the value and two links for the
connection.

```ruby
class Node
  attr_accessor :left, right

  def initialize(value)
    @value = value
    left = nil
    right = nil
  end
end

root        = Node.new(2)
root.left   = Node.new(1)
root.right  = Node.new(3)
```

To make it a tree, instead of a plie of nodes, we can create a structure like

```ruby
class BinaryTree
  attr_reader :root_node

  def initialize(root_value)
    @root_node = Node.new(root_value)
  end

  def insert(node_value)
    ...
  end
end
```

So a final representation for the binary tree in Ruby, it'll be

```ruby
bt = BinaryTree.new(2).insert(1).insert(3)
```

What about in Haskell? At first, we create a type to represent the tree like below, which basically means a binary tree
is either a leaf, or a node with a value and two nodes, which are both binary trees.


```haskell
data BinaryTree a = Leaf | Node (BinaryTree a) a (BinaryTree a)
```

To represent the tree,

```haskell
bt = Node (Node Leaf 2 Leaf) 1 (Node Leaf 3 Leaf)
```

It's done! To be honest, I was totally blown away by the second I understand how things work here. It's neat, elegant
and way over my thinking.

Cool, so how it works? Between two cases in two languages. Here is my understanding: in the perspective of a
compiler (or interpreter),

+ In Ruby, it sees a reference to a chunk of memory, which contains the necessary info about getting to know that, there
is an object, which has a state and maybe a reference to its parent, which contains operations allowed to do.
+ In Haskell, it sees a sequence of tokens, literally all the data about it. According to the types definition, it
could parse out the tokens in the right pattern, thus understand it.

![binary-tree-oo-and-haskell](https://raw.githubusercontent.com/ifyouseewendy/ifyouseewendy.github.io/source/image-repo/binary-tree-oo-and-haskell.png)

Bascially, this is a note of thinking while I was learning it. I'm still digesting and trying to find out a path to fit the FP ideas into my system of knowledge.

At last, I want to share some materials which is truly helpful to me

+ [Functional Programming For The Rest of Us - Slava Akhmechet](http://www.defmacro.org/2006/06/19/fp.html) Such a pleasant article as a beginner read, the history, the features, everything you need to know
+ [Types, and why you should care - Ron Minsky](https://youtu.be/yVuEPwNuCHw) An intro video about the pros and cons
about types
+ [Type Systems Will Make You a Better JavaScript Developer - Jared Forsyth](https://youtu.be/V1po0BT7kac) A video talking about why Facebook Flow works effectively for JS. I use it at work, but sometimes I stumble upon it and end up complaining about its stupidity. Next time, I'll watch the video again.
+ [Type Systems - Facebook Flow](https://flow.org/en/docs/lang/) I find it as a good supplyment after getting understand
the types in Haskell, maybe because it is a standalone type system?
