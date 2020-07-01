import { createMuiTheme, Theme } from '@material-ui/core/styles';

export const Themes: { [id: string]: Theme } = {
    "main": createMuiTheme({
        palette: {
            primary: { main: "#267F00" }
        }
    })
}