import * as readline from "readline";
import { Lexer } from "../lexer/lexer";

import { evaluateNode } from "../evaluator/evaluator";
import { Parser } from "../parser/parser";
import { Environment } from "../environment";
import { Null } from "../object/object";
const PROMPT = ">> ";
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const env = new Environment();

function start() {

  rl.question(PROMPT, (line) => {
    if (line === "exit") {
      rl.close();
      return;
    }

    try {

      const lexer = new Lexer(line);

      const parser = new Parser(lexer);
      const program = parser.parseProgram();



      const evaluated = evaluateNode(program, env);

      if (evaluated != null && !(evaluated instanceof Null)) {

        rl.write(evaluated.inspect())
        rl.write('\n');
      }
    } catch (e) {
      if (e instanceof Error) {
        rl.write("Monkey mad >:C\n");
        rl.write(`Error ${e.message}`);
        rl.write('\n');
      }
    }



    start();
  });

}


start();
