export type idType = number | string;
export interface enumInterface {
  id: idType;
  value: string;
  [propName: string]: unknown;
}

export type enumsType = enumInterface[];

export interface symbolsInterface {
  [propName: string]: idType;
}

export interface gettersInterface {
  [propName: string]: enumsType;
}

export interface gettersConditionInterface {
  [propName: string]: (
    enumParmas: enumInterface,
    index?: number,
    arr?: enumsType
  ) => boolean;
}

export type subscribeCallbackType = (enmus: enumsType) => unknown;

export type subscriptionsType = subscribeCallbackType[];

export type fetchEnumCallbackType = () => Promise<enumsType>;
