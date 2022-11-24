import { Player } from "@minecraft/server";
import { ShuffleArray } from "../util/index";

const EachTeleport = (playerA: Player, playerB: Player, playerC?: Player): void => {
    if (playerC == undefined) {
        const {
                location: locA,
                dimension: dimA,
                rotation: { x: rxA, y: ryA },
            } = playerA,
            {
                location: locB,
                dimension: dimB,
                rotation: { x: rxB, y: ryB },
            } = playerB;
        playerA.teleport(locB, dimB, rxA, ryA);
        playerB.teleport(locA, dimA, rxB, ryB);
    } else {
        const {
                location: locA,
                dimension: dimA,
                rotation: { x: rxA, y: ryA },
            } = playerA,
            {
                location: locB,
                dimension: dimB,
                rotation: { x: rxB, y: ryB },
            } = playerB,
            {
                location: locC,
                dimension: dimC,
                rotation: { x: rxC, y: ryC },
            } = playerC;
        playerA.teleport(locB, dimB, rxA, ryA);
        playerB.teleport(locC, dimC, rxB, ryB);
        playerC.teleport(locA, dimA, rxC, ryC);
    }
};

export const ShuffleTeleport = (players: Array<Player>): void => {
    const shuffled = ShuffleArray(players, 20);
    shuffled.forEach((_, index) => {
        if (index % 2 != 0 || shuffled.length == index + 1) return;
        if (shuffled.length == index + 3) {
            EachTeleport(shuffled[index], shuffled[index + 1], shuffled[index + 2]);
        } else {
            EachTeleport(shuffled[index], shuffled[index + 1]);
        }
    });
};
