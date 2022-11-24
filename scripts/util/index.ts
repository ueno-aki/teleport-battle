import { Player } from "@minecraft/server";

const randomNum = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1) + min);

const ShuffleArray = <T>(arr: Array<T>, shuffleCount: number = 0): Array<T> => {
    let copy = arr;
    for (let i = 0; i <= shuffleCount; i++) {
        const former = randomNum(0, arr.length);
        const latter = randomNum(0, arr.length);

        let valueTemp = copy[former];
        copy[former] = arr[latter];
        copy[latter] = valueTemp;
    }
    return copy;
};

const EachTeleport = (playerA: Player, playerB: Player, playerC?: Player): void => {
    if (playerC == undefined) {
        const { location: locA, dimension: dimA } = playerA,
            { location: locB, dimension: dimB } = playerB;
        playerA.teleportFacing(locB, dimB, locA);
        playerB.teleportFacing(locA, dimA, locB);
    } else {
        const { location: locA, dimension: dimA } = playerA,
            { location: locB, dimension: dimB } = playerB,
            { location: locC, dimension: dimC } = playerC;
        playerA.teleportFacing(locB, dimB, locA);
        playerB.teleportFacing(locC, dimC, locB);
        playerC.teleportFacing(locA, dimA, locC);
    }
};

const ShuffleTeleport = (players: Array<Player>): void => {
    const shuffled = ShuffleArray(players);
    shuffled.forEach((_, index) => {
        if (index % 2 != 0) return;
        if (shuffled.length == index + 3) {
            EachTeleport(shuffled[index], shuffled[index + 1], shuffled[index + 2]);
        } else {
            EachTeleport(shuffled[index], shuffled[index + 1]);
        }
    });
};

export { randomNum, ShuffleTeleport };
