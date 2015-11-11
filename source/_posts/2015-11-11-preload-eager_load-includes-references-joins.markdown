---
layout: post
title: "preload, eager_load, includes, references, and joins in Rails"
date: 2015-11-11 23:25:17 +0800
comments: true
categories:  ['Rails', 'Ruby']
---

There is always a confusion about these query methods. And after some digging, I've made my conclusion here: `includes` is the outstanding one.

Here comes the demonstation.

**Preparation**

Environment

+ Ruby: 2.2.2
+ Rails: 4.2.2

```ruby
# model and reference
class Blog < ActiveRecord::Base
  has_many :posts

  # t.string   "name"
  # t.string   "author"
end

class Post < ActiveRecord::Base
  belongs_to :blog

  # t.string   "title"
end

# seed
(1..3).each do |b_id|
  blog = Blog.create(name: "Blog #{b_id}", author: 'someone')
  (1..5).each { |p_id| blog.posts.create(title: "Post #{b_id}-#{p_id}") }
end
```

### preload

Always firing two separate queries.

```sh
> Blog.preload(:posts)
  Blog Load (3.2ms)  SELECT "blogs".* FROM "blogs"
  Post Load (1.2ms)  SELECT "posts".* FROM "posts" WHERE "posts"."blog_id" IN (1, 2, 3)
```

### eager_load

- One query, LEFT OUTER JOINed in any query rather than loaded separately.
- JOIN first, then query by where clause. So you can query on referenced table, without an iteration of  `Enumerable#select`.
- Works just the same as `includes` + `references`.

```sh
> Blog.eager_load(:posts)
  SQL (0.4ms)  SELECT "blogs"."id" AS t0_r0, "blogs"."name" AS t0_r1, "blogs"."author" AS t0_r2, "blogs"."created_at" AS t0_r3, "blogs"."updated_at" AS t0_r4, "posts"."id" AS t1_r0, "posts"."title" AS t1_r1, "posts"."created_at" AS t1_r2, "posts"."updated_at" AS t1_r3, "posts"."blog_id" AS t1_r4 FROM "blogs" LEFT OUTER JOIN "posts" ON "posts"."blog_id" = "blogs"."id"

> Blog.eager_load(:posts).where(name: 'Blog 1')
  SQL (0.4ms)  SELECT "blogs"."id" AS t0_r0, "blogs"."name" AS t0_r1, "blogs"."author" AS t0_r2, "blogs"."created_at" AS t0_r3, "blogs"."updated_at" AS t0_r4, "posts"."id" AS t1_r0, "posts"."title" AS t1_r1, "posts"."created_at" AS t1_r2, "posts"."updated_at" AS t1_r3, "posts"."blog_id" AS t1_r4 FROM "blogs" LEFT OUTER JOIN "posts" ON "posts"."blog_id" = "blogs"."id" WHERE "blogs"."name" = ?  [["name", "Blog 1"]]

> Blog.eager_load(:posts).where(name: 'Blog 1').where(posts: {title: 'Post 1-1'})
  SQL (0.4ms)  SELECT "blogs"."id" AS t0_r0, "blogs"."name" AS t0_r1, "blogs"."author" AS t0_r2, "blogs"."created_at" AS t0_r3, "blogs"."updated_at" AS t0_r4, "posts"."id" AS t1_r0, "posts"."title" AS t1_r1, "posts"."created_at" AS t1_r2, "posts"."updated_at" AS t1_r3, "posts"."blog_id" AS t1_r4 FROM "blogs" LEFT OUTER JOIN "posts" ON "posts"."blog_id" = "blogs"."id" WHERE "blogs"."name" = ? AND "posts"."title" = ?  [["name", "Blog 1"], ["title", "Post 1-1"]]
```

### includes

Behaves based on situations, intelligent!

Situation 1, just like `preload`

```sh
> Blog.includes(:posts)
  Blog Load (2.8ms)  SELECT "blogs".* FROM "blogs"
  Post Load (0.7ms)  SELECT "posts".* FROM "posts" WHERE "posts"."blog_id" IN (1, 2, 3)

> Blog.includes(:posts).where(name: 'Blog 1')
  Blog Load (0.7ms)  SELECT "blogs".* FROM "blogs" WHERE "blogs"."name" = ?  [["name", "Blog 1"]]
  Post Load (0.3ms)  SELECT "posts".* FROM "posts" WHERE "posts"."blog_id" IN (1)
```

