export interface ScoreModel {
    name: string;
    icon: string;
    displayName: string;
    actions: ScoreActionModel[];
}

export interface ScoreActionModel {
    code: string;
    text: string;
    nbPoint: number;
}

export interface TrophyModel {
    title: string;
    image: string;
    nbSuccessfulActivities: number;
}

export interface StatusModel {
    name: string;
    MRequiredScoreList: { name: string; nbPoints: number }[];
}