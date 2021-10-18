import { Box, Button, createStyles, FormControl, Grid, InputLabel, MenuItem, Select, Switch, Theme, Typography, WithStyles, withStyles, TextField, Checkbox, FormControlLabel, FormGroup } from "@material-ui/core";
import { Undo } from "@material-ui/icons";
import clsx from "clsx";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { BaseComponent } from "../../components/base-component";
import { Confirm } from "../../components/confirm";
import { ErrorSummary } from "../../components/error-summary";
import { Loader } from "../../components/loader";
import { AuthenticationApi } from "../../services/authentication-service";
import { ObservationsApi } from "../../services/observation";
import { t } from "../../services/translation-service";
import { UserEditionModel } from "../../services/generated/user-edition-model";
import { UserRole } from "../../services/generated/user-role";


const styles = (theme: Theme) => createStyles({
    root: {
        minHeight: "calc(100vh - 120px)",
        maxHeight: "calc(100vh - 120px)",
        overflowY: "auto",
        padding: theme.spacing(1),
        color: theme.palette.common.white
    },
    sectionHeading: {
        marginTop: theme.spacing(1),
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        color: theme.palette.primary.light
    },
    formControl: {
        margin: theme.spacing(1),
        width: `calc(100% - ${theme.spacing(2)}px)`,
        color: theme.palette.common.white
    },

    label: {
        margin: theme.spacing(1)
    },
    buttonsDiv: {
        padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
        display: "flex",
        justifyContent: "center",
        "&>button": {
            marginRight: theme.spacing(1)
        }
    },
});

interface EditUserPageProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {

}

class EditUserPageState {
    isProcessing = false;
    errors: string[];
    model = new UserEditionModel();
    expert: boolean;
    administrator: boolean;

}


class EditUserAdminPageComponent extends BaseComponent<EditUserPageProps, EditUserPageState>{
    constructor(props: EditUserPageProps) {
        super(props, "EditUserPage", new EditUserPageState());
    }

    async componentDidMount() {
        const user = await AuthenticationApi.getUser(this.props.match.params["userid"]);
        var model = new UserEditionModel();
        model.osmId = user.osmId;
        model.name = user.name;
        model.role = user.role;
        await this.setState({ model: model });
        AuthenticationApi.refreshUser();
        this.seeRole(user.role);

    }

    roleIsChecked(isExpert) {
        if (isExpert) {
            return (this.state.model.role & UserRole.expert) === UserRole.expert;
        }
        return (this.state.model.role & UserRole.administrator) === UserRole.administrator;
    }


    async updateModel(propertyName: string, value: any, role?: any) {
        const model = this.state.model;
        if (propertyName == "role") {
            if (value) {
                if (role == 1) {
                    model.role += UserRole.expert;
                }
                if (role == 2) {
                    model.role += UserRole.administrator;
                }
            }
            else {
                if (role == 1) {
                    model.role -= UserRole.expert;
                }
                if (role == 2) {
                    model.role -= UserRole.administrator;
                };
            }
            await this.setState({ model: model });
        }
        else {
            model[propertyName] = value;
            await this.setState({ model: model });
        }
    }

    async cancelCreation() {
        ObservationsApi.setNextObservationCoordinates(null);
        await this.props.history.push({
            pathname: "/users"
        });
    }
    async process() {
        if (this.state.isProcessing || !await Confirm(t.__("Etes vous sûr de vouloir valider cet utilisateur ?"))) {
            return;
        }

        await this.setState({ isProcessing: true, errors: [] });

        const result = await AuthenticationApi.editUserAdmin(this.state.model);

        if (!result.success) {
            await this.setState({
                isProcessing: false,
                errors: result.errors
            })
        }
        else {
            await this.setState({ isProcessing: false });
            this.props.history.replace({
                pathname: "/users"
            })
        }
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
        if (listRole.length < 1) {
            return;
        }
        else if (listRole.length == 1) {
            if (listRole[0] == "expert") {
                this.setState({ expert: true });
            }
            else if (listRole[0] == "administrator") {
                this.setState({ administrator: true });
            }
            return;
        }
        else {
            this.setState({ administrator: true, expert: true });
            return;
        }
    }

    render() {

        const { classes } = this.props;
        const { model, administrator, expert } = this.state;
  
        return (
            <Box className={clsx(classes.root)}>

                <ErrorSummary errors={this.state.errors} />

                <Typography variant="h6" className={clsx(classes.sectionHeading)}>{t.__("Nom")}</Typography>
                <FormControl className={clsx(classes.formControl)}>
                    <TextField id="name" value={model.name} onChange={n => this.updateModel("name", n.target.value)} />
                </FormControl>

                <Typography variant="h6" className={clsx(classes.sectionHeading)}>{t.__("Email")}</Typography>
                <FormControl className={clsx(classes.formControl)}>
                    <TextField id="name" value={model.email} onChange={n => this.updateModel("email", n.target.value)} />
                </FormControl>

                <Typography variant="h6" className={clsx(classes.sectionHeading)}>{t.__("Role")}</Typography>
                <Typography component="div">
                    <Grid component="label" container alignItems="center" spacing={1}>
                        <Grid item>
                            <InputLabel className={clsx(classes.label)} >{t.__("Expert")}</InputLabel>
                        </Grid>
                        <Grid item>
                            <Switch
                                checked={this.roleIsChecked(true)}
                                onChange={(val) => this.updateModel("role", val.target.checked, 1)}
                            />
                        </Grid>
                        <Grid item>
                            <InputLabel className={clsx(classes.label)}>{t.__("")}</InputLabel>
                        </Grid>
                    </Grid>
                </Typography>
                <Typography component="div">
                    <Grid component="label" container alignItems="center" spacing={1}>
                        <Grid item>
                            <InputLabel className={clsx(classes.label)}>{t.__("Administrateur")}</InputLabel>
                        </Grid>
                        <Grid item>
                            <Switch

                                checked={this.roleIsChecked(false)}
                                onChange={n => this.updateModel("role", n.target.checked, 2)}
                            />
                        </Grid>
                    </Grid>
                </Typography>


                <Box className={clsx(classes.buttonsDiv)}>
                    <Button color="secondary" variant="contained" fullWidth onClick={() => this.process()}>
                        <Loader loading={this.state.isProcessing} usualIcon="check" />
                        {t.__("Valider")}
                    </Button>

                    <Button color="primary" variant="contained" onClick={() => this.cancelCreation()} fullWidth>
                        <Undo />
                        {t.__("Annuler")}
                    </Button>
                </Box>

            </Box>
        )
    }
}

export const EditUserAdminPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(EditUserAdminPageComponent)));