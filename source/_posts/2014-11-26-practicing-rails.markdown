---
layout: post
title: "[Review] Practicing Rails"
date: 2014-11-26 11:32:14 +0800
comments: true
categories: ['Books', 'Rails']
---

{:.custom}
| **Book**    | Practicing Rails
| **Author**  | Justin Weiss
| **Link**    | [www.justinweiss.com/book](https://www.justinweiss.com/book/)

* TOC
{:toc}

## Meta Principles

+ **As soon as you want to learn something, try it out.**

+ **When you feel yourself procrastinating or stressed about something, break it apart.**

    Large, fuzzy tasks are killer. If the next thing you want to do is tiny, and you can start on it in the next five minutes, you probably will. If it’s big and vague, you’ll put it off until you know how to start it. Which will probably be never.
  
+ **Start backwards.**

    When you write an app, start from the UI down. Allow your vision of the feature to guide your development. It’s easy to know if you’re building the right thing when you start from the end and trace back to the beginning. And UI sketches and HTML views are a lot easier to think about than abstract data models.
    
+ **Keep it simple, and add complexity later.**

    The most frustrating struggles come from running into problems you don’t know how to solve. You can skip these problems by avoiding new things until you understand the old things. This goes for everything from gems and libraries to patterns and object-oriented design principles.
    
+ **Systems, not motivation.**

    You can’t rely on motivation every day. Instead, set up systems and habits, so you don’t have to motivate yourself to work.

+  **Struggling should tell you that you’re on the brink of learning something really valuable. Keep it up.**


## Tiny Apps

When you read something interesting, tweak it with a tiny app.

+ UI related, with a `rails server`
+ Functional, with a `rails console`. If setting it up in the console gets annoying, write a test case for it.

### Build a tiny App

> I care about getting the most knowledge in the least amount of time, and scaffolds and other Rails code generators are a great way to do just that.


```ruby
rails new test_polymorphic_association
cd test_polymorphic_association
bin/rails generate scaffold bug title:string description:text
bin/rake db:migrate
```

**Some tips for investigating ideas through the Rails console**

You can use a lot of Rails features through the `app` object. app is a special object that has some useful methods for experimenting with your Rails app.

```ruby
irb(main):002:0> app.bug_path bug
irb(main):003:0> app.get "/bugs/1"
irb(main):003:0> puts app.response.body.first(200)
```

The `helper` object provides all of your app’s view and helper methods in the Rails console:

```ruby
irb(main):005:0> helper.content_tag :h1, "Hey there" => "<h1>Hey there</h1>"
```


### Owning the things you learn

Explore the boundaries of that concept until you feel like you really get it.

1. test the boundaries
2. break and dig it, brainstorm some questions about the idea you're exploring.


## Build Your Own App

+ **Core Paths**, focus on building an important path through your app as your first feature.
+ **Build from UI down**.
+ **Avoid large, fuzzy tasks**. At every stage, you should be trying to break large tasks apart into smaller ones.

### Where to start?

Take a few minutes and think what you’re trying to build. Write down every feature that comes to mind. Think of the different paths a user could take through your application, the different things they could do. Describe them in a single sentence.

Then, narrow them down to paths where, if you didn’t have them, your app couldn’t exist. **Core paths**.

In general, less code is better code. And **starting from the view and building toward the model** from there is the best way I know to consistently write less code.

+ Finding Core Path
+ View toward Model


#### Build from UI Down

> Feature development process

1. Take the small feature from earlier.
2. Think of one simple thing someone could do with that feature.
3. Draw just enough screens for that user to be able to do that thing.
4. Describe the path through that action, as if you were telling someone what you were going to do.
5. As you describe that path, write out the objects, properties of those objects, and other actions you think you need to develop that path.

#### Thinking in resources

Rails works well with “resources.” (You can think of a resource as an ActiveRecord model and a controller that has seven actions: `index`, `new`, `create`, `show`, `edit`, `update`, and `destroy`).

#### T-Shaped development

When you build something, try to get something rough up as quickly as possible. As long as the core of the feature you want to build is there, it’s fine.

#### Just-in-time learning

It means you’re not trying to learn everything at the beginning. That’s the most common way to procrastinate starting something that you’re too nervous to do.

### Which feature do you build next?

Keeping these tasks as small as possible is the key. And try to follow the questions below.

1. Ask some questions: What is the app missing? What did you postpone to get that first feature done?
2. Try using what you have so far. What would make your life easier if it was built? What annoys you while you’re using your app?
3. Ifyou’rebuildingthisappforsomeoneelse,watchhowtheyusetheproject. Where are they struggling? What do they complain about?

## Test Your Code Efficiently

### Feature development process with testing

1. Take your small feature.
2. Think of one simple thing someone could do with that feature.
3. Draw just enough screens for that user to be able to do that thing.
4. Translate that sketch into a failing integration test.
5. Get the first part of that test to pass:
6. Write a failing controller test.
7. Write some failing unit tests.
8. Write enough code to get the unit and controller tests to pass.
9. Repeat until the next part of your integration test passes.

***What do you test?***

+ Happy path tests.
+ Sad path tests.
+ What-if tests, must be documented.


***How do you test?***

1. Arrange
2. Act
3. Assert

***When aren't you testing enough?***

Bugs imply that you missed a test somewhere. If you run into a bug in your app that your tests didn’t catch, you’re probably missing a test.

1. Write a test that fails while the bug exists.
2. Fix the bug.
3. Make sure the test passes now.
4. Check in both your test and fix, so you don’t run into the problem again.

***How to keep TDD?***

Translate that sketch into a failing **integration test**(Capybara).

1. Write a failing controller test.
2. Write some failing unit tests.
3. Write enough code to get the unit and controller tests to pass.
4. Repeat until the next part of your integration test passes.

### Organizing and structuring your tests

#### Use object-oriented design to make your tests better

With minitest, all of your test suites are just classes, tests are methods. That means you can use your object oriented design skills to reorganize your tests.

Guides to follow:

1. **For tests, clarity is better than cleverness.** You don’t have anything testing your tests, so you have to be careful not to make things too abstract. Hard-coding values, copy and pasted code, all that kind of stuff is usually OK in tests, if they make the test easier to understand.
2. Organizing your tests is easiest if your test organization matches your code organization. 
3. Wait until you feel real pain before refactoring your tests.

#### Refacoring

+ Using Extract Method to write custom assertions.
+ Using Extract Method to make mocks easier to write.
+ Using modules to share tests between test suites.

## Learning Skill

> The skill of learning.

### Learning Stage

1. First stage. Baseline knowledge, bootstrapping your learning process.
2. Second stage. You’re past the basics but not an expert, still require conscious thought.
3. Thrid stage. Skills in the third stage are mastered. They don’t require thought, you use instinct and intuition when you use them.

If all of their skills were at an intermediate level, they’d not only have to think about how to use each of those skills, but how they interacted in this one specific situation, and what kinds of tradeoffs they’ll have to make.

1 + 3 > 2 + 2

So you’ll be much more productive if you have 5 skills in the third stage and 5 skills in the first stage than if you have ten skills in the second stage.

### A to-don't list

It might seem like you need to master JavaScript before you can write a Rails app. You will, someday. But you won’t get anywhere without starting an app you can get excited about, and you don’t need JavaScript for that first stage. So cross JavaScript off the list. For now.

**For now** is powerful. You’re giving yourself permission to set other things aside, so you can focus on something else.

### Guidance

Search for the things that really resonate with you, the things you get lost in, the things you just want to do for hours.

Take a look at what you know and what you don’t. What you want to learn, and what your app needs you to learn. Set aside some things that seem less important, and turn them into a “Not Right Now” list. Eventually you’ll have a few things you just can’t set aside – learn those thoroughly. And keep moving forward.

Intermediate Rails isn’t about learning all the stuff you learned as a beginner in a little more depth. It’s about the stem of the “T” in T-Shaped Learning. It’s about gaining deep knowledge in a few different areas, one thing at a time. And it’s about using that knowledge to build your own apps, the way you imagined.

### Google and StackOverflow may not be the answer

This can be the fastest way to get your problem solved, and is much easier than investigating it yourself. But you lose the opportunity to go through the investigation, and you miss the chance to build experience debugging and solving your own problems. This robs you of a chance to get to know your code, the language, and the framework better.

Every problem you run into is an opportunity to learn.

But if you use them to solve a problem, make sure you read the answer, follow references, and immerse yourself in the knowledge the solution brings you. 

When you use someone else’s solution to solve your problems, your app will become a mess of inconsistent code that probably only works coincidentally.

### Dig into code to understand it better

Great developers know how to read and understand code. When you read code, you’ll understand much more than what the documentation tells you. Sometimes, after spending time with the code, you’ll know as much about it as the author does!

**Reading code is a skill you’ll have to build like any other, and it’s not like reading a book.**

Practice reading code. Learning to read and explore code will teach you things you won’t learn anywhere else. And when you get good enough at reading code, you’ll be able to solve problems you might have thought were impossible before.

Remember, reading code isn’t like reading anything else. It’s about debugging and exploration. **You have to run it.**

### Avoiding the temptation of the new

You have to separate the things that are interesting because they’re new, from the things that are interesting because they’ll help you get work done.

### Building a good mental filter

Two questions to ask.

1. Is this something I need to know right now?
2. If I knew this a year ago, would it have made my life easier today?

### Push vs. Pull

Hitting these sites is the “pull” model of receiving tech news. You’re the one digging it up. But these days, I’ve been using the “push” model more and more. I’ve been getting email newsletters, podcasts, things that get delivered to you instead of you looking for them.

### System learning

If you find a few good sources, keep a steady learning and practice schedule, and learn things as they become important to you, you’ll make much more progress than those who constantly chase the news sites.

### When to give new tech a chance

Try it out on a new small project. Then, take the technique as far as it’ll go.

But unfortunately, a lot of the techniques won’t have as much of a benefit in smaller projects. So create a new branch for your experiments, so you don’t wreck your code if you don’t like the technique. And

1. Make the change.
2. Look at the old code next to the new.
3. Ask yourself, which code do you prefer?
4. Ask a few other people, which code do they prefer?
5. If the new way is an improvement, go forward with that.

**A technique only has value if it improves your code, so a direct comparison is the best way to judge.**

### Catch up with changes

The best way to keep up with changes to your gems is to track down the project’s *CHANGELOG* file.

These will help you catch up on the big changes from version to version. Usually, they’re just a short summary of each major change.


## Form a habit

> Keep your schedule consistent

### Why?

**Whenever you try to build a new skill, consistency is much more important than the amount of time you spend.**

When you first try to keep a schedule, it’ll feel weird. To me, it feels like I’m just pretending, like I’m just copying what someone else told me to do, instead of actually getting anything done. That feeling starts to hit me around the fourth or fifth day in a row, and it goes away after about three weeks. It’s totally normal, but it can be dangerous.

Anytime you change a routine, you’ll face some internal resistance. Our daily routines seem normal to us, that’s what makes them routines. So building the momentum to change those routines takes a lot of effort, since you’re breaking habits that have taken years to form, in just a few weeks.

You might be tempted to spend 6 hours learning one day and take the rest of the week off. But that doesn’t solve the core problem.

**Habits are built off of repetition, not total time.** If you try to jam everything all into a single day, you’ll have less repetition. It’ll be easier to skip. And if your schedule is really so packed that you can’t find time every day to work on this stuff, how will you find a big chunk of time one day a week?

**Once you’re consistent enough to form a habit, motivation won’t be as much of an issue. It’s just become something I do, so I do it.**

### How to keep consistent?

By “consistency,” I don’t mean that you have to spend hours every single night on this stuff. When you first build your schedule, go shorter rather than longer. **Aim for 40 minutes a day to start.**

If you can’t find the time anywhere else, staying up 40 minutes later at night usually won’t be too painful. Same thing with waking up a little earlier each day.

But 40 minutes is also short enough that it’ll surprise you when it’s over. You’ll start the next task and leave it unfinished.

When you **leave something unfinished**, it’ll stay in the back of your mind. When this happens, you’ll unconsciously be looking for closure, so you’ll be more receptive to related ideas that just pop into your head. You’ll really want to finish it.

#### Morning or Evening?

Cons on **evening**:

1. You don’t really have a set deadline (except sleep), so you can let your motivation carry you beyond the time you set aside.
2. You might also be drained. If you’re tired, it’s easy to convince yourself to skip it, “just this once.” And after a frustrating day at work, you’ll start to tell yourself that you’ve had a rough day, you deserve to just get a good night’s sleep. You’ll catch up tomorrow, right?
3. It’s also easy to push until later. “If I watch one more episode, I’ll start as soon as it’s done. It’ll only be 10 minutes late.” But before you know it, you’re an hour late, you’ve destroyed your sleeping schedule and you’ll pay for it tomorrow, when you’re drained again and you’ll skip again.

While **morning**:

> You might feel brain-dead and uncreative in the morning, which can be killer if you’re learning and practicing creative work like learning Rails. And it’s hard to wake up early until you get used to it.  
> 
> I heard a lot of people I trust and respect suggest trying waking up a little earlier for a week or so. I did, and it was hard, and I felt totally unproductive.  
> 
> But somehow, once I measured my actual productivity, I found out I was twice as pro- ductive in the mornings as the evenings. This is crazy, because it felt like the exact opposite!

I really need to give it a shot.

### How to keep motivated?

Of course, to form a habit is the best way. But before that, try these.

#### Pre-prepare

1. Separating the decision about where to start from the decision about what to do.
2. It creates an unfinished loop in your mind, they’re just as powerful here.
 
#### Processes

Seinfeld method:

> [Jerry Seinfeld] told me to get a big wall calendar that has a whole year on one page and hang it on a prominent wall. The next step was to get a big red magic marker.
> 
> He said for each day that I do my task of writing, I get to put a big red X over that day. “After a few days you’ll have a chain. Just keep at it and the chain will grow longer every day. You’ll like seeing that chain, especially when you get a few weeks under your belt. Your only job next is to not break the chain.”
> 
> “Don’t break the chain,” he said again for emphasis.

When you miss a habit and break a chain, you lose all your motivation to keep the streak going. And you lose it at the exact time you need extra motivation to build that streak back up.

So keep consistent with a habit tracker, calendar, or Beeminder.
