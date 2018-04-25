import React, { Component } from "react"

const identity = value => value

const isPlainObject = obj => {
  if (typeof obj !== "object" || obj === null) return false

  let proto = obj
  while (Object.getPrototypeOf(proto) !== null)
    proto = Object.getPrototypeOf(proto)

  return Object.getPrototypeOf(obj) === proto
}

const createContainer = ({
  initialState = {},
  reducer = state => state,
  selectors = {},
  actionCreators = {},
  effectCreators = {}
}) => {
  const Context = React.createContext({
    ...initialState,
    ...Object.keys(selectors).reduce(
      (result, key) => ({
        ...result,
        [key]: (...args) => selectors[key](initialState, ...args)
      }),
      {}
    ),
    ...Object.keys(actionCreators).reduce(
      (result, key) => ({
        ...result,
        [key]: () => {}
      }),
      {}
    ),
    ...Object.keys(effectCreators).reduce(
      (result, key) => ({
        ...result,
        [key]: () => {}
      }),
      {}
    )
  })

  class Provider extends Component {
    constructor(props) {
      super(props)

      this.selectors = Object.keys(selectors).reduce(
        (result, key) => ({
          ...result,
          [key]: (...args) => selectors[key](this.state, ...args)
        }),
        {}
      )

      this.actions = Object.keys(actionCreators).reduce(
        (result, key) => ({
          ...result,
          [key]: (...args) =>
            this.dispatchAction(this.createAction(actionCreators[key], args))
        }),
        {}
      )

      this.effects = Object.keys(effectCreators).reduce(
        (result, key) => ({
          ...result,
          [key]: (...args) =>
            this.dispatchEffect(this.createEffect(effectCreators[key], args))
        }),
        {}
      )

      this.state = {
        ...initialState,
        ...this.selectors,
        ...this.actions,
        ...this.effects
      }
    }

    createAction = (actionCreator, args) =>
      typeof actionCreator === "string"
        ? {
            type: actionCreator,
            // If the `actionCreator` is a string and the first argument passed to it is a plain object,
            // we'll spread the contents of this object into the action payload.
            // E.g.: `{ receivePosts: "RECEIVE_POSTS" }` dispatched as `receivePosts({ posts: [], comments: [] })`
            // would be converted to `{ type: "RECEIVE_POSTS", posts: [], comments: [] }`.
            ...(isPlainObject(args[0]) ? args[0] : {})
          }
        : actionCreator(...args)

    createEffect = (effectCreator, args) => effectCreator(...args)

    dispatchAction = action =>
      new Promise(resolve =>
        this.setState(
          state =>
            (typeof reducer === "object"
              ? reducer[action.type] || identity
              : reducer)(state, action),
          resolve
        )
      )

    dispatchEffect = effect =>
      effect({
        ...this.state,
        ...this.selectors,
        ...this.actions,
        ...this.effects
      })

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
