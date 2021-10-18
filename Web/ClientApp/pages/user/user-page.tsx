import { Box, Button, createStyles, List, ListItem, ListItemText, Tab, Theme, WithStyles, withStyles } from "@material-ui/core";
import {  Edit } from "@material-ui/icons";
import clsx from "clsx";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { BaseComponent } from "../../components/base-component";
import { t } from "../../services/translation-service";
import { AuthenticationApi } from "../../services/authentication-service";
import { UserModel } from "../../services/generated/user-model";
import { UserRole } from "../../services/generated/user-role";

const styles = (theme: Theme) => createStyles({
    root: {
        //backgroundColor: theme.palette.primary.main,
        maxWidth: "100vw",
        margin: 0,
        minHeight: "calc(100vh - 120px)",
        maxHeight: "calc(100vh - 120px)",
        overflowY: "auto",
        padding: "1vh 1vw 1vh 1vw"
    },
    tab: {
        //color: theme.palette.common.white,
        outline: "none",
        "&:focus": {
            outline: "none"
        }
    },
    instructions: {
        padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`
    },
    buttonsDiv: {
        padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
        display: "flex",
        justifyContent: "center",
        "&>button": {
            marginRight: theme.spacing(1)
        }
    },
    label: {

    },
    switchGrid: {
        padding: `0 ${theme.spacing(2)}px`
    }
});

interface UserPageProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {

}

class UserPageState {
    user: UserModel;
}

class UserPageComponent extends BaseComponent<UserPageProps, UserPageState>{
    constructor(props: UserPageProps) {
        super(props, "UserPage", new UserPageState());
    }

    async componentDidMount() {
        const user = await AuthenticationApi.getUser(this.props.match.params["userid"]);

        await this.setState({ user: user });
        this.seeRole(user.role);
    }



    async goTo(path: string) {
        this.props.history.replace({
            pathname: path
        });
    }

    getUserRole(role: number) {
        var res = [];
        var word: string;
        if ((role & UserRole.administrator) === UserRole.administrator) {
            word = UserRole[2];
            res.push(word);
        }
        if ((role & UserRole.expert) === UserRole.expert) {
            res.push(UserRole[1]);
        }
        return res;
    }

    seeRole(role: number) {

        var listRole = this.getUserRole(role);
        var roles: string;
        if (listRole.length < 1) {

            return "Aucun";
        }
        else if (listRole.length == 1) {

            return listRole[0];
        }
        else {
            roles = listRole.join(", ");
            return roles;
        }

    }
    async editUser() {
        this.props.history.replace({
            pathname: `/edit-user/${this.state.user.osmId}`
        });
    }


    render() {

        const { classes } = this.props;
        const { user } = this.state;

        if (!user) {
            return <>Chargement</>;
        }




        return (
            <>
                <Box className={clsx(classes.root)}>
                    <Tab label={t.__("Informations")} className={clsx(classes.tab)} value="infos" />
                    <>
                        <List>
                            <ListItem>
                                <ListItemText primary={t.__("Nom d'utilisateur")} secondary={user.name} />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary={t.__("Adresse email")} secondary={user.email} />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary={t.__("Id de l'utilisateur")} secondary={user.osmId} />
                            </ListItem>
                            <ListItem>
                                <ListItemText primary={t.__("Role de l'utilisateur")} secondary={this.seeRole(user.role)} />
                            </ListItem>
                        </List>
                    </>
                    <Box className={clsx(classes.buttonsDiv)}>
                        <>
                            <Button color="primary" variant="contained" startIcon={<Edit />} onClick={() => this.editUser()}>
                                {t.__("Modifier")}
                            </Button>
                        </>
                    </Box>
                </Box>

            </>
        )
    }
}

export const UserPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(UserPageComponent)));