import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import rootReducer from '../reducers'
// import config from '../lib/config';

export default function configureStore(initialState) {

  const middlewareArgs = false ? [thunkMiddleware] : [thunkMiddleware, createLogger()];

  const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware.apply(null, middlewareArgs)
  )

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers').default
      store.replaceReducer(nextRootReducer)
    });
  }

  return store;
}
