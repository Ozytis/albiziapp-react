import React from "react";
import { createMuiTheme, MuiThemeProvider, Theme } from '@material-ui/core/styles';
import createPalette from "@material-ui/core/styles/createPalette";

export const Themes: { [id: string]: Theme } = {
    "main": createMuiTheme({
        palette: {
            primary: { main: "#267F00" }
        }
    })
}