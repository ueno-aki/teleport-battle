import { DynamicPropertiesDefinition, world } from "@minecraft/server";

const DB_KEY = "gamedata";
const IS_PLAYING_KEY = "isplaying";

world.events.worldInitialize.subscribe((ev) => {
    const worldDef = new DynamicPropertiesDefinition();
    worldDef.defineString(DB_KEY, 4000);
    worldDef.defineBoolean(IS_PLAYING_KEY);
    ev.propertyRegistry.registerWorldDynamicProperties(worldDef);
});

export class DataBase {
    static get(): GameData {
        const raw = world.getDynamicProperty(DB_KEY);
        if (typeof raw !== "string" || !isGameData(JSON.parse(raw))) {
            const dbDefault: GameData = {
                playing: [],
                dead: [],
            };
            world.setDynamicProperty(DB_KEY, JSON.stringify(dbDefault));
            console.warn("Couldn't get the db. So,set and returned the dbDefault");
            return dbDefault;
        }
        return JSON.parse(raw);
    }
    static set(id: number, condition: "playing" | "dead") {
        if (this.existPlayerID(id, condition)) throw new Error(`id:${id} already exists in <GameData>.${condition}`);
        const data = this.get();
        data[condition].push(id);
        world.setDynamicProperty(DB_KEY, JSON.stringify(data));
    }
    static remove(id: number, condition: "playing" | "dead"): boolean {
        const data = this.get();
        if (!this.existPlayerID(id, condition)) return false;
        data[condition] = data[condition].filter((v) => v !== id);
        world.setDynamicProperty(DB_KEY, JSON.stringify(data));
        return true;
    }
    static existPlayerID(id: number, condition: "playing" | "dead"): boolean {
        const data = this.get();
        return data[condition].some((v) => v == id);
    }
    static get isPlayingOnDB(): boolean {
        const DBbool = world.getDynamicProperty(IS_PLAYING_KEY);
        if (typeof DBbool !== "boolean") throw new Error("Failed to get isPlaying");
        return DBbool;
    }
    static setPlayingOnDB(bool: boolean) {
        world.setDynamicProperty(IS_PLAYING_KEY, bool);
    }
    static #isPlayingOnCode = false;
    static get isPlayingOnCode(): boolean {
        return this.#isPlayingOnCode;
    }
    static setPlayingOnCode(bool: boolean) {
        this.#isPlayingOnCode = bool;
    }
}

interface GameData {
    playing: Array<number>;
    dead: Array<number>;
}

function isGameData(value: any): value is GameData {
    return Array.isArray(value.playing) && Array.isArray(value.dead);
}
