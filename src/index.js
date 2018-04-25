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
  actions = {},
  effects = {}
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
      (result, selectorName) => ({
        ...result,
        [selectorName]: (...args) =>
          selectors[selectorName](defaultState, ...args)
      }),
      {}
    ),
    ...Object.keys(actions).reduce(
      (result, action) => ({
        ...result,
        [action]: () => {}
      }),
      {}
    ),
    ...Object.keys(effects).reduce(
      (result, effect) => ({
        ...result,
        [effect]: () => {}
      }),
      {}
    )
  })

  class Provider extends Component {
    constructor(props) {
      super(props)

      this.selectors = Object.keys(selectors).reduce(
        (result, selectorName) => ({
          ...result,
          [selectorName]: (...args) =>
            selectors[selectorName](this.state, ...args)
        }),
        {}
      )

      this.actions = Object.keys(actions).reduce(
        (result, actionName) => ({
          ...result,
          [actionName]: (...args) =>
            this.dispatchAction(this.parseAction(actions[actionName], args))
        }),
        {}
      )

      this.effects = Object.keys(effects).reduce(
        (result, effectName) => ({
          ...result,
          [effectName]: (...args) =>
            this.dispatchEffect(effects[effectName](...args))
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

    parseAction = (action, args) =>
      typeof action === "string"
        ? {
            type: action,
            // If the action is a string and the first argument passed to the action
            // is a plain object, we'll spread the content of this object into the action payload.
            // E.g.: `{ receivePosts: "RECEIVE_POSTS" }` dispatched as `receivePosts({ posts: [], comments: [] })`
            // would be converted to `{ type: "RECEIVE_POSTS", posts: [], comments: [] }`
            ...(isPlainObject(args[0]) ? args[0] : {})
          }
        : action(...args)

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
