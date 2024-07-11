import { BlockStatement, Identifier } from "../ast/ast";
import { Environment } from "../environment";

export enum OType {
  INTEGER_OBJ = 'INTEGER',
  BOOLEAN_OBJ = 'BOOLEAN',
  NULL_OBJ = 'NULL',
  RETURN_OBJ = 'RETURN_VALUE',
  ERROR_OBJ = 'ERROR',
  FUNCTION_OBJ = 'FUNCTION',
  STRING_OBJ = 'STRING',
  BUILTIN_OBJ = 'BUILTIN',
  ARRAY_OBJ = "ARRAY",
  HASH_OBJ = "HASH",
};

export type ObjectType = string

export type BuiltinFunction = (...args: Object[]) => Object;

export interface Object {
  getType(): ObjectType;
  inspect(): string;
}

export interface Hashable {
  hashKey(): HashKey;
}

export class Integer implements Object, Hashable {
  value: number;

  constructor(v: number) {
    this.value = v;
  }

  hashKey(): HashKey {
    return new HashKey(this.getType(), this.value);
  }

  public inspect() {
    return `${this.value}`;
  }

  public getType() {
    return OType.INTEGER_OBJ
  }
}


export class Boolean implements Object, Hashable {
  value: boolean;

  constructor(v: boolean) {
    this.value = v;
  }

  hashKey(): HashKey {
    let value: number;

    if (this.value) {
      value = 1;
    } else {
      value = 0;
    }

    return new HashKey(this.getType(), value);
  }

  public inspect() {
    return `${this.value}`;
  }

  public getType() {
    return OType.BOOLEAN_OBJ
  }
}


export class Null {

  constructor() {
  }

  public inspect() {
    return `null`;
  }

  public getType() {
    return OType.BOOLEAN_OBJ
  }
}

export class ReturnValue {
  value: Object;

  constructor(value: Object) {
    this.value = value;
  }

  public inspect() {
    return this.value.inspect();
  }

  public getType() {
    return OType.RETURN_OBJ;
  }

}

export class Error {
  message: string;

  constructor(message: string) {
    this.message = message;
  }


  public inspect() {
    return `ERROR: ${this.message}`;
  }

  public getType() {
    return OType.ERROR_OBJ;
  }

}

export class Function {
  parameters: Identifier[]
  body: BlockStatement
  env: Environment

  constructor(parameters: Identifier[], body: BlockStatement, env: Environment) {
    this.parameters = parameters;
    this.body = body;
    this.env = env;
  }

  public inspect() {

    let out = '';

    let params: string[] = [];

    for (let param of this.parameters) {
      params.push(param.string())
    }

    out += 'fn';
    out += '(';
    out += params.join(", ");
    out += ') {\n'
    out += this.body.string();
    out += '\n}';

    return out;
  }

  public getType() {
    return OType.FUNCTION_OBJ;
  }

}
export class String implements Object, Hashable {
  value: string

  constructor(s: string) {
    this.value = s;
  }

  hashKey(): HashKey {
    const str = this.value;
    let hash = 5381; // Initial seed value
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      // hash * 33 + char
      hash = ((hash << 5) + hash) + char;
      // Convert to 32bit integer
      hash = hash & hash;
    }
    return new HashKey(this.getType(), hash >>> 0); // Ensure the hash is non-negative
  }

  getType() {
    return OType.STRING_OBJ;
  }

  inspect() {
    return this.value;
  }

}

export class Array implements Object {
  elements: Object[]

  constructor(e: Object[]) {
    this.elements = e;
  }

  getType(): string {
    return OType.ARRAY_OBJ;
  }

  inspect(): string {
    let out = '';

    out += '[';
    out += this.elements.map(e => e.inspect()).join(', ');
    out += ']';

    return out;
  }

}

export class Builtin implements Object {
  fn: BuiltinFunction

  constructor(fn: BuiltinFunction) {
    this.fn = fn;
  }

  getType(): string {
    return OType.BUILTIN_OBJ;
  }
  inspect(): string {
    return "builtin function";
  }

}

export class HashKey {
  type: OType;
  value: number;

  constructor(t: OType, v: number) {
    this.type = t;
    this.value = v;
  }
}

export class HashPair {
  key: Object;
  value: Object;

  constructor(k: Object, v: Object) {
    this.key = k;
    this.value = v;
  }
}
export class Hash implements Object {
  pairs: Map<number, HashPair>

  constructor(p?: Map<number, HashPair>) {

    if (p) {
      this.pairs = p;
    } else {
      this.pairs = new Map();
    }
  }
  getType() {
    return OType.HASH_OBJ;
  }

  public inspect() {
    let out = '';

    let pairs = this.pairs.values();
    let pair = pairs.next();
    out += '{';
    while (!pair.done) {
      out += `"${pair.value.key.inspect()}": "${pair.value.value.inspect()}"`
      pair = pairs.next();
    }

    out += '}';

    return out;
  }
}


