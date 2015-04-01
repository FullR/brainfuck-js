/*
    The behaviour of each token type
*/
var syntax = {
    // >
    forward: function(context, token) {
        context.pointer++;
        if(!context.data[context.pointer]) {
            context.data[context.pointer] = 0;
        }
    },
    // <
    backward: function(context, token) {
        context.pointer--;
        if(!context.data[context.pointer]) {
            context.data[context.pointer] = 0;
        }
    },
    // +
    increment: function(context, token) {
        context.data[context.pointer]++;
    },
    // -
    decrement: function(context, token) {
        context.data[context.pointer]--;
    },
    // .
    print: function(context, token) {
        context.stdout += String.fromCharCode(context.data[context.pointer]);
    },
    // ,
    getc: function(context, token) {
        return new Promise(function(resolve, reject) {
            var rl = require("readline")
                .createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
            
            rl.question("> ", function(text) {
                context.data[context.pointer] = +text[0];
                rl.close();
                resolve();
            });
        });
    },
    // [...]
    loop: function(context, token) {
        function run() {
            return token.program.run(context).then(function() {
                if(context.data[context.pointer]) {
                    return run();
                }
            });
        }
        if(context.data[context.pointer]) {
            return run();
        }
    }
};

// Compile brainfuck source code into an abstract syntax tree
function compileBrainfuck(source) {
    var length = source.length,
        ast = [],
        i,
        token;
    
    for(i = 0; i < length; i++) {
        token = source[i];
        switch(token) {
            case ">": ast.push({
                type: "forward"
            }); break;
            
            case "<": ast.push({
                type: "backward"
            }); break;
                
            case "+": ast.push({
                type: "increment"
            }); break;
                
            case "-": ast.push({
                type: "decrement"
            }); break;
                
            case ".": ast.push({
                type: "print"
            }); break;
                
            case ",": ast.push({
                type: "getc"
            }); break;
                
            case "[": // compile/skip the content of a loop and include its source/ast in the token
                var openCount = 1,
                    innerSrc = "";

                i++; // skip initial '['
                while(openCount) {
                    if(source[i] === "]") {
                        openCount--;
                        if(openCount <= 0) break; // break inner while loop (to avoid recording final ']' in innerSrc)
                    }
                    else if(source[i] === "[") {
                        openCount++;
                    }
                    innerSrc += source[i];
                    i++;
                }
                ast.push({
                    type: "loop",
                    program: compileBrainfuck(innerSrc),
                    source: innerSrc
                });
            break;
        }
    }

    return {
        run: function(context) {
            return runBrainfuck(ast, context);
        }
    };
}

// Run an abstract syntax tree output by `compileBrainfuck`
// Returns a promise that resolves the program's stdout
function runBrainfuck(ast, context) {
    var context = context || {
        data: {"0": 0},
        pointer: 0,
        stdout: ""
    };

    return ast.reduce(function(promise, token) {
        return promise.then(function() {
            if(syntax[token.type]) {
                //console.log("Running",token.type);
                return syntax[token.type](context, token);
            }
        });
    }, Promise.resolve()).then(function() {
        return context;
    });
}

module.exports = compileBrainfuck;