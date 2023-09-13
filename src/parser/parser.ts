import { Expression, ExpressionStatement, Identifier, InfixExpression, IntegerLiteral, LetStatement, PrefixExpression, Program, ReturnStatement, Statement, Boolean, BlockStatement, IfExpression, FunctionLiteral, CallExpression } from "../ast/ast";
import { Lexer } from "../lexer/lexer";
import { TType, Token, TokenType } from "../token/token";


const NEXT_TOKEN_ERR = "expected next token to be";

enum PRE {
  LOWEST,
  EQUALS,
  LESSGREATER,
  SUM,
  PRODUCT,
  PREFIX,
  CALL,
}

const precedences: ReadonlyMap<TokenType, number> = new Map([
  [TType.EQ, PRE.EQUALS],
  [TType.NOT_EQ, PRE.EQUALS],
  [TType.LT, PRE.LESSGREATER],
  [TType.GT, PRE.LESSGREATER],
  [TType.PLUS, PRE.SUM],
  [TType.MINUS, PRE.SUM],
  [TType.SLASH, PRE.PRODUCT],
  [TType.ASTERISK, PRE.PRODUCT],
  [TType.LPAREN, PRE.CALL],
]);

export class Parser {
  lexer: Lexer
  curToken: Token
  peekToken: Token
  prefixParserFns: Map<TokenType, Function>
  infixParseFns: Map<TokenType, Function>

  constructor(l: Lexer) {
    this.lexer = l;
    this.curToken = l.nextToken();
    this.peekToken = l.nextToken();
    this.prefixParserFns = new Map();
    this.infixParseFns = new Map();

    this.registerPrefix(TType.IDENT, this.parseIdentifier);
    this.registerPrefix(TType.INT, this.parseIntegerLiteral);
    this.registerPrefix(TType.BANG, this.parsePrefixExpression);
    this.registerPrefix(TType.MINUS, this.parsePrefixExpression);
    this.registerPrefix(TType.TRUE, this.parseBoolean);
    this.registerPrefix(TType.FALSE, this.parseBoolean);
    this.registerPrefix(TType.LPAREN, this.parseGroupExpression);
    this.registerPrefix(TType.IF, this.parseIfExpression);
    this.registerPrefix(TType.FUNCTION, this.parseFunctionLiteral);

    this.registerInfix(TType.PLUS, this.parseInfixExpression);
    this.registerInfix(TType.MINUS, this.parseInfixExpression);
    this.registerInfix(TType.SLASH, this.parseInfixExpression);
    this.registerInfix(TType.ASTERISK, this.parseInfixExpression);
    this.registerInfix(TType.EQ, this.parseInfixExpression);
    this.registerInfix(TType.NOT_EQ, this.parseInfixExpression);
    this.registerInfix(TType.LT, this.parseInfixExpression);
    this.registerInfix(TType.GT, this.parseInfixExpression);
    this.registerInfix(TType.LPAREN, this.parseCallExpression);

  }

  public parseNextToken() {
    this.curToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  public parseProgram(): Program {
    const program = new Program();

    while (this.curToken.type != TType.EOF) {
      const stmt = this.parseStatement();
      if (stmt != null) {
        program.statements.push(stmt);
      }
      this.parseNextToken();
    }

    return program;
  }

  public parseStatement(): Statement {

    switch (this.curToken.type) {
      case TType.LET:
        return this.parseLetStatement();
      case TType.RETURN:
        return this.parseReturnStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  private parseLetStatement(): Statement {
    const letToken = this.curToken;

    if (!this.expectPeek(TType.IDENT)) {
      throw new Error(`${NEXT_TOKEN_ERR} '${TType.IDENT}'`);
    }

    const identToken = this.curToken;

    if (!this.expectPeek(TType.ASSIGN)) {
      throw new Error(`${NEXT_TOKEN_ERR} '${TType.ASSIGN}'`);
    }

    // while (!this.curTokenIs(TType.SEMICOLON)) {
    //   this.parseNextToken();
    // }
    this.parseNextToken();
    let valueToken = this.parseExpression(PRE.LOWEST);

    if (this.peekTokenIs(TType.SEMICOLON)) {
      this.parseNextToken();
    }


    return new LetStatement(letToken, new Identifier(identToken, identToken.literal), valueToken);

  }

  private parseReturnStatement(): Statement {
    let returnToken = this.curToken;

    this.parseNextToken();

    let valueToken = this.parseExpression(PRE.LOWEST);

    if (this.peekTokenIs(TType.SEMICOLON)) {
      this.parseNextToken();
    }

    return new ReturnStatement(returnToken, valueToken);
  }

  private parseExpressionStatement(): Statement {

    const stmt = new ExpressionStatement(this.curToken, this.parseExpression(PRE.LOWEST));
    if (this.peekTokenIs(TType.SEMICOLON)) {
      this.parseNextToken();
    }

    return stmt;
  }

  private parseExpression(precedence: number): Expression {
    const prefix = this.prefixParserFns.get(this.curToken.type);

    if (prefix !== undefined) {
      let leftExp = prefix(this.curToken, this);

      while (!this.peekTokenIs(TType.SEMICOLON) && precedence < this.peekPrecedence()) {
        const infix = this.infixParseFns.get(this.peekToken.type);
        if (infix === undefined) {
          return leftExp;
        }

        this.parseNextToken();
        leftExp = infix(this.curToken, this, leftExp);

      }

      return leftExp;
    } else {
      throw new Error(`No function avaiable to parser ${this.curToken.type}`);
    }
  }

  private curTokenIs(t: TokenType): boolean {
    return this.curToken.type === t;
  }

  private peekTokenIs(t: TokenType): boolean {
    return this.peekToken.type === t;
  }

  private expectPeek(t: TokenType): boolean {
    if (this.peekTokenIs(t)) {
      this.parseNextToken()
      return true;
    } else {
      return false;
    }
  }

  private registerPrefix(t: TokenType, fn: Function) {
    this.prefixParserFns.set(t, fn);
  }

  private registerInfix(t: TokenType, fn: Function) {
    this.infixParseFns.set(t, fn);
  }

  private parseIdentifier(t: Token): Expression {
    return new Identifier(t, t.literal);
  }

  private parseIntegerLiteral(t: Token): Expression {
    return new IntegerLiteral(t, typeof t.literal === "string" ? parseInt(t.literal) : t.literal);
  }

  private parsePrefixExpression(t: Token, p: Parser): Expression {

    p.parseNextToken();

    return new PrefixExpression(t, `${t.literal}`, p.parseExpression(PRE.PREFIX));
  }

  private peekPrecedence(): number {
    const p = precedences.get(this.peekToken.type);

    return p !== undefined ? p : PRE.LOWEST;
  }

  private curPrecedence(): number {

    const p = precedences.get(this.curToken.type);

    return p !== undefined ? p : PRE.LOWEST;
  }

  private parseInfixExpression(t: Token, p: Parser, left: Expression): Expression {
    const precedence = p.curPrecedence();
    p.parseNextToken();
    const rightExp = p.parseExpression(precedence);

    return new InfixExpression(t, left, `${t.literal}`, rightExp);
  }

  private parseBoolean(t: Token, p: Parser): Expression {
    return new Boolean(t, p.curTokenIs(TType.TRUE));
  }

  private parseGroupExpression(t: Token, p: Parser): Expression | null {
    p.parseNextToken();
    let exp = p.parseExpression(PRE.LOWEST);

    if (!p.expectPeek(TType.RPAREN)) {
      return null;
    }

    return exp;
  }

  private parseIfExpression(ifToken: Token, p: Parser): Expression {

    if (!p.expectPeek(TType.LPAREN)) {
      throw new Error(`expect ${TType.LPAREN}`);
    }

    p.parseNextToken();
    const expCondition = p.parseExpression(PRE.LOWEST);

    if (!p.expectPeek(TType.RPAREN)) {
      throw Error(`expected ${TType.RPAREN}`);
    }

    if (!p.expectPeek(TType.LBRACER)) {
      throw Error(`expected ${TType.LBRACER}`);
    }

    const expConsequence = p.parseBlockStatement(p.curToken, p);
    let expAlternative;
    if (p.peekTokenIs(TType.ELSE)) {
      p.parseNextToken();

      if (!p.expectPeek(TType.LBRACER)) {
        throw Error(`Expected ${TType.LBRACER}`);
      }

      expAlternative = p.parseBlockStatement(p.curToken, p);

    }

    return new IfExpression(ifToken, expCondition, expConsequence, expAlternative);
  }

  private parseBlockStatement(t: Token, p: Parser): BlockStatement {

    p.parseNextToken();
    const stmtList = new Array<Statement>();

    while (!p.curTokenIs(TType.RBRACER) && !p.curTokenIs(TType.EOF)) {

      stmtList.push(p.parseStatement());
      p.parseNextToken();
    }

    return new BlockStatement(t, stmtList);
  }

  private parseFunctionLiteral(t: Token, p: Parser): Expression {

    if (!p.expectPeek(TType.LPAREN)) {
      throw new Error(`Expected ${TType.LPAREN}`);
    }

    const params = p.parseFuntionParameters(t, p);

    if (!p.expectPeek(TType.LBRACER)) {
      throw new Error(`Expected ${TType.LPAREN}`);
    }

    const body = p.parseBlockStatement(p.curToken, p);

    return new FunctionLiteral(t, params, body);
  }

  private parseFuntionParameters(t: Token, p: Parser): Array<Identifier> {

    const identifiers: Array<Identifier> = [];

    if (p.peekTokenIs(TType.RPAREN)) {
      p.parseNextToken();
      return identifiers;
    }

    p.parseNextToken();

    identifiers.push(new Identifier(p.curToken, p.curToken.literal));

    while (p.peekTokenIs(TType.COMMA)) {

      p.parseNextToken();
      p.parseNextToken();

      identifiers.push(new Identifier(p.curToken, p.curToken.literal));
    }

    if (!p.expectPeek(TType.RPAREN)) {
      throw new Error(`expected ${TType.RPAREN}`);
    }

    return identifiers;

  }

  private parseCallExpression(t: Token, p: Parser, fn: Expression): Expression {
    return new CallExpression(t, fn, p.parseCallArguments(p));
  }

  private parseCallArguments(p: Parser): Array<Expression> {
    const args: Array<Expression> = [];

    if (p.peekTokenIs(TType.RPAREN)) {
      p.parseNextToken();
      return args;
    }

    p.parseNextToken();
    args.push(p.parseExpression(PRE.LOWEST));

    while (p.peekTokenIs(TType.COMMA)) {
      p.parseNextToken();
      p.parseNextToken();
      args.push(p.parseExpression(PRE.LOWEST));
    }

    if (!p.expectPeek(TType.RPAREN)) {
      throw new Error(`Expected token ${TType.RPAREN}`);
    }

    return args;
  }
}
