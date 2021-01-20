import React from 'react';
import Home from './Home';
import Demo from './Demo';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from "react-router-dom";

class App extends React.Component {

    render() {
        return (
            <Router basename={process.env.PUBLIC_URL}>
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
