# createContainer()

Create predictable state containers for JavaScript apps

# Usage

```js
import React from "react"

import createContainer from "@smalldots/create-container"
import { render } from "react-dom"

const CounterContainer = createContainer(
  { count: 0 },
  {
    INCREMENT: state => ({ count: state.count + 1 }),
    DECREMENT: state => ({ count: state.count - 1 }),
    INCREMENT_BY: (state, action) => ({ count: state.count + action.by })
  },
  {
    increment: () => ({ type: "INCREMENT" }),
    decrement: () => ({ type: "DECREMENT" }),
    incrementBy: by => ({ type: "INCREMENT_BY", by }),

    incrementByAsync: by => ({ incrementBy }) =>
      setTimeout(() => incrementBy(by), 1000)
  }
)

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
