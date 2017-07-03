---
layout: post
title: "[Review] You Don't Know JS: this &amp; Object Prototypes"
date: 2017-07-03 14:01:05 -0400
comments: true
categories:  ['JavaScript']
---

{:.custom}
| **Book**    | You Don't Know JS: this & Object Prototypes
| **Author**  | [Kyle Simpson](https://github.com/getify)
| **Link**    | [https://github.com/getify/You-Dont-Know-JS/blob/master/this & object prototypes/README.md](https://github.com/getify/You-Dont-Know-JS/blob/master/this%20&%20object%20prototypes/README.md#you-dont-know-js-this--object-prototypes)

* TOC
{:toc}

# Objects in JS

Source: [You Don't Know JS: this & Object Prototypes - Chapter 3: Objects](https://github.com/getify/You-Dont-Know-JS/blob/master/this %26 object prototypes/ch3.md)


## 1. Type

Primary types \(language types\)

* number
* boolean
* string
* null
* undefined
* object

Many people mistakenly claim "everything in JavaScript is an object", but this is incorrect. Objects are one of the 6 \(or 7, depending on your perspective\) primitive types. Objects have sub-types, including`function`, and also can be behavior-specialized, like`[object Array]`as the internal label representing the array object sub-type.

| value | Primitives | Object Sub-types | typeof value |
| :--- | :--- | :--- | :--- |
| 1 | number | Number | "number" |
| true | boolean | Boolean | "boolean" |
| "hello" | string | String | "string" |
| null | null | - | "object" \(!!\) |
| undefined | undefined | - | "undefined" |
| { name: "wendi" } | object | Object | "object" |
| \[1, 2, 3\] | object | Array | "object" |
| function\(\) {} | object | Function | "function" \(!!\) |
| /^abc/ | object | RegExp | "object" |
| new Date\("2017-07-01"\) | object | Date | "object" |
| new Error\("shit"\) | object | Error | "object" |

What are object sub-types?

In JS, object sub-types are actually just built-in functions. Each of these built-in functions can be used as a constructor \(that is, a function call with the new operator\), with the result being a newly constructed object of the sub-type.

Why do we need object sub-types?

The primitive value `"I am a string"`is not an object, it's a primitive literal and immutable value. To perform operations on it, such as checking its length, accessing its individual character contents, etc, a`String`object is required.the language automatically coerces a`"string"`primitive to a`String`object when necessary, which means you almost never need to explicitly create the Object form.

What is exactly the function?

Functions are callable objects which are special in that they have an optional name property and a code property \(which is the body of the function that actually does stuff\).

How to remember?

Excluding from the self-defined object, we can always use `typeof` first to check out the primary types and then use `instanceof` to find out its object sub-types.

## 2. Contents

Objects are collections of key/value pairs. The values can be accessed as properties, via`.propName`or`["propName"]`syntax. Whenever a property is accessed, the engine actually invokes the internal default`[[Get]]`operation \(and`[[Put]]`for setting values\), which not only looks for the property directly on the object, but which will traverse the`[[Prototype]]`chain \(see Chapter 5\) if not found.

Properties have certain characteristics that can be controlled through property descriptors, such as`writable`and`configurable`. In addition, objects can have their mutability \(and that of their properties\) controlled to various levels of immutability using`Object.preventExtensions(..)`,`Object.seal(..)`, and`Object.freeze(..)`.

Properties don't have to contain values -- they can be "accessor properties" as well, with getters/setters. They can also be either _enumerable_ or not, which controls if they show up in`for..in`loop iterations, for instance.

### Properties

In objects, property names are **always **strings. If you use any other value besides a `string`\(primitive\) as the property, it will first be converted to a string.

```js
var myObject = { };

myObject[true] = "foo";
myObject[3] = "bar";
myObject[myObject] = "baz";

myObject["true"];                // "foo"
myObject["3"];                    // "bar"
myObject["[object Object]"];                  // "baz"
```

### Computed Property Names

```js
var prefix = "foo";

var myObject = {
    [prefix + "bar"]: "hello",
    [prefix + "baz"]: "world"
};

myObject["foobar"]; // hello
myObject["foobaz"]; // world
```

### Arrays

Arrays are objects. **Be careful**: If you try to add a property to an array, but the property name looks like a number, it will end up instead as a numeric index \(thus modifying the array contents\):

```js
var myArray = [ "foo", 42, "bar" ];

myArray["3"] = "baz";

myArray.length;    // 4

myArray[3];        // "baz"
```

### Duplicating Objects

```js
function anotherFunction() { /*..*/ }

var anotherObject = {
    c: true
};

var anotherArray = [];

var myObject = {
    a: 2,
    b: anotherObject,    // reference, not a copy!
    c: anotherArray,    // another reference!
    d: anotherFunction
};

anotherArray.push( anotherObject, myObject );
```

It's hard to tell which of shallow and deep copy is right without the use case.

One subset solution is that objects which are JSON-safe \(that is, can be serialized to a JSON string and then re-parsed to an object with the same structure and values\) can easily be _duplicated_ with:

```js
var newObj = JSON.parse( JSON.stringify( someObj ) );
```

A shallow copy is fairly understandable and has far less issues, so ES6 has now defined `Object.assign(..)` for this task. `Object.assign(..)` takes a target object as its first parameter, and one or more source objects as its subsequent parameters. It iterates over all the _enumerable_ \(see below\), _owned keys \(immediately present\)_ on the source object\(s\) and copies them \(via = assignment only\) to target.

```js
var newObj = Object.assign( {}, myObject );

newObj.a;                        // 2
newObj.b === anotherObject;        // true
newObj.c === anotherArray;        // true
newObj.d === anotherFunction;    // true
```

### Property Descriptors

Prior to ES5, the JavaScript language gave no direct way for your code to inspect or draw any distinction between the characteristics of properties, such as whether the property was read-only or not. But as of ES5, all properties are described in terms of a **property descriptor**.

```js
var myObject = {
    a: 2
};

Object.getOwnPropertyDescriptor( myObject, "a" );
// {
//    value: 2,
//    writable: true,
//    enumerable: true,
//    configurable: true
// }
```

We can use`Object.defineProperty(..)`to add a new property, or modify an existing one \(if it's`configurable`!\), with the desired characteristics.

```js
var myObject = {};

Object.defineProperty( myObject, "a", {
    value: 2,
    writable: true,
    configurable: true,
    enumerable: true
} );

myObject.a; // 2
```

I consider this as something about plumbing facts, which features some higher level operations. Like

**Seal**: `Object.seal(..)` creates a "sealed" object, which means it takes an existing object and essentially calls `Object.preventExtensions(..)` on it, but also marks all its existing properties as `configurable:false`.

**Freeze**: `Object.freeze(..)` creates a frozen object, which means it takes an existing object and essentially calls `Object.seal(..)` on it, but it also marks all "data accessor" properties as `writable:false`, so that their values cannot be changed.

For details, check [this section](https://github.com/getify/You-Dont-Know-JS/blob/master/this %26 object prototypes/ch3.md#property-descriptors)

### \[ \[ Get \] \]

```js
var myObject = {
    a: 2
};

myObject.a; // 2
```

The`myObject.a`is a property access, but it doesn't _just_ look in `myObject`for a property of the name `a`, as it might seem. According to the spec, the code above actually performs a`[[Get]]`operation \(kinda like a function call:`[[Get]]()`\) on the`myObject`. The default built-in`[[Get]]`operation for an object _first_ inspects the object for a property of the requested name, and if it finds it, it will return the value accordingly.

One important result of this`[[Get]]`operation is that if it cannot through any means come up with a value for the requested property, it instead returns the value`undefined`\(instead of a`ReferenceError`\).

Define an **accessor descriptor **\(getter and putter\)

```js
var myObject = {
    // define a getter for `a`
    get a() {
        return this._a_;
    },

    // define a setter for `a`
    set a(val) {
        this._a_ = val * 2;
    }
};

myObject.a = 2;

myObject.a; // 4
```

### Existence

We showed earlier that a property access like`myObject.a`may result in an`undefined`value if either the explicit`undefined`is stored there or the`a`property doesn't exist at all. So, if the value is the same in both cases, how else do we distinguish them?

```js
var myObject = {
    a: 2
};

("a" in myObject);                // true
("b" in myObject);                // false

myObject.hasOwnProperty( "a" );    // true
myObject.hasOwnProperty( "b" );    // false
```

The`in`operator will check to see if the property is _in_ the object, or if it exists at any higher level of the _`[[Prototype]]`_ chain object traversal \(see Chapter 5\). By contrast, _`hasOwnProperty(..)`_ checks to see if _only_ `myObject`has the property or not, and will _not_ consult the`[[Prototype]]`chain.

`hasOwnProperty(..)`is accessible for all normal objects via delegation to`Object.prototype`\(see Chapter 5\). But it's possible to create an object that does not link to`Object.prototype`\(via`Object.create(null)`-- see Chapter 5\). In this case, a method call like`myObject.hasOwnProperty(..)`would fail.

In that scenario, a more robust way of performing such a check is`Object.prototype.hasOwnProperty.call(myObject,"a")`, which borrows the base`hasOwnProperty(..)`method and uses_explicit_`this`_binding_\(see Chapter 2\) to apply it against our`myObject`.

## 3. Iteration

The`for..in`loop iterates over the list of enumerable properties on an object \(including its`[[Prototype]]`chain\). But what if you instead want to iterate over the values?

`for..in`loops applied to arrays can give somewhat unexpected results, in that the enumeration of an array will include not only all the numeric indices, but also any enumerable properties. It's a good idea to use`for..in`loops _only_ on objects, and traditional`for`loops with numeric index iteration for the values stored in arrays.

ES5 also added several iteration helpers for arrays, including `forEach(..)`, `every(..)`, and `some(..)`.

* `forEach(..)`will iterate over all values in the array, and ignores any callback return values.
* `every(..)`keeps going until the end _or_ the callback returns a`false`\(or "falsy"\) value, whereas
* `some(..)`keeps going until the end _or_ the callback returns a `true`\(or "truthy"\) value.

As contrasted with iterating over an array's indices in a numerically ordered way \(`for`loop or other iterators\), the order of iteration over an object's properties is **not guaranteed **and may vary between different JS engines. **Do not rely **on any observed ordering for anything that requires consistency among environments, as any observed agreement is unreliable.

You can also iterate over **the values **in data structures \(arrays, objects, etc\) using the ES6`for..of`syntax, which looks for either a built-in or custom`@@iterator`object consisting of a`next()`method to advance through the data values one at a time.

# Prototypes

Source: [You Don't Know JS: this & Object Prototypes - Chapter 5: Prototypes](https://github.com/getify/You-Dont-Know-JS/blob/master/this %26 object prototypes/ch5.md)

## 1. My understanding

After reading this part, I realize that `Arary`, `Function`, `Object`are all functions. I should admit that this refreshes my impression on JS. I know functions are first-class citizen in JS but it seems that it is all built on functions. Every object is created by functions:

```js
// simple primitives are auto boxing: new Number(1)
var number = 1

// object created by constructor
var date = new Date("2017-07-01");

// object literal
var obj = {} // is equivalent to: Object.create(Object.prototype);

var obj = { foo: "hello" } // is equivalent to

Object.create(
Object.prototype,
    {
        foo: {
            writable: true,
            configurable: true,
            value: 'hello'
        }
    }
)
```

## 2. What is a prototype?

Objects in JavaScript have an internal property, denoted in the specification as`[[Prototype]]`, which is simply a reference to another object. Almost all objects are given a non-`null`value for this property, at the time of their creation.

## 3. How to get an object's prototype?

via `__proto__`or `Object.getPrototypeOf`

```js
var a = { name: "wendi" };
a.__proto__ === Object.prototype // true
Object.getPrototypeOf(a) === Object.prototype // true

function Foo() {};
var b = new Foo();
b.__proto__ === Foo.prototype
b.__proto__.__proto__ === Object.prototype
```

So where is `__proto__`defined? `Object.prototype.__proto__`

We could roughly envision `__proto__` implemented like this

```js
Object.defineProperty( Object.prototype, "__proto__", {
    get: function() {
        return Object.getPrototypeOf( this );
    },
    set: function(o) {
        // setPrototypeOf(..) as of ES6
        Object.setPrototypeOf( this, o );
            return o;
        }
    }
);
```

**Note: **The JavaScript community unofficially coined a term for the double-underscore, specifically the leading one in properties like`__proto__`: "dunder". So, the "cool kids" in JavaScript would generally pronounce`__proto__`as "dunder proto".

## 4. What is the `prototype` ?

`prototype` is an object automatically created as a special property of a **function**, which is used to establish the delegation \(inheritance\) chain, aka prototype chain.

When we create a function `a`, `prototype` is automatically created as a special property on `a` and saves the function code on as the `constructor` on `prototype`.

```js
function Foo() {};
Foo.prototype // Object {constructor: function}
Foo.prototype.constructor === Foo // true
```

I'd love to consider this property as the place to store the properties \(including methods\) of a function object. That's also the reason why utility functions in JS are defined like `Array.prototype.forEach()` , `Function.prototype.bind()`, `Object.prototype.toString().`

Why to emphasize the property of a **function**?

```js
{}.prototype // undefined;
(function(){}).prototype // Object {constructor: function}

// The example above shows object does not have the prototype property.
// But we have Object.prototype, which implies an interesting fact that
typeof Object === "function"
var obj = new Object();
```

## 5. What's the difference between `__proto__` and `prototype`?

`__proto__`a reference works on every **object** to refer to its `[[Prototype]]`property.

`prototype` is an object automatically created as a special property of a **function**, which is used to store the properties \(including methods\) of a function object.

With these two, we could mentally map out the prototype chain. Like this picture illustrates:

![__proto__-vs-prototype.png](https://raw.githubusercontent.com/ifyouseewendy/ifyouseewendy.github.io/source/image-repo/you-dont-know-js/__proto__-vs-prototype.png)

```js
function Foo() {}
var b = new Foo();

b.__proto__ === Foo.prototype // true
Foo.__proto__ === Function.prototype // true
Function.prototype.__proto__ === Object.prototype // true
```

Refer to: [\_\_proto\_\_ VS. prototype in JavaScript](https://stackoverflow.com/questions/9959727/proto-vs-prototype-in-javascript)

## 6. What's process of method lookup via prototype chain?

```js
Object.foo = function() { console.log("foo"); };

function Foo() {}
Foo.prototype.bar = function() { this.foo(); console.log("bar"); };

var a = new Foo();
a.baz = function(){ this.bar(); console.log("baz"); };
a.baz();

// foo
// bar
// baz
```

The top-end of every _normal _`[[Prototype]]`chain is the built-in `Object.prototype`. This object includes a variety of common utilities used all over JS.

```js
Object.prototype

constructor: function Object()
hasOwnProperty: function hasOwnProperty()
isPrototypeOf: function isPrototypeOf()
propertyIsEnumerable: function propertyIsEnumerable()
toLocaleString: function toLocaleString()
toString: function toString()
valueOf: function valueOf()
__defineGetter__: function __defineGetter__()
__defineSetter__: function __defineSetter__()
__lookupGetter__: function __lookupGetter__()
__lookupSetter__: function __lookupSetter__()
get __proto__: function __proto__()
set __proto__: function __proto__()
```

# "Class"

Source: [You Don't Know JS: this & Object Prototypes - Chapter 4: Mixing \(Up\) "Class" Objects](https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch4.md)

## 1. Misconception

There's a peculiar kind of behavior in JavaScript that has been shamelessly abused for years to _hack_ something that _looks_ like "classes". JS developers have strived to simulate as much as they can of class-orientation.

JS has had _some_ class-like syntactic elements \(like`new`and`instanceof`\) for quite awhile, and more recently in ES6, some additions, like the`class`keyword \(see Appendix A\). But does that mean JavaScript actually _has_ classes? Plain and simple: **No.**

**Classes mean copies. **JavaScript **does not automatically **create copies \(as classes imply\) between objects.

Read [You Don't Know JS: this & Object Prototypes - Chapter 4: Mixing \(Up\) "Class" Objects](https://github.com/getify/You-Dont-Know-JS/blob/master/this %26 object prototypes/ch4.md) for details:

* Why does JavaScript not feature class inheritance?
* Why does mixin pattern \(both explicit and implicit\) as the common sort of emulating class copy behavior, not work in JavaScript?

## 2. "Constructors"

```js
function Foo() {
    // ...
}

Foo.prototype.constructor === Foo; // true

var a = new Foo();
a.constructor === Foo; // true
```

The`Foo.prototype`object by default \(at declaration time on line 1 of the snippet!\) gets a public, non-enumerable property called`.constructor`, and this property is a reference back to the function \(`Foo`in this case\) that the object is associated with.

### Does "constructor" mean "was constructed by"? NO!

The fact is,`.constructor`on an object arbitrarily points, by default, at a function who, reciprocally, has a reference back to the object -- a reference which it calls`.prototype`. The words "constructor" and "prototype" only have a loose default meaning that might or might not hold true later. The best thing to do is remind yourself, "constructor does not mean constructed by".

### What is exactly a "constructor"?

In other words, in JavaScript, it's most appropriate to say that a "constructor" is **any function called with the**`new`**keyword** in front of it. Functions aren't constructors, but function calls are "constructor calls" if and only if`new`is used.

### Do we have to capitalize the constructor function? NO!

By convention in the JavaScript world, "class"es are named with a capital letter, so the fact that it's `Foo` instead of `foo` is a strong clue that we intend it to be a "class". But the capital letter doesn't mean **anything** at all to the JS engine.

```js
function foo() {}

new foo() // foo {}

foo.prototype // Object {constructor: function}
```

In reality,`Foo`is no more a "constructor" than any other function in your program. Functions themselves are **not** constructors. However, when you put the`new`keyword in front of a normal function call, that makes that function call a "constructor call". In fact,`new`sort of hijacks any normal function and calls it in a fashion that constructs an object, **in addition to whatever else it was going to do**.

```js
function NothingSpecial() {
    console.log( "Don't mind me!" );
}

var a = new NothingSpecial();
// "Don't mind me!"

a; // {}
```

`NothingSpecial`is just a plain old normal function, but when called with`new`, it constructs an object, almost as a side-effect, which we happen to assign to _`a`_. The **call** was a constructor call, but `NothingSpecial` is not, in and of itself, a constructor.

### Is `.constructor`reliable to be used as a reference? NO!

Some arbitrary object-property reference like`a1.constructor`cannot actually be _trusted_ to be the assumed default function reference. Moreover, as we'll see shortly, just by simple omission,`a1.constructor`can even end up pointing somewhere quite surprising and insensible.`a1.constructor`is extremely unreliable, and an unsafe reference to rely upon in your code.**Generally, such references should be avoided where possible.**

`.constructor`is not a magic immutable property. It _is_ non-enumerable \(see snippet above\), but its value is writable \(can be changed\), and moreover, you can add or overwrite \(intentionally or accidentally\) a property of the name`constructor`on any object in any`[[Prototype]]`chain, with any value you see fit.

```js
function Foo() {}
var a = new Foo();
a.constructor  === Foo // true

Foo.prototype.constructor = () => { console.log('a') }
a.constructor === Foo // false
```

If you create a new object, and replace a function's default`.prototype`object reference, the new object will not by default magically get a`.constructor`on it.

```js
function Foo() { /* .. */ }

Foo.prototype = { /* .. */ }; // create a new prototype object

var a1 = new Foo();
a1.constructor === Foo; // false!
a1.constructor === Object; // true!
```

What's happening?`a1`has no`.constructor`property, so it delegates up the`[[Prototype]]`chain to`Foo.prototype`. But that object doesn't have a`.constructor`either \(like the default`Foo.prototype`object would have had!\), so it keeps delegating, this time up to`Object.prototype`, the top of the delegation chain._That_ object indeed has a`.constructor`on it, which points to the built-in`Object(..)`function.

Of course, you can add`.constructor`back to the`Foo.prototype`object, but this takes manual work, especially if you want to match native behavior and have it be non-enumerable.

```js
function Foo() { /* .. */ }

Foo.prototype = { /* .. */ }; // create a new prototype object

// Need to properly "fix" the missing `.constructor`
// property on the new object serving as `Foo.prototype`.
// See Chapter 3 for `defineProperty(..)`.
Object.defineProperty( Foo.prototype, "constructor" , {
    enumerable: false,
    writable: true,
    configurable: true,
    value: Foo    // point `.constructor` at `Foo`
} );
```

That's a lot of manual work to fix`.constructor`. Moreover, all we're really doing is perpetuating the misconception that "constructor" means "was constructed by". That's an _expensive_ illusion.

## 3. What happened when we call`new` ?

```js
function New(func) {
    var res = {};
    if (func.prototype !== null) {
        res.__proto__ = func.prototype;
    }
    var ret = func.apply(res, Array.prototype.slice.call(arguments, 1));
    if ((typeof ret === "object" || typeof ret === "function") && ret !== null) {
        return ret;
    }
    return res;
}

var obj = New(A, 1, 2);
// equals to
var obj = new A(1, 2);
```

1. It creates a new object. The type of this object, is simply _object_
2. It sets this new object's internal, inaccessible, _[[prototype]]_(i.e. **\_\_proto\_\_**) property to be the constructor function's external, accessible, _prototype_ object \(every function object automatically has a _prototype_ property\).
3. It makes the `this`variable point to the newly created object.
4. It executes the constructor function, using the newly created object whenever `this`is mentioned.
5. It returns the newly created object, unless the constructor function returns a non-`null`object reference. In this case, that object reference is returned instead.

Reference

* [What is the 'new' keyword in JavaScript?](https://stackoverflow.com/questions/1646698/what-is-the-new-keyword-in-javascript)
* [new operator - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new)

## 4. Introspection

### `instanceof`

```js
a instanceof Foo; // true
```

The`instanceof`operator takes a plain object as its left-hand operand and a**function**as its right-hand operand. The question`instanceof`answers is:**in the entire**`[[Prototype]]`**chain of**`a`**, does the object arbitrarily pointed to by**`Foo.prototype`**ever appear?**

What if you have two arbitrary objects, say`a`and`b`, and want to find out if _the objects_ are related to each other through a`[[Prototype]]`chain?

```js
// helper utility to see if `o1` is
// related to (delegates to) `o2`
function isRelatedTo(o1, o2) {
    function F(){}
    F.prototype = o2;
    return o1 instanceof F;
}

var a = {};
var b = Object.create( a );

isRelatedTo( b, a ); // true
```

### `Object.prototype.isPrototypeOf()`

```js
Foo.prototype.isPrototypeOf( a ); // true
```

The question`isPrototypeOf(..)`answers is:**in the entire**`[[Prototype]]`**chain of**`a`**, does**`Foo.prototype`**ever appear?**

What if you have two arbitrary objects, say`a`and`b`, and want to find out if _the objects_ are related to each other through a`[[Prototype]]`chain?

```js
// Simply: does `a` appear anywhere in
// `b`s [[Prototype]] chain?
a.isPrototypeOf( b );
```

# Behavior Delegation

Source: [You Don't Know JS: this & Object Prototypes - Chapter 6: Behavior Delegation](https://github.com/getify/You-Dont-Know-JS/blob/master/this %26 object prototypes/ch6.md)

## 1. My understanding

Considering we don't actually have `class` in JavaScript, but we want the benefit of behaviour sharing around code entities. JavaScript employs behaviour delegation as the `[[Prototype]]`mechanism. It kinda differs from the traditional class-instance  thinking, but it's still in the spectrum of OO, as a form of plain objects linking \(delegation\) instead of inheritance.

Classical inheritance is a code arrangement technique. For the cost of arranging objects in a hierarchy, you get message delegation for free. Delegation arranges objects in a horizontal space \(side-by-side as peers\) instead of a vertical hierarchy. So, can I say one outweighs another between behaviour delegation and traditional class theory? No, they are different assumptions that we don't have true `class` in JavaScript.

Behavior delegation looks like a side-effect outcome on the way JavaScript strives to simulate class-oriented code to meet the expectations of most OO developers. For instance, `new` creates an automatic message delegation just like inheritance, name of `constructor` , introducing `class`in ES6. It's probable that people added `prototype` aiming to simulate class behaviours.

Anyway, behaviour delegation works and I consider it as the right mental model to illustrate the chaos in JavaScript, which is much better than the contrived class thinking.

## 2. Background

JavaScript is **almost unique** among languages as perhaps the only language with the right to use the label "object oriented", because it's one of a very short list of languages where **an object can be created directly, without a class at all.**

In JavaScript, there are no abstract patterns/blueprints for objects called "classes" as there are in class-oriented languages. **JavaScript just has objects**. In JavaScript, we don't make _copies_ from one object \("class"\) to another \("instance"\). **We make links between objects.**

```js
function Foo() {
    // ...
}

var a = new Foo();
var b = new Foo();

Object.getPrototypeOf( a ) === Foo.prototype; // true
Object.getPrototypeOf( b ) === Foo.prototype; // true
```

When`a`is created by calling`new Foo()`, one of the things \(see Chapter 2 for all four steps\) that happens is that`a`gets an internal`[[Prototype]]`link to the object that`Foo.prototype`is pointing at. **We end up with two objects, linked to each other.**

The actual mechanism, the essence of what's important to the functionality we can leverage in JavaScript, is **all about objects being linked to other objects.**

### Compared to traditional inheritance

In class-oriented languages, multiple copies \(aka, "instances"\) of a class can be made, like stamping something out from a mold. But in JavaScript, there are no such copy-actions performed. You don't create multiple instances of a class. You can create multiple objects that `[[Prototype]]`link to a common object. But by default, no copying occurs, and thus these objects don't end up totally separate and disconnected from each other, but rather, quite **linked**.

"inheritance" \(and "prototypal inheritance"\) and all the other OO terms just do not make sense when considering how JavaScript _actually_ works \(not just applied to our forced mental models\).

Instead, "delegation" is a more appropriate term, because **these relationships are not ***copies*** but delegation ***links***.

### Prototypal Inheritance && Differential Inheritance

This mechanism is often called "**prototypal inheritance**" \(we'll explore the code in detail shortly\), which is commonly said to be the dynamic-language version of "classical inheritance". The word "inheritance" has a very strong meaning \(see Chapter 4\), with plenty of mental precedent. Merely adding "prototypal" in front to distinguish the _actually nearly opposite_ behavior in JavaScript has left in its wake nearly two decades of miry confusion."Inheritance" implies a _copy_ operation, and JavaScript doesn't copy object properties \(natively, by default\). Instead, JS creates a link between two objects, where one object can essentially _delegate_ property/function access to another object. "**Delegation**" is a much more accurate term for JavaScript's object-linking mechanism.

Another term which is sometimes thrown around in JavaScript is "**differential inheritance**". The idea here is that we describe an object's behavior in terms of what is _different_ from a more general descriptor. For example, you explain that a car is a kind of vehicle, but one that has exactly 4 wheels, rather than re-describing all the specifics of what makes up a general vehicle \(engine, etc\).

But just like with "prototypal inheritance", "differential inheritance" pretends that your mental model is more important than what is physically happening in the language. It overlooks the fact that object `B`is not actually differentially constructed, but is instead built with specific characteristics defined, alongside "holes" where nothing is defined. It is in these "holes" \(gaps in, or lack of, definition\) that delegation _can_ take over and, on the fly, "fill them in" with delegated behavior.

## 3. Create delegations by `Object.create`

`Object.create(..)` creates a "new" object out of thin air, and links that new object's internal `[[Prototype]]`to the object you specify.

```js
var a = { name: "wendi" };
var b = Object.create(a);

b.name // "wendi"
b.__proto__ === a // true
```

### How to make plain object delegations?

```js
var foo = {
    something: function() {
        console.log( "Tell me something good..." );
    }
};

var bar = Object.create( foo );

bar.__proto__ === foo // true
bar.something(); // Tell me something good...
```

### How to make delegations to perform "prototypal inheritance"?

```js
function Foo() {};
Foo.prototype.foo = function() { console.log("foo"); };
function Bar() {};

Bar.prototype = Object.create(Foo.prototype);
Bar.prototype.__proto__ === Foo.prototype // true

var b = new Bar();
b.foo(); // foo
```

Inspection: `Bar.prototype` has changed

```js
function Foo() {};
Foo.prototype.foo = function() { console.log("foo"); };
function Bar() {};

Bar.prototype // Object {constructor: function}
Bar.prototype = Object.create(Foo.prototype);
Bar.prototype // Foo {}
Bar.prototype.bar = function() { console.log("bar"); };
Bar.prototype // Foo {bar: function}
```

Inspection: `Bar.prototype` is not a reference \(separated\) to `Foo.prototype`

```js
function Foo() {};
Foo.prototype.foo = function() { console.log("foo"); };
function Bar() {};

Bar.prototype = Object.create(Foo.prototype);
Bar.prototype.bar = function() { console.log("bar"); };

Foo.prototype // Object {foo: function, constructor: function}
Bar.prototype // Function {bar: function}
```

Why not?

```js
Bar = Object.create(Foo.prototype)
// Cause it ends up Bar is no longer a function object.

Bar.prototype = Object.create(Foo)
// This links Bar.prototype to Foo, which is the function object. Foo.foo() is not a function.

Bar.prototype = Foo.prototype;
// It just makes Bar.prototype be another reference to Foo.prototype

Bar.prototype = new Foo();
// It creates a new object, but Foo might have unexpected behaviours in constructor calling
```

ES6-standardized techniques

```js
// pre-ES6
// throws away default existing `Bar.prototype`
Bar.prototype = Object.create( Foo.prototype );

// ES6+
// modifies existing `Bar.prototype`
Object.setPrototypeOf( Bar.prototype, Foo.prototype );
```

### How to envision your own `Object.create`?

This polyfill shows a very basic idea without handling the second parameter `propertiesObject`.

```js
function createAndLinkObject(o) {
    function F(){}
    F.prototype = o;
    return new F();
}
```

Polyfill on [Object.create - MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create)

```js
if (typeof Object.create != 'function') {
  Object.create = (function(undefined) {
    var Temp = function() {};
    return function (prototype, propertiesObject) {
      if(prototype !== Object(prototype)) {
        throw TypeError(
          'Argument must be an object, or null'
        );
      }
      Temp.prototype = prototype || {};
      var result = new Temp();
      Temp.prototype = null;
      if (propertiesObject !== undefined) {
        Object.defineProperties(result, propertiesObject); 
      } 

      // to imitate the case of Object.create(null)
      if(prototype === null) {
         result.__proto__ = null;
      } 
      return result;
    };
  })();
}
```

## 4. Towards Delegation-Oriented Design

Pseudo-code for class theory

```js
class Task {
    id;

    // constructor `Task()`
    Task(ID) { id = ID; }
    outputTask() { output( id ); }
}

class XYZ inherits Task {
    label;

    // constructor `XYZ()`
    XYZ(ID,Label) { super( ID ); label = Label; }
    outputTask() { super(); output( label ); }
}

class ABC inherits Task {
    // ...
}
```

Pseudo-code for delegation theory

```js
var Task = {
    setID: function(ID) { this.id = ID; },
    outputID: function() { console.log( this.id ); }
};

// make `XYZ` delegate to `Task`
var XYZ = Object.create( Task );

XYZ.prepareTask = function(ID,Label) {
    this.setID( ID );
    this.label = Label;
};

XYZ.outputTaskDetails = function() {
    this.outputID();
    console.log( this.label );
};

// ABC = Object.create( Task );
// ABC ... = ...
```

### Avoid shadowing \(naming things the same\) if at all possible

With the class design pattern, we intentionally named`outputTask`the same on both parent \(`Task`\) and child \(`XYZ`\), so that we could take advantage of overriding \(polymorphism\). In behavior delegation, we do the opposite: **we avoid if at all possible naming things the same** at different levels of the`[[Prototype]]`chain \(called **shadowing**\), because having those name collisions creates awkward/brittle syntax to disambiguate references, and we want to avoid that if we can.

This design pattern calls for less of general method names which are prone to overriding and instead more of descriptive method names, specific to the type of behavior each object is doing.**This can actually create easier to understand/maintain code**, because the names of methods \(not only at definition location but strewn throughout other code\) are more obvious \(self documenting\).

Setting properties on an object was more nuanced than just adding a new property to the object or changing an existing property's value. Usually, shadowing is more complicated and nuanced than it's worth, **so you should try to avoid it if possible**.

```js
var anotherObject = {
    a: 2
};

var myObject = Object.create( anotherObject );

anotherObject.a; // 2
myObject.a; // 2

anotherObject.hasOwnProperty( "a" ); // true
myObject.hasOwnProperty( "a" ); // false

myObject.a++; // oops, implicit shadowing!

anotherObject.a; // 2
myObject.a; // 3

myObject.hasOwnProperty( "a" ); // true
```

Though it may appear that`myObject.a++`should \(via delegation\) look-up and just increment the`anotherObject.a`property itself _in place_, instead the`++`operation corresponds to`myObject.a = myObject.a + 1`.

That's the reason why we use delegation on prototype chain, we should avoid using the same name as traditional class inheritance would do.

### Save state on delegators

In general, with`[[Prototype]]`delegation involved, **you want state to be on the delegators**\(`XYZ`,`ABC`\), not on the delegate \(`Task`\). We benefit it from the implicit call-site `this`binding rules.

### Comparison

OO style

```js
function Foo(who) {
    this.me = who;
}
Foo.prototype.identify = function() {
    return "I am " + this.me;
};

function Bar(who) {
    Foo.call( this, who );
}
Bar.prototype = Object.create( Foo.prototype );

Bar.prototype.speak = function() {
    alert( "Hello, " + this.identify() + "." );
};

var b1 = new Bar( "b1" );
var b2 = new Bar( "b2" );

b1.speak();
b2.speak();
```

OO style features `constructor` which introduces a lot of extra details that you don't _technically_ need to know at all times.

![OO.png](https://raw.githubusercontent.com/ifyouseewendy/ifyouseewendy.github.io/source/image-repo/you-dont-know-js/OO.png)

OLOO style

```js
var Foo = {
    init: function(who) {
        this.me = who;
    },
    identify: function() {
        return "I am " + this.me;
    }
};

var Bar = Object.create( Foo );

Bar.speak = function() {
    alert( "Hello, " + this.identify() + "." );
};

var b1 = Object.create( Bar );
b1.init( "b1" );
var b2 = Object.create( Bar );
b2.init( "b2" );

b1.speak();
b2.speak();
```

OLOO-style code has _vastly less stuff_ to worry about, because it embraces the **fact **that the only thing we ever really cared about was the **objects linked to other objects**.

![OLOO.png](https://raw.githubusercontent.com/ifyouseewendy/ifyouseewendy.github.io/source/image-repo/you-dont-know-js/OLOO.png)

