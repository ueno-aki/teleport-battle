import { Player, world } from "@minecraft/server";
import { DEFINE_ID } from "../WorldDef";

export class OP {
    static get(): OPData {
        const raw = world.getDynamicProperty(DEFINE_ID.OP);
        if (typeof raw !== "string" || !isOPData(JSON.parse(raw))) {
            const dbDefault: OPData = {
                players: [-4294967295],
            };
            world.setDynamicProperty(DEFINE_ID.OP, JSON.stringify(dbDefault));
            console.warn("Couldn't get the db_op. So,set and returned the dbDefault");
            return dbDefault;
        }
        return JSON.parse(raw);
    }
    static register(target: Player): boolean {
        if (this.isRegistered(target)) return false;
        const data = this.get();
        data.players.push(+target.id);
        world.setDynamicProperty(DEFINE_ID.OP, JSON.stringify(data));
        return true;
    }
    static layOff(target: Player): boolean {
        if (!this.isRegistered(target)) return false;
        const data = this.get();
        data.players = data.players.filter((v) => v !== +target.id);
        world.setDynamicProperty(DEFINE_ID.OP, JSON.stringify(data));
        return true;
    }
    static isRegistered(target: Player): boolean {
        return this.get().players.some((v) => v === +target.id);
    }
}
interface OPData {
    players: Array<number>;
}
function isOPData(value: any): value is OPData {
    return Array.isArray(value.players);
}
