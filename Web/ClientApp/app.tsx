import { MuiThemeProvider } from "@material-ui/core";
import { BrowserHistory, createBrowserHistory } from 'history';
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { AppContext, IAppContext } from "./components/app-context";
import { Authorization } from "./components/authorization";
import { BaseComponent } from "./components/base-component";
import { Layout } from "./components/layout";
import { Themes } from "./components/theme";
import routes from './routes-config';
import { AuthenticationApi } from "./services/authentication-service";
import { ObservationsApi } from "./services/observation";
import { SpeciesApi } from "./services/species-service";
import * as signalR from "@microsoft/signalr";
import 'react-toastify/scss/main.scss';
import { UserModel } from "./services/generated/user-model";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';





interface AppProps {
    theme?: string;
}

class AppState {

    constructor(context: IAppContext) {
        this.context = context;
    }

    context: IAppContext = null;
    user: UserModel;
}

class App extends BaseComponent<AppProps, AppState>{

    constructor(props: AppProps) {

        super(props, "app", new AppState({
            updateContext: (property: string, value: any) => this.updateContext(property, value),
            menuIsOpen: false,
            routes: routes,
            addContextUpdateListener: (listener) => this.addContextUpdateListener(listener),
            removeContextUpdateListener: (listener) => this.removeContextUpdateListener(listener),
        }));

        this.appHistory = createBrowserHistory();

    }

    async componentDidMount() {

        ObservationsApi.loadObservations();
        SpeciesApi.loadSpecies();
        await this.refreshAuth();
    }

    async removeContextUpdateListener(listener: (newContext: IAppContext, oldContext: IAppContext) => Promise<void>) {
        const index = this.contextUpdateListeners.indexOf(listener);

        console.log("removing context listener", index);

        if (index > -1) {
            this.contextUpdateListeners.splice(index, 1);
        }
    }

    async addContextUpdateListener(listener: (newContext: IAppContext, oldContext: IAppContext) => Promise<void>) {
        this.contextUpdateListeners.push(listener);
    }

    async updateContext(property: string, value: any) {
        const oldContext = this.state.context;
        const context = this.state.context;
        context[property] = value;
        await this.setState({ context: context });

        for (const listener of this.contextUpdateListeners) {
            await listener(context, oldContext);
        }
    }

    async refreshAuth() {
        const currentUser = await AuthenticationApi.getCurrentUser();
        
        
        await this.setState({ user: currentUser });
               

        if (currentUser) {

            var hubConnection = new signalR.HubConnectionBuilder()
                .withUrl("/notifyhub")
                .build();


            hubConnection.on("ReceivedNotif", function (notifContent: string) {

                const notify = () => toast.success(notifContent, {
                    position: toast.POSITION.BOTTOM_CENTER,
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });

                console.log(notify);

                const element =
                    <div onLoad={notify}>
                    <ToastContainer position="bottom-center"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover />
                        </div>;
                ReactDOM.render(element, document.getElementById('toast'));
                notify();
            });

            try {
                await hubConnection.start();
            }
            catch (err) {
                console.error(err);
            };

        }

    }

    appHistory: BrowserHistory;
    router: BrowserRouter;

    contextUpdateListeners: ((newContext: IAppContext, oldContext: IAppContext) => Promise<void>)[] = [];

    render() {

        const props = this.props;
        const { context } = this.state;

        console.log("routes", routes);

        return (
            <MuiThemeProvider
                theme={Themes[props.theme || "main"]}
            >
                
                <AppContext.Provider value={context}>
                    <BrowserRouter ref={router => this.router = router} >
                        <Authorization>
                            <Layout>
                                
                            </Layout>
                        </Authorization>
                    </BrowserRouter>
                </AppContext.Provider>
            </MuiThemeProvider>
           
        )

    }
}

AuthenticationApi.refreshUser().then(() => {
    ReactDOM.render(<App />, document.getElementById('root'));
});

if (navigator.serviceWorker) {
    console.log("REGISTER sw");
    navigator.serviceWorker.register("/sw.js").then((r) => console.log("REGISTER SUCCESS",r)).catch(err => console.error(err));
}

