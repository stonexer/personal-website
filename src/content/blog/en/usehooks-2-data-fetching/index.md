---
title: "useHooks(2): A Few Words on the Little Matter of Data Fetching"
description: "It's been half a year since my last article on hooks, because the more I use them, the more I realize this rabbit hole runs deep. Even for something as simple as making a request, I find it hard to explain why hooks should be used. I've read plenty of articles about React Hooks, but I've never found one covering the \"simplest\" everyday CRUD practices. So this time I'll offer my modest contribution to spark better ideas, and share my current, rudimentary understanding."
pubDate: '2019-06-21'
slug: 'usehooks-2-data-fetching'
tags: []
---

It's been half a year since my last article on hooks, because the more I use them, the more I realize this rabbit hole runs deep. "This code isn't well written; it's hard to understand why it should be put in hooks." That was the first thing my manager said after reviewing my code that used hooks. Even for something as simple as making a request, I find it hard to explain why hooks should be used. I've read plenty of articles about React Hooks, but I've never found one covering the "simplest" everyday CRUD practices. So this time I'll offer my modest contribution to spark better ideas, and share my current, rudimentary understanding.

## The Problem

Suppose we have the simplest possible requirement: the `MovieList` page needs to fetch data from the server and display it. Let me first throw out a few questions:

1. Where should the request method be written? Where should the fetched data be stored?
2. If the component is unmounted before the request completes, has any special handling been done?
3. Where do the request parameters come from, and will a change in parameters trigger a re-fetch? Where is the call written?
4. Are the several states corresponding to the request — loading, refreshing, error — handled in the component?
5. If the request needs polling, how do you do it? Have you handled the page `visibilitychange` case?
6. If you need to re-fetch when parameters change, and the parameters update frequently, will you run into a race condition (an older request, being slow, resolves later than a request that was sent afterward)?

