
export type TokenType = string


export type Token = {
  Type: TokenType
  Literal: string
}


export enum TType {
  ILLEGAL = "ILLEGAL",
  EOF = "EOF",
  IDENT = "IDENT",
  INT = "INT",
  ASSIGN = "=",
  PLUS  = "+",
  MINUS = "-",
  BANG = "!",
  ASTERISK = "*",
  SLASH = "/",
  COMMA = ",", 
  SEMICOLON = ";",
  LT = "<",
  GT = ">",
  LPAREN = "(",
  RPAREN = ")",
  LBRACER = "{",
  RBRACER = "}",
  FUNCTION = "FUNCTION",
  LET = "LET",
  TRUE = "TRUE",
  FALSE = "FALSE",
  IF = "IF",
  ELSE = "ELSE",
  RETURN = "RETURN",
  EQ = "==",
  NOT_EQ = "!=",
}


const keyword: ReadonlyMap<string, TokenType> = new Map([
  ["fn", TType.FUNCTION],
  ["let", TType.LET],
  ["true", TType.TRUE],
  ["false", TType.FALSE],
  ["if", TType.IF],
  ["else", TType.ELSE],
  ["return", TType.RETURN],
]);


export const LookupIdent = (ident: string): TokenType =>  {
  const token = keyword.get(ident);
  if (token != undefined) {
    return token;
  } 
  return TType.IDENT;
}

