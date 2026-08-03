---
title: "useHooks(1): Let's Talk About useCallback"
description: "For the first installment I'd like to start with `useCallback`, because it doesn't affect our code logic and is mainly aimed at folks who care a lot about performance or who are a bit obsessive about it. And this seemingly simple hook actually hides quite a few interesting things."
pubDate: '2019-02-13'
slug: 'usehooks-1-usecallback'
tags: []
---

The Spring Festival holiday just wrapped up — I hope everyone got some good rest? In case you were having too much fun and missed the news, React Hooks was officially released on the second day of the Lunar New Year in 2019. If you're still not sure what Hooks is, I strongly suggest you close this article first, open the Hooks [official documentation](https://reactjs.org/docs/hooks-intro.html), and read through it patiently — I'm confident you'll fall in love with Hooks.

Ever since Hooks came out, I couldn't resist trying them right away, and after a while I've summed up a few small takeaways. This article assumes you already have a rough understanding of Hooks. It raises some questions you may have already run into or will end up wondering about, and then offers a shallow discussion of what the best practices might be. After several months of using them, my understanding of Hooks is still quite shallow — I always feel that beneath the simple and elegant API hide many details worth paying attention to. If you spot any oversights or have better ideas, discussions and guidance are very welcome~

For the first installment (not sure if there will be a second one...) I'd like to start with `useCallback`, because it doesn't affect our code logic and is mainly aimed at folks who care a lot about performance or who are a bit obsessive about it. And this seemingly simple hook actually hides quite a few interesting things.

## Tons of Function Creation and useCallback

At first glance, React code that uses Hooks might make you wonder: doesn't creating so many inline functions seriously hurt performance? Didn't React always recommend avoiding creating functions inside callbacks? First, take a look at the [official explanation](https://reactjs.org/docs/hooks-faq.html#are-hooks-slow-because-of-creating-functions-in-render), which mentions that closures in JavaScript are very fast, and thanks to function components being more lightweight than classes, as well as avoiding extra layers like HOCs and renderProps, performance won't be much worse.

In addition, React provides `useMemo` and `useCallback` (`useCallback(fn, inputs)` === `useMemo(() => fn, inputs)`). Some people might mistakenly assume `useCallback` can be used to solve the performance issue of creating functions, but actually it's quite the opposite — judging from this single component, `useCallback` will only be slower, because the inline function gets created no matter what, plus there's the added cost of `useCallback` internally detecting changes in inputs.

```js
function A() {
  // ...
  const cb = () => {}; /* 创建了 */
}

function B() {
  // ...
  const cb = React.useCallback(() => {} /* 还是创建了 */, [a, b]);
}
```

The real purpose of `useCallback` is to cache the instance of the inline callback across each render, which makes it easy to combine with a child component's `shouldComponentUpdate` or `React.memo` to reduce unnecessary re-renders. Something you constantly need to remind yourself of: in a future where most `callback`s will be `inline callback`s, `React.memo` and `React.useCallback` must always be used as a pair — missing either one could cause performance to "drop" rather than improve, since even a meaningless shallow comparison costs that tiny little bit of performance.

Let me digress a bit. Actually, it's not just Hooks and function components — even class-based components sometimes run into this problem. When rendering lists in many cases, you can't help but inevitably write an arrow function:

```js
class SomeComponent extends React.PureComponent {
  render() {
    const { list, thingsNeedToUseInCallbackButDoNotNeedInChild, onChange } =
      this.props;

    return (
      <ul>
        {list.map((item) => (
          <Item
            key={item.key}
            onClick={() => {
              onChange(item, thingsNeedToUseInCallbackButDoNotNeedInChild);
            }}
          />
        ))}
      </ul>
    );
  }
}
```

Because of the habit of preferring `PureComponent`, the `Item` here also `extends React.PureComponent`. But because `onClick` uses an inline function here, the shallow comparison that `PureComponent` provides by default loses its meaning all the same.

Following the same line of thinking as `useCallback`, we can actually apply custom `memoize` to the callback here too:

```js
import { memoize } from 'decko';

class SomeComponent extends React.PureComponent {
  @memoize
  getItemChangeHandler = (key, item) => {
    const { thingsNeedToUseInCallbackButDoNotNeedInChild, onChange } =
      this.props;

    onChange(item, thingsNeedToUseInCallbackButDoNotNeedInChild);
  };

  render() {
    const { list } = this.props;

    return (
      <ul>
        {list.map((item) => (
          <Item
            key={item.key}
            onClick={this.getItemChangeHandler(item.key, item)}
          />
        ))}
      </ul>
    );
  }
}
```

Back to Hooks, to sum up: the role of `useCallback` is to use `memoize` to reduce ineffective `re-render`s, thereby achieving performance optimization. As the old saying goes, "don't optimize prematurely." From real-world development experience, when doing this kind of performance optimization, you must always observe and compare the results of the optimization, because a single `callback` in some small corner could wipe out all the optimization, or even backfire.

## Is `useCallback` Suitable for Every Scenario?

After reading the discussion above, you might feel that `useCallback` is pretty clear too — but that's actually an illusion caused by forgetting the second argument, `inputs`. A relatively tricky problem is that under the current implementation, if a `callback` depends on a frequently changing `state`, the reference to that `callback` cannot be cached. The React docs FAQ also mentions this [problem](https://reactjs.org/docs/hooks-faq.html#how-to-read-an-often-changing-value-from-usecallback). Let me reconstruct the scenario:

```js
function Form() {
  const [text, updateText] = useState('');

  const handleSubmit = useCallback(() => {
    console.log(text);
  }, [text]); // 每次 text 变化时 handleSubmit 都会变

  return (
    <>
      <input value={text} onChange={(e) => updateText(e.target.value)} />
      <ExpensiveTree onSubmit={handleSubmit} /> // 很重的组件，不优化会死的那种
    </>
  );
}
```

The reason this problem is unsolvable is that the `callback`'s access to `state` inside it relies on JavaScript function closures. When the `callback` stays unchanged, the `state` it accesses from that previous `callback` function's closure is forever the value it held at that time. So let's take a look at the answer from the React docs:

```js
function Form() {
  const [text, updateText] = useState('');
  const textRef = useRef();

  useLayoutEffect(() => {
    textRef.current = text; // 将 text 写入到 ref
  });

  const handleSubmit = useCallback(() => {
    const currentText = textRef.current; // 从 ref 中读取 text
    alert(currentText);
  }, [textRef]); // handleSubmit 只会依赖 textRef 的变化。不会在 text 改变时更新

  return (
    <>
      <input value={text} onChange={(e) => updateText(e.target.value)} />
      <ExpensiveTree onSubmit={handleSubmit} />
    </>
  );
}
```

The solution given in the docs may not be easy to understand at first glance, so let's take it step by step. First, because function components no longer have `this` to hold instance variables, React recommends using `useRef` to store values that may change. `useRef` is no longer prepared solely for DOM refs — it can also [be used to hold component instance properties](https://reactjs.org/docs/hooks-faq.html#is-there-something-like-instance-variables). After `updateText` finishes updating `text`, we then write it into `textRef.current` inside `useLayoutEffect` (equivalent to `didMount` and `didUpdate`). This way, the value stored in `textRef` that gets read inside `handleSubmit` is forever the latest value.

Doesn't it feel like a sudden moment of clarity? Essentially, the goals we want to achieve are the following:

1. Be able to fully reuse the functionally identical `callback`s produced across the many `render`s of a function component
2. The `callback` can break free of closure restrictions and access the latest state inside this function component

And because of function components' restrictions on accessing the component instance, the approach above uses `useRef` to create a `ref` that generally doesn't change across multiple `render`s, then updates the value that needs to be accessed into this `ref`, thereby implementing the ability to "pierce through" the closure. So is there another way?

```js
function useCallback(callback) {
  const callbackHolder = useRef();

  useLayoutEffect(() => {
    callbackHolder.current = fn;
  });

  return useMemo(
    () =>
      (...args) =>
        (0, ref.current)(...args),
    []
  );
}
```

This is an alternative version that differs from React's current internal `useCallback` implementation (referenced from this [issue](https://github.com/facebook/react/issues/14099)). Thinking about it the other way around: create a `ref` to hold the latest `callback`, and return a never-changing "trampoline" function to achieve the effect of actually calling the latest function. Doing this has another advantage: this cache doesn't need to depend on an explicit `inputs` declaration.

Is this perfect then? Definitely not... otherwise it would surely have been the official implementation. At first glance this function doesn't seem to introduce any problems, but if you look carefully, updating `ref.current` only when the DOM updates means this function can't be called during the `render` phase. More seriously, because it mutates the `ref`, weird situations may arise in React's future async mode (which is why the official solution above is also "unsafe in async mode").

What's worth looking forward to is that the community is actively discussing these problems with `useCallback` and their solutions. The React team also plans to implement a more complex but effective version inside React.

## What Should We Do for Now?

Because of all the reasons mentioned above, the best solution right now is actually to use `useReducer`. Because the `reducer` is actually executed on the next `render`, inside the `reducer` you always access the latest `props` and `state`.

```js
const TodosDispatch = React.createContext(null);

function TodosApp() {
  // Tip: `dispatch` 不会在多次渲染时改变
  const [todos, dispatch] = useReducer(todosReducer);

  return (
    <TodosDispatch.Provider value={dispatch}>
      <DeepTree todos={todos} />
    </TodosDispatch.Provider>
  );
}
```

The `dispatch` function returned by `useReducer` comes with `memoize` built in and won't change across multiple renders. So if you want to also pass `state` down through context, please declare them as two separate contexts.

## Conclusion

After taking a deeper look at the usage and implementation of `useCallback`, don't you feel that a seemingly simple API actually holds quite a few subtleties? When it comes to usage, Hooks still have many small details for which the best practices haven't yet been found, and following along with the developers as they explore them is a fun thing too. If you're interested, you can keep participating in the discussion that decides the fate of `useCallback`~

[useCallback() invalidates too often in practice](https://github.com/facebook/react/issues/14099#thread-subscription-status)
