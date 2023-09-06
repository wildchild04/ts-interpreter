import { describe, expect, test } from "@jest/globals";
import { Lexer } from "../lexer/lexer";
import { Parser } from "./parser";
import { LetStatement, ReturnStatement, Statement } from "../ast/ast";




describe('test let statement', () => {
  const input = `
    let x = 5;
    let y = 10;
    let foobar = 838383;
  `

  const lexer = new Lexer(input);
  const parser = new Parser(lexer);

  const program = parser.parseProgram();

  expect(program.statements.length).toBe(3);

  const expected = [
    {ident: "x", value: 5},
    {ident: "y", value: 10},
    {ident: "foobar", value: 838383},
  ];

  test(`expected let statements ident and value`, ()=> {
    

    for (let i = 0; i < expected.length; i++) {

      let statement = program.statements[i];
      testLetStatement(statement, expected[i].ident)
    }
   
  })
});


describe('test return statment',() => {
  const input = `
    return 5;
    return 10;
    return 3215490;
  `
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);

  const program = parser.parseProgram();

  expect(program.statements.length).toBe(3);

  test('expected return statement', () => {
    
    for (let stmt of program.statements) {
      expect(stmt).toBeInstanceOf(ReturnStatement);
      expect(stmt.tokenLiteral()).toBe("return");
    }
  })

});


function testLetStatement(stmt: Statement, name: string) {
  
  expect(stmt.tokenLiteral()).toBe("let");
  expect(stmt).toBeInstanceOf(LetStatement);

  if(stmt instanceof LetStatement) {
    expect(stmt.name.value).toBe(name);
    expect(stmt.name.tokenLiteral()).toBe(name);
  }
}

