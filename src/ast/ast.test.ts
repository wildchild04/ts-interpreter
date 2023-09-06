import { describe, expect, test } from "@jest/globals";
import { Identifier, LetStatement, Program } from "./ast";
import { TType } from "../token/token";



describe('test ast', () =>{
  const program = new Program();

  const letStmt = new LetStatement({type: TType.LET, literal: "let"}, 
    new Identifier({type: TType.IDENT, literal: "myVar"}, "myVar"), 
    new Identifier({type: TType.IDENT, literal: "anotherVar"}, "anotherVar"));

  program.statements.push(letStmt);

  test("test program to string", () => {
    
    expect(program.string()).toBe("let myVar = anotherVar;");
  });

  
});