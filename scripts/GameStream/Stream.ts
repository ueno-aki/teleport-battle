import { world } from "@minecraft/server";
import { DEFINE_ID } from "../WorldDef";

export class MainGameStream {
    static get isPlayingOnDB(): boolean {
        const DBbool = world.getDynamicProperty(DEFINE_ID.IS_PLAYING);
        if (typeof DBbool !== "boolean") {
            world.setDynamicProperty(DEFINE_ID.IS_PLAYING, this.#isPlaying);
            console.warn("Couldn't get the isPlayingOnDB. So,set and returned the isPlayingOnCode");
            return this.#isPlaying;
        }
        return DBbool;
    }
    static setPlayingOnDB(bool: boolean) {
        world.setDynamicProperty(DEFINE_ID.IS_PLAYING, bool);
    }
    static #isPlaying = false;
    static get isPlaying(): boolean {
        return this.#isPlaying;
    }
    static setPlayingBit(bool: boolean) {
        this.#isPlaying = bool;
    }
    static setAutoMatchEnable(bool: boolean) {
        world.setDynamicProperty(DEFINE_ID.AUTO_MATCH, bool);
    }
    static get autoMatchEnable(): boolean {
        const data = world.getDynamicProperty(DEFINE_ID.AUTO_MATCH);
        if (typeof data !== "boolean") {
            world.setDynamicProperty(DEFINE_ID.AUTO_MATCH, false);
            console.warn("Couldn't get the autoMatchEnable. So,set and returned the false");
            return false;
        }
        return data;
    }
}
export class CountDownStream {
    static #isCountDown = false;
    static get isCountDown() {
        return this.#isCountDown;
    }
    static setCountDownBit(bool: boolean) {
        this.#isCountDown = bool;
    }
}
