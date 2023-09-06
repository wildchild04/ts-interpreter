import * as readline from "readline";
import { Lexer } from "../lexer/lexer";
import { TType } from "../token/token";
const PROMPT = ">>";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function start() {

  rl.question(PROMPT, (line) => {
    if (line === "exit") {
      rl.close();
      return;
    }

    const lexer = new Lexer(line);

    let token = lexer.nextToken();
    while(token.type !== TType.EOF) {
      console.log(token);
      token = lexer.nextToken();
    }

    start();
  });  

}


start();