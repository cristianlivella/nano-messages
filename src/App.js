import React from 'react';
import Home from './Home';
import Demo from './Demo';
import { HashRouter as Router, Switch, Route, Link, Redirect } from "react-router-dom";

class App extends React.Component {

    render() {
        return (
            <Router>
                <Switch>
                    <Route path="/" exact>
                        <Home />
                    </Route>
                    <Route path="/demo" exact>
                        <Demo />
                    </Route>
                    <Route>
                        <Redirect to="/" />
                    </Route>
                </Switch>
            </Router>
        )
    }
}

export default App;
