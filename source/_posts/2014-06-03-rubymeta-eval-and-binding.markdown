---
layout: post
title: "RubyMeta - Eval and Binding"
date: 2014-06-03 00:43:33 +0800
comments: true
categories: [Ruby, Excerpts]
---

## Eval and Binding

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

**What's to concern when using `eval`?**

+ As it only accepts strings of codes but not blocks, it's not editor friendly(syntax highlighting) and hard to trace syntax errors.

+ Code Injection.

**What's the soluction Ruby provided for `eval` insecurity?**

+ Tainted Objects, `Object#tainted?`, `Object#untaint`

+ Safe Levels, `$SAFE`

    - 0, “hippie commune", where you can hug trees and format hard disks.
    - Any safe level greater than 0 also causes Ruby to flat-out refuse to evaluate tainted string.
    - 2, disallows most file-related operations.
    - 3, “military dictatorship,” where every object you create is tainted by default.

**How to write a Sandbox for `eval`?**

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


