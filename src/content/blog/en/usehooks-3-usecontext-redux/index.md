---
title: "useHooks(3): Do You Still Need Redux Now That You Have useContext?"
description: "The new React Context was officially released a long time ago, and most React developers are no doubt familiar with it by now. Many people treat Context as a replacement for Redux. But I've found that quite a few people still misunderstand how Redux—and especially react-redux—is implemented under the hood. Let me ask you a question first: does react-redux update connected components by triggering a change in the context value? If your answer is yes, then you may have a bit too much faith in Context. Don't worry—there's no single correct answer to this question. It started out as no, at one point became yes, and for now has gone back to no."
pubDate: '2021-02-05'
slug: 'usehooks-3-usecontext-redux'
tags: []
---

The new React Context was officially released a long time ago, and most React developers are no doubt familiar with it by now. Many people treat Context as a replacement for Redux. But I've found that quite a few people still misunderstand how Redux—and especially react-redux—is implemented under the hood. Let me ask you a question first: does react-redux update connected components by triggering a change in the context value? If your answer is yes, then you may have a bit too much faith in Context. Don't worry—there's no single correct answer to this question. It started out as no, at one point became yes, and for now has gone back to no.

## The Choices react-redux Made

> If you're already very familiar with react-redux, you can skip this section—in fact, this whole article may not have much value for you. If your English is decent, I recommend reading [The History and Implementation of React-Redux](https://blog.isquaredsoftware.com/2018/11/react-redux-history-implementation/) directly. (I have to say, the Redux maintainers are remarkably conscientious. I think this article is a model of open-source projects examining themselves, well worth reading several times over.)

Let's go back to the era of the Legacy Context. Many of you know that Legacy Context had a fairly serious problem: a change in Context could be blocked by a `shouldComponentUpdate` somewhere in the middle of the tree. Yet we also know that react-redux has always required a Provider at the top level, so what role does Context play here? In fact, what react-redux stores in its context is just a reference to the redux store. It's precisely through Context that a connected wrapper component can directly access the top-level store. From there, each connected wrapper component subscribes to changes in the store and triggers a render when a change occurs. There are many details involved here—for example, the execution order of parent and child components has to be guaranteed, while at the same time meaningless renders need to be avoided as much as possible and performance optimized as far as possible—but I won't go into all that here. Today's React developers, however, may not be entirely grateful for all this, because we now have React's official `createContext` API. So surely Redux doesn't need to implement the subscription details itself anymore, right?

Indeed, once the new Context was announced, react-redux had plans along those very lines, and they were shipped soon after in the v6 release. The main change in that version was to manage data directly on top of React Context, with changes to the context value triggering connected-component updates, thereby removing the relatively complex `Subscription` logic from earlier versions. The original expectation before release was that using React Context would make little difference to performance, but the feedback received after release was jaw-dropping. There were Breaking Change issues, there were difficulties implementing the hooks API, but the biggest one was a major drop in performance. Many developers complained after upgrading their projects that performance was far worse than before. The reasons behind the performance issues are actually fairly complex, and we'll discuss some of them below, but the established fact is that at the time these problems were genuinely unsolvable. Later, on the advice of the React maintainers, react-redux v7 switched back to the earlier approach of having each child component `subscribe` individually. While v7 also made plenty of other optimizations and provided a carefully considered hooks API, this is surely not the end of the road for react-redux. In the future, when the time is right, it will undoubtedly evolve again, continuing to progress alongside React's new APIs.

## A Problem with Context?

Above we mentioned the problems encountered when react-redux v6 was released, the cause of which mainly came from directly using React's official Context to hold data. So is this really a problem with Context itself, or a problem with how it was being used? My personal view is that when the new Context was released, everyone put a little too much faith in it. If you look at the current React docs, the recommended scope for Context really is just to hold global data related to things like theme or user—it doesn't tell developers to use it as a redux store. One very important reason for this is probably that Context doesn't offer one crucial capability: subscribing only to a partial value within the Context, rather than re-rendering every component that depends on the Context the moment the context value changes at all.

```javascript
const GlobalContext = createContext();

function App() {
  const [a, updateA] = useState('');
  const [b] = useState('');

  const contextValue = useMemo(() => ({ a, b }), [a, b]);

  return (
    <GlobalContext.Provider value={contextValue}>
      <ConsumeA />
      <ConsumeB />
      <input value={a} onChange={(e) => updateA(e.target.value)} />
    </GlobalContext.Provider>
  );
}

function ConsumeA() {
  const { a } = useContext(GlobalContext);

  return a;
}

function ConsumeB() {
  const { b } = useContext(GlobalContext);

  console.log('render b with: ', b);

  return b;
}
```

[Codesandbox](https://codesandbox.io/s/react-context-m3pid)

Even though you used useMemo to reduce changes to the value, you still can't avoid the situation where a change in a causes the context to change, which in turn pointlessly re-renders the ConsumeB component. React's current answer to this problem clearly can't satisfy every developer—splitting up the context or adding a few more component layers really is rather cumbersome. So if we truly do have a performance bottleneck here, what can we do about it right now? All right then, let's venture into some dangerous territory.

## changedBits and observedBits (Unstable)

Some of you may not yet know that today's `createContext` actually provides a second argument:

```jsx
const GlobalContext = createContext({}, (prev, next) => {
  let result = 0;
  if (prev.a !== next.a) {
    result |= 0b01;
  }
  if (prev.b !== next.b) {
    result |= 0b10;
  }
  return result;
});

// ...

const ConsumeB = memo(() => {
  const { b } = useContext(GlobalContext, 0b10);

  console.log('render b with: ', b);

  return b;
});

// function readContext(Context, observedBits) {
//   const dispatcher =
//  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher
//       .current;
//   return dispatcher.readContext(Context, observedBits);
// }
```

[Codesandbox](https://codesandbox.io/s/react-context-changedbits-e4fh3)

Through custom value-comparison logic, we tell React the "changed bits" for different kinds of changes. Correspondingly, each consumer can spell out the "observed bits" it cares about. This way the context can pin down changes at a fine-grained level and render consumers according to their actual needs. If `changedBits & observedBits === 0`, the spot using useContext will skip (bail out of) this render.

Of course, even though this API has existed since 2018 and quite a few seasoned developers have introduced and used changedBits, to this day it remains in an unstable state (and if you want to use it without warnings, you'll also have to be fired...). Bit manipulation really is hard for most people to grasp. So in the future, what kind of mechanism will we use to express depending on a partial value?

## useSelectedContext (Unstable)

```javascript
const selection = useSelectedContext(Context, (c) => select(c));
```

Ha, this name is still quite fresh, because its origin is a new React [PR](https://github.com/facebook/react/pull/20646) from last night, and it's still at a very early experimental stage. The concept of a selector may have originated from react-redux too. The `mapStateToProps` method lets us "pick out" part of the state from the store, and it later gave rise to some more advanced usages, such as [reselect](https://github.com/reduxjs/reselect). In fact, even before today, there had already been—early on, over the past couple of years of React community discussion—an [RFC](https://github.com/gnoff/rfcs/blob/context-selectors/text/0000-context-selectors.md) about [Context Select](https://github.com/reactjs/rfcs/pull/119), whose proposal and discussion are both well worth a look.

Since it's already been officially implemented, we won't discuss the polyfill implementation from the RFC here. Let's just take a quick look at the usage examples from the RFC:

```javascript
let Context = React.createContext(‘’)

let App = ({ index, string }) => {
  return (
    <Context.Provider value={string}>
      <Foo index={index} />
    </Context.Provider>
  )
}

let Foo = React.memo(({ index }) => {
  let selector = React.useCallback(s => s.substring(0, index), [index])
  let selection = React.useContextSelector(Context, selector)
  return <span>{selection}</span>
})

// Foo renders (mount) and selector is called during Foo’s render: “abcd”
ReactRenderer.render(<App index={4} string=”abcdefg” />)

// Foo renders (props update) and selector is called during Foo’s render: “abcde”
ReactRenderer.render(<App index={5} string=”abcdefg” />)

// Foo does not render (memo props same), selector is called before Foo bails out (selection same): “abcde”
ReactRenderer.render(<App index={5} string=”abcdef*” />)

// Foo renders (selection update), selector is called before Foo’s render and the result is memoized and returned again during that render: “a*cde”
ReactRenderer.render(<App index={5} string=”a*cdef*” />)

// Foo renders (props update), selector is only called during Foo’s render even though the context value also changed: “a**d”
ReactRenderer.render(<App index={4} string=”a**def*” />)
```

The second argument, the `select` method, is very close to the `mapStateToProps` of react-redux's earlier connect. When necessary, a change in Context triggers `select` to be recomputed, and whether or not the returned result has changed, this component will bail out directly.

Regardless of whether the name ends up being changed to `useContextSelector` or `useSelectedContextValue`, before long we should (hopefully) have the ability to select context. By then, react-redux might once again try using Context directly, and the Context API might come to play a more important role in React (many libraries, such as Formik, really need this capability).

## Tail

There's actually one more important factor in all these choices around React Context that I haven't mentioned: Concurrent Mode. For example, one important reason react-redux uses context to hold data is to be compatible with Concurrent Mode. But I haven't touched on this at all in this article. On the one hand, that's because my understanding of Concurrent Mode is still shallow, and I have even less confidence in trying to explain it to you. On the other hand, once concurrency enters the picture, many problems likely become considerably more complex, with plenty of uncertain elements still in play. This article, and the articles in this series, only scratch the surface in introducing some concepts that perhaps haven't yet been understood by many people, mixed in with a bit of my own personal interpretation. If it can serve as a starting point that gives you a little inspiration to go dig deeper into the principles and goals behind these things, then that would be wonderful!