Situation 2, just like `eager_load`, **fired by querying referenced table**

```sh
> Blog.includes(:posts).where(name: 'Blog 1').where(posts: {title: 'Post 1-1'})
  SQL (0.2ms)  SELECT "blogs"."id" AS t0_r0, "blogs"."name" AS t0_r1, "blogs"."author" AS t0_r2, "blogs"."created_at" AS t0_r3, "blogs"."updated_at" AS t0_r4, "posts"."id" AS t1_r0, "posts"."title" AS t1_r1, "posts"."created_at" AS t1_r2, "posts"."updated_at" AS t1_r3, "posts"."blog_id" AS t1_r4 FROM "blogs" LEFT OUTER JOIN "posts" ON "posts"."blog_id" = "blogs"."id" WHERE "blogs"."name" = ? AND "posts"."title" = ?  [["name", "Blog 1"], ["title", "Post 1-1"]]
```

***`includes` or `eager_load`***

Consider this snippet:

```sh
> Blog.includes(:posts).each{|blog| puts blog.posts.map(&:title).join(',') }
  Blog Load (0.3ms)  SELECT "blogs".* FROM "blogs"
  Post Load (0.3ms)  SELECT "posts".* FROM "posts" WHERE "posts"."blog_id" IN (1, 2, 3)

> Blog.eager_load(:posts).each{|blog| puts blog.posts.map(&:title).join(',') }                                                                                                                    SQL (0.9ms)
  SELECT "blogs"."id" AS t0_r0, "blogs"."name" AS t0_r1, "blogs"."author" AS t0_r2, "blogs"."created_at" AS t0_r3, "blogs"."updated_at" AS t0_r4, "posts"."id" AS t1_r0, "posts"."title" AS t1_r1, "posts"."created_at" AS t1_r2, "posts"."updated_at" AS t1_r3, "posts"."blog_id" AS t1_r4 FROM "blogs" LEFT OUTER JOIN "posts" ON "posts"."blog_id" = "blogs"."id"
```

Both expressions return the same result, so should we prefer two seperated queries by `includes` (also `preload`) or the LEFT OUTER JOINed query by `eager_load`?

