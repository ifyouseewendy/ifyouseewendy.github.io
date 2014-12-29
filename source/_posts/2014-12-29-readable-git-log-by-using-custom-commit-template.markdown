---
layout: post
title: "Readable Git Log by Using Custom Commit Template"
date: 2014-12-29 15:43:39 +0800
comments: true
categories:  ['Git']
---

I was thinking of making my git logs more readable for a long time. Sometimes merge log can help to seperate a set of commits as a feature, but **how can we get more info from the sequential log messages inside a set of commits?**

After doing a little research, I've found [rangzen's answer](http://programmers.stackexchange.com/questions/42110/can-you-recommend-a-good-commit-message-template-guidelines-to-enforce-in-the) on Stack Exchange sounds reasonable.

> With Add, Mod(ify), Ref(actoring), Fix, Rem(ove) and Rea(dability) then it's easy to extract logfile.
> Example :  
> + Add: New function to rule the world.  
> + Mod: Add women factor in Domination.ruleTheWorld().  
> + Ref: Extract empathy stuff to an abstract class.  
> + Fix: RUL-42 or #42 Starvation need to be initialised before Energy to avoid the nullpointer in People.  
> + Rem: freeSpeech is not used anymore.  
> + Rea: Removed old TODO and extra space in header.  

And I want to give it a try by,

1. Setting `git config commit.template` to my customized commit template.
2. Using git `commit-msg` hook to enforce the pattern, validating on commit message.

Here is the details.

## Customize Commit Template

Write a `.gitmessage` template.

```

# = Rule 1, use meta operation

# Add: new function to rule the world
# Mod: query_date logic
# Rem: user.rake is not used anymore
# Ren: hello-world to hell-world
# Fix: #1900, stupid typo
# Ref: extract to an abstract class.
# Opt: cache in get_active_table

# = Rule 2, leave a "*" at the end to flag folding

# Mod: query_date logic*
#
# Use chronic to guess date.
#
# Chronic.parse('may 27th', :guess => false)
# #=> Sun May 27 00:00:00 PDT 2007..Mon May 28 00:00:00 PDT 2007

```

Make git serve it.

```sh
$ git config --global commit.template ~/.gitmessage
```

Now when committing, git enables the template:

```sh
$ git touch README && git commit


# = Rule 1, use meta operation

# Add: new function to rule the world
# Mod: query_date logic
# Rem: user.rake is not used anymore
# Ren: hello-world to hell-world
# Fix: #1900, stupid typo
# Ref: extract to an abstract class.
# Opt: cache in get_active_table

# = Rule 2, leave a "*" at the end to flag folding

# Mod: query_date logic*
#
# Use chronic to guess date.
#
# Chronic.parse('may 27th', :guess => false)
# #=> Sun May 27 00:00:00 PDT 2007..Mon May 28 00:00:00 PDT 2007

# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
# On branch master
# Changes to be committed:
#	new file:   README
#

```

## Validate on Rules

Write a Ruby script, naming `commit-msg` under `.git/hooks`, and make it executable.

```ruby
#!/usr/bin/env ruby

# Init repo
exit 0 if `git log --oneline -1 2>/dev/null`.empty?

message_file = ARGV[0]
lines = File.readlines(message_file).reject{|l| l =~ /^#/}.map(&:strip).reject(&:empty?)

subject_regex = '[Add|Mod|Rem|Ren|Fix|Ref|Opt]:\s\S+'
regex = lines.count > 1 ? /#{subject_regex}\*$/ : /#{subject_regex}/

unless lines[0] =~ regex
  puts "[POLICY] Your message is not formatted correctly"
  puts "[POLICY] Please check ~/.gitmessage.txt"
  exit 1
end
```

Now committing has validations.

```sh
# Rule 1

$ git commit -m 'Add README'
[POLICY] Your message is not formatted correctly
[POLICY] Please check ~/.gitmessage

$ git commit -m 'Add: README'
[master e492ec1] Add: README
 1 file changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 README

# Rule 2

$ git commit -m 'Add: README
quote> 
quote> some content'
[POLICY] Your message is not formatted correctly
[POLICY] Please check ~/.gitmessage

$ git commit -m 'Add: README*
quote> 
quote> some content'
[master 5fdd0f4] Add: README*
 1 file changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 README
```

Here is the final `git log --oneline` look,

```sh
* 0435fa9 2014-12-29 Ref: code smells like..teen spirit [wendi]
* 13423ff 2014-12-29 Fix: #1984 big bro 404 error* [wendi]
* 0c5b9f9 2014-12-29 Add: pygments.rb to enable highlight* [wendi]
* e99d1b5 2014-12-29 Mod: heading sytle [wendi]
* 95576cc 2014-12-29 Ren: README.md [wendi]
* 2f5c632 2014-12-29 Add: README [wendi]
* 6673bd7 2014-12-29 Init [wendi]
```

***How to make self-defined hook ship with every project?***

Use `init.templatedir` config option.

Check this post, [Create a global git commit hook](https://coderwall.com/p/jp7d5q/create-a-global-git-commit-hook) by Matt Venables.
