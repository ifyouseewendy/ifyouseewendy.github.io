---
layout: post
title: "From irb to Rails console"
date: 2014-11-22 18:09:51 +0800
comments: true
categories:  ['Ruby', 'Rails']
---

From Justing Weiss's article:

[What's the Difference Between *irb*, *bundle exec irb*, *bundle console*, and *rails console*?](http://www.justinweiss.com/blog/2014/11/17/what-are-the-differences-between-irb/?utm_source=Weissblog+Subscribers&utm_campaign=dc22dc3715-What_are_the_differences_between_irb_11_17_2014&utm_medium=email&utm_term=0_2494b7d197-dc22dc3715-120246897)

+ `irb`

It can’t easily load gems that Bundler installs outside of RubyGems’ load path. Eg. `bundle install --path=vendor/bundle`


+ `bundle exec irb`

It can easily load *Gemfile* gems by Bundler.

```ruby
$ irb
>> require 'bundler/setup'
=> true
```

+ `bundle exec console`

Find and auto-require *Gemfile* gems.

```ruby
$ irb
>> require 'bundler/setup'
=> true
>> Rails.version
NameError: uninitialized constant Rails
        from (irb):2
        from /Users/wendi/.rvm/rubies/ruby-2.0.0-p353/bin/irb:12:in '<main>'
>> Bundler.require
=> [<Bundler::Dependency type=:runtime name="rails" requirements="= 4.1.6">, ... ]
>> Rails.version
=> "4.1.6"
```

+ `rails console`

Find, auto-require *Gemfile* gems and load Rails Application env.

```ruby
$ irb
>> require 'bundler/setup'
=> true
>> Rails.version
NameError: uninitialized constant Rails
        from (irb):2
        from /Users/wendi/.rvm/rubies/ruby-2.0.0-p353/bin/irb:12:in '<main>'
>> Bundler.require
=> [<Bundler::Dependency type=:runtime name="rails" requirements="= 4.1.6">, ... ]
>> Rails.version
=> "4.1.6"
>> require_relative 'config/environment.rb'
=> true
```

