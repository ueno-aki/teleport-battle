import { Player } from "@minecraft/server";
import { CountDown } from "../../GameStream/CountDown";
import { gameStart, gameSuspend } from "../../GameStream/MainGame";
import { CountDownStream, MainGameStream } from "../../GameStream/Stream";
import { Execute } from "../../util/util";
import { ContainerMenu } from "../ContainerMenu/index";
import { showPlayerList } from "./PlayerList";

/*処理内容が結構違うので多少被ってても分けて書いた。きれいに書ける人募集中*/
export const configMenus = {
    Default,
    Resume,
    Suspend,
} as const;

/*試合前 開始ボタンが押せる*/
async function Default(target: Player) {
    const autoMatchState = MainGameStream.autoMatchEnable;
    const { selectedSlot, canceled } = await new ContainerMenu("MainMenu", 9)
        .setContents({
            1: { itemKey: "written_book", lore: ["説明書"], foil: true },
            3: { itemKey: "soul_fire", lore: ["§l§b新規ゲーム作成"], foil: true },
            5: {
                itemKey: autoMatchState ? "lit_redstone_lamp" : "redstone_lamp",
                lore: [
                    "§l途中参加",
                    `§o--現在§r${autoMatchState ? "§e有効" : "§7無効"}`,
                    "",
                    `§d§oクリックで${autoMatchState ? "§7無効" : "§e有効"}にする`,
                ],
            },
            7: { itemKey: "axolotl_bucket", lore: ["プレイヤーリスト"], foil: true },
        })
        .show(target);
    if (canceled) return;
    switch (selectedSlot) {
        case 3:
            Execute((player) => player.runCommandAsync("gamemode a @s").catch((e) => console.error(e, e.stack)));
            CountDown(() => gameStart(), { amount: 200, countPhase: 100, startTitle: "START", informRate: 200 });
            break;
        case 5:
            MainGameStream.setAutoMatchEnable(!MainGameStream.autoMatchEnable);
            target.tell(`途中参加を${MainGameStream.autoMatchEnable ? "有効" : "無効"}にしました.`);
            configMenus.Default(target);
            break;
        case 7:
            showPlayerList(target);
            break;
        default:
            configMenus.Default(target);
    }
}

/*試合前だが、前回のデータが残っているので続きから再開ボタンが押せる->再開の処理:gameStart({ resumeBit: true })*/
async function Resume(target: Player) {
    const autoMatchState = MainGameStream.autoMatchEnable;
    const { selectedSlot, canceled } = await new ContainerMenu("MainMenu", 9)
        .setContents({
            1: { itemKey: "written_book", lore: ["説明書"], foil: true },
            3: { itemKey: "fire", lore: ["§l§b続きから始める", "中断されたデータが残っています"], foil: true },
            5: {
                itemKey: autoMatchState ? "lit_redstone_lamp" : "redstone_lamp",
                lore: [
                    "§l途中参加",
                    `§o--現在§r${autoMatchState ? "§e有効" : "§7無効"}`,
                    "",
                    `§d§oクリックで${autoMatchState ? "§7無効" : "§e有効"}にする`,
                ],
            },
            7: { itemKey: "axolotl_bucket", lore: ["プレイヤーリスト"], foil: true },
        })
        .show(target);
    if (canceled) return;
    switch (selectedSlot) {
        case 3:
            Execute((player) => player.runCommandAsync("gamemode a @s").catch((e) => console.error(e, e.stack)));
            CountDown(() => gameStart({ resumeBit: true }), {
                amount: 200,
                countPhase: 100,
                startTitle: "START",
                informRate: 200,
            });
            break;
        case 5:
            MainGameStream.setAutoMatchEnable(!MainGameStream.autoMatchEnable);
            target.tell(`途中参加を${MainGameStream.autoMatchEnable ? "有効" : "無効"}にしました.`);
            configMenus.Resume(target);
            break;
        case 7:
            showPlayerList(target);
            break;
        default:
            configMenus.Resume(target);
    }
}

/*試合始まってるとき中止ボタンが押せる*/
async function Suspend(target: Player) {
    const autoMatchState = MainGameStream.autoMatchEnable;
    const { selectedSlot, canceled } = await new ContainerMenu("MainMenu", 9)
        .setContents({
            1: { itemKey: "written_book", lore: ["説明書"], foil: true },
            3: { itemKey: "barrier", lore: ["§l§b中断"], foil: true },
            5: {
                itemKey: autoMatchState ? "lit_redstone_lamp" : "redstone_lamp",
                lore: [
                    "§l途中参加",
                    `§o--現在§r${autoMatchState ? "§e有効" : "§7無効"}`,
                    "",
                    `§d§oクリックで${autoMatchState ? "§7無効" : "§e有効"}にする`,
                ],
            },
            7: { itemKey: "axolotl_bucket", lore: ["プレイヤーリスト"], foil: true },
        })
        .show(target);
    if (canceled) return;
    switch (selectedSlot) {
        case 3:
            CountDownStream.setCountDownBit(false);
            gameSuspend();
            break;
        case 5:
            MainGameStream.setAutoMatchEnable(!MainGameStream.autoMatchEnable);
            target.tell(`途中参加を${MainGameStream.autoMatchEnable ? "有効" : "無効"}にしました.`);
            configMenus.Suspend(target);
            break;
        case 7:
            showPlayerList(target);
            break;
        default:
            configMenus.Suspend(target);
    }
}