These are all problems I find harder to solve when writing "procedural" code in a Class Component. Some of them can't be handled conveniently even with redux. That's why I used to be a big fan of solutions like [Apollo](https://zhuanlan.zhihu.com/p/34238617), which place async data in an HOC and handle it automatically. By the way, the renderProps approach recommended by Apollo's new API is noticeably harder to use... Of course, a hooks version is already in beta too. But when you put the logic entirely inside an HOC or renderProps, things aren't particularly convenient when a component depends on multiple requests that are entangled with one another. This is because the HOC or renderProps inexplicably establishes a layer and scope relationship that shouldn't exist in the first place.

So what does it look like in Hooks?

## useData ?

```js
function useData(dataLoader, params) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(undefined);
  const [data, setData] = useState(undefined);

  useEffect(() => {
    dataLoader().then((responseData) => {
      // ...
      setData(responseData);
    });
  }, [dataLoader, ...params);

  return { data, loading, error };
}

function MovieList({ page, size }) {
  const {
    data: movieListData,
    loading,
    error
  } = useData(
    () => api.queryMovieList({ page, size }),
    [page, size]
  );

  // ...
}
```

The first thing that comes to mind is a Hook like this, similar to useEffect: you pass in the `dataLoader` that fetches the request data, along with the request parameters this data source depends on, `page` and `size`. This looks fine at first glance, but in reality the useEffect dependencies `[dataLoader, ...params]` can't satisfy the static dependency requirement of hooks, because inside `useData` there's no way to know exactly which values are in `...params`. In the previous chapter I said that useCallback is generally used for performance and isn't necessary. Here you can see that I was actually wrong...

```jsx
function useData(dataLoader) {
  // ...

  useEffect(() => {
    dataLoader().then((responseData) => {
      // ...
      setData(responseData);
    });
  }, [dataLoader);

  // ...
}


function MovieList({ page, size }}) {
  const queryMovieList = useCallback((page, size) => api.queryMovieList({ page, size }), [page, size]);

  const { data: movieListData, loading, error } = useData(queryMovieList);

  // ...
}
```

Here we use useCallback to bind queryMovieList together with its parameters page and size. Only when page or size changes will queryMovieList be updated, which then automatically triggers the request logic inside useData. Although this approach adds an extra useCallback call in the component, it's more amenable to the static analysis of hooks.

With an abstraction like `useData`, and thanks to the complete component lifecycle control that hooks provide, we can easily encapsulate the previously mentioned issues — unmount handling, request race conditions, and so on — inside the hooks. Taking the race condition as an example, here's a rough sketch of a possible approach:

```jsx
function useData(dataLoader) {
  const currentDataLoader = useRef(null);
  // ...

  useEffect(() => {
    currentDataGetter.current = dataGetter;

    dataLoader().then((responseData) => {
      // ...

      // 如果有更新的请求，放弃之前的
      if (currentDataGetter.current !== dataGetter) {
        return;
      }

      setData(responseData);
    });
  }, [dataLoader);

  // ...
}
```

We just need to use a ref to record the most recent dataLoader, so that when a request resolves we can determine whether the data is stale. Of course, the code above is only an example, and there's plenty more that could be tweaked and optimized.

## Handling Async States

The useData above only solves the part about data fetching. To handle the several states we get, we inevitably end up writing code like this:

```jsx
function MovieList({ page, size }}) {
  const queryMovieList = useCallback((page, size) => api.queryMovieList({ page, size }), [page, size]);

  const { data: movieListData, loading, error } = useData(queryMovieList);

  if (loading && data == null) {
    return <Spin />
  }

  if (error) {
    return <Exception />
  }

  return (
    <Spin loading={loading}>
      {renderMovieList(movieListData)}
    </Spin>
  );

  function renderMovieList(movieList) {
    return movieList.map(item => <MovieItem key={item.id} data={item} />)
  }
}
```

Over time we'll find that in every component using this useData, we can't avoid hand-writing these two `if`s. But hooks can only solve lifecycle problems; they can't encapsulate render logic. The most effective solution here is actually Suspense, but since it hasn't been released yet, we turn to renderProps:

```jsx
function DataBoundary({ data, loading, error, children }) {
  if (loading) {
    return <Spin />;
  }

  // ...

  return <Spin loading={loading}>{children(data)}</Spin>;
}

function MovieList({ page, size }}) {
  const queryMovieList = useCallback((page, size) => api.queryMovieList({ page, size }), [page, size]);

  const movieListResult = useData(queryMovieList);
  // const { data: movieListData, loading, error } = useData(queryMovieList);

  return (
    <DataBoundary {...movieListResult}>
    // <DataBoundary data={movieListData} loading={loading} error={error}>
      {(data) => renderMovieList(data)}
    </DataBoundary>
  );

  function renderMovieList(movieList) {
    return movieList.map(item => <MovieItem key={item.id} data={item} />)
  }
}
```

Inside `DataBoundary`, we encapsulate the rendering flow for handling async states, and we can also expose hooks similar to a fallback to satisfy component scenarios that need customization. With it, we achieve something similar to Suspense.

## All in Hooks?

But what if we really want to do everything inside hooks? Here's one more easter egg:

```jsx
function useDataBoundary(dataLoader) {
  // ...

  function boundary(renderChildren) {
    if (loading && data == null) {
      return <Spin />;
    }

    // ...

    return renderChildren(data);
  }

  return boundary;
}

function MovieList({ page, size }}) {
  const queryMovieList = useCallback((page, size) => api.queryMovieList({ page, size }), [page, size]);

  const boundary = useDataBoundary(queryMovieList);

  return (
    <div>
      {boundary((data) => renderMovieList(data))}
    </div>
  );

  function renderMovieList(movieList) {
    return movieList.map(item => <MovieItem key={item.id} data={item} />)
  }
}
```

If we can return a "renderProp" from within hooks, then we can fully encapsulate the render-related logic inside the hooks as well. But at the same time, this also makes the code inside a hook more complex; this is just one idea to consider. So which of these two approaches do you prefer?

## Tail End

This article has roughly explained a bit of my thinking on writing business logic with hooks. Many things weren't elaborated in detail, so if you're interested, we can dig deeper. At the very least, on the few questions raised at the beginning, hooks have helped me solve this abstract logic that previously had nowhere to live. So even though I still frequently run into infinite request loops caused by not thinking through the deps carefully, I still think hooks are worth a try~
