import React, { Component } from "react"

const isPlainObject = obj => {
  if (typeof obj !== "object" || obj === null) return false

  let proto = obj
  while (Object.getPrototypeOf(proto) !== null)
    proto = Object.getPrototypeOf(proto)

  return Object.getPrototypeOf(obj) === proto
}

const createContainer = (
  initialState = {},
  reducer = state => state,
  actions = {}
) => {
  const enhancedReducer = (state = initialState, action) =>
    typeof reducer === "object"
      ? reducer[action.type]
        ? reducer[action.type](state, action)
        : state
      : reducer(state, action)

  const Context = React.createContext({
    ...enhancedReducer(undefined, {}),
    ...Object.keys(actions).reduce(
      (result, action) => ({
        ...result,
        [action]: () => {}
      }),
      {}
    )
  })

  class Provider extends Component {
    constructor(props) {
      super(props)

      this.actions = Object.keys(actions).reduce(
        (result, action) => ({
          ...result,
          [action]: (...args) =>
            this.dispatch(
              typeof actions[action] === "string"
                ? {
                    type: actions[action],
                    // If the action is a string and the first argument passed to the action
                    // is a plain object, we'll spread the content of this object into the action payload.
                    // E.g.: `{ receivePosts: "RECEIVE_POSTS" }` dispatched as `receivePosts({ posts: [], comments: [] })`
                    // would be converted to `{ type: "RECEIVE_POSTS", posts: [], comments: [] }`
                    ...(isPlainObject(args[0]) ? args[0] : {})
                  }
                : actions[action](...args)
            )
        }),
        {}
      )

      this.state = {
        ...enhancedReducer(undefined, {}),
        ...this.actions
      }
    }

    dispatch = action =>
      typeof action === "function"
        ? action({ ...this.state, ...this.actions })
        : new Promise(resolve =>
            this.setState(state => enhancedReducer(state, action), resolve)
          )

    render() {
      return (
        <Context.Provider value={this.state}>
          {this.props.children}
        </Context.Provider>
      )
    }
  }

  return { Provider, Consumer: Context.Consumer }
}

export default createContainer
