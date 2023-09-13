import { describe, expect, test } from "@jest/globals";
import { Lexer } from "../lexer/lexer";
import { Parser } from "./parser";
import { BlockStatement, Boolean, CallExpression, Expression, ExpressionStatement, FunctionLiteral, Identifier, IfExpression, InfixExpression, IntegerLiteral, LetStatement, PrefixExpression, ReturnStatement, Statement } from "../ast/ast";




describe('test let statement', () => {

  type StatementTest = {
    input: string
    expectedIdentifier: string
    expectedValue: any
  }

  const tests: Array<StatementTest> = [

    { input: "let x = 5;", expectedIdentifier: "x", expectedValue: 5 },
    { input: "let y = 10;", expectedIdentifier: "y", expectedValue: 10 },
    { input: "let foobar = 838383;", expectedIdentifier: "foobar", expectedValue: 838383 },
  ]

  test(`expected let statements ident and value`, () => {

    for (let t of tests) {
      const lexer = new Lexer(t.input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      expect(program.statements.length).toBe(1);
      const stmt = program.statements[0];
      testLetStatement(stmt, t.expectedIdentifier);

      expect(stmt).toBeInstanceOf(LetStatement);
    }
  });
});


describe('test return statment', () => {
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

    if (stmt instanceof ExpressionStatement) {
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
    value: any
  }

  const tests: Array<PrefixTest> = [
    { input: "!5;", operator: "!", value: 5 },
    { input: "-15;", operator: "-", value: 15 },
    { input: "!true;", operator: "!", value: true },
    { input: "!false;", operator: "!", value: false },

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
          testLiteralExpression(exp.right, t.value);
        }
      }

    })
  }

});

describe('test parsing infix expressions', () => {
  type InfixTest = {
    input: string
    leftValue: number | boolean
    operator: string
    rightValue: number | boolean
  }

  const tests: Array<InfixTest> = [
    { input: " 5 + 5;", leftValue: 5, operator: "+", rightValue: 5 },
    { input: " 5 - 5;", leftValue: 5, operator: "-", rightValue: 5 },
    { input: " 5 * 5;", leftValue: 5, operator: "*", rightValue: 5 },
    { input: " 5 / 5;", leftValue: 5, operator: "/", rightValue: 5 },
    { input: " 5 > 5;", leftValue: 5, operator: ">", rightValue: 5 },
    { input: " 5 < 5;", leftValue: 5, operator: "<", rightValue: 5 },
    { input: " 5 == 5;", leftValue: 5, operator: "==", rightValue: 5 },
    { input: " 5 != 5;", leftValue: 5, operator: "!=", rightValue: 5 },
    { input: "true == true", leftValue: true, operator: "==", rightValue: true },
    { input: "true != false", leftValue: true, operator: "!=", rightValue: false },
    { input: "false == false", leftValue: false, operator: "==", rightValue: false },

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
          testInfixExpression(exp, exp.left, exp.operator, exp.right);
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
    { input: "true", expected: "true" },
    { input: "false", expected: "false" },
    { input: "3 > 5 == false", expected: "((3 > 5) == false)" },
    { input: "3 < 5 == true", expected: "((3 < 5) == true)" },
    { input: "1 + (2 + 3) + 4", expected: "((1 + (2 + 3)) + 4)" },
    { input: "(5 + 5) * 2", expected: "((5 + 5) * 2)" },
    { input: "2 / (5 + 5)", expected: "(2 / (5 + 5))" },
    { input: "-(5 + 5)", expected: "(-(5 + 5))" },
    { input: "!(true == true)", expected: "(!(true == true))" },
    { input: "a + add(b * c) + d", expected: "((a + add((b * c))) + d)" },
    { input: "add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))", expected: "add(a,b,1,(2 * 3),(4 + 5),add(6,(7 * 8)))" },

  ];

  for (let t of tests) {
    const lexer = new Lexer(t.input);
    const parser = new Parser(lexer);

    test('test precedence', () => {
      const program = parser.parseProgram();
      expect(program.string()).toBe(t.expected);
    });
  }

});


describe('test if expression', () => {
  const input = "if (x < y) { x } else { y }";

  const lexer = new Lexer(input);
  const parser = new Parser(lexer);

  test('parse if expression', () => {
    const program = parser.parseProgram();
    expect(program.statements.length).toBe(1);
    const stmt = program.statements[0];
    expect(stmt).toBeInstanceOf(ExpressionStatement);

    if (stmt instanceof ExpressionStatement) {
      const exp = stmt.expression;
      expect(exp).toBeInstanceOf(IfExpression);

      if (exp instanceof IfExpression) {
        testInfixExpression(exp.condition, "x", "<", "y");
        expect(exp.consequence.statements.length).toBe(1);
        const consequence = exp.consequence.statements[0];
        expect(consequence).toBeInstanceOf(ExpressionStatement);

        if (consequence instanceof ExpressionStatement && consequence.expression !== undefined) {
          testIdentifier(consequence.expression, "x");
        }
        const alternative = exp.alternative;
        expect(alternative).toBeInstanceOf(BlockStatement);

        if (alternative instanceof BlockStatement) {

          expect(alternative.statements.length).toBe(1);
        }


      }

    }
  });
});

