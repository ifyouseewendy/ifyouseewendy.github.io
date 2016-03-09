---
layout: post
title: "Things I Learn from Owning Rails Class"
date: 2014-09-29 18:36:28 +0800
comments: true
categories:  [Ruby, Rails]
---

{:.custom}
| **Teacher** | [Marc-André Cournoyer](http://macournoyer.com/)
| **Link**    | [Owning Rails](http://owningrails.com/)

I've participated Marc's Owning Rails online class recently. AWESOME!

The class has two parts. Marc led us to build a minimal version of Rails on first day, Marc focused on the structure and design pattern behind Rails. Trully I think it's a live version of [Rebuilding Rails](http://blog.ifyouseewendy.com/blog/2014/09/27/rebuilding-rails/), maybe you can read it as a substitution. Second day is the excellent part, took us diving into the real Rails source. Marc gave us a clear clue on what each part do and how they work, and also some practical introductions on how and where to keep on digging after class. 

Beside professional, I should also mention that Marc is a really kind and patient guy.

Thanks a lot, Marc.

- - -

Following are some specific questions I've noted on class.

***Is `yield` still available after passing `&block`?***

yes.

```ruby
[1] pry(main)> def foo(&block)
[1] pry(main)*   p block
[1] pry(main)*   yield
[1] pry(main)* end 
[4] pry(main)> foo { puts 'foo' }
#<Proc:0x000001053e7f28@(pry):6>
foo
=> nil
[5] pry(main)> def bar(&block)
[5] pry(main)*   block.call
[5] pry(main)*   yield
[5] pry(main)* end  
=> nil
[6] pry(main)> bar { puts 'bar' }
bar
bar
=> nil
```

Passing block directly will omit the block-to-proc process, it can be more efficient.

***How to make bindings of block get understood in object, which differs the environment the block defines?***

> When you define the block, it simply grabs the bindings that are there at that moment, and then it carries those bindings along when you pass the block into a method. 


```ruby
class Router
  def initialize
    @routes = {}
  end
  
  def match(route)
    puts '#match from Router instance'
    @routes.update route
  end

  def routes(&block)
    yield
  end
end

def match(route)
  puts '#match from main object'
end

Router.new.routes do
  match '/user' => 'users#index'
end

# => #match in main object
```

Use `instance_eval` to eval the new bindings.

```ruby
def match(route)
  puts '#match in main object'
end

class Router
  def routes(&block)
    instance_eval(&block)
  end
end

Router.new.routes do
  match '/user' => 'users#index'
end

# => match from Router instance
```

***Why using `::File` in `config.ru`?***

```ruby
# config.ru

require ::File.expand_path('../config/environment', __FILE__)
run Rails.application
```

Actually the code above is defined in module Rack, where `Rack::File` already exists.

***How to use `include` to construct a method chain?***

```ruby
module A
  def foo
    puts 'foo from A'
    super
  end
end

module B
  def foo
    puts 'foo from B'
    super
  end
end

class Base
  include A, B

  def foo
    puts 'foo from Base'
  end
end

Base.new.foo
# => foo from Base
```

One way to solve is to use `prepend` instead of `include`, introduced by Ruby 2.0.

Considering the compatibility, Rails may not start to use it. Here is the Rails way to solve

```ruby
module A
  def foo
    puts 'foo from A'
    super
  end
end

module B
  def foo
    puts 'foo from B'
    super
  end
end

class Metal
  def foo
    puts 'foo from Base'
  end
end

class Base < Metal
  include A, B
end

Base.new.foo
# => foo from A
# => foo from B
# => foo from Base
```

***How instance variables shared betweet controller and view?***

One way is to use `instance_varialbles` and `instance_variable_set/get`, to passing instance varaibles defined in action to the view object.

The other way is passing `binding` directly.

```ruby
template = ERB.new( File.read() )
template.result(binding)
# eval(template.src, binding)
```

***Truth about binding***

1. `Binding.new` doesn't work, you can only call `Kernel.binding` or `Proc#binding`.

2. You can only use `binding` with `eval`. `eval('', binding)` or `binding.eval('')`

***When we create custom middleware is it a good practise to add new keys and values to env variable to transfer it between middlewares?***

> [02:35] \<wawka> macournoyer: When we create custom middleware is it a good practise to add new keys and values to env variable to transfer it between middlewares ?  
> [02:36] \<macournoyer>  Rack specs recommend namespacing everything you put in the env var  
> [02:36] \<macournoyer> eg.: Rails will do env["action\_controller.request\_id"] = "..."   
> [02:36] \<macournoyer> "action_controller." is the namespace  
> [02:36] \<wawka> macournoyer: ok

***How to check a gem's dependency and dive into the source code?***

```sh
$ gem dep rails -v=4.1.6    
Gem rails-4.1.6
  actionmailer (= 4.1.6)
  actionpack (= 4.1.6)
  actionview (= 4.1.6)
  activemodel (= 4.1.6)
  activerecord (= 4.1.6)
  activesupport (= 4.1.6)
  bundler (< 2.0, >= 1.3.0)
  railties (= 4.1.6)
  sprockets-rails (~> 2.0)

$ bundle open activerecord

# open the latest version on system, a little bit dangerous 
$ gem edit activerecord
```

***How to get the source location of the method calling?***

In Rails, *guess* the logic part(activerecord, activesupport..) based on the method function, then use `bundle open` to dive in.

Ruby supports `Method#source_location`, `Proc#source_location` to provides some information, not accurate though. Use it like this

```ruby
# chech where defined respond_with
raise method(:respond_with).source_location.inspect
```

- - -

### Other stuffs

1. Marc's [gitconfig](https://gist.github.com/macournoyer/1878273)

2. Don't try to understand everything.

3. Read concern, callbacks, core_ext and other ActiveSupport parts as a start.

4. Nice word learnt, **Base**ics

5. Try `mount` a rack-based app in Rails.
