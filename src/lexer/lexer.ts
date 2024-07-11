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
          const literal = ch + this.ch;
          token = { type: TType.EQ, literal: literal }
        } else {
          token = { type: TType.ASSIGN, literal: this.ch };
        }
        break;
      case ";":
        token = { type: TType.SEMICOLON, literal: this.ch };
        break;
      case "(":
        token = { type: TType.LPAREN, literal: this.ch };
        break;
      case ")":
        token = { type: TType.RPAREN, literal: this.ch };
        break;
      case ",":
        token = { type: TType.COMMA, literal: this.ch };
        break;
      case "+":
        token = { type: TType.PLUS, literal: this.ch };
        break;
      case "-":
        token = { type: TType.MINUS, literal: this.ch };
        break;
      case "*":
        token = { type: TType.ASTERISK, literal: this.ch };
        break;
      case "!":
        if (this.peekChar() === "=") {
          const ch = this.ch;
          this.readChar();
          const literal = ch + this.ch;
          token = { type: TType.NOT_EQ, literal: literal };
        } else {
          token = { type: TType.BANG, literal: this.ch };
        }
        break;
      case "/":
        token = { type: TType.SLASH, literal: this.ch };
        break;
      case "<":
        token = { type: TType.LT, literal: this.ch };
        break;
      case ">":
        token = { type: TType.GT, literal: this.ch };
        break;
      case "{":
        token = { type: TType.LBRACER, literal: this.ch };
        break;
      case "}":
        token = { type: TType.RBRACER, literal: this.ch };
        break;
      case "":
        token = { type: TType.EOF, literal: "" };
        break;
      case '"':
        token = { type: TType.STRING, literal: this.readString() }
        break;
      case '[':
        token = { type: TType.LBRACKET, literal: this.ch };
        break;
      case ']':
        token = { type: TType.RBRACKET, literal: this.ch };
        break;
      case ':':
        token = { type: TType.COLON, literal: this.ch };
        break;
      default:
        if (this.isIdentifierCharacter(this.ch)) {

          const literal = this.readIdentifier()
          token = { type: LookupIdent(literal), literal: literal }
          return token;
        } else if (this.isDigit(this.ch)) {
          token = { type: TType.INT, literal: this.readNumber() };
          return token;
        } else {
          token = { type: TType.ILLEGAL, literal: this.ch };
        }
    }

    this.readChar();
    return token;
  }

  private readString(): string {
    const position = this.position + 1;

    while (true) {
      this.readChar();
      if (this.ch == '"' || this.ch.length == 0) {
        break;
      }
    }

    return this.input.substring(position, this.position);
  }

  private readIdentifier(): string {
    const pos = this.position;

    while (this.isIdentifierCharacter(this.ch)) {
      this.readChar();
    }

    return this.input.substring(pos, this.position);
  }

  private readNumber(): string {
    const pos = this.position;

    while (this.isDigit(this.ch)) {
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
    while (/\s/.test(this.ch)) {
      this.readChar();
    }
  }

}
