import { Builtin, Error, Integer, String, Object, OType, Array } from "../object/object";
import { NULL } from "./evaluator";

export const builtins: Map<string, Builtin> = new Map([
  ['len', new Builtin((...args: Object[]) => {

    if (args.length != 1) {
      return new Error(`wrong number of arguments. got = ${args.length}, want = 1`);
    }

    const arg = args[0];

    if (arg instanceof String) {
      return new Integer(arg.value.length);
    }

    return new Error(`argument to \`len\` not supported, got ${arg.getType()}`)

  })],
  ['first', new Builtin((...args: Object[]) => {
    if (args.length != 1) {
      return new Error(`wrong number of arguments. got=${args.length} want = 1`)
    }

    if (args[0].getType() != OType.ARRAY_OBJ) {
      return new Error(`argumetns to \`first\` must be ARRAY, got ${args[0].getType()}`);
    }

    if (args[0] instanceof Array) {
      if (args[0].elements.length > 0) {

        return args[0].elements[0];
      }
    }

    return NULL;
  })],
  ['last', new Builtin((...args: Object[]) => {

    if (args.length != 1) {
      return new Error(`wrong number of arguments. got=${args.length} want = 1`)
    }

    if (args[0].getType() != OType.ARRAY_OBJ) {
      return new Error(`argumetns to \`last\` must be ARRAY, got ${args[0].getType()}`);
    }

    if (args[0] instanceof Array) {
      if (args[0].elements.length > 0) {
        return args[0].elements[args[0].elements.length - 1];
      }
    }

    return NULL;
  })],
  ['rest', new Builtin((...args: Object[]) => {

    if (args.length != 1) {
      return new Error(`wrong number of arguments. got=${args.length} want = 1`)
    }

    if (args[0].getType() != OType.ARRAY_OBJ) {
      return new Error(`argumetns to \`rest\` must be ARRAY, got ${args[0].getType()}`);
    }

    if (args[0] instanceof Array) {
      if (args[0].elements.length > 0) {
        let sub = args[0].elements.slice(1);
        return new Array(sub);
      }
    }

    return NULL;
  })],
  ['push', new Builtin((...args: Object[]) => {

    if (args.length != 2) {
      return new Error(`wrong number of arguments. got=${args.length} want = 2`)
    }

    if (args[0].getType() != OType.ARRAY_OBJ) {
      return new Error(`argumetns to \`rest\` must be ARRAY, got ${args[0].getType()}`);
    }

    if (args[0] instanceof Array) {
      const length = args[0].elements.length;
      if (length > 0) {
        const copy = args[0].elements.slice();
        copy.push(args[1]);
        return new Array(copy);
      }
    }

    return NULL;
  })],
  ['puts', new Builtin((...args: Object[]) => {
    args.forEach(arg => console.log(arg.inspect()));
    return NULL;
  })]
])
