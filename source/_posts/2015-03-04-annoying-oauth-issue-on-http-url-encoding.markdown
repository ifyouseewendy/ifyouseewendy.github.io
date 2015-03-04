---
layout: post
title: "Annoying OAuth Issue on HTTP URL Encoding"
date: 2015-03-04 17:46:12 +0800
comments: true
categories: ['Ruby', 'Rails', 'Web']
---

I was developing and maintaining an OAuth service using `pelle/oauth-plugin` gem. Other than the standard token exchange process, there is a need to authenticate by signature based on user's passed in parameters. As custom parameters can include custom charactors, here comes the space encoding issue.

+ Why the service approves my test script by passing `name=wendi` but refuses `name=Di Wen` ?
+ Why the `CGI.escape('Di Wen')` outputs `"Di+Wen"`, while `URI.escape('Di Wen')` outpus `Di%20Wen` ?

This is definitely an annoying issue. I've run into it sometime before, but today I need to make a clear mind.

**What's the HTTP standard way to encode space in URL?**

`%20`, according to the [HTML URL Encoding Reference](http://www.w3schools.com/tags/ref_urlencode.asp) by W3schools.

**Why the hell some libary encode space to `+`?**

Because of the `application/x-www-form-urlencoded` *MIME* type.

Refered to Wikipedia, [Percent Encoding](http://en.wikipedia.org/wiki/Percent-encoding#The_application.2Fx-www-form-urlencoded_type)

> The encoding used by default is based on a very early version of the general URI percent-encoding rules, with a number of modifications such as newline normalization and replacing spaces with "+" instead of "%20". The Internet media type of data encoded this way is application/x-www-form-urlencoded, and it is currently defined (still in a very outdated manner) in the HTML and XForms specifications.

And [Anomie](http://stackoverflow.com/users/634419/anomie) has a summary [answer](http://stackoverflow.com/a/5433216/1331774),

> The query string format is actually a different but related encoding, application/x-www-form-urlencoded, defined in RFC 1866 along with HTML 2.0. It was based on RFC 1738, but specified that spaces (not all whitespace, just the character with ASCII code 0x20) are replaced by '+' and that line breaks are to be encoded as CRLF (i.e. %0D%0A). The former is likely because that saves 2 bytes for a very common character in form submissions at the expense of using an extra 2 bytes for a much less common character, and the latter is to avoid problems when transferring between systems using different end-of-line codings. Non-ASCII characters were left unconsidered.

> UTF-8 coding in URIs came over a decade later, in RFC 3986, although individual protocols may have specified this or another encoding of non-ASCII characters earlier. To maintain backwards compatibility, all UTF-8 octets must be percent-encoded.

**What's the Rule of Thumb in Ruby world?**

[Ernest](http://stackoverflow.com/users/409475/ernest) makes a [specification](http://stackoverflow.com/questions/2824126/whats-the-difference-between-uri-escape-and-cgi-escape) about the escape methods over `URI`, `CGI`, and `Addressable`, and gives a conclusion

> + Do not use URI.escape or similar
> + Use CGI::escape if you only need form escape
> + If you need to work with URIs, use Addressable, it offers url encoding, form encoding and normalizes URLs.

**So, what's the solution to my question?**

The `pelle/oauth-plugin` gem failed my test script with `CGI` by

```ruby
pry(main)> CGI.escape 'Di Wen'
=> "Di+Wen"

# expecting "Di%2BWen"
```

Also failed `URI` and `Addressable` by

```ruby
pry(main)> URI.escape 'Di@Wen'
=> "Di@Wen"

pry(main)> Addressable::URI.parse("Di@Wen").normalize
=> #<Addressable::URI:0x81f58abc URI:Di@Wen>

# expecting "Di%40Wen"
```

After some digging into the gem, I've found its encoding method

```ruby
# Escape +value+ by URL encoding all non-reserved character.
#
# See Also: {OAuth core spec version 1.0, section 5.1}[http://oauth.net/core/1.0#rfc.section.5.1]
def escape(value)
  URI::escape(value.to_s, OAuth::RESERVED_CHARACTERS)
rescue ArgumentError
  URI::escape(value.to_s.force_encoding(Encoding::UTF_8), OAuth::RESERVED_CHARACTERS)
end


OAuth::RESERVED_CHARACTERS # => /[^a-zA-Z0-9\-\.\_\~]/
```

Following the comment, comes along the OAuth standard specification about [Parameter Encoding](http://oauth.net/core/1.0/#rfc.section.5.1)

> All parameter names and values are escaped using the [RFC3986] percent-encoding (%xx) mechanism. Characters not in the unreserved character set ([RFC3986] section 2.3) MUST be encoded. Characters in the unreserved character set MUST NOT be encoded. Hexadecimal characters in encodings MUST be upper case. Text names and values MUST be encoded as UTF-8 octets before percent-encoding them per [RFC3629].

>     unreserved = ALPHA, DIGIT, '-', '.', '_', '~'

Under the standard spec and refering to the gem's implementation, I've finally solved my stupid issue.



