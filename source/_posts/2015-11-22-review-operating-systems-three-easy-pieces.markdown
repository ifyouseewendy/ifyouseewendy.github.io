---
layout: post
title: "[Review] Operating Systems Three Easy Pieces"
date: 2015-11-22 13:44:38 +0800
comments: true
categories: ['Books', 'OS']
---

{:.custom}
| **Book**    | Operating Systems: Three Easy Pieces
| **Author**  | [Remzi H. Arpaci-Dusseau](http://www.cs.wisc.edu/~remzi) and [Andrea C. Arpaci-Dusseau](http://www.cs.wisc.edu/~dusseau)
| **Link**    | [pages.cs.wisc.edu/~remzi/OSTEP](http://pages.cs.wisc.edu/~remzi/OSTEP/)

* TOC
{:toc}

# Introduction

**The Crux of the whole book**

How does the operating system virtualize resources?
What mechanisms and policies are implemented by the OS to attain virtualization?
How does the OS do so efficiently?

**The Von Neumann model of computing**

Many millions (and these days, even billions) of times every second, the processor **fetches** an instruction from memory, **decodes** it (i.e., figures out which instruction this is), and **executes** it.

**The OS is sometimes known as a resource manager**

The primary way the OS does this is through a general technique that we call virtualization. That is, the OS takes a physical resource (such as the processor, or memory, or a disk) and transforms it into a more general, powerful, and easy-to-use virtual form of itself. Thus, we sometimes refer to the operating system as a **virtual machine**.

**Virtualising the CPU**

Turning a single CPU (or small set of them) into a seemingly infinite number of CPUs and thus allowing many programs to seemingly run at once is what we call virtualizing the CPU.

**Virtualising the Memory**

Memory is just an array of bytes; to **read** memory, one must specify an **address** to be able to access the data stored there; to **write** (or update) memory, one must also specify the data to be written to the given address.

The OS is virtualizing memory. Each process accesses its own private **virtual address space** (sometimes just called its address space)

**Concurrency**

Three instructions: one to **load** the value of the counter from memory into a register, one to **increment** it, and one to **store** it back into memory. Because these three instructions do not execute atomically (all at once), strange things can happen.

**Persistence**

The software in the operating system that usually manages the disk is called the **file system**; it is thus responsible for storing any files the user creates in a reliable and efficient manner on the disks of the system.

For performance reasos, most file systems first **delay** such writes for a while, hoping to batch them into larger groups. To handle the problems of system crashes during writes, most file systems incorporate some kind of intricate write protocol, such as **journaling** or **copy-on-write**, carefully ordering writes to disk to ensure that if a failure occurs during the write sequence, the system can recover to reasonable state afterwards.

**Design Goals**

What an OS actually does: it takes physical **resources**, such as a CPU, memory, or disk, and **virtualizes** them. It handles tough and tricky issues related to **concurrency**. And it stores files **persistently**, thus making them safe over the long-term.

1. To build up some **abstractions** in order to make the system convenient and easy to use.
2. To provide high **performance**, another way to say this is our goal is to minimize the overheads of the OS.
3. To provide **protection** between applications, as well as between the OS and applications. Protection is at nthe heart of one of the main principles underlying an operating system, which is that of **isolation**; isolating processes from one another is the key to protection and thus underlies much of what an OS must do.

**Some History**

1. Early Operating Systems: Just Libraries.  This mode of computing was known as **batch** processing.
2. Beyond Libraries: Protection. The idea of a system call was invented. The key difference between a **system call** and a **procedure call** is that a system call transfers control (i.e., jumps) into the OS while simultaneously raising the hardware privilege level. User applications run in what is referred to as user mode which means the hardware restricts what applications can do; When a system call is initiated (usually through a special hardware instruction called a trap), the hardware transfers control to a pre-specified trap handler (that the OS set up previously) and simultaneously raises the privilege level to kernel mode.
3. The Era of Multiprogramming by minicomputer. In particular, multiprogramming became commonplace due to the desire to make better use of machine resources. One of the major practical advances of the time was the introduction of the **UNIX** operating system, primarily thanks to **Ken Thompson** (and **Dennis Ritchie**) at Bell Labs (yes, the phone company). **Bill Joy**, made a wonderful distribution (the Berkeley Systems Distribution, or **BSD**) which had some advanced virtual memory, file system, and networking subsystems. Joy later co-founded Sun Microsystems.
4. The Modern Era by PC with DOS, Mac OS.

# CPU Virtualisation

## Process

### Chapter 4 - The Abstraction: The Process

**Process**

The definition of a process, informally, is quite simple: it is a running program.

**How to provide the illusion of many CPUs?**

This basic technique, known as **time sharing** of the CPU, allows users to run as many concurrent processes as they would like; the potential cost is performance, as each will run more slowly if the CPU(s) must be shared.

**Mechanisms**

Mechanisms are low-level methods or protocols that implement a needed piece of functionality.

**Policies**

On top of these mechanisms resides some of the intelligence in the OS, in the form of policies.

**Tip: Separate policy and mechanism**

In many operating systems, a common design paradigm is to separate high-level policies from their low-level mechanisms. You can think of the mechanism as providing the answer to a **how** question about a system; for example, how does an operating system perform a context switch? The policy provides the answer
 to a **which** question; for example, which process should the operating system run right now?

**Machine State**

To understand what constitutes a process, we thus have to understand its **machine state**: what a program can read or update when it is running. At any given time, what parts of the machine are important to the execution of this program?

1. Memory. The memory that the process can address (called its **address space**) is part of the process.
2. Registry. There are some particularly special registers that form part of this machine state. For example, the **program counter** (PC) (sometimes called the instruction pointer or IP). similarly a stack pointer and associated **frame pointer** are used to manage the stack for function parameters, local variables, and return addresses.
3. I/O information. Programs often access persistent storage devices too. Such I/O information might include a list of the files the process currently has open.

**Process API**

1. Create
2. Destroy
3. Wait
4. Miscellaneous Control (suspend, resume)
5. Status

**How does the OS get a program up and running?**

1. To **load** its code and any static data (e.g., initialized variables) into memory, into the **address space** of the process. In early (or simple) operating systems, the loading process is done **eagerly**; modern OSes perform the process **lazily**, i.e., by loading pieces of code or data only as they are needed during program execution. To truly understand how lazy loading of pieces of code and data works, you’ll have to understand more about the machinery of **paging** and **swapping**.
2. Once the code and static data are loaded into memory, there are a few other things the OS needs to do before running the process. Some memory must be allocated for the program’s **run-time stack** (or just stack). As you should likely already know, C programs use the stack for local variables, function parameters, and return addresses; the OS allocates this memory and gives it to the process.
3. The OS may also allocate some memory for the program’s **heap**. In C programs, the heap is used for explicitly requested dynamically-allocated data; programs request such space by calling malloc() and free it explicitly by calling free(). The heap is needed for data structures such as linked lists, hash tables, trees, and other interesting data structures.
4. The OS will also do some other initialization tasks, particularly as related to input/output (I/O). For example, in UNIX systems, each process by default has three open **file descriptors**.
5. To start the program running at the entry point, namely main(), the OS transfers control of the CPU to the newly-created process, and thus the program begins its execution.

**Process States**

1. Running
2. Ready
3. Blocked

![os-process_state_transitions.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-process_state_transitions.png)

**Data Structures**

To track the state of each process, for example, the OS likely will keep some kind of **process list** for all processes that are ready, as well as some additional information to track which process is currently running.

![os-the_xv6_proc_structure.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-the_xv6_proc_structure.png)

The **register context** will hold, for a stopped process, the contents of its registers. When a process is stopped, its registers will be saved to this memory location; by restoring these registers (i.e., placing their values back into the actual physical registers), the OS can resume running the process.

Sometimes people refer to the individual structure that stores information about a process as a **Process Control Block (PCB)**.

### Chapter 5 - Interlude: Process API

UNIX presents one of the most intriguing ways to create a new process with a pair of system calls:

**fork()**

The newly-created process (called the **child**, in contrast to the creating **parent**) desn’t start running at main(), like you might expect (note, the “hello, world” message only got printed out once); rather, it just comes into life as if it had called fork() itself. You might have noticed: the child isn’t an exact copy. Specifically, al- though it now has its own copy of the address space (i.e., its own private memory), its own registers, its own PC, and so forth, the value it returns to the caller of fork() is different.

The output is **not deterministic**. When the child process is created, there are now two active processes in the system that we care about: the parent and the child.

**wait()**

Adding a wait() call to the code above makes the output **deterministic**.

**exec()**

It does not create a new process; rather, it transforms the currently running program (formerly p3) into a different running program (wc). After the exec() in the child, it is almost as if p3.c never ran; a successful call to exec() never returns.

**Why? Motivating The API**

Why would we build sucho an odd interface to what should be the simple act of creating a new process? Well, as it turns out, the separation of fork() and exec() is essential in building a UNIX shell, because it lets the shell run code after the call to fork() but before the call to exec(); this code can alter the environment of the about-to-be-run program, and thus enables a variety of interesting features to be readily built.

**How Does Shell Utilise The API?**

The shell is just a user program.

1. It shows you a prompt and then waits for you to type something into it.
2. You then type a command (i.e., the name of an executable program, plus any arguments) into it;
3. In most cases, the shell then figures out where in the file system the executable resides
4. calls fork() to create a new child process to run the command
5. calls some variant of exec() to run the command
6. waits for the command to complete by calling wait().
7. When the child completes, the shell returns from wait() and prints out a prompt again, ready for your next command.

eg. prompt> wc p3.c > newfile.txt

When the child is created, before calling exec(), the shell closes standard output and opens the file newfile.txt.

## Mechanism

### Chapter 6 - Mechanism: Limited Direct Execution

**The Crux**

- performance: how can we implement virtualization without adding excessive overhead to the system?
- control: how can we run processes efficiently while retaining control over the CPU?

Attaining performance while maintaining control is thus one of the central challenges in building an operating system.

**Basic Technique: Limited Direct Execution**

The basic idea is straightforward: just run the program you want to run on the CPU, but first make sure to set up the hardware so as to limit what the process can do without OS assistance.

In an analogous manner, the OS “baby proofs” the CPU, by first (during boot time) setting up the **trap handlers** and starting an **interrupt timer**, and then by only running processes in a restricted mode. By doing so, the OS can feel quite assured that processes can run efficiently, only requir- ing OS intervention to perform privileged operations or when they have monopolized the CPU for too long and thus need to be switched out.

**Problem #1: Restricted Operations**

Use Protected Control Transfer

The hardware assists the OS by providing different modes of execution. In **user mode**, applications do not have full access to hardware resources. In **kernel mode**, the OS has access to the full resources of the machine. When the user process wants to perform some kinds of privileged operation, it can perform a **system call**.

**System Call**

To execute a system call, a program must execute a special **trap** instruction. This instruction simultaneously jumps into the kernel and raises the privilege level to kernel mode; once in the kernel, the system can now per- form whatever privileged operations are needed (if allowed), and thus do the required work for the calling process. When finished, the OS calls a special **return-from-trap** instruction

**Why System Calls Look Like Procedure Calls?**

It is a procedure call, but hidden inside that procedure call is the famous trap instruction. More specifically, when you call open() (for example), you are executing a procedure call into the C library. The parts of the C library that make system calls are hand-coded in assembly, as they need to carefully follow convention in order to process arguments and return values correctly, as well as execute the hardware-specific trap instruction. And now you know why you personally don’t have to write assembly code to trap into an OS; somebody has already written that assembly for you.

**How does the trap know which code to run inside the OS?**

The kernel does so by setting up a **trap table** at boot time. When the machine boots up, it does so in privileged (kernel) mode, and thus is free to configure machine hardware as need be. The OS informs the hardware of the locations of these **trap handlers**.

**Limited Direct Execution Protocol**

![os-limited_directed_execution_protocol.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-limited_directed_execution_protocol.png)

There are two phases in the LDE protocol:

In the first (at boot time), the kernel initializes the **trap table**, and the CPU remembers its location for subsequent use.

In the second (when running a process), the kernel sets up a few things (e.g., allocating a node on the process list, allocating memory) before using a **return-from-trap** instruction to start the execution of the process; this switches the CPU to user mode and begins running the process.

Normal flow:

When the process wishes to issue a system call, it traps back into the OS, which handles it and once again returns control via a return-from-trap to the process. The process then completes its work, and returns from main(); this usually will return into some stub code which will properly exit the program (say, by calling the exit() system call, which traps into the OS).

**Problem #2: Switching Between Processes**

How can the operating system regain control of the CPU so that it can switch between processes?

In a **cooperative** scheduling system, the OS regains control of the CPU by waiting for a system call or an illegal operation of some kind to take place.

How can the OS gain control of the CPU even if processes are not being cooperative? What can the OS do to ensure a rogue process does not take over the machine?

**Timer Interrupt**

A timer device can be programmed to raise an interrupt every so many milliseconds; when the interrupt is raised, the currently running process is halted, and a pre-configured interrupt handler in the OS runs. At this point, the OS has regained control of the CPU, and thus can do what it pleases: stop the current process, and start a different one.

The OS must inform the hardware of which code to run when the timer interrupt occurs; thus, at boot time, the OS does exactly that. Second, also during the boot sequence, the OS must start the timer, which is of course a privileged operation.

**Scheduler**

Whether to continue running the currently-running process, or switch to a different one. This decision is made by a part of the operating system known as the scheduler.

If the decision is made to switch, the OS then executes a low-level piece of code which we refer to as a **context switch**. A context switch is conceptually simple: all the OS has to do is save a few register values for the currently-executing process (onto its kernel stack, for example) and restore a few for the soon-to-be-executing process (from its kernel stack).

![os-timer_interrupt.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-timer_interrupt.png)

## Scheduling

### Chapter 7 - Scheduling: Introduction

**Scheduling Metrics**

- performance
    - turnaround = T(completion) - T(arrival)
    - responsive time = T(first run) - T(arrival)
- fairness

Performance and fairness are often at odds in scheduling.

The introduction of time-shared machines changed all that. Now users would sit at a terminal and demand interactive performance from the system as well. And thus, a new metric was born: response time.

**Assumption**

1. Each job runs for the same amount of time.
2. All jobs arrive at the same time.
3. Once started, each job runs to completion.
4. All jobs only use the CPU (i.e., they perform no I/O)
5. The run-time (length) of each job is known.

**Policy 1-1 FIFO**

under assumption: 1,2,3,4,5

Given our assumptions about jobs all arriving at the same time, we could prove that SJF is indeed an optimal scheduling algorithm.

**Policy 1-2 SJF (Shortest Job First)**

under assumption: 1,2,3,4,5

Why is FIFO not good?

If Assumption(1) is false, there will be the **convoy effect**, where a number of relatively-short potential consumers of a resource get queued behind a heavyweight resource consumer.

Is SJF preemptive?

No, it’s **non-preemptive**. In the old days of batch computing, a number of non-preemptive scheulers were developed; such systems would run each job to completi before considering whether to run a new job. Virtually all modern schedulers are **preemptive**, and quite willing to stop one process from running in order to run another.

**Policy 1-3 STCF (Shortest Time-to-Completion First) or PSJF (Preemptive Shortest Job First)**

under assumption: 1,2,3,4,5

**Policy 2 RR (Round-Robin)**

The basic idea is simple: instead of running jobs to completion, RR runs a job for a **time slice** (sometimes called a scheduling quantum) and then switches to the next job in the run queue.

The length of the time slice is critical for RR. The shorter it is, the better the performance of RR under the response-time metric. However, making the time slice too short is problematic: suddenly the cost of context switching will dominate overall performance. Thus, de- ciding on the length of the time slice presents a trade-off to a system de- signer, making it long enough to amortize the cost of switching without making it so long that the system is no longer responsive.

RR, with a reonasonable time slice, is thus an excellent scheduler if response time is our only metric. It is not surprising, then, that RR is indeed one of the worst policies if turnaround time is our metric.

**Policy 1 vs. Policy 2**

There is an inherent trade-off: if you are willing to be unfair, you can run shorter jobs to com- pletion, but at the cost of response time; if you instead value fairness, response time is lowered, but at the cost of turnaround time. This type of trade-off is common in systems

**Incorporate I/O by overlap**

under assumption: 4

We see how a scheduler might incorporate I/O. By treating each CPU burst as a job, the scheduler makes sure processes that are “interactive” get run frequently. While those interactive jobs are performing I/O, other CPU-intensive jobs run, thus better utilizing the processor.

### Chapter 8 - Scheduling: The Multi-Level Feedback Queue

**MLFQ**

it has **multiple levels of queues**, and **uses feedback to determine the priority** of a given job.

Instead of demanding a priori knowledge of the nature of a job, it observes the execution of a job and prioritizes it accordingly. In this way, it manages to achieve the best of both worlds: it can deliver excellent overall performance (similar to SJF/STCF) for short-running interactive jobs, and is fair and makes progress for long-running CPU-intensive workloads.

*Multi-Level*

The MLFQ has a number of distinct queues, each assigned a different **priority level**. At any given time, a job that is ready to run is on a single queue. MLFQ uses priorities to decide which job should run at a given time: a job with higher priority (i.e., a job on a higher queue) is chosen to run. Of course, more than one job may be on a given queue, and thus have the same priority. In this case, we will just use round-robin scheduling among those jobs.

*Feedback*

Thus, the key to MLFQ scheduling lies in how the scheduler sets priorities. Rather than giving a fixed priority to each job, MLFQ varies the priority of a job based on its observed behavior.

**How To Change Priority**

Rule 3: When a job enters the system, it is placed at the highest priority (the topmost queue).
Rule 4a: If a job uses up an entire time slice while running, its priority is reduced (i.e., it moves down one queue).
Rule 4b: If a job gives up the CPU before the time slice is up, it stays at the same priority level.

*Problems*

1. Starvation
2. Smart user could rewrite their program to game the scheduler.
3. A program may change its behavior over time; what was CPU-bound may transition to a phase of interactivity.

**How to prevent gaming of our scheduler?**

Rules 4a and 4b, let a job retain its priority by relinquishing the CPU before the time slice expires. The solution here is to perform better **accounting** of CPU time at each level of the MLFQ. Instead of forgetting how much of a time slice a process used at a given level, the scheduler should keep track; once a process has used its allotment, it is demoted to the next priority queue.

Rule 4: Once a job uses up its time allotment at a given level (regardless of how many times it has given up the CPU), its priority is reduced (i.e., it moves down one queue).

**Priority Boost**

The simple idea here is to periodically boost the priority of all the jobs in system.

Rule 5: After some time period S, move all the jobs in the system to the topmost queue.

**Tuning MLFQ**

One big question is how to **parameterize** such a scheduler.

- How many queues should there be?
- How big should the time slice be per queue?
- How often should priority be boosted in order to avoid starvation and account for changes in behavior?

*Some Variants*

Most MLFQ variants allow for **varying time-slice length** across different queues. The high-priority queues are usually given short time slices; the low-priority queues, in contrast, contain long-running jobs that are CPU-bound; hence, longer time slices work well.

![os-lower_priority_longer_quanta.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-lower_priority_longer_quanta.png)

The FreeBSD scheduler (version 4.3) uses a formula to calculate the current priority level of a job, basing it on how much CPU the process has used.

Some schedulers reserve the highest priority levels for operating system work; thus typical user jobs can never obtain the highest levels of priority in the system. Some systems also allow some user advice to help set priorities; for example, by using the command-line utility nice.

**Refined Rules**

- Rule 1: If Priority(A) > Priority(B), A runs (B doesn’t).
- Rule 2: If Priority(A) = Priority(B), A & B run in RR.
- Rule 3: When a job enters the system, it is placed at the highest priority (the topmost queue).
- Rule 4: Once a job uses up its time allotment at a given level (re- gardless of how many times it has given up the CPU), its priority is reduced (i.e., it moves down one queue).
- Rule 5: After some time period S, move all the jobs in the system to the topmost queue.

### Chapter 9 - Scheduling: Proportional Share

**0\. Basic Idea**

**Proportional-share scheduler**, also sometimes referred to as a **fair-share scheduler**. Proportional-share is based around a simple concept: instead of optimizing for turnaround or response time, a scheduler might instead try to guarantee that each job obtain a certain percentage of CPU time.

**Implementations**

- **lottery** scheduling, lottery uses randomness in a clever way to achieve proportional share
- **stride** scheduling, stride does so deterministically

**Application**

One is that such approaches do not particularly mesh well with I/O [AC97]; another is that they leave open the hard problem of ticket assignment, i.e., how do you know how many tickets your browser should be allocated?

As a result, proportional-share schedulers are more useful in domains where some of these problems (such as assignment of shares) are rela- tively easy to solve. For example, in a virtualized data centre.

**1\. Lottery Scheduling**

The basic idea is quite simple: every so often, hold a lottery to determine which process should get to run next; processes that should run more often should be given more chances to win the lottery. One of the most beautiful aspects of lottery scheduling is its use of randomness.

**Advantage**

- randomness
    - First, random often avoids strange corner-case behaviors that a more traditional algorithm may have trouble handling.
    - Second, random also is lightweight, requiring little state to track alternatives.
    - Finally, random can be quite fast.
- simplicity of implementation
- no global state

**Disadvantage**

- Hard to assign tickets to jobs
- Not deterministic. Only as the jobs run for a significant number of time slices does the lottery scheduler approach the desired outcome.

**Ticket**

Tickets, which are used to represent the share of a resource that a process (or user or whatever) should receive. The percent of tickets that a process has represents its share of the system resource in question.

**Ticket Mechanisms**

Lottery scheduling also provides a number of mechanisms to manipulate tickets in different and sometimes useful ways.

- ticket currency
- ticket transfer
- ticket inflation

**Implementation**

Probably the most amazing thing about lottery scheduling is the simplicity of its implementation.

- a good random number generator to pick the winning ticket
- a data structure to track the processes of the system (e.g., a list)
- the total number of tickets.

**2\. Stride Scheduling**

a **deterministic** fair-share scheduler.

Respectively, we can compute the stride of each by dividing some large number by the number of tickets each process has been assigned. We call this value the **stride** of each process.

Jobs A, B, and C, with 100, 50, and 250 tickets. if we divide 10,000 by each of those ticket values, we obtain the following stride values for A, B, and C: 100, 200, and 40.

Every time a process runs, we will increment a counter for it (called its **pass** value) by its stride to track its global progress. The scheduler then uses the stride and pass to determine which process should run next.

The basic idea is simple: at any given time, pick the process to run that has the lowest pass value so far; when you run a process, increment its pass counter by its stride.

**Advantage**

Lottery scheduling achieves the proportions probabilistically over time; stride scheduling gets them exactly right at the end of each scheduling cycle.

**Disadvantage**

Well, lottery scheduling has one nice property that stride scheduling does not: no global state. Imagine a new job enters in the middle of our stride scheduling example above; what should its pass value be? Should it be set to 0? If so, it will monopolize the CPU. With lottery scheduling, there is no global state per process; we simply add a new process with whatever tickets it has, update the single global variable to track how many total tickets we have, and go from there. In this way, lottery makes it much easier to incorporate new processes in a sensible manner.

### Chapter 10 - Multiprocessor Scheduling

*TODO after reading Concurrency*

# Memory Virtualisation

## Address Space

### Chapter 13 - The Abstraction: Address Spaces

**Multiprogramming** (多道程序), in which multiple processes were ready to run at a given time, and the OS would switch between them.

**Time sharing**, One way to implement time sharing would be to run one process for a short while, giving it full access to all memory, then stop it, save all of its state to some kind of disk (including all of physical memory), load some other process’s state, run it for a while, and thus implement some kind of crude sharing of the machine. Unfortunately, this approach has a big problem: it is way too slow, particularly as memory grows.

**Address space**

Address space, easy to use abstraction of physical memory, and it is the running program’s view of memory in the system. Understanding this fundamental OS ab- straction of memory is key to understanding how memory is virtualized.

When the OS does this, we say the OS is **virtualising memory**.

**Goals**

The VM system is responsible for providing the illusion of a large, sparse, private address space to programs, which hold all of their instructions and data therein.

- transparency
- efficiency
- protection (isolation)

**EVERY ADDRESS YOU SEE IS VIRTUAL**

Any address you can see as a programmer of a user-level program is a virtual address, if you print out an address in a program, it’s a virtual one.

![os-every_address_you_see_is_virtual.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-every_address_you_see_is_virtual.png)

### Chapter 14 - Interlude: Memory API

**Types of Memory**

- **stack memory**, allocations and deallocations of it are managed implicitly by the compiler for you, the programmer.
- **heap memory**, it is this need for long-lived memory, where all allocations and deallocations are explicitly handled by you, the programmer.

Example

```c
void func() {     int *x = (int *) malloc(sizeof(int));     ... }
```

First, you might no- tice that both stack and heap allocation occur on this line: first the com- piler knows to make room for a pointer to an integer when it sees your declaration of said pointer (int *x); subsequently, when the program calls malloc(), it requests space for an integer on the heap; the routine returns the address of such an integer (upon success, or NULL on failure), which is then stored on the stack for use by the program.

**API**

- **malloc()**
- **free()**

There are really two levels of memory management in the system. The first is level of memory management is performed by the OS, which hands out memory to processes when they run, and takes them back when processes exit (or otherwise die). The second level of management is within each process, for example within the heap when you call malloc() and free().

They are not system calls, but rather library calls. Thus the malloc library manages space within your virtual address space, but itself is built on top of some system calls.

- **mmap()**

You can also obtain memory from the operating system via the `mmap()` call. By passing in the correct arguments, mmap() can create an anonymous memory region within your program — a region which is not associated with any particular file but rather with swap space. This memory can then also be treated like a heap and managed as such.

- **calloc()**

Allocates memory and also zeroes it before returning; this prevents some errors where you assume that memory is zeroed and forget to initialize it yourself.

- **realloc()**

when you’ve allocated space for something (say, an array), and then need to add something to it: realloc() makes a new larger region of memory, copies the old region into it, and returns the pointer to the new region.

**Common Errors**

- Forgetting To Allocate Memory - **segmentation fault**, which is a fancy term for YOU DID SOMETHING WRONG WITH MEMORY YOU FOOLISH PROGRAMMER AND I AM ANGRY. Forget to allocate memory.
- Not Allocating Enough Memory - **buffer overflow**
- Forgetting to Initialize Allocated Memory - **uninitialized read**
- Forgetting To Free Memory - **memory leak**
- Freeing Memory Before You Are Done With It - **dangling pointer**
- Freeing Memory Repeatedly - **double free**

**Tools**

- **gdb**, add -g flag to gcc, then run it with gdb. eg. gcc -g null.c -o null -Wall && gdb null
- **valgrind**, eg. valgrind —leak-check=yes null

## Dynamic Allocation and Segmentation

### Chapter 15 - Mechanism: Address Translation

**hardware-based address translation**

With address translation, the hardware transforms each memory access (e.g., an instruction fetch, load, or store), changing the **virtual** address provided by the instruction to a **physical** address where the desired information is actually located.

Transforming a virtual address into a physical address is exactly the technique we refer to as address translation.

Key to the efficiency of this technique is hardware support, which performs the translation quickly for each access, turning virtual addresses (the process’s view of memory) into physical ones (the actual view).

**Static (Software-based) Relocation**

A piece of software known as the loader takes an executable that is about to be run and rewrites its addresses to the desired offset in physical memory.

**Dynamic (Hardware-based) Relocation**

The **base and bounds** technique is also referred to as dynamic relocation. With dynamic relocation, a little hardware goes a long way. Namely, a **base** register is used to transform virtual addresses (generated by the program) into physical addresses. A **bounds** (or **limit**) register ensures that such addresses are within the confines of the address space. Together they provide a simple and efficient virtualization of memory.

Because this relocation of the address happens at runtime, and because we can move address spaces even after the process has started running, the technique is often referred to as dynamic relocation.

We should note that the base and bounds registers are hardware stru tures kept on the chip (one pair per CPU). Sometimes people call the part of the processor that helps with address translation the **memory management unit (MMU)**.

**Disadvantage**

The simple approach of using a base and bounds register pair to virtualize memory is wasteful. It also makes it quite hard to run a program when the entire address space doesn’t fit into memory; thus, base and bounds is not as flexible as we would like.

![os-base_and_bounds.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-base_and_bounds.png)

**Hardware Support**

The hardware should provide special instructions to modify the base and bounds registers, allowing the OS to change them when different processes run. These instructions are privileged; only in kernel (or privileged) mode can the registers be modified.

![os-dynaimic_relocation_hardware_requirement.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-dynaimic_relocation_hardware_requirement.png)

**Operating System Support**

The combination of hardware support and OS management leads to the implementation of a simple virtual memory.

![os-dynamic_relocation_os_responsibility.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-dynamic_relocation_os_responsibility.png)

**Limited Direct Execution Protocol (Dynamic Relocation)**

![os-dynamic_relocation_LDE.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-dynamic_relocation_LDE.png)

### Chapter 16 Segmentation

**Segmentation: Generalized Base/Bounds**

Considering the disadvantage of the simple base and bounds, instead of having just one base and bounds pair in our **MMU**, why not **have a base and bounds pair per logical segment of the address space**? A segment is just a contiguous portion of the address space of a particular length, and in our canonical address space, we have three logically-different segments: code, stack, and heap.

The hardware structure in our **MMU** required to support segmenta- tion is just what you’d expect: in this case, a set of three base and bounds register pairs.

**Advantage**

Remove the Inner Fragmentation.

What segmentation allows the OS to do is to place each one of those segments in different parts of physical memory, and thus avoid filling physical memory with unused virtual address space.

![os-segmentation.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-segmentation.png)

**THE SEGMENTATION FAULT**

The term segmentation fault or violation arises from a memory access on a segmented machine to an illegal address. Humorously, the term persists, even on machines with no support for segmentation at all. Or not so humorously, if you can’t figure why your code keeps faulting

**Implementation**

One common approach, sometimes referred to as an explicit approach, is to chop up the address space into segments based on the top few bits of the virtual address.

![os-segmentation_implementation.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-segmentation_implementation.png)

**Hardware Support**

Negative growth for stack, and protection bits for code sharing. (to save memory, sometimes it is useful to share certain memory segments between address spaces. In particular, **code sharing** is common and still in use in systems today.)

![os-segmentation_register_with_protection.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-segmentation_register_with_protection.png)

**Fine-grained vs. Coarse-grained Segmentation**

- Coarse-grained, with just a few segments (i.e., code, stack, heap).
- Fine-grained, to consist of a large number smaller segments, with (further hardware support) a **segment table** of some kind stored in memory.

**Disadvantage**

The general problem that arises is that physical memory quickly becomes full of little holes of free space, making it difficult to allocate new segments, or to grow existing ones. We call this problem **external fragmentation**.

Because segments are variablesized, free memory gets chopped up into odd-sized pieces, and thus satisfying a memory-allocation request can be difficult. One can try to use smart algorithms or periodically compact memory, but the problem is fundamental and hard to avoid. (compact physical memory by rearranging the existing segments, is memory-intensive and generally uses a fair amount of processor time.)

![os-segmentation_compact_memory.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-segmentation_compact_memory.png)

Segmentation still isn’t flexible enough to support our fully generalized, sparse address space.

### Chapter 17 - Free-Space Management

Managing free space can certainly be easy, as we will see when we discuss the concept of paging. It is easy when the space you are managing is divided into fixed-sized units; in such a case, you just keep a list of these fixed-sized units; when a client requests one of them, return the first entry.

Where free-space management becomes more difficult (and interesting) is when the free space you are managing consists of variable-sized units; this arises in a user-level memory-allocation library (as in malloc() and free()) and in an OS managing physical memory when using segmentation to implement virtual memory. In either case, the problem that exists is known as **external fragmentation**: the free space gets chopped into little pieces of different sizes and is thus fragmented; subsequent requests may fail because there is no single contiguous space that can satisfy the request, even though the total amount of free space exceeds the size of the request.

**Target**

The more you know about the exact workload presented to an **allocator**, the more you could do to tune it to work better for that workload.

**Assumptions**

Focus on the great history of allocators found in user-level memory-allocation libraries. The space that this library manages is known historically as the heap, and the geeric data structure used to manage free space in the heap is some kind of **free list**. This structure contains references to all of the free chunks of space in the managed region of memory.

Example

void free(void *ptr) takes a pointer and frees the corresponding chunk. Note the implication of the interface: the user, when freeing the space, does not inform the library of its size; thus, the library must be able to figure out how big a chunk of memory is when handed just a pointer to it.

**Splitting and Coalescing**

- The split is commonly used in allocators when requests are smaller than the size of any particular free chunk.
- Coalesce free space when a chunk of memory is freed.

**Tracking The Size Of Allocated Regions**

To accomplish this task, most allocators store a little bit of extra information in a **header** block which is kept in memory, usually just before the handed-out chunk of memory.

![os-free_space_management_non_coalesced_free_list.png](https://github.com/ifyouseewendy/ifyouseewenndy.github.io/raw/source/image-repo/os-free_space_management_non_coalesced_free_list.png)

## Paging

### Chapter 18 - Paging: Introduction

**Background**

The operating system takes one of two approaches when solving most any space-management problem.

1. The first approach is to chop things up into **variable-sized** pieces, as we saw with segmenta- tion in virtual memory.
2. To chop up space into **fixed-sized** pieces. In virtual memory, we call this idea paging.

**Page vs. Page Frame**

- From perspective of address space, the fixed-sized unit is called page.
- From perspective of physical space, the fixed-sized unit is called page frame.

So, the address translation is to translate page to relevant page frame.

**32 bits vs. 64 bits**

Sometimes we say the OS is 32 bits or 64 bits, we may infer that

- 32 bits OS has 4GB address space
- 64 bits OS has 10mGB address space

**Advantage**

- First, it does not lead to external fragmentation, as paging (by design) divides memory into fixed-sized units.
- Second, it is quite flexible, enabling the sparse use of virtual address spaces.

**Translation**

To translate this virtual address that the process generated, we have to first split it into two components: the **virtual page number (VPN)**, and the **offset** within the page.

With our virtual page number, we can now index our page table, to get the **physical frame number (PFN)** (also sometimes called the **physical page number or PPN**).

Note the offset stays the same (i.e., it is not translated), because the offset just tells us which byte within the page we want.

![os-paging_address_translation_process.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-paging_address_translation_process.png)

**Page Table**

The operating system usually keeps a per-process data structure known as a page table.

One of the most important data structures in the memory management subsystem of a modern OS is the page table. In general, a page table stores virtual-to-physical address translations

The page table is just a data structure that is used to map virtual addresses (or really, virtual page numbers) to physical addresses (physical frame numbers). The OS indexes the array by the virtual page number (VPN), and looks up the page-table entry (PTE) at that index in order to find the desired physical frame number (PFN).

![os-paging_page_table.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-paging_page_table.png)

**Storage**

Because page tables are so big, we don’t keep any special on-chip hard- ware in the MMU to store the page table of the currently-running process. Instead, we store the page table for each process in memory somewhere.

**Page Table Entry (PTE)**

![os-paging_x86_pte_example.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-paging_x86_pte_example.png)

**Page Table Base Register (PTBR)**

PTBR contains the physical address of the starting location of the page table.

Code Example

![os-paging_access_memory_code_demo.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-paging_access_memory_code_demo.png)

### Chapter 19 - Paging: Faster Translations (TLBs)

**Background**

Using paging as the core mechanism to support virtual memory can lead to high performance overheads. By chopping the address space into small, fixed-sized units (i.e., pages), paging requires a large amount of mapping information. Going to memory for translation information before every instruction fetch or explicit load or store is prohibitively slow.

**Translation Lookaside Buffer (TLB)**

To speed address translation, we are going to add what is called (for historical reasons) a **translation-lookaside buffer**, or **TLB**. A TLB is part of the chip’s **memory-management unit (MMU)**, and is simply a hardware cache of popular virtual-to-physical address translations; thus, a better name would be an **address-translation cache**.

**Advantage**

By providing a small, dedicated on-chip TLB as an address-translation cache, most memory references will hopefully be handled without having to access the page table in main memory.

**Algorithm**

![os-paging_tlb_control_flow.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-paging_tlb_control_flow.png)

Goal is to improve the TLB **hit rate**.

**TLB Content**

![os-paging_tlb_content.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-paging_tlb_content.png)

TLB contains both VPN and PFN in each entry, in hardware terms, the TLB is known as a **fully-associative** cache.

**TLB Miss Handling**

Two answers are possible: the hardware, or the software (OS).

A modern system that uses **software-managed TLBs**. On a TLB miss, the hardware simply raises an exception, which pauses the current instruction stream, raises the privilege level to kernel mode, and jumps to a trap handler. As you might guess, this trap handler is code within the OS that is written with the express purpose of handling TLB misses.

![os-paging_tlb_control_flow_os_handled.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-paging_tlb_control_flow_os_handled.png)

**Performance Matters**

Like any cache, TLBs rely upon both spatial and temporal locality for success, which are program properties. The idea behind hardware caches is to take advantage of **locality** in instruction and data references. Hardware caches, whether for instructions, data, or address translations (as in our TLB) take advantage of locality by keeping copies of memory in small, fast on-chip memory.

1. **spatial locality**, the idea is that if a program accesses memory at address x, it will likely soon access memory near x.
2. **temporal locality**, the idea is that an instruction or data item that has been recently accessed will likely be re-accessed soon in the future.
3. page size, why don’t we just make bigger caches and keep all of our data in them? Because any large cache by definition is slow, and thus defeats the purpose.

**Issue 1: Context Switch**

Specifically, the TLB contains virtual-to-physical translations that are only valid for the currently running process; these translations are not meaningful for other processes. As a result, when switching from one process to another, the hardware or OS (or both) must be careful to ensure that the about-to-be-run process does not accidentally use translations from some previously run process.

1. **flush** the TLB on context switches, thus emptying it before running the next process. But there is a cost: each time a process runs, it must incur TLB misses as it touches its data and code pages. If the OS switches between processes frequently, this cost may be high.
2. **address space identifier (ASID)**, which you can think of the ASID as a process identifier (PID), to enable sharing of the TLB across context switches.

![os-paging_tlb_with_asid.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-paging_tlb_with_asid.png)

**Issue 2: Replacement Policy**

When we are installing a new entry in the TLB, we have to replace an old one, which one to replace?

- **least-recently-used (LRU)**
- **random policy**

LRU tries to take advantage of locality in the memory-reference stream, and what the random policy exists for?

Random policy is useful due to its simplicity and ability to avoid corner-case behaviors; for example, a “reasonable” policy such as LRU behaves quite unreasonably when a program loops over n + 1 pages with a TLB of size n; in this case, LRU misses upon every access, whereas random does much better.

**Disadvantage**

1. Exceeding the TLB coverage, and it can be quite a problem for certain programs. Support for large pages is often exploited by programs such as a database management system (a DBMS), which have certain data structures that are both large and randomly-accessed.

    **RAM isn’t always RAM**. Sometimes randomly accessing your address space, particular if the number of pages accessed exceeds the TLB coverage, can lead to severe performance penalties. Because one of our advisors, David Culler, used to always point to the TLB as the source of many performance problems, we name this law in his honor: **Culler’s Law**.

2. TLB access can easily become a bottleneck in the CPU pipeline, in particular with what is called a **physically-indexed cache**. With such a cache, address translation has to take place before the cache is accessed, which can slow things down quite a bit. A **virtually-indexed cach**e solves some performance problems, but introduces new issues into hardware design as well.

### Note on Cache Management

Define cache miss and hit, and goal is to improve the cache rate. Normally, better **replacement policy** lead to higher cache rate.

**Find the best replacement policy**

- Find the optimal
- Find the easiest
- Improve toward optimal, considering Principle of Locality
- Think about corner case

**Reference: Optimal Replacement Policy**

Although optimal is not very practical as a real policy, it is incredibly useful as a comparison point in simulation or other studies.

- It makes your improvement meaningful, comparing to optimal policy
- It can show you how much improvement still possible
- It can tell you when to stop making your policy better, because it is close enough to the ideal

**Reference: Easiest Replacement Policy**

Random policy, with an extraordinary advantage, can avoid corner case.

**Reference: Principle of Locality**

Programs tend to access certain code sequences (e.g., in a loop) and data structures (e.g., an array accessed by the loop) quite frequently.

- spatial locality
- temporal locality, e.g., LRU
- operation expense, e.g., When swapping out pages, dirty pages are much more expensive

**Reference: Types of Cache Misses**

In the computer architecture world, architects sometimes find it useful to characterize misses by type, into one of three categories, sometimes called the Three C’s.

- **Compulsory miss** (cold-start miss) occurs because the cache is empty to begin with and this is the first reference to the item.
- **Capacity miss** occurs because the cache ran out of space and had to evict an item to bring a new item into the cache.
- **Conflict miss** arises in hardware because of limits on where an item can be placed in a hardware cache, due to something known as set-associativity; it does not arise in the OS page cache because such caches are always fully-associative, i.e., there are no restrictions on where in memory a page can be placed.


### Chapter 20 - Paging: Smaller Tables

**Crux**

How to get rid of all those invalid regions in the page table instead of keeping them all in memory?

**Background**

Page tables are t big and thus consume too much memory.

Assume again a 32-bit address space (2^32 bytes), with 4KB (2^12 byte) pages and a 4-byte page-table entry. An address space thus has roughly one million virtual pages in it ( 2^20 ); multiply by the page-table entry size and you see that our page table is 4MB in size. Recall also: we usually have one page table for every process in the system! With a hundred active processes (not uncommon on a modern system), we will be allocating hundreds of megabytes of memory just for page tables!

**Solution 1 - Bigger Pages**

Big pages lead to waste within each page, a problem known as internal fragmentation. Thus, most systems use relatively small page sizes in the common case: 4KB (as in x86).

**Solution 2 - Hybrid Approach: Paging and Segments**

![os-paging_tlb_hybrid_approach.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-paging_tlb_hybrid_approach.png)

**Algorithm**

Instead of having a single page table for the entire address soopace of the process, have one per logical segment. In this example, we might thus have three page tables.

Remember with segmentation, we had a **base** register that told us where each segment lived in physical memory, and a **bound** or limit register that told us the size of said segment.

1. Each logical segment (code, stack, and heap) has one page table.
2. Each segment has one pair of base and bounds resisters.
3. Base register points to the page table of the segment, and bounds is used to indicate the end of the page table.

**Advantage**

In this manner, our hybrid approach realizes a significant memory savings compared to the linear page table; unallocated pages between the stack and the heap no longer take up space in a page table (just to mark them as not valid).

**Disadvantage**

1. It still requires us to use segmentation, as it assumes a certain usage pattern of the address space; if we have a large but sparsely-used heap, for example, we can still end up with a lot of page table waste.
2. This hybrid causes external fragmentation to arise again. While most of memory is managed in page-sized units, page tables now can be of arbitrary size (in multiples of PTEs). Thus, finding free space for them in memory is more complicated.

**Solution 3 - Multi-level Page Tables**

It turns the linear page table into something like a tree (**page directory**). This approach is so effective that many modern systems employ it (e.g., x86).

**Algorithm**

First, chop up the page table into page-sized units; if an entire page of page-table entries (PTEs) is invalid, don’t allocate that page of the page table at all. To track whether a page of the page table is valid (and if valid, where it is in memory), use a new structure, called the page directory. The page directory thus either can be used to tell you where a page of the page table is, or that the entire page of the page table contains no valid pages.

The page directory, in a simple two-level table, contains one entry per page of the page table. It consists of a number of **page directory entries (PDE)**. A PDE (minimally) has a **valid bit** **and a page frame number (PFN)**, similar to a PTE.

VA contains VPN and offset, and VPN can be splitted into **page directory index** and **page table index**.

1. Use **page directory index** to search page directory, to get **page directory entry**, to get **page frame number**, to get the specific **page table**.
2. Use **page table index** to search the page table, to get **page table entry**, to get the real **physical frame number**.

![os-paging_multi_level_page_table_demo.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-paging_multi_level_page_table_demo.png)

Demo code

![os-paging_multi_level_page_table_demo_code.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-paging_multi_level_page_table_demo_code.png)

**Advantage**

1. The multi-level table only allocates page-table space in proportion to the amount of address space you are usig; thus it is generally compact and supports sparse address spaces.
2. If carefully constructed, each portion of the page table fits neatly within a page, making it easier to manage memory; the OS can simply grab the next free page when it needs to allocate or grow a page table.

    Contrast this to a simple (non-paged) linear page table, for a large page table (say 4MB), finding such a large chunk of unused contiguous free physical memory can be quite a challenge. With a multi-level structure, the indirection allows us to place page-table pages wherever we would like in physical memory.

**Disadvantage**

1. Time-space trade-off. It should be noted that there is a cost to multi-level tables; on a TLB miss, two loads from memory will be required to get the right translation information from the page table (one for the page directory, and one for the PTE itself).
2. Another obvious negative is complexity. Whether it is the hardware or OS handling the page-table lookup (on a TLB miss), doing so is undoubt- nedly more involved than a simple linear page-table lookup.

**Example**

![os-paging_multi_level_page_table_example.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-paging_multi_level_page_table_example.png)

Virtual Address format

![os-paging_multi_level_page_table_example_va.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-paging_multi_level_page_table_example_va.png)

Explanation

![os-paging_multi_level_page_table_example_explanation.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-paging_multi_level_page_table_example_explanation.png)

**Issues**

***What if the page directory gets too big?***

Make it more than two levels, add index to page directory index.

***How to make it extreme space savings?***

Inverted page tables. Instead of having many page tables (one per process of the system), we keep a single page table that has an entry for each physical page of the system. The entry tells us which process is using this page, and which virtual page of that process maps to this physical page.

A hash table is often built over the base structure to speed lookups.

***How to choose page table size?***

In a memory-constrained system (like many older systems), small structures make sense; in a system with a reasonable amount of memory and with workloads that actively use a large number of pages, a bigger table that speeds up TLB misses might be the right choice.

***What if the page tables are too big to fit into memory all at once?***

Thus far, we have assumed that page tables reside in kernel-owned physical memory. Some systems place such page tables in **kernel virtual memory**, thereby allowing the system to swap some of these page tables to disk when memory pressure gets a little tight.

## Beyond Physical Memory

### Chapter 21 - Beyond Physical Memory: Mechanisms

**Background**

In fact, we’ve been assuming that every address space of every running process fits into memory. We will now relax these big assumptions, and assume that we wish to support many concurrently-running large address spaces.

To support large address spaces, the OS will need a place to stash away portions of address spaces that currently aren’t in great demand. In modern systems, this role is usually served by a hard disk drive.

**Mechanism**

To do so requires more complexity in page-table structures, as a **present bit** (of some kind) must be included to tell us whether the page is present in memory or not. When not, the operating system **page-fault handler** runs to service the **page fault**, and thus arranges for the transfer of the desired page from disk to memory, perhaps first replacing some pages in memory to make room for those soon to be swapped in.

**Swap Space**

To reserve some space on the disk for moving pages back and forth. We will simply assume that the OS can read from and write to the swap space, in page-sized units. To do so, the OS will need to remember the **disk address** of a given page (PTE).

![os-swap_example.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-swap_example.png)

The size of the swap space is important, as ultimately it determines the **maximum number of memory pages** that can be in use by a system at a given time.

We should note that swap space is not the only on-disk location for swapping traffic.

> For example, assume you are running a program binary (e.g., ls, or your own compiled main program). The code pages from this binary are initially found on disk, and when the program runs, they are loaded into memory (either all at once when the program starts execution, or, as in modern systems, one page at a time when needed). However, if the system needs to make room in physical memory for other needs, it can safely re-use the memry space for these code pages, knowing that it can later swap them in again from the on-disk binary in the file system.

**Present Bit**

OS use this piece of information in each page-table entry to flag if the page is in physical memory or swap space.

If the present bit is set to one, it means the page is present in physical memory and everything proceeds as above; if it is set to zero, the page is not in memory but rather on disk somewhere.

**Page Faut**

The act of accessing a page that is not in physical memory is commonly referred to as a **page fault** (it should be called a **page miss**. But when something the hardware doesn’t know how to handle occurs, the hardware simply transfers control to the OS. In perspective of the hardware it is a page fault).

**Page Fault Handler**

Upon a page fault, the OS is invoked to service the page fault. A particular piece of code, known as a **page-fault handler**, runs, and must service the page fault.

The appropriately-named **OS page-fault handler** runso to determine what to do. Virtually all systems handle page faults in software; even with a hardware-managed TLB, the hardware trusts the OS to manage this important duty.

**Page Fault Control Flow**

Hardware

![os-swap_page_fault_control_flow.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-swap_page_fault_control_flow.png)

Software

![os-swap_page_fault_control_flow_software.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-swap_page_fault_control_flow_software.png)

How to handle or how will the OS know where to find the desired page?

1. The OS could use the bits in the PTE normally used for data such as the PFN of the page for a disk address. When the OS receives a page fault for a page, it looks in the PTE to find the address, and issues the request to disk to fetch the page into memory.
2. When the disk I/O completes, the OS will then update the page table to mark the page as present, update the PFN field of the page-table entry (PTE) to record the in-memory location of the newly-fetched page, and retry the instruction.
3. Then generate a TLB miss, which would then be serviced and update the TLB with the translation (one could alternately update the TLB when servicing the page fault to avoid this step)
4. Finally, a last restart would find the translation in the TLB and thus proceed to fetch the desired data or instruction from memory at the translated physical address.

Note that while the I/O is in flight, the process will be in the blocked state. Thus, the OS will be free to run other ready processes while the page fault is being serviced.

***What If Memory Is Full?***

OS might like to first page out one or more pages to make room for the new page(s) the OS is about to bring in. The process of picking a page to kick out, or replace is known as the **page-replacement policy**.

***When Replacements Really Occur?***

There are many reasons for the OS to keep a small portion of memory free more proactively. To keep a small amount of memory free, most operating systems thus have some kind of **high watermark (HW)** and **low watermark (LW)** to help decide when to start evicting pages from memory.

When the OS notices that there are fewer than LW pages available, a background thread that is responsible for freeing memory runs. The thread evicts pages until there are HW pages available. The background thread, sometimes called the **swap daemon** or **page daemon**, then goes to sleep, happy that it has freed some memory for running processes and the OS to use.

So, instead of performing a replacement directly, the algorithm would instead simply check if there are any free pages available. If not, it would inform the **page daemon** that free pages are needed; when the thread frees up some pages, it would re-awaken the original thread, which could then page in the desired page and go about its work.

***How To Make Replacement Efficient?***

Many systems will cluster or group a number of pages and write them out at once to the swap partition, thus increasing the efficiency of the disk.

### Chapter 22 - Beyond Physical Memory: Policies

**Background**

In such a case, this memory pressure forces the OS to start **paging out** pages to make room for actively-used pages. Deciding which page (or pages) to evict is encapsulated within the **replacement policy** of the OS.

**Cache Management**

Given that main memory holds some subset of all the pages in the system, it can rightly be viewed as a cache for virtual memory pages in the system. And our goal as maximizing the number of **cache hits**.

Knowing the number of cache hits and misses let us calculate the **average memory access time (AMAT)** for a program.

![os-replacement_amat.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-replacement_amat.png)

Example

Suppose T(M) = 100ns (10^-7), T(D) = 10ms (10^-2)

- P(Hit) = 90%, P(Miss) = 10%, AMAT = 1ms + 90ns
- P(Hit) = 99.9%, P(Miss) = 0.1%, AMAT = 0.01ms + 99.9ns

The cost of disk access is so high in modern systems that even a tiny miss rate will quickly dominate the overall AMAT of running programs.

**Polices**

![os-replacement_summary.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-replacement_summary.png)

**Policy 1. Optimal Replacement Policy**

Replaces the page that will be accessed furthest in the future is the optimal policy, resulting in the fewest-possible cache misses.

In the development of scheduling policies, the future is not generally known; you can’t build the optimal policy for a general-purpose operating system.

Although optimal is not very practical as a real policy, it is incredibly useful as a comparison point in simulation or other studies.

- It makes your improvement meaningful, comparing to optimal policy
- It can show you how much improvement still possible
- It can tell you when to stop making your policy better, because it is close enough to the ideal

**Policy 2. FIFO**

Normal efficiency, easy to implement, and has corner case.

In some cases, when increasing the cache size, hit rate may get lower. This odd behavior is generally referred to as **Belady’s Anomaly**.

**Policy 3. Random**

Normal efficiency, easy to implement, but remember, it can avoid corner case.

**Policy 4. LRU**

LRU has what is known as a stack property. When increasing the cache size, hit rate will either stay the same or improve.

**Comparison with Workload**

No locality workload

![os-replacement_no_locality_workload.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-replacement_no_locality_workload.png)

The 80-20 Workload, 80% of the references are made to 20% of the pages (the “hot” pages).

![os-replacement_80_20_workload.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-replacement_80_20_workload.png)

The Looping-Sequential Workload

Looping sequential workload, as in it, we refer to 50 pages in sequence, starting at 0, then 1, ..., up to page 49, and then we lp, repeating those accesses.

It represents a worst-case for both LRU and FIFO, but no influence on Random. Turns out that random has some nice properties; one such property is not having weird corner-case behaviors.

![os-replacement_looping_sequential_workload.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-replacement_looping_sequential_workload.png)

**Implementation - Approximating LRU**

To keep track of which pages have been least- and most-recently used, the system has to do some accounting work on every memory reference. Unfortunately, as the number of pages in a system grows, scanning a huge array of times just to find the absolute least-recently-used page is prohibitively expensive.

Idea

Approximating LRU is more feasible from a computational-overhead standpoint, and indeed it is what many modern systems do. The idea requires some hardware support, in the form of a **use bit** (sometimes called the **reference bit**).

- Whenever a page is referenced (i.ooe., read or written), the use bit is set by hardware to 1.
- The hardware never clears the bit, though (i.e., sets it to 0); that is the responsibility of the OS.

Implementation by Clock Algorithm

- Imagine all the pages of the system arranged in a circular list. A clock hand points to some particular page to begin with.
- When a replacement must occur, the OS iterating the circular list checking on use bit.
    - If 1, clear use bit to 0, and find next
    - If 0, use it

![os-replacement_80_20_workload_with_clock.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-replacement_80_20_workload_with_clock.png)

**Considering Dirty Pages**

Consider the locality by the expense on swapping out pages.

- If a page has been **modified** and is thus **dirty**, it must be written back to disk to evict it, which is expensive.
- If it has not been modified (and is thus clean), the eviction is free; the physical frame can simply be reused for other purposes without additional I/O.
Idea

To support this behavior, the hardware should include a **modified bit** (a.k.a. **dirty bit**).

Implementation by Clock Algorithm

The clock algorithm, for example, could be changed to scan for pages that are both unused and clean to evict first; failing to find those, then for unused pages that are dirty, and so forth.

**Other VM Policies**

***When the OS bring a page into memory?***

Page selection policy. The OS simply uses **demand paging**, which means the OS brings the page into memory when it is accessed, “on demand” as it were. Of course, the OS could guess that a page is about to be used, and thus bring it in ahead of time; this behavior is known as **prefetching**.

***How the OS writes pages out to disk?***

Any systems instead collect a number of pending writes together in memory and write them to disk in one (more efficient) write. This behavior is usually called **clustering** or simply **grouping** of writes, and is effective because of the nature of disk drives.

***What about
 the memory demands of the set of running processes simply exceeds the available physical memory? (condition sometimes referred to as thrashing)***

Given a set of processes, a system could decide not to run a subset of processes, with the hope that the reduced set of processes working sets (the pages that they are using actively) fit in memory and thus can make progress. This approach, generally known as **admission control**, states that it is sometimes better to do less work well than to try to do everything at once poorly.

Some versions of Linux run an **out-of-memory killer** when memory is oversubscribed; this daemon chooses a memory- intensive process and kills it, thus reducing memory in a none-too-subtle manner.

### Chapter 23 - The VAX/VMS Virtual Memory System

**Background**

The VAX-11 minicomputer architecture was introduced in the late 1970’s by Digital Equipment Corporation (DEC).

As an additional issue, VMS is an excellent example of software innovations used to hide some of the inheret flaws of the architecture.

![os-vax_vms_address_space.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/os-vax_vms_address_space.png)

**Reduce Page Table Pressure**

First, by segmenting the user address space into two, the VAX-11 provides a page table for each of these regions (P0 and P1) per process; thus, no page-table space is needed for the unused portion of the address space between the stack and the heap.

Second, the OS reduces memory pressure even further by placing user page tables (for P0 and P1, thus two per process) in kernel virtual memory. Thus, when allocating or growing a page table, the kernel allocates space out of its own virtual memory, in segment S. If memory comes undersevere pressure, the kernel can swap pages of these page tables out to disk, thus making physical memory available for other uses.

**Replacement policy: Segmented FIFO with Page Clustering**

Each process has a maximum number of pages it can keep in memory, known as its **residentn set size (RSS)**. Each of these pages is kept on a FIFO list; when a process exceeds its RSS, the “first-in” page is evicted. FIFO clearly does not need any support from the hardware (no use bit), and is thus easy to implement.

To improve FIFO’s performance, VMS introduced two **second-chance lists** where pages are placed before getting evicted from memory, specifically a global clean-page free list and dirty-page list. The bigger these global second-chance lists are, the closer the segmented FIFO algorithm performs to LRU.

Clustering is used in most modern systems, as the freedom to place pages anywhere within swap space lets the OS group pages, perform fewer and bigger writes, and thus improve performance.

**Optimisation: Be Lazy**

Laziness can put off work until later, which is beneficial within an OS for a number of reasons.

- First, putting off work might reduce the latency of the current operation, thus improving responsiveness; for example, operating systems often report that writes to a file succeeded immediately, and only write them to disk later in the background.
- Second, and more importantly, laziness sometimes obviates the need to do the work at all; for example, delaying a write until the file is deleted removes the need to do the write at all.

**Lazy Optimisation: Demanding Zero**

With demand zeroing, the OS instead does very little work when the page is added to your address space; it puts an entry in the page table that marks the page inaccessible. If the process then reads or writes the page, a trap into the OS takes place. When handling the trap, the OS notices that this is actually a demand-zero page; at this point, the OS then does the needed work of finding a physical page, zeroing it, and mapping it into the process’s address space. If the process never accesses the page, all of this work is avoided, and thus the virtue of demand zeroing.

**Lazy Optimisation: Copy-on-write**

When the OS needs to copy a page from one address space to another, instead of copying it, it can map it into the target address space and mark it read-only in both address spaces.

- If both address spaces only read the page, no further action is taken, and thus the OS has realized a fast copy without actually moving any data.
- If, however, one of the address spaces does indeed try to write to the page, it will trap into the OS. The OS will then notice that the page is a COW page, and thus (lazily) allocate a new page, fill it with the data, and map this new page into the address space of the faulting process. The process then continues and now has its own private copy of the page.

In UNIX systems, COW is even more critical, due to the semantics of `fork()` and `exec()`. `fork()` creates an exact copy of the address space of the caller; with a large address space, making such a copy is slow and data intensive. Even worse, most of the address space is immediately over-written by a subsequent call to `exec()`, which overlays the calling process’s address space with that of the soon-to-be-exec’d program. By instead performing a copy-on-write `fork()`, the OS avoids much of the needless copying and thus retains the correct semantics while improving performance.
