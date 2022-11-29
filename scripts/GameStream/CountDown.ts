import { system } from "@minecraft/server";
import { Execute } from "../util/util";
import { CountDownStream } from "./Stream";

let current = -1;
const TICK_PER_SECOND = 20;

export const CountDown = (task: () => void, option: CountDownOptions) => {
    CountDownStream.setCountDownBit(true);
    const tick = () => {
        if (current == -1) current = option.amount;
        if (!CountDownStream.isCountDown) {
            CountDownStream.setCountDownBit(false);
            current = -1;
            return;
        } else if (current == 0) {
            Execute((player) => player.onScreenDisplay.setTitle(option.startTitle));
            task();
            current = -1;
            CountDownStream.setCountDownBit(false);
            return;
        } else if (current <= option.countPhase && current % TICK_PER_SECOND == 0) {
            Execute((player) => player.onScreenDisplay.setTitle(`${current / TICK_PER_SECOND}`));
        } else if (current % option.informRate == 0) {
            Execute((player) => player.tell(`ゲーム開始まで残り${~~(current / 20)}秒`));
        }
        current--;
        system.run(tick);
    };
    system.run(tick);
};
interface CountDownOptions {
    amount: number;
    countPhase: number;
    informRate: number;
    startTitle: string;
}
