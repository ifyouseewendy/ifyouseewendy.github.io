---
layout: post
title: "Git Filter Branch in Practice"
date: 2014-12-25 20:54:49 +0800
comments: true
categories: [Git]
---

For some reasons, our company team is migrating our codebase from Github Enterprise to Gitlab. One of the annoying things we should do is to update the invalid author names and emails in our git commits. Specifically, we should

**Filter out the author emails which are not ending `umeng.com`, modify meta info of these commits by a self-defined rule, and update the inconsistent author and committer info.**

I've used `git-filter-branch` once to do a similar but simpler job, which updated my own name and email, by using `env-filter` option in a few lines to complete.

Things are getting a little complicated this time. Our repo has several branches, numbers of collaborators and almost 18,000 commits. I must be careful and patient, to find a safe way before reaching the ultimate horrible "force update".

## Major Idea

Use `git filter-branch --commit-filter` to update each commit's author info.

Psuedo-code of updating logic

```ruby
email = "$GIT_AUTHOR_EMAIL"

if email.match /@umeng.com/
  commit-tree
else
  email.match /(?<name>*)@(?<domain>*).com/ # psuedo

  mapping = {
    'wendy' => 'wendi',
    'ifyouseewendy' => 'wendi',
    ...
  }

  if mapping[name].presents?
    commit_email = "#{mapping[name]}@umeng.com"
  else
    commit_email = "umeng_#{name}-#{domain}@umeng.com"
  end

  commit-tree
end
```

## Step by Step

**1. Checkout a test branch**

```sh
$ git checkout -b update_git_info
```

**2. Filter author emails**

Use [generate_stats.rb](https://gist.github.com/ifyouseewendy/9bdf7ad7173f9c78026c#file-generate_stats-rb) to

1. Gather commits info of *author_name*, *author_email*, and *committer_email*.
2. Run again after finishing the whole job to verify.


**3. Prepare a mapping file**

For authors whose email domain is not `umeng`, write the mapping file under this rule:

0. Seperated by `\s`
1. First is the valid Umeng name
2. Second to the end, are the names of the invalid email

Sample:

change `wendy@xx.com` and `ifyouseewendy@xx.com` to `wendi@umeng.com`.

```
wendi wendy ifyouseewendy
```

**4. Leverage mapping file**

Write a Ruby script to map names, used in the final script.

[update_name.rb](https://gist.github.com/ifyouseewendy/9bdf7ad7173f9c78026c#file-update_name-rb), read a name to change, output the corresponding Umeng author name.

**5. Git filter-branch bash script**

Here is the final working script, [git\_filter_branch.sh](https://gist.github.com/ifyouseewendy/9bdf7ad7173f9c78026c#file-git_filter_branch-sh). The bash email pattern matching part was tweaked based on [glenn jackman's answer](http://stackoverflow.com/questions/14170873/bash-regex-email-matching) on Stack Overflow.

## Things to Take Caution

When running `git filter-branch --commit-filter <commad>`, logic in `<command>` was the core part to finish my job. Remenber, **DO NOT write `echo` in command part** for debug use or whatever, as `echo` will interrupt the filter branch workflow.

Better use a seperate script when debugging. I use [update_email.rb](https://gist.github.com/ifyouseewendy/9bdf7ad7173f9c78026c#file-update_email-sh) to develop on email pattern matching, and copy paste into the final [git\_filter_branch.sh](https://gist.github.com/ifyouseewendy/9bdf7ad7173f9c78026c#file-git_filter_branch-sh).


