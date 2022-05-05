import {
  enumsType,
  gettersInterface,
  symbolsInterface,
  gettersConditionInterface,
  subscribeCallbackType,
  fetchEnumCallbackType,
} from "./types";

enum STATE {
  EMPTY,
  WAIT,
  LOADING,
  FINISH,
}

const SYMBOLS_NOT_IN_INITENUMS_ERROR = "设置的标记必须在初始枚举中能够找到";
const INITENUMS_NOT_IN_NEWENUMS_ERROR = "更新的枚举不包含初始枚举";
const SET_INNER_DATA_ERROR = "不能更改暴露的参数";

export class EnumsManager {
  // 初始保留的枚举,如果是远程加载时,可以保证某一些特殊处理可以拿到对应枚举,但是需要保证远程加载的枚举中包含初始保留的所有枚举
  private initEnums: enumsType;
  // 可以拿到所有枚举
  private innerEnums: enumsType;
  // 可以拿到枚举对应的标记,需要自己单独设置
  symbols: symbolsInterface;
  // 可以通过innerGetters拿到由setGetters设定条件后的结果枚举
  private innerGetters: gettersInterface;
  // setGetters设定条件的容器, 因为更新枚举后,需要重新获取getter的值,所以需要保留
  private gettersCondition: gettersConditionInterface;
  // 存更新枚举后触发的回调函数
  private subscriptions: subscribeCallbackType[];
  // 远程加载的函数,返回值是一个Promise,需要resolve拿到的枚举
  private fetchEnumCallback: fetchEnumCallbackType;
  // 远程加载的状态
  private state: STATE;

  constructor(enumsParmas: enumsType = []) {
    this.initEnums = enumsParmas;

    this.symbols = {};
    this.innerEnums = [...enumsParmas];
    this.innerGetters = {};

    this.gettersCondition = {};

    this.subscriptions = [];
    this.fetchEnumCallback = () => Promise.resolve([]);
    // 初始状态为空,证明不是远程加载模式
    this.state = STATE.EMPTY;

    // 暴露enmus和getters,当获取时,如果设置了远程加载方式,则通过远程懒加载获取
    Object.defineProperty(this, "enums", {
      get: (): enumsType => {
        this.load();
        return this.innerEnums;
      },
      set: () => {
        throw new Error(SET_INNER_DATA_ERROR);
      },
    });
    Object.defineProperty(this, "getters", {
      get: (): gettersInterface => {
        this.load();
        return this.innerGetters;
      },
      set: () => {
        throw new Error(SET_INNER_DATA_ERROR);
      },
    });
  }

  /**
   * 标记在枚举中某一项,标记需要在枚举中能找到才能标记
   * @param symbols 需要设置的标记
   * @returns
   */
  setSymbols(symbols: symbolsInterface): EnumsManager {
    const result = Object.values(symbols).every((symbol) =>
      this.initEnums.some(({ id }) => symbol === id)
    );
    if (!result) throw new RangeError(SYMBOLS_NOT_IN_INITENUMS_ERROR);
    Object.assign(this.symbols, symbols);
    return this;
  }

  /**
   * 设置getters获取条件
   * @param gettersCondition getter筛选条件函数集合
   * @returns
   */
  setGetters(gettersCondition: gettersConditionInterface): EnumsManager {
    Object.keys(gettersCondition).forEach((key) => {
      this.innerGetters[key] = [];
    });
    Object.assign(this.gettersCondition, gettersCondition);
    this.updateGetters(this.innerEnums);
    return this;
  }

  updateGetters(enums: enumsType) {
    Object.entries(this.gettersCondition).forEach(([key, callback]) => {
      const filterEnums = enums.filter((item) => callback.call(this, item));
      this.innerGetters[key].splice(0, this.innerGetters[key].length);
      filterEnums.forEach((item) => this.innerGetters[key].push(item));
    });
  }

  /**
   * 收集枚举更新完毕后的回调
   * @param callback 枚举更新完毕后触发的回调
   * @returns
   */
  setSubscribe(callback: subscribeCallbackType): EnumsManager {
    this.subscriptions.push(callback);
    return this;
  }

  /**
   * 更新枚举方法
   * @param enums 更新的枚举
   */
  updateEnums(enums: enumsType): EnumsManager {
    // 保证新枚举中拥有保留枚举中的值
    const result = this.initEnums.every((item) =>
      enums.some((_item) => item.id === _item.id && item.value === _item.value)
    );
    if (!result) throw new RangeError(INITENUMS_NOT_IN_NEWENUMS_ERROR);

    // 更新enums,保证更新后的和之前的为同一个引用
    this.innerEnums.splice(0, this.innerEnums.length);
    enums.forEach((item) => this.innerEnums.push(item));

    // 更新getters
    this.updateGetters(enums);

    // 更新完毕后触发收集的回调
    this.subscriptions.forEach((subscription) => {
      subscription(this.innerEnums);
    });
    return this;
  }

  /**
   * 设置远程回调
   * @param callback 返回一个promise且resolve为枚举的函数
   * @returns
   */
  setFetchEnumsCallback(callback: fetchEnumCallbackType): EnumsManager {
    this.state = STATE.WAIT;
    this.fetchEnumCallback = callback;
    return this;
  }

  /**
   * 返回一个Promise,resolve远程加载完成的枚举;
   * @returns
   */
  promiseGetFetchEnums(): Promise<enumsType> {
    return new Promise((resolve) => {
      if ([STATE.EMPTY, STATE.FINISH].includes(this.state)) {
        resolve(this.innerEnums);
      } else {
        this.setSubscribe(resolve);
        this.load();
      }
    });
  }

  /**
   * 加载远程回调方法
   * @returns
   */
  private load(): void {
    if (this.state !== STATE.WAIT) return;
    this.state = STATE.LOADING;
    this.fetchEnumCallback()
      .then((enums) => {
        this.updateEnums(enums);
        this.state = STATE.FINISH;
      })
      .catch((e) => {
        // 失败需要重新加载
        this.state = STATE.WAIT;
        throw e;
      });
  }
}
