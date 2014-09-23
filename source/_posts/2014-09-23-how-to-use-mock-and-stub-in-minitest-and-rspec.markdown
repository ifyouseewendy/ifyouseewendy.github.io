---
layout: post
title: "How to use Mock and Stub in Minitest and Rspec?"
date: 2014-09-23 20:14:24 +0800
comments: true
categories: ['Ruby']
---

Referenced in [Minimalicious testing in Ruby 1.9 with MiniTest](http://blog.arvidandersson.se/2012/03/28/minimalicous-testing-in-ruby-1-9)

+ A **stub object** is a pretend object that implement some of the interface of the object it pretends to be and returns predefined responses. 
+ A **mock object** is similair to a stub but has another use case: *it helps decide if the test case it is used in passes by verifying if it's methods has been called or not.*


## Minitest::Mock

`require 'minitest/mock'`

*stub*

```ruby
[2] pry(main)> foo = Minitest::Mock.new
=> #<Minitest::Mock:0x82ff7b5c>
[3] pry(main)> foo.expect(:hi, 'hello')
=> #<Minitest::Mock:0x82ff7b5c>
[4] pry(main)> foo.hi
=> "hello"
```

*mock*

```ruby
[5] pry(main)> bar = Minitest::Mock.new
=> #<Minitest::Mock:0x821763e4>
[6] pry(main)> bar.expect(:hi, 'hello', ['arg1', 'arg2'])
=> #<Minitest::Mock:0x821763e4>
[7] pry(main)> bar.verify
MockExpectationError: expected hi("arg1", "arg2") => "hello", got []
[8] pry(main)> bar.hi('arg1', 'arg2')
=> "hello"
[9] pry(main)> bar.verify
=> true
```

## RSpec::Mocks

`require 'rspec/mocks/standalone'`

*stub*

```ruby
[2] pry(main)> foo = double()
=> #<RSpec::Mocks::Mock:0x82c66b78 @name=nil>
[3] pry(main)> foo.stub(:hi).and_return('hello')
=> nil
[4] pry(main)> foo.hi
=> "hello"
[7] pry(main)> foo.stub(:hi).with('world').and_return('hello world')
=> nil
[9] pry(main)> foo.hi('world')
=> "hello world"
```

*mock*

```ruby
[18] pry(main)> foo = double()
=> #<RSpec::Mocks::Mock:0x82c66b78 @name=nil>
[19] pry(main)> foo.should_receive(:hi).with('world')
=> #<RSpec::Mocks::MessageExpectation:0x818c11f4>
```

### Reference

+ [Minitest::Mock](http://www.ruby-doc.org/stdlib-2.0/libdoc/minitest/rdoc/MiniTest/Mock.html)
+ [Rspec Mocks](https://www.relishapp.com/rspec/rspec-mocks/v/2-3/docs/method-stubs)
