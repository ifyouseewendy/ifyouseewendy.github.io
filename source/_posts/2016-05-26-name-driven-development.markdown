---
layout: post
title: "Name Driven Development"
date: 2016-05-26 18:53:08 +0800
comments: true
categories: ['Programming']
---

> “Any fool can write code that a computer can understand. Good programmers write code that humans can understand.” - Martin Fowler

> "There are only two hard things in Computer Science: cache invalidation and naming things." — Phil Karlton


"Name Driven Development”, this is a ghost topic you can’t find on wiki. I just use it to remind me how much importance a good name can give. Maybe it’s just another bad name😂.

In a nutshell, why naming matters a lot is that it’s so closely related to refactoring. Here are some basic ideas I conclude

- Good name reveals intention, shows legibility, and keeps clarity.
- Keep refactoring, until the name reveals the intention in an easy way.
- Don’t bother about naming too much when developing. Let the test and implementation help reveal it’s purpose. Then make a good name.

To tackle this non-existing topic, I've googled around, reading and thinking. Here are some notes I made (to be updated).

- - -

> [What’s in a Name? - ilinkuo](https://ilinkuo.wordpress.com/2013/05/07/whats-in-a-name/#more-137)

Your Names Tell a Story about Your Design

![your_names_tell_a_story_about_your_design](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/name-drive-development/your_names_tell_a_story_about_your_design.png)

> [Clean Code: Chapter 2, “Meaningful Names” - Uncle Bob](http://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
>
> The “definitive” guide

*Good*

![meaningful_names_basic](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/name-drive-development/meaningful_names_basic.png)

*Better*

![meaningful_names_advanced](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/name-drive-development/meaningful_names_advanced.png)

> [Good naming is a process, not a single step - Arlo Belshee](http://arlobelshee.com/good-naming-is-a-process-not-a-single-step/)
>
> This serial posts provide a methodology, which explains the naming process in a clear and specific way. The first four steps aim at how to better name considering implementation, then move to thinking of intent, and domain abstraction.

![good_naming_is_a_process](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/name-drive-development/good_naming_is_a_process.png)

### Summary

- Missing
- Nonsense
- Honest
- Honest and Complete
- Does the Right Thing
- Intent
- Domain Abstraction

### Why

The answer to that question lies at the heart of understanding, preventing, and paying off technical debt.

- Indebted code is any code that is hard to scan.
- Technical debt is anything that increases the difficulty of reading code.

*Shouldn’t the definition of technical debt be something about the cost and risk of changing code?*

It turns out that the largest single thing developers **spend time doing is reading code**. More than design, more than writing code, more than scanning, even more than meetings (well, probably).

**Bugs come from incomplete understanding**. Incomplete understanding arises when the system is harder to understand than we can store in our heads at once.

So if our definition of technical debt is code that is difficult, expensive, or risky to change, then the root cause of that is code that is hard to scan. And how do we make code easy to scan? Use good names to encapsulate details.

### How

If we want to make code more scannable, we need to increase the percentage of relevant information that it screams at you. Which also means hiding the irrelevant information.

The process of reducing debt is simple:

- Look at something.
- Have an insight.
- Write it down.
    - Ccomment. But **comments** aren’t actually part of the code. They duplicate the code, which causes all the usual duplication problems.
    - If your insight is structural then it belongs in a **name**. If it is a runtime insight then use an **assertion**.
    - Assertions need to be easy to find. So don’t litter them around your core code. Express your insight as an example and write it down in a test. And name the test about the insight (not about what code it happens to execute).
    - So, insights belong in names.
- Check it in.
    - Express your intent by naming your commit using a message.

The insight loop is all there is

- Refactoring legacy code is running this loop and writing stuff down in names.
- Understanding legacy code is running this loop and writing stuff down as examples in tests.
- TDD is running this loop three times:
    - First a loop where we look at the customer interview and we write it down as one example in a test.
    - Second a loop where we look at the test and we write it down in names in the code.
    - Third a loop of refactoring the (new) legacy code.
- Design is a loop where the place you look is “how hard was it to write this test” and you write down insights by changing names (usually fixing the Does the Right Thing step).

### Steps

Each transition is about refactoring.

![good_naming_is_a_process_table](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/name-drive-development/good_naming_is_a_process_table.png)

> [krosenvold](https://stackoverflow.com/posts/422093/revisions) answer on [Stack Overflow - Anyone else find naming classes and methods one of the most difficult part in programming?](https://stackoverflow.com/questions/421965/anyone-else-find-naming-classes-and-methods-one-of-the-most-difficult-part-in-pr/423140#423140)

```
function programming_job(){
    while (i make classes){
         Give each class a name quickly; always fairly long and descriptive.
         Implement and test each class to see what they really are.
         while (not satisfied){
            Re-visit each class and make small adjustments
         }
    }
}
```

> [gnat](http://programmers.stackexchange.com/users/31260/gnat) answered on [Stack Exchange - Are there good techniques or tests for naming types?](http://programmers.stackexchange.com/questions/129961/are-there-good-techniques-or-tests-for-naming-types)

For naming, there are six techniques that were proven to work for me:

- spend a lot of time on inventing names
- use code reviews
- don't hesitate to rename
- spend a lot of time on inventing names
- use code reviews
- don't hesitate to rename

> [The 7 Worst Verbs Programmers Use In Function Calls - Juuso Hietalahti](http://www.gameproducer.net/2008/11/11/the-7-worst-verbs-programmers-use-in-function-calls/)

- dispatch
- do
- resolve
- handle
- manage
- perform
- populate

> [One of the Best Bits of Programming Advice I ever Got](http://objology.blogspot.com/2011/09/one-of-best-bits-of-programming-advice.html)

Don't make objects that end with 'er'.

- Managers - Every time I see one of these, I cringe. People will usually tell me what it does, long before they can tell me what it is. Is it a registry? Fine call it a registry. Is it a history or a log? Call it that. Is it a factory? Call it that.
- Controllers - Only good controller object I've made in the last 20 years was an interface to a BallastVoltageController that represented a real world object. The fact that every single MVC implementation in the world has had a different role for Controller ought to tell us something about how well that idea fit.
- Organizer (and many like them) - Focus is on what it does. This is a great example of how easy it is to turn many of these 'ers' into nouns. Call it an Organization. Now we're focusing on what it is.
- Analyzer/Renderer/etc - Definitely examples of "worker" objects. What if they had been Analysis/Rendering/etc.
- Builder/Loader/Reader/Writer/etc - Remove the focus from the objects being manipulated, and tend assume to much responsibility themselves.

> [Your coding conventions are hurting you - Carlo Pescio](http://www.carlopescio.com/2011/04/your-coding-conventions-are-hurting-you.html)
>
> Great article explaining four harmful conventions with obvious examples. There is a following post, [Life without a controller](http://www.carlopescio.com/2012/03/life-without-controller-case-1.html)

From a distance, everything is object oriented, extra-cool, modern-flexible-etc, but as you get closer, you realize it's just a thin veneer over procedural thinking (and don't even get me started about being "modern").

Fake OO names and harmful conventions

- the -er suffix
- the -able suffix
- the -Object suffix
- the I- prefix

**Manager, Helper, Handler...**

Good ol' Peter Coad used to say: Challenge any class name that ends in "-er" (e.g. Manager or Controller). If it has no parts, change the name of the class to what each object is managing. If it has parts, put as much work in the parts that the parts know enough to do themselves (that was the "**er-er Principle**").

- Manager. When you need a Manager, it's often a sign that the Managed are just plain old data structures, and that the Manager is the smart procedure doing the real work.
- Handler, again, is an obvious resurrection of procedural thinking. What is an handler if not a damn procedure?

**Something-able**

It's like calling a nail "Hammerable", because you known, that's what you do with a nail, you hammer it. It encourages procedural thinking, and leads to ineffective abstractions.

**Something-Object**

When you don't know how to name something, pick some dominant trait and add Object to the end. Again, the problem is that the "dominant trait" is moving us away from the concept of an object. Object is dropped in just to avoid more careful thinking about the underlying concept.

**ISomething**

The problem is that it's too easy to fall into the trap, and just take a concrete class name, put an I in front of it, and lo and behold!, you got an interface name. Sort of calling a concept IDollar instead of Currency.

Eg.

+ IList to RandomAccessContainer
+ IEnumerable to Sequence.
    + A List is an IEnumerable (what??)
    + A List is a Sequence (well, all right!)

> How to Name Things: the solution to the hardest problem in programming - Peter Hilton [video](https://skillsmatter.com/skillscasts/5747-how-to-name-things-the-solution-to-the-hardest-problem-in-programming), [slide](http://www.slideshare.net/pirhilton/how-to-name-things-the-hardest-problem-in-programming)
>
> Taking advice from writers, funny quotes, like Stephen King on refactoring, Hemingway on modelling with personas, .etc.

Remember: “rename” is the simplest but most effective refactoring. Use it.

**Gater domain-specific vocabulary**. Scan the domain model entities Wikipedia pages for names of related concepts. Read novels set in your customer’s domain to learn their jargon. Find out what they really mean.

Comments: the basics

- Don’t say what the code does (because the code already says that)
- Don’t explain awkward logic (improve the code to make it clear)
- Don’t add too many comments (it’s messy and they’ll get out of date)
- Explain why the code exists
    - When should I use this code?
    - When shouldn’t I use it?
    - What are the alternatives to this code?

How to write good comments

- Try to write good code first
- Try to write a one-sentence comment
- Refactor the code until the comment is easy to write
- Now write a good comment
- Don’t forget the rules of good writing. (eg. remove unnecessary comments)

P.S. Peter also has several posts talking about commenting, check [How to comment code](http://hilton.org.uk/blog/how-to-comment-code)

