---
layout: post
title: "[Reviews] Website Performance Optimization"
date: 2015-12-19 15:21:58 +0800
comments: true
categories: ['Web']
---

After several years working, I've learned many lessons like how to write HTML, how to minify and compress CSS and JavaScript files, where to put the CSS and JavaScript reference, how to do the cache control and etc.. But all the knowledge are scattered, and the real mechanism, like the HTML rendering, seems like a mysterious process to me. So I spent some time digging and learning, the things finally got clear.

***For short, what's the basic idea of web performance optimization?***

- Minimize the number of critical resources, like optimizing CSS (inline, or specify media query), and optimizing JavaScript (defer execution).
- Minimize the number of critical bytes, like optimizing content efficiency, minify, compress and HTTP cache control.
- Minimize the critical path length, like preload scanner.

**Materials**

+ [Udacity - Website Performance Optimization](https://www.udacity.com/course/website-performance-optimization--ud884)
+ [Google Developer - Critical Rendering Path](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/?hl=en)

**TOC**

* TOC
{:toc}

## Optimizing content efficiency

- Apply content-specific optimizations first: CSS, JS, and HTML minifiers.
- Apply GZIP to compress the minified output.

### Eliminating unnecessary downloads

The fastest and best optimized resource is a resource not sent.

- Inventory all own and third party assets on your pages
- Measure the performance of each asset: its value and its technical performance
- Determine if the resources are providing sufficient value

For best results you should periodically inventory and revisit these questions for each and every asset on your pages.

### Optimizing encoding and transfer size of text-based assets

**Data Compression**

Compression is the process of encoding information using fewer bits. Eliminating unnecessary data always yields the best results.

**Minification: preprocessing & context-specific optimizations**

- Remove comments
- Remove inefficient ways of defining CSS rules
- Strip out all the whitespaces (tabs and spaces).

We can keep the original page as our “development version” and then apply the steps above whenever we are ready to release the page on our website.

> Case in point, the uncompressed development version of the JQuery library is now approaching ~300KB. The same library, but minified (removed comments, etc.) is about 3x smaller: ~100KB.

**Text compression with GZIP**

GZIP is a generic compressor that can be applied to any stream of bytes. In practice, GZIP performs best on text-based content, often achieving compression rates of as high as 70-90% for larger files.

All modern browsers support and automatically negotiate GZIP compression for all HTTP requests.

A quick and simple way to see GZIP in action is to open Chrome DevTools and inspect the “Size / Content” column in the Network panel: “Size” indicates the transfer size of the asset, and “Content” the uncompressed size of the asset.

+ [HTTP Compression Test](http://www.whatsmyip.org/http-compression-test/)
+ [Nginx HTTP server boilerplate configs](https://github.com/h5bp/server-configs-nginx)

### Image optimization

- Prefer vector formats: vector images are resolution and scale independent, which makes them a perfect fit for the multi-device and high-resolution world.
- Minify and compress SVG assets: XML markup produced by most drawing applications often contains unnecessary metadata which can be removed; ensure that your servers are configured to apply GZIP compression for SVG assets.
- Pick best raster image format: determine your functional requirements and select the one that suits each particular asset.
- Experiment with optimal quality settings for raster formats: don’t be afraid to dial down the “quality” settings, the results are often very good and byte savings are significant.
- Remove unnecessary image metadata: many raster images contain unnecessary metadata about the asset: geo information, camera information, and so on. Use appropriate tools to strip this data.
- Serve scaled images: resize images on the server and ensure that the “display” size is as close as possible to the “natural” size of the image. Pay close to attention to large images in particular, as they account for largest overhead when resized!
- Automate, automate, automate: invest into automated tools and infrastructure that will ensure that all of your image assets are always optimized.

**Eliminating and replacing images**

- Eliminate unnecessary image resources
- Leverage CSS3 effects where possible
- Use web fonts instead of encoding text in images

**Vector vs. Raster images**

- Vector images are ideal for images that consist of geometric shapes
- Vector images are zoom and resolution-independent
- Raster images should be used for complex scenes with lots of irregular shapes and details

![vector_vs_raster_image.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/vector_vs_raster_image.png)

- Vector graphics use lines, points, and polygons to represent an image.
- Raster graphics represent an image by encoding the individual values of each pixel within a rectangular grid.

**Implications of high-resolution screens**

- High resolution screens have multiple device pixels per CSS pixel
- High resolution images require significantly higher number of pixels and bytes
- Image optimization techniques are the same regardless of resolution

High resolution screens also require high-resolution images: prefer vector images whenever possible as they are resolution independent and always deliver sharp results, and if a raster image is required, deliver and optimize multiple variants of each imagewith the help of srcset and picture.

**Optimizing vector images**

- SVG is an XML-based image format
- SVG files should be minified to reduce their size
- SVG files should be compressed with GZIP

All modern browsers support Scalable Vector Graphics (SVG), which is an XML-based image format for two-dimensional graphics: we can embed the SVG markup directly on the page, or as an external resource.

**Optimizing raster images**

Image optimization boils down to two criteria: optimizing the number of bytes used to encode each image pixel, and optimizing the total number of pixels: the filesize of the image is simply the total number of pixels times the number of bytes used to encode each pixel.

- A raster image is a grid of pixels
- Each pixel encodes color and transparency information
- Image compressors use a variety of techniques to reduce the number of required bits per pixel to reduce file size of the image

A raster image is simply a 2-dimensional grid of individual “pixels” - e.g. a 100x100 pixel image is a sequence of 10,000 pixels. In turn, each pixel stores the “RGBA” values: (R) red channel, (G) green channel, (B) blue channel, and (A) alpha (transparency) channel.

Internally, the browser allocates 256 values (shades) for each channel, which translates to 8 bits per channel (2 ^ 8 = 256), and 4 bytes per pixel (4 channels x 8 bits = 32 bits = 4 bytes).

So, a 100 x 100px image, is 39 KB size without losing any information.


> 100 x 100px image is composed of 10,000 pixels  
> 10,000 pixels x 4 bytes = 40,000 bytes  
> 40,000 bytes / 1024 = 39 KB  

**Lossless vs lossy image compression**

- Due to how our eyes work, images are great candidates for lossy compression
- Image optimization is a function of lossy and lossless compression
- Differences in image formats are due to the difference in how and which lossy and lossless algorithms are used to optimize the image
- There is no single best format or "quality setting" for all images: each combination of particular compressor and image contents produce a unique output

In fact, the difference between various image formats, such as GIF, PNG, JPEG, and others, is in the combination of the specific algorithms they use (or omit) when applying the lossy and lossless steps.

***What is the “optimal” configuration of lossy and lossless optimization?***

The answer depends on the image contents and your own criteria such as the tradeoff between filesize and artifacts introduced by lossy compression.

**Selecting the right image format**

- Start by selecting the right universal format: GIF, PNG, JPEG
- Experiment and select the best settings for each format: quality, palette size, etc.
- Consider adding WebP and JPEG XR assets for modern clients

![select_the_right_image.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/select_the_right_image.png)

- **GIF** limits the color palette to at most 256 colors, which makes it a poor choice for most images.
- **PNG** does not apply any lossy compression algorithms beyond the choice of the size of the color palette. As a result, it will produce the highest quality image, but at a cost of significantly higher filesize than other formats. Use judiciously.
- If the image asset contains imagery composed of geometric shapes, consider converting it to a vector (**SVG**) format!
- If the image asset contains text, stop and reconsider. Text in images is not selectable, searchable, or “zoomable”. If you need to convey a custom look (for branding or other reasons), use a **web font** instead.
- **JPEG** uses a combination of lossy and lossless optimization to reduce filesize of the image asset.
- Also consider adding an additional variant encoded in **WebP** and **JPEG XR**. WebP delivers a 30% filesize decrease over a comparable JPEG image.

**Tools and parameter tuning**

- [gifsicle](http://www.lcdf.org/gifsicle/), create and optimize GIF images
- [jpegqran](http://jpegclub.org/jpegtran/), optimize JPEG images
- [optpng](http://optipng.sourceforge.net/), lossless PNG optimization
- [pngquant](http://pngquant.org/), lossy PNG optimization

**Delivering scaled image assets**

One of the simplest and most effective image optimization techniques is to ensure that we are not shipping any more pixels than needed to display the asset at its intended size in the browser. Most pages fail this test for many of their image assets: typically, they ship larger assets and rely on the browser to rescale them - which also consumes extra CPU resources - and display them at a lower resolution.

You should ensure that the number of unnecessary pixels is minimal, and that your large assets in particular are delivered as close as possible to their display size.

### Web font optimization

Use of webfonts does not need to delay page rendering or have negative impact on other performance metrics. Well optimized use of fonts can deliver a much better overall user experience:

- Audit and monitor your font use: do not use too many fonts on your pages, and for each font, minimize the number of used variants. This will assist in delivering a more consistent and a faster experience for your users.
- Subset your font resources: many fonts can be subset, or split into multiple unicode-ranges to deliver just the glyphs required by a particular page - this reduces the filesize and improves download speed of the resource. However, when defining the subsets be careful to optimize for font re-use - e.g. you don’t want to download a different but overlapping set of characters on each page. A good practice is to subset based on script - e.g. Latin, Cyrillic, and so on.
- Deliver optimized font formats to each browser: each font should be provided in WOFF2, WOFF, EOT, and TTF formats. Make sure to apply GZIP compression to EOT and TTF formats, as they are not compressed by default.
- Specify revalidation and optimal caching policies: fonts are static resources that are infrequently updated. Make sure that your servers provide a long-lived max-age timestamp, and a revalidation token, to allow for efficient font re-use between different pages.
- Use Font Loading API to optimize the Critical Rendering Path: default lazyloading behavior may result in delayed text rendering. Font Loading API allows us to override this behavior for particular fonts, and to specify custom rendering and timeout strategies for different content on the page. For older browsers that do not support the API, you can use the webfontloader JavaScript library or use the CSS inlining strategy.

**Anatomy of a webfont**

A webfont is a collection of glyphs, and each glyph is a vector shape that describes a letter or symbol. As a result, the size of a particular font file is determined by two simple variables:

- the complexity of the vector paths of each glyph
- the number of glyphs in a particular font

Today there are four font container formats in use on the web: EOT, TTF, WOFF, and WOFF2.

![fonts.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/fonts.png)

Consider using [Zopfli compression](http://en.wikipedia.org/wiki/Zopfli) for EOT, TTF, and WOFF formats. Zopfli is a zlib compatible compressor that delivers ~5% filesize reduction over gzip.

**Defining font family with @font-face**

format selection

A “full” webfont that includes all stylistic variants, which we may not need, plus all the glyphs, which may go unused, can easily result in a multi-megabyte download. To address this, the @font-face CSS rule is specifically designed to allow us to split the font family into a collection of resources: unicode subsets, distinct style variants, and so on.

The @font-face CSS at-rule allows us to define the location of a particular font resource, its style characteristics, and the Unicode codepoints for which it should be used. A combination of such @font-face declarations can be used to construct a “font family”, which the browser will use to evaluate which font resources need to be downloaded and applied to the current page.

Each @font-face declaration provides the name of the font family, which acts as a logical group of multiple declarations, font properties such as style, weight, and stretch, and the src descriptor that specifies a prioritized list of locations for the font resource.

![font_face_1.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/font_face_1.png)

The browser figures out which resources are required and will select the optimal format on our behalf.

Unicode-range subsetting

In addition to font properties such as style, weight, and stretch, the @font-face rule allows us to define a set of Unicode codepoints supported by each resource. This enables us to split a large Unicode font into smaller subsets (e.g. Latin, Cyrillic, Greek subsets) and only download the glyphs required to render the text on a particular page.

The use of unicode range subsets, and separate files for each stylistic variant of the font allows us to define a composite font family that is both faster and more efficient to download - the visitor will only download the variants and subsets it needs, and they are not forced to download subsets that they may never see or use on the page.

![font_face_2.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/font_face_2.png)

Unicode-range subsetting is particularly important for Asian languages, where the number of glyphs is much larger than in western languages and a typical 'full' font is often measured in megabytes, instead of tens of kilobytes!

There is one small gotcha with unicode-range: [not all browser support it](http://caniuse.com/#feat=font-unicode-range). We have to fallback to providing a single font resource that contains all necessary subsets, and hide the rest from the browser. We can use the open-source [pyftsubset](https://github.com/behdad/fonttools/blob/master/Lib/fontTools/subset.py#L16) tool to subset and optimize your fonts.

Font selection and synthesis

Each font family is composed of multiple stylistic variants (regular, bold, italic) and multiple weights for each style, each of which, in turn, may contain very different glyph shapes - e.g. different spacing, sizing, or a different shape altogether.

![font_size.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/font_size.png)

All other in-between variants (indicated in gray) are automatically mapped to the closest variant by the browser. Similar logic applies to italic variants. it’s a good idea to keep the number of variants small!

What happens if one of our CSS rules specifies a different font weight, or sets the font-style property to italic?

- If an exact font match is not available the browser will substitute the closest match.
- If no stylistic match is found (e.g. we did not declare any italic variants in example above), then the browser will **synthesize** its own font variant.

For best consistency and visual results you should not rely on font synthesis. Instead, minimize the number of used font variants and specify their locations, such that the browser can download them when they are used on the page.

**Optimizing loading and rendering**

Font requests are delayed until the render tree is constructed, which can result in delayed text rendering.

Lazy loading of fonts carries an important hidden implication that may delay text rendering: the browser must construct the render tree, which is dependent on the DOM and CSSOM trees, before it will know which font resources it will need to render the text. As a result, font requests are delayed well after other critical resources, and the browser may be blocked from rendering text until the resource is fetched.

![font_rendering.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/font_rendering.png)

Font requests are dispatched once render tree indicates which font variants are needed to render the specified text on the page

The “race” between the first paint of page content, which can be done shortly after the render tree is built, and the request for the font resource is what creates the “blank text problem” where the browser may render page layout but omits any text.

- Safari hold text rendering until the font download is complete.
- Chrome and Firefox hold font rendering for up to 3 seconds, after which they use a fallback font, and once the font download has finished they re-render the text once more with the downloaded font.
- IE immediately renders with the fallback font if the request font is not yet available, and re-renders it once the font download is complete.

Optimizing font rendering with the Font Loading API

Font Loading API provides a scripting interface to define and manipulate CSS font faces, track their download progress, and override their default lazyload behavior.

If we’re certain that a particular font variant will be required, we can define it and tell the browser to initiate an immediate fetch of the font resource:

![font_loading_api.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/font_loading_api.png)

- We can hold all text rendering until the font is available.
- We can implement a custom timeout for each font.
- We can use the fallback font to unblock rendering and inject a new style that uses desired font once the font is available.

Optimizing font rendering with inlining

To inline the font contents into a CSS stylesheet:

- CSS stylesheets with matching media queries are automatically downloaded by the browser with high priority as they are required to construct the CSSOM.
- Inlining the font data into CSS stylesheet forces the browser to download the font with high priority and without waiting for the render tree - i.e. this acts as a manual override to the default lazyload behavior.

Optimizing font reuse with HTTP Caching

Font resources are, typically, static resources that don’t see frequent updates. As a result, they are ideally suited for a long max-age expiry.

There is no need to store fonts in localStorage or via other mechanisms - each of those has their set of performance gotchas. The browser’s HTTP cache, in combination with Font Loading API or the webfontloader library, provides the best and most robust mechanism to deliver font resources to the browser.

### HTTP caching

The combination of ETag, Cache-Control, and unique URLs allows us to deliver the best of all worlds: long-lived expiry times, control over where the response can be cached, and on-demand updates.

- Use consistent URLs: if you serve the same content on different URLs, then that content will be fetched and stored multiple times. Tip: note that URLs are case sensitive!
- Ensure the server provides a validation token (ETag): validation tokens eliminate the need to transfer the same bytes when a resource has not changed on the server.
- Identify which resources can be cached by intermediaries: those with responses that are identical for all users are great candidates to be cached by a CDN and other intermediaries.
- Determine the optimal cache lifetime for each resource: different resources may have different freshness requirements. Audit and determine the appropriate max-age for each one.
- Determine the best cache hierarchy for your site: the combination of resource URLs with content fingerprints, and short or no-cache lifetimes for HTML documents allows you to control how quickly updates are picked up by the client.
- Minimize churn: some resources are updated more frequently than others. If there is a particular part of resource (e.g. JavaScript function, or set of CSS styles) that are often updated, consider delivering that code as a separate file. Doing so allows the remainder of the content (e.g. library code that does not change very often), to be fetched from cache and minimizes the amount of downloaded content whenever an update is fetched.

![http_caching.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/http_caching.png)

**Validating cached responses with ETags**

![http_caching_with_ETags.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/http_caching_with_ETags.png)

- Validation token is communicated by the server via the ETag HTTP header
- Validation token enables efficient resource update checks: no data transfer if the resource has not changed.

**Cache-Control**

- Each resource can define its caching policy via Cache-Control HTTP header
- Cache-Control directives control who can cache the response, under which conditions, and for how long

Cache-Control header was defined as part of the HTTP/1.1 specification and supersedes previous headers (e.g. Expires) used to define response caching policies. All modern browsers support Cache-Control, hence that is all we will need.

“no-cache” indicates that the returned response cannot be used to satisfy a subsequent request to the same URL without first checking with the server if the response has changed. As a result, if a proper validation token (ETag) is present, no-cache will incur a roundtrip to validate the cached response, but can eliminate the download if the resource has not changed.

“no-store” is much simpler, as it simply disallows the browser and all intermediate caches to store any version of the returned response - e.g. one containing private personal or banking data.

If the response is marked as “public” then it can be cached, even if it has HTTP authentication associated with it, and even when the response status code isn’t normally cacheable. Most of the time, “public” isn’t necessary, because explicit caching information (like “max-age”) indicates that the response is cacheable anyway.

“private” responses can be cached by the browser but are typically intended for a single user and hence are not allowed to be cached by any intermediate cache - e.g. an HTML page with private user information can be cached by that user’s browser, but not by a CDN.

“max-age” specifies the maximum time in seconds that the fetched response is allowed to be reused for from the time of the request.

**Defining optimal Cache-Control policy**

![http_cache_control_policy.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/http_cache_control_policy.png)

**Invalidating and updating cached responses**

What if we want to update or invalidate a cached response? For example, let’s say we’ve told our visitors to cache a CSS stylesheet for up to 24 hours (max-age=86400), but our designer has just committed an update that we would like to make available to all users. How do we notify all the visitors with what is now a “stale” cached copy of our CSS to update their caches? It’s a trick question - we can’t, at least not without changing the URL of the resource.

Simple, we can change the URL of the resource and force the user to download the new response whenever its content changes. Typically, this is done by embedding a fingerprint of the file, or a version number, in its filename - e.g. style.x234dff.css.

![http_update_cache_by_fingerprints.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/http_update_cache_by_fingerprints.png)

The ability to define per-resource caching policies allows us to define “cache hierarchies” that allow us to control not only how long each is cached for, but also how quickly new versions are seen by visitor.

The HTML is marked with “no-cache”, which means that the browser will always revalidate the document on each request and fetch the latest version if the contents change. Also, within the HTML markup we embed fingerprints in the URLs for CSS and JavaScript assets: if the contents of those files change, then the HTML of the page will change as well and new copy of the HTML response will be downloaded.

## Critical Rendering Path

### Critical Rendering Path

Optimizing for performance is all about understanding what happens in these intermediate steps between receiving the HTML, CSS, and JavaScript bytes and the required processing to turn them into rendered pixels - that’s the critical rendering path.

By optimizing the critical rendering path we can significantly improve the time to first render of our pages. Further, understanding the critical rendering path will also serve as a foundation for building well performing interactive applications. It turns out, the process for processing interactive updates is the same, just done in a continuous loop and ideally at 60 frames per second!

- Process HTML markup and build the **DOM tree**.
- Process CSS markup and build the **CSSOM tree**.
- Combine the DOM and CSSOM into a **render tree**.
- Run **layout** on the render tree to compute geometry of each node.
- **Paint** the individual nodes to the screen.

Optimizing the critical rendering path is the process of minimizing the total amount of time spent in steps 1 through 5 in the above sequence. Doing so enables us to render content to the screen as soon as possible and also to reduces the amount of time between screen updates after the initial render.

**DOM**

The Document Object Model (DOM) is an application programming interface (API) for valid HTML and well-formed XML documents. It defines the logical structure of documents and the way a document is accessed and manipulated.

from [http://www.w3.org/TR/DOM-Level-2-Core/introduction.html](http://www.w3.org/TR/DOM-Level-2-Core/introduction.html)

![dom_construction.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/dom_construction.png)

Every time the browser has to process HTML markup it has to step through all of the steps above: convert bytes to characters, identify tokens, convert tokens to nodes, and build the DOM tree.


**CSSOM**

The DOM tree captures the properties and relationships of the document markup, but it does not tell us anything about how the element should look when rendered. That’s the responsibility of the CSSOM.

The CSS bytes are converted into characters, then to tokens and nodes, and finally are linked into a tree structure known as the “CSS Object Model”, or CSSOM for short:

![cssom_construction.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/cssom_construction.png)

***Is this the complete CSSOM?***

No. Note that the above tree is not the complete CSSOM tree and only shows the styles we decided to
override in our stylesheet. Every browser provides a default set of styles also known as “user agent styles” – that’s what we see when we don’t provide any of our own – and our styles simply override these defaults.

***Why does the CSSOM have a tree structure?***

When computing the final set of styles for any object on the page, the browser starts with the most general rule applicable to that node (e.g. if it is a child of body element, then all body styles apply) and then recursively refines the computed styles by applying more specific rules - i.e. the rules “cascade down”.

***Curious to know how long the CSS processing took?***

Record a timeline in DevTools and look for “Recalculate Style” event: unlike DOM parsing, the timeline doesn’t show a separate “Parse CSS” entry, and instead captures parsing and CSSOM tree construction, plus the recursive calculation of computed styles under this one event.

![css_render_timeline.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/css_render_timeline.png)

***Why we say that CSS is render blocking?***

Review the rendering process, DOM and CSSOM construct the render tree, then calculate layout, and paint. So CSS is a rendering blocking resource which blocks on rendering process.

***Why do browsers match CSS selectors from right to left?***

It sounds like that it is done this way to avoid having to look at all the children of parent (which could be many) rather than all the parents of a child which must be one. Even if the DOM is deep it would only look at one node per level rather than multiple in the RTL matching. 

from [Why do browsers match CSS selectors from right to left?](http://stackoverflow.com/questions/5797014/why-do-browsers-match-css-selectors-from-right-to-left)

**Render Blocking CSS**

- Get it down to the client as soon and as quickly as possible to optimize the time to first render
- Use media types and queries to unblock rendering

By default CSS is treated as a render blocking resource, which means that the browser will hold rendering of any processed content until the CSSOM is constructed. Note that “render blocking” only refers to whether the browser will have to hold the initial rendering of the page on that resource. In either case, the CSS asset is still downloaded by the browser, albeit with a lower priority for non-blocking resources (like images).

***How to make it non-blocking?***

By using media queries, our presentation can be tailored to specific use cases such as display vs. print, and also to dynamic conditions such as changes in screen orientation, resize events, and more. When declaring your stylesheet assets, pay close attention to the media type and queries, as they will have big performance impact on the critical rendering path!

```html
<link href="style.css"    rel="stylesheet">
<link href="style.css"    rel="stylesheet" media="all">
<link href="portrait.css" rel="stylesheet" media="orientation:portrait">
<link href="print.css"    rel="stylesheet" media="print">
```

The third declaration has a dynamic media query which will be evaluated when the page is being loaded. Depending on the orientation of the device when the page is being loaded, portrait.css may or may not be render blocking.

The last declaration is only applied when the page is being printed, hence it is not render blocking when the page is first loaded in the browser.

**Render Tree**

The CSSOM and DOM trees are combined into a render tree, which is then used to

- compute the layout of each visible element
- serves as an input to the paint process which renders the pixels to screen

Render tree contains only the nodes required to render the page.

![render_tree_construction.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/render_tree_construction.png)

**Layout Stage**

The layout stage calculates the exact position and size within the viewport of the device.

The output of the layout process is a “box model” which precisely captures the exact position and size of each element within the viewport: all of the relative measures are converted to absolute pixels positions on the screen, and so on.

![layout_timeline.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/layout_timeline.png)

**Painting Stage**

Now that we know which nodes are visible, their computed styles, and geometry, we can finally pass this information to our final stage which will convert each node in the render tree to actual pixels on the screen - this step is often referred to as “painting” or “rasterizing.”

***Can painting happen in the meantime dom is parsing?***

This is a gradual process: browsers won't wait until all HTML is parsed. Parts of the content will be parsed and displayed, while the process continues with the rest of the contents that keeps coming from the network.

from [pesla's answer](http://stackoverflow.com/questions/34269416/when-does-parsing-html-dom-tree-happen) in SO
 
**Image**

Not all resources are critical to deliver the fast first paint. Images do not block the initial render of the page - although, of course, we should try to make sure that we get the images painted as soon as possible also.

Image don’t block on domContentLoaded, but blocks “load” event.

**Javascript**

- The location of the script in the document is significant.
- JavaScript can query and modify DOM and CSSOM.
- JavaScript execution blocks on CSSOM.
- JavaScript blocks DOM construction unless explicitly declared as async or defer

The location of the script in the document is significant. The script is executed at the exact point where it is inserted in the document. When the HTML parser encounters a script tag, it pauses its process of constructing the DOM and yields control over to the JavaScript engine; once the JavaScript engine has finished running, the browser then picks up from where it left off and resumes the DOM construction.

***Why we say that JavaScript is parser blocking?***

It means JavaScript will block the DOM tree parsing process. And also, as it has dependency on CSSOM, so the total process is, DOM parsing blocks on JavaScript execution, and JavaScript execution blocks on CSSOM construction. That’s why we put the CSS link ref in head, and put the JavaScript link just before the close body tag.

***What if the browser hasn’t finished downloading and building the CSSOM when we want to run our script?***

The browser will delay script execution until it has finished downloading and constructing the CSSOM, and while we’re waiting, the DOM construction is also blocked!

***What’s the difference between inline script and external script?***

Javascript is the same as the CSS and images, being a resource of the HTML, which all need a process of downloading and executing.

The inline script has no extra downloading time, compared to external script, but has the same execution time.

***Where is the best place to put JavaScript?***

Library may place in the head, and application logic js is better placed right before closing body tag.

You don't improve the total parsing time by including `<script>` at the end of the document. It does enhance the user experience, as the process of parsing and painting isn't interrupted by `<script>` that need to be executed.

**Navigation Timing API** (Measuring the Critical Rendering Path)

![navigation_timing_api.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/navigation_timing_api.png)

- *domLoading*: this is the starting timestamp of the entire process, the browser is about to start parsing the first received bytes of the HTML document.
- *domInteractive*: marks when DOM is ready.
- *domContentLoaded*: marks the point when both the DOM is ready and there are no stylesheets that are blocking JavaScript execution - meaning we can now (potentially) construct the render tree. Typically marks when both the DOM and CSSOM are ready. The sooner the domContentLoaded event fires, the sooner other application logic can begin executing. jQuery's $(document).ready() is hooked on domContentLoaded.
- *loadEvent*: as a final step in every page load the browser fires an onload event which can trigger additional application logic.

### Analysing Critical Rendering Path Performance

- **Critical Resource**: resource that may block initial rendering of the page.
- **Critical Path Length**: number of roundtrips, or the total time required to fetch all of the critical resources.
- **Critical Bytes**: total amount of bytes required to get to first render of the page, which is the sum of the transfer filesizes of all critical resources. Our first example with a single HTML page contained a single critical resource (the HTML document), the critical path length was also equal to 1 network roundtrip (assuming file is small), and the total critical bytes was just the transfer size of the HTML document itself.

**Without Javascript and CSS**

![without_js_and_css_timeline.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/without_js_and_css_timeline.png)

![without_js_and_css_crp_diagram.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/without_js_and_css_crp_diagram.png)

- 1 critical resource
- 1 roundtrip
- 5 KB of critical bytes

**With Only CSS**

![with_only_css_crp_diagram.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/with_only_css_crp_diagram.png)

- 2 critical resources
- 2 or more roundtrips for the minimum critical path length
- 9 KB of critical bytes

**With JavaScript and CSS**

![with_js_and_css_timeline.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/with_js_and_css_timeline.png)

As Javascript blocks the DOM construction, also depends on the CSSOM, so the domContentLoaded event is blocked until the CSS file is downloaded and parsed.

I’m confusing on the image for a long long time! Finally, when I’m making this note, I get things through. Watch closely to the blue and red line. Blue line fires when the CSSOM has been created. And then Javascript executes, image downloads over, there fires the red line.

Remember, what does domContentLoaded mean? Marks the point when both the DOM is ready and there are no stylesheets that are blocking JavaScript execution - meaning we can now (potentially) construct the render tree. Typically marks when both the DOM and CSSOM are ready.

![with_js_and_css_crp_diagram.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/with_js_and_css_crp_diagram.png)

- 3 critical resources
- 2 or more roundtrips for the minimum critical path length
- 11 KB of critical bytes

**With JavaScript (inline) and CSS**

![with_js_inline_and_css_timeline.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/with_js_inline_and_css_timeline.png)

Same time as the external Javascript, only without downloading process.

**With Javascript (inline) and CSS (inline)**

![with_js_inline_and_css_inline_timeline.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/with_js_inline_and_css_inline_timeline.png)

**With JavaScript (async) and CSS**

![with_js_async_and_css_timeline.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/with_js_async_and_css_timeline.png)

Much better! The domContentLoaded event fires shortly after the HTML is parsed: the browser knows not to block on JavaScript and since there are no other parser blocking scripts the CSSOM construction can also proceed in parallel.

![with_js_async_and_css_crp_diagram.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/with_js_async_and_css_crp_diagram.png)

- 2 critical resources (HTML and CSS)
- 2 or more roundtrips for the minimum critical path length
- 9 KB of critical bytes

**With Javascript (async) and CSS (non-blocking)**

![with_js_async_and_css_non_block_crp_diagram.png.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/with_js_async_and_css_non_block_crp_diagram.png.png)

- 1 critical resource
- 1 or more roundtrips for the minimum critical path length
- 5 KB of critical bytes

Demo and CRP diagram

Code from [https://github.com/igrigorik/udacity-webperf/blob/master/assets/ex2-diagram.html](https://github.com/igrigorik/udacity-webperf/blob/master/assets/ex2-diagram.html)

```html
<html>
  <head>
    <meta name="viewport" content="width=device-width">
    <link href="style.css" rel="stylesheet">
    <link href="print.css" rel="stylesheet" media="print">
  </head>
  <body>
    <p>
      Hello <span>web performance</span> students!
    </p>
    <div><img src="awesome-photo.jpg"></div>
    <script src="app.js"></script>
    <script src="analytics.js" async></script>
  </body>
</html>
```

CRP diagram by [connie_273453529](https://discussions.udacity.com/t/quiz-crp-diagrams/16162/11?u=ifyouseewendy)

![demo_crp_diagram_by_connie.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/demo_crp_diagram_by_connie.png)

- 3 critical resources
- total (HTML file + style.css + app.js) critical bytes
- 2 roundtrip for the minimum critical path length

### Optimizing the critical rendering path

**Basic idea**

- Minimize the number of critical resources.
- Minimize the number of critical bytes.
- Minimize the critical path length.

To reduce the number of bytes we can reduce the number of resources (eliminate them or make them non-critical), and also ensure that we minimize the transfer size by compressing and optimizing each resource.

The fewer of these resources there are on the page, the less work the browser has to do to get content on the screen, and the less contention there is for CPU and other resources.

The critical path length is a function of the dependency graph between all the critical resources required by the page and their bytesize: some resource downloads can only be initiated once a previous resource has been processed, and the larger the resource the more roundtrips it will take us to download it.

The general sequence of steps to optimize the critical rendering path is:

- Analyze and characterize your critical path: number of resources, bytes, length.
- Minimize number of critical resources: eliminate them, defer their download, mark them as async, etc.
- Optimize the order in which the remaining critical resources are loaded: you want to download all critical assets as early as possible to shorten the critical path length.
- Optimize the number of critical bytes to reduce the download time (number of roundtrips).

The cardinal rule of web performance is, measure first, then optimize.

**Optimize JavaScript Use**

- Prefer async JavaScript resources
- Defer parsing JavaScript
- Avoid synchronous server calls
- Avoid long running JavaScript

Any initialization logic and functionality that is non-essential for the first render should be deferred until later. If a long initialization sequence needs to be run, consider splitting it into several stages to allow the browser to process other events in between.

async vs. defer

from [async vs defer attributes](http://www.growingwiththeweb.com/2014/02/async-vs-defer-attributes.html)

![async_vs_defer.png](https://github.com/ifyouseewendy/ifyouseewendy.github.io/raw/source/image-repo/web-performance-optimization/async_vs_defer.png)

**Optimize CSS Use**

- Put CSS in the document head
- Avoid CSS imports. CSS import (@import) directive enables one stylesheet to import rules from another stylesheet file. However, these directives should be avoided because they introduce additional roundtrips into the critical path: the imported CSS resources are discovered only after the CSS stylesheet with the @import rule itself has been received and parsed.
- Inline render-blocking CSS

**The Preload Scanner**

from [How the Browser Pre-loader Makes Pages Load Faster](http://andydavies.me/blog/2013/10/22/how-the-browser-pre-loader-makes-pages-load-faster/)

Internet Explorer, WebKit and Mozilla all implemented pre-loaders in 2008 as a way of overcoming the low network utilisation while waiting for scripts to download and execute.

When the browser is blocked on a script, a second lightweight parser scans the rest of the markup looking for other resources e.g. stylesheets, scripts, images etc., that also need to be retrieved.

The pre-loader then starts retrieving these resources in the background with the aim that by the time the main HTML parser reaches them they may have already been downloaded and so reduce blocking later in the page.

**Others**

+ [Flushing the Document Early](http://www.stevesouders.com/blog/2009/05/18/flushing-the-document-early/)
+ [Chunk Scatter, a fantastic tool for visualizing chunked HTTP responses](http://blog.cowchimp.com/chunk-scatter-http-chunked-response-analysis-tool/)
+ [Performance profiling with the Timeline](https://developer.chrome.com/devtools/docs/timeline)
+ [Record a Chrome dev tools timeline by webpagetest](http://www.webpagetest.org/forums/showthread.php?tid=10990)

***Why should I profile the site on my phone?***

Chances are, you are developing your site on a fast laptop or a desktop machine. Mobile phones on the other hand are much more resource constrained: slower CPUs, less RAM and GPU memory, higher connection latencies, and so on. As a result, you should always try to profile and debug your site on mobile hardware to get a better and closer picture of how your users will experience your site on their handset.

## Browser Rendering Optimization

> TODO [https://www.udacity.com/course/browser-rendering-optimization--ud860](https://www.udacity.com/course/browser-rendering-optimization--ud860)