describe('test function literal parsing', () => {
  const input = "fn(x, y) {x + y;}";
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);

  test('test funtion parsing', () => {
    const program = parser.parseProgram();

    expect(program.statements.length).toBe(1);
    const stmt = program.statements[0];
    expect(stmt).toBeInstanceOf(ExpressionStatement);

    if (stmt instanceof ExpressionStatement) {
      const fn = stmt.expression;
      expect(fn).toBeInstanceOf(FunctionLiteral);

      if (fn instanceof FunctionLiteral) {
        expect(fn.parameters.length).toBe(2);
        testLiteralExpression(fn.parameters[0], "x");
        testLiteralExpression(fn.parameters[1], "y");
        expect(fn.body.statements.length).toBe(1);
        const body = fn.body.statements[0];
        expect(body).toBeInstanceOf(ExpressionStatement);

        if (body instanceof ExpressionStatement && body.expression !== undefined) {
          testInfixExpression(body.expression, "x", "+", "y");
        }
      }
    }

  });
});

describe('test function parameters parsing', () => {
  type ParamTest = {
    input: string
    expectedParams: Array<string>
  }

  const tests: Array<ParamTest> = [
    { input: "fn() {};", expectedParams: [] },
    { input: "fn(x) {};", expectedParams: ["x"] },
    { input: "fn(x, y, z) {};", expectedParams: ["x", "y", "z"] },
  ];


  test('test params parsing', () => {

    for (let t of tests) {
      const lexer = new Lexer(t.input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      const stmt = program.statements[0];

      expect(stmt).toBeInstanceOf(ExpressionStatement);

      if (stmt instanceof ExpressionStatement) {
        const fn = stmt.expression;
        expect(fn).toBeInstanceOf(FunctionLiteral);
        if (fn instanceof FunctionLiteral) {
          expect(fn.parameters.length).toBe(t.expectedParams.length);

          for (let i = 0; i < t.expectedParams.length; i++) {
            testLiteralExpression(fn.parameters[i], t.expectedParams[i]);
          }
        }
      }
    }
  })
});

describe('test call expression parsing', () => {
  const input = "add(1, 2 * 3, 4 + 5);";
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);

  test('test expression parser', () => {

    const program = parser.parseProgram();
    expect(program.statements.length).toBe(1);
    const stmt = program.statements[0];
    expect(stmt).toBeInstanceOf(ExpressionStatement);
    if (stmt instanceof ExpressionStatement && stmt.expression !== undefined) {
      const exp = stmt.expression;
      expect(exp).toBeInstanceOf(CallExpression);
      if (exp instanceof CallExpression) {
        testIdentifier(exp.function, "add");
        expect(exp.arguments.length).toBe(3);
        testLiteralExpression(exp.arguments[0], 1);
        testInfixExpression(exp.arguments[1], 2, "*", 3);
        testInfixExpression(exp.arguments[2], 4, "+", 5);
      }

    }
  });
});

function testLetStatement(stmt: Statement, name: string) {

  expect(stmt.tokenLiteral()).toBe("let");
  expect(stmt).toBeInstanceOf(LetStatement);

  if (stmt instanceof LetStatement) {
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

function testIdentifier(exp: Expression, value: string) {
  expect(exp).toBeInstanceOf(Identifier);

  if (exp instanceof Identifier) {
    expect(exp.value).toBe(value);
    expect(exp.tokenLiteral()).toBe(value);
  }
}

function testLiteralExpression(exp: Expression, expected: any) {
  switch (typeof expected) {
    case "number":
      testIntegerLiteral(exp, expected);
      break;
    case "string":
      testIdentifier(exp, expected);
      break;
    case "boolean":
      testBooleanLiteral(exp, expected);
  }
}

function testInfixExpression(exp: Expression, left: any, operator: string, right: any) {
  expect(exp).toBeInstanceOf(InfixExpression);

  if (exp instanceof InfixExpression) {
    testLiteralExpression(exp.left, left);
    expect(operator).toBe(operator);
    testLiteralExpression(exp.right, right);
  }
}

function testBooleanLiteral(exp: Expression, value: boolean) {
  expect(exp).toBeInstanceOf(Boolean);

  if (exp instanceof Boolean) {
    expect(exp.value).toBe(value);
    expect(exp.tokenLiteral()).toBe(`${value}`);
  }
}
