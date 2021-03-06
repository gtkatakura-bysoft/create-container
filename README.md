# createContainer()

[![npm version](https://badge.fury.io/js/%40smalldots%2Fcreate-container.svg)](https://badge.fury.io/js/%40smalldots%2Fcreate-container)

Predictable state containers for React apps

## Installation

```
npm install --save @smalldots/create-container
```

# Demos

* Simple counter: https://codesandbox.io/s/03znoqjz4w
* Using high order containers to create multiple counters: https://codesandbox.io/s/yqrxnk48x1
* Advanced example (data fetching + entities handling): https://codesandbox.io/s/1vn8j7yq83

# Usage

```js
import React from "react"
import { render } from "react-dom"

import createContainer from "@smalldots/create-container"

const CounterContainer = createContainer({
  initialState: { count: 0 },
  reducer: {
    INCREMENT: state => ({ count: state.count + 1 }),
    DECREMENT: state => ({ count: state.count - 1 }),
    INCREMENT_BY: (state, action) => ({ count: state.count + action.by })
  },
  selectors: {
    getCount: ({ count }) => count
  },
  actionCreators: {
    increment: "INCREMENT",
    decrement: "DECREMENT",
    incrementBy: by => ({ type: "INCREMENT_BY", by })
  },
  effectCreators: {
    incrementByAsync: by => ({ incrementBy }) =>
      setTimeout(() => incrementBy(by), 1000)
  }
})

const App = () => (
  <CounterContainer.Provider>
    <p>
      Current count: <Count />
    </p>
    <IncrementButton />
    <DecrementButton />
    <AsyncIncrementButton by={5} />
  </CounterContainer.Provider>
)

const Count = () => (
  <CounterContainer.Consumer>{({ count }) => count}</CounterContainer.Consumer>
)

const IncrementButton = () => (
  <CounterContainer.Consumer>
    {({ increment }) => <button onClick={increment}>Increment</button>}
  </CounterContainer.Consumer>
)

const DecrementButton = () => (
  <CounterContainer.Consumer>
    {({ decrement }) => <button onClick={decrement}>Decrement</button>}
  </CounterContainer.Consumer>
)

const AsyncIncrementButton = ({ by }) => (
  <CounterContainer.Consumer>
    {({ incrementByAsync }) => (
      <button onClick={() => incrementByAsync(by)}>
        Increment by {by} (takes 1s)
      </button>
    )}
  </CounterContainer.Consumer>
)

render(<App />, document.getElementById("root"))
```
