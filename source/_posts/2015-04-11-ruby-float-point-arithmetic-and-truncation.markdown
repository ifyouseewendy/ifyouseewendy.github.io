---
layout: post
title: "Ruby Float Point Arithmetic and Truncation"
date: 2015-04-11 21:17:56 +0800
comments: true
categories: ['Ruby']
---

***How to keep precision on float point arithmetic?***

```ruby
190000 * ( 783.0 / 10000 )
# => 14876.999999999998

( 190000 * 783.0 ) / 10000
# => 14877.0
```

***How to make a 2 point truncation instead of rounding?***

```ruby
195555 * 0.0783
# => 15311.956499999998

( 195555 * 0.0783 ).round(2)
# => 15311.96
```

### Plain Solution

```ruby
# Public: A calculator aims handling Float operation precision and
# saving the result with truncated 2 point Float.
#
# Examples
#
#   190000 * 0.0783
#   # => 14876.999999999998
#   190000 * 783 / 10000
#   # => 14877
#
#   cal = RateCalculator.new(190000, 0.0783)
#   cal.run
#   # => 14877.0
#
#
#   195555 * 0.0783
#   # => 15311.956499999998
#
#   cal = RateCalculator.new(195555, 0.0783)
#   # => 15311.95
#
# Returns a Float
class RateCalculator
  attr_reader :base, :rate

  # Internal: Handles 6 point rate.
  MAGNIFIER = 1000000

  # Public: Initialization
  #
  # base - Integer
  # rate - Numeric
  def initialize(base, rate)
    raise "#initialize: <base> needs to be Integer" unless base.is_a? Integer

    @base = base
    @rate = rate
  end

  def run
    truncate_2_point MAGNIFIER*rate*base/MAGNIFIER
  end

  private

    def truncate_2_point(float)
      (float * 100).to_i / 100.0
    end
end
```

It works, but with so many worries about the unknown conditions.

### BigDecimal

First, what the hell happens on the precision of float point arithmetic?

```ruby
0.1 + 0.2
# => 0.30000000000000004
```

According to [What Every Programmer Should Know About Floating-Point Arithmetic](http://floating-point-gui.de/), the answer is the binary fraction issue.

![Binary Fraction](/image-repo/binary_fraction.png)

> Specifically, binary can only represent those numbers as a finite fraction where the denominator is a power of 2. Unfortunately, this does not include most of the numbers that can be represented as finite fraction in base 10, like 0.1.

To get through the precision problem, Ruby provides the **Arbitrary-Precision Decimal** shipped by `BigDecimal`. And so sweet, `BigDecimal` supports several rounding modes, including `:truncate`.

Here is the final solution.

```ruby
require 'bigdecimal'

# Public: A calculator aims handling arithmatic precision and
# saving the result with 2 points truncated decimal.
#
# Examples
#
#   190000 * 0.0783
#   # => 14876.999999999998
#   190000 * 783 / 10000
#   # => 14877
#
#   cal = RateCalculator.new(190000, 0.0783).run
#   # => 14877.0
#
#
#   195555 * 0.0783
#   # => 15311.956499999998
#
#   cal = RateCalculator.new(195555, 0.0783).run
#   # => 15311.95
#
# Returns a BigDecimal
class RateCalculator
  attr_reader :base, :rate

  def initialize(base, rate)
    @base = BigDecimal(base.to_s)
    @rate = BigDecimal(rate.to_s)
  end

  def run
    BigDecimal.save_rounding_mode do
      BigDecimal.mode(BigDecimal::ROUND_MODE, :truncate)
      (base*rate).round(2)
    end
  end
end

```

#### Reference

+ [Float Point Guide](http://floating-point-gui.de/)
+ [Ruby Doc BigDecimal](http://ruby-doc.org/stdlib-1.9.3/libdoc/bigdecimal/rdoc/BigDecimal.html)
+ [BigDecimal arithmetic in Ruby](http://makandracards.com/makandra/1178-bigdecimal-arithmetic-in-ruby)
+ [Invoices: How to properly round and calculate totals](http://makandracards.com/makandra/1505-invoices-how-to-properly-round-and-calculate-totals)

