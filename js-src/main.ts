import {Minecraft} from "./game/runtime";

export let INSTANCE: Minecraft;

document.addEventListener("DOMContentLoaded", () => {
    INSTANCE = new Minecraft("game-canvas");
    INSTANCE.init();
    // @ts-ignore
    window["MinecraftInstance"] = INSTANCE;
});