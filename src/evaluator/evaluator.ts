import { ArrayLiteral, BlockStatement, BooleanLiteral, CallExpression, Expression, ExpressionStatement, FunctionLiteral, HashLiteral, Identifier, IfExpression, IndexExpression, InfixExpression, IntegerLiteral, LetStatement, Node, PrefixExpression, Program, ReturnStatement, Statement, StringLiteral } from '../ast/ast'
import { EnclosedEnvironement, Environment } from '../environment';
import { Boolean, Integer, Null, OType, Object, ReturnValue, Error, Function, String, Builtin, Array, HashKey, HashPair, Hashable, Hash } from '../object/object';
import { builtins } from './builtins';

export const TRUE = new Boolean(true);
export const FALSE = new Boolean(false);
export const NULL = new Null();

export function evaluateNode(node: Node, env: Environment): Object | null {
  if (node instanceof Program) {
    return evalProgram(node, env);
  }

  if (node instanceof ExpressionStatement) {
    if (node.expression != undefined) {
      return evaluateNode(node.expression, env);
    } else {
      return new Error("expression missing");
    }
  }

  if (node instanceof IntegerLiteral) {
    return new Integer(node.value);
  }

  if (node instanceof BooleanLiteral) {
    return node.value ? TRUE : FALSE;
  }

  if (node instanceof PrefixExpression) {
    const right = evaluateNode(node.right, env);

    if (right != null) {

      if (right instanceof Error) {
        return right;
      }

      const exp = evalPrefixExpression(node.operator, right);
      return exp;
    }

  }

  if (node instanceof InfixExpression) {
    const left = evaluateNode(node.left, env);
    const right = evaluateNode(node.right, env);

    if (left != null && right != null) {

      if (left instanceof Error) {
        return left;
      }

      if (right instanceof Error) {
        return right;
      }

      return evalInfixExpression(node.operator, left, right);
    }
  }

  if (node instanceof BlockStatement) {
    return evalBlockStatement(node, env);
  }

  if (node instanceof IfExpression) {
    return evalIfExpression(node, env);
  }

  if (node instanceof ReturnStatement) {
    if (node.returnValue != undefined) {

      const val = evaluateNode(node.returnValue, env);
      if (val != null) {
        if (val instanceof Error) {
          return val;
        }
        return new ReturnValue(val);
      }
    }
  }

  if (node instanceof LetStatement) {
    const val = evaluateNode(node.value, env);

    if (val != null) {

      if (val instanceof Error) {
        return val;
      }

      env.set(`${node.name.value}`, val)
    }
  }

  if (node instanceof Identifier) {
    if (env) {
      return evalIdentifier(node, env)
    }
  }
  if (node instanceof FunctionLiteral) {

    return new Function(node.parameters, node.body, env)
  }

  if (node instanceof CallExpression) {
    const func = evaluateNode(node.function, env);

    if (func != null) {

      if (func instanceof Error) {
        return func;
      }
      const args = evalExpressions(node.arguments, env)

      if (args.length === 1 && args[0] instanceof Error) {
        return args[0];
      }

      return applyFunction(func, args);
    }
  }

  if (node instanceof StringLiteral) {

    return new String(node.value);
  }

  if (node instanceof ArrayLiteral) {
    const elements = evalExpressions(node.elements, env)
    if (elements.length == 1 && elements[0] instanceof Error) {
      return elements[0];
    }

    return new Array(elements);
  }

  if (node instanceof IndexExpression) {
    const left = evaluateNode(node.left, env);

    if (left instanceof Error) {
      return left;
    }

    const index = evaluateNode(node.index, env);

    if (index instanceof Error) {
      return index;
    }

    if (left != null && index != null) {

      return evalIndexExpression(left, index);
    }
  }

  if (node instanceof HashLiteral) {
    return evalHashLiteral(node, env);
  }

  return null;
}



function evalPrefixExpression(operator: string, right: Object) {
  switch (operator) {
    case '!':
      return evalBangOperatorExpression(right);
    case '-':
      return evalMinusPrefixOperatorExpression(right);
  }

  return new Error(`unknown operator: ${operator}${right.getType()}`)
}

function evalBangOperatorExpression(right: Object): Object {

  switch (right) {
    case TRUE:
      return FALSE;
    case FALSE:
      return TRUE;
    case NULL:
      return TRUE;
    default:
      return FALSE;
  }
}

function evalMinusPrefixOperatorExpression(right: Object): Object {
  if (right.getType() != OType.INTEGER_OBJ) {
    return new Error(`unknown operator: -${right.getType()}`);
  }

  if (right instanceof Integer) {
    return new Integer(-right.value)
  }

  return NULL;
}

function evalInfixExpression(operator: string, left: Object, right: Object): Object {

  if (left.getType() === OType.INTEGER_OBJ && right.getType() === OType.INTEGER_OBJ) {
    return evalIntegerInfixExpression(operator, left, right);
  }

  if (left.getType() === OType.STRING_OBJ && right.getType() === OType.STRING_OBJ) {
    return evalStringInfixExpression(operator, left, right);
  }

  if (operator === '==') {
    return left === right ? TRUE : FALSE;
  }

  if (operator === '!=') {
    return left !== right ? TRUE : FALSE;
  }

  if (left.getType() !== right.getType()) {
    return new Error(`type mismatch: ${left.getType()} ${operator} ${right.getType()}`);
  }
  return new Error(`unknown operator: ${left.getType()} ${operator} ${right.getType()}`);
}


function evalIntegerInfixExpression(operator: string, left: Object, right: Object): Object {

  if (left instanceof Integer && right instanceof Integer) {
    const leftVal = left.value;
    const rightVal = right.value;
    switch (operator) {
      case '+':
        return new Integer(leftVal + rightVal);
      case '-':
        return new Integer(leftVal - rightVal);
      case '*':
        return new Integer(leftVal * rightVal);
      case '/':
        return new Integer(leftVal / rightVal);
      case '<':
        return leftVal < rightVal ? TRUE : FALSE;
      case '>':
        return leftVal > rightVal ? TRUE : FALSE;
      case '==':
        return leftVal == rightVal ? TRUE : FALSE;
      case '!=':
        return leftVal != rightVal ? TRUE : FALSE;
    }
  }

  return new Error(`unknown operator: ${left.getType()} ${operator} ${right.getType()}`);
}


function evalIfExpression(ifExp: IfExpression, env: Environment): Object {
  const condition = evaluateNode(ifExp.condition, env);
  if (condition != null) {

    if (condition instanceof Error) { }
    let res: Object | null;
    if (condition != null) {
      res = evaluateNode(ifExp.consequence, env);
    } else if (ifExp.alternative != undefined) {
      res = evaluateNode(ifExp.alternative, env);
    } else {
      res = NULL;
    }
    return res != null ? res : NULL;
  } else {
    return NULL

  }

}

function evalProgram(program: Program, env: Environment): Object {
  let result: Object | null = null;

  for (let statement of program.statements) {
    result = evaluateNode(statement, env);

    if (result instanceof ReturnValue) {
      return result.value;
    }

    if (result instanceof Error) {
      return result;
    }
  }
  if (result != null) {

    return result;
  }

  return NULL;
}

function evalBlockStatement(block: BlockStatement, env: Environment): Object {
  let result: Object | null = null;

  for (let statement of block.statements) {
    result = evaluateNode(statement, env);

    if (result?.getType() === OType.RETURN_OBJ || result?.getType() === OType.ERROR_OBJ) {
      return result;
    }
  }

  if (result != null) {
    return result;
  }

  return NULL;
}


function evalIdentifier(node: Identifier, env: Environment): Object {
  let val = env.get(`${node.value}`);

  if (val != undefined) {
    return val;
  }

  val = builtins.get(`${node.value}`)

  if (val) {
    return val;
  }

  return new Error(`identifier not found: ${node.value}`);
}

function evalExpressions(exp: Expression[], env: Environment): Object[] {
  const result: Object[] = [];

  for (let expression of exp) {
    const evaluated = evaluateNode(expression, env);
    if (evaluated != null) {
      if (evaluated instanceof Error) {
        return [evaluated];
      }
      result.push(evaluated);
    }
  }

  return result;
}

function applyFunction(fn: Object, args: Object[]): Object {
  if (fn instanceof Function) {

    let extendedEnv = extendFunctionEnv(fn, args);
    let evaluated = evaluateNode(fn.body, extendedEnv);
    if (evaluated != null) {
      return unwrapReturnValue(evaluated);
    }
  }

  if (fn instanceof Builtin) {
    return fn.fn(...args);
  }

  return new Error(`not a function: ${fn.getType()}`)
}

function extendFunctionEnv(fn: Function, args: Object[]): Environment {
  const env = new EnclosedEnvironement(fn.env);
  let paramId = 0;
  for (let param of fn.parameters) {
    env.set(`${param.value}`, args[paramId++])
  }

  return env;
}

function unwrapReturnValue(obj: Object): Object {
  if (obj instanceof ReturnValue) {
    return obj.value;
  }

  return obj;
}

function evalStringInfixExpression(operator: string, left: Object, right: Object): Object {
  if (operator !== "+") {
    return new Error(`unknown operator: ${left.getType()} ${operator} ${right.getType()}`);
  }
  if (left instanceof String && right instanceof String) {
    return new String(left.value + right.value);
  }
  return new Error(`unknown String operation`);
}

function evalIndexExpression(left: Object, index: Object): Object {
  if (left.getType() == OType.ARRAY_OBJ && index.getType() == OType.INTEGER_OBJ) {
    return evalArrayIndexExpression(left, index);
  }

  if (left.getType() == OType.HASH_OBJ) {
    return evalHashIndexExpression(left, index);
  }

  return new Error(`index operator not supported: ${left.getType()}`)
}

function evalArrayIndexExpression(array: Object, index: Object): Object {

  if (array instanceof Array && index instanceof Integer) {
    const idx = index.value;
    const max = array.elements.length - 1;

    if (idx < 0 || idx > max) {
      return NULL;
    }

    return array.elements[idx];
  }
  return NULL;
}

function evalHashLiteral(node: HashLiteral, env: Environment): Object {
  const pairs: Map<number, HashPair> = new Map();

  const nodePairs = node.pairs.entries();
  let nodePair = nodePairs.next();

  while (!nodePair.done) {
    const key = evaluateNode(nodePair.value[0], env);

    if (key instanceof Error) {
      return key;
    }
    let hashed: HashKey;
    if (!(key instanceof String || key instanceof Boolean || key instanceof Integer)) {
      return new Error(`unusable as hash key: ${key?.getType()}`)
    } else {
      hashed = key.hashKey();
    }

    const value = evaluateNode(nodePair.value[1], env);

    if (value != null) {

      pairs.set(hashed.value, new HashPair(key, value))
    }


    nodePair = nodePairs.next();
  }

  return new Hash(pairs);

}

function evalHashIndexExpression(hash: Object, index: Object) {

  let key: Hashable;
  let hashObject: Hash | null;

  if (hash instanceof Hash) {
    hashObject = hash;
  } else {
    hashObject = null;
  }
  if (index instanceof String || index instanceof Integer || index instanceof Boolean) {
    key = index;
  } else {
    return new Error(`unusable as hash key: ${index.getType()}`)
  }

  if (hashObject !== null) {
    const pair = hashObject.pairs.get(key.hashKey().value);

    return pair !== undefined ? pair.value : NULL;
  } else {
    return NULL;
  }
}
