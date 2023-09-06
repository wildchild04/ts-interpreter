import { Expression, ExpressionStatement, Identifier, LetStatement, Program, ReturnStatement, Statement } from "../ast/ast";
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
  }

  public parseNextToken() {
    this.curToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  public parseProgram(): Program {
    const program = new Program();

    while (this.curToken.type != TType.EOF) {
      const stmt = this.parseStatement();
      if(stmt != null) {
        program.statements.push(stmt);
      }
      this.parseNextToken();
    }

    return program;
  }

  public parseStatement(): Statement {

    switch(this.curToken.type) {
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

    if (!this.expectToken(TType.IDENT)) {
      throw new Error(`${NEXT_TOKEN_ERR} '${TType.IDENT}'`);
    }

    const identToken = this.curToken;

    if (!this.expectToken(TType.ASSIGN)) {
      throw new Error(`${NEXT_TOKEN_ERR} '${TType.ASSIGN}'`);
    }

    while(!this.curTokenIs(TType.SEMICOLON)) {
      this.parseNextToken();
    }

    return new LetStatement(letToken, new Identifier(identToken, identToken.literal));
    
  }

  private parseReturnStatement(): Statement {
    let returnToken = this.curToken;

    this.parseNextToken();

    while(!this.curTokenIs(TType.SEMICOLON)) {
      this.parseNextToken();
    }

    return new ReturnStatement(returnToken);
  }

  private parseExpressionStatement(): Statement {
    
    const stmt = new ExpressionStatement(this.curToken, this.parseExpression(PRE.LOWEST)); 
    if (this.peekTokenIs(TType.SEMICOLON)) {
      this.parseNextToken();
    }

    return stmt;
  }

  private parseExpression(precedence: number): Expression {
    let prefix = this.prefixParserFns.get(this.curToken.type);

    if (prefix !== undefined) {
      return prefix(this.curToken);
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

  private expectToken(t: TokenType): boolean {
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
      
}