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

export class IntegerLiteral implements Expression {
  
  token: Token
  value: number

  constructor(t: Token, v: number) {
    this.token = t;
    this.value = v;  
  }
  
  public tokenLiteral(): string | number {
    return this.token.literal;
  }

  
  public string(): string {
    return `${this.token.literal}`;
  }
  
}

export class PrefixExpression implements Expression {
  token: Token
  operator: string
  right: Expression

  constructor(t: Token, o: string, r: Expression) {
    this.token = t;
    this.operator = o;
    this.right = r;
  }
  
  public tokenLiteral(): string | number {
    return this.token.literal;
  }
  public string(): string {
    let out = "";

    out += "(";
    out += this.operator;
    out += this.right.string();
    out += ")";

    return out;
  }
    
}

export class InfixExpression implements Expression {

  token: Token
  left: Expression
  operator: string
  right: Expression

  constructor(t: Token, l: Expression, o: string, r: Expression) {
    this.token = t;
    this.left = l;
    this.operator = o;
    this.right = r;
  }
  
  public tokenLiteral(): string | number {
    return this.token.literal;
  }
  
  public string(): string {
    let out = "";

    out += "(";
    out += this.left.string();
    out += " " + this.operator + " ";
    out += this.right.string();
    out += ")";

    return out;
  }
  
}

export class Boolean implements Expression {
  token: Token
  value: boolean

  constructor(t: Token, v: boolean) {
    this.token = t;
    this.value = v;
  }
  
  public tokenLiteral(): string | number {
    return this.token.literal;
  }
  public string(): string {
    return `${this.token.literal}`;
  }
}

export class IfExpression implements Expression {
  token: Token
  condition: Expression
  consequence: BlockStatement
  alternative?: BlockStatement 

  constructor(t: Token, c: Expression, con: BlockStatement, alt?: BlockStatement) {
    this.token = t;
    this.condition = c;
    this.consequence = con;
    this.alternative = alt;
  }
  
  public tokenLiteral(): string | number {
    return this.token.literal;
  }
  
  public string(): string {
    let out = "";

    out += "if";
    out += this.condition.string();
    out += " ";
    out += this.consequence.string();

    if (this.alternative !== undefined) {
      out += "else ";
      out += this.alternative.string();
    }

    return out;
  }

  
}

export class BlockStatement implements Statement {
  token: Token
  statements: Array<Statement>

  constructor(t: Token, s: Array<Statement>) {
    this.token = t;
    this.statements = s;
  }
  
  public tokenLiteral(): string | number {
    return this.token.literal;
  }
  
  public string(): string {
    return this.statements.map( (s) => s.string()).join("");
  }
}

export class FunctionLiteral implements Expression {
  token: Token
  parameters: Array<Identifier>
  body: BlockStatement

  constructor(t: Token, p: Array<Identifier>, b: BlockStatement) {
    this.token = t;
    this.parameters = p;
    this.body = b;
  }
  
  public tokenLiteral(): string | number {
    return this.token.literal;
  }

  public string(): string {
    let out = `${this.tokenLiteral()}`;
    out += "(";
    out += this.parameters.map((p) => p.string()).join(", ");
    out += ") ";
    out += this.body.string();
    return out;
  }

  
}

export class CallExpression implements Expression {
  token: Token
  function: Expression
  arguments: Array<Expression>

  constructor(t: Token, f: Expression, a: Array<Expression>) {
    this.token = t;
    this.function = f;
    this.arguments = a;
  }
  
  public tokenLiteral(): string | number {
    return this.token.literal;
  }
  
  public string(): string {
    let out = "";
    out += this.function.string();
    out += "(";
    out += this.arguments.map((s) => s.string()).join(",");
    out += ")";
    return out;
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