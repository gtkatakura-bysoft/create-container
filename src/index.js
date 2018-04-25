import React, { Component } from "react"

const isPlainObject = obj => {
  if (typeof obj !== "object" || obj === null) return false

  let proto = obj
  while (Object.getPrototypeOf(proto) !== null)
    proto = Object.getPrototypeOf(proto)

  return Object.getPrototypeOf(obj) === proto
}

const createContainer = ({
  preloadedState = {},
  reducer = state => state,
  selectors = {},
  actionCreators = {},
  effectCreators = {}
}) => {
  const enhancedReducer = (state = preloadedState, action) =>
    typeof reducer === "object"
      ? reducer[action.type]
        ? reducer[action.type](state, action)
        : state
      : reducer(state, action)

  const defaultState = enhancedReducer(undefined, {})

  const Context = React.createContext({
    ...defaultState,
    ...Object.keys(selectors).reduce(
      (result, key) => ({
        ...result,
        [key]: (...args) => selectors[key](defaultState, ...args)
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
        ...defaultState,
        ...this.selectors,
        ...this.actions,
        ...this.effects
      }
    }

    createAction = (actionCreator, args) =>
      typeof actionCreator === "string"
        ? {
            type: actionCreator,
            // If the action is a string and the first argument passed to the action
            // is a plain object, we'll spread the content of this object into the action payload.
            // E.g.: `{ receivePosts: "RECEIVE_POSTS" }` dispatched as `receivePosts({ posts: [], comments: [] })`
            // would be converted to `{ type: "RECEIVE_POSTS", posts: [], comments: [] }`
            ...(isPlainObject(args[0]) ? args[0] : {})
          }
        : actionCreator(...args)

    createEffect = (effectCreator, args) => effectCreator(...args)

    dispatchAction = action =>
      new Promise(resolve =>
        this.setState(state => enhancedReducer(state, action), resolve)
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
