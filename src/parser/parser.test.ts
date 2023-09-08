import { describe, expect, test } from "@jest/globals";
import { Lexer } from "../lexer/lexer";
import { Parser } from "./parser";
import { Expression, ExpressionStatement, Identifier, InfixExpression, IntegerLiteral, LetStatement, PrefixExpression, Program, ReturnStatement, Statement } from "../ast/ast";
import { PrefixUnaryExpression, isPrefixUnaryExpression } from "typescript";




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
   
  });
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
  });

});

describe('test identifier expression', () => {
  
  const input = "foobar;";

  const lexer = new Lexer(input);
  const parser = new Parser(lexer);


  test("contains an identifier", () => {
    const program = parser.parseProgram();
    expect(program.statements.length).toBe(1);
    const stmt = program.statements[0];
    expect(stmt).toBeInstanceOf(ExpressionStatement);

    if(stmt instanceof ExpressionStatement) {
      const ident = stmt.expression;
      
      if (ident instanceof Identifier) {
        
        expect(ident.value).toBe("foobar");
        expect(ident.tokenLiteral()).toBe("foobar");
      }
    } 
  });
});

describe('test integer literal expression', () => {
  const input = "5;";

  const lexer = new Lexer(input);
  const parser = new Parser(lexer);

  const program = parser.parseProgram();

  test('test process integer expression', () => {
    expect(program.statements.length).toBe(1);
    
    const stmt = program.statements[0];
    
    expect(stmt).toBeInstanceOf(ExpressionStatement);

    if (stmt instanceof ExpressionStatement) {
      expect(stmt.expression).toBeInstanceOf(IntegerLiteral);
      const literal = stmt.expression;

      if (literal instanceof IntegerLiteral) {
        expect(literal.value).toBe(5);
        expect(literal?.tokenLiteral()).toBe("5");
      }
    }
  });
});

describe('test parsing prefix expressions', () => {
  
  type PrefixTest = {
    input: string
    operator: string
    integerValue: number
  }

  const tests: Array<PrefixTest> = [
    {input: "!5;", operator: "!", integerValue: 5},
    {input: "-15;", operator: "-", integerValue: 15},
  ];

  for (let t of tests) {

    const lexer = new Lexer(t.input);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();

    test('prefix parsing', () => {
      expect(program.statements.length).toBe(1);
      const stmt = program.statements[0];

      expect(stmt).toBeInstanceOf(ExpressionStatement);

      if (stmt instanceof ExpressionStatement) {

        const exp = stmt.expression;
        expect(exp).toBeInstanceOf(PrefixExpression) 
        if (exp instanceof PrefixExpression) {
          
          expect(exp.operator).toBe(t.operator);
          testIntegerLiteral(exp.right, t.integerValue);
        }
      }
      
    })
  }

});

describe('test parsing infix expressions', () => {
  type InfixTest = {
    input: string
    leftValue: number
    operator: string
    rightValue: number
  }

  const tests: Array<InfixTest> = [
    {input: " 5 + 5;", leftValue: 5, operator: "+", rightValue: 5},
    {input: " 5 - 5;", leftValue: 5, operator: "-", rightValue: 5},
    {input: " 5 * 5;", leftValue: 5, operator: "*", rightValue: 5},
    {input: " 5 / 5;", leftValue: 5, operator: "/", rightValue: 5},
    {input: " 5 > 5;", leftValue: 5, operator: ">", rightValue: 5},
    {input: " 5 < 5;", leftValue: 5, operator: "<", rightValue: 5},
    {input: " 5 == 5;", leftValue: 5, operator: "==", rightValue: 5},
    {input: " 5 != 5;", leftValue: 5, operator: "!=", rightValue: 5},
  
  ];

  for (let t of tests) {
    const lexer = new Lexer(t.input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();

    test('infix parsing', () => {
      expect(program.statements.length).toBe(1);
      const stmt = program.statements[0];

      expect(stmt).toBeInstanceOf(ExpressionStatement);
      if (stmt instanceof ExpressionStatement) {
        const exp = stmt.expression;
        expect(exp).toBeInstanceOf(InfixExpression);

        if (exp instanceof InfixExpression) {
          testIntegerLiteral(exp.left, t.leftValue);
          expect(exp.operator).toBe(t.operator);
          testIntegerLiteral(exp.right, t.rightValue);
        }
      }  
    });
  }
});

describe('test operator precedence parsing', () => {

  type TestCase = {
    input: string
    expected: string
  }

  const tests: Array<TestCase> = [
    { input: "-a * b", expected: "((-a) * b)" },
    { input: "!-a", expected: "(!(-a))", },
    { input: "a + b + c", expected: "((a + b) + c)" },
    { input: "a + b - c", expected: "((a + b) - c)" },
    { input: "a * b * c", expected: "((a * b) * c)" },
    { input: "a * b / c", expected: "((a * b) / c)" },
    { input: "a + b / c", expected: "(a + (b / c))" },
    { input: "a + b * c + d / e - f", expected: "(((a + (b * c)) + (d / e)) - f)" },
    { input: "3 + 4; -5 * 5", expected: "(3 + 4)((-5) * 5)" },
    { input: "5 > 4 == 3 < 4", expected: "((5 > 4) == (3 < 4))" },
    { input: "5 < 4 != 3 > 4", expected: "((5 < 4) != (3 > 4))" },
    { input: "3 + 4 * 5 == 3 * 1 + 4 * 5", expected: "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))" },
  ];

  for (let t of tests) {
    const lexer = new Lexer(t.input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();

    test('test precedence', () =>{
      expect(program.string()).toBe(t.expected);
    });
  }
  
});

function testLetStatement(stmt: Statement, name: string) {
  
  expect(stmt.tokenLiteral()).toBe("let");
  expect(stmt).toBeInstanceOf(LetStatement);

  if(stmt instanceof LetStatement) {
    expect(stmt.name.value).toBe(name);
    expect(stmt.name.tokenLiteral()).toBe(name);
  }
}

function testIntegerLiteral(exp: Expression, value: number) {
  
  expect(exp).toBeInstanceOf(IntegerLiteral);

  if (exp instanceof IntegerLiteral) {
    expect(exp.value).toBe(value);
    expect(exp.tokenLiteral()).toBe(`${value}`);
    
  }
}