There is a [blog post](http://www.akitaonrails.com/2008/5/26/rolling-with-rails-2-1-the-first-full-tutorial-part-2) by Fabio Akita talks about the change of Rails 2.1 (see the section entitled "Optimized Eager Loading"). Here are some references:

> For some situations, the monster outer join becomes slower than many smaller queries.
> The bottom line is: generally it seems better to split a monster join into smaller ones, as you’ve seen in the above example. This avoid the cartesian product overload problem.

Example for SQL data returned from LEFT OUTER JOIN query

```sh
sqlite>  SELECT "blogs"."id" AS t0_r0, "blogs"."name" AS t0_r1, "blogs"."author" AS t0_r2, "blogs"."created_at" AS t0_r3, "blogs"."updated_at" AS t0_r4, "posts"."id" AS t1_r0, "posts"."title" AS t1_r1, "posts"."created_at" AS t1_r2, "posts"."updated_at" AS t1_r3, "posts"."blog_id" AS t1_r4 FROM "blogs" LEFT OUTER JOIN "posts" ON "posts"."blog_id" = "blogs"."id";
1|Blog 1|someone|2015-11-11 15:22:35.015095|2015-11-11 15:22:35.015095|1|Post 1-1|2015-11-11 15:22:35.053689|2015-11-11 15:22:35.053689|1
1|Blog 1|someone|2015-11-11 15:22:35.015095|2015-11-11 15:22:35.015095|2|Post 1-2|2015-11-11 15:22:35.058113|2015-11-11 15:22:35.058113|1
1|Blog 1|someone|2015-11-11 15:22:35.015095|2015-11-11 15:22:35.015095|3|Post 1-3|2015-11-11 15:22:35.062776|2015-11-11 15:22:35.062776|1
1|Blog 1|someone|2015-11-11 15:22:35.015095|2015-11-11 15:22:35.015095|4|Post 1-4|2015-11-11 15:22:35.065994|2015-11-11 15:22:35.065994|1
1|Blog 1|someone|2015-11-11 15:22:35.015095|2015-11-11 15:22:35.015095|5|Post 1-5|2015-11-11 15:22:35.069632|2015-11-11 15:22:35.069632|1
2|Blog 2|someone|2015-11-11 15:22:35.072871|2015-11-11 15:22:35.072871|6|Post 2-1|2015-11-11 15:22:35.078644|2015-11-11 15:22:35.078644|2
2|Blog 2|someone|2015-11-11 15:22:35.072871|2015-11-11 15:22:35.072871|7|Post 2-2|2015-11-11 15:22:35.081845|2015-11-11 15:22:35.081845|2
2|Blog 2|someone|2015-11-11 15:22:35.072871|2015-11-11 15:22:35.072871|8|Post 2-3|2015-11-11 15:22:35.084888|2015-11-11 15:22:35.084888|2
2|Blog 2|someone|2015-11-11 15:22:35.072871|2015-11-11 15:22:35.072871|9|Post 2-4|2015-11-11 15:22:35.087778|2015-11-11 15:22:35.087778|2
2|Blog 2|someone|2015-11-11 15:22:35.072871|2015-11-11 15:22:35.072871|10|Post 2-5|2015-11-11 15:22:35.090781|2015-11-11 15:22:35.090781|2
3|Blog 3|someone|2015-11-11 15:22:35.093902|2015-11-11 15:22:35.093902|11|Post 3-1|2015-11-11 15:22:35.097479|2015-11-11 15:22:35.097479|3
3|Blog 3|someone|2015-11-11 15:22:35.093902|2015-11-11 15:22:35.093902|12|Post 3-2|2015-11-11 15:22:35.103512|2015-11-11 15:22:35.103512|3
3|Blog 3|someone|2015-11-11 15:22:35.093902|2015-11-11 15:22:35.093902|13|Post 3-3|2015-11-11 15:22:35.108775|2015-11-11 15:22:35.108775|3
3|Blog 3|someone|2015-11-11 15:22:35.093902|2015-11-11 15:22:35.093902|14|Post 3-4|2015-11-11 15:22:35.112654|2015-11-11 15:22:35.112654|3
3|Blog 3|someone|2015-11-11 15:22:35.093902|2015-11-11 15:22:35.093902|15|Post 3-5|2015-11-11 15:22:35.117601|2015-11-11 15:22:35.117601|3
```

> The longer and more complex the result set, the more this matters because the more objects Rails would have to deal with. Allocating and deallocating several hundreds or thousands of small duplicated objects is never a good deal.

As `includes` can behave the same as `eager_load` in one case, but better in the other case. My conclusion is, **prefer `includes` over `eager_load`**.

### references

- Works only with `includes`, makes `includes` behaves like `eager_load`

```sh
> Blog.includes(:posts).where(name: 'Blog 1').references(:posts)
  SQL (0.2ms)  SELECT "blogs"."id" AS t0_r0, "blogs"."name" AS t0_r1, "blogs"."author" AS t0_r2, "blogs"."created_at" AS t0_r3, "blogs"."updated_at" AS t0_r4, "posts"."id" AS t1_r0, "posts"."title" AS t1_r1, "posts"."created_at" AS t1_r2, "posts"."updated_at" AS t1_r3, "posts"."blog_id" AS t1_r4 FROM "blogs" LEFT OUTER JOIN "posts" ON "posts"."blog_id" = "blogs"."id" WHERE "blogs"."name" = ?  [["name", "Blog 1"]]
```

### joins

*INNER JOIN*, compared to `eager_load` (*LEFT OUTER JOIN*).

```sh
> Blog.joins(:posts)
  Blog Load (0.2ms)  SELECT "blogs".* FROM "blogs" INNER JOIN "posts" ON "posts"."blog_id" = "blogs"."id"
```

**compared to `eager_load`**

Query by `joins` just returns the raw data, whereas the data from `eager_load` is filtered by Rails.

```sh
> Blog.joins(:posts).count
   (0.3ms)  SELECT COUNT(*) FROM "blogs" INNER JOIN "posts" ON "posts"."blog_id" = "blogs"."id"
 => 15
> Blog.eager_load(:posts).count
   (0.4ms)  SELECT COUNT(DISTINCT "blogs"."id") FROM "blogs" LEFT OUTER JOIN "posts" ON "posts"."blog_id" = "blogs"."id"
 => 3
```

So you need to take caution about iteration on `joins` query.

```sh
> Blog.joins(:posts).each do |blog|
>   puts blog.posts.map(&:title).join(', ')
> end
  Blog Load (0.2ms)  SELECT "blogs".* FROM "blogs" INNER JOIN "posts" ON "posts"."blog_id" = "blogs"."id"
  Post Load (0.3ms)  SELECT "posts".* FROM "posts" WHERE "posts"."blog_id" = ?  [["blog_id", 1]]
Post 1-1, Post 1-2, Post 1-3, Post 1-4, Post 1-5
  Post Load (0.1ms)  SELECT "posts".* FROM "posts" WHERE "posts"."blog_id" = ?  [["blog_id", 1]]
Post 1-1, Post 1-2, Post 1-3, Post 1-4, Post 1-5
  Post Load (0.1ms)  SELECT "posts".* FROM "posts" WHERE "posts"."blog_id" = ?  [["blog_id", 1]]
Post 1-1, Post 1-2, Post 1-3, Post 1-4, Post 1-5
  Post Load (0.1ms)  SELECT "posts".* FROM "posts" WHERE "posts"."blog_id" = ?  [["blog_id", 1]]
Post 1-1, Post 1-2, Post 1-3, Post 1-4, Post 1-5
  Post Load (0.1ms)  SELECT "posts".* FROM "posts" WHERE "posts"."blog_id" = ?  [["blog_id", 1]]
Post 1-1, Post 1-2, Post 1-3, Post 1-4, Post 1-5
  Post Load (0.1ms)  SELECT "posts".* FROM "posts" WHERE "posts"."blog_id" = ?  [["blog_id", 2]]
Post 2-1, Post 2-2, Post 2-3, Post 2-4, Post 2-5
  Post Load (0.1ms)  SELECT "posts".* FROM "posts" WHERE "posts"."blog_id" = ?  [["blog_id", 2]]
Post 2-1, Post 2-2, Post 2-3, Post 2-4, Post 2-5
  Post Load (0.1ms)  SELECT "posts".* FROM "posts" WHERE "posts"."blog_id" = ?  [["blog_id", 2]]
Post 2-1, Post 2-2, Post 2-3, Post 2-4, Post 2-5
  Post Load (0.1ms)  SELECT "posts".* FROM "posts" WHERE "posts"."blog_id" = ?  [["blog_id", 2]]
Post 2-1, Post 2-2, Post 2-3, Post 2-4, Post 2-5
  Post Load (0.1ms)  SELECT "posts".* FROM "posts" WHERE "posts"."blog_id" = ?  [["blog_id", 2]]
Post 2-1, Post 2-2, Post 2-3, Post 2-4, Post 2-5
  Post Load (0.1ms)  SELECT "posts".* FROM "posts" WHERE "posts"."blog_id" = ?  [["blog_id", 3]]
Post 3-1, Post 3-2, Post 3-3, Post 3-4, Post 3-5
  Post Load (0.2ms)  SELECT "posts".* FROM "posts" WHERE "posts"."blog_id" = ?  [["blog_id", 3]]
Post 3-1, Post 3-2, Post 3-3, Post 3-4, Post 3-5
  Post Load (0.1ms)  SELECT "posts".* FROM "posts" WHERE "posts"."blog_id" = ?  [["blog_id", 3]]
Post 3-1, Post 3-2, Post 3-3, Post 3-4, Post 3-5
  Post Load (0.1ms)  SELECT "posts".* FROM "posts" WHERE "posts"."blog_id" = ?  [["blog_id", 3]]
Post 3-1, Post 3-2, Post 3-3, Post 3-4, Post 3-5
  Post Load (0.1ms)  SELECT "posts".* FROM "posts" WHERE "posts"."blog_id" = ?  [["blog_id", 3]]
Post 3-1, Post 3-2, Post 3-3, Post 3-4, Post 3-5
```

- - -

**Reference**

- [Remove N+1 queries in your Ruby on Rails app](http://blog.diatomenterprises.com/remove-n1-queries-in-your-ruby-on-rails-app/?utm_source=rubyweekly&utm_medium=email)
- [Rails :include vs. :joins](http://stackoverflow.com/questions/1208636/rails-include-vs-joins?rq=1)
- [Preload, Eagerload, Includes and Joins](http://blog.bigbinary.com/2013/07/01/preload-vs-eager-load-vs-joins-vs-includes.html)
- [Rolling with Rails 2.1 - The First Full Tutorial - Part 2](http://www.akitaonrails.com/2008/5/26/rolling-with-rails-2-1-the-first-full-tutorial-part-2)


