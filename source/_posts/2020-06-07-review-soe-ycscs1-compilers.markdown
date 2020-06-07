---
layout: post
title: "[Review] SOE-YCSCS1 Compilers"
date: 2020-06-07 11:47:14 -0400
comments: true
categories: ['Programming']
---

{:.custom}
| **Course**      | Compilers
| **Instructor**  | Alex Aiken
| **Link**        | [online.stanford.edu/courses/soe-ycscs1-compilers](https://online.stanford.edu/courses/soe-ycscs1-compilers)

* TOC
{:toc}

# Summary

**INTRO**

Interpreter is "online" and compiler is "offline"

```
Program + Data => Interpreter => Output

Program => Compiler => exec
                       exec + Data => Output
```

What a compiler does?

Five phases

```
Lexical Analysis  (input)   -> tokens
Parsing           (tokens)  -> AST
Semantic Analysis (AST)     -> IL
Optimization      (IL)      -> IL
Code Generation   (IL)      -> Machine code
```

Why are there new programming languages?

Programming training is the main dominant cost for a programming language. It's easy to start a new
language when productivity boost is over the training cost.

**LEXICAL ANALYSIS**

A LA does two things: partition the input string into lexemes, and identify the token class of each
lexeme. We need a way to specify which set of strings belongs to each token class and the usual tool
for doing that is to use Regular Language.

As a sidenote, inside of the compiler, we typically have several different Formal Languages, and
Regular Language is one of them. A Formal Language has a set of alphabet and a meaning function,
that maps syntax to semantics.

```
                  described by
Lexical Analysis -------------- Lexical Spec
                                      |
                                Formal Language
                                      |           implemented by
                                Regular Language ---------------- Regular Expression
                                                 \--------------- Finite Automata (NFA, DFA)
```

We use Regular Expression as the Lexical Specification and we use Finite
Automata as the implementation.

To define Deterministic Finite Automata: 1. no e moves; 2. for one input, there is only one
transition from a state.

A token consists of (token class, lexeme).

**PARSING**

Heuristic: why is there a Parsing stage? A Regular Language is the weakest Formal Language that's
widely used, no matter is Regular Expression, NFA, DFA, it has its limit on expressing, eg. nested
structure.

Since not all strings of tokens are programs, a parser must distinguish between valid and invalid
string of tokens. We need

* a language for describing valid string of tokens -- CFG
* a method (algorithm) for distinguishing valid from invalid string of tokens -- Parsing algorithm

Context Free Grammars (a Formal Language) is help to describe whether a string of tokens is valid. It consist of

* a set of terminals, T
* a set of non-terminals, N
* a start symbol, S, where S (- N
* a set of productions or rules

Recursive-descent Parsing (top-down): The parse tree is constructed from the top and from left to
right. Start with top-level non-terminal E, try the rules for E **in order**. Recursive-descent
parsing is a simple and general parsing strategy, which is used in GCC frontend.  To use it, left
recursion must be eliminated first.

Predictivce Parsing (top-down): In Recursive-descent parsing, at each step, there are many choices
of production to use. Therefore, we need to backtrack to undo bad choices. Predictive parsing are a
lot like Recursive-descent parsing, but it can "predict" which production to use by looking at the
next few tokens, thus there is no need to backtrace. Predictive parers accept LL(k) grammars. At
each step, there should be at most one choice of production.

* Left-to-right
* Left-most derivation
* k tokens looking ahead

Bottom-up parsing is more general than top-down parsing, but just as efficient.  Bottom-up builds on
ideas in top-down parsing and is the preferred method for most of generator tools. Bottom-up parsing
reduces a string to the start symbol by inverting productions.

**SEMANTIC ANALYSIS**

Lexical analysis detects inputs with illegal tokens; Parsing detects with ill-formed parse trees;
and Semantic Analysis, as last front-end phase, catches all remaning errors, eg

* all identifiers are declared
* reserved identifiers are not misused
* types
* inheritance relationships
* classes defined only once
* method in a class defined only once

Much of Semantic Analysis can be expressed as recursive descent of an AST:

```
before: process an AST node n
recurse: process the children of n
after: finish processing the node n
```

Identifiers. The scope of an identifier is the portion of a program in which that identifier is accesible. Scope
helps match identifier declarations with uses. There are two kinds of scopes:

* static, that the scope depends only on the program text not runtime behaviour;
* dynamic, which referes to the cloest enclosing binding in the execution of the program.

As we need to know which identifiers are defined, we introduce a data structure that tracks the current bindings of identifiers, which is Symbol Table.

Types. A set of values and a set of operations on those values. A language's type system specifies which operations are valid for which types. The goal of type checking is to enture that operations are used with the correct types. There is no types in an assembly language, therefore there are no types at the bit level in the machine code. So, type is a
virtual concept at the language level, and to type check is to enforce the intended interpretation of values.

There are a few kinds:

* static typed langs: C, Java. A lot of code is written in statically typed lang has an "escape"
  mechanism: like unsafe casts in C, Java (void pointer can be anything).
* dynamic typed langs: Lips, Ruby. A lot of dynamically typed lang rewrites their compilers with
  static lang for optimization and better debugging.
* untyped langs: machine code

Type checking. The Formal Language we use is Logic Rules of Inference, which has the form that "if
Hypothesis is true, then Conclusion is true".

```
⊢ Hypothesis .. ⊢ Hypothesis
----------------------------
         ⊢ Conclusion

⊢ means "it's provable that..."
```

Type environment. A type environment gives types for free variables/identifiers in the current scope, by free it means
the varaible is not defined.

As an example for defining Assign type checking rule:

```
O ⊢ e1: T1
O(x) = T0       [Assign]
T1 <= T0
-------------
O ⊢ x = e1: T1
```

A type environment is built inisde the Symbol Table and gets passed down the AST from root to
leaves. Types are computed up the AST from the leaves towars the root.

**RUNTIME ORGANIZATIONS**

Before we get into optimization and code generation, we need to understand what we are trying to
generate. A runtime organization controls the management of run-time resources. Particually, to
understand a compiler works, we should understand the correspondenc between static (compile-time)
and dynamic (run-time) strucutres: what is done by the compiler and what is deferred to the
generated program actually runs.

Execution of a program is initially by OS. When a program is invoked: the OS allocates space for the
program; the code is loaded into part of the space; the OS jumps to the entry point ("main").
A compiler is responsible for generating code and orchestrating code to use the data space.

```
+-------------+
|     code    | ---+
+-------------+    |
|             |    |
|     data    | <--+
|             |
+-------------+
```

Activations. An invocation of procedure P is an activation of P. The lifetime of an activation of P
is all the steps of execute P, including all the steps in procedures P calls. We can also say that
the lifetime of a varaible x is the portion of execution in which x is defined. To be noted that,
lifetime is a dynamic (run-time) concept, whereas scope is a static (compile-time) concept. Since
activations are properly nested, we can use a stack to track currently active procedures.

Activation Records. The information needed to manage one procedure activation is called an
Activation Record or Frame. If procedure F calls G, then G's activation records contains a mix of
info about F and G. Becuase G's AR should contain information to 1. complete execution of G 2.
resume execution of F.

One of many possible AR designs (which works for C)

```
+----------------+
| result         |
+----------------+
| argument       |
+----------------+
| control link   |   // who calls the current activation
+----------------+
| return address |   // where to resume execution after the current activation
+----------------+
```

The compiler must determine, at compile-time, the layout of AR and generate code
that correctly accesses location in the activation records. Thus, the AR layout and the code
generator must be designed together.

Globals cannot be stored in AR as all references to a global variable should point to
the same object. So, globals are assigned at a fixed address once, as statically allocated.
For values that outlive the procedure that creates it cannot be kept in the AR neither, like in
`method foo() { new Bar }`, that `Bar` value must survive deallocation of `foo`'s AR. So, we need to
use heap to store dynamically allocated data.

```
+-------------+ Low address
|    code     |
+-------------+
|             |
| static data | -- Globals
|             |
+-------------+
|   stack     | -- ARs
|     |       |
|     v       |
|.............|
|             |
|             |
|             |
|             |
|             |
|.............|
|     ^       |
|     |       |
|    heap     |
+-------------+ High address
```

Alignment. Data is word aligend if it begins at a word boundary. Most machines have some alignment
restrictions or performance penalties for poor alignment.

**CODE GENERATION**

Stack Machine, the simplest model for code generation. A stack machines use a stack as the only
storage. An instruction `r = F(a1,...an)` is executed as

* Pops n operands from the stack
* Computes the operation F
* Pushes result back to the stack

The invariance a stack machine maintains: After evaluating an expression e, the accumulator holds
the value of e and the stack is unchanged. This is a very important property: **Expression
evaluation preserves the stack**.

Stack machine vs Register machine. Location of the operands/result is not explicitly stated, as
which are always on the top of the stack. We consider `add` as a valid operation, instead of `add
r1, r2` in a register machine. This leads to more compact programs (space). Java bytecode uses stack
evaluation. However, a register machine is mostly preferred and generally faster (time), because we
can place the data at exactly where we want it to be, which has generally less intermediate
operations and manipulation like pushing and popping off the stack.

N-register stack machine. It's an intermediate form between pure stack machine and register machine.
Conceptually, keep the top n locations of the pure stack machine's stack in registers. A 1-register
stack machines is called the accumulator.

A code gen example

```
cgen(e1 + e2) =
  // compile time code prints out runtime code

  cgen(e1)
  print "sw $a0 0($sp)"           // push value onto stack
  print "addiu $sp $sp-4"

  cgen(e2)

  print "lw $t1 4($sp)"           // load value from stack
  print "add $a0 $t1 $a0"         // add
  print "addiu $sp $sp 4"         // pop from stack
```

A code gen example for object layout

```
+--------------+ First 3 words are headers
| Class tag    |
+--------------+
| Object size  |                   Dispatch Table
+--------------+                   +-------------------+
| Dispatch Ptr | --------------->  |    |    |    |    |
+--------------+                   +-------------------+
| Attrs        | then attributes
+--------------+
```

Given a layout for class A, a layout for subclass B can be defined by
extending the layout of A with additional slots of the addition attributes of B. So consider layout of `A3 < A2 < A1`

```
+--------------+
| Header       |
+--------------+
| A1 attrs     |
+--------------+
| A2 attrs     |
+--------------+
| A3 attrs     |
+--------------+
```

The offset for an attribute is the same in a class and all of its subclasses.

Dynamic dispatch. Every class has a fixed set of methods, including inherited methods. A dispatch
table is used to index these mtehods. It's an array of method entrypoints. A method `f` lives at a
fixed offset in the dispatch table for a class and all of its subclasses. Theorectially we can save
the table directly as we do for attributes. But attributes are states that 100 objects can each have
a different set of attributes values. Methods are static that it makes sense to share the common
table among objects.

Evaluation Semantics. In Code Generation, we need to define an evaluation rule, which is also called Semantics.

* The tokens is parsed by Regular Expressions in Lexical Analysis
* The grammar is represented by CFG in Syntactic Analysis
* The typing rule is represented by Inferenece Rule in Semantics Analysis
* The evaluation rules is represented by Semantics in Code Generation and Optimization

Operational Semantics. It describes program evaluation via execution rules on an abstract machine,
which is most useful for specifying implementations.

```
# in type checking, this means in a given context, expression e has type C
Context ⊢ e: C

# in evaluation, this means in a given context, expression e evaluates to value v
Context ⊢ e: v
```

Consider the evaluation of `y <- x + 1`, we should track variables and their values with:

* an environment: where a variable is in memory, `E = [a: l1, b: l2]`
* a store: what is in the memory, `S = [l1 -> 5, l2 -> 7]`

```
so, E, S ⊢ e: v, S'

Given
  so as the current value of self
  E as the current variable environment
  S as the current store
If the evaluation of e terminates then
  the value of e is v
  the new store is S'
```

**OPTIMIZATION**

Most complexity in modern compilers is in the optimizer. Optimization seeks to improve a program's
resoure utilization: execution time, code size and network messages sent, etc.

What should we perform optimizations on?

On Intermediate language

* pro: machine independent
* pro: expose optimization opportunities
* on AST is too high level
* On Assembly is not machine independent

Intermediate Language. A language between source and target. With more details than souce and less
than target. Intermidate language can be considered as high-level assmebly. It uses register names,
but has an unlimited number. It uses control structures as assembly language. It uses opcodes but
some are higher level, like `push` translates to several assembly instructions. Usually, we prefer
to apply optimizations over IL, instead of AST or assembly language.

What are the units of optimization?

* A basic block is a maximal sequence of instructions with no labels (except at the first instruction)
and no jumps (except in the last instruction), which makes it a single-entry, single-exit,
straight-line code segment.
* A control-flow graph is a directed graph with basic block as nodes.

What are granularities of optimizations? Like in C

1. Local optimization: apply to a basic block in isolation
2. Global optimization (it's not really global, but to function): apply to a control-flow graph in
   isolation
3. Inter-procedural optimization: apply across function boundaries.

Global optimization. There are many global dataflow analysis, but they all follow the methodology:
The analysis of a complicated program can be expressed as a combination of simple rules relating
the change in information between adjacent statements.

Register Allocation. Register Allocation is a "must have" in compilers: because intermediate code
uses too many temporaries and it makes a big difference in performance. So the optimization is about
to rewrite the intermediate code to use no more temporarie than there are machine registers.

Solution: Construct an undirected graph, that a node for each temporary, an edge between t1 and t2
if they are live simultaneously at some point in the program, which is called REGISTER INTERFERENCE
GRAPH (RIG). Two temporaries can be allocated to the same register if there is no edge connecting
them. After RIG construction, the Register Allocation algorithm is architecture independent. The
algorithm to use is called Graph coloring.

A coloring of a graph is an assignment of colors to nodes, such that nodes connected by an edge have
different colors. A graph is K-COLORABLE if it has a coloring with k colors. For Register
Aollocation, we need to assign colors (registers) to graph nodes (temporaries), and let k be the
number of machine registers. If the RIG is k-colorable then there is a register assignment that uses
no more than k registers.

Managing Cache

```
+-----------+---------------+-----------+
| Registers | 1 cycle       | 256-8000B |
| Cache     | 3 cycles      | 256K-1M   |
| Memory    | 20-100 cycles | 32M-4G    |
| Disk      | 0.5-5M cycles | 4G-1T     |
+-----------+---------------+-----------+

*cycle is the clock frequency
```

The cost of cache miss (for register) is very high, so typically it requires 2-layered cache to bridge
fast processor with large main memory.

Automatic Memory Managemen (GC)

* Advantage: it prevents serious storage bugs
* Disadvantge:
  - it reduces programmer control, like the layout of data in memory, or when is memory
    deallocated;
  - inefficient in some cases
  - pauses problematic in real-time applications
  - memory leaks possible

Mark and Sweep

* Advantage: objects are not moved during GC, works well for languages with pointers like C and C++
* Disadvantge: fragment memory

Stop and Copy

Stop and copy is generally believed to be the fastest GC technique

* Advantage: Allocation is very cheap (just increment the heap pointer). Collection is relatively
  cheap, especially if there is a lot of garbage, as it only touches reachable objects
* Disadvantge: some languages do not allow copy, like C and C++.

Reference Counting

* Advantage: easy to implement; collects garbage incrementally without large pauses in the execution
* Disadvantge: cannot collect circular structures; manipulating reference counts at each assignment is
  very slow

- - -

# 0 Intro

Interpreter is "online" and compiler is "offline"

```
Program + Data => Interpreter => Output

Program => Compiler => exec
                       exec + Data => Output
```

When John Backus tried to solve program productivity problem in 1950s, compared
to writing machine code, he tried an interpreter language first, which is called
"Speedcoding", which makes programmer happy but takes too much memory and runs
10x slower (as an interpreter lang does). After that, he developed Fortran
(Formalas Translated), which introduces a two stage development, compile and
execute. Modern compilers preserve the outline of Fortran.

0.1 What a compiler does
------------------------

Five phases

1. Lexical analysis (syntactic)
2. Parsing (syntactic)
3. Semantic analysis (types, scopes..)
4. Optimization
5. Code generation (machine code, or byte code on a VM)

Lexical analysis is to divide a program into "words" or "tokens"

```
This is a sentence.
```

Once words are understood, the next step, Parsing, is to understand sentence structure

```
This    line is   a       longer    sentence
----    ---- --   -       ------    --------
article noun verb article adjective noun
   |     /           \       |      /
   subject                object
          \               /
               sentence
```

Once sentence structure is understood, the next step, Semantic analysis, is to
try understanding the "meaning". For humans, we do lexical
analysis and parsing, but we don't know how we understand it. So, this is too
hard for compilers. **Compilers can only perform limited Semantic analysis to
catch inconsistencies.**

Eg. 1 Variable bindings

```
Jack said Jerry left his assignment at home.
                     ---
                     points to Jack or Jerry?

Jack said Jack left his assignment at home?
----      ----      ---
How many people are involved?
```

The analogy in programming language is variable bindings. Programming lang
define strict rules to avoid such ambiguities. For example, lexical scoped
language

```
{
  int Jack = 3;
  {
    int Jack = 5;
    cout << Jack;
  }
}
```

Eg. 2 Type mismatch

```
Jack left her homework at home.
          ---
```

Optimization has no strong counterpart in English, but you can think of what an
editor do. The main purpose here is to modify the program so that they use less
resource, run faster (time) and use less memory (space).

```
But a little bit like editing
    -----------------
But akin to           editing
    -------

Y=X*0 => Y=0
// only works for intergers, but not floats, as NAN * 0 = NAN
```

Code generation generally means a translation to another language, like in human
language. It usually produces assembly code.

The proportion of each phase does has changed since Fortran

```
Fortran: [    L    ] [    P    ] [S] [   O   ] [   CG   ]
Modern : [L] [P] [    S    ] [           O              ] [ CG ]
```

0.2 Economy of programming language
-----------------------------------

Q1. Why are so many programming languages?

**Application domains have distinctive/conflicting needs.**

* In scientific computing, there should be good float point numbers, good
arrays, and parallelism, like Fortran
* In bussiness applications, there should be persistence, report generation and
data analysis, like SQL
* In system programming, there should be resource management and real time
constraints, like C and C++.

Q2. Why are there new programming languages?

Claim: **Programming training is the dominant cost for a programming
language**

Prediction:

1. Widely used languages are slow to change (for education cost).
2. Easy to start a new language, when productivity boost is over the training
cost.
3. Language adopted to fill a void as tech grows with new open niche
4. New languages tend to look like old languages (think about the training cost)

Q3. What is good programming language? :shrug:

# 1 Lexical Analysis

1.1 Intro
---------

```
                             one token
String -------> LA --------> (token class, lexeme) --------> Parser

foo = 4                       (Id, "foo")
                              (Op, "=")
                              (Int, "4")
```

What are the valid token classes?

* Identifier
* Keyword
* Operator
* Whitespace, a non-empty sequence of blanks, newlines and tabs
* Numbers
* (
* )
* ;
* =

A LA does two things:

1. Partition the input string into lexemes.
2. Identify the token class of each lexeme.

Reading left-to-right and recognizing one token at a time, which requires
lookahead, to help determine the end of the current token and start of next
token.

Fun fact:
1. In FORTRAN, all whitespaces can be omitted
2. In PL/1, keywords are not reserved :P

1.2 Regular Language
--------------------

The lexical strucutre of a programming language is a set of token classes, and
each one of the token classes consists of some set of strings. We need a way to
specify which set of strings belongs to each token class and the usual tool for
doing that is to use **Regular Language**.

Usually, we use Regular Expression (the syntax) to denote Regular Languages (set
of strings).

Empty string (Epsilon)  {""}
1-char string           {"c"}
Compound
  Union                 A + B
  Concatenation         AB
  Interation            A*

The regular expressions over Σ(alphabet) are the smallest set of expressions
including:

```
// Grammar
R = e
  | 'c'
  | R +R
  | RR
  | R*
```

Example

```
Σ= {0, 1}

1*       - represents "" + 1 + 11 + 111 ...
(1 + 0)1 - represents 11, 01
(0 + 1)* - represents all possible strings, we call it Σ*
```

1.3 Formal Language
-------------------

Inside of the compiler, we typically have several different formal languages
that we are manipulating. A Regular Expression is one example.

**A Formal Language has a set of alphabet Σ**. A language over Σ is a set of
strings of characters drawn from Σ.

| Alphabet | Language |
|----------|----------|
| a-z      | English  |
| ASCII    | C        |

**A Formal Language has a meaning function L, that maps syntax to semantics**. Why
it's necessary:

* It makes clear what is syntax, what is semantics
* Allow to abstract notaion as a separate issue (1,2,10 vs I,II,X)

Generally, **meaning function L is many to one**. Syntax (expressions) and semantics
(meanings) are not 1-1, but many to one, which means there are different ways,
optimizations, to achieve the same meaning.

```
L(e) = M
L: Exp -> Set of strings

L(e)     = {""}
L('c')   = {"c"}
L(A + B) = L(A) ⋃ L(B)
L(AB)    = { ab | a ∈ (LA) , b ∈L(B) }
L(A*)    = L(A^i) for i >=0
```

Example, L in Regular Expression

```
?     = {""}
c     = {"c"}
[AB]  = L(A) ⋃ L(B)
AB    = { ab | a ∈ (LA) , b ∈L(B) }
A*    = L(A^i) for i >=0
A+    = AA*
```

1.4 Lexcial Specification
-------------------------

1. Write a rexp for the lexemes of each token class, like R1 = Number, R2 = Identifier..
2. Construct R, matching all lexemes of all tokens. R = R1 + R2 ..
3. Let input be x1..xn, for `1 <= i <= n`, check x1..xi ∈ L(R)
4. If so, then we know that x1..xi ∈ L(Rj) for some i
5. Remove x1..xi from input and go to 3.

To resolve ambiguities

* Apply "Maximal Munch" to the input, matching `==` instead of `=`.
* Choose highest priority match, (usually list the high priority one first), like putting Keyword ahead of Identifiers

To handle errors

* Better not let it happen; otherwise specify a Error to denote all strings not in the lexical spec, put it last in priority

```
Lexical Analysis -- partition input into lexemes
                 -- identify token of each lexeme

                  described by
Lexical Analysis -------------- Lexical Spec
                                      |
                                Formal Language
                                      |           implemented by
                                Regular Language ---------------- Regular Expression
                                                 \--------------- Finite Automata (NFA, DFA)
```

1.5 Finite Automata
-------------------

**We use Regular Expression as the Lexical Specification and we use Finite
Automata as the implementation.**

A finite automata consists of
* An input alphabet Σ
* A finite set of states S
* A start state n
* A set of transitions, state + input -> state
* A set of accepting states F ∈ S

For a transition s1 + input -> s2, if it's in accpeting state => accept;
otherwise => reject. Eg. terminating in a state that S not ∈ F or getting stuck
of a state that cannot be moved.

So Language of a FA is the set of accepted strings.

If we allow a transition from s1 + e -> s2, that means for one input, we
have two valid states, which ends up having two syntax mapping to one semantic.
To define **Deterministic Finite Automata**:

* No e moves
* For one input, there is only one transition from a state

NFA can have e moves. Essentially, deterministic means for one input, there is
one path through the state graph.

```
DFA: -> s1 -> s2 -> ... F
NFA: -> s1 -> s2  -> s2a
        |        \-> s2b
        e        \-> s2c
        |
        s3  -> s3a
           \-> s3b
           \-> s3c
```

As for one input, NFA might end up multiple states. We say an NFA accepts if
any one of the path finishes at an accepting state.

NFA, DFA and Regular Expression all have equivalent power for specifying Regular
Language.

* DFA are faster to execute, as there are no choices to consider. (TIME)
* NFA are in general (might be exponentially) smaller. (SPACE)

NFA TO DFA

e-closure for a state is all the states that it can reach through e move.

An NFA may be in many states at any time, but how many different states? For N
states, there would be 2**N - 1 finite set of possible states (except for the
empty set).

NFA

```
states: S
start : s ∈S
final : F
transition: a(X) = { y | x ∈X, x + a -> y }
```

to transit to DFA

```
states: subsets of S
start : e-closure(s)
final : { X | X ⋂ F != empty }
transition: X + a -> Y if Y = e-closure(a(X))
```

IMPLEMENTING DFA

A DFA can be implemented by a 2D table T
* One dimension is states
* Ohter dimension is input symbol
* For every transition Si + a -> Sk, define T[i,a] = k

```
input = "01010";
i = 0;
state = S;

while (input[i]) {
  state = T[state, input[i]];
  i++;
}
```


# 2 Parsing

2.1 Intro
---------

Heuristic: why is there a Parsing stage?

A Regular Language is the weakest Formal Language that's widely used, no matter is Regular
Expression, NFA, DFA, it has its limit on expressing, eg. nested structure.

```
()
(())
((()))

if ... then
  if ... then
    if ... then
    fi
  fi
fi
```

Parsing is the stage to help apply more analysis onto tokens.

```
  stream of characters        stream of tokens             parse tree
------------------------ LA -------------------- Parser --------------- ..
```

2.2 Context Free Grammars
-------------------------

### 2.2.1 CFG - Intro

Since not all strings of tokens are programs, a parser must distinguish between valid and invalid
string of tokens. We need

* a language for describing valid string of tokens, and
* a method (algorithm) for distinguishing valid from invalid string of tokens

Context Free Grammars is help to solve the first point, which is to answer "yes" or "no" whether a
string of tokens is valid.

Programming languages have recursive strucutres. CFG are a natural notaion for
this recursive structure.

```
EXPR -> if EXPR then EXPR els EXPR fi
      | while EXPR loop EXPR pool
      | ...
```

A CFG consists of

* a set of terminals, T
* a set of non-terminals, N
* a start symbol, S, where S (- N
* a set of productions or rules, X -> Y1...Yn, where X (- N, Yi (- T + N + {e}

`X->Y1..Yn` means you can replace X with `Y1..Yn`. This also explains that Terminal means there are
no rules to replace them.

Eg, to represent nested structure

```
S -> e
S -> (S)
```

To use CFG to present a language: Let G be a CFG with start symbol S, then the language L(G) is

```
{ a1..an | V ai (- T, S *-> a1..an }
           for all
```

You can derive from S (with the defined of productions) to `a1..an`, which are all valid string of tokens.

Usually we use `bison` to implement a CFG.

### 2.2.2 CFG - DERIVIATIONS

A derivation is a sequence of productions.

```
S -> * -> * ... -> *
```

A derivation can be drawn as a tree, Parse Tree.

* use start symbol as the root
* for a production `X -> Y1..Yn`, add children `Y1..Yn` to node `X`.

```
  X
/  | \
Y1 Y2 Y3
```

A parse tree

* has terminal at the leaves and non-terminals at the interior nodes
* an in-order traversal of the leaves is the original input
* shows the assocation of operations, the input string does not

```
Grammar: E -> E+E | E*E|| (E) | id
Input:   id * id + id
Derivation:

        E
   /    |    \
  E     +     E
/ | \         |
E *  E        id
|    |
id   id
```

A derivation defines a parse tree, but a parse tree may have many derivations.
Left-most and right-most derivations are important in parser implementations.

### 2.2.3 CFG - AMBIGUITY

A grammar is ambiguous if it has more than one parse tree for some string.
For a string of tokens: `id * id + id`, there are two parse trees can be derived with the following
grammar `E -> E+E | E*E | (E) | id`.

To fix it, we can rewrite grammar unambiguously, to enforce precedence

```
E -> E' + E | E'
E' -> id * E' | id | (E) * E' | (E)

E manage +,   as E -> E' + E -> E' + E' + E => E' + E' + .. E'
E' manage *,  as E' -> id * E' -> id * id * E' => id * id * .. id
E' manage (), as E' -> (E) * E' -> (E' + E' .. E') * E'
```

It's impossible to convert automatically. Instead of rewriting, we can also use the more natural
(ambiguous) grammar along with disambiguating declarations. Most tools allow **precedence and
associativity** declarations to disambiguate grammars.

### 2.2.4 CFG - ERROR HANDLING

A compiler not only translates the valid programms, but also detects non-valid ones.

| Erro kind   | Example          | Detected by  |
| ------------|------------------|--------------|
| Lexical     | ..$..            | Lexer        |
| Syntax      | ..x*%..          | Parser       |
| Semantic    | int x; y = x(3); | Type checker |
| Correctness | your program     | User         |

Error recorvery

* Panic mode. When an error is encountered, discard tokens until one with a clear role is found. The
synchronizing tokens are typicall the statements or expression terminators, like ;

```
// in bison, there is a special terminal error to describe how much input to skip
E -> int | E + E | (E) | error int | (error)
     ------------------  -------------------
           normal               error
```

* Error productions

Add `E -> .. | EE` to support `5x` in addition to `5 * x`

* Error correction: automatic local or global correction by try token insertions and deletions
(historially, due to the slow compilation cycle)

2.3 Abstract Syntax Tree
------------------------

Rather than working on the elaborate parse tree, we can use a more compact (abstract) one

```
-----------------
| PLUS | 5 |    |
-----------------
               |
               |--> ----------------
                    | PLUS | 2 | 3 |
                    ----------------
```

2.4 Recursive-Descent Parsing
-----------------------------

Top-down. The parse tree is constructed from the top and from left to right. Start with top-level
non-terminal E, try the rules for E **in order**.

Let's take an example:

```
E -> T | T + E
T -> int | int * T | (E)
```

We should define a few helper funcsionts along with a `next` pointer pointing to the next input token.

```
term(tok: TOKEN) -> bool { return *next++ == tok } // check a token is terminal
Sn() -> bool                                       // check the nth production of S
S() -> bool                                        // check all productions of S
```

So

```
E -> T              E1() -> bool { T() }
E -> T + E          E2() -> bool { T() && term(PLUS) && E() }
                    E()  -> bool {  save = next;
                                    (next = save, E1()) ||
                                    (next = save, E2()) }

T -> int            T1() -> bool { term(INT) }
T -> int * T        T2() -> bool { term(INT) && term(TIMES) && T() }
T -> ( E )          T3() -> bool { term(LEFT) && E() && term(RIGHT) }
                    T()  -> bool {  save = next;
                                    (next = save, T1()) ||
                                    (next = save, T2()) ||
                                    (next = save, T3()) }
```

LIMITATIONS

If a production for non-terminal X succeeds, there is no way to backtract and try a different
production for X later. like matching against `int * int`, our program would stop after parsing the
first `int`. A general RD algorithm should support such "full" backtracking. We can also rewrite our
grammar to make it work without backtracking, by rewriting to eliminate left recursion.


LEFT RECURSION

Considering a production S -> Sa, there will be a loop

```
S1() -> bool { return S() && term(a) }
S()  -> bool { return S1() }
```

A left-recursive grammar has a non-terminal S, where S -> Sa for some a. Recursive-descent doesn't
work with in such cases. Generally, given a left-resurive gramar with Recursive-descent algorithm,
it runs into a loop.

```
S -> Sa | b

=>
S -> Sa -> Saa -> Saaa -> ... -> baaaaa
```

But, we can rewrite it using right-recursion.

```
S -> bS'
S' -> aS' | e

=>
S -> bS' -> baS' -> baaS' -> ... -> baaaaa
```

To make it more general


```
S -> Sa1 | Sa2 .. San | b1 | b2 .. bm
```

can be rewritten as

```
S -> b1S' | b2S' .. bmS'
S' => a1S' | a2S' .. anS' | e
```

SUMMARY

Recursive-descent parsing is a simple and general parsing strategy, which is used in GCC frontend.
To use it, left recursion must be eliminated first.

2.5 Predictive Parsing
----------------------

> deterministic top-down parsing

In Recursive-descent parsing, at each step, there are many choices of production to use. Therefore,
we need to backtrack to undo bad choices. Predictive parsing are a lot like Recursive-descent
parsing, but it can "predict" which production to use by looking at the next few tokens, thus there
is no need to backtrace.

Predictive parers accept LL(k) grammars. At each step, there should be at most one choice of
production.

* Left-to-right
* Left-most derivation
* k tokens looking ahead

Eg. in Recursive-descent parsing, we have the grammar

```
E -> T + E | T
T -> int | int * T | (E)
```

In Predictive parsing, we should left-factor the grammar to make it LL(k) grammar:

```
E -> TX
X -> + E | e

T -> intY | (E)
Y -> * T | e
```

How to apply the Recursive-descent parsing?

Once we have the LL(1) grammar, we should build a LL(1) parsing table: the row is left-most
non-terminals, and the column is the next input token, content is the production rule to use, and
empty content is the error state.

```
+---+------+----+----+----+-----+---+
| _ | int  | *  | +  | (  |  )  | $ |
+---+------+----+----+----+-----+---+
| E | TX   |    |    | TX |     |   |
| X |      |    | +E |    | e   | e |
| T | intY |    |    |    | (E) |   |
| Y |      | *T | e  |    | e   | e |
+---+------+----+----+----+-----+---+
```

The algorithm maintains a stock records frontier of parse tree. Top of the stack is the left-most
pending terminal or non-terminal. It accpets on end of input $ & empty stack. It rejects on reaching
error state.

```
initialize stack = <S $> and next
repeat
  case stack of
    <X, rest> : if T[X, *next] = Y1...Yn
                then stack = <Y1...yn rest>;
                else error();
    <t, rest> : if t == *next ++
                then stack = <rest>;
                else error();
until stack == <>
```

How to build build LL(1) parsing table?

Consider non-terminal A, and production A -> a & token t, there are two valid cases for T[A,t] = a:

1. If a ->* tb, which means a can derive t in the first position, we say t ∈First(a), t belongs to
   the First Set of a.
2. Else if A -> a and a ->* e and S ->* _At_, which means A cannot derive t, but t follows up A in
   at least one derivation, we say t ∈Follow(A).

First Set

```
First(X) = { t | X ->* ta } ⋃ { e | X ->* e }
```

Follow Set

```
Follow(X) = { t | S ->* _Xt_ }
```

To construct a parsing table T for CFG G, for each production A -> a in G do:

```
For each terminal t ∈ First(a) do T[A, t] = a
if e ∈First(a), foreach t ∈Follow(A) do T[A, t] = a
```

If in the table, any entry is multiply defined, then G is not LL(1), eg. G is not left factored,
left recursive, or ambiguous.

2.6 Bottom-up Parsing
---------------------

Bottom-up parsing is more general than (deterministic) top-down parsing, but just as efficient.
Bottom-up builds on ideas in top-down parsing and is the preferred method for most of generator
tools. Bottom-up parsers don't need left-factored grammar.

```
E -> T + E | T
T -> int * T | int | (E)
```

Bottom-up parsing reduces a string to the start symbol by inverting productions.

```
                           input string

int * int + int              ^    |
int * T   + int              |    |
T         + int  production  |    |  reduction
T         + T                |    |
T         + E                |    |
E                            |    v

                           start symbol
```

Important Fact #1 about Bottom-up parsing: A bottom-up parser traces a rightmost derivation in
reverse.

This has an interesting implication: let αβω be a step of a bottom-up parse, assume the next
reduction is by X -> β, then ω must be a string of terminals

### SHIFT & REDUCE

First, we need a marker and the left handside is called left string and right side is right string.

Bottom-up parsing uses only two kinds of actions:

- Shift: Move | one place to the right `ABC|xyz => ABCx|yz`
- Reduce: Apply an inverse production at the right end of the left string

```
If A -> xy is a production, then Cbxy|ijk => CbA|ijk
```

Left string can be implemented by a stack. Shift move pushes a terminal onto the stack. Reduce move
pops symbols off of the stack (production rhs) and pushes a non-terminal back to the stack
(production lhs).


### HANDLES

> How do we decide when to shift or reduce?

Bottom-up parsing algorithms are based on recognizing handles.

We should reduce only if the result can still be reduced to the start stymbol. Assume a rightmost
derivation, `S ->* aXw -> abw`, then `ab` is a handle of `abw`.

Important Fact #2 about Bottom-up parsing: In shift-reduce parsing, handles appear only at the top
of the stack, never inside.

```
stack|input

(E|)
```

In terms of recognizing handles, there are no efficent algorithms, but there are heuristic guessing
always correct for some CFGS.

```
All CFGs
  Unambiguous CFGs
    LR(k) CFGs
      LALR(k) CFGs
        SLR(k) CFGs
```

`a` is a **viable prefix** if there is an `w` such that `a|w` is a state of shift-reduce parser.

Important fact #3 about Bottom-up parsing: For any grammar, the set of viable prefixs is a regular
language (can be recognized by a FA).

To recognize viable prefixes: we must

* recognize a sequence of partial rhs's of productions, where
* each partial rhs can eventually reduce to part of the missing suffix of its predecessor

I DON'T QUITE FOLLOW THIS PART IN DETAILS, HERE IS THE ROADMAP

* handles
* items
* valid prefix
* recognize valid prefix
* valid items

# 3 Semantic Analysis

Lexical analysis detects inputs with illegal tokens; Parsing detects with ill-formed parse trees;
and Semantic Analysis, as last front-end phase, catches all remaning errors, eg

* all identifiers are declared
* types
* inheritance relationships
* classes defined only once
* method in a class defined only once
* reserved identifiers are not misused

Much of Semantic Analysis can be expressed as recursive descent of an AST:

```
before: process an AST node n
recurse: process the children of n
after: finish processing the node n

Eg. let x: Int <- 0 in e
before: add the definition of x to current definitions, overriding any other definition of x
recurse: recurse processing children of e
after: remove definition of x and restore the old definition of x
```

3.1 Identifiers
---------------

### SCOPE

The scope of an identifier is the portion of a program in which that identifier is accesible. Scope
helps match identifier declarations with uses. There are two kinds of scopes:

* most languages use static scope, which means scope depends only on the program text, not runitme behaviour;
* a few languages are dynamically scoped, like LISP. A dynamically-scoped variable refers to the closest
enclosing binding in the execution of the program.

```
f(x) = a + 1

let a = 4 in {
  f(x)
}
```

Static scopes in Cool lang is introduced by:

* class declarations
* method definitions
* attribute definitions
* let expression
* case expressions
* formal parameters

### SYMBOL TABLES

When performing Semantic Analysis on a portion of the program, we need to know which identifiers are
defined. Therefore we introduce a data structure that tracks the current bindings of identifiers,
which is Symbol Table.

For its recursive nature, we can use stack to represent nested scopes and a set to represent Symbol
Table in each scope

```
enter_scope()  - start a new nested scope
find_symbol(x) - find x (or null) in current scope
add_symbol(x)  - add symbol x to the table
check_scope(x) - true if x defined in current scope
exit_scope()   - exit current scope

scope: x, y
  scope: x, y, z
                       -- enter_scope(), add_symbol(a)
    scope: x, y, z, a
                       -- exit_scope()
```

There are cases, like Class names, that can be used before being defined. We cannot check class
names using Symbol Table or in one pass. We can gather all class names first and do the checking.
Therefore, Semantic Analysis requires multiple passes.

3.2 Types
-----------

What is a type? The notion varies from language to language. But a consensus is: a set of values and
a set of operations on those values. Classes are one instantiation of the modern notion of type,
like in OO.

A language's type system specifies which operations are valid for which types. The goal of type
checking is to enture that operations are used with the correct types. There is no types in an
assembly language, therefore there are no types at the bit level in the machine code. So, type is a
virtual concept at the language level, and to type check is to enforce the intended interpretation of values.

There are a few kinds:

* static typed langs: C, Java. A lot of code is written in statically typed lang has an "escape"
                      mechanism: like unsafe casts in C, Java (void pointer can be anything).
* dynamic typed langs: Lips, Ruby. A lot of dynamically typed lang rewrites their compilers with
                      static lang for optimization and better debugging.
* untyped langs: machine code

### 3.2.1 TYPE CHECKING

When type checking, the compiler basically infers types for every expression, to make sure it's used
with the correct type.

We've seen two forma notations specifying parts of a compiler: Regular Expression and Context-Free
Grammars. The formalism for type check is **logic rules of inference**, which has the form that "if
Hypothesis is true, then Conclusion is true." By tradition, inference rules are written as

```
⊢ Hypothesis .. ⊢ Hypothesis
----------------------------
         ⊢ Conclusion

⊢ means "it's provable that..."
```

If there is no Hypothesis required, we can consider it as an axiom

```
----------------------------
         ⊢ Axiom

--------
⊢ 1: Int
```

As an example, the inference rule for Int plus operation is

```
⊢ e1: Int ⊢ e2: Int
-------------------
  ⊢ e1+e2: Int
```

A type system is sound if whenever `⊢ e: T`, then `e` evaluates to a value of type `T`. So, type
checking proves the fact of `e: T` on the strucuture of the AST, which then maintains the shape of
AST. There is one type rule used for each AST node and in a type rule of node `e`: Hypotheses are the proofs of
types of `e'`s subexpression and conclustion is the type of `e`. So, types are computed in a
bottom-up pass over the AST.

```
   +                    ⊢ 1: Int ⊢ 2: Int
 /   \                  -----------------
1      2                    ⊢ 1+2: Int
```

### 3.2.2 TYPE ENVIRONMENT

Heuristic: for a literal `1 is an Int`, we know that `⊢ 1: Int`; but for a variable `x` how could we
know it type.

A type environment gives types for free variables/identifiers in the current scope, by free it means
the varaible is not defined. So, we can consider a type environment is a function from identifiers
to types.

```
x                       // x is free
x + y                   // x, y is free
let y = 1 in { x + y }  // x is free, y is bound
```

With the type environment, we can refine our Conclusion branch in inference rules: `O ⊢ e: T`, under
the assumption that free variables have the types given by `O`, it's provable that the expression
`e` has type `T.`

```
O(x) = T
--------    [Var]
O ⊢ x: T
```

To make it more scoped, we can introduce another notation `O[T/x]`, which means `x` is of type `T`
in `O`


```
   O[T/x] ⊢ e: T
--------------------      [Let]
O ⊢ let x: T in e: T
```

A type environment is built inisde the Symbol Table and gets passed down the AST from root to
leaves. Types are computed up the AST from the leaves towars the root.


### 3.2.3 SUBTYPE, METHODS and IMPLEMENTATION

SUBTYPE

Let's look at the `[Assign]` inference rule

```
O ⊢ e1: T1
O(x) = T0       [Assign]
T1 <= T0
-------------
O ⊢ x = e1: T1
```

What about `[if-then-else]`? It should be the smallest supertype larger than each branch. We
introduce `lub(X,Y)`, the least upper bound of X and Y. In an OO language, `lub` of two types is the
least common ancestor in the inheritance tree.

```
O ⊢ e0: Bool
O ⊢ e1: T1
O ⊢ e2: T2
-----------------------------------------
O ⊢ if e0 then e1 else e2 fi: lub(T1, T2)
```

METHODS

In the example language COOL, method and object identifiers in different name spaces, that a method
`foo` and an object `foo` can coexist in the same scope. This is reflected by a separate mapping `M`
for method signatures, which we call the method environment. In most cases, `M` is passed down the
AST and only gets used in `Dispatch` rules.

```
M(C, f) = (T1, T2, ... Tn, Tn+1)

// The method signature of f in class C

f(x1: T1, x2: T2 ... xn: Tn): Tn+1
```

Therefore a method is type checking by

```
O, M ⊢ e0: T0                          [Dispatch]
M(T0, f) = (T1', T2', ... Tn', Tn+1)

O, M ⊢ e1: T1
...
O, M ⊢ en: Tn

Ti <= Ti' for 1 <= i <= n
-----------------------------------
O, M ⊢ e0.f(e1, ..., en): Tn+1
```

For a static dispatch, we require users to use `e0@T` explicitly

```
O, M ⊢ e0: T0                          [Static-dispatch]
M(T0, f) = (T1', T2', ... Tn', Tn+1)
T0 <= T

O, M ⊢ e1: T1
...
O, M ⊢ en: Tn

Ti <= Ti' for 1 <= i <= n
-----------------------------------
O, M ⊢ e0@T.f(e1, ..., en): Tn+1
```

SELF_TYPE

For a language supports self type, we need to know that which class the expression appears in. So
the full type environment for COOL is

* A mapping `O` gives types to object identifiers
* A mapping `M` gives types to method identifiers
* The current class `C`

IMPLEMENTING

COOL type checking can be implemented in a single traversal of the AST, that type environment is
pass down and types are passed up.

Let'et take `[Let-init]` as an example. Inference rule is the defined as

```
O,M,C ⊢ e0: T0
O[T/x], M, C ⊢ e1: T1
T0 <= T
-------------------------------
O,M,C ⊢ let x: T = e0 in e1: T1
```

The implementation would be

```
TypeCheck(Environment, let x: T = e0 in e1) = {
    T0 = TypeCheck(Environment, e0);
    T1 = TypeCheck(Environment.add(x: T), e1);
    Check subtype(T0, T);
    return T1;
}
```

### 3.2.4 STATIC VS. DYNAMIC

```

class A { .. }
class B inherits A { .. }
class Main {
  x: A = new A;           // static type of x is A, dynamic type of x is A
  x = new B;              // dynamic type of x is B now
}
```

In COOL, `dynamic_type(E) <= static_type(E)`

### 3.2.5 SELF_TYPE

```
class Count {
  i: int = 0;
  inc(): Count {
    i = i + 1;
    self;
  }
}

class Stock inherits Count {
  name: String;
}

class Main {
  Stock a = (new Stock).inc(); // Type error, as we are assigning Count to Stock
}
```

So, we should extend the type system with SELF_TYPE, which allows the return type of `inc` to change
whne `inc` is inherited.

```
class Count {
  i: int = 0;
  inc(): SELF_TYPE {
    i = i + 1;
    self;
  }
}
```

# 4 Runtime Organizations

Before we get into optimization and code generation, we need to understand what we are trying to
generate. A runtime organization controls the management of run-time resources. Particually, to
understand a compiler works, we should understand the correspondenc between static (compile-time)
and dynamic (run-time) strucutres: what is done by the compiler and what is deferred to the
generated program actually runs.

Execution of a program is initially by OS. When a program is invoked: the OS allocates space for the
program; the code is loaded into part of the space; the OS jumps to the entry point ("main").

In terms of space (memroy), traditionally it's like this. A compiler is responsible for generating
code and orchestrating code to use the data space.

```
+-------------+
|     code    | ---+
+-------------+    |
|             |    |
|     data    | <--+
|             |
+-------------+
```

4.1 Activations
---------------

There are two goals for code generation: correctness and speed. To talk about that, we need to talk
about activations.

An invocation of procedure P is an activation of P. The lifetime of an activation of P is all the
steps of execute P, including all the steps in procedures P calls. We can also say that the lifetime
of a varaible x is the portion of execution in which x is defined. To be noted that, lifetime is a
dynamic (run-time) concept, whereas scope is a static (compile-time) concept.

Given, when P calls Q, then Q returns before P returns, activation lifetimes can be depicted as a
activation tree. The activation tree depends on run-time behaviour and may be different for every
program input.

```
class Main {
  g(): Int { 1 };
  f(): Int { 2 };
  main() { g(); f(); }
}

  main
  /  \
g     f

class Main {
  g(): Int { 1 };
  f(x: Int): Int { if x == 0 then g() else f(x-1) };

  main(): Int {
    f(3)
  }
}

main
  |
  f(3)
  |
  f(2)
  |
  f(1)
  |
  f(0)
  |
  g
```

**Since activations are properly nested, we can use a stack to track currently active procedures.**

```
+-------------+
|     code    |
+-------------+
|     stack   | ------------+
|       |     |             |
|       v     |            main
|             |             |
+-------------+             f(3)
                            |
                            ..
                            |
                            g
```

4.2 Activation Records
----------------------

So what information we should keep for activations? The information needed to manage one procedure
activation is called an Activation Record or Frame.

If procedure F calls G, then G's activation records contains a mix of info about F and G. Becuase
G's AR should contain information to 1. complete execution of G 2. resume execution of F.

This is one of many possible AR designs (which works for C)

```
+----------------+
| result         |
+----------------+
| argument       |
+----------------+
| control link   |   // who calls the current activation
+----------------+
| return address |   // where to resume execution after the current activation
+----------------+
```

Let's review this example again:

```
class Main {
  g(): Int { 1 };
  f(x: Int): Int { if x == 0 then g() else f(x-1) (**) };

  main(): Int {
    f(3); (*)
  }
}

+----------------+ <-+              main
| Main AR        |   |                |
+----------------+   |                |
                     |                |
+----------------+ <-|---+           f(3)
| result         |   |   |            |
+----------------+   |   |            |
| argument: 3    |   |   |            |
+----------------+   |   |            |
| control link   | --+   |            |
+----------------+       |            |
| return (*)     |       |            |
+----------------+       |            |
                         |            |
+----------------+       |           f(2)
| result         |       |            |
+----------------+       |            |
| argument: 2    |       |            |
+----------------+       |
| control link   | ------+
+----------------+
| return (**)    |
+----------------+
```

The compiler must determine, at compile-time, the layout of AR and generate code
that correctly accesses location in the activation records. Thus, **the AR layout and the code
generator must be designed together.**

4.3 Global && Heaps
-------------------

Globals cannot be stored in AR as all references to a global variable should point to
the same object. So, globals are assigned at a fixed address once, as statically allocated.

For values that outlive the procedure that creates it cannot be kept in the AR neither, like in
`method foo() { new Bar }`, that `Bar` value must survive deallocation of `foo`'s AR. So, we need to
use heap to store dynamically allocated data.

```
+-------------+ Low address
|    code     |
+-------------+
|             |
| static data |
|             |
+-------------+
|   stack     |
|     |       |
|     v       |
|.............|
|             |
|             |
|             |
|             |
|             |
|.............|
|     ^       |
|     |       |
|    heap     |
+-------------+ High address
```

4.4 Alignment
-------------

> This is a very low level but important detail of machine architecture.

Most modern machines are 32 or 64 bit: 8 bits in a byte, and 4 or 8 bytes in a **word**. Machines are
either byte or word addressable.

Data is **word aligend** if it begins at a word boundary. Most machines have some alignment
restrictions or performance penalties for poor alignment.

# 5 Code Generation

5.1 Stack Machines
------------------

> the simplest model for code generation

A stack machines use a stack as the only storage. An instruction `r = F(a1,...an)` is executed as

* Pops n operands from the stack
* Computes the operation F
* Pushes result back to the stack

```
5 + 7

push(5) - push 5 on the stack
push(7) - push 7 on the stack
add     - pop, add and push 12 on the stack
```

### 5.1.1 Stack machine vs Register machine

What's the benefit of using a stack machine?

Location of the operands/result is not explicitly stated, as which are always on the top of the
stack. We consider `add` as a valid operation, instead of `add r1, r2` in a register machine. This
leads to more compact programs (space). Java bytecode uses stack evaluation.

However, a register machine is mostly preferred and generally faster (time), because we can place
the data at exactly where we want it to be, which has generally less intermediate operations and
manipulation like pushing and popping off the stack.

### 5.1.2 n-register stack machine

It's an intermediate form between pure stack machine and register machine. Conceptually, keep the
top n locations of the pure stack machine's stack in registers. A 1-register stack machines is
called the accumulator.

In a pure stack machine, an `add` does 3 memory operations, with two reads and one write to the
stack. In a 1-register stack machine, `add` does one read as `acc <- acc + top_of_stack`.

In a general form, for expression `op(e1,..en)` (each `e` is an subexpression)

* for each `ei`
  compute `ei`
  store the result in `acc`
  push result on the stack
* Pop n-1 values from the stack, compute `op`
* Store result in `acc`

The invariance a stack machine maintains: After evaluating an expression e, the accumulator holds
the value of e and the stack is unchanged. This is a very important property: **Expression
evaluation preserves the stack**.

5.2 Intro
---------

We'll focus on generating code for a stack machine with accumulator. We simulate stack machines
instrinstructions using MIPS instructions and registers. MIPS architecture is prototypical RISC.
Most operations use registers sfor operands & results, use load&store instructions to use values in
memory. There 32 general purpose registers (32 bits each), we'll use `$a0 $sp $t1`.

```
Stack Machine                       MIPS

accumulator                         $a0 register
stack                               memory
  the next location on the stack    $sp
  the top of stack                  $sp + 4 (stack grows towards lower addresses)
```

MIPS instruction list

```
# register - memory
lw reg1 offset(reg2)    load a 32-bit word from reg2+offset into reg1
sw reg1 offset(reg2)    store a 32-bit word in reg1 at address reg2+offset

# register - immediate value
li reg imm              eg. li reg 4

# register - add operation
add reg1 reg2 reg3
addiu reg1 reg2 imm
```

5.3 Code Gen
------------

Let's define a simple language with integers and integer operations

```
P -> D; P | D

D -> def id(ARGS) = E;
ARGS -> id, ARGS | id

E -> int | id | if E1 = E2 then E3 else E4
      | E1 + E2 | E1 - E2 | id(E1,...En)
```

For each expression `e` we generate MIPS code that
* Computes the value of `e` in `$a0`
* Preserves `$sp` and the contents of the stack

```
cgen(e1 + e2) =
  // compile time code prints out runtime code

  cgen(e1)
  print "sw $a0 0($sp)"           // push value onto stack
  print "addiu $sp $sp-4"

  cgen(e2)

  print "lw $t1 4($sp)"           // load value from stack
  print "add $a0 $t1 $a0"         // add
  print "addiu $sp $sp 4"         // pop from stack
```

How about code gen for functions?

Code for function calls and function definitions depend on the layout of the AR. A very simple AR
suffices for COOL lang:

* The result is always in the accumulator (no need to store in the AR)
* The AR holds actual parameters. For `f(x1,..xn)` push `xn,..x1` on the stack
* The stack discipline guarantees that on function exit `$sp` is the same as it was on function
entry (no need for a control link)
* We need the return address
* A pointer to the current activation is useful. This pointer lives in register `$fp` (frame pointer)

For AR, the caller's frame pointer, the actual parameters and the return address suffices.

A call to `f(x, y)` the AR is

```
+-------------+
| old fp      |
+-------------+
| y           |
+-------------+
| x           |
+-------------+
| return addr |
+-------------+
```

The calling sequene is the instructions (of both caller and callee) to set up a function invocation.

The caller
  * saves its value of the frame pointer
  * then it saves the actual parameters in reverse order
  * finally the caller saves the return address in register $ra
  * The AR so far is 4*n + 4 bytes long
The callee
  * pops the return address, the actual arguments and restores the caller's frame pointer

Summary:

* The AR must be designed together with the code generator
* Code generation can be done by recursive traversal of the AST
* Production compilers do different things:
  - Emphasis on keeping values in registers
  - Intermediate results (temporaries) are laid out in the AR, not pushed and poped from the stack

How about temporaries?

A rule of thumb is to keep temporaries in AR. So, code generation must know how many temporaries are
in use at each point, which can be done by looking at the AST.

```
+-------------+
| old fp      |
+-------------+
| xn          |
+-------------+
| ..          |
+-------------+
| x1          |
+-------------+
| return addr |
+-------------+
| temp 1      |
+-------------+
| temp 2      |
+-------------+
```

5.4 Code Gen - Object Layout
----------------------------

OO Slogan: If B is a subclass of A, then an object of class B can be used wherever an object of
class A is expected. This means that code in class A has to work unmodified for object of class B,
at compile time.

Q. How are objects represented in memory?

Objects are laid out in contiguous memory. Each attributes stored at a fixed offset in the object.
WHen a method is invoed, `self` points to the  whole object.

The layout for Cool objects

```
+--------------+ First 3 words are headers
| Class tag    |
+--------------+
| Object size  |
+--------------+
| Dispatch Ptr |
+--------------+ then attributes
| attr 1       |
+--------------+
| attr 2       |
+--------------+
| ...          |
+--------------+
```

Based on the observation: **Given a layout for class A, a layout for subclass B can be defined by
extending the layout of A with additional slots of the addition attributes of B**. So consider layout
of `A3 < A2 < A1`

```
+--------------+
| Header       |
+--------------+
| A1 attrs     |
+--------------+
| A2 attrs     |
+--------------+
| A3 attrs     |
+--------------+
```

The offset for an attribute is the same in a class and all of its subclasses.

Q. How is dynamic dispatch implemented?

Every class has a fixed set of methods, including inherited methods. A dispatch table is used to
index these mtehods. It's an array of method entrypoints. A method `f` lives at a fixed offset in
the dispatch table for a class and all of its subclasses.

```
A { f() }
B < A { g() }
C < A { f(); h() }
```

The dispatch table would be: tables for B and C extend table for A to the right, and because methods
can be overriden, the method of f is not the same in every class, but is always at the same offset.

```
+--------+----+---+
| offset | 0  | 4 |
+--------+----+---+
| A      | FA |   |
| B      | FA | g |
| C      | FC | h |
+--------+----+---+
```

So back to the dispatch pointer, the dispatch pointer in an object of class X points to the dispatch
table for class X:

```
+--------------+
| Class tag    |
+--------------+
| Object size  |     Dispatch Table
+--------------+     +-------------------+
| Dispatch Ptr | --> |    |    |    |    |
+--------------+     +-------------------+
| Attrs        |
+--------------+
```

Every method `f` of `X` is assigned an offset `Of` in the dispatch table at compile time. That's why
we maintain the offset when extending dispatch table.

Theorectially we can save the table directly as we do for attributes. But attributes are
states that 100 objects can each have a different set of attributes values. Methods are static that
it makes sense to share the common table among objects.

5.5 Evaluation Semantics
------------------------

> runtime semantics, compared to compile-time Semantic Analysis

```
LA - SA - Semantic Analysis - Code Generation
                                     |
              +---               bytecode                ---+
              |                      |                      |
              |              +---------------+              |
        Execution            | Stack Machine |    Evaluation Semantics
              |              +---------------+              |
              |                      |                      |
              +---             machine code              ---+

```

In Code Generation, we need to define an evaluation rule, which is also called Semantics.

Let's look back the definition of a programming language:
* The tokens is parsed by Regular Expressions in Lexical Analysis
* The grammar is represented by CFG in Syntactic Analysis
* The typing rule is represented by Inferenece Rule in Semantics Analysis
* The evaluation rules is represented by Semantics in Code Generation and Optimization

We have specified evaluation rules indirectly by
* the compilation of Cool program to a stack machine bytecode; and
* the evaluation rules of the stack machine, which translates bytecode to some assembly program

This is a complete description of evaluation rules, but it's not good enough, as assembly-language
descriptions of language implementations have irrelevant details, that we don't want it become the
only way to execute our program.

* whether to use a stack machine or not
* which way the stack grows
* how integers are represented
* the particular instruction set of the architecture

Therefore, we'd love to have a complete description, but not an overly restrictive specification.

There are many ways to specify semantics:

* Operational semantics: it describes program evaluation via execution rules on an abstract machine,
which is most useful for specifying implementations.
* Denotation semantics: program's meaning is mapping to a mathematical function
* Axiomatic semantics: program's behaviour is described via logical formalae. It's the foundation of
many program verification systems.

5.6 Operational Semantics
-------------------------

We should introduce a formal notation, which is Logical rules of inference as in type checking.

```
# in type checking, this means in a given context, expression e has type C
Context ⊢ e: C

# in evaluation, this means in a given context, expression e evaluates to value v
Context ⊢ e: v
```

Consider the evaluation of `y <- x + 1`, we should track variables and their values with:

* an environment: where a variable is in memory
* a store: what is in the memory

```
  environment          store
     |                   |
var ---> memory address ---> value
```

A variable environment maps variables to locations, that keeps track of which variables are in scope
and tells us where those variables are

```
E = [a: l1, b: l2]
```

A store maps memory locations to values

```
S = [l1 -> 5, l2 -> 7]

S' = S[12/l1] defines a new store S' which has a substitution of l1 to 12
```

Cool values are objects, which define `X(a1 = l1, ..., an = ln)` as a Cool object where `X` is the
class name, `ai` are the attributes (including the inherited ones) and `li` the location where the
value of `ai` is stored.

There are a few special cases (classes withouth attributes)
* `Int(5)`
* `Bool(true)`
* `String(4, "abcd")`
* `void` of type Object and usually use `NULL` as the concrete implementation

The evaluation judgement is

```
so, E, S ⊢ e: v, S'

Given
  so as the current value of self
  E as the current variable environment
  S as the current store
If the evaluation of e terminates then
  the value of e is v
  the new store is S'
```

Therefore, the result of an evaluation is a value and a new store, where new store models the
side-effects.

Examples

```
  E(id) = lid
  S(lid) = v
-------------------
so, E, S ⊢ id: v, S
```

5.7 Intermediate language
-------------------------

A language between source and target. With more details than souce and less than target.

Intermidate language can be considered as high-level assmebly. It uses register names, but has an
unlimited number. It uses control structures as assembly language. It uses opcodes but some are
higher level, like `push` translates to several assembly instructions.

Usually, we prefer to apply optimizations over IL, instead of AST or assembly language.

# 6 Optimization

6.1 Intro
---------

Most complexity in modern compilers is in the optimizer. Optimization seeks to improve a program's
resoure utilization: execution time, code size and network messages sent, etc. In practice, not all
fancy optimizations known are implemented, given the difficulty to implement, the cost in
compilation and low payoff. So, the goal of optimization should be to get maximum benefit with
minimum cost.

Q. What should we perform optimizations?

On AST (after Semantic Analysis)
* pro: machine independent
* con: too high level

On Assembly language (after code gen)
* pro: expose optimization opportunities
* con: machine independent
* con: must reimplement optimizations when re-targeting

On Intermediate language
* pro: machine independent
* pro: expose optimization opportunities

Q. What are the units of optimization?

A basic block is a maximal sequence of instructions with no labels (except at the first instruction)
and no jumps (except in the last instruction), which makes it a single-entry, single-exit,
straight-line code segment.

For example, within this basic block, given 3 executes only after 2, we can change 3 to be `w := 3*x`

```
1. L:
2.  t := 2*x
3.  w := t + x
4.  if w > 0 goto L
```

A control-flow graph is a directed graph with basic block as nodes. Between the nodes, there can be
an edge from block A to block B if the execution can pass from the last instruction in A to the
first instruction in B. Usually, the body of a function can be represented as a control-flow graph.

Q. What are granularities of optimizations? Like in C

1. Local optimization: apply to a basic block in isolation
2. Global optimization (it's not really global, but to function): apply to a control-flow graph in
   isolation
3. Inter-procedural optimization: apply across function boundaries.

Most compilers do 1, many do 2 and few do 3.

6.2 Local Optimization
----------------------

Each local optimization does little by itself, given the scope of basic block. But optimizations
typically interfact, comiplers repeat optimizations until no improvement is possible.

ALGEBRAIC OPTIMIZATION

```
x = x * 0   => x = 0
y = y ** 2  => y = y*y
x = x * 8   => x = x << 3
```

CONSTANT FOLDING, that operations on constants can be computed at compile time. This can be
dangerous when compiler and gen code are running on different archs, eg. how float is represented.

```
x = 2 + 2 => x = 4
```

ELIMINIATE UNREACHABLE BASIC BLOCKS

```
#define DEBUG 0
if DEBUG {
}
```

Some optimizations are simplified if each register occurs only once on the left-hand side of an
assignment. We can rewrite intermediate code in **SINGLE ASSIGNMENT FORM**.

```
x := z + y   =>   b := z + y
a := x            a := b
x := 2 * x        x := 2 * b
```

COMMON SUB-EXPRESSION ELIMINATION

If basic block is in single assignment form, and a definition `x:=` is the first use of `x` in a
block, then when two assignments have the same rhs, they compute the same value.

```
x := y + z                    =>  x := y + z
... // this won't change x
w := y + z                        w := x
```

COPY PROPAGATION, which assumes single assignment form

```
b := z + y  =>  b := z + y
a := b          a := b
x := 2 * a      x := 2 * b
```

DEAD CODE ELIMINATION, which assumes single assignement form

if `w := rhs` appears in a basic block, `w` does not appear anywhere else in the program. then `w`
is dead in the sense of not contributing to the program's result that can be eliminated.

```
x := z + y  =>  b := z + y  =>  b := z + y
a := x          a := b
x := 2 * b      x := 2 * b      x := 2 * b
```

PEEPHOLE OPTIMIZATION

It's a variation of local optimization, which directly applies on assemly code. The peephole is a
short sequenve of (usually contiguous) instructions. The optimizer replaces the sequenve with
another equivalent one (but faster).

```
// move from b to a
move $a $b, move $b $a -> move $a $b

addiu $a $a i, addiu $a $a j -> addiu $a $a i+j
```

This implies that many simple optimizations can still be applied on assembly language. "Program
optimization" is grossly misnamed, that code produced by "optimizers" is not optimal in any
reasonable sense. "Program improvement" is a more appropriate term.


6.3 Global Optimization
-----------------------

### 6.3.1 Dataflow analysis

Before we get understand some global optimization technique, like global constant propagation, we
need to know the dataflow analysis.

Can we propagate constant `X := 3` to the end result?

```
      X := 3
      B > 0
    /          \
Y := Z + W    Y := 0
X := 4
    \          /
      A := 2 * X
```

To replace a use of `x` by a constant `k` we must know: on every path to the use of `x`, the last
assignment to `x` is `x := k`.

The correctness condition is not trivial to check. It requres global dataflow analysis, which is an
anylysis of the entire control-flow graph.

Global optimization tasks share several traits:

* the optimization depends on knowing a property `X` at a particular point in program execution
* proving `X` at any point requires knowledge of the entire program
* it's Ok to be conservative, that we may say `X` is definitely true, or Don't know if `X` is true.

There are many global dataflow analysis, but they all follow the methodology: **The analysis of a
complicated program can be expressed as a combination of simple rules relating the change in
information between adjacent statements.**

### 6.3.2 Global constant propogation

To replace a use of `x` by a constant `k` we must know: on every path to the use of `x`, the last
assignment to `x` is `x := k`.

Let's consider the case of computing for a single variable `X` at all program ponts. To make the
problem precise, we associate one of the following values with `X` at every program point

* ⊥ that `X` is bottom, this statement never executes
* C that `X` is constant `C`
* T that `X` is top, means `X` is not a constant

How to compute the properties `X = ?` at each program point?

It means to tag the property `X` before each statement in the program.We should define a transfer
function that transfers information one statement to another. There are 8 general rules in total,
here is one example

```
if C(pi, X, out) = T, for any preceder of s, then C(s, X, in) = T
```

The algorithm is depicted as

* For every entry `s` to the program, set `C(s, X, in) = T`, set `C(s, X, in) = C(s, X, out) = ⊥` everywhere else
* Repeat until all points satisfy rule 1-8
  Pick `s` not satisfiying rule 1-8 and update using the appropriate rule

ORDERING

We can simplify the presentation of the analysis by ordering the values that `⊥ < C < T`
To make it clear, that all constants are in between and incomparable.

```
          T
    /  /  |  \   \
   .. -1  0   1   ..
   \   \  |   /   /
          ⊥
```

We can define the lub, least-upper bound

```
lub(⊥, 1) = 1
lub(T, ⊥) = T
lub(1, 2) = T
```

The use of lub explains why the algorithm terminates: Values start as `⊥` and only increas and `⊥`
can change to a constant, and to `T`, Thus `C(s, x, in/out)` can change at most twice.Therefore the
constant propagation algorithm is linear in program size:

```
Number of steps = Number of C(..) values compuated * 2
                = Number of program statements * 2 (in and out) * 2
```

### 6.3.3 Liveness Analysis

"live" here means value may be used in the future.

```
X := 3 // x is dead
X := 4 // x is live
y := X
```

A variable `x` is live at statement `s` if

* there exists a statement `s'` that uses `x`
* there is a path from `s` to `s'`
* that path has no intervening assignment to `x`

How do we gather the liveness information?

Just as we do in the constant propagation, we can express liveness in terms of information
transferred between adjacent statements. It's simpler as it only needs a boolean property.

The algorithm is depicted as

* Let all `L(..) = false` initially
* Repeat untile all statements `s` satisfy rules 1-4
  pick `s` where one of 1-4 does not hold and update use the appropriate rule

A value can change from `false` to `true`, but not the other way around, so the order is `false <
true`. Each value can change only once, so termination is guaranteed. Once the analysis is
computed, it is simple to eliminate dead code.

We've seen two kinds of analysis:
* Constant propagation is a forward analysis that information is pushed from input to output.
* Liveness is backwards analysis that information is pushed from output back towards input.

6.4 Register Allocation
-----------------------

> one of the most sophiscated things that compilers do to optimize performance

Register Allocation is a "must have" in compilers: because intermediate code uses too many
temporaries and it makes a big difference in performance.

> temporaries -> RIG -> Graph Coloring

Background: Intermediate code uses unlimited temporaries, which can simplify code generation and
optimization, but complicate the final translation to assembly. So, typical intermediate code uses
too many temporaries.

Problem: rewrite the intermediate code to use no more temporarie than there are machine
registers.

Solution: Register allocaiton is as old as compilers. There was a breakthrough in 1980 that people
found a algorithem that's relatively simple, global and works well in practice, which is based on GRAPH
COLORING. The basic principle is: If t1 and t2 are live at the same time, they cannot share a
register.

Algorithm:

Construct an undirected graph, that a node for each temporary, an edge between t1 and t2
if they are live simultaneously at some point in the program, which is called REGISTER INTERFERENCE
GRAPH (RIG). Two temporaries can be allocated to the same register if there is no edge connecting
them. After RIG construction, the Register Allocation algorithm is architecture independent.

### 6.4.2 Graph Coloring

A coloring of a graph is an assignment of colors to nodes, such that nodes connected by an edge have
different colors. A graph is K-COLORABLE if it has a coloring with k colors.

For Register Aollocation, we need to assign colors (registers) to graph nodes (temporaries), and let
k be the number of machine registers. If the RIG is k-colorable then there is a register assignment
that uses no more than k registers.

Graph coloring is hard:

* Graph coloring is NP-hard, which means no efficient algorithems are known. So the solution is to use
heuristics, basically an approximation technique doesn't solve the problem completely.
* A coloring might not exist for a given number of registers. The solution is to spill some spare
registers to memory.

Observation (divide and conquor):
* Pick a node t with fewer than k neighbours in RIG
* Eliminate t and its edges from RIG
* If resulting graph is k-colorable, then so is the original grpah
* If not, spill registers to memory

Algorithm:

1. Pick a node t fewer than k neighbours; put t on a stack and remove it from the RIG; repeat until
   the graph is empty
   If there is no way to pick the node t with fewer than k neighbours, spill it to memory
2. Assigne colors to nodes on the stack, starting with the last node added. At each step, pick a
   color different from those assigned to already colored neighbours.

6.5 Managing Cache
------------------

```
+-----------+---------------+-----------+
| Registers | 1 cycle       | 256-8000B |
| Cache     | 3 cycles      | 256K-1M   |
| Memory    | 20-100 cycles | 32M-4G    |
| Disk      | 0.5-5M cycles | 4G-1T     |
+-----------+---------------+-----------+

*cycle is the clock frequency
```

The cost of cache miss (for register) is very high, so typically it requires 2-layered cache to bridge
fast processor with large main memory.

Compilers are very good at managing registers, but not that good at managing caches. Compilers can,
and a few do, perform some cache optimizations.

A simple example is to perform a loop interchange.

```
// from
for (j=1; j<10; j++)
  for (i=1; i<1000000; i++)
    a[i] = b[i]

// to
for (i=1; i<1000000; i++)
  for (j=1; j<10; j++)
    a[i] = b[i]
```

6.6 Automatic Memory Management (GC)
------------------------------------

### 6.6.1 Intro

* Advantage: it prevents serious storage bugs
* Disadvantge:
  - it reduces programmer control, like the layout of data in memory, or when is memory
deallocated;
  - inefficient in some cases
  - pauses problematic in real-time applications
  - memory leaks possible

Automatic Memory Management became mainstream with the popularity of Java.

* When an object is created, unused space is automatically allocated
* After a while there is no unused space. Some space is occupied by objects that will never be used
again. This space can be freed to be reused later

How do we know an object will "never be used again"?

Observation: a program can use only the objects that it can find. An object `x` is REACHABLE if and
only if:

* a register contains a pointer to `x`, or
* another reachable object `y` contains a point to `x`

You can find all reachable objects by starting from registers and following all the pointers. An
unreachable object can never be used, such objects are GARBAGE. One thing to be noted, reachability
is an approximation, which means you might be be able to find all reachability.

Every GC schema has the following steps:

1. Allocate space as needed for new objects
2. When space runs out:
    a comput what objets might be used again (genearlly by tracing objects reachable from a set of
    "root" registers
    b free the space used by objects not found in a)

### 6.6.2 Mark and Sweep

* Advantage: objects are not moved during GC, works well for languages with pointers like C and C++
* Disadvantge: fragment memory

If there is no memory for GC happening, we can use some tricks, like reverse the pointer in the mark
phase and reuse garbage object in place as free list in the sweep phase.

CONSERVATIVE COLLECTION

This technique only works with Mark and sweep, as objects cannot be moved.

GC relies on being able to find all reachable objects which needs to find all pionters in an object.
In C or C++ it is impossible to identify the contents of objects in memory, thus we cannot tell
where all the pointers are.

But it's ok to be conservative: if a memory word looks like a pointer, it's considered to be a
pointer, like it must be algined, it must point to a valid address in the data segement.

### 6.6.3 Stop and Copy

Stop and copy is generally believed to be the fastest GC technique

* Advantage: Allocation is very cheap (just increment the heap pointer). Collection is relatively
cheap, especially if there is a lot of garbage, as it only touches reachable objects
* Disadvantge: some languages do not allow copy, like C and C++.

Memroy is organized into two areas: old space, used for allocation; new space, used as a reserve for GC

1. GC starts when the old space is full
2. Copies all reachable objects from old space to new space, with garbage left behind
3. After the copy, the roles of the old and new spaces are reversed and program resumes

The problem is after we copy a reachable object into new space, we have to fix all pointers pointing
to it. One solution is to store in the old copy a forwarding pointer to the new copy.

### 6.6.4 Reference Counting

* Advantage: easy to implement; collects garbage incrementally without large pauses in the execution
* Disadvantge: cannot collect circular structures; manipulating reference counts at each assignment is
very slow

Rather than wait for memory to be exhausted, try to collect an object when there are no more
pointers to it. This requires to store in each object the number of pointers to that object, which
is the reference count. Each assignment operation manipulates the reference count.

```
Assume x, y point to objects o, p

Every assignment x = y becomes

rc(p) = rc(p) + 1
rc(o) = rc(o) + 1
if rc(o) == 0 then free o
x = y
```

To solve the circular case, one way is to make programmer be aware of it when creating circular
data; another way is to combine with other GC technique, like running a Mark and sweep every once a
while.

### 6.6.5 Advanced GC Algorithm

* concurrent: allow the program to run while the collection is happening (collector is running in
background)
* parallel: several collectors working at once
* generational: do not scan long-lived objects at every collection
* real time: bound the length of pauses
