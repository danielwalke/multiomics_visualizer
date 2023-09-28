import React from 'react';
import './App.css';
import Home from "../Components/Home/Home";
import {createMuiTheme} from "@material-ui/core";
import {ThemeProvider} from "@material-ui/styles";
import {Provider} from "mobx-react";
import DataStore from "../Components/State Management/DataStore";
import ResponseStore from "../Components/State Management/ResponseStore";
import { useEffect } from 'react';

const theme = createMuiTheme({
    palette:{
        primary:{
            main: '#000',
        },
    }
})

function App() {

    useEffect(()=>{
        var _paq = window._paq = window._paq || [];
        /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
        _paq.push(["setCookieDomain", "*.multiomics-visualizer.isas.de"]);
        _paq.push(["setDoNotTrack", true]);
        _paq.push(["disableCookies"]);
        _paq.push(['trackPageView']);
        _paq.push(['enableLinkTracking']);
        (function() {
            var u="https://matomo.isas.de/";
            _paq.push(['setTrackerUrl', u+'matomo.php']);
            _paq.push(['setSiteId', '1']);
            var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
            g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
        })();
    }, [])

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
