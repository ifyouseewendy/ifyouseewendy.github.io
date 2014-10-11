---
layout: post
title: "[Review] Rebuilding Rails"
date: 2014-09-27 14:48:48 +0800
comments: true
categories: ['Books', 'Rails']
---

{:.custom}
| **Book**    | Rebuilding Rails
| **Author**  | Noah Gibbs
| **Link**    | [rebuilding-rails.com](http://rebuilding-rails.com/)

* TOC
{:toc}

My re-building source code

+ [rulers](https://github.com/ifyouseewendy/rulers)
+ [best_quotes](https://github.com/ifyouseewendy/best_quotes)

Work flow diagram

<img src="https://raw.githubusercontent.com/ifyouseewendy/best_quotes/master/rebuilding-rails.png" alt="img texrebuilding-rails" style="width:562px"/>

## 1. Zero to “It Works!”

```ruby
gem.add_development_dependency "rspec"
gem.add_runtime_dependency "rest-client"
gem.add_runtime_dependency "some_gem", "1.3.0"
gem.add_runtime_dependency "other_gem", ">0.8.2"
```

Each of these adds a runtime dependency (needed to run the gem at all) or a development dependency (needed to develop or test the gem).

Youʼll need to go into the rulers directory and `git add .` before you rebuild the gem (`git add .; gem build rulers.gemspec; gem install rulers-0.0.1.gem`). Thatʼs because rulers.gemspec is actually calling git to find out what files to include in your gem.

**Rails structure**

+ **ActiveSupport** is a compatibility library including methods that aren't necessarily specific to Rails. You'll see ActiveSupport used by non-Rails libraries because it contains such a lot of useful baseline functionality. ActiveSupport includes methods like how Rails changes words from single to plural, or CamelCase to snake_case. It also includes significantly better time and date support than the Ruby standard library.

+ **ActiveModel** hooks into features of your models that aren't really about the database - for instance, if you want a URL for a given model, ActiveModel helps you there. It's a thin wrapper around many different ActiveModel implementations to tell Rails how to use them. Most commonly, ActiveModel implementations are ORMs (see ActiveRecord, below), but they can also use non-relational storage like MongoDB, Redis, Memcached or even just local machine memory.

+ **ActiveRecord** is an Object-Relational Mapper (ORM). That means that it maps between Ruby objects and tables in a SQL database. When you query from or write to the SQL database in Rails, you do it through ActiveRecord. ActiveRecord also implements ActiveModel. ActiveRecord supports MySQL and SQLite, plus JDBC, Oracle, PostgreSQL and many others.

+ **ActionPack** (*ActionDispatch, ActionController, Actionview*) does routing - the mapping of an incoming URL to a controller and action in Rails. It also sets up your controllers and views, and shepherds a request through its controller action and then through rendering the view. For some of it, ActionPack uses Rack. The template rendering itself is done through an external gem like Erubis for .erb templates, or Haml for .haml templates. ActionPack also handles action- or view-centered functionality like view caching.

+ **ActionMailer** is used to send out email, especially email based on templates. It works a lot like you'd hope Rails email would, with controllers, actions and "views" - which for email are text- based templates, not regular web-page templates.


## 2. Your First Controller

Rails encapsulated the Rack information into a “request” object rather than just including the hash right into the controller. Thatʼs a good idea when you want to abstract it a bit -- normalize values for certain variables, for instance, or read and set cookies to store session data.


## 3. Rails Automatic Loading

When debugging or printing error messages I like to use STDERR because itʼs a bit harder to redirect than a normal “puts” and so youʼre more likely to see it even when using a log file, background process or similar.

For simple structures, “inspect” shows them exactly as youʼd type them into Ruby -- strings with quotes, numbers bare, symbols with a leading colon and so on.

**Reloading Means Convenience**

`gem "rulers", :path => "../rulers"` This trick actually relies on deep Bundler trickery and requires you to always “bundle exec” before running things like rackup. If you forget that, it can look like the gem isnʼt there or (worse) look like an old version.

**CamelCase and snake_case**

```ruby
# rulers/lib/rulers/util.rb
module Rulers
  def self.to_underscore(string)
    string.gsub(/::/, '/').
    gsub(/([A-Z]+)([A-Z][a-z])/,'\1_\2').
    gsub(/([a-z\d])([A-Z])/,'\1_\2').
    tr("-", "_").
    downcase
  end
end

# 'HTTPController' -> 'http_controller'
# 'MD5Controller' -> 'md5_controller'
# 'HomeController' -> 'home_controller'
```

**Put it together**

```ruby
# rulers/lib/rulers/dependencies.rb
class Object
  def self.const_missing(c)
    require Rulers.to_underscore(c.to_s)
    Object.const_get(c)
  end
end
```

```ruby
# rulers/lib/rulers/controller.rb
def controller_name
  klass = self.class
  klass = klass.to_s.gsub /Controller$/, ""
  Rulers.to_underscore klass
end
```

**Did it work?**

When you load a file called whatever_class.rb, youʼre not actually guaranteed that it contains WhateverClass, or that the constant WhateverClass is actually a class. How would you check?

You might try calling const_get(:WhateverClass)... Except that you just made const_get try to load automatically. If you call it on an unloaded class inside the method call where you try to load, youʼll recurse forever and get a “stack level too deep” and a crash. So const_get isnʼt the full answer.

```ruby
# rulers/lib/rulers/dependencies.rb
class Object
  def self.const_missing(c)
    return nil if @calling_const_missing
    
    @calling_const_missing = true
    require Rulers.to_underscore(c.to_s)
    klass = Object.const_get(c)
    @calling_const_missing = false
    
    klass
  end
end
```

But thereʼs a reason I say “hideously hacky.” Think about ways this could break. For instance -- think about what would happen if you hit this in multiple threads at once. Oops!

**Re-re-reloading**

[rerun](https://github.com/alexch/rerun)

```ruby
# best_quotes/Gemfile
source 'https://rubygems.org'
gem 'rulers', :path => "../rulers"
    
group :development do
  gem 'rerun'
  gem 'listen', '=1.3.1' # for older Ruby
end
```

Running by `bundle exec rerun -- rackup -p 3001`. The “--” is an old Unix trick. It means “thatʼs all the arguments you get, the rest belong to somebody else.” Specifically, it tells rerun to ignore the “-p” later.

[shotgun](https://github.com/rtomayko/shotgun)

reloading rack development server, forking version of rackup.

**In Rails**

1. [rails/activesupport/lib/active_support/dependencies.rb](https://github.com/rails/rails/blob/master/activesupport/lib/active_support/dependencies.rb) Rails uses ActiveSupport for its const_missing support. Most of the code is installing a const_missing that can call through to non-Rails versions of const_missing in other classes, and can be removed or re-added and is appropriately modular. It also works hard to support nested modules like MyLibrary::SubModule::SomeClass.

2. [Rails autoloading — how it works, and when it doesn't](http://urbanautomaton.com/blog/2013/08/27/rails-autoloading-hell/#fn1) by Simon Coffey.

## 4. Rendering Views

**Erb and Erubis**

```ruby
# some_directory/erb_test.rb
require "erubis"

template = <<TEMPLATE
Hello! This is a template.
It has <%= whatever %>.
TEMPLATE

eruby = Erubis::Eruby.new(template)
puts eruby.src
puts "=========="
puts eruby.result(:whatever => "ponies!")
```

Run it with `ruby erb_test.rb`

```ruby
bash-3.2$ ruby erb_test.rb
_buf = ''; _buf << 'Hello!   This is a template. It has ';
_buf << ( whatever ).to_s; _buf << '.';
_buf.to_s
==========
Hello! This is a template.
It has ponies!.
```

The few lines starting with `_buf` are interesting. Erubis takes apart our string, appends it to `_buf` piece by piece, and adds the variables in as well after calling `.to_s` on them. Then it just returns `_buf`.

**Rack test example**

[rack-test](https://github.com/brynary/rack-test)


```ruby
require_relative "test_helper"

class TestApp < Rulers::Application
  def get_controller_and_action(env)
    [TestController, "index"]
  end
end

class TestController < Rulers::Controlle
  def index
    "Hello!"  # Not rendering a view
  end
end

class RulersAppTest < Test::Unit::TestCase
 include Rack::Test::Methods
 
  def app
    TestApp.new
  end
  
  def test_request
    get "/example/route"
    assert last_response.ok?
    body = last_response.body
    assert body["Hello"]
  end
end
```

**Rake test example**

Rake actually ships with a “Rake::TestTask”.

```ruby
# Rakefile
require "bundler/gem_tasks"
require "rake/testtask"

Rake::TestTask.new do |t|
  t.name = "test"  # this is the default
  t.libs << "test"  # load the test dir
  t.test_files = Dir['test/*test*.rb']
  t.verbose = true
end
```

*A word of caution*: Rake will always run your tests by loading them into the same Ruby process, then running each one in turn. This is a lot faster than running them in individual processes, but it means that your tests can mess with each other in annoying ways. If you find yourself saying, “but I didnʼt set that global variable in this test!” think about whether some other test might have done it. For extra fun, the tests donʼt always run in any predictable order.

**In Rails**

Rails actually allows registering a number of different template engines at once with a number of different extensions so that Erb files are rendered with Erubis, but .haml files are rendered with the HAML templating engine.

You can find the top-level view code in [actionpack/lib/action_view.rb](https://github.com/rails/rails/blob/master/actionview/lib/action_view.rb), and the whole big chunk of Rails view code in actionpack/lib/action_view/. From there, look in [template/handlers/erb.rb](https://github.com/rails/rails/blob/master/actionview/lib/action_view/template/handlers/erb.rb) for a pretty compact description of exactly how Rails uses Erubis to render Erb templates. You can see that most of the bulk of Railsʼ version is setup, interface and dealing with string encodings. You save a lot of trouble by knowing that youʼre basically only dealing with ASCII and/or UTF-8 strings.

## 5. Basic Models

Use [multi_json](https://github.com/intridea/multi_json) (a generic swappable back-end for JSON handling) to built a simple system of models based on JSON files.

**In Rails**

ActiveRecord is an Object-Relational Mapper so that each of your objects represents a database row. ActiveModel is the interface that Rails uses to all of storage including non-relational stores like Cassandra or MongoDB, to fit particular object types into Rails.

For a good overview of ActiveModel, have a look at a blog post from Yehuda Katz on that topic: [ActiveModel: Make Any Ruby Object Feel Like ActiveRecord](http://yehudakatz.com/2010/01/10/activemodel-make-any-ruby-object-feel-like-activerecord/)

## 6. Request, Response


```ruby
# rulers/lib/rulers/controller.rb
module Rulers
  class Controller
    def response(text, status = 200, headers = {})
      raise "Already responded!" if @response
      a = [text].flatten
      @response = Rack::Response.new(a, status, headers)
    end
    
    def get_response  # Only for Rulers
      @response
    end
    
    def render_response(*args)
      response(render(*args))
    end
  end
end

# rulers/lib/rulers.rb
module Ruler
  class Application
    def call(env)   # Redefine
      if env['PATH_INFO'] == '/favicon.ico'
        return [404,
          {'Content-Type' => 'text/html'}, []]
      end
      
      klass, act = get_controller_and_action(env)
      controller = klass.new(env)
      text = controller.send(act)
      if controller.get_response
        # ensure the code after render_response works
        st, hd, rs = controller.get_response.to_a
        [st, hd, [rs.body].flatten]
      else
        # without explicitly render_response in action,
        # you can add auto render here
        [200, {'Content-Type' => 'text/html'}, [text]]
      end
    end
  end
end
```

In Rails, the return value from the controller is ignored. Instead if you donʼt call render (Railsʼ equivalent of render_response), it will automatically call it for you with the same controller name, and the viewʼs name set to the same name as your action.

Rails doesnʼt return the string when you call “render” (well, usually - some calls to render do!). Instead, it keeps track of the fact that you called render and what you called it on. Then it gives you an error if you call it again, or uses the defaults if you get to the end of a controller action without calling it

**Instance Variables**

The Rails answer is to set instance variables in the controller, then use them in the view. Try creating a new view object, mostly just to use Erubis to evaluate the view file. Then, make it easy to pass in a hash of instance variables which youʼll set on the view object before doing the evaluation.

```ruby
# rulers/lib/rulers/controller.rb
module Rulers
  class Controller
    def render(view_name, locals = {})
      filename = File.join 'app', 'views', controller_name, "#{view_name}.html.erb"
      ivars = instance_variables.reduce({}) {|ha, iv| ha[iv] = instance_variable_get(iv); ha }
      Rulers::View.new(filename, ivars, locals).result
    end
  end
end
```

**In Rails**

Rails (more specifically, ActionPack) uses Rack in a very similar way, even exposing the Rack Request object with the “request” method. Especially [metal.rb ](https://github.com/rails/rails/blob/master/actionpack%2Flib%2Faction_controller%2Fmetal.rb)and metal/*.rb. “Rails Metal” is a name for the lower-level Rails which goes mostly straight through to the “bare metal” -- that is, to Rack.

You can find a lot of the Rails implementation of Rack in these directories -- for instance, metal/redirecting.rb is the implementation of the redirect_to() helper which returns status 302 (redirect) and a location to Rack. You could steal the code and add a redirect_to to Rulers, if you wanted.

You can also find things like forgery (CSRF) protection, multiple renderers (i.e. Erb vs Haml), forcing SSL if requested and cookies in this directory. Some are complex, while others call to Rack very simply and you could move right over to Rulers.

## 7. The Littlest ORM

migration

```ruby
# best_quotes/mini_migration.rb
require "sqlite3"
conn = SQLite3::Database.new "test.db"
conn.execute <<SQL
create table my_table (
  id INTEGER PRIMARY KEY,
  posted INTEGER,
  title VARCHAR(30),
  body VARCHAR(32000));
SQL
```

sqlite model

```ruby
# rulers/lib/rulers/sqlite_model.rb
require "sqlite3"
require "rulers/util"

DB = SQLite3::Database.new "test.db"

module Rulers
  module Model
    class SQLite

      class << self
        def table
          Rulers.to_underscore name
        end

        def schema
          return @schema if @schema
          @schema = {}
          DB.table_info(table) do |row|
            @schema[ row['name'] ] = row['type']
          end
          @schema
        end

        def to_sql(val)
          case val
          when Numeric
            val.to_s
          when String
            "'#{val}'"
          else
            raise "Can't change #{val.class} to SQL!"
          end
        end

        def create(values)
          values.delete 'id'
          keys = schema.keys - ['id']
          vals = keys.map do |key|
            values[key] ? to_sql(values[key]) : 'null'
          end

          DB.execute <<SQL
            INSERT INTO #{table} (#{keys.join(',')})
            VALUES (#{vals.join(',')});
SQL

          data = Hash[keys.zip(vals)]
          sql = "SELECT last_insert_rowid();"
          data['id'] = DB.execute(sql)[0][0]
          self.new data
        end

        def count
          DB.execute(<<SQL)[0][0]
            SELECT COUNT(*) FROM #{table}
SQL
        end

        def find(id)
          row = DB.execute <<SQL
            SELECT #{schema.keys.join(',')} from #{table} where id=#{id}
SQL
          data = Hash[ schema.keys.zip row[0] ]
          self.new data
        end
      end

      def initialize(data = nil)
        @hash = data
      end

      def [](name)
        @hash[name.to_s]
      end

      def []=(name, value)
        @hash[name.to_s] = value
      end

      def save!
        unless @hash['id']
          self.class.create
          return true
        end

        fields = @hash.map do |k,v|
          "#{k}=#{self.class.to_sql(v)}"
        end.join(',')

        DB.execute <<SQL
          UPDATE #{self.class.table}
          SET #{fields}
          WHERE id="#{@hash['id']}"
SQL
        true
      end

      def save
        save! rescue false
      end

    end
  end
end
```

You can add a method to the SQLite model that takes a column name and a type, and then when saving and loading that column, does something type-dependent to it, like the boolean or JSON fields above.

ActiveRecord allows both ways -- you can research the `before_save` and `after_initialize` callbacks for how to do it on save/ load.

**In Rails**

ActiveRecord contains mappings of operations like our gem, but also migrations, cross-database compatibility and a huge amount of optimization and general complexity. And thatʼs even though they use the ARel gem for most of the heavy lifting!

## 8. Rack Middleware

With any Ruby web framework, you can modify how it works by adding Rack components around it. I like thinking of them as pancakes, because Rack lets you build your framework and your application like a stack of pancakes.

**Built-in middlewares**

+ **Rack::Auth::Basic** - HTTP Basic authentication.
+ **Rack::Auth::Digest** - HTTP Digest authentication.
+ **Rack::Cascade** - Pass a request to a series of Rack apps, and use the first request that comes back as good. Itʼs a way to mount one Rack app “on top of” another (or many).
+ **Rack::Chunked** - A Rack interface to HTTP Chunked transfer.
+ **Rack::CommonLogger** - Request logging.
+ **Rack::ConditionalGet** - Implement HTTP If-None-Match and If- Modified-Since with ETags and dates.
+ **Rack::Config** - Call a given block before each request.
+ **Rack::ContentLength** - Set Content-Length automatically.
+ **Rack::ContentType** - Try to guess Content-Type and set it. Rack::Deflater - Compress the response with gzip/deflate.
+ **Rack::Directory** - Add Apache-style directory listings. This is an endpoint not an intermediate layer, so use it with “run.”
+ **Rack::ETag** - Generate ETags from MD5s of the content.
+ **Rack::Head** - Remove response body for HEAD requests.
+ **Rack::Lint** - Check your responses for correctness.
+ **Rack::Lock** - Only allow one thread in at once.
+ **Rack::Reloader** - Reload your app when files change.
+ **Rack::Runtime** - Times the request, sets X-Runtime in response.
+ **Rack::Sendfile** - Use the X-Sendfile header to ask your web server to send a file much faster than Ruby can.
+ **Rack::ShowExceptions** - Show a nice exception page if something breaks.
+ **Rack::ShowStatus** - Show a pretty page if the result is empty.
+ **Rack::Static** - Serve from certain directories as static files instead
of calling your framework.
+ **Rack::URLMap** - Route different directories to different apps or different stacks. You can also use this with a “map” block in config.ru.

Rack::URLMap is a way to tell Rack what paths go to what Rack apps - and if thereʼs could be two that match, the longer path always takes precedence.

Rack::ContentType is to set the default HTML content type for everything. Since itʼs at the top, outside the blocks, it applies to all the blocks.

The lobster, by the way, is a simple test app built into Rack. Youʼll see it as an example in many places.

**Thrid-party middlewares**

+ [rack-contrib](https://github.com/rack/rack-contrib)
+ [middlewares listed in rack wiki](https://github.com/rack/rack/wiki/List-of-Middleware)

**In Rails**

The primary Rack application object in Rails is called ActionController::Dispatcher.

ActionController::Base allows you to get mini-Rack-apps for each controller action because it inherits from Metal, the basic Rails Rack class. So you can call MyController.action(:myaction) and get a Rack app for that action in your controller.

**Calling order of Rack middlewares**

```ruby
class Foo
  def initialize(app, arg = '')
    puts '--> Foo#init'
    @app = app
    @arg = arg
    puts '--> Foo#initend'
  end

  def call(env)
    puts '--> Foo#call'
    status, headers, content = @app.call(env)
    content[0] += "#{@arg}"
    puts '--> Foo#callend'
    [ status, headers, content ]
  end
end

class Bar
  def initialize(app, arg = '')
    puts '--> Bar#init'
    @app = app
    @arg = arg
    puts '--> Bar#initend'
  end

  def call(env)
    puts '--> Bar#call'
    status, headers, content = @app.call(env)
    content[0] += "#{@arg}"
    puts '--> Bar#callend'
    [ status, headers, content ]
  end
end

use Foo, ', foo'
use Bar, ', bar'

run proc {
  puts '--> main#call'
  [200, {'Content-Type' => 'text/html'}, ['Hello, world']]
}

# $ rackup
# --> Bar#init
# --> Bar#initend
# --> Foo#init
# --> Foo#initend
# Thin web server (v1.6.1 codename Death Proof)
# Maximum connections set to 1024
# Listening on 0.0.0.0:9292, CTRL+C to stop
#
# --> Foo#call
# --> Bar#call
# --> main#call
# --> Bar#callend
# --> Foo#callend
# 127.0.0.1 - wendi [23/Sep/2014 15:56:20] "GET / HTTP/1.1" 200 - 0.0013
```

Other samples:

+ [lobster](https://gist.github.com/ifyouseewendy/15dd511d2d939e432068#file-config-lobster-ru)
+ [auth](https://gist.github.com/ifyouseewendy/15dd511d2d939e432068#file-config-auth-ru)
+ [benchmark](https://gist.github.com/ifyouseewendy/15dd511d2d939e432068#file-config-benchmark-ru)


## 9. Real Routing

Rails 3 takes this a half-step farther and makes every action on every controller a full-on Rack app that you can extract and use.

Add RouteObject class.

```ruby
class RouteObject
  def initialize
    @rules = []
  end

  # save routing rules
  def match(url, *args)
    options = {}
    options = args.pop if args[-1].is_a?(Hash)
    options[:default] ||= {}

    dest = nil
    dest = args.pop if args.size > 0
    raise 'Too many args!' if args.size > 0

    parts = url.split('/')
    parts.select!{|p| !p.empty? }

    vars = []
    regexp_parts = parts.map do |part|
      if part[0] == ':'
        vars << part[1..-1]
        "([a-zA-Z0-9_]+)"
      elsif part[0] == '*'
        vars << part[1..-1]
        "(.*)"
      else
        part
      end
    end

    regexp = regexp_parts.join('/')
    @rules.push({
      :regexp => Regexp.new("^/#{regexp}$"),
      :vars => vars,
      :dest => dest,
      :options => options
    })
  end

  # match rules to url and route to specific controller action.
  # 
  # 1. the router just applies them in order -- if more than
  #    one rule matches, the first one wins.
  # 2. the second argument can be a Rack application, 
  #    which Rails then calls.
  def check_url(url)
    @rules.each do |r|
      m = r[:regexp].match(url)

      if m
        options = r[:options]
        params = options[:default].dup

        r[:vars].each_with_index do |v, i|
          params[v] = m.captures[i]
        end

        if r[:dest]
          return get_dest(r[:dest], params)
        else
          controller = params['controller']
          action = params['action']
          return get_dest("#{controller}##{action}", params)
        end
      end
    end

    nil
  end

  def get_dest(dest, routing_params = {})
    return dest if dest.respond_to?(:call)

    if dest =~ /^([^#]+)#([^#]+)$/
      name = $1.capitalize
      cont = Object.const_get("#{name}Controller")
      return cont.action($2, routing_params)
    end

    raise "No destination: #{dest.inspect}!"
  end
end
```

Define `route` to save rules in an instance of RouteObject, and use `get_rack_app` to route to controller actions. 

```ruby
module Rulers
  class Application
    def route(&block)
      @route_obj ||= RouteObject.new
      @route_obj.instance_eval(&block)
    end

    def get_rack_app(env)
      raise 'No routes!' unless @route_obj
      @route_obj.check_url env['PATH_INFO']
    end
  end
end
```

Update Rulers::Controller to use `self.action` to initialize rack app, and `dispatch` to specific action.

```ruby
# rulers/lib/rulers/controller.rb
module Rulers
  class Controller
    include Rulers::Model

    def initialize(env)
      @env = env
      @routing_params = {}
    end

    def env
      @env
    end

    def self.action(act, p = {})
      proc {|e| self.new(e).dispatch(act, p) }
    end

    def dispatch(action, routing_params = {})
      @routing_params = routing_params

      self.send(action)
      render_response action.to_sym unless get_response
      st, hd, rs = get_response.to_a
      [st, hd, [rs.body].flatten]
    end
    
    def params
      request.params.merge @routing_params
    end
  
  end
end
```

**In Rails**

Rails connects lots of tiny Rack applications into a single overall application. Itʼs a complicated, multi-layered construction.

Each Rails controller keeps track of a mini-Rack stack of middleware which can be specified per-action like before_filters.

