import { Box, Button, createStyles, Grid, Icon, InputLabel, List, ListItem, ListItemIcon, ListItemText, Switch, Tab, Tabs, Theme, Typography, WithStyles, withStyles, FormControl, Input } from "@material-ui/core";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { BaseComponent } from "../../components/base-component";
import { ObservationModel } from "../../services/generated/observation-model";
import { SpeciesInfoModel } from "../../services/generated/species-info-model";
import { UserModel } from "../../services/generated/user-model";
import { AuthenticationApi } from "../../services/authentication-service";
import clsx from "clsx";
import { ChevronRight } from "@material-ui/icons";
import { UserRole } from "../../services/generated/user-role";

const styles = (theme: Theme) => createStyles({
    root: {
        marginBottom: theme.spacing(6)
    },
    card: {
        //color: theme.palette.common.white,
        cursor: "pointer",
    },
    formControl: {
        margin: theme.spacing(1),
        width: `calc(100% - ${theme.spacing(6)}px)`,
        color: theme.palette.common.white
    },
});

interface UsersPageProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {
}

class UsersPageState {
    users: UserModel[];
    search: string;
}

class UsersPageComponent extends BaseComponent<UsersPageProps, UsersPageState>{
    timeout: any;

    constructor(props: UsersPageProps) {
        super(props, "users", new UsersPageState());
    }
    async componentDidMount() {
        const users = await AuthenticationApi.searchUsers("");
        await this.setState({ users: users });
    }

    async goTo(path: string) {
        this.props.history.push({
            pathname: path
        })
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

    async updateSearch(search: string) {
        await this.setState({ search: search });
        if (this.timeout != null) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(async () => { await this.searchUsers(); }, 500);
    }
    async searchUsers() {
        const users = await AuthenticationApi.searchUsers(this.state.search);
        await this.setState({ users: users });
    }

    render() {
        const { classes } = this.props;
        return (
            <Box className={clsx(classes.root)}>
                <FormControl className={clsx(classes.formControl)}>
                    <Input type="text" value={this.state.search} onChange={e => this.updateSearch(e.target.value)} placeholder="Chercher un utilisateur" />
                </FormControl>
                <List>
                    {
                        this.state.users && this.state.users.map(user => {
                            return (
                                <ListItem key={user.id} onClick={() => this.goTo(`user/${user.osmId}`)} className={clsx(classes.card)}>
                                    <ListItemText primary={user.name} secondary={`OSM ID : ${user.osmId} / Role(s) : ${this.seeRole(user.role)}`} />
                                    <ListItemIcon>
                                        <ChevronRight />
                                    </ListItemIcon>
                                </ListItem>
                            )
                        })
                    }
                </List>
            </Box>
        )
    }
}

export const UsersPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(UsersPageComponent)));