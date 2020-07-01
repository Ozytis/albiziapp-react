import React from "react";

export class BaseComponent<P, S> extends React.Component<P, S> {

    persistentStatePrefix = "persistent-state-";

    constructor(props: P, public componentKey?: string, state?: S) {
        super(props);

        this.loadInitialState(state);
    }

    setState<K extends keyof S>(newState: ((prevState: Readonly<S>, props: P) => (Pick<S, K> | S)) | (Pick<S, K> | S)): Promise<void>;

    setState<K extends keyof S>(newState: ((prevState: Readonly<S>, props: P) => (Pick<S, K> | S)) | (Pick<S, K> | S), callback: () => void): void;

    setState<K extends keyof S>(newState: ((prevState: Readonly<S>, props: P) => (Pick<S, K> | S)) | (Pick<S, K> | S), callback?: () => void) {

        if (callback) {
            super.setState(newState, callback);
        }
        else {
            return new Promise<void>(resolve => {
                super.setState(newState, () => { resolve(); });
            });
        }

    }

    checkStatePropertyFalse(propertyName: string) {

        return new Promise((resolve, reject) => {

            // eslint-disable-next-line
            if (!!this.state[propertyName]) {
                reject();
            }
            else {
                resolve();
            }
        });
    }

    getStorageKey() {
        return `${this.persistentStatePrefix}${this.componentKey}-state`;
    }

    clearPersistantState() {
        localStorage.removeItem(this.getStorageKey());
    }

    loadInitialState(state: S) {

        state = state || {} as S;

        const persistedState = localStorage.getItem(this.getStorageKey());

        if (persistedState) {

            const persisted = JSON.parse(persistedState);

            for (const prop in persisted) {
                state[prop] = persisted[prop];
            }
        }

        // eslint-disable-next-line
        this.state = state;
    }

    setPersistantState<K extends keyof S>(state: ((prevState: Readonly<S>, props: P) => (Pick<S, K> | S)) | (Pick<S, K> | S)) {
        return new Promise<any>((resolve) => {

            super.setState(state, () => {

                const existingJSON = localStorage.getItem(this.getStorageKey());
                let existing: any = {};


                if (existingJSON) {
                    existing = JSON.parse(existingJSON);
                }

                for (const prop in (state as any)) {
                    existing[prop] = state[prop];
                }

                localStorage.setItem(this.getStorageKey(), JSON.stringify(existing));

                resolve();
            });
        });
    }
}

export class BaseComponentWithModel<P, S extends { model: any }> extends BaseComponent<P, S>
{
    async updateModel(property: string, value: any) {

        const model = this.state.model;

        if (!model) {
            throw "pas de model défini pour l'état de ce composant";
        }

        model[property] = value;

        return await this.setState({ model: model });
    }
}
