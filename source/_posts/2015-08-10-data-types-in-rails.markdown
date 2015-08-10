---
layout: post
title: "Data Types in Rails"
date: 2015-08-10 17:45:53 +0800
comments: true
categories: ['Ruby', 'Rails']
---

***Have you ever got annoyed with data types when you are creating Rails migrations?***

***What's the full list of data types in Rails? Does it differ from MySQL to PostgreSQL?***

***When adding a `title` field to `Post` table, should we use `title` as a `string` or `text`? Same answer with MySQL and PostgreSQL?***


You may want to check the Rails guides of [Active Record Migrations](http://edgeguides.rubyonrails.org/active_record_migrations.html), but all you get is disappointment because its lacking of essential information about data types.

Here is a quick entry about data types which I extracts from Rails API and Stack Overflow.

## General Data Type

> From [ActiveRecord::ConnectionAdapters::TableDefinition#column](http://api.rubyonrails.org/classes/ActiveRecord/ConnectionAdapters/TableDefinition.html#method-i-column)

Instantiates a new column for the table. The type parameter is normally one of the migrations native types, which is one of the following: 

+ `:primary_key`
+ `:string`
+ `:text`
+ `:integer`
+ `:float`
+ `:decimal`
+ `:datetime`
+ `:time`
+ `:date`
+ `:binary`
+ `:boolean`

## Specific DBMS Data Type

> From Psylone's answer on [Where is the documentation page for ActiveRecord data types?](http://stackoverflow.com/a/17279395/1331774)

Check the specific DB adaptor in source code.

``` ruby MySQL Data Types https://github.com/rails/rails/blob/master/activerecord/lib/active_record/connection_adapters/abstract_mysql_adapter.rb#L244-L256 link
NATIVE_DATABASE_TYPES = {
  :primary_key => "int(11) auto_increment PRIMARY KEY",
  :string      => { :name => "varchar", :limit => 255 },
  :text        => { :name => "text" },
  :integer     => { :name => "int", :limit => 4 },
  :float       => { :name => "float" },
  :decimal     => { :name => "decimal" },
  :datetime    => { :name => "datetime" },
  :time        => { :name => "time" },
  :date        => { :name => "date" },
  :binary      => { :name => "blob" },
  :boolean     => { :name => "tinyint", :limit => 1 }
}
```

``` ruby PostgreSQL Data Types https://github.com/rails/rails/blob/master/activerecord/lib/active_record/connection_adapters/postgresql_adapter.rb#L77-L112 link
NATIVE_DATABASE_TYPES = {
  primary_key: "serial primary key",
  bigserial: "bigserial",
  string:      { name: "character varying" },
  text:        { name: "text" },
  integer:     { name: "integer" },
  float:       { name: "float" },
  decimal:     { name: "decimal" },
  datetime:    { name: "timestamp" },
  time:        { name: "time" },
  date:        { name: "date" },
  daterange:   { name: "daterange" },
  numrange:    { name: "numrange" },
  tsrange:     { name: "tsrange" },
  tstzrange:   { name: "tstzrange" },
  int4range:   { name: "int4range" },
  int8range:   { name: "int8range" },
  binary:      { name: "bytea" },
  boolean:     { name: "boolean" },
  bigint:      { name: "bigint" },
  xml:         { name: "xml" },
  tsvector:    { name: "tsvector" },
  hstore:      { name: "hstore" },
  inet:        { name: "inet" },
  cidr:        { name: "cidr" },
  macaddr:     { name: "macaddr" },
  uuid:        { name: "uuid" },
  json:        { name: "json" },
  jsonb:       { name: "jsonb" },
  ltree:       { name: "ltree" },
  citext:      { name: "citext" },
  point:       { name: "point" },
  bit:         { name: "bit" },
  bit_varying: { name: "bit varying" },
  money:       { name: "money" },
}
```

Or, use `ActiveRecord::Base.connection.native_database_types.keys` to get all valid data types based on your database adaptor.

```ruby
# PostgreSQL
[1] pry(main)> ActiveRecord::Base.connection.native_database_types.keys
[
  [ 0] :primary_key,
  [ 1] :bigserial,
  [ 2] :string,
  [ 3] :text,
  [ 4] :integer,
  [ 5] :float,
  [ 6] :decimal,
  [ 7] :datetime,
  [ 8] :time,
  [ 9] :date,
  [10] :daterange,
  [11] :numrange,
  [12] :tsrange,
  [13] :tstzrange,
  [14] :int4range,
  [15] :int8range,
  [16] :binary,
  [17] :boolean,
  [18] :bigint,
  [19] :xml,
  [20] :tsvector,
  [21] :hstore,
  [22] :inet,
  [23] :cidr,
  [24] :macaddr,
  [25] :uuid,
  [26] :json,
  [27] :jsonb,
  [28] :ltree,
  [29] :citext,
  [30] :point,
  [31] :bit,
  [32] :bit_varying,
  [33] :money
]
```

There is another guide about [Active Record and PostgreSQL](http://edgeguides.rubyonrails.org/active_record_postgresql.html).

> From gotqn's answer on [Rails 4 datatypes?](http://stackoverflow.com/a/25702629/1331774)

Rails data types mapping to different DB data types:

![Data Types 1](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/data_types_1.png)
![Data Types 2](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/data_types_2.png)


## Data Type Shortcut When Generating Model

> From tomascharad's answer on [Rails 4 datatypes?](http://stackoverflow.com/questions/17918117/rails-4-datatypes)

```sh
$ rails generate model -h

Available field types:

    Just after the field name you can specify a type like text or boolean.
    It will generate the column with the associated SQL type. For instance:

        `rails generate model post title:string body:text`

    will generate a title column with a varchar type and a body column with a text
    type. If no type is specified the string type will be used by default.
    You can use the following types:

        integer
        primary_key
        decimal
        float
        boolean
        binary
        string
        text
        date
        time
        datetime

    You can also consider `references` as a kind of type. For instance, if you run:

        `rails generate model photo title:string album:references`

    It will generate an `album_id` column. You should generate these kinds of fields when
    you will use a `belongs_to` association, for instance. `references` also supports
    polymorphism, you can enable polymorphism like this:

        `rails generate model product supplier:references{polymorphic}`

    For integer, string, text and binary fields, an integer in curly braces will
    be set as the limit:

        `rails generate model user pseudo:string{30}`

    For decimal, two integers separated by a comma in curly braces will be used
    for precision and scale:

        `rails generate model product 'price:decimal{10,2}'`

    You can add a `:uniq` or `:index` suffix for unique or standard indexes
    respectively:

        `rails generate model user pseudo:string:uniq`
        `rails generate model user pseudo:string:index`

    You can combine any single curly brace option with the index options:

        `rails generate model user username:string{30}:uniq`
        `rails generate model product supplier:references{polymorphic}:index`

    If you require a `password_digest` string column for use with
    has_secure_password, you should specify `password:digest`:

        `rails generate model user password:digest`

```

## Should you choose string or text?

In **MySQL**

> From tjeezy's answer and Omar Qureshi's comment on [Difference between string and text in rails?](http://stackoverflow.com/a/3354452/1331774)

```
:string |                   VARCHAR                | :limit => 1 to 255 (default = 255)
:text   | TINYTEXT, TEXT, MEDIUMTEXT, or LONGTEXT2 | :limit => 1 to 4294967296 (default = 65536)
```

So you'd better specify the `:limit` as a reminder to yourself that there is a limit and you should have a validation in the model to ensure that the limit is not exceeded.

And, you can have indexes on `varchars`, you cannot on `text`.

In **Postgresql**

> From PostgreSQL Manual [Character Types](http://www.postgresql.org/docs/9.3/interactive/datatype-character.html)

There is no performance difference among these three types, apart from increased storage space when using the blank-padded type, and a few extra CPU cycles to check the length when storing into a length-constrained column. While `character(n)` has performance advantages in some other database systems, there is no such advantage in PostgreSQL; in fact `character(n)` is usually the slowest of the three because of its additional storage costs. In most situations `text` or `character` varying should be used instead.

> From Omar Qureshi's answer on [Difference between string and text in rails?](http://stackoverflow.com/questions/3354330/difference-between-string-and-text-in-rails)

If you are using postgres use `text` wherever you can, unless you have a size constraint since there is no performance penalty for `text` vs `varchar`.

> From mu is too short's answer on [rails 3/postgres - how long is a string if you don't apply :limit in schema](http://stackoverflow.com/questions/8129776/rails-3-postgres-how-long-is-a-string-if-you-dont-apply-limit-in-schema) and [Changing a column type to longer strings in rails](http://stackoverflow.com/questions/8694273/changing-a-column-type-to-longer-strings-in-rails/8694483#8694483)

```
:string | character varying (255)
:text   | text
```

There's no reason to use `:string` (AKA `varchar`) at all, the database treats `text` and `varchar(n)` the same internally except for the extra length constraints for `varchar(n)`; you should only use `varchar(n)` (AKA `:string`) if you have an external constrain on the column size.

