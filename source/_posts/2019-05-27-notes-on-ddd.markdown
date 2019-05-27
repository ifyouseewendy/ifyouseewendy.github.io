---
layout: post
title: "Notes on DDD Quickly"
date: 2019-05-27 11:43:15 -0400
comments: true
categories: "Books"
---

{:.custom}
| **Book**    | Domain Driven Design Quickly
| **Author**  | Floyd Marinescu & Abel Avram
| **Link**    | [InfoQ](https://www.infoq.com/minibooks/domain-driven-design-quickly)

* TOC
{:toc}

![ddd-mind-map](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/ddd/ddd-mind-map.png)

## What is DDD?

The main idea is to identify the **domain model** and design your system around it. Usually, a software designer will talk with the domain expert to figure out the domain.

> You cannot create a banking software system unless you have a good understanding of what banking is all about, one must understand the domain of banking.
How can we make the software fit harmoniously with the domain? The best way to do it is to make software a reflection of the domain. Software needs to incorporate the core concepts and elements of the domain, and to precisely realize the relationships between them. Software has to **model** the domain.

So, what is domain model? It's an abstraction of the domain. It's an internal representation of the target domain.

> A model is an abstraction of the domain. It is not just the knowledge in a domain expert’s head; it is a rigorously organized and selective abstraction of that knowledge. The model is our internal representation of the target domain,

## The Ubiquitous Language

A core **principle** of DDD is to use a language to communicate the domain. Use the model as the backbone of a language. Request that the team use the language consistently in all communications, and also in the code. While sharing knowledge and hammering out the model, the team uses speech, writing and diagrams. Make sure this language appears consistently in all the communication forms used by the team; for this reason, the language is called **the Ubiquitous Language**.

Building a language like that has a clear outcome: the model and the language are strongly interconnected with one another. A change in the language should become a change to the model.

## Model-Driven Design

### building blocks

![ddd-building-blocks](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/ddd/ddd-building-blocks.png)

### Layered Architecture

![ddd-layered-architecture](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/ddd/ddd-layered-architecture.png)

### Express Model with Entities, Value Objects and Services

**Entity**: implementing entities in software means creating identity.

**Value Object**: is an object that is used to describe certain aspects of a domain, being immutable, having no identity, thus can be shared.

It is recommended to select as entities only those objects which conform to the entity definition. And make the rest of the objects Value Objects.

**Service**: without an internal state, its purpose is to simply provide functionality for the domain. There are three characters of a Service

1. The operation performed by the Service refers to a domain concept which does not naturally belong to an Entity or Value Object.
2. The operation performed refers to other objects in the domain.
3. The operation is stateless.

While using Services, is important to keep the domain layer isolated. It is easy to get confused between services which belong to the domain layer, and those belonging to the infrastructure.

### Struct model with Modules

Modules are used as a method of organizing related concepts and tasks in order to reduce complexity. Choose Modules that tell the story of the system and contain a cohesive set of concepts.

It is recommended to group highly related classes into modules to provide maximum cohesion possible. There are several types of cohesion. Two of the most used are *communicational cohesion *and *functional cohesion*.

* Communicational cohesion is achieved when parts of the module operate on the same data. It makes sense to group them, because there is a strong relationship between them.
* Functional cohesion is achieved when all parts of the module work together to perform a well-defined task. This is considered the best type of cohesion.

### Manage a domain object

**Ownership & Boundary: Aggregates**

Aggregate is a domain pattern used to define object ownership and boundaries.

An Aggregate is a group of associated objects which are considered as one unit with regard to data changes. The Aggregate is demarcated by a boundary which separates the objects inside from those outside. Each Aggregate has one root. The root is an Entity, which has global identity and it's responsible for maintaining the invariants, and it is the only object accessible from outside.

1. Cluster the Entities and Value Objects into Aggregates and define boundaries around each.
2. Choose one Entity to be the root of each Aggregate, and control all access to the objects inside the boundary through the root.

**Creation: Factories**

Factories are used to encapsulate the knowledge necessary for object creation, and they are especially useful to create Aggregates. When the root of the Aggregate is created, all the objects contained by the Aggregate are created along with it, and all the invariants are enforced.

It is important for the creation process to be atomic. Another observation is that Factories need to create new objects from scratch.

**Storage: Repositories**

A client needs a practical means of acquiring references to preexisting domain objects. Use a Repository to encapsulate all the logic needed to obtain object references.

The Repository acts as a storage place for globally accessible objects.

* For each type of object that needs global access, create an object that can provide the illusion of an in-memory collection of all objects of that type.
* Set up access through a well-known global interface.
* Provide methods to add and remove objects, which will encapsulate the actual insertion or removal of data in the data store.
* Provide methods that select objects based on some criteria and return fully instantiated objects or collections of objects whose attribute values meet the criteria, thereby encapsulating the actual storage and query technology. Use a Specification.
* Provide repositories only for Aggregate roots that actually need direct access.
* Keep the client focused on the model, delegating all object storage and access to the Repositories.
It can be noted that the implementation of a repository can be closely liked to the infrastructure, but that the repository interface will be pure domain model.

There is a relationship between Factory and Repository. They are both patterns of the model-driven design, and they both help us to manage the life cycle of domain objects.

* While the Factory should create new objects, while the Repository should find already created objects. When a new object is to be added to the Repository, it should be created first using the Factory, and then it should be given to the Repository which will store it like in the example below.
* Another way this is noted is that Factories are “pure domain”, but that Repositories can contain links to the infrastructure, e g the database.

![ddd-factories-and-repositories](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/ddd/ddd-factories-and-repositories.png)

## Refactoring Toward Deeper Insight

A good model is the result of deep thinking, insight, experience, and flair.
Refactoring is done in small steps. The result is also a series of small improvements. There are times when lots of small changes add very little value to the design, and there are times when few changes make a lot of difference. It’s a Breakthrough. Each refinement adds more clarity to the design. This creates in turn the premises for a Breakthrough.

To reach a Breakthrough, we need to make the implicit concepts explicit.

* Listen to the language
* Use domain literature
* Constraint, Process and Specification.
    * A Constraint is a simple way to express an invariant. Whatever happens to the object data, the invariant is respected. This is simply done by putting the invariant logic into a Constraint.
    * Processes are usually expressed in code with procedures. The best way to implement processes is to use a Service.
    * a Specification is used to test an object to see if it satisfies a certain criteria.

## Preserving Model Integrity

It is so easy to start from a good model and progress toward an inconsistent one. The internal consistency of a model is called **unification**. Instead of trying to keep one big model that will fall apart later, we should consciously divide it into several models. Several models well integrated can evolve independently as long as they obey the contract they are bound to.

![ddd-data-integrity-patterns](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/ddd/ddd-data-integrity-patterns.png)

### Bounded Context

The main idea is to define the scope of a model, to draw up the boundaries of its context, then do the most possible to keep the model unified. Explicitly define the context within which a model applies. Explicitly set boundaries in terms of team organization, usage within specific parts of the application, and physical manifestations such as code bases and database schemas. A model should be small enough to be assigned to one team.

**A Bounded Context is not a Module. **A Bounded Context provides the logical frame inside of which the model evolves. Modules are used to organize the elements of a model, so Bounded Context encompasses the Module.

### Continuous integration

Continuous Integration is a necessary process within a Bounded Context. Another necessary requirement is to perform automated tests.

### Context map

A Context Map is a document which outlines the different Bounded Contexts and the relationships between them.

![ddd-context-map](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/ddd/ddd-context-map.png)

Each Bounded Context should have a name which should be part of the Ubiquitous Language. A common practice is to define the contexts, then create modules for each context, and use a naming convention to indicate the context each module belongs to.

### Shared Kernel

The purpose is to reduce duplication, but still keep two separate contexts.

![ddd-shared-kernel](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/ddd/ddd-shared-kernel.png)

### Customer-supplier

There are times when two subsystems have a special relationship: one depends a lot on the other. The contexts in which those two subsystems exist are different, and the processing result of one system is fed into the other. Establish a clear customer/supplier relationship between the two teams.

A Customer-Supplier relationship is viable when both teams are interested in the relationship. When two development teams have a Customer-Supplier relationship in which the supplier team has no motivation to provide for the customer team’s needs, the customer team is helpless.

The customer team has few options:

* **Conform** entirely to supplier team's model
* Protect itself by using an **Anticorruption Layer**
* **Separate Ways**. We need to closely evaluate the benefits of integration and use it only if there is real value in doing so. If we reach the conclusion that integration is more trouble than it is worth, then we should go the Separate Ways.

### Conformist

If the customer has to use the supplier team’s model, and if that is well done, it may be time for conformity. The customer team could adhere to the supplier team’s model, conforming entirely to it.
Compared to the Shared Kernel, but there is an important difference. The customer team cannot make changes to the kernel. They can only use it as part of their model, and they can build on the existing code provided.

### Anticorruption layer

From our model’s perspective, the Anticorruption Layer is a natural part of the model; it does not look like something foreign. It operates with concepts and actions familiar to our model. But the Anticorruption Layer talks to the external model using the external language not the client one. This layer works as a two way translator between two domains and languages.

How should we implement the Anticorruption Layer? A very good solution is to see the layer as a Service from the client model. The Service will be done as a Façade, along with a Adapter and translator.

![ddd-anticorruption-layer](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/ddd/ddd-anticorruption-layer.png)

Adapter is to convert the interface of a class to the one understood by the client. Translator is to do object and data conversion.

### Separate ways

Before going on Separate Ways we need to make sure that we won’t be coming back to an integrated system.

The Separate Ways pattern addresses the case when an enterprise application can be made up of several smaller applications which have little or nothing in common from a modeling perspective. From the user’s perspective this is one application, but from a modeling and design point of view it may done using separate models with distinct implementations.

### Open host service

When we try to integrate two subsystems, we usually create a translation layer between them. This layer acts as a buffer between the client subsystem and the external subsystem we want to integrate with. This layer can be a consistent one, depending on the complexity of relationships and how the external subsystem was designed. If the external subsystem turns out to be used not by one client subsystem, but by several ones, we need to create translation layers for all of them.

The solution is to see the external subsystem as a provider of services. If we can wrap a set of Services around it, then all the other subsystems will access these Services, and we won’t need any translation layer.

Define a protocol that gives access to your subsystem as a set of Services. Open the protocol so that all who need to integrate with you can use it.

### Distillation

A large domain has a large model even after we have refined it and created many abstractions. It can remain big even after many refactorings. In situations like this, it may be time for a distillation. The idea is to define a Core Domain which represents the essence of the domain. The byproducts of the distillation process will be Generic Subdomains which will comprise the other parts of the domain.

When working with a large model, we should try to separate the essential concepts from generic ones. Identify cohesive subdomains that are not the motivation for your project. Factor out generic models of these subdomains and place them in separate Modules. There are different ways to implement a Generic Subdomain:

* Off-the-shelf Solution
* Outsourcing
* Existing Model
* In-House Implementation

## Advices

Keep in mind some of the pitfalls of domain modeling:

1. Stay hands-on. Modelers need to code.
2. Focus on concrete scenarios. Abstract thinking has to be anchored in concrete cases.
3. Don't try to apply DDD to everything. Draw a context map and decide on where you will make a push for DDD and where you will not. And then don't worry about it outside those boundaries.
4. Experiment a lot and expect to make lots of mistakes. Modeling is a creative process.

