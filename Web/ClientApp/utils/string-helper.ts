export class StringHelper {

    public static isNullOrEmpty(str : string) {
        return str == null || str.length == 0;
    }

    public static removeDiacritics(str: string): string {
        if (str == null) {
            return null;
        }
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    }​​

}