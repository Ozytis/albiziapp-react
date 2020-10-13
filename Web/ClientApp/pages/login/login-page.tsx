import { Avatar, Button, Card, Container, createStyles, Theme, Typography, WithStyles, withStyles } from "@material-ui/core";
import { Lock } from "@material-ui/icons";
import clsx from "clsx";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { BaseComponent } from "../../components/base-component";
import { AuthenticationApi } from "../../services/authentication-service";
import { t } from "../../services/translation-service";

// eslint-disable-next-line
const styles = (theme: Theme) => createStyles({
    root: {
        backgroundImage: "url('./img/ash.jpg')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        maxWidth: "100%",
        margin: 0,
        height: "calc(100vh - 64px)"
    },
    avatar: {
        height: "5vh",
        width: "5vh",
        margin: "auto"
    },
    loginButton: {
        borderRadius: 0
    }
});

interface LoginPageProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {

}

class LoginPageState {

}

class LoginPageComponent extends BaseComponent<LoginPageProps, LoginPageState>{
    constructor(props: LoginPageProps) {
        super(props, "LoginPage", new LoginPageState());
    }

    async connect() {
        await AuthenticationApi.login();
        this.props.history.replace("/map");
    }

    render() {

        const { classes } = this.props;

        return (
            <Container fixed className={clsx(classes.root, "flex", "flex-col", "flex-auto", "flex-shrink-0", "items-center", "justify-center", "p-32")}>
                <Container maxWidth="xs" className={clsx("flex", "flex-1", "justify-center", "items-center")}>
                    <Card className="pt-8">
                        <Avatar className={clsx("self-center", classes.avatar)} >
                            <Lock />
                        </Avatar>
                        <Typography variant="h6" className="text-center">{t.__("Connexion")}</Typography>
                        <Typography variant="body2" className="m-8 p-8 text-center">
                            {t.__("Pour continuer vous devez vous connecter avec un compte OpenStreet Map. Celui-ci vous permettra d'enregistrer votre progression et vos relevés ")}</Typography>

                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={clsx(classes.loginButton, "m-8")}
                            onClick={() => this.connect()}
                        >
                            {t.__("Se connecter avec OpenStreet Map")}
                        </Button>
                    </Card>
                </Container>
            </Container >
        )
    }
}

export const LoginPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(LoginPageComponent)));
//export const LoginPage = LoginPageComponent;