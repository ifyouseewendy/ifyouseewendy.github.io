---
layout: post
title: "Some Hash Tricks in Ruby"
date: 2015-11-30 16:17:38 +0800
comments: true
categories: ['Ruby']
---

> from [http://blog.honeybadger.io/advanced-ruby-hash-techniques/](http://blog.honeybadger.io/advanced-ruby-hash-techniques/)

### Strict fetching

```ruby
h = Hash.new { |hash, key| raise ArgumentError.new("No hash key: #{ key }") }
h[:a]=1
h[:a] # 1
h[:x] # raises ArgumentError: No hash key: x
```

### Modifying defaults after initialization

```ruby
h={}
h[:a] # nil
h.default = "new default"
h[:a] # "new default"

h.default_proc = Proc.new { Time.now.to_i }
h[:a] # 1435684014
```

### Factorial using Hash

```ruby
factorial = Hash.new{|h,k| k > 1 ? h[k] = h[k-1]*k : h[k] = 1 }
Factorail[4] # => 24
```

### A game of lazily infinite nested hashes

```ruby
generator = Proc.new do |hash, key|
  hash[key] = Hash.new(&generator).merge( ['n', 's', 'e', 'w'][rand(4)] => 'You found me' )
end
dungeon = Hash.new &generator
dungeon['n']            # => { "s" => "You found me" }
dungeon['n']['w']       # => { "e" => "You found me" }
dungeon['n']['w']['e']  # => "You found me"
```

> from [https://endofline.wordpress.com/2010/12/24/hash-tricks](https://endofline.wordpress.com/2010/12/24/hash-tricks/)

### Hash returns hashes, to build a tree structure

```ruby
tree_block = ->(hash,k){ hash[k] = Hash.new(&tree_block) }
opts = Hash.new(&tree_block)

opts['dev']['db']['host'] = "localhost:2828"
opts['dev']['db']['user'] = "me"
opts['dev']['db']['password'] = "secret"
opts['test']['db']['host'] = "localhost:2828"
opts['test']['db']['user'] = "test_user"
opts['test']['db']['password'] = "test_secret"
opts
# => {
  "dev"  => {
    "db" => {
      "host"     => "localhost:2828",
      "user"     => "me",
      "password" => "secret"
    }
  },
  "test" => {
    "db" => {
      "host"     => "localhost:2828",
      "user"     => "test_user",
      "password" => "test_secret"
    }
  }
}
```

### Use hash as a method

```ruby
require 'net/http'
http = Hash.new do |h,k|
  h[k] = Net::HTTP.get_response(URI(k)).body
  h.delete h.keys.first if h.length > 3 # a caching layer
  h
end
```

> from Amadan posted on [https://www.reddit.com/r/ruby/comments/29hr4x/whats_youre_favorite_ruby_trick_or_quirk_thata](https://www.reddit.com/r/ruby/comments/29hr4x/whats_youre_favorite_ruby_trick_or_quirk_thata)

### Autovivifying hashes are cool

```ruby
autohash = Hash.new { |h, k| h[k] = Hash.new(&h.default_proc) }
autohash[1][2][3][4][5][6][7] = 8
autohash # => {1=>{2=>{3=>{4=>{5=>{6=>{7=>8}}}}}}}
```

> from The Buckblog [http://weblog.jamisbuck.org/2015/11/14/little-things-refactoring-with-hashes.html](http://weblog.jamisbuck.org/2015/11/14/little-things-refactoring-with-hashes.html)


### Refactor case statement

before


```ruby
klass = case params[:student_level]
  when :freshman, :sophomore then
    Student::Underclassman
  when :junior, :senior then
    Student::Upperclassman
  when :graduate
    Student::Graduate
  else
    Student::Unregistered
  end
student = klass.new(name, birthdate, address, phone)
```

after

```ruby
STUDENT_LEVELS = Hash.new(Student::Unregistered).merge(
  freshman: Student::Underclassman,
  sophomore: Student::Underclassman,
  junior:    Student::Upperclassman,
  senior:    Student::Upperclassman,
  graduate:  Student::Graduate
)

klass = STUDENT_LEVELS[params[:student_level]]
student = klass.new(name, birthdate, address, phone)
```
