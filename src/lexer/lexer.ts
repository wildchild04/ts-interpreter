import { privateDecrypt } from "crypto";
import { LookupIdent, TType, Token } from "../token/token";

export class Lexer {
  input: string
  position: number
  readPosition: number
  ch: string | ""


  constructor(input: string) {
    this.input = input;
    this.position = 0;
    this.readPosition = 0;
    this.ch = "";
    this.readChar();
  }

  private readChar() {
    if (this.readPosition >= this.input.length) {
      this.ch = ""
    } else {
      this.ch = this.input.charAt(this.readPosition);      
    }

    this.position = this.readPosition;
    this.readPosition++;
  }

  
  public nextToken(): Token {

    let token: Token;

    this.skipWhitespace();
    
    switch (this.ch) {
      case "=":
        if (this.peekChar() === "=") {
          const ch = this.ch;
          this.readChar();
          const literal = ch+this.ch;
          token = {Type: TType.EQ, Literal: literal}
        } else {
          token = {Type: TType.ASSIGN, Literal: this.ch};  
        }
        break;
      case ";":
        token = {Type : TType.SEMICOLON, Literal: this.ch};
        break;
      case "(":
        token = {Type : TType.LPAREN, Literal: this.ch};
        break;
      case ")":
        token = {Type : TType.RPAREN, Literal: this.ch};      
        break;
      case ",":
        token = {Type : TType.COMMA, Literal: this.ch};
        break;
      case "+":
        token = {Type : TType.PLUS, Literal: this.ch};
        break;
      case "-": 
        token = {Type : TType.MINUS, Literal: this.ch};
        break;
      case "*":
        token = {Type : TType.ASTERISK, Literal: this.ch};
        break;
      case "!":
        if(this.peekChar() === "=") {
          const ch = this.ch;
          this.readChar();
          const literal = ch+this.ch;
          token = {Type: TType.NOT_EQ, Literal: literal};
        } else {
          token = {Type : TType.BANG, Literal: this.ch};
        }
        break;
      case "/":
        token = {Type : TType.SLASH, Literal: this.ch};
        break;
      case "<":
        token = {Type: TType.LT, Literal: this.ch};
        break;
      case ">": 
        token = {Type: TType.GT, Literal: this.ch};
        break;
      case "{":
        token = {Type : TType.LBRACER, Literal: this.ch};
        break;
      case "}":
        token = {Type : TType.RBRACER, Literal: this.ch};
        break;
      case "":       
        token = {Type: TType.EOF, Literal: ""};
        break;
      default: 
        if (this.isIdentifierCharacter(this.ch)) {
          
          const literal = this.readIdentifier()
          token = {Type: LookupIdent(literal), Literal: literal}
          return token;
        } else if (this.isDigit(this.ch)) {
          token = {Type: TType.INT, Literal: this.readNumber()};
          return token;        
        } else {
          token = {Type: TType.ILLEGAL, Literal: this.ch};
        }
    } 

    this.readChar();
    return token;
  }

  private readIdentifier(): string {
    const pos = this.position;

    while(this.isIdentifierCharacter(this.ch)) {
      this.readChar();
    }

    return this.input.substring(pos, this.position);
  }

  private readNumber(): string {
    const pos = this.position;

    while(this.isDigit(this.ch)) {
      this.readChar();
    }

    return this.input.substring(pos, this.position);
  }

  private peekChar(): string {
    if (this.readPosition >= this.input.length) {
      return "";
    } else {
      return this.input.charAt(this.readPosition);
    }
  }

  private isIdentifierCharacter(ch: string): boolean {
    return /^[a-zA-Z_]+$/.test(ch);
  }

  private isDigit(ch: string): boolean {
    return /^[0-9]+$/.test(ch);
  }

  private skipWhitespace() {
    while(/\s/.test(this.ch)) {
      this.readChar();
    }
  }
  
}