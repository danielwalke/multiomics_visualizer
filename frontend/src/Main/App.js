import React from 'react';
import './App.css';
import Home from "../Components/Home/Home";
import {createMuiTheme} from "@material-ui/core";
import {ThemeProvider} from "@material-ui/styles";
import {Provider} from "mobx-react";
import DataStore from "../Components/State Management/DataStore";
import ResponseStore from "../Components/State Management/ResponseStore";

const theme = createMuiTheme({
    palette:{
        primary:{
            main: '#000',
        },
    }
})

function App() {
    return (
        <Provider DataStore={DataStore} ResponseStore={ResponseStore}>
            <div className="App" style={{position: "relative", overflow: "hidden"}}>
                <ThemeProvider theme={theme}>
                    <Home/>
                </ThemeProvider>
            </div>
        </Provider>
    );
}

export default App;
