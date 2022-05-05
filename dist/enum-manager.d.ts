import { enumsType, symbolsInterface, gettersConditionInterface, subscribeCallbackType, fetchEnumCallbackType } from "./types";
export declare class EnumsManager {
    private initEnums;
    private innerEnums;
    symbols: symbolsInterface;
    private innerGetters;
    private gettersCondition;
    private subscriptions;
    private fetchEnumCallback;
    private state;
    constructor(enumsParmas?: enumsType);
    /**
     * 标记在枚举中某一项,标记需要在枚举中能找到才能标记
     * @param symbols 需要设置的标记
     * @returns
     */
    setSymbols(symbols: symbolsInterface): EnumsManager;
    /**
     * 设置getters获取条件
     * @param gettersCondition getter筛选条件函数集合
     * @returns
     */
    setGetters(gettersCondition: gettersConditionInterface): EnumsManager;
    updateGetters(enums: enumsType): void;
    /**
     * 收集枚举更新完毕后的回调
     * @param callback 枚举更新完毕后触发的回调
     * @returns
     */
    setSubscribe(callback: subscribeCallbackType): EnumsManager;
    /**
     * 更新枚举方法
     * @param enums 更新的枚举
     */
    updateEnums(enums: enumsType): EnumsManager;
    /**
     * 设置远程回调
     * @param callback 返回一个promise且resolve为枚举的函数
     * @returns
     */
    setFetchEnumsCallback(callback: fetchEnumCallbackType): EnumsManager;
    /**
     * 返回一个Promise,resolve远程加载完成的枚举;
     * @returns
     */
    promiseGetFetchEnums(): Promise<enumsType>;
    /**
     * 加载远程回调方法
     * @returns
     */
    private load;
}
