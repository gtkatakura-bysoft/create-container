import React, { Component } from "react"

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
          [action]: (...args) => this.dispatch(actions[action](...args))
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
