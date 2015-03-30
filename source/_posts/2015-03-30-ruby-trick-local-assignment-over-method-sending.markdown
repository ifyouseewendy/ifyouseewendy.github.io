---
layout: post
title: "Ruby Trick: Local Assignment over Method Sending"
date: 2015-03-30 16:24:59 +0800
comments: true
categories: ['Ruby']
---

There is a weird situation I haven't noticed before:

```ruby
class Counter
  attr_accessor :processed, :processed_names

  def initialize
    @processed = 0
    @processed_names = []
  end

  def foo
    processed += 1
  end

  def bar
    processed_names << 'a'
  end
end

w = Counter.new;
w.foo # => NoMethodError: undefined method `+' for nil:NilClass`
w.bar # => ['a']
```

***Why the hell?***

**Local assignment always has precedence over method sending**. Assignment happened in `w.foo`, which not in `w.bar`.

Check this one:

```
class Person
  attr_accessor :name

  def foo
    name = 'John'
  end
end

t = Tao.new
t.name # => nil
t.foo  # => 'John'
t.name # => nil
```

`name = 'John'` only means a definition of a local variable, which won't send `=` to `name`.
