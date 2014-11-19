---
layout: post
title: "Encoding and Encryption in Ruby"
date: 2014-11-20 00:53:44 +0800
comments: true
categories: ['Ruby']
---

## Encode and decode

Use Base64

+ Unreadable.
+ Translates any binary data into purely printable characters. Eg. in HTTP transmission(MIME).
+ Use `a-zA-Z0-9+/`. When encode URL, use `a-zA-Z0-9_-`

```ruby
require 'base64'

Base64.encode64('hello world')
# => "aGVsbG8gd29ybGQ=\n"

Base64.decode64("aGVsbG8gd29ybGQ=\n")
# => "hello world"

Base64.urlsafe_encode64('hello world')
# => "aGVsbG8gd29ybGQ="
```

## Digest

Use **SHA**(Secure Hash Algorithm) to generate digest and encrypt.

```ruby
require 'digest'
```

Binary presentation.

```ruby
Digest::SHA1.digest 'hello world'
# => "*\xAEl5\xC9O\xCF\xB4\x15\xDB\xE9_@\x8B\x9C\xE9\x1E\xE8F\xED"
```

Hex presentation.

```ruby
Digest::SHA1.hexdigest 'hello world'
# => "2aae6c35c94fcfb415dbe95f408b9ce91ee846ed"
```

Base64 presentation.

```ruby
Digest::SHA1.base64digest 'hello world'
# => "Kq5sNclPz7QV2+lfQIuc6R7oRu0="
```

Bubble-babble (recognizable and pronounceable) presentation

```ruby
require 'digest/bubblebabble'

Digest::SHA1.bubblebabble 'hello world'
# => "xepip-varaf-hodig-zefor-gyhyt-rupih-zubym-rulyv-nolov-micyv-taxyx"
```

Use **SHA2**.

```ruby
Digest::SHA256.hexdigest('hello world')
# => "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
```

Use **MD5**.(*abandoned*)

```ruby
Digest::MD5.hexdigest('hello world')
=> "5eb63bbbe01eeed093cb22bb8f5acdc3"
```

## HMAC

Hash-based Message Authentication Code. Use key to sign data.

```ruby
key = '123456'
data = 'hello world'
OpenSSL::HMAC.digest('sha1', key, data)
# => "Hs\xE8\v2\bv\xFE\xF9\x8B\xD5\x85zqF\xDBA \a\xC7"

OpenSSL::HMAC.hexdigest('sha1', key, data)
# => "4873e80b320876fef98bd5857a7146db412007c7"

# Use Base64 to encode
Base64.encode64 OpenSSL::HMAC.digest('sha1', key, data)
# => "SHPoCzIIdv75i9WFenFG20EgB8c=\n"
```

