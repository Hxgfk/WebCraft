import {Sound} from "./sound";
import SoundPlayer = Sound.SoundPlayer;
import {Resource} from "./resource";
import ResourceManager = Resource.ResourceManager;
import RegistryKey = Resource.RegistryKey;
import Registry = Resource.Registry;
import SoundManager = Sound.SoundManager;
import {Core} from "./core";
import TextUtil = Core.TextUtil;
import UserInput = Core.UserInput;

export class Minecraft {
    public readonly resourceManager: ResourceManager;
    public readonly registries = new Map<string, Map<RegistryKey, Registry<any>>>;
    public readonly gameCanvasID: string;
    public readonly soundPlayer: SoundPlayer;
    public readonly soundManager: SoundManager;
    public readonly userInput: UserInput;
    public currentScreenId: string = "screen-loading";
    public lastScreenId: string = "screen-title";
    public userInteracted: boolean = false;
    public isPlaying: boolean = false;

    constructor(canvasID: string) {
        this.resourceManager = new ResourceManager();
        this.gameCanvasID = canvasID;
        this.soundPlayer = new SoundPlayer();
        this.soundManager = new SoundManager(this.soundPlayer);
        this.userInput = new UserInput();
    }

    public async initUI(): Promise<void> {
        this.userInput.init();
        // 去除右键菜单
        document.body.addEventListener("contextmenu", (event: Event) => {
            event.preventDefault();
        });
        // 初始化点击音效
        document.querySelectorAll(".button").forEach(button => {
            button.addEventListener("click", () => {
                // @ts-ignore
                if (button.getAttribute("disabled") != "true") {
                    this.soundManager.play("ui.button.click");
                }
            });
        });
        // 初始化标题界面文字
        let splashText: string = await fetch("./assets/minecraft/texts/splashes.txt").then(async resp => {
            if (resp.ok) {
                return await resp.text();
            } else {
                throw new Error("加载标题界面文字失败");
            }
        }).then(text => {
            let textArr: string[] = text.split("\n");
            return TextUtil.format(textArr[Math.floor(Math.random() * textArr.length)]);
        }).catch((err: Error) => {
            return err.message;
        });
        let element = document.getElementById("title-title-splash");
        if (element) {
            element.textContent = splashText;
        }
        ///  工具提示   ///
        // 初始化工具提示
        const tooltip = document.createElement('div');
        tooltip.classList.add('tooltip');
        document.body.appendChild(tooltip);
        // 鼠标悬停事件
        document.addEventListener('mouseover', (e: MouseEvent) => {
            // @ts-ignore
            const target = e.target.closest('[data-tooltip][data-show-tooltip="true"]');
            if (target) {
                const splashText = target.getAttribute('data-tooltip');
                tooltip.innerHTML = TextUtil.format(splashText);
                tooltip.style.visibility = 'visible';
                tooltip.style.opacity = '1';
            }
        });
        // 鼠标移动事件
        document.addEventListener('mousemove', (e: MouseEvent) => {
            // @ts-ignore
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                const tooltipWidth = tooltip.offsetWidth;
                const tooltipHeight = tooltip.offsetHeight;

                // 计算 tooltip 的位置
                let top = e.pageY - tooltipHeight * 0.3;
                let left = e.pageX + 20; // 居中对齐和向右偏移

                // 防止 tooltip 超出窗口边界
                if (top < 0) top = e.pageY + 10; // 如果超出顶部，显示在下方
                if (left < 0) left = 10; // 如果超出左边，靠右对齐
                if (left + tooltipWidth > window.innerWidth) left = window.innerWidth - tooltipWidth - 10;

                tooltip.style.top = `${top}px`;
                tooltip.style.left = `${left}px`;
            }
        });
        // 鼠标离开事件
        document.addEventListener('mouseout', (e: MouseEvent) => {
            // @ts-ignore
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                tooltip.style.visibility = 'hidden';
                tooltip.style.opacity = '0';
            }
        });
        ///  工具提示 END  ///
        document.addEventListener("keydown", (e: KeyboardEvent) => {
            if (!this.isPlaying && e.key == "Escape") {
                this.setScreen(this.lastScreenId, true);
            }
        });
    }

    /**
     * 切换界面
     * @param screen
     * @param id  输入是否带有screen-前缀
     */
    public setScreen(screen: string, id?: boolean) {
        let current = document.getElementById(this.currentScreenId);
        if (current) {
            this.lastScreenId = this.currentScreenId;
            current.style.display = "none";
        } else return;

        let targetId = id ? screen : `screen-${screen}`;
        let target = document.getElementById(targetId);
        if (target) {
            // 先停止所有声音
            this.soundPlayer.stopAll();
            this.soundManager.stopPlayLoop();

            let display: string = "none";
            if (target.hasAttribute("data-display")) {
                let display0 = target.getAttribute("data-display");
                if (display0) {
                    display = display0;
                }
            }
            target.style.display = display;
            this.currentScreenId = targetId;

            // 播放新屏幕的背景音乐
            let musicId = Core.SCREEN_BACKGROUND_MUSIC[targetId];
            if (musicId) {
                this.soundManager.playLoop(musicId);
            }
        }
    }

    public setLoadingScreen() {
        this.setScreen("loading");
    }

    /**
     * 设置加载界面进度条进度
     * @param prog 百分比
     */
    public setLoadingScreenProgress(prog: number) {
        let progressBar = document.getElementById("screen-loading-progress");
        if (progressBar) progressBar.style.width = `${prog}%`;
    }

    // 必须加载了ResourceManager之后才可以执行
    public loadHtmlResource(): void {
        document.querySelectorAll("[data-hash-pth][data-hash-type]").forEach(element => {
            const data_path = element.getAttribute("data-hash-pth");
            const data_type  = element.getAttribute("data-hash-type");
            if (!data_path || !data_type) {
                console.error(`加载资源失败：\n元素：${element}\n路径：${data_path}\n类型：${data_type}`);
                return;
            }
            this.resourceManager.getResource(data_path).then(resp => {
                if (resp.ok) {
                    switch (data_type) {
                        case "image":
                            resp.arrayBuffer().then((buffer) => {
                                // @ts-ignore
                                element["src"] = ResourceManager.arrayBufferToBase64(buffer);
                            });
                            break;
                    }
                } else {
                    console.error(`加载资源失败：\n元素：${element}\n路径：${data_path}\n类型：${data_type}\n状态：${resp.status}`);
                }
            });
        });
    }

    public init(): void {
        try {
            // 设置用户交互检测
            document.addEventListener("click", () => {
                this.userInteracted = true;
            }, {once: true});
            this.resourceManager.load().then(async () => {
                await this.soundManager.load();
                this.setLoadingScreenProgress(50);
            }).then(() => {
                this.loadHtmlResource();
                this.setLoadingScreenProgress(60);
            }).then(() => {
                return this.initUI();
            }).then(() => {
                this.setLoadingScreenProgress(100);
                this.setScreen("title");
            });
        } catch (error) {
            alert(`加载失败：${error}`);
        }
    }

    public exit(): void {
        window.close();
    }
}