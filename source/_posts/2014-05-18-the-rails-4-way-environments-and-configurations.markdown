---
layout: post
title: "The Rails 4 Way - Environments and Configurations"
date: 2014-05-18 16:10:42 +0800
comments: true
categories: [Rails, Books]
---

{:.custom}
| **Book**    | The Rails 4 Way
| **Author**  | Obie Fernandez, Kevin Faustino, Vitaly Kushner
| **Link**    | [amzn.com/0321944275](http://amzn.com/0321944275)


## Bundler [ref](http://bundler.io)

Bundler does gem dependency resolution based on Gemfile.

#### `~>` operator

The specifier **~>** has a special meaning, best shown by example. `~> 2.0.3` is identical to `>= 2.0.3` and `< 2.1`. `~> 2.1` is identical to `>= 2.1` and `< 3.0`. `~> 2.2.beta` will match prerelease versions like `2.2.beta.12`.

``` ruby hello linenos:false
gem 'thin',  '~>1.1'
```

#### `require`

Occasionally, the name of the gem that should be used in a require statement is
different than the name of that gem in the repository. In those cases, the **:require**
option solves this simply and declaratively right in the Gemfile.

```ruby
gem 'sqlite3-ruby', :require => 'sqlite3'
```

####group

```ruby
gem 'wirble', :group => :development
gem 'ruby-debug', :group => [:development, :test]

group :test do
  gem 'rspec'
end
```

####bundle install/update

```ruby
-> calculate a dependency tree -> generate Gemfile.lock
```

####bundle package

  > it will package up all your gems in **vendor/cache** directory. Running **bundle install** will use the gems in package and skip connecting to rubygems.org. use this to avoid external dependencies at deploy time, or if you depend on private gems that you are not available in any public repository.

####bundle exec

  Non-Rails scripts must be executed with this to get a properly initialized RubyGems environment.

####bundle install --path vender/bundle --binstubs

The default location for gems installed by bundler is directory named **.bundle** in your user directory.

This command will generate **.bundle/config** file:

```ruby .bundle/config
---
BUNDLE_BIN: bundler_stubs
BUNDLE_PATH: vendor/bundle
BUNDLE_DISABLE_SHARED_GEMS: "1"
```

gems in **verdor/cache**, and installed in **vendor/bundle**.

####bundle install vendor --disable-shared-gems

  > This command tells Bundler to install gems even if they are already installed in the system. Normally Bunlder avoids that symlinks to already downloaded gems that exists in your system. This option is useful when you are trying to package up an application that all dependencies unpacked.


## Startup and Application Settings

`boot.rb`

  - sets up Bundler and load paths

`application.rb`

  - require 'boot'
  - load rails gems, gems for the specified Rail.env, and configures the application ( **define Application class** ).

`environment.rb`

  - require 'application'
  - runs all initializers ( `Application.initialize!` )

`environments/development.rb | test.rb | production.rb`

  - makes environmental configuraions.
  - application.rb makes unenvironmental configurations, like time-zone, autoload_paths, encoding.


## Configurations

#### Wrap Parameters

Introduced in Rails 3.1, the `wrap_parameters.rb` initializer configures your application to work with JavaScript MVC frameworks.

When submitting JSON parameters to a controller, Rails will wrap the parameters into a nested hash, with the controller’s name being set as the key. To illustrate, consider the following JSON:

```ruby
{"title": "TheRails4Way"}
```

If a client submitted the above JSON to a controller named ArticlesController, Rails would nest the params hash under the key “article”. This ensures the setting of model attributes from request parameters is consistent with the convention used when submitting from Rails form helpers.

```ruby
{"title": "TheRails4Way", "article" => {"title": "TheRails4Way"}}
```

#### Schema Dumper

```ruby
config.active_record.schema_format = :sql
```

Every time you run tests, Rails dumps the schema of your development database and copies it to the test database using an auto generated `schema.rb` script. It looks very similar to an Active Record migration script; in fact, it uses the same API.

#### Automatic Class Reloading

```ruby
config.cache_classes = false
```

Without getting into too much nitty-gritty detail, when the config.cache_classes setting is true,Rails willuse Ruby’s `require` statement to do its class loading, and when it is false, it will use `load` instead.

When you require a Ruby file, the interpreter executes and caches it. If the file is required again (as in subsequent requests), the interpreter ignores the require statement and moves on. When you load a Ruby file, the interpreter executes the file again, no matter how many times it has been loaded before.

#### Auto-Loading Code

By following the naming convention, Rails will search `$LOAD_PATH` to find the undefined constant. So when using Rails console, **you never have to explicitly `require` anything!**

Rails takes advantage of the fact that Ruby provides a callback mechanism for missing constants. When Rails encounters an undefined constant in the code, it uses a class loader routine based on file-naming conventions to find and require the needed Ruby script.

#### Eager Load

```ruby
config.eager_load = false
```

In your production environment, you will want this set to true, as it copies most of your application in memory. This provides a performance increase to web servers that copy on write, such as Unicorn.


#### Explain for Slow Queries

```ruby
config.active_record.auto_explain_threshold_in_seconds = 0.5
```

Introduced in Rails 3.2, Active Record now monitors the threshold of SQL queries being made. If any query takes longer than the specified threshold, the query plan is logged with a warning.


#### Assets

```ruby
config.assets.debug = true
```

Setting config.assets.debug to false, would result in Sprockets concatenating and running preprocessors on all assets.

```ruby
config.assets.compile = true
```

If an asset is requested that does not exist in the public/assets folder, Rails will throw an exception. To enable live asset compilation fallback on production, set config.assets.compile to true.

```ruby
config.assets.enable = false
```

Like most features in Rails, the usage of the Asset Pipeline is completely optional. To include assets in your project as it was done in Rails 3.0, set config.assets.enabled to false.

#### Tagged Logging [ref](http://arun.im/2011/x-request-id-tracking-taggedlogging-rails)

```ruby
config.log_tags = [ :subdomain, :uuid ]
```

Rails 3.2 introduced the ability to tag your log messages. `:subdomain` example by *www*, `:uuid` is a string to identify request, try `request.uuid`.
