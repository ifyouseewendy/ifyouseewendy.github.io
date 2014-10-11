---
layout: post
title: "[Review] Git Community Book"
date: 2014-09-27 13:51:25 +0800
comments: true
categories:  Books
---

{:.custom}
| **Book**    | Git Community Book
| **Author**  | people in the Git community
| **Link**    | [alx.github.io/gitbook](http://alx.github.io/gitbook/)

* TOC
{:toc}

## Git Object Model

### The SHA

1. Represents object name.
2. 40-digit long.
3. Use SHA1 hash to generate based on the object content.
4. Keeps the identity.

### The Objects

Every object consists of three things: **type, size, content**.

There are four different types of objects: **blob, tree, commit, tag**.

**blob** is a chunk of binary data, used to stroe file data.

> The blob is entirely defined by its data, totally independent of its location.

**tree** is basically like a directory - it references a bunch of other trees and/or blobs.

>  Since trees and blobs, like all other objects, are named by the SHA1 hash of their contents, two trees have the same SHA1 name if and only if their contents (including, recursively, the contents of all subdirectories) are identical.

**commit**  points to a single tree, marking it as what the project looked like at a certain point in time. It contains meta-information about that point in time, such as a timestamp, the author of the changes since the last commit, a pointer to the previous commit(s), etc.

```sh
➜  git show --pretty=raw HEAD
commit 6cc1a668111eb54ef4dbe976fff24f2e3d8b95f9
tree 36df675d7ae80e7eef0faac893b266801a4fa94a
parent d448c30aa03fba2884ab87c21081ef0f74d24f7e
author wendi <wendi@umeng.com> 1409022714 +0800
committer wendi <wendi@umeng.com> 1409022733 +0800

    Update error type service url
```

**tag** is a way to mark a specific commit as special in some way. It is normally used to tag certain commits as specific releases or something along those lines.

> A tag object contains an object name (called simply 'object'), object type, tag name, the name of the person ("tagger") who created the tag, and a message, which may contain a signature


### Different from SVN

GIT stores a snapshot, while other SCM systems stores the differences between one commit and the next.


## Advanced Git


### Create New Empty Branches

Use **symobolic-ref**. A symbolic ref is a regular file that stores a string that begins with ref: refs/. For example, your .git/HEAD is a regular file whose contents is ref: refs/heads/master.

>    In the past, .git/HEAD was a symbolic link pointing at
       refs/heads/master. When we wanted to switch to another branch, we did
       ln -sf refs/heads/newbranch .git/HEAD, and when we wanted to find out
       which branch we are on, we did readlink .git/HEAD. But symbolic links
       are not entirely portable, so they are now deprecated and symbolic refs
       (as described above) are used by default.

```sh
$ git symbolic-ref HEAD refs/heads/newbranch
  # no branch is created,
  # and all files are deleted to index.
$ rm .git/index
git clean -fdx
<do work>
git add your files
git commit -m 'Initial commit'
  # branch 'newbranch' is created.
```

### Modifying Your History

use `git filter-branch` to rewrite branches.


### Advanced Merging

When merging, one parent will be **HEAD**, and the other will be the tip of the other branch, which is stored temporarily in **MERGE_HEAD**.

During the merge, the index holds three versions of each file. Each of these three "file stages" represents a different version of the file:

```sh
$ git show :1:file.txt # the file in a common ancestor of both branches.
$ git show :2:file.txt # the version from HEAD.
$ git show :3:file.txt # the version from MERGE_HEAD.
```

Some special diff options allow diffing the working directory against any of these stages:

```sh
$ git diff -1 file.txt # diff against stage 1
$ git diff --base file.txt # same as the above
$ git diff -2 file.txt # diff against stage 2
$ git diff --ours file.txt # same as the above
$ git diff -3 file.txt # diff against stage 3
$ git diff --theirs file.txt # same as the above.
```

### Git and Email

```sh
$ man git-format-patch # Prepare patches for email submission
$ man git-am # Apply a series of patches from a mailbox
```

`git format-patch origin` will produce a numbered series of files in the current directory, one of each patch in the current branch but not in origin/HEAD.

`git am patches.mbox`

### Client Side Hookds

by example, `GIT_DIR/hooks/pre-commit`


### Submodules

Create the submodules:

```sh
$ mkdir ~/git
$ cd ~/git
$ for i in a b c d
do
    mkdir $i
    cd $i
    git init
    echo "module $i" > $i.txt
    git add $i.txt
    git commit -m "Initial commit, submodule $i"
    cd ..
done
```

Create the superproject and add all the submodules:

```sh
$ mkdir super
$ cd super
$ git init
$ for i in a b c d
do
    git submodule add ~/git/$i
done
```

See what files git-submodule created:

```sh
$ ls -a
.  ..  .git  .gitmodules  a  b  c  d
```

The `git-submodule add` command does a couple of things:

+ It clones the submodule under the current directory and by default checks out the master branch.
+ It adds the submodule's clone path to the gitmodules file and adds this file to the index, ready to be committed.
+ It adds the submodule's current commit ID to the index, ready to be committed.


Commit the superproject:


```sh
$ git commit -m "Add submodules a, b, c and d."
```


Clone the superproject:

```sh
$ cd ..
$ git clone super cloned
$ cd cloned
```

Check submodule status:

```sh
$ git submodule status
-d266b9873ad50488163457f025db7cdd9683d88b a
-e81d457da15309b4fef4249aba9b50187999670d b
-c1536a972b9affea0f16e0680ba87332dc059146 c
-d96249ff5d57de5de093e6baff9e0aafa5276a74 d
```

Register the submodule into `.git/config`:

```sh
$ git submodule init
```

Clone the submodules and check out the commits specified in the superproject:

```sh
$ git submodule update
$ cd a
$ ls -a
.  ..  .git  a.txt
```


One major difference between `git-submodule update` and `git-submodule add` is that git-submodule update checks out a specific commit, rather than the tip of a branch. It's like checking out a tag: **the head is detached**, so you're not working on a branch.

```sh
$ git branch
* (no branch)
master
```

Check out or create a new branch:


```sh
$ git checkout master
```

```sh
$ git checkout -b fix-up
```

Do work and commit:

```sh
$ echo "adding a line again" >> a.txt
$ git commit -a -m "Updated the submodule from within the superproject."
$ git push
$ cd ..
$ git diff
diff --git a/a b/a
index d266b98..261dfac 160000
--- a/a
+++ b/a
@@ -1 +1 @@
-Subproject commit d266b9873ad50488163457f025db7cdd9683d88b
+Subproject commit 261dfac35cb99d380eb966e102c1197139f7fa24
$ git add a
$ git commit -m "Updated submodule a."
$ git push
```

**Cautions on Submodules**:


*Always publish the submodule change before publishing the change to the superproject that references it. If you forget to publish the submodule change, others won't be able to clone the repository:*

```sh
$ cd ~/git/super/a
$ echo i added another line to this file >> a.txt
$ git commit -a -m "doing it wrong this time"
$ cd ..
$ git add a
$ git commit -m "Updated submodule a again."
$ git push
$ cd ~/git/cloned
$ git pull
$ git submodule update
error: pathspec '261dfac35cb99d380eb966e102c1197139f7fa24' did not match any file(s) known to git.
Did you forget to 'git add'?
Unable to checkout '261dfac35cb99d380eb966e102c1197139f7fa24' in submodule path 'a'
```


*It's not safe to run git submodule update if you've made and committed changes within a submodule without checking out a branch first. They will be silently overwritten*:


```sh
$ cat a.txt
module a
$ echo line added from private2 >> a.txt
$ git commit -a -m "line added inside private2"
$ cd ..
$ git submodule update
Submodule path 'a': checked out 'd266b9873ad50488163457f025db7cdd9683d88b'
$ cd a
$ cat a.txt
module a
```

## Internals and Plumbing


### How Git Stores Objects


**Loose objects** are the simpler format. It is simply the compressed data stored in a single file on disk.


If the sha of your object is `ab04d884140f7b0cf8bbf86d6883869f16a46f65`, then the file will be stored in the following path:

```sh
GIT_DIR/objects/ab/04d884140f7b0cf8bbf86d6883869f16a46f65
```

The Ruby implementation of object storage:

```ruby
def put_raw_object(content, type)
  size = content.length.to_s
    
  header = "#{type} #{size}#body"
  store = header + content
    
  sha1 = Digest::SHA1.hexdigest(store)
  path = @git_dir + '/' + sha1[0...2] + '/' + sha1[2..40]
  
  if !File.exists?(path)
    content = Zlib::Deflate.deflate(store)

    FileUtils.mkdir_p(@directory+'/'+sha1[0...2])
    File.open(path, 'w') do |f|
      f.write content
    end
  end
  return sha1
end
```

**Packed Objects**. In order to save that space, Git utilizes the packfile. This is a format where Git will only save the part that has changed in the second file, with a pointer to the file it is similar to.


### The Git Index

The index is a binary file (generally kept in .git/index) containing a sorted list of path names.


```sh
$ git ls-files --stage
100644 63c918c667fa005ff12ad89437f2fdc80926e21c 0
100644 5529b198e8d14decbe4ad99db3f7fb632de0439d 0
100644 6ff87c4664981e4397625791c8ea3bbb5f2279a3 0
100644 a37b2152bd26be2c2289e1f57a292534a51a93c7 0
100644 fbefe9a45b00a54b58d94d06eca48b03d40a50e0 0
...
100644 2511aef8d89ab52be5ec6a5e46236b4b6bcd07ea 0
100644 2ade97b2574a9f77e7ae4002a4e07a6a38e46d07 0
100644 d5de8292e05e7c36c4b68857c1cf9855e3d2f70a 0
.gitignore
.mailmap
COPYING
Documentation/.gitignore
Documentation/Makefile
xdiff/xtypes.h
xdiff/xutils.c
xdiff/xutils.h
```

1. The index contains all the information necessary to generate a single (uniquely determined) tree object.

2. The index enables fast comparisons between the tree object it defines and the working tree.

3. It can efficiently represent information about merge conflicts between different tree objects.


### The Packfile Index


Stored in `.git/objects/pack`.

Importantly, packfile indexes are not neccesary to extract objects from a packfile, they are simply used to quickly retrieve individual objects from a pack.


### Raw Git


**Creating Blobs**

```sh
$ git hash-object -w myfile.txt
6ff87c4664981e4397625791c8ea3bbb5f2279a3
```

**Creating Trees**

use `git mktree`.

**Creating Commits**

use `git commit-tree`.

**Updating a Branch Ref**

```sh
$ echo 'a5f85ba5875917319471dfd98dfc636c1dc65650' > .git/refs/heads/master
```

a safer way of doing that is to use the `git update-ref` command:

```sh
$ git update-ref refs/heads/master a5f85ba5875917319471dfd98dfc636c1dc65650
``` 
