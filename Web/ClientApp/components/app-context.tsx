import React from 'react';
import { RouteConfig } from 'react-router-config';
import { PageConfig } from '../pages/page-config';
import { ShortcutType } from './shortcuts-menu';

export interface IAppContext {
    routes: PageConfig[];
    menuIsOpen: boolean;
    updateContext: (property: string, value: any) => Promise<void>;
    title?: string;
    addContextUpdateListener?: (listener :() => Promise<void>) => Promise<void>;
    removeContextUpdateListener?: (listener :() => Promise<void>) => Promise<void>;
}

export const AppContext = React.createContext({} as IAppContext);
export const AppContextConsumer = AppContext.Consumer;

export function withAppContext(Component) {
    return function ComponentBoundWithAppContext(props) {
        return (
            <AppContextConsumer>
                {appContext => <Component {...props} appContext={appContext} />}
            </AppContextConsumer>
        );
    };
}

export interface IPropsWithAppContext {
    appContext: IAppContext;
}