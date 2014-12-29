---
layout: post
title: "Encryption in Ruby"
date: 2014-11-20 00:53:44 +0800
comments: true
categories: ['Ruby']
---

## Encode and decode

Use **Base64**. [API](http://ruby-doc.org/stdlib-2.1.5/libdoc/base64/rdoc/Base64.html)

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

## Secure Random String

Use **SecureRandom**, an interface for secure random number generator. [API](http://ruby-doc.org/stdlib-2.1.2/libdoc/securerandom/rdoc/SecureRandom.html)

+ Generate session key in HTTP cookies.
+ Generate OAuth nonce.

```ruby
require 'securerandom'
```

Hex presentation.

```ruby
# 10 is the length of random number to be generated.
# The resulting string has twice length.
SecureRandom.hex(10)
# => "91a9e990d11e1b546b5a"

# Default is 16, resulting a 32 length string.
SecureRandom.hex
# => "263e8681a7241ca3dfb43e482f5a26b1"
```

Base64 presentation.

```ruby
SecureRandom.base64
# => "0Wl1NAxZi+kk6JhJERKd/Q=="
```

## Digest

Use **SHA**(Secure Hash Algorithm) to generate digest and encrypt. [API](http://ruby-doc.org/stdlib-2.1.0/libdoc/digest/rdoc/Digest.html)

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

Use **OpenSSL::HMAC**. [API](http://ruby-doc.org/stdlib-2.1.2/libdoc/openssl/rdoc/OpenSSL/HMAC.html)

Hash-based Message Authentication Code. 

1. Generate digest message.
2. Sign it.

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


## Symmetric Encryption and Decryption

Use **OpenSSL::Cipher**. [API](http://ruby-doc.org/stdlib-1.9.3/libdoc/openssl/rdoc/OpenSSL/Cipher.html)

List all supported algorithms.

```ruby
OpenSSL::Cipher.ciphers
# => [
#  [  0] "AES-128-CBC",
#  [  1] "AES-128-CBC-HMAC-SHA1",
#  [  2] "AES-128-CFB",
#  [  3] "AES-128-CFB1",
#  ...
# ]
```

Encrytion.

```ruby
data = 'hello world'

cipher = OpenSSL::Cipher.new('aes-128-cbc')

# Choose a mode
cipher.encrypt

# Choose a key
key = cipher.random_key
# => "8\f\x1F\xEA\x15T\xACM\x84Q\xD8o\xD3cxv"

# Choose an IV, a nonce
iv = cipher.random_iv
# => "$\xF8$1>\xE8%!\x1D\xE1\x882\xAE\xDC\f\xE5"

# Finalization
encrypted = cipher.update(data) + cipher.final
# => "^\x93\xDD\x11\xBC>x\f\xE1\v\x19\xD7\xEF\xB6\xE5\x8D"
```

Decryption.

```ruby
decipher = OpenSSL::Cipher.new('aes-128-cbc')

# Choose a mode
decipher.decrypt

# Setup key and IV
decipher.key = key
decipher.iv = iv

# Finalization
plain = decipher.update(encrypted) + decipher.final
# => "hello world"
```
