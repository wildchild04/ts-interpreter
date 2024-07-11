import { Object } from './object/object'

export class Environment {
  protected store: Map<string, Object>
  constructor() {

    this.store = new Map();
  }

  public get(name: string): Object | undefined {

    return this.store.get(name);
  }

  public set(name: string, obj: Object) {
    this.store.set(name, obj)
  }

}

export class EnclosedEnvironement extends Environment {
  private outer: Environment;

  constructor(env: Environment) {
    super()
    this.outer = env;
  }

  public get(name: string): Object | undefined {

    let obj = this.store.get(name);

    if (!obj) {
      obj = this.outer.get(name);
    }

    return obj;
  }

  public set(name: string, val: Object) {
    this.store.set(name, val)
  }

}



