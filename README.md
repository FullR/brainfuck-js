# Brainfuck-js

A simple brainfuck compiler/interpretter written in Javascript for fun/learning.

## Usage
```
    var brainfuck = require("./brainfuck")
    var program = brainfuck("++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.");

    program.run().then(function(context) {
        console.log(context.stdout); // prints "Hello World!\n"
    });
```