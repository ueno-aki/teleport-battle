import { world, DynamicPropertiesDefinition, Location, MinecraftEffectTypes } from "mojang-minecraft";

//ゲームスタートと同時に増加するやつ
let currentTick = -5;
let swappedCount = 0;

world.events.beforeChat.subscribe(chatEv => {
    const {sender, message} = chatEv;
    const pList = Array.from(world.getPlayers());
    const timeMessage = `§l§7＜${sender.name}＞  §f${message}`;
    //op持ちのみ作動
    if(sender.hasTag("op")){
        switch (message){
            //ゲームスタート
            case "start":
                world.setDynamicProperty("gamemode", true);
                world.setDynamicProperty("joinHalfway", true);
                sender.runCommand("say プレイヤーの途中参加を有効にしました");
                sender.runCommand("gamerule sendcommandfeedback false");
                pList.forEach(player => {
                    player.runCommand("gamemode s @s");
                    player.addTag("playing");
                    player.removeTag("dead");
            })
                break;
            //ゲーム終了
            case "finish":
                gameFinish();
                pList.forEach(player => {
                    player.teleport(sender.location, sender.dimension, 0, 0);
                    player.runCommand("gamemode a @s");
                    player.removeTag("playing");
                })
                sender.runCommand("tag @a remove dead");
                break;

            case "help":
                const helpMessage = `§fーーーーーーーーーーーーーーーーーーーーーーー
§l§fstart  §r§7ゲームを開始する
§l§ffinish  §r§7ゲームをリセットする
§l§fhelp  §r§7一覧を出す
§l§ftotyusanka true  §r§7途中参加を可能にする
§l§ftotyusanka false  §r§7途中参加を不可能にする
§l§ctp  §r§7観戦中に生存者のところにテレポートする
§fーーーーーーーーーーーーーーーーーーーーーーー`;
                sender.runCommand(`tellraw @s {"rawtext":[{"text":"${helpMessage}"}]}`);
                break;

            default:
                //途中参加オンオフ【通常オン】例:totyusanka true
                if (message.startsWith("totyusanka")){
                    const messageBoolean = message.split(" ");
                    switch (messageBoolean[1]){
                        case "true":
                            world.setDynamicProperty("joinHalfway", true);
                            sender.runCommand("say プレイヤーの途中参加を有効にしました");
                            playSound("random.levelup");
                            break;
                        case "false":
                            world.setDynamicProperty("joinHalfway", false);
                            sender.runCommand("say プレイヤーの途中参加を無効にしました");
                            playSound("random.levelup");
                            break;
                    }
                //チャットの名前にチャンピオン表示(op持ち)
                }else if (sender.hasTag("champion")){
                    sendMessageWithTime(`§l§7＜§cChampion§f:${sender.name}＞  §f${message}`);

                }else {
                    sendMessageWithTime(timeMessage);
                }
        }
    //生存者に(ランダムに)tpするやつ
    }else if (message == "tp" && sender.hasTag("dead") && sender.getEffect(MinecraftEffectTypes.invisibility)){
        const remaining = pList.filter(player => player.hasTag("playing"));
        const randomPlayer = shuffleArray(remaining);
        const {x, y, z} = randomPlayer[0].location;
        const location = new Location(x, y + 5, z);
        sender.teleport(location, randomPlayer[0].dimension, 0, 0);
        sender.runCommand(`tellraw @a[tag=op] {\"rawtext\":[{\"text\":\"テレポート:§l§6${sender.name}§r>>>§l${remaining[0].name}\"}]}`);
        sender.onScreenDisplay.setActionBar(`${remaining[0].name}`);
    //チャットの名前にチャンピオン表示
    }else if(sender.hasTag("champion")){
        sendMessageWithTime(`§l§7＜§cChampion§7:${sender.name}＞  §f${message}`);
    }else {
        sendMessageWithTime(timeMessage);
    }
    chatEv.cancel = true;
});
//tickで秒数管理
world.events.tick.subscribe(tickEv => {
    //動的プロパティのgamemodeがtrueのとき
    if (world.getDynamicProperty("gamemode")){
        //tickを１増やす
        currentTick++;
        const swapTime = world.getDynamicProperty("tick");
        
        const pList = Array.from(world.getPlayers());
        //playingタグ持ってるプレイヤーを取ってきて
        const remaining = pList.filter(player => player.hasTag("playing"));
        remaining.forEach(player => {
            //体力0 = 死亡　を検知して
            const healthComponent = player.getComponent("minecraft:health");
            if (healthComponent.current === 0){
                //playingタグを外す(脱落)
                player.removeTag("playing");
                player.addTag("dead");
                player.runCommand("gamemode spectator @s");
            }
        })
        //playingタグを持っている人が一人になったらfinish
        if (remaining.length === 1){
            remaining[0].removeTag("playing");
            remaining[0].runCommand("tag @a remove dead");
            remaining[0].runCommand("gamemode a @s");
            remaining[0].runCommand(`tellraw @a {\"rawtext\":[{\"text\":\"---result---\\n優勝者:§c${remaining[0].name}\\n試合時間:§l§e${~~(currentTick / 1200)}§f分§e${~~((currentTick % 1200) / 20)}§f秒\\nテレポートは合計${swappedCount}回行われました\"}]}`);
            gameFinish();
            //チャンピオン設定
            pList.forEach(pEach => {
                pEach.nameTag = pEach.name;
                pEach.removeTag("champion");
            })
            remaining[0].nameTag = `<<<§o§6Champion§f>>>\n§c${remaining[0].name}`;
            remaining[0].addTag("champion");
        //ゲームスタートの合図
        }else if (currentTick === 0){
            title("§l§3Start!!!");
            playSound("mob.blaze.death");
            //１回目のテレポートを行うタイミング決め
            world.setDynamicProperty("tick", randomNum(400, 800));
        //指定されたタイミングでテレポートを実行
        }else if (currentTick === swapTime){
            actionBar("§l§cSwapping...");
            shufflePlayer();
            swappedCount++;
            //次テレポートをするタイミング決め
            world.setDynamicProperty("tick", randomNum(currentTick + 400, currentTick + 800));
        }
    }
});

//動的プロパティ定義
world.events.worldInitialize.subscribe(initializeEv => {
    let def = new DynamicPropertiesDefinition();
    def.defineNumber("tick");
    def.defineBoolean("gamemode");
    def.defineBoolean("joinHalfway");
    initializeEv.propertyRegistry.registerWorldDynamicProperties(def);
});

//プレイヤーが入ってきたとき
world.events.playerJoin.subscribe(joinEv => {
    const joinPlayer = joinEv.player;
    joinPlayer.runCommand("help");
    if (world.getDynamicProperty("gamemode")){
        if(joinPlayer.hasTag("dead") || joinPlayer.hasTag("playing")){
            return;
        }
        switch (world.getDynamicProperty("joinHalfway")){
            case true:
                joinPlayer.addTag("playing");
                break;
            case false:
                joinPlayer.addTag("dead");
                break;
        }
    }
});
//現在時刻チャット
function sendMessageWithTime(message){
    const dateObject = new Date();
    const hoursUTC = dateObject.getUTCHours();
    const hoursJP = ((hoursUTC + 9) < 24) ? hoursUTC + 9 : hoursUTC - 15;
    const minutes = dateObject.getUTCMinutes();
    const seconds = dateObject.getUTCSeconds();
    const now = `${hoursJP}:${minutes}:${seconds}`;
    world.getDimension("overworld").runCommand(`tellraw @a {"rawtext":[{"text":"` + message + `  §7[${now}]§r"}]}`);
}

//ゲーム終了する
function gameFinish(){
    world.setDynamicProperty("gamemode", false);
    world.removeDynamicProperty("tick");
    currentTick = -5;
    swappedCount = 0;
    title("§l§3ゲーム終了");
    playSound("random.levelup");
    playSound("firework.launch");
}

//プレイサウンド
function playSound(soundID){
    const pList = Array.from(world.getPlayers());
    pList.forEach(element => {
        element.playSound(soundID);
    })
}

//アクションバー表示
function actionBar(str){
    const pList = Array.from(world.getPlayers());
    pList.forEach(element => {
        element.onScreenDisplay.setActionBar(str);
    })
}

//タイトル表示
function title(str){
    const pList = Array.from(world.getPlayers());
    pList.forEach(element => {
        element.onScreenDisplay.setTitle(str);
    })
}

//２数の間の整数をランダムに出してくれるっぽい
function randomNum(min, max){
    const num = Math.floor(Math.random() * (max - min + 1) + min);
    return num;
}

//配列をランダムに入れ替えるやつ,テレポートの準備
function shuffleArray(arr){
    let playerList = Array.from(arr);

    for (let i = (playerList.length - 1); 0 < i; i--){
        let r = Math.floor(Math.random() * (i + 1));
        let tmp = playerList[i];
        playerList[i] = playerList[r];
        playerList[r] = tmp;
    }
    return playerList;
}

//プレイヤーをテレポートするやつ
function shufflePlayer(){
    const shuffledList = shuffleArray(world.getPlayers());
    const shuffledPlayerList = shuffledList.filter(player => player.hasTag("playing"));
    //プレイヤー人数偶数(2人,2人, ... ,2人)で組同士入れ替え
    if ((shuffledPlayerList.length % 2) === 0){
        for (let j = 0; j < (shuffledPlayerList.length - 1); j = j + 2){
        const playerALocation = shuffledPlayerList[j].location;
        const playerADimension = shuffledPlayerList[j].dimension;
        const playerBLocation = shuffledPlayerList[j + 1].location;
        const playerBDimension = shuffledPlayerList[j + 1].dimension;
        shuffledPlayerList[j].teleportFacing(playerBLocation, playerBDimension,playerALocation);
        shuffledPlayerList[j + 1].teleportFacing(playerALocation, playerADimension,playerBLocation);
    }
    //プレイヤー人数奇数(2人,2人, ... ,2人,3人)
    }else {
        for (let j = 0; j < (shuffledPlayerList.length - 1); j = j + 2){
            //3人ペア入れ替え
            if ((shuffledPlayerList.length - j) === 3){
                const playerALocation = shuffledPlayerList[j].location;
                const playerADimension = shuffledPlayerList[j].dimension;
                const playerBLocation = shuffledPlayerList[j + 1].location;
                const playerBDimension = shuffledPlayerList[j + 1].dimension;
                const playerCLocation = shuffledPlayerList[j + 2].location;
                const playerCDimension = shuffledPlayerList[j + 2].dimension;
                shuffledPlayerList[j].teleportFacing(playerBLocation, playerBDimension,playerALocation);
                shuffledPlayerList[j + 1].teleportFacing(playerCLocation, playerCDimension,playerBLocation);
                shuffledPlayerList[j + 2].teleportFacing(playerALocation, playerADimension,playerCLocation);
            //余分なやつ
            }else if ((shuffledPlayerList.length - j) < 3){
                return;
            //2人ペア入れ替え
            }else {
                const playerALocation = shuffledPlayerList[j].location;
                const playerADimension = shuffledPlayerList[j].dimension;
                const playerBLocation = shuffledPlayerList[j + 1].location;
                const playerBDimension = shuffledPlayerList[j + 1].dimension;
                shuffledPlayerList[j].teleportFacing(playerBLocation, playerBDimension,playerALocation);
                shuffledPlayerList[j + 1].teleportFacing(playerALocation, playerADimension,playerBLocation);
            }
        }
    }
}