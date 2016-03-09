---
layout: post
title: "Git Reminders"
date: 2014-12-30 15:11:29 +0800
comments: true
categories: ['Git']
---

After using Git for two years, I've finally finished reading these two books, twice. Not only skimming, but also making excerpts and perform experiments in the meantime. These two fabulous books really benefit me a lot, and this is the final notes which construct my Git knowledge base, and comprise the excerpts from both books and experiments on some specific topics.

{:.custom}
| **Book**    | Git Community Book
| **Author**  | people in the Git community
| **Link**    | [alx.github.io/gitbook](http://alx.github.io/gitbook/)

{:.custom}
| **Book**    | Pro Git
| **Author**  | Scott Chacon and Ben Straub
| **Link**    | [git-scm.com/book](http://git-scm.com/book/en)

* TOC
{:toc}

## Basics

### Meta

**Snapshots, Not Differences**

Every time you commit, or save the state of your project in Git, it basically takes a picture of what all your files look like at that moment and stores a reference to that snapshot.

**Git Generally Only Adds Data**

It is very difficult to get the system to do anything that is not undoable or to make it erase data in any way.

### Git Object Model

#### The SHA-1

> checksum, object ID

1. Represents object name.
2. 40-digit long.
3. Use SHA1 hash to generate based on the object content.
4. Keeps the identity.

#### The Objects

Every object consists of three things: **type, size, content**.

There are four different types of objects: **blob, tree, commit, tag**.

**blob** is a chunk of binary data, used to store file data.

> The blob is entirely defined by its data, totally independent of its location.

**tree** is basically like a directory - it references a bunch of other trees and/or blobs.

>  Since trees and blobs, like all other objects, are named by the SHA1 hash of their contents, two trees have the same SHA1 name if and only if their contents (including, recursively, the contents of all subdirectories) are identical.

**commit**  points to a single tree, marking it as what the project looked like at a certain point in time. It contains meta-information about that point in time, such as a timestamp, the author of the changes since the last commit, a pointer to the previous commit(s), etc.

```sh
$ git show --pretty=raw HEAD
commit 6cc1a668111eb54ef4dbe976fff24f2e3d8b95f9
tree 36df675d7ae80e7eef0faac893b266801a4fa94a
parent d448c30aa03fba2884ab87c21081ef0f74d24f7e
author wendi <wendi@umeng.com> 1409022714 +0800
committer wendi <wendi@umeng.com> 1409022733 +0800

    Update error type service url
```

**tag** is a way to mark a specific commit as special in some way. It is normally used to tag certain commits as specific releases or something along those lines.

> A tag object contains an object name (called simply 'object'), object type, tag name, the name of the person ("tagger") who created the tag, and a message, which may contain a signature

### Staged

Staged means that you have marked a modified file in its current version to go into your next commit snapshot.

The staging area is a simple file, generally contained in your Git directory, that stores information about what will go into your next commit.


### Branching

A branch in Git is simply a lightweight movable pointer to one of these commits.

How does Git know what branch you’re currently on? It keeps a special pointer called *HEAD*.

**Remote Branches**

Remote branches act as bookmarks to remind you where the branches on your remote repositories were the last time you connected to them.


### Tags

The tag object is very much like a commit object, but **a tag object points to a commit rather than a tree. It’s like a branch reference, but it never moves** — it always points to the same commit but gives it a friendlier name. 

You can tag any Git object. For example, the maintainer adds the GPG public key as a blob object and then tagged it.

**Lightweight**

A lightweight tag is very much like a branch that doesn’t change — it’s just a pointer to a specific commit.

**Annotated**

Annotated tags, however, are stored as full objects in the Git database. They’re checksummed; contain the tagger name, e-mail, and date; have a tagging message; and can be signed and verified with GNU Privacy Guard (GPG). 



## Configuration

### Ignoring Files

Glob patterns are like simplified regular expressions that shells use.

You can negate a pattern by starting it with an exclamation point (!).

```
*.a       # no .a files
!lib.a    # but do track lib.a, even though you’re ignoring .a files above
/TODO     # only ignore the root TODO file, not subdir/TODO
build/    # ignore all files in the build/ directory
doc/*.txt # ignore doc/notes.txt, but not doc/server/arch.txt
```


### Commit Template

```sh
$ git config --global commit.template $HOME/.gitmessage
```

I've defined some experimental rules based on [rangzen's recommandation](http://programmers.stackexchange.com/questions/42110/can-you-recommend-a-good-commit-message-template-guidelines-to-enforce-in-the) on Stack Exchange. Here is my [.gitmessage](https://github.com/ifyouseewendy/dotfiles/blob/master/gitmessage).

Here is another post for specific usage, [Readable Git Log by Using Custom Commit Template](http://blog.ifyouseewendy.com/blog/2014/12/29/readable-git-log-by-using-custom-commit-template/)

### Git Attributes

The path-specific settings are called Git attributes and are set either in a `.gitattribute` file in one of your directories (normally the root of your project) or in the `.git/info/attributes` file if you don’t want the attributes file committed with your project.

+ Identifying Binary Files
+ Diffing Binary Files (word, image EXIF)
+ Filters (clean and smudge)
+ Exorting
    - export-ignore
    - export-subst
+ Merge Strategies



## Porcelain

### Branch

#### Inspecting a Remote

`git remote show [remote-name]`

```sh
$ git remote show origin
* remote origin
  URL: git://github.com/schacon/ticgit.git
  Remote branch merged with ’git pull’ while on branch master
    master
  Tracked remote branches
    master
    ticgit
```


#### Checkout and Track a Remote Branch

Two ways.

```sh
$ git checkout -b sf origin/serverfix
Branch sf set up to track remote branch refs/remotes/origin/serverfix.
Switched to a new branch "sf"
```

```sh
$ git checkout --track origin/serverfix
Branch serverfix set up to track remote branch refs/remotes/origin/serverfix.
Switched to a new branch "serverfix"
```


### Tag

#### Share tags

By default, the git push command doesn’t transfer tags to remote servers. You will have to explicitly push tags to a shared server after you have created them.

`git push origin [tagname]`

If you have a lot of tags that you want to push up at once, you can also use the --tags option to the git push command.

`git push origin --tags`

#### Sign tags

+ PGP, Pretty Good Privacy, the standard.
+ GPG, Gnu Privacy Guard, the implementation.

```sh
# Generate your key
$ gpg --gen-key

$ gpg --list-key
/Users/wendi/.gnupg/pubring.gpg
-------------------------------
pub   2048R/FXXXXXXX 2014-12-19
uid                  Di Wen (wendi) <ifyouseewendy@gmail.com>
sub   2048R/XXXXXXX 2014-12-19 

# Set Git config
$ git config --global user.signingkey FXXXXXXX

# Sign
git tag -s v0.1 -m 'First GPG signed tag'
```

#### Distributing the Public PGP Key

Import the key into the Git database by exporting it and piping that through `git hash-object`, which writes a new blob with those contents into Git and gives you back the SHA–1 of the blob.

```sh
$ gpg -a --export F721C45A | git hash-object -w --stdin
659ef797d181633c87ec71ac3f9ba29fe5775b92
```

Now that you have the contents of your key in Git, you can create a tag that points directly to it by specifying the new SHA–1 value that the hash-object command gave you:

```sh
$ git tag -a maintainer-pgp-pub 659ef797d181633c87ec71ac3f9ba29fe5775b92
```

If you run `git push --tags`, the maintainer-pgp-pub tag will be shared with everyone. If anyone wants to verify a tag, they can directly import your PGP key by pulling the blob directly out of the database and importing it into GPG:

```sh
$ git show maintainer-pgp-pub | gpg --import
```

They can use that key to verify all your signed tags. Also, if you include instructions in the tag message, running `git show <tag>` will let you give the end user more specific instructions about tag verification.

#### Generate a Build Number

Git gives you the name of the nearest tag with the number of commits on top of that tag and a partial SHA–1 value of the commit you’re describing:

```sh
$ git describe master
v1.6.2-rc1-20-g8c5b85c
```

The git describe command favors annotated tags.

#### Prepare a Release

Create `tar.gz`.

```sh
$ git archive master --prefix=’project/’ | gzip > ‘git describe master‘.tar.gz
$ ls *.tar.gz
v1.6.2-rc1-20-g8c5b85c.tar.gz
```

Create `zip`

```sh
$ git archive master --prefix=’project/’ --format=zip > ‘git describe master‘.zip
```

### Rebasing

**an advanced example**

Now `git show-branch master server client` shows like this:

```sh
<-- commit0 <-- commit1 <-- commit2                 master
                  \
                   \-- commit3 <-- commit4          server
                          \
                           \-- commit5 <-- commit6  client
```

What does `git rebase --onto master server client` do?

1. Checkout *client* branch
2. Figure out the patches from the common ancestor of *server* and *client* (commits of `git log server..client`)
3. Replay the patches onto *master*

Run `git show-branch master server client` again:

```sh
                            master                  client
                               |                       |
<-- commit0 <-- commit1 <-- commit2 <-- commit5 <-- commit6
                  \
                   \-- commit3 <-- commit4
                                      |
                                    server
```

### Merge Base

```sh
$ git merge-base master test
da07c4b40491581a0d6f877373a5cbeb1ea8c800

$ git show `git merge-base master test`
commit da07c4b40491581a0d6f877373a5cbeb1ea8c800
Author: wendi <ifyouseewendy@gmail.com>
Date:   Fri Dec 19 12:56:08 2014 +0800

    Add README

diff --git a/README b/README
new file mode 100644
index 0000000..e69de29
```

### Merge Stage

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


### Ancestry References

+ ^\<n\> select the nth *parent* of the commit (relevant in merges).
+ ~\<n\> select the nth *ancestor* commit, always following the first parent.

```sh
G   H   I   J
 \ /     \ /
  D   E   F
   \  |  / \
    \ | /   |
     \|/    |
      B     C
       \   /
        \ /
         A
A =      = A^0
B = A^   = A^1     = A~1
C = A^2  = A^2
D = A^^  = A^1^1   = A~2
E = B^2  = A^^2
F = B^3  = A^^3
G = A^^^ = A^1^1^1 = A~3
H = D^2  = B^^2    = A^^^2  = A~2^2
I = F^   = B^3^    = A^^3^
J = F^2  = B^3^2   = A^^3^2
```

recorded in [git-rev-parse(1)](http://schacon.github.com/git/git-rev-parse)


### Commit Ranges


```sh
# reachable from one commit but aren’t reachable from another.
$ git log ref1..ref2
$ git log ^ref1 ref2
$ git log ref2 --not ref1

# reachable by either of two references but not by both of them.
$ git log master...experiment

$ git log --left-right master...experiment
< F
< E
> D
> C
```


### Log

#### Summarize or Get a Quick Changelog

Use `git shortlog`

```sh
$ git shortlog --no-merges master --not v1.0.1
Chris Wanstrath (8):
      Add support for annotated tags to Grit::Tag
      Add packed-refs annotated tag support.
      Add Grit::Commit#to_patch
      Update version and History.txt
      Remove stray ‘puts‘
      Make ls_tree ignore nils
Tom Preston-Werner (4):
      fix dates in history
      dynamic version method
      Version bump to 1.0.2
      Regenerated gemspec for version 1.0.2
```

### Stash

#### Reapply the Staged Changes

Use `git stash apply --index stash@{n}`

You have stashed changes below,

```sh
On branch master
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

        modified:   a.rb

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   todo
```

After checking out to other branch and back, you wanna apply the changes stashed.

```sh
$ git stash apply stash@{0}

On branch master
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   a.rb
        modified:   todo
```

So, How to reapply the staged changes?

```sh
$ git stash apply --index stash@{0}

On branch master
Changes to be committed:
  (use "git reset HEAD <file>..." to unstage)

        modified:   a.rb

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   todo
```

#### Create a Branch from Stash

Use `git stash branch {branch_name}`, which creates a new branch, checks out the commit you were on when you stashed your work, reapplies your work there, and then drops the stash if it applies successfully.

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

### Filter Branch

#### Removing a File from Every Commit

The `--tree-filter` option runs the specified command after each checkout of the project and then recommits the results.

```sh
$ git filter-branch --tree-filter ’rm -f passwords.txt’ HEAD
Rewrite 6b9b3cf04e7c5686a9cb838c3f36a8cb6a0fc2bd (21/21)
Ref ’refs/heads/master’ was rewritten
```

#### Making a Subdirectory the New Root

Use `--subdirectory-filter` option.

```sh
$ git filter-branch --subdirectory-filter trunk HEAD
Rewrite 856f0bf61e41a27326cdae8f09fe708d679f596f (12/12)
Ref ’refs/heads/master’ was rewritten
```

#### Changing E-Mail Addresses Globally

Use `--commit-filter` option.

```sh
$ git filter-branch --commit-filter ’
        if [ "$GIT_AUTHOR_EMAIL" = "schacon@localhost" ];
        then
                GIT_AUTHOR_NAME="Scott Chacon";
                GIT_AUTHOR_EMAIL="schacon@example.com";
                git commit-tree "$@";
        else
        fi’ HEAD
```

#### Realworld Example

Check this post, [Git Filter Branch in Practice](http://blog.ifyouseewendy.com/blog/2014/12/25/git-filter-branch-in-practice/)

### Blame

If you pass `-C` to git blame, Git analyzes the file you’re annotating and tries to figure out where snippets of code within it originally came from if they were copied from elsewhere.

```sh
$ git blame -C -L 141,153 GITPackUpload.m
f344f58d GITServerHandler.m (Scott 2009-01-04 141)
f344f58d GITServerHandler.m (Scott 2009-01-04 142) - (void) gatherObjectShasFromC
f344f58d GITServerHandler.m (Scott 2009-01-04 143) {
70befddd GITPackUpload.m    (Scott 2009-03-22 144)     //NSLog(@"GATHER COMMI
ad11ac80 GITPackUpload.m    (Scott 2009-03-22 144)
```

### Bisect

First you run `git bisect start` to get things going, and then you use `git bisect bad` to tell the system that the current commit you’re on is broken. Then, you must tell bisect when the last known good state was, using `git bisect good [good commit]`.

#### Auto Check By Script

```sh
$ git bisect run test-error.sh
```

Doing so automatically runs `test-error.sh` on each checked-out commit until Git finds the first broken commit. You can also run something like make or make tests or whatever you have that runs automated tests for you.

### Submodules

#### Maintain a repo which contains a submodule

> Add a submodule into your existing git repo.

Add a submodule.

```sh
$ git submodule add git://github.com/chneukirchen/rack.git rack

$ git status
# On branch master
# Changes to be committed:
# # # # #
(use "git reset HEAD <file>..." to unstage)
   new file:   .gitmodules
   new file:   rack
   
$ git commit -m 'Add rack submodule'
```

As `.git/config` and `.gitmodules` have been registered, when you want to update the submodule, just enter into the submodule dir and do git opertations.

```sh
$ cd rack
$ touch aa && git add . && git commit -m 'Add aa'
[master 060998f] Add aa
 1 file changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 aa
$ git push
```

When you make changes and commit in that subdirectory, the superproject notices that the *HEAD* there has changed and records the exact commit you’re currently working off of. So, update your superproject from time to time with a pointer to the latest commit in that subproject.

```sh
$ cd ..
$ git status
On branch master
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes in working directory)

        modified:   rack (new commits)
$ git commit -am 'Update rack'
$ git push
```

#### Maintain a cloned repo which contains a submodule

```sh
$ git clone git://github.com/schacon/myproject.git
$ cd myproject/rack
$ ls
# empty
```

Setup with two commands:

1. `git submodule init`. Initialize your local configurtaion (`.gitmodules` to  `.git/config`)
2. `git submodule update`. Fetch all the data from that project and check out the appropriate commit listed in your superproject.


#### A Demo Workflow

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

A detached head, means the *HEAD* file points directly to a commit, not to a symbolic reference.

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

#### Cautions


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

### Subtree Merging (A Submodule Substitution)

#### Use git-merge Subtree Strategy

**Add a subtree**

First, add the Rack project as a remote reference in your own project and then check it out into its own branch.

```sh
$ git remote add rack_remote git@github.com:schacon/rack.git
$ git fetch rack_remote
$ git checkout -b rack_branch rack_remote/master
```

Now you have the root of the Rack project in your `rack_branch` branch and your own project in the `master` branch.

```sh
$ ls
AUTHORS        KNOWN-ISSUES   Rakefile
COPYING        README         bin
$ git checkout master
Switched to branch "master"
$ ls
README
```

Use `git read-tree` to read the root tree of one branch into your current staging area and working directory. You just switched back to your `master` branch, and you pull the `rack_branch` into the *rack* subdirectory of your `master` branch of your main project.

```sh
$ git read-tree --prefix=rack/ -u rack_branch
```

When you commit, it looks like you have all the Rack files under that subdirectory — as though you copied them in from a tarball. 

**Update and merge subtree**

If the Rack project updates, you can pull in upstream changes by switching to that branch and pulling:

```sh
$ git checkout rack_branch
$ git pull
```

Then, you can merge those changes back into your master branch. You can use `git merge -s subtree` and it will work fine; but Git will also merge the histories together, which you probably don’t want. To pull in the changes and prepopulate the commit message, use the `--squash` and `--no-commit` options as well as the `-s subtree` strategy option:

```sh
$ git checkout master
$ git merge --squash -s subtree --no-commit rack_branch
Squash commit -- not updating HEAD
Automatic merge went well; stopped before committing as requested
```

All the changes from your Rack project are merged in and ready to be committed locally. You can also do the opposite — make changes in the `rack` subdirectory of your master branch and then merge them into your `rack_branch` branch later to submit them to the maintainers or push them upstream.

**Diff a subtree**

To get a diff between what you have in your rack subdirectory and the code in your rack branch branch — to see if you need to merge them — you can’t use the normal diff command. Instead, you must run git diff-tree with the branch you want to compare to:

```sh
$ git diff-tree -p rack_branch
$ git diff-tree -p rack_remote/master
```

#### Use git-subtree

+ [alternatives-to-git-submodule-git-subtree](http://blogs.atlassian.com/2013/05/alternatives-to-git-submodule-git-subtree/) by Atlassian Blog
+ [Understanding Git Subtree](https://hpc.uni.lu/blog/2014/understanding-git-subtree/) by HPC @ Uni.lu


## Git Internals

Git is fundamentally a **content-addressable filesystem** with a VCS user interface written on top of it.

+ Plumbing, verbs that do low-level work and were designed to be chained together UNIX style or called from scripts.
+ Porcelain, the more user-friendly commands.

### Plumbing Objects

#### Blob Object

Git is a content-addressable filesystem, at the core of Git is a simple key-value data store. You can insert any kind of content into it, and it will give you back a key that you can use to retrieve the content again at any time.

**Create**

```sh
$ echo 'test content' | git hash-object -w --stdin
d670460b4b4aece5915caf5c68d12f560a9fe3e4
```

The `-w` tells hash-object to store the object; otherwise, the command simply tells you what the key would be.

**Check**

```sh
$ find .git/objects -type f
.git/objects/d6/70460b4b4aece5915caf5c68d12f560a9fe3e4
```

**View**

```sh
$ git cat-file -p d670460b4b4aece5915caf5c68d12f560a9fe3e4
test content

$ git cat-file -t d670460b4b4aece5915caf5c68d12f560a9fe3e4
blob
```

#### Tree Objects

Basically, tree objects are used to specify snapshots.

Tree object solves the problem of storing the filename and also allows you to store a group of files together.

**View**

```sh
$ git cat-file -p masterˆ{tree}
100644 blob a906cb2a4a904a152e80877d4088654daad0c859    README
100644 blob 8f94139338f9404f26296befa88755fc2598c289    Rakefile
040000 tree 99f1a6d12cb4b6f19c8655fca46c3ecf317074e0    lib
```

**Create**.

Git normally creates a tree by taking the state of your staging area or index and writing a tree object from it. 

+ Use `update-index` to create an index.

    + `--add`, because the file doesn’t yet exist in your staging area.
    + `--cacheinfo`, because the file you’re adding isn’t in your directory but is in your database.
    + `100644`, which means it’s a normal file. Other options are `100755`, which means it’s an executable file; and `120000`, which specifies a symbolic link.

```sh
$ git update-index --add --cacheinfo 100644 \
  83baae61804e65cc73a7201a7252750c76066a30 test.tx
```

+ Use `read-tree` to read an existing tree into your staging area as a subtree by using the `--prefix` option.

```sh
$ git cat-file -p d8329fc1cc938780ffdd9f94e0d364e0ea74f579
100644 blob 83baae61804e65cc73a7201a7252750c76066a30    test.txt 

$ git read-tree --prefix=bak d8329fc1cc938780ffdd9f94e0d364e0ea74f579
```

Use the `write-tree` command to write the staging area out to a tree object. No `-w` option is needed — calling `write-tree` automatically creates a tree object from the state of the index if that tree doesn’t yet exist:

```sh
$ git write-tree
d8329fc1cc938780ffdd9f94e0d364e0ea74f579
```

#### Commit Objects

You have three trees that specify the different snapshots of your project that you want to track, but the earlier problem remains: you must remember all three SHA–1 values in order to recall the snapshots. You also don’t have any information about who saved the snapshots, when they were saved, or why they were saved. This is the basic information that the commit object stores for you.

**Create**

Use `commit-tree`.

```sh
$ echo ’first commit’ | git commit-tree d8329f
fdf4fc3344e67ab068f836878b6c4951e3b15f3d

$ echo ’second commit’ | git commit-tree 0155eb -p fdf4fc3
cac0cab538b970a37ea1e769cbbde608743bc96d
```

**View**

```sh
$ git cat-file -p fdf4fc3
tree d8329fc1cc938780ffdd9f94e0d364e0ea74f579
author Scott Chacon <schacon@gmail.com> 1243040974 -0700
committer Scott Chacon <schacon@gmail.com> 1243040974 -0700

first commit
```

#### Object Storage

```rb git_object_storage.rb https://gist.github.com/ifyouseewendy/ec7a4d8df55a2de70af1
require 'digest/sha1'
require 'zlib'
require 'fileutils'
 
# put_raw_object("what is up, doc?", 'blob')
def put_raw_object(content, type)
  # Generate SHA-1
  header = "#{type} #{content.length}\0"   # => "blob 16\000"
  store = header + content              # => "blob 16\000what is up, doc?"
  sha1 = Digest::SHA1.hexdigest(store)  # => "bd9dbf5aae1a3862dd1526723246b20206e5fc37"
  
  # p sha1
  
  # Compress with Zlib
  zlib_content = Zlib::Deflate.deflate(store)
  
  # Write to disk
  path = '.git/objects/' + sha1[0,2] + '/' + sha1[2,38] # => ".git/objects/bd/9dbf5aae1a3862dd1526723246b20206e5fc37"
  FileUtils.mkdir_p(File.dirname(path))                 # => ".git/objects/bd"
  File.open(path, 'w'){|f| f.write zlib_content }
end
```

***What Git does when you run the git add and git commit commands?***

1. stores blobs for the files that have changed
2. updates the index
3. writes out trees
4. writes commit objects that reference the top-level trees and the commits that came immediately before them.

```sh
$ find .git/objects -type f
.git/objects/01/55eb4229851634a0f03eb265b69f5a2d56f341 # tree 2
.git/objects/1a/410efbd13591db07496601ebc7a059dd55cfe9 # commit 3
.git/objects/1f/7a7a472abf3dd9643fd615f6da379c4acb3e3a # test.txt v2
.git/objects/3c/4e9cd789d88d8d89c1073707c3585e41b0e614 # tree 3
.git/objects/83/baae61804e65cc73a7201a7252750c76066a30 # test.txt v1
.git/objects/ca/c0cab538b970a37ea1e769cbbde608743bc96d # commit 2
.git/objects/d8/329fc1cc938780ffdd9f94e0d364e0ea74f579 # tree 1
.git/objects/fa/49b077972391ad58037050f2a75f74e3671e92 # new.txt
.git/objects/fd/f4fc3344e67ab068f836878b6c4951e3b15f3d # commit 1
```

![figure 9.3](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/pro_git_figure_9_3.png)

### Index

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

### Packfile

+ **Loose objects** are the simpler format. It is simply the compressed data (snapshots) stored in a single file on disk.
+ **Packed Objects**. In order to save that space, Git utilizes the packfile. This is a format where Git will only save the part that has changed in the second file, with a pointer to the file it is similar to. Triggered by
    - run the `git gc` command manually
    - push to a remote server

When Git packs objects, it looks for files that are named and sized similarly, and stores just the deltas from one version of the file to the next.

What is also interesting is that the second version of the file is the one that is stored intact, whereas the original version is stored as a delta — this is because you’re most likely to need faster access to the most recent version of the file.

### The Refspec

Recorded in `.git/config`.

```
[remote "origin"]
    url = git@github.com:schacon/simplegit-progit.git   
    fetch = +refs/heads/*:refs/remotes/origin/*
    push = refs/heads/master:refs/heads/master
```

The format of the refspec is an optional `+`, followed by `<src>:<dst>`.

+ `+` tells Git to update the reference even if it isn’t a fast-forward.
+ `<src>` is the pattern for references on the remote side.
+ `<dst>` is where those references will be written locally. 

#### fetching

If you want Git instead to pull down only the master branch each time, and not every other branch on the remote server, you can change the fetch line to

```
fetch = +refs/heads/master:refs/remotes/origin/master
```

You can also specify multiple refspecs for fetching in your configuration file.

```
fetch = +refs/heads/master:refs/remotes/origin/master
fetch = +refs/heads/experiment:refs/remotes/origin/experiment
```

You can use namespacing to accomplish something like that. If you have a QA team that pushes a series of branches, and you want to get the master branch and any of the QA team’s branches but nothing else, you can use a config section like this:

```
[remote "origin"]
    url = git@github.com:schacon/simplegit-progit.git
    fetch = +refs/heads/master:refs/remotes/origin/master
    fetch = +refs/heads/qa/*:refs/remotes/origin/qa/*
    
    # You can’t use partial globs in the pattern
    # fetch = +refs/heads/qa*:refs/remotes/origin/qa*
```

If you want to do something one time, you can specify the refspec on the command line, too. Multiple refspecs are accepted.

```sh
$ git fetch origin master:refs/remotes/origin/mymaster \
   topic:refs/remotes/origin/topic
From git@github.com:schacon/simplegit
 ! [rejected]        master     -> origin/mymaster  (non fast forward)
 * [new branch]      topic      -> origin/topic
```

### Data Recovery

#### reflog

As you’re working, Git silently records what your HEAD is every time you change it. Each time you commit or change branches, the reflog is updated. The reflog is also updated by the `git update-ref` command, which is another reason to use it instead of just writing the SHA value to your ref files.

```sh
$ git reflog
1a410ef HEAD@{0}: 1a410efbd13591db07496601ebc7a059dd55cfe9: updating HEAD
ab1afef HEAD@{1}: ab1afef80fac8e34258ff41fc1b867c702daa24b: updating HEAD
```

To see the same information in a much more useful way, we can run `git log -g` or `git log --walk-reflogs`, which will give you a normal log output for your reflog.

```sh
$ git log -g
commit 1a410efbd13591db07496601ebc7a059dd55cfe9
Reflog: HEAD@{0} (Scott Chacon <schacon@gmail.com>)
Reflog message: updating HEAD
Author: Scott Chacon <schacon@gmail.com>
Date:   Fri May 22 18:22:37 2009 -0700

    third commit

commit ab1afef80fac8e34258ff41fc1b867c702daa24b
Reflog: HEAD@{1} (Scott Chacon <schacon@gmail.com>)
Reflog message: updating HEAD
Author: Scott Chacon <schacon@gmail.com>
Date:   Fri May 22 18:15:24 2009 -0700

    modified repo a bit
```

#### fsck

> File System Consistency Check

Suppose your loss was for some reason not in the reflog, you can use the `git fsck` utility, which checks your database for integrity. If you run it with the `--full` option, it shows you all objects that aren’t pointed to by another object:

```sh
$ git fsck --full
dangling blob d670460b4b4aece5915caf5c68d12f560a9fe3e4
dangling commit ab1afef80fac8e34258ff41fc1b867c702daa24b
dangling tree aea790b9a58f6cf6f2804eeac9f0abbe9631e4c9
dangling blob 7108f7ecb345ee9d0084193f147cdad4d2998293
```

