import * as React from "react";
import * as ReactDOM from "react-dom";

import { App } from "./components/App";
import { appConfig } from "./components/AppProps";

$(function () {
    if ($('#hero-search-container').length > 0) {
        ReactDOM.render(
            <App config={appConfig} />,
            document.getElementById("hero-search-container")
        );
    }
});

