export class ScoreUpdateModel {
    field = "score";
    value: ScoreUpdateValueModel[] = [];
}

export class ScoreUpdateValueModel {
    display = false;
    displayName = "";
    icon = "";
    name = "";
    nbPoints = 0;
    history: { text: string, points: number }[] = [];
    rules: {
        code: string;
        nbPoints: number;
        text: string;
    }[];
}