# 枚举管理器

- 如果通过 setFetchEnumsCallback 设置了远程加载方法,则开启远程加载枚举方式.
- 通过数组的 splice 和 push 进行删除和添加,保证数组引用不变,保证枚举不需要再主业务的逻辑中手动获取,而是由管理器懒加载的方式进行修改
- 枚举只有一份
- 设置初始枚举和远程枚举,初始枚举用来作为在远程枚举还没拿到前的特殊判断, 远程枚举必须包含初始枚举,否则报错,确保枚举更新后枚举一致

- 示例

```javascript
// enums.js

import { EnumsManager } from "./dist/index.esm.js";

export const testEnums = new EnumsManager([
  { id: 1, value: "1" },
  { id: 2, value: "2" },
  { id: 3, value: "3" },
  { id: 4, value: "4" },
])
  .setSymbols({
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
  })
  .setGetters({
    ID_GREATER_THAN_TWO({ id }) {
      return id > 2;
    },
    ID_GREATER_THAN_FOUR({ id }) {
      return id > 4;
    },
  })
  .setFetchEnumsCallback(() =>
    Promise.resolve([
      { id: 1, value: "1" },
      { id: 2, value: "2" },
      { id: 3, value: "3" },
      { id: 4, value: "4" },
      { id: 5, value: "5" },
    ])
  );
```

```javascript
import { testEnums } from "./enums.js";

// 拿到未更新的
console.log(
  testEnums.symbols.ONE,
  testEnums.enums,
  testEnums.getters.ID_GREATER_THAN_TWO,
  "1"
);

// 拿到更新后的
setTimeout(() => {
  console.log(
    testEnums.enums,
    testEnums.getters.ID_GREATER_THAN_TWO,
    "setTimeout"
  );
});

// 监听,待更新后触发
testEnums.setSubscribe((enums) => {
  console.log(enums, "setSubscribe1");
});
testEnums.setSubscribe((enums) => {
  console.log(enums, "setSubscribe2");
});

// 通过promise的方式拿到更新后的结果
testEnums.promiseGetFetchEnums().then((res) => {
  console.log(res, "promiseGetFetchEnums");
});
```
