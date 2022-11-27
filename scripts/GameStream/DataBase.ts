import { world } from "@minecraft/server";
import { DEFINE_ID } from "./DynamicDef";

interface PlayersData {
    playing: Array<number>;
    dead: Array<number>;
}
function isPlayersData(value: any): value is PlayersData {
    return Array.isArray(value.playing) && Array.isArray(value.dead);
}

export class MainGameDB {
    static get(): PlayersData {
        const raw = world.getDynamicProperty(DEFINE_ID.DB);
        if (typeof raw !== "string" || !isPlayersData(JSON.parse(raw))) {
            const dbDefault: PlayersData = {
                playing: [],
                dead: [],
            };
            world.setDynamicProperty(DEFINE_ID.DB, JSON.stringify(dbDefault));
            console.warn("Couldn't get the db. So,set and returned the dbDefault");
            return dbDefault;
        }
        return JSON.parse(raw);
    }
    static set(id: number, condition: "playing" | "dead") {
        if (this.existPlayerID(id, condition)) throw new Error(`id:${id} already exists in <GameData>.${condition}`);
        const data = this.get();
        data[condition].push(id);
        world.setDynamicProperty(DEFINE_ID.DB, JSON.stringify(data));
    }
    static remove(id: number, condition: "playing" | "dead"): boolean {
        const data = this.get();
        if (!this.existPlayerID(id, condition)) return false;
        data[condition] = data[condition].filter((v) => v !== id);
        world.setDynamicProperty(DEFINE_ID.DB, JSON.stringify(data));
        return true;
    }
    static reset(condition: "playing" | "dead"): void {
        const data = this.get();
        data[condition] = [];
        world.setDynamicProperty(DEFINE_ID.DB, JSON.stringify(data));
    }
    static existPlayerID(id: number, condition: "playing" | "dead"): boolean {
        const data = this.get();
        return data[condition].some((v) => v == id);
    }
}
export const Spectators: Set<number> = new Set();
