import { Box, Button, createStyles, Icon, Theme, WithStyles, withStyles, Switch} from "@material-ui/core";
import { Check, Delete, NearMe, Cancel, Add, ViewList } from "@material-ui/icons";
import clsx from "clsx";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { IPropsWithAppContext, withAppContext } from "../../components/app-context";
import { BaseComponent } from "../../components/base-component";
import { Confirm } from "../../components/confirm";
import { ObservationModel } from "../../services/generated/observation-model";
import { ObservationsApi } from "../../services/observation";
import { t } from "../../services/translation-service";
import { AuthenticationApi } from "../../services/authentication-service";
import { MapPosition } from "../../components/mapPosition";
import { ObservationStatementModel } from "../../services/generated/observation-statement-model";
import { AddObservationStatementConfirmationModel } from "../../services/generated/add-observation-statement-confirmation-model";
import { PhotoFormItem } from "../../components/photo-form-item";
import { UserRole } from "../../services/generated/user-role";

const styles = (theme: Theme) => createStyles({
    root: {
        //backgroundColor: theme.palette.primary.main,
        maxWidth: "100vw",
        margin: 0,
        height: "calc(" + window.innerHeight + "px - 112px)",
        maxHeight: "calc(100vh - 120px)",
        overflowY: "auto",
        padding: "1vh 1vw 1vh 1vw",
        marginBottom: "15%"
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
    switchGrid: {
        padding: `0 ${theme.spacing(2)}px`
    },
    flex: {
        display: "flex",
        justifyContent: "space-between"
    },
    bold: {
        fontWeight: "bold"
    },
    certain: {
        fontWeight: "bold",
        color: "white",
        backgroundColor: "#267F00",
        marginTop: "1%"
    },
    alignRight: {
        marginLeft: "50%",
        right: "1px",
    },
    slider: {
        position: "relative",
        marginLeft: "auto",
        marginRight: "auto",
    },
    slide: {
        // position: "absolute",
        top: 0,
        //height: "100%",
        backgroundColor: "#fff",
        backgroundPosition: "center center",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat"
    },
    slideNav: {
        justifyContent: "center",
        display: "flex",
        padding: theme.spacing(1),
        "& > span ": {
            marginRight: theme.spacing(1),
            fontSize: "1rem"
        },
        "& .linkActive": {
            color: theme.palette.secondary.main
        }
    },
    center: {
        marginLeft: "auto",
        marginRight: "auto"
    },
    tabConfiance: {
        width: "20%",
        border: "solid 1px black",
        textAlign: "center",
        cursor: "pointer"
    },
    top: {
        padding: "1%"
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    trait: {
        borderBottom: "1px solid black",
        width: "95%",
        //marginTop: "2%"
    },
    score: {
        fontSize: "small",
        color: "gray"
    },
    textArea: {
        width: "100%",
        border: "solid 1px black"
    },
    switch: {
        position: "absolute",
        opacity: 0,
    },
    tacenter: {
        textAlign:"center"
    }
});

interface ObservationPageProps extends RouteComponentProps, IPropsWithAppContext, WithStyles<typeof styles> {

}

class ObservationPageState {
    observation: ObservationModel;
    currentTab = "common";
    isDeleting = false;
    isValidated: boolean = false;
    displayAddAndConfirmButton: boolean = true;
    currentUser: string;
    isConfirmating: boolean = true;
    currentPictureIndex = 0;
    isLowConfident: boolean;
    isMediumConfident: boolean;
    isHighConfident: boolean;   
    isLessThan2m: boolean;   
    isBetween2And5m: boolean;   
    isBetween5And10m: boolean;   
    isMoreThan10m: boolean;   
    filteredObservationStatements: ObservationStatementModel[];
    firstObservationStatement: ObservationStatementModel;
    enableEditAndDeleteButton: boolean;
    genusSelectedRadio: number;
    speciesSelectedRadio: number;
    confirmationStatement = new AddObservationStatementConfirmationModel();
    addPictures: string[];
    isAddingPic: boolean;
    isUpdatingTreeSize: boolean;
    newTreeSize: number = null;
    isAddingCommentary: boolean;
    newCommentary: string="";
    validatedC: string="";
    validatedL: string = "";
    myObservation: ObservationStatementModel;
    currentUserRole: UserRole;
    currentUserName: string;
    isCertain: boolean = false;
    certainStatementId: string = "";
    isMakingCertain: boolean = true;
    validatedStatementId :string = "";

}

class ObservationPageComponent extends BaseComponent<ObservationPageProps, ObservationPageState>{
    constructor(props: ObservationPageProps) {
        super(props, "ObservationPage", new ObservationPageState());
    }

    async componentDidMount() {
        const observation = await ObservationsApi.getObservationById(this.props.match.params["observationid"]);
        const currentUser = await AuthenticationApi.getCurrentUser();
        console.log(observation);

        await this.setState({ observation: observation, currentUser: currentUser.osmId, currentUserRole: currentUser.role, currentUserName: currentUser.name, isCertain: observation.isCertain }); 
        if (observation.statementValidatedId != null && observation.statementValidatedId !=""){
            await this.setState({ validatedStatementId: observation.statementValidatedId });
        }
        this.filterObservationStatements();
        this.isEditAndDeleteEnable();
        this.canAddOrConfirmStatement();
        this.checkTreeSize();
        this.getValidatedStatement();
    }

    async filterObservationStatements() {
        const os = this.state.observation.observationStatements;
        const cu = this.state.currentUser;
        const fot = os.find(x => x.order = 1);
            this.setState({ firstObservationStatement: fot }); 
            const filteredOs = os.filter(x => x.order != 1);
        this.setState({ filteredObservationStatements: filteredOs });
        const myObs = os.find(x => x.userId == cu);
        this.setState({ myObservation: myObs });

    }

    async checkTreeSize() {
        const obsTS = this.state.observation.treeSize;
        console.log(obsTS);
        if (obsTS != null) {
            if (obsTS == 0) {
                await this.setState({ isLessThan2m: true, isUpdatingTreeSize:false });
            }
            if (obsTS == 1) {
                await this.setState({ isBetween2And5m: true, isUpdatingTreeSize: false });
            }
            if (obsTS == 2) {
                await this.setState({ isBetween5And10m: true, isUpdatingTreeSize: false });
            }
            if (obsTS == 3) {
                await this.setState({ isMoreThan10m: true, isUpdatingTreeSize: false });
            }
        }
        else return;
    }

    async remove() {

        if (this.state.isDeleting || ! await Confirm(t.__("Etes-vous sûr de vouloir supprimer ce relevé ?"))) {
            return;
        }

        await this.setState({ isDeleting: true });
        const result = await ObservationsApi.deleteObservation(this.state.observation);
        await this.setState({ isDeleting: false });

        if (result.success) {
            this.props.history.replace({
                pathname: "/map"
            })
        }
    }

    async editObservation() {
        this.props.history.push({
            pathname: `/edit-observation/${this.state.observation.id}`
        });
    }

    async addStatement() {
        this.props.history.push({
            pathname: `/new-observation/${this.state.observation.id}`
        });
    }

    async goTo(path: string) {
        this.props.history.replace({
            pathname: path
        });
    }
    async updateLocalStorage() {
        var now = new Date();
        localStorage.setItem("mapPosition", JSON.stringify({ Latitude: this.state.observation.latitude, Longitude: this.state.observation.longitude, Zoom: 18, Date: now } as MapPosition));
    }

    async confirmStatement() {
        
            if (this.state.genusSelectedRadio) {
                const observationId = this.state.observation.id;
                var isOnlyGenus =false;
                var statementId;
                if (this.state.speciesSelectedRadio != null && this.state.speciesSelectedRadio != 0) {
                    statementId = this.state.observation.observationStatements.find(x => x.order == this.state.speciesSelectedRadio).id;
                }
                else {
                    statementId = this.state.observation.observationStatements.find(x => x.order == this.state.genusSelectedRadio).id;
                    isOnlyGenus = true;
                }             
                const cs = this.state.confirmationStatement;
                if (this.state.isLowConfident) {
                    cs.confident = 0;
                }
                if (this.state.isMediumConfident) {
                    cs.confident = 1;
                }
                if (this.state.isHighConfident) {
                    cs.confident = 2;
                }

                cs.observationId = observationId;
                cs.statementId = statementId;
                cs.isOnlyGenus = isOnlyGenus;
                const result = await ObservationsApi.confirmStatement(cs);

                if (result.success) {
                    const observation = await ObservationsApi.getObservationById(this.props.match.params["observationid"]);
                    this.hideConfirmation();
                    await this.setState({ displayAddAndConfirmButton: false, observation: observation });
                    this.filterObservationStatements();
                }
            }
            else {
                await ObservationsApi.notifError(AuthenticationApi.getCurrentUser().osmId, "Vous devez sélectionner au moins le genre pour confirmer");
            }        
        
            
        
    }

    async showConfirmation() {
        if (this.state.isConfirmating) {
            await this.setState({ isConfirmating: false });
        }
        else{
            await this.confirmStatement();
        }
    }

    async hideConfirmation() {

        if (!this.state.isConfirmating) {
            await this.setState({ isConfirmating: true, genusSelectedRadio: 0, speciesSelectedRadio:0 });
        }
    }

    async updateConfident(level: string) {

        if (level == "low") {
            if (this.state.isLowConfident) {
                await this.setState({ isLowConfident:false })
            }
            else if (!this.state.isLowConfident) {
                await this.setState({ isLowConfident: true, isMediumConfident:false, isHighConfident:false })
            }
        }

        if (level == "medium") {
            if (this.state.isMediumConfident) {
                await this.setState({ isMediumConfident: false })
            }
            else if (!this.state.isMediumConfident) {
                await this.setState({ isMediumConfident: true, isLowConfident:false, isHighConfident:false })
            }
        }

        if (level == "high") {
            if (this.state.isHighConfident) {
                await this.setState({ isHighConfident: false })
            }
            else if (!this.state.isHighConfident) {
                await this.setState({ isHighConfident: true, isLowConfident: false, isMediumConfident:false })
            }
        }

    }
    async updateTreeSize() {
        if (! await Confirm(t.__("Etes-vous sûr de vouloir changer la hauteur de l'arbre de ce relevé ?"))) {
            return;
        }
            const observationId = this.state.observation.id;
            const result = await ObservationsApi.updateTreeSize(this.state.newTreeSize, observationId);

            if (result.success) {
                const observation = await ObservationsApi.getObservationById(this.props.match.params["observationid"]);
                await this.setState({ observation: observation});
                this.filterObservationStatements();
                this.checkTreeSize();
            }

            else {
                await ObservationsApi.notifError(AuthenticationApi.getCurrentUser().osmId, "La hauteur n'a pas pu être changé");
            }
    }

    async setTreeSize(level: number) {


        if (level == this.state.observation.treeSize) {
            await this.setState({ isUpdatingTreeSize: false });
        }
        else if (level != this.state.observation.treeSize) {
            await this.setState({ isUpdatingTreeSize: true });
        }

        if (level == 0) {
            if (this.state.isLessThan2m) {
                await this.setState({ isLessThan2m: false, newTreeSize: null, isUpdatingTreeSize: false })
            }
            else if (!this.state.isLessThan2m) {
                await this.setState({ isLessThan2m: true, isBetween2And5m: false, isBetween5And10m: false, isMoreThan10m: false, newTreeSize: 0})
            }
        }

        if (level == 1) {
            if (this.state.isBetween2And5m) {
                await this.setState({ isBetween2And5m: false, newTreeSize: null, isUpdatingTreeSize: false })
            }
            else if (!this.state.isBetween2And5m) {
                await this.setState({ isBetween2And5m: true, isLessThan2m: false, isBetween5And10m: false, isMoreThan10m: false, newTreeSize: 1 })
            }
        }

        if (level == 2) {
            if (this.state.isBetween5And10m) {
                await this.setState({ isBetween5And10m: false, newTreeSize: null, isUpdatingTreeSize: false })
            }
            else if (!this.state.isBetween5And10m) {
                await this.setState({ isBetween5And10m: true, isLessThan2m: false, isBetween2And5m: false, isMoreThan10m: false, newTreeSize: 2 })
            }
        }
        if (level == 3) {
            if (this.state.isMoreThan10m) {
                await this.setState({ isMoreThan10m: false, newTreeSize: null, isUpdatingTreeSize: false })
            }
            else if (!this.state.isMoreThan10m) {
                await this.setState({ isMoreThan10m: true, isLessThan2m: false, isBetween2And5m: false, isBetween5And10m: false, newTreeSize: 3 })
            }
        }

    }
    endSwipe(e: React.TouchEvent<HTMLElement>): void {

        if (!this.swipeStartLocation || !this.state.observation || !this.state.observation.pictures || this.state.observation.pictures.length < 2) {
            return;
        }

        const touch = e.changedTouches[0];

        const distance = touch.clientX - this.swipeStartLocation.x;
        const absX = Math.abs(distance);

        if (absX > 50) {

            let index = this.state.currentPictureIndex;
            index += distance < 0 ? 1 : -1;

            if (index > 0) {
                index = index % this.state.observation.pictures.length;
            }
            else if (index < 0) {
                index = this.state.observation.pictures.length + index;
            }

            this.setState({ currentPictureIndex: index });
        }
    }
    startSwipe(e: React.TouchEvent<HTMLElement>): void {
        //e.preventDefault();
        this.swipeStartLocation = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    swipeStartLocation: { x: number; y: number } = null;

    async isEditAndDeleteEnable() {
        const fot = this.state.firstObservationStatement;
        const os = this.state.filteredObservationStatements;
        const cu = this.state.currentUser;
        console.log(this.state.observation.userId);
        if (this.state.observation.userId == cu && os.length == 0 && (fot.observationStatementConfirmations == undefined || fot.observationStatementConfirmations.length == 0)) {
            await this.setState({ enableEditAndDeleteButton: true})
        }
        else {
            await this.setState({ enableEditAndDeleteButton: false})
        }
    }

    async canAddOrConfirmStatement() {
        const os = this.state.observation.observationStatements;
        const cu = this.state.currentUser;
        const fot = this.state.firstObservationStatement;
        const res = os.find(x => x.userId === cu);
        const osc = os.find(x => x.observationStatementConfirmations != null && x.observationStatementConfirmations.find(sc => sc.userId == cu));
        if (res == undefined && osc == undefined && (fot == null || fot.userId !=cu)) {
            await this.setState({ displayAddAndConfirmButton: true })
        }
        else {
            await this.setState({ displayAddAndConfirmButton: false })
        }
    }

    async confirmGenusStatement(val) {
        if (this.state.genusSelectedRadio == val) {
            await this.setState({ genusSelectedRadio: null, speciesSelectedRadio: null });
        }
        else {
            await this.setState({ genusSelectedRadio: val });
        }
        
    }
    async confirmSpeciesStatement(val) {
        if (this.state.speciesSelectedRadio == val) {
            await this.setState({ speciesSelectedRadio: null, genusSelectedRadio: null });
        }
        else {
            await this.setState({ speciesSelectedRadio: val, genusSelectedRadio: val });
        }
    }
    async addPicture(value: any) {

        let pictures = this.state.addPictures;  
        if (pictures == null) {

            pictures = [];
        }
        pictures.push(value);
        await this.setState({ addPictures: pictures });
    }
    async deletePicture(index: any) {

        const pictures = this.state.addPictures;
        if (pictures == null) {

            return;
        }
        pictures.splice(index, 1);
        await this.setState({ addPictures: pictures });
    }
    async updatePicture() {

            const observationId = this.state.observation.id;
            const result = await ObservationsApi.addPictures(this.state.addPictures,observationId);

            if (result.success) {
                const observation = await ObservationsApi.getObservationById(this.props.match.params["observationid"]);
                await this.setState({observation: observation, isAddingPic:false, addPictures:[] });
                this.filterObservationStatements();

            }
        
        else {
            await ObservationsApi.notifError(AuthenticationApi.getCurrentUser().osmId, "Les photos n'ont pas pu etre ajouter");
        }



    }

    async updateCommentary(com: string) {
        this.setState({ newCommentary: com });
    }

    async addCommentary(stat :string) {
        const observationId = this.state.observation.id;
        let isAddingCom = this.state.isAddingCommentary;
        if (stat == "confirm") {
            if (isAddingCom) {
                const result = await ObservationsApi.addCommentary(this.state.newCommentary, observationId);
                if (result.success) {
                    const observation = await ObservationsApi.getObservationById(this.props.match.params["observationid"]);
                    await this.setState({ observation: observation,isAddingCommentary:false,newCommentary:"" });
                    this.filterObservationStatements();
                }

                else {
                    await ObservationsApi.notifError(AuthenticationApi.getCurrentUser().osmId, "Le commentaire n'a pas pu être ajouté");
                }
            }
            else {
                this.setState({ isAddingCommentary: true})
            }
        }
        if (stat == "cancel") {
            this.setState({ isAddingCommentary: false, newCommentary:""})
        }
    }
    setDateFormat(date: string) {
        if (date != null) {
            return new Date(date).toLocaleDateString()
        }
        return "";

    }

    async updateCurrentTab(val: string) {
        await this.setState({ currentTab: val });
        console.log(this.state.currentTab);
    }

    async getValidatedStatement() {

            if (this.state.observation.isIdentified) {
                const validatedL = this.state.observation.observationStatements.find(x => x.id == this.state.observation.statementValidatedId).speciesName;
                const validatedC = this.state.observation.observationStatements.find(x => x.id == this.state.observation.statementValidatedId).commonSpeciesName;
                await this.setState({ validatedC: validatedC,validatedL:validatedL })
            }
        
    }

    async updateIsCertain() {
        if (!await Confirm("Voulez-vous indiquer ce relevé comme certain?")) {
            return;
        }
        await this.setState({ isCertain: true, isMakingCertain: true });
        await ObservationsApi.updateIsCertain(this.state.observation.id, this.state.certainStatementId, this.state.currentUserName);
        await this.componentDidMount();
    }

    async confirmCertainStatement(val) {
        if (this.state.certainStatementId == val) {
            await this.setState({ certainStatementId: null});
        }
        else {
            await this.setState({ certainStatementId: val });
        }

    }

    render() {

        const { classes } = this.props;
        const { observation, enableEditAndDeleteButton, filteredObservationStatements, firstObservationStatement, myObservation } = this.state;
        if (!observation) {
            return <>Chargement</>;
        }

        let isCertain;
        if (!this.state.isCertain && this.state.isMakingCertain && firstObservationStatement) {
            isCertain =
                <Button color="primary" variant="contained" fullWidth startIcon={<Check />} onClick={() => this.setState({ isMakingCertain: false, certainStatementId : firstObservationStatement.id })}>
                    {t.__("Indiquer comme certain")}
                </Button>;            
        }
        else if (!this.state.isCertain && !this.state.isMakingCertain) {
            isCertain =
                <Box className={clsx(classes.buttonsDiv)}>
                <Button color="primary" variant="contained" fullWidth startIcon={<Check />} onClick={() => this.updateIsCertain()}>
                    {t.__("Valider")}
                </Button>
                <Button color="secondary" variant="contained" fullWidth startIcon={<Cancel />} onClick={() => this.setState({isMakingCertain : true, certainStatementId : ""})}>
                    {t.__("Annuler")}
                </Button>
                </Box>
                ;  
        }
        return (
            <>
                <Box className={clsx(classes.root)}>
                    {observation.isIdentified &&
                        <div style={{ backgroundColor: "#267F00", color: "white", borderRadius: "3px" }}>
                            <span style={{ marginLeft: "1%" }}>Identification certaine</span>
                        {this.state.currentTab == "common" &&
                            <span style={{ float: "right", marginRight: "1%" }}>{this.state.validatedC}</span>
                            }
                            {this.state.currentTab == "latin" &&
                            <span style={{ float: "right", marginRight: "1%" }}>{this.state.validatedL}</span>
                            }
                        </div>
                    }
                    <Box>
                        <div>
                            <table style={{ marginTop:"2%",marginLeft: "auto", marginRight: "auto", border: "solid 1px black", width: "50%", height: "15px", borderRadius: "25px" }}>
                                <tbody>
                                    <tr style={{cursor:"pointer"}}>
                                    <td onClick={() => this.updateCurrentTab("common")}
                                        style={{ textAlign: "center", width: "50%", backgroundColor: this.state.currentTab == "common" ? "green" : "white", color: this.state.currentTab == "common" ? "white" : "black" }}>
                                        COMMUN
                                    </td>
                                    <td onClick={() => this.updateCurrentTab("latin")}
                                        style={{ textAlign: "center", width: "50%", backgroundColor: this.state.currentTab == "latin" ? "green" : "white", color: this.state.currentTab == "latin" ? "white" : "black" }}>
                                        LATIN
                                    </td>
                                    </tr>
                                    </tbody>
                            </table>
                        </div>
                        <div className={clsx(classes.flex)}>
                            <span className={clsx(classes.bold)}>
                                Identification:(
                                {this.state.observation.observationStatements &&
                                    <span style={{ fontWeight: "normal", textDecoration: "underline", cursor:"pointer" }} onClick={() => this.goTo(`/history/${observation.id}`)}>{this.state.observation.observationStatements.length}</span>
                                }
                                )
                            </span>
                            {this.state.isCertain && this.state.observation.isCertain &&
                                <div>
                                <p className={clsx(classes.certain, classes.tacenter)}>CERTAIN</p>
                                <p>{t.__("Par : " + this.state.observation.isCertainBy)}</p>
                            </div>
                            }
                        </div>
                        
                    {
                        this.state.currentTab === "common" &&
                            <> 
                                <table style={{ marginTop: "3%", textAlign: "center", width:"100%" }} className={clsx(classes.center)}>
                                    <thead>
                                        <tr className={clsx(classes.bold)}>
                                            <th style={{ width: "35%" }}></th>
                                            <th style={{ width: "3%" }}></th>
                                            <th style={{ width: "3%" }}></th>
                                            <th style={{ width: "3%" }}></th>
                                            <th style={{ width: "25%" }}>Genre</th>
                                            <th style={{ width: "25%" }}>Espèce</th>
                                            <th style={{ width: "3%" }}></th>
                                            <th style={{ width: "3%" }}></th>
                                        </tr>
                                    </thead>                                    
                                    <tbody>
                                        <tr>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                        {
                                            firstObservationStatement &&
                                            <tr className={this.state.validatedStatementId == firstObservationStatement.id ? clsx(classes.certain) : ""}>
                                                <td className={clsx(classes.bold)}>Proposition initiale</td>
                                                <td className={clsx(classes.score)}>{firstObservationStatement.totalScore}</td>
                                                <td><input hidden={this.state.isMakingCertain} type="radio" name="certainStatement" value={firstObservationStatement.id} checked={firstObservationStatement.id == this.state.certainStatementId} onClick={() => this.setState({ certainStatementId: firstObservationStatement.id })} /> </td>
                                                <td><input hidden={this.state.isConfirmating} type="radio" name="confirmationGenus" value={firstObservationStatement.order} checked={firstObservationStatement.order == this.state.genusSelectedRadio} onClick={() => this.confirmGenusStatement(firstObservationStatement.order)} /> </td>
                                            <td>{firstObservationStatement.commonGenus}</td>
                                                <td>{firstObservationStatement.commonSpeciesName}</td>
                                                <td><input type="radio" hidden={this.state.isConfirmating} name="confirmationSpecies" disabled={firstObservationStatement.commonSpeciesName == null} value={firstObservationStatement.order} checked={firstObservationStatement.order == this.state.speciesSelectedRadio} onClick={() => this.confirmSpeciesStatement(firstObservationStatement.order)} /> </td>
                                                <td className={clsx(classes.score)}>{firstObservationStatement.totalScoreSpecies}</td>
                                            </tr>
                                        }
                                        {
                                            filteredObservationStatements &&
                                            <tr className={clsx(classes.trait)}>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                        }
                                        {
                                            filteredObservationStatements && filteredObservationStatements.map((os, index) => {                                       
                                        
                                                if (index == 0) {
                                                    return (
                                                        <tr key={"CommonObservationStatement-" + index} className={this.state.validatedStatementId == os.id ? clsx(classes.certain) : ""}>
                                                            <td className={clsx(classes.bold)}>Proposition de la communauté</td>
                                                            <td className={clsx(classes.score)}>{os.totalScore}</td>
                                                            <td><input hidden={this.state.isMakingCertain} type="radio" name="certainStatement" value={os.id} checked={os.id == this.state.certainStatementId} onClick={() => this.setState({ certainStatementId: os.id })} /> </td>
                                                            <td><input hidden={this.state.isConfirmating} type="radio" name="confirmationGenus" value={os.order} checked={os.order == this.state.genusSelectedRadio} onClick={() => this.confirmGenusStatement(os.order)}/> </td>
                                                            <td>{os.commonGenus}</td>
                                                            <td>{os.commonSpeciesName}</td>
                                                            <td><input hidden={this.state.isConfirmating} type="radio" name="confirmationSpecies" value={os.order} disabled={os.commonSpeciesName == null} onClick={() => this.confirmSpeciesStatement(os.order)} /> </td>
                                                            <td className={clsx(classes.score)}>{os.totalScoreSpecies}</td>
                                                        </tr>
                                                    )
                                                }
                                                else {
                                                    return (
                                                        <tr key={"CommonObservationStatement-" + index} className={this.state.validatedStatementId == os.id ? clsx(classes.certain) : ""}>
                                                            <td></td>
                                                            <td className={clsx(classes.score)}>{os.totalScore}</td>
                                                            <td><input hidden={this.state.isMakingCertain} type="radio" name="certainStatement" value={os.id} checked={os.id == this.state.certainStatementId} onClick={() => this.setState({ certainStatementId: os.id })} /> </td>
                                                            <td><input hidden={this.state.isConfirmating} type="radio" name="confirmationGenus" value={os.order} onClick={() => this.confirmGenusStatement(os.order)}  /> </td>
                                                            <td>{os.commonGenus}</td>
                                                            <td>{os.commonSpeciesName}</td>
                                                            <td><input type="radio" hidden={this.state.isConfirmating} name="confirmationSpecies" disabled={os.commonSpeciesName == null} value={os.order} onClick={() => this.confirmSpeciesStatement(os.order)} /> </td>
                                                            <td className={clsx(classes.score)}>{os.totalScoreSpecies}</td>
                                                        </tr>
                                                 )
                                                }}
                                            )}
                                        {
                                            myObservation &&
                                            <tr className={clsx(classes.trait)}>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </tr>}
                                        {
                                            myObservation &&
                                            <tr >
                                                <td className={clsx(classes.bold)}>Ma proposition</td>
                                                <td className={clsx(classes.score)}>{myObservation.totalScore}</td>
                                                <td></td>
                                                <td></td>
                                                <td>{myObservation.commonGenus}</td>
                                                <td>{myObservation.commonSpeciesName}</td>
                                                <td></td>
                                                <td className={clsx(classes.score)}>{myObservation.totalScoreSpecies}</td>
                                            </tr>
                                        }
                                    </tbody>
                                </table>
                            </>
                    }
                    {
                        this.state.currentTab === "latin" &&
                            
                            <>
                                <table style={{ marginTop: "3%", textAlign: "center", width: "100%" }} className={clsx(classes.center)}>
                                    <thead>
                                        <tr className={clsx(classes.bold)}>
                                            <th style={{ width: "35%" }}></th>
                                            <th style={{ width: "3%" }}></th>
                                            <th style={{ width: "3%" }}></th>
                                            <th style={{ width: "3%" }}></th>
                                            <th style={{ width: "25%" }}>Genre</th>
                                            <th style={{ width: "25%" }}>Espèce</th>
                                            <th style={{ width: "3%" }}></th>
                                            <th style={{ width: "3%" }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                        {
                                            firstObservationStatement &&
                                            <tr className={this.state.validatedStatementId == firstObservationStatement.id ? clsx(classes.certain) : ""}>
                                                <td className={clsx(classes.bold)}>Proposition initiale</td>
                                                <td className={clsx(classes.score)}>{firstObservationStatement.totalScore}</td>
                                                <td><input hidden={this.state.isMakingCertain} type="radio" name="certainStatement" value={firstObservationStatement.id} checked={firstObservationStatement.id == this.state.certainStatementId} onClick={() => this.setState({ certainStatementId: firstObservationStatement.id })} /> </td>
                                                <td><input hidden={this.state.isConfirmating} type="radio" name="confirmationGenus" value={firstObservationStatement.order} checked={firstObservationStatement.order == this.state.genusSelectedRadio} onClick={() => this.confirmGenusStatement(firstObservationStatement.order)} /> </td>
                                                <td>{firstObservationStatement.genus}</td>
                                                <td>{firstObservationStatement.speciesName}</td>
                                                <td><input hidden={this.state.isConfirmating} type="radio" name="confirmationSpecies" disabled={firstObservationStatement.speciesName == null} value={firstObservationStatement.order} checked={firstObservationStatement.order == this.state.speciesSelectedRadio} onClick={() => this.confirmSpeciesStatement(firstObservationStatement.order)} /> </td>
                                                <td className={clsx(classes.score)}>{firstObservationStatement.totalScoreSpecies}</td>
                                            </tr>
                                        }

                                        {
                                            filteredObservationStatements &&
                                            <tr className={clsx(classes.trait)}>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                        }
                                        {
                                            filteredObservationStatements && filteredObservationStatements.map((os, index) => {
                                                if (index == 0) {
                                                    return (
                                                        <tr key={"LatinObservationStatement-" + index} className={this.state.validatedStatementId == os.id ? clsx(classes.certain) : ""}>
                                                            <td className={clsx(classes.bold)}>Proposition de la communauté</td>
                                                            <td className={clsx(classes.score)}>{os.totalScore}</td>
                                                            <td><input hidden={this.state.isMakingCertain} type="radio" name="certainStatement" value={os.id} checked={os.id == this.state.certainStatementId} onClick={() => this.setState({ certainStatementId: os.id })} /> </td>
                                                            <td><input hidden={this.state.isConfirmating} type="radio" name="confirmationGenus" value={os.order} checked={os.order == this.state.genusSelectedRadio} onClick={() => this.confirmGenusStatement(os.order)} /> </td>
                                                            <td>{os.genus}</td>
                                                            <td>{os.speciesName}</td>
                                                            <td><input type="radio" hidden={this.state.isConfirmating} name="confirmationSpecies" value={os.order} disabled={os.commonSpeciesName == null} onClick={() => this.confirmSpeciesStatement(os.order)} /> </td>
                                                            <td className={clsx(classes.score)}>{os.totalScoreSpecies}</td>
                                                        </tr>
                                                    )
                                                }
                                                else {
                                                    return (
                                                        <tr key={"LatinObservationStatement-" + index} className={this.state.validatedStatementId == os.id ? clsx(classes.certain) : ""}>
                                                            <td></td>
                                                            <td className={clsx(classes.score)}>{os.totalScore}</td>
                                                            <td><input hidden={this.state.isMakingCertain} type="radio" name="certainStatement" value={os.id} checked={os.id == this.state.certainStatementId} onClick={() => this.setState({ certainStatementId: firstObservationStatement.id })} /> </td>
                                                            <td><input hidden={this.state.isConfirmating} type="radio" name="confirmationGenus" value={os.order} onClick={() => this.confirmGenusStatement(os.order)} /> </td>
                                                            <td>{os.genus}</td>
                                                            <td>{os.speciesName}</td>
                                                            <td><input hidden={this.state.isConfirmating} type="radio" name="confirmationSpecies" disabled={os.commonSpeciesName == null} value={os.order} onClick={() => this.confirmSpeciesStatement(os.order)} /> </td>
                                                            <td className={clsx(classes.score)}>{os.totalScoreSpecies}</td>
                                                        </tr>
                                                    )
                                                }
                                            }
                                            )}
                                        {
                                            myObservation &&

                                            <tr className={clsx(classes.trait)}>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                        }
                                        {
                                            myObservation &&
                                            <tr>
                                                <td className={clsx(classes.bold)}>Ma proposition</td>
                                                <td className={clsx(classes.score)}>{myObservation.totalScore}</td>
                                                <td></td>
                                                <td></td>
                                                <td>{myObservation.genus}</td>
                                                <td>{myObservation.speciesName}</td>
                                                <td></td>
                                                <td className={clsx(classes.score)}>{myObservation.totalScoreSpecies}</td>
                                            </tr>
                                        }
                                    </tbody>
                                </table>
                                </>
                    }

                    </Box>

                    <Box className={clsx(classes.top)} hidden={this.state.isConfirmating} >
                        <table className={clsx(classes.center)}>
                          <tbody>
                            <tr>
                                <td style={{ width: "20%" }}>Confiance</td>
                                    <td className={clsx(classes.tabConfiance)} style={{ backgroundColor: this.state.isLowConfident ? "green" : "white", color: this.state.isLowConfident ? "white" : "black"  }} onClick={() => this.updateConfident("low")}>
                                    Faible
                                    </td>
                                    <td className={clsx(classes.tabConfiance)} style={{ backgroundColor: this.state.isMediumConfident ? "green" : "white", color: this.state.isMediumConfident ? "white" : "black"  }} onClick={() => this.updateConfident("medium")}>
                                    Moyen   
                                </td>
                                    <td className={clsx(classes.tabConfiance)} style={{ backgroundColor: this.state.isHighConfident ? "green" : "white", color: this.state.isHighConfident ? "white" : "black" }} onClick={() => this.updateConfident("high")} >
                                    Haute
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </Box>

            {   this.state.displayAddAndConfirmButton && !observation.isCertain && 
                        <Box className={clsx(classes.buttonsDiv)}>                        
                            
                            {
                            !this.state.isConfirmating &&
                            <Button color="secondary" disabled={this.state.genusSelectedRadio != null ? false : true}fullWidth variant="contained" startIcon={<Check />} onClick={() => this.showConfirmation()}>
                                {t.__("Confirmer")}
                            </Button> 
                            }
                            {
                            this.state.isConfirmating &&
                            <Button color="secondary" disabled={this.state.isValidated} fullWidth variant="contained" startIcon={<ViewList />} onClick={() => this.showConfirmation()}>
                                { t.__("Sélectionner une proposition")}
                            </Button> 
                        }
                        </Box>
                    }
                    {!this.state.isConfirmating &&
                        <Box className={clsx(classes.buttonsDiv)}>
                            <Button color="default" variant="contained" fullWidth startIcon={<Cancel />} onClick={() => { this.hideConfirmation() }}>
                                {t.__("Annuler")}
                            </Button>
                        </Box>
                    }
                    {
                        this.state.currentUserRole === UserRole.expert && !this.state.observation.isCertain && 

                        <Box className={clsx(classes.top)}>
                            {isCertain}
                            </Box>
                    }
                    <Box className={clsx(classes.slider, classes.top)} onTouchEnd={(e) => this.endSwipe(e)} onTouchStart={(e) => this.startSwipe(e)}>
                        {
                            observation.pictures && observation.pictures.map((image, idx) => {
                                if (idx !== this.state.currentPictureIndex) {
                                    return null;
                                }
                                return (
                                    <div key={idx} className={clsx("slide", classes.slide)} style={{/* backgroundImage: `url("${image}")`*/ }}>
                                        <img src={`/pictures?path=${image}`} style={{ width: "40%", height: "auto", margin: "0 auto" }} />
                                    </div>
                                )
                            })
                        }
                        {
                            observation.pictures && observation.pictures.length > 1 &&
                                <div className={clsx(classes.slideNav)}>
                                    {
                                       observation.pictures.map((_, index) => {
                                           return (
                                                <Icon key={index} className={clsx("fas fa-circle", { linkActive: index === this.state.currentPictureIndex })} onClick={() => this.setState({ currentPictureIndex: index })} />
                                           )
                                       })
                            }
                            </div>
                        }
                    </Box>
                    <div className={clsx(classes.trait, classes.center)}> </div>
                    <PhotoFormItem label={t.__("Ajouter une photo")} value={this.state.addPictures} onAdd={val => this.addPicture(val).then(() => this.setState({ isAddingPic: true }))} onDelete={index => this.deletePicture(index).then(() => this.setState({ isAddingPic: false }))} />
                    {this.state.isAddingPic &&
                        <Box className={clsx(classes.buttonsDiv)}>
                            <Button color="secondary" variant="contained" fullWidth startIcon={<Check />} onClick={() => this.updatePicture()}>
                                {t.__("Valider la photo")}
                            </Button>
                        </Box>
                    }
                    <div className={clsx(classes.trait, classes.center)}> </div>
                    {this.state.displayAddAndConfirmButton && this.state.isConfirmating && !observation.isIdentified &&
                        <Box className={clsx(classes.buttonsDiv)}>
                        <Button color="primary" variant="contained" fullWidth startIcon={<Add />} onClick={() => this.addStatement()}>
                                {t.__("Ajout d'une propostion")}
                            </Button>
                        </Box>
                    }  
                    <Box className={clsx(classes.top)}>
                        <table className={clsx(classes.center)} style={{width:"90%"}}>
                            <tbody>
                                <tr>
                                    <td style={{ width: "20%" }}>Hauteur</td>
                                    <td className={clsx(classes.tabConfiance)} style={{ backgroundColor: this.state.isLessThan2m ? "green" : "white", color: this.state.isLessThan2m ? "white" : "black" }} onClick={() => this.setTreeSize(0)}>
                                        - de 2m
                                    </td>
                                    <td className={clsx(classes.tabConfiance)} style={{ backgroundColor: this.state.isBetween2And5m ? "green" : "white", color: this.state.isBetween2And5m ? "white" : "black" }} onClick={() => this.setTreeSize(1)}>
                                        2m à 5m
                                </td>
                                    <td className={clsx(classes.tabConfiance)} style={{ backgroundColor: this.state.isBetween5And10m ? "green" : "white", color: this.state.isBetween5And10m ? "white" : "black" }} onClick={() => this.setTreeSize(2)} >
                                        5m à 10m
                                </td>
                                    <td className={clsx(classes.tabConfiance)} style={{ backgroundColor: this.state.isMoreThan10m ? "green" : "white", color: this.state.isMoreThan10m ? "white" : "black"  }} onClick={() => this.setTreeSize(3)} >
                                        + de 10m
                                </td>
                                </tr>
                            </tbody>
                        </table>
                        {
                            this.state.isUpdatingTreeSize &&
                        <Box className={clsx(classes.buttonsDiv)}>
                            <Button color="primary" variant="contained" fullWidth startIcon={<Check />} onClick={() => this.updateTreeSize()}>
                                {t.__("Valider la nouvelle taille")}
                            </Button>                           
                            </Box>
                        }
                    </Box>
                    <div className={clsx(classes.trait, classes.center)}> </div>

                                

                    <Box className={clsx(classes.buttonsDiv)}>
                        <Button color="secondary" variant="contained" fullWidth startIcon={<NearMe />} onClick={async () => { await this.updateLocalStorage(); this.goTo("/map") }}>
                            {t.__("Voir sur la map")}
                        </Button>
                    </Box>
                    <div className={clsx(classes.trait, classes.center)}>   </div>
                   
                    {enableEditAndDeleteButton &&
                        <>
                            <Box className={clsx(classes.buttonsDiv)}>
                                <Button color="secondary" variant="contained" fullWidth startIcon={<Delete />} onClick={() => this.remove()}>
                                    {t.__("Supprimer")}
                                </Button>
                            </Box>
                        </>
                    }
           
                    {//observation.observationCommentarys &&
                        <Box>
                            <div style={{ marginTop: "2%", marginLeft: "3%", fontWeight:"bold", textDecoration:"underline" }}>
                                Commentaires ({observation.observationCommentarys && observation.observationCommentarys.length ? observation.observationCommentarys.length : 0})
                                </div>
                            {observation.observationCommentarys && observation.observationCommentarys.map((com, idx) => {
                                return (
                                    <div style={{ fontSize: "small" }} key={"Commentary-" + idx }>
                                        <div style={{ marginTop: "2%", marginLeft: "6%", fontWeight: "bold" }}>
                                            {`${com.userName}, le ${this.setDateFormat(com.date)}`}
                                    </div>
                                    <div style={{ marginTop: "1%", marginLeft: "10%" }}>
                                        {com.commentary}
                                        </div>
                                    </div>
                                )
                            })

                            }
                          
                            {this.state.isAddingCommentary && 
                                <textarea className={clsx(classes.textArea)} value={this.state.newCommentary} onChange={(value) => this.updateCommentary(value.target.value)} />
                            }                           
                                <Box className={clsx(classes.buttonsDiv)}>
                                <Button color="primary" variant="contained" fullWidth startIcon={!this.state.isAddingCommentary ? <Add /> : <Check />} onClick={() => this.addCommentary("confirm")}>
                                    {!this.state.isAddingCommentary &&
                                         t.__("Ajouter un  commentaire") 
                                    }
                                    {this.state.isAddingCommentary &&
                                         t.__("Valider le commentaire") 
                                    }
                                    </Button>
                            </Box>
                            {this.state.isAddingCommentary && 
                                <Box className={clsx(classes.buttonsDiv)}>
                                    <Button color="secondary" variant="contained" fullWidth startIcon={<Cancel />} onClick={() => this.addCommentary("cancel")}>
                                        {t.__("Anuler")}
                                    </Button>
                                </Box>
                            }
                        </Box>
                    }
                </Box>
            </>
        )
    }
}

export const ObservationPage = withStyles(styles, { withTheme: true })(withAppContext(withRouter(ObservationPageComponent)));