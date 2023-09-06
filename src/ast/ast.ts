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
    return `${this.value}`;
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
    let out = "";
    out += this.tokenLiteral();
    out += " ";
    out += this.name.string();
    out += " = ";

    if (this.value !== undefined) {
      out += this.value.string();
    } 

    out += ";";

    return out;
  }

}

export class ReturnStatement implements Statement {

  token: Token
  returnValue?: Expression 


  constructor(t: Token, v?: Expression) {
    this.token = t;
    this.returnValue = v;
  }
  
  public tokenLiteral(): string | number {
    return this.token.literal;
  }

  public string(): string {
    let out = "";

    out += this.tokenLiteral();
    out += " ";

    if (this.returnValue !== undefined) {
      out += this.returnValue.string();
    }

    out += ";";

    return out;
  }
  
}

export class ExpressionStatement implements Statement {
  token: Token
  expression?: Expression

  constructor(t: Token, e?: Expression) {
    this.token = t;
    this.expression = e;
  }
  
  public tokenLiteral(): string | number {
    return this.token.literal;
  }
  
  public string(): string {
    if (this.expression !== undefined) {
      return this.expression.string();
    }
    return "";
  }
}

export class Program implements Node {
  statements: Statement[] = [];

  
  public string(): string {
    return this.statements.map((s) => s.string()).join("");
  }
  
  
  public tokenLiteral() {
    if (this.statements.length > 0) {
      return this.statements[0].tokenLiteral();
    } else {
      return "";
    }
  }
  
} 