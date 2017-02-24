/* global smoke */
const App = require('./App')
smoke(App.render({ onDestroy: () => { } }))
