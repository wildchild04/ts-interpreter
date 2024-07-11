import { describe, expect, test } from "@jest/globals";
import { Lexer } from "./lexer";
import { TType } from "../token/token";


describe('test lexer.NextToken()', () => {
  const input = `
    let five = 5; 
    let ten = 10; 
    let add = fn( x, y) { x + y; }; 
    let result = add( five, ten); 

    !-/*5;
    5 < 10 > 5;

    if (5 < 10) {
      return true;
    } else {
      return false;    
    }

    10 == 10;
    10 != 9;

    "foobar"
    "foo bar"
    [1, 2];
    {"foo": "bar"}
  `

  let expected = [

    [TType.LET, "let"],
    [TType.IDENT, "five"],
    [TType.ASSIGN, "="],
    [TType.INT, "5"],
    [TType.SEMICOLON, ";"],
    [TType.LET, "let"],
    [TType.IDENT, "ten"],
    [TType.ASSIGN, "="],
    [TType.INT, "10"],
    [TType.SEMICOLON, ";"],
    [TType.LET, "let"],
    [TType.IDENT, "add"],
    [TType.ASSIGN, "="],
    [TType.FUNCTION, "fn"],
    [TType.LPAREN, "("],
    [TType.IDENT, "x"],
    [TType.COMMA, ","],
    [TType.IDENT, "y"],
    [TType.RPAREN, ")"],
    [TType.LBRACER, "{"],
    [TType.IDENT, "x"],
    [TType.PLUS, "+"],
    [TType.IDENT, "y"],
    [TType.SEMICOLON, ";"],
    [TType.RBRACER, "}"],
    [TType.SEMICOLON, ";"],
    [TType.LET, "let"],
    [TType.IDENT, "result"],
    [TType.ASSIGN, "="],
    [TType.IDENT, "add"],
    [TType.LPAREN, "("],
    [TType.IDENT, "five"],
    [TType.COMMA, ","],
    [TType.IDENT, "ten"],
    [TType.RPAREN, ")"],
    [TType.SEMICOLON, ";"],
    [TType.BANG, "!"],
    [TType.MINUS, "-"],
    [TType.SLASH, "/"],
    [TType.ASTERISK, "*"],
    [TType.INT, "5"],
    [TType.SEMICOLON, ";"],
    [TType.INT, "5"],
    [TType.LT, "<"],
    [TType.INT, "10"],
    [TType.GT, ">"],
    [TType.INT, "5"],
    [TType.SEMICOLON, ";"],
    [TType.IF, "if"],
    [TType.LPAREN, "("],
    [TType.INT, "5"],
    [TType.LT, "<"],
    [TType.INT, "10"],
    [TType.RPAREN, ")"],
    [TType.LBRACER, "{"],
    [TType.RETURN, "return"],
    [TType.TRUE, "true"],
    [TType.SEMICOLON, ";"],
    [TType.RBRACER, "}"],
    [TType.ELSE, "else"],
    [TType.LBRACER, "{"],
    [TType.RETURN, "return"],
    [TType.FALSE, "false"],
    [TType.SEMICOLON, ";"],
    [TType.RBRACER, "}"],
    [TType.INT, "10"],
    [TType.EQ, "=="],
    [TType.INT, "10"],
    [TType.SEMICOLON, ";"],
    [TType.INT, "10"],
    [TType.NOT_EQ, "!="],
    [TType.INT, "9"],
    [TType.SEMICOLON, ";"],
    [TType.STRING, "foobar"],
    [TType.STRING, "foo bar"],
    [TType.LBRACKET, "["],
    [TType.INT, "1"],
    [TType.COMMA, ","],
    [TType.INT, "2"],
    [TType.RBRACKET, "]"],
    [TType.SEMICOLON, ";"],
    [TType.LBRACER, "{"],
    [TType.STRING, "foo"],
    [TType.COLON, ":"],
    [TType.STRING, "bar"],
    [TType.RBRACER, "}"],
    [TType.EOF, ""],
  ];

  test(`test lexer with input: ${input}`, () => {
    const lexer = new Lexer(input);

    for (let tt of expected) {
      let token = lexer.nextToken();
      expect(token.type).toBe(tt[0]);
      expect(token.literal).toBe(tt[1]);

    }

  })
})
