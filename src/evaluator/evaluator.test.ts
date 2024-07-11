import { describe, expect, test } from "@jest/globals";
import { Boolean, Error, Integer, Object, Function, String, Array, Null, Hash, HashKey } from "../object/object";
import { Lexer } from "../lexer/lexer";
import { Parser } from "../parser/parser";
import { FALSE, TRUE, evaluateNode } from "./evaluator";
import { Environment } from "../environment";



describe('Test evaluateNode()', () => {

  test('test eval integer expression', () => {

    interface TestCase {
      input: string;
      expected: number;
    };

    const tests: TestCase[] = [
      { input: '5', expected: 5 },
      { input: '10', expected: 10 },
      { input: '-5', expected: -5 },
      { input: '-10', expected: -10 },
      { input: " 5 + 5 + 5 + 5 - 10", expected: 10 },
      { input: " 2 * 2 * 2 * 2 * 2", expected: 32 },
      { input: "-50 + 100 + -50", expected: 0 },
      { input: " 5 * 2 + 10", expected: 20 },
      { input: " 5 + 2 * 10", expected: 25 },
      { input: " 20 + 2 * -10", expected: 0 },
      { input: " 50 / 2 * 2 + 10", expected: 60 },
      { input: " 2 * (5 + 10)", expected: 30 },
      { input: " 3 * 3 * 3 + 10", expected: 37 },
      { input: " 3 * (3 * 3) + 10", expected: 37 },
      { input: "( 5 + 10 * 2 + 15 / 3) * 2 + -10", expected: 50 },
    ]

    for (let tc of tests) {

      const evaluated = testEval(tc.input);

      expect(evaluated).toBeTruthy();
      if (evaluated != null) {
        expect(testIntergerObject(evaluated, tc.expected)).toBe(true);
      }
    }
  });

  test('test eval boolean expression', () => {
    interface TestCase {
      input: string;
      expected: boolean;
    }

    const tests: TestCase[] = [
      { input: "true", expected: true },
      { input: "false", expected: false },
      { input: "1 < 2", expected: true },
      { input: "1 > 2", expected: false },
      { input: "1 < 1", expected: false },
      { input: "1 > 1", expected: false },
      { input: "1 == 1", expected: true },
      { input: "1 != 1", expected: false },
      { input: "1 == 2", expected: false },
      { input: "1 != 2", expected: true },
      { input: "true == true", expected: true },
      { input: "false == false", expected: true },
      { input: "true == false", expected: false },
      { input: "true != false", expected: true },
      { input: "false != true", expected: true },
      { input: "(1 < 2) == true", expected: true },
      { input: "(1 < 2) == false", expected: false },
      { input: "(1 > 2) == true", expected: false },
      { input: "(1 > 2) == false", expected: true },
    ]

    for (let tc of tests) {
      let evaluated = testEval(tc.input);

      expect(evaluated).toBeTruthy();
      if (evaluated != null) {
        expect(testBooleanObject(evaluated, tc.expected)).toBe(true)
      }
    }
  });

  test('test bang operator', () => {
    interface TestCase {
      input: string;
      expected: boolean;
    }

    const tests: TestCase[] = [
      { input: "!true", expected: false },
      { input: "!false", expected: true },
      { input: "!5", expected: false },
      { input: "!!false", expected: false },
      { input: "!!true", expected: true },
      { input: "!!5", expected: true },
    ]

    for (let tc of tests) {
      let evaluated = testEval(tc.input);

      expect(evaluated).toBeTruthy();
      if (evaluated != null) {
        expect(testBooleanObject(evaluated, tc.expected)).toBe(true)
      }
    }
  });

  test('test if else expression', () => {
    interface TestCase {
      input: string;
      expected: number | null;
    }

    const tests: TestCase[] = [
      { input: "if (true) { 10 }", expected: 10 },
      { input: "if (false) { 10 }", expected: null },
      { input: "if (1) { 10 }", expected: 10 },
      { input: "if (1 < 2) { 10 }", expected: 10 },
      { input: "if (1 > 2) { 10 }", expected: null },
      { input: "if (1 > 2) { 10 } else { 20 }", expected: 20 },
      { input: "if (1 < 2) { 10 } else { 20 }", expected: 10 },
    ];


    for (let tc of tests) {
      let evaluated = testEval(tc.input);

      expect(evaluated).toBeTruthy();
      if (evaluated != null) {
        if (tc.expected != null) {

          testIntergerObject(evaluated, tc.expected);
        } else {
          testNullObject(evaluated);
        }
      }
    }

  });

  test('test return statement', () => {
    interface TestCase {
      input: string;
      expected: number;
    }

    const tests: TestCase[] = [
      { input: "return 10;", expected: 10 },
      { input: "return 10; 9;", expected: 10 },
      { input: "return 2 * 5; 9;", expected: 10 },
      { input: "9; return 2 * 5; 9;", expected: 10 },
      {
        input: `
        if (10 > 1) {
          if(10 > 1) {
            return 10;
          }
          return 1;
        }
        `, expected: 10
      },
    ];

    for (let tc of tests) {
      const evaluated = testEval(tc.input);
      expect(evaluated).toBeTruthy();

      if (evaluated != null) {
        expect(testIntergerObject(evaluated, tc.expected)).toBe(true);
      }
    }

  });

  test('test error handling', () => {
    interface TestCase {
      input: string;
      expectedMessage: string;
    }

    const tests: TestCase[] = [
      { input: "5 + true;", expectedMessage: "type mismatch: INTEGER + BOOLEAN" },
      { input: "5 + true; 5;", expectedMessage: "type mismatch: INTEGER + BOOLEAN" },
      { input: "-true", expectedMessage: "unknown operator: -BOOLEAN" },
      { input: "true + false;", expectedMessage: "unknown operator: BOOLEAN + BOOLEAN" },
      { input: "5; true + false; 5", expectedMessage: "unknown operator: BOOLEAN + BOOLEAN" },
      { input: "if (10 > 1) { true + false; }", expectedMessage: "unknown operator: BOOLEAN + BOOLEAN" },
      { input: `if (10 > 1) { if (10 > 1) { return true + false; } return 1; }`, expectedMessage: "unknown operator: BOOLEAN + BOOLEAN" },
      { input: 'foobar', expectedMessage: 'identifier not found: foobar' },
      { input: '"Hello" - "World!"', expectedMessage: 'unknown operator: STRING - STRING' },
      { input: '{"name": "Monkey"}[ fn(x) { x }]; ', expectedMessage: "unusable as hash key: FUNCTION", },

    ];

    for (let tc of tests) {
      const evaluated = testEval(tc.input);
      expect(evaluated).toBeInstanceOf(Error);
      if (evaluated instanceof Error) {
        expect(evaluated.message).toBe(tc.expectedMessage);
      }
    }

  });


  test('test let statement', () => {
    interface TestCase {
      input: string;
      expected: number;
    }

    const tests: TestCase[] = [
      { input: "let a = 5; a;", expected: 5 },
      { input: "let a = 5 * 5; a;", expected: 25 },
      { input: "let a = 5; let b = a; b;", expected: 5 },
      { input: "let a = 5; let b = a; let c = a + b + 5; c;", expected: 15 },
    ];


    for (let tc of tests) {
      let got = testEval(tc.input);
      expect(got).toBeTruthy();

      if (got != null) {

        expect(testIntergerObject(got, tc.expected)).toBe(true);
      }
    }
  });

  test('test function object', () => {

    const input = 'fn(x) {x+2;};'

    const evaluated = testEval(input);

    expect(evaluated).toBeInstanceOf(Function)
    if (evaluated instanceof Function) {
      expect(evaluated.parameters.length).toBe(1);
      expect(evaluated.parameters[0].string()).toBe('x');
      expect(evaluated.body.string()).toBe('(x + 2)')
    }
  });

  test('function application', () => {
    interface TestCase {
      input: string;
      expected: number;
    }

    const tests: TestCase[] = [
      { input: "let identity = fn(x) {  x; }; identity(5);", expected: 5 },
      { input: "let identity = fn(x) { return x; }; identity(5);", expected: 5 },
      { input: "let double = fn(x) { x * 2; }; double(5);", expected: 10 },
      { input: "let add = fn(x, y) { x + y; }; add(5, 5);", expected: 10 },
      { input: "let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));", expected: 20 },
      { input: "fn(x){ return x; }(5)", expected: 5 },
    ];

    for (let tc of tests) {
      let got = testEval(tc.input);

      if (got != null) {
        expect(testIntergerObject(got, tc.expected)).toBe(true);
      }
    }

  });

  test('test string literal', () => {
    const input = '"Hello World!"';

    const evaluated = testEval(input);
    expect(evaluated).toBeInstanceOf(String);
    if (evaluated instanceof String) {
      expect(evaluated.value).toBe("Hello World!");
    }
  });

  test('test string concatenation', () => {

    const input = '"Hello " + "World!"';

    const evaluated = testEval(input);

    expect(evaluated).toBeInstanceOf(String)
    if (evaluated instanceof String) {
      expect(evaluated.value).toBe('Hello World!');
    }
  });

  test('test built in functions', () => {
    interface TestCase {
      input: string;
      expected: number | string;
    }

    const tests: TestCase[] = [
      { input: `len("")`, expected: 0 },
      { input: `len("four")`, expected: 4 },
      { input: `len("hello world")`, expected: 11 },
      { input: `len(1)`, expected: "argument to `len` not supported, got INTEGER" },
      { input: `len("one", "two")`, expected: "wrong number of arguments. got = 2, want = 1" },
    ];

    for (let tc of tests) {
      let evaluated = testEval(tc.input);

      switch (typeof (tc.expected)) {
        case 'string':
          expect(evaluated).toBeInstanceOf(Error);
          if (evaluated instanceof Error) {
            expect(evaluated.message).toBe(tc.expected)
          }
          break;
        case 'number':
          expect(evaluated).toBeTruthy();
          if (evaluated != null) {
            expect(testIntergerObject(evaluated, tc.expected)).toBe(true);
          }
      }
    }
  });

  test('test array literal', () => {
    const input = '[1,2*2,3+3]';

    const evaluated = testEval(input);
    expect(evaluated).toBeInstanceOf(Array)
    if (evaluated instanceof Array) {
      expect(evaluated.elements.length).toBe(3);
      expect(testIntergerObject(evaluated.elements[0], 1)).toBe(true);
      expect(testIntergerObject(evaluated.elements[1], 4)).toBe(true);
      expect(testIntergerObject(evaluated.elements[2], 6)).toBe(true);
    }

  });

  test('test array index expression', () => {
    interface TestCase {
      input: string;
      expected: number | null;
    }

    const tests: TestCase[] = [
      { input: "[ 1, 2, 3][ 0]", expected: 1 },
      { input: "[ 1, 2, 3][ 1]", expected: 2 },
      { input: "[ 1, 2, 3][ 2]", expected: 3 },
      { input: "let i = 0; [1][ i];", expected: 1 },
      { input: "[ 1, 2, 3][ 1 + 1];", expected: 3 },
      { input: "let myArray = [1, 2, 3]; myArray[ 2];", expected: 3 },
      { input: "let myArray = [1, 2, 3]; myArray[ 0] + myArray[ 1] + myArray[ 2];", expected: 6 },
      { input: "let myArray = [1, 2, 3]; let i = myArray[ 0]; myArray[ i]", expected: 2 },
      { input: "[ 1, 2, 3][ 3]", expected: null },
      { input: "[ 1, 2, 3][-1]", expected: null },
    ];

    for (let tc of tests) {
      const evaluated = testEval(tc.input);
      expect(evaluated).toBeTruthy();
      if (evaluated != null) {
        if (tc.expected != null) {
          expect(testIntergerObject(evaluated, tc.expected)).toBe(true);
        } else {
          expect(testNullObject(evaluated)).toBe(true);
        }
      }

    }
  })

  test('test hash literals', () => {
    const input = `let two = "two";
    {
      "one": 10 - 9, 
      two: 1 + 1, 
      "thr" + "ee": 6 / 2,
      4: 4,
      true: 5,
      false: 6
    }`

    const evaluated = testEval(input);
    expect(evaluated).toBeInstanceOf(Hash)
    if (evaluated instanceof Hash) {
      const expected: Map<number, number> = new Map([
        [new String('one').hashKey().value, 1],
        [new String('two').hashKey().value, 2],
        [new String('three').hashKey().value, 3],
        [new Integer(4).hashKey().value, 4],
        [TRUE.hashKey().value, 5],
        [FALSE.hashKey().value, 6],
      ]);

      expect(evaluated.pairs.size).toBe(expected.size);

      const pairs = expected.entries();
      let expectedPair = pairs.next();

      while (!expectedPair.done) {

        const pair = evaluated.pairs.get(expectedPair.value[0]);
        expect(pair).toBeTruthy();
        if (pair != undefined) {
          expect(testIntergerObject(pair.value, expectedPair.value[1])).toBe(true);
        }

        expectedPair = pairs.next();

      }


    }
  });


  test('test hash index expression', () => {
    interface TestCase {
      input: string;
      expected: any;
    }

    const tests: TestCase[] = [
      { input: `{"foo": 5}["foo"]`, expected: 5 },
      { input: `{"foo": 5}["bar"]`, expected: null },
      { input: `let key = "foo"; {"foo": 5}[key]`, expected: 5 },
      { input: `{}["foo"]`, expected: null },
      { input: `{5: 5}[5]`, expected: 5 },
      { input: `{true: 5}[true]`, expected: 5 },
      { input: `{false: 5}[false]`, expected: 5 },
    ];

    for (let tc of tests) {
      const evaluated = testEval(tc.input);

      expect(evaluated).toBeTruthy()
      if (evaluated != null) {

        if (typeof tc.expected === 'number') {
          expect(testIntergerObject(evaluated, tc.expected)).toBe(true);
        } else {
          testNullObject(evaluated);
        }
      }
    }
  });
});

function testEval(input: string): Object | null {

  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parseProgram();
  const env = new Environment();

  return evaluateNode(program, env);

}

function testIntergerObject(obj: Object, expected: number): boolean {
  if (obj instanceof Integer) {
    return obj.value === expected;
  }

  return false;
}

function testBooleanObject(obj: Object, expected: boolean): boolean {

  if (obj instanceof Boolean) {
    return obj.value === expected;
  }

  return false;
}

function testNullObject(obj: Object): boolean {
  if (obj instanceof Null) {
    return true;
  }
  if (obj != null) {
    return false;
  }

  return true;
}
