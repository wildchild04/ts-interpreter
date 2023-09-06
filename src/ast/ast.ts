import { Token } from "../token/token";


interface Node {
  tokenLiteral(): string | number;
  string(): string;
}

export interface Statement extends Node {}

export interface Expression extends Node {}


export class Identifier implements Expression {

  token: Token;
  value: string | number;

  constructor(t: Token, v: string|number) {
    this.token = t;
    this.value = v; 
  }

  
  public string() {
    return ""
  }
  
  public tokenLiteral() {
    return this.token.literal;
  }
  
}

export class LetStatement implements Statement {
  token: Token;
  name: Identifier 
  value?: Identifier | Expression

  constructor(t: Token, n: Identifier, v?: Identifier | Expression) {
    this.token = t;
    this.name = n; 
    this.value = v;
  }

    
  public tokenLiteral(): string | number {
    return this.token.literal;
  }
  public string(): string {
      throw new Error("Method not implemented.");
  }

}

export class ReturnStatement implements Statement {

  token: Token
  returnValue?: Expression 


  constructor(t: Token, v?: Expression) {
    this.token = t;
    this.returnValue = v;
  }
  
  tokenLiteral(): string | number {
    return this.token.literal;
  }

  string(): string {
      throw new Error("Method not implemented.");
  }
  
}

export class Program implements Node {
  statements: Statement[] = [];

  
  public string(): string {
      throw new Error("Method not implemented.");
  }
  
  public tokenLiteral() {
    if (this.statements.length > 0) {
      return this.statements[0].tokenLiteral();
    } else {
      return "";
    }
  }
  
} 