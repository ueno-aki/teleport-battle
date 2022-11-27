import { Player } from "@minecraft/server";
import { CountDown } from "../../GameStream/CountDown";
import { gameStart, gameSuspend } from "../../GameStream/MainGame";
import { CountDownStream, MainGameStream } from "../../GameStream/Stream";
import { Execute } from "../../util/util";
import { ContainerMenu } from "./ContainerMenu";
export const showMainMenu = async (target: Player) => {
    if (CountDownStream.isCountDown || MainGameStream.isPlaying) {
        Suspend(target);
    } else if (MainGameStream.isPlaying === false && MainGameStream.isPlayingOnDB === true) {
        Resume(target);
    } else {
        Default(target);
    }
};

const Default = async (target: Player) => {
    const { selectedSlot } = await new ContainerMenu("MainMenu", 9)
        .setItem(1, { itemKey: "written_book", lore: ["説明書"], foil: true })
        .setItem(3, { itemKey: "soul_fire", lore: ["§l§b新規ゲーム作成"], foil: true })
        .setItem(5, { itemKey: "clock", lore: ["設定"] })
        .setItem(7, { itemKey: "axolotl_bucket", lore: ["プレイヤーリスト"], foil: true })
        .show(target);
    switch (selectedSlot) {
        case 3:
            Execute((player) => player.runCommandAsync("gamemode a @s").catch((e) => console.error(e, e.stack)));
            CountDown(() => gameStart(), { amount: 200, countPhase: 100, startTitle: "START", informRate: 200 });
            break;
    }
};
const Resume = async (target: Player) => {
    const { selectedSlot } = await new ContainerMenu("MainMenu", 9)
        .setItem(1, { itemKey: "written_book", lore: ["説明書"], foil: true })
        .setItem(3, { itemKey: "fire", lore: ["§l§b続きから始める", "中断されたデータが残っています"], foil: true })
        .setItem(5, { itemKey: "clock", lore: ["設定"] })
        .setItem(7, { itemKey: "axolotl_bucket", lore: ["プレイヤーリスト"], foil: true })
        .show(target);
    switch (selectedSlot) {
        case 3:
            Execute((player) => player.runCommandAsync("gamemode a @s").catch((e) => console.error(e, e.stack)));
            CountDown(() => gameStart(true), { amount: 200, countPhase: 100, startTitle: "START", informRate: 200 });
            break;
    }
};
const Suspend = async (target: Player) => {
    const { selectedSlot } = await new ContainerMenu("MainMenu", 9)
        .setItem(1, { itemKey: "written_book", lore: ["説明書"], foil: true })
        .setItem(3, { itemKey: "barrier", lore: ["§l§b中断"], foil: true })
        .setItem(5, { itemKey: "clock", lore: ["設定"] })
        .setItem(7, { itemKey: "axolotl_bucket", lore: ["プレイヤーリスト"], foil: true })
        .show(target);
    switch (selectedSlot) {
        case 3:
            CountDownStream.setCountDownBit(false);
            gameSuspend();
            break;
    }
};
