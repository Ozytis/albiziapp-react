export type availableLanguages = "fr-FR" | "en-GB";

export const defaultLanguage: availableLanguages = "fr-FR";

type Translations = {
    [lang in availableLanguages]: string;
};

interface Word extends Translations {
    id: string;
}

class TranslationService {
    defaultLanguage = "en-GB";

    dic: { [id: string]: Translations } = {};
    loaded = false;
    lang: availableLanguages = "en-GB";
    languageChangeHandlers: (((language: availableLanguages) => Promise<void>)[]) = [];

    async load() {

        // var response = await axios.get("/translations/main.json?v=" + BaseService.staticVersion);
        // var data = response.data as Word[];

        // this.dic = {};
        // this.languageChangeHandlers = [];

        // data.forEach((word) => {
        //     this.dic[word.id] = word;
        // });

        // this.loaded = true;
        // this.reloadLanguage();
    }

    reloadLanguage() {

        // var lang: availableLanguages = "en-GB";

        // var userJson = localStorage.getItem(AuthenticationApi.userStorageKey);

        // if (userJson) {
        //     var user = JSON.parse(userJson) as UserModel;
        //     lang = user.language as availableLanguages;
        // }

        // this.lang = lang;
    }

    __(value: string, ...args: any[]): string {

        if (!value) {
            return value;
        }

        var word = this.dic[value];

        if (word == null) {
            //console.warn("pas traduit du tout", value);
            return this.format(value, args);
        }

        if (!word[this.lang]) {
            //console.warn("pas traduit en ", this.lang, value);
            return this.format(value, args);
        }

        return this.format(word[this.lang], args);
    }

    async setLanguage(language: availableLanguages) {
        this.lang = language;

        console.log("this.languageChangeHandlers", this, this.languageChangeHandlers);

        for (var handler of this.languageChangeHandlers) {
            await handler(language);
        }
    }

    format = function (input: string, ...args: any[]) {
        return input.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    }

    getLanguage() {
        console.log("getLanguage", this.lang, this);
        return this.lang;
    }



    registerLanguageChangeHandler(handler: (language: availableLanguages) => Promise<void>) {
        this.languageChangeHandlers.push(handler);
    }
}

export const t = new TranslationService();
