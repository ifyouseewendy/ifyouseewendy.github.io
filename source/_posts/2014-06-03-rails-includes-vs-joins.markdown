---
layout: post
title: "includes vs. joins in Rails"
date: 2014-06-03 00:32:18 +0800
comments: true
categories: Rails
---

`includes`


Eager load the included associations into memory. Fire two queries:

```
SELECT "products".* FROM "products" ORDER BY name
SELECT "categories".* FROM "categories" WHERE "categories"."id" IN (2, 1, 5, 4, 3)
```

`joins`

Sometimes,`includes` will load many redundant fields in association table, `joins` help to control what columns after `SELECT`.


*Reference*

+ [ruby - Rails :include vs. :joins - Stack Overflow](http://stackoverflow.com/questions/1208636/rails-include-vs-joins/10129946)
+ [#181 Include vs Joins - RailsCasts](http://railscasts.com/episodes/181-include-vs-joins?language=zh&view=asciicast)
+ [N+1 Benchmark Gist - IBM Developer Works](https://gist.github.com/ifyouseewendy/6d0feb90d76fb894814a)

- - -

***Does query with `includes` and `joins` return the same count?***

```ruby activerecord-includes-joins-query-count  https://gist.github.com/ifyouseewendy/429544e5b8f49a347e95
class Post < ActiveRecord::Base
  has_many :comments
end

class Comment < ActiveRecord::Base
  belongs_to :post
end

class BugTest < Minitest::Test
  def test_association_stuff
    post1 = Post.create!
    post2 = Post.create!

    post1.comments << Comment.create!
    post1.comments << Comment.create!
    post2.comments << Comment.create!
    post2.comments << Comment.create!
    post2.comments << Comment.create!

    assert_equal 2, Post.includes(:comments).find(post1.id, post2.id).count
    # => SELECT "posts".* FROM "posts" WHERE "posts"."id" IN (1, 2)
    # => SELECT "comments".* FROM "comments" WHERE "comments"."post_id" IN (1, 2)

    assert_equal 5, Post.joins(:comments).where(id: [post1.id, post2.id]).count
    # => SELECT COUNT(*) FROM "posts" INNER JOIN "comments" ON "comments"."post_id" = "posts"."id" WHERE "posts"."id" IN (1, 2)

  end
end

```

***Does `includes` work with Mongoid?***

Check list:

+ [N+1 problem in mongoid - Stack Overflow](http://stackoverflow.com/questions/3912706/n1-problem-in-mongoid)
+ [Eager Loading - Mongoid Doc](http://mongoid.org/en/mongoid/docs/querying.html#queries)

By now ( *2014-05-08* ) the latest version *4.0.0.beta1* behaves much better than last stable version *3.1.6*, check the [gist](https://gist.github.com/ifyouseewendy/0069c0498274d2dd5a6d).

![rails-includes_vs_joins](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/rails-includes_vs_joins_selected.png)


