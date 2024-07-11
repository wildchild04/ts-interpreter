import { describe, expect, test } from "@jest/globals";
import { String } from "./object";


describe('object test', () => {
  test('test string hash key', () => {
    const hello1 = new String('Hello World');
    const hello2 = new String('Hello World');
    const diff1 = new String('My name is johnny');
    const diff2 = new String('My name is johnny');

    expect(hello1.hashKey()).toStrictEqual(hello2.hashKey())
    expect(diff1.hashKey()).toStrictEqual(diff2.hashKey())
    expect(hello1.hashKey()).not.toStrictEqual(diff1.hashKey())
  })
})
