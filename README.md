# Nano Messages
## What is Nano Messages?
Nano Messages is a web application that allow to read and write messages in the Nano blockchain in a simple and fast way.
The result is a multi channel, decentralized and uncensorable message board.

## Where and how the messages are actually stored?
Yes, okay, I said that the messages are in the Nano blockchain… but how?

Basically, when you send a transaction, the fields you need to fill in are the **recipient wallet address** and the **amount of Nano** to send.

Both of these fields can be used to **contain properly encoded data**: the recipient address field can contain **256 bits** of data (about 32 1-byte encoded characters), while the amount field can contains a variable amount of data, based on how many Nano you can afford to spend. Nano amount has 30 decimal digits, so with 1 Nano (about $3 at the time of writing) you can encode about **99 bits** (12 characters).

It’s evidient that is more convenient to use the **address field**, as it can contain more data and there is no need to own a large amount of Nano (the minimum amount for a transaction is 10^-30 Nano, which is called 1 raw and at the moment it’s worth around $0.00 — nothing).

### How are the wallet addresses made?
This is an example of a Nano wallet address:
![Nano address](https://miro.medium.com/max/700/1*6oyHUeqxdtZs8O8g20bcqw.png)

- Every Nano address starts with ***nano_*** (or xrb_ as Nano was previously called RaiBlocks).
 The next 52 characters are the real important part, as they are basically the encoded **public key** of the Nano wallet. The first character of this part can be only 1 or 3, while the others 51 characters can be any character of this **special alphabet**: "13456789abcdefghijkmnopqrstuwxyz". We are going to ignore the first character and use only the others 51 to encode our messages.
- Finally, the last 8 characters are a **checksum**, to check that the address is valid and prevent to erroneously send funds to a wrong address, by mistyping some characters.

### How are messages encoded in wallet addresses?
Messages are encoded in a very simple way: every character in the message is firstly represented as 1 byte, using a small subset of the **UTF-16 encoding**, the first 256 characters rappresentable. Here you can find a table with the binary rappresentation of each character, just ignore the first 8 bits.

After that, the bits are divided into groups of 5, and each group is then rappresented as the corresponding character in the alphabet used in the Nano addresses (*13456789abcdefghijkmnopqrstuwxyz*). So 00000 = 1, 00001 = 3, 00010 = 4, and so on…

Let’s see an example of the encoding of the message *"Hello!"*:

```
# UTF-16 1 byte rappresentation
01001000 01100101 01101100 01101100 01101111 00100001
   H        e        l        l        o        !
# base32 Nano address rappresentation
01001 00001 10010 10110 11000 11011 00011 01111 00100 00100
  b     3     k     p     r     u     5     h     6     6
```

"Hello!" = "b3kpru5h66". It’s that simple, no weird or complicated algorithm. You can also encode and decode short messages by hand.

Note that I added 2 zero bits at the end, to make also the last group 5 bit long.

To be able to reppresent the messages as a wallet address it must be **51 characters long**, so I added some extra **spaces** at the end of the plain message to make it 50 character long, and I added a random character at the end (because 255, the number of bits we are using in the address, is not divisible by 8, the bits length of each character, it’s not possible to have 51 characters encoded message).
So this is what it looks like in the end:

```
b3kpru5h66i41a3161i41a3161i41a3161i41a3161i41a31619
```

Finally, we have to calculate the **address checksum** using **[BLAKE2b](https://en.wikipedia.org/wiki/BLAKE_(hash_function)#BLAKE2)**, and we have all we need to make the complete address:
```
nano_1b3kpru5h66i41a3161i41a3161i41a3161i41a3161i41a31619ijghkiwh
```

Note that the character 1 after nano_ it was chosen arbitrarily and it doesn’t depend on the message, as we have decided for convenience not to use it. It could also be 3 without any problem.

That looks nice, we just have to send a transasction to that address and we just put a message in the Nano blockchain! **But there are 2 problems**:

1. for what we saw until now, we can only send message **up to 31 characters long**, as a 32 character message will be encoded in 52 base32 characters, and that’s too long for a wallet address;
2. other peoples are **unlikely to find our message** in the blockchain, as it apparently it looks like a normal transaction, sent to a normal address.

Now we’ll se how to solve those two problems!

### Continue on Medium
You just read an excerpt of my [Medium post](https://cristianlivella.medium.com/nano-messages-7ac021ad61ea) about Nano Messages. If you're interested, continue to learn how Nano Messages works by reading on [Medium](https://cristianlivella.medium.com/nano-messages-7ac021ad61ea).
