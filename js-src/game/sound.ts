import {Core} from "./core";
import {INSTANCE} from "../main";

export namespace Sound {
    import AppError = Core.AppError;
    import Mth = Core.Mth;
    type soundListType = SoundObj | string;

    export interface Sound {
        name: string;
        sounds: soundListType[];
        subtitle?: string;
        replace?: boolean;
        random: boolean;
    }

    export interface SoundObj {
        name: string;
        volume?: number;
        pitch?: number;
        preload?: boolean;
        weight?: number;
    }

    export const MAX_VOLUME = 1.0;
    export const MIN_VOLUME = 0.0;
    export const MAX_PITCH = 2.0;
    export const MIN_PITCH = 0.5;

    export class SoundPlayer {
        private readonly context: AudioContext;

        constructor() {
            this.context = new window.AudioContext();
        }

        async createAudioBuffer(path: string): Promise<AudioBuffer> {
            const response = await INSTANCE.resourceManager.getResource("minecraft/sounds/" + path + ".ogg");

            if (!response.ok) {
                throw new AppError(`加载声音"${path}"失败: ${response.status} ${response.statusText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            return await this.context.decodeAudioData(arrayBuffer);
        }

        private playingNodeList: AudioBufferSourceNode[] = [];

        /**
         * 播放声音<br>
         * 自定义终止函数必须调用defaultEnded
         * @param targetSound   目标声音
         * @param volume  音量
         * @param pitch  音调
         * @param loop  是否循环
         * @param customedOnended  自定义终止
         */
        async play(targetSound: SoundObj | string, volume?: number, pitch?: number, loop?: boolean, customedOnended?: (node: AudioBufferSourceNode) => void): Promise<AudioBufferSourceNode> {
            await this.context.resume();
            let node: AudioBufferSourceNode = this.context.createBufferSource();
            if (!targetSound) {
                throw new AppError(`播放声音${JSON.stringify(targetSound)}失败`);
            }
            if (typeof targetSound == "string") {
                node.buffer = await this.createAudioBuffer(targetSound);
            } else {
                node.buffer = await this.createAudioBuffer(targetSound.name);
            }
            let pitchNow: number = 1.0;
            if (pitch) {
                pitchNow = Mth.clamp(MAX_PITCH, MIN_PITCH, pitch);
            } else if (typeof targetSound != "string") {
                if (targetSound.pitch != undefined) {
                    pitchNow = Mth.clamp(MAX_PITCH, MIN_PITCH, targetSound.pitch);
                }
            }
            let volumeNow: number = 1.0;
            if (volume) {
                volumeNow = Mth.clamp(MAX_VOLUME, MIN_VOLUME, volume);
            } else if (typeof targetSound != "string") {
                if (targetSound.volume != undefined) {
                    volumeNow = Mth.clamp(MAX_VOLUME, MIN_VOLUME, targetSound.volume);
                }
            }
            node.playbackRate.value = pitchNow;
            node.loop = Boolean(loop);
            let gainNode = this.context.createGain();
            gainNode.gain.value = volumeNow;
            node.connect(gainNode);
            gainNode.connect(this.context.destination);
            node.start(0);
            this.playingNodeList.push(node);
            node.onended = customedOnended ? () => customedOnended(node) : () => {
                this.playingNodeList = this.playingNodeList.filter(n => n != node);
            };
            return node;
        }

        defaultEnded(node: AudioBufferSourceNode) {
            this.playingNodeList = this.playingNodeList.filter(n => n != node);
        }

        stopAll(): void {
            this.playingNodeList.forEach(n => {
                n.onended = () => {};
                n.stop();
                this.defaultEnded(n);
            });
        }

        getPlayingList(): AudioBufferSourceNode[] {
            return this.playingNodeList;
        }
    }

    export class SoundManager {
        private readonly soundMap: Map<string, Sound>;
        private readonly player: SoundPlayer;
        private CURRENT_BACKGROUND_MUSIC_NODE: AudioBufferSourceNode | undefined = undefined;
        private isBackgroundMusicPlaying: boolean = false;

        constructor(player: SoundPlayer) {
            this.soundMap = new Map();
            this.player = player;
        }

        /**
         * 随机声音
         * @param array 声音列表
         */
        randomSound(array: (string | SoundObj)[]): string | SoundObj {
            // 计算总权重并提取权重列表
            let totalWeight = 0;
            const weights: number[] = [];

            for (const item of array) {
                const weight = typeof item === 'string' ? 1 : (item.weight ?? 1);
                weights.push(weight);
                totalWeight += weight;
            }

            // 如果所有权重都是0，则退化为等概率随机
            if (totalWeight <= 0) {
                return array[Math.floor(Math.random() * array.length)];
            }

            // 生成随机权重位置
            const random = Math.random() * totalWeight;
            let weightSum = 0;

            // 查找随机位置对应的元素
            for (let i = 0; i < array.length; i++) {
                weightSum += weights[i];
                if (random < weightSum) {
                    return array[i];
                }
            }

            // 安全回退（理论上不会执行到这里）
            return array[array.length - 1];
        }

        play(id: string, volume?: number, pitch?: number, loop?: boolean): Promise<AudioBufferSourceNode> {
            let sound = this.getSound(id);
            if (!sound) throw new AppError(`不存在的声音${id}`);
            let targetSound: SoundObj | string = this.randomSound(sound.sounds);
            if (!targetSound) throw new AppError(`不存在的声音${id}`);
            while (this.soundMap.has(targetSound.toString())) {
                let targetSound0: Sound | undefined = this.getSound(targetSound.toString());
                if (!targetSound0) throw new AppError(`不存在的声音${targetSound}`);
                targetSound = this.randomSound(targetSound0.sounds);
            }
            return this.player.play(targetSound, volume, pitch, loop).catch(err => {
                throw err;
            });
        }

        public getRandomSound(id: string): SoundObj | string {
            let sound = this.getSound(id);
            if (!sound) throw new AppError(`不存在的声音${id}`);
            let targetSound: SoundObj | string = this.randomSound(sound.sounds);
            if (!targetSound) throw new AppError(`不存在的声音${id}`);
            while (this.soundMap.has(targetSound.toString())) {
                let targetSound0: Sound | undefined = this.getSound(targetSound.toString());
                if (!targetSound0) throw new AppError(`不存在的声音${targetSound}`);
                targetSound = this.randomSound(targetSound0.sounds);
            }
            return targetSound;
        }

        async playLoop(id: string, volume?: number, pitch?: number): Promise<AudioBufferSourceNode> {
            // 如果已经在播放背景音乐，先停止
            if (this.isBackgroundMusicPlaying) {
                this.stopPlayLoop();
            }

            let targetSound: SoundObj | string = this.getRandomSound(id);

            // 创建自定义结束回调
            let isStopped = false;
            const customedOnEnded = async (n: AudioBufferSourceNode) => {
                this.player.defaultEnded(n);
                if (!isStopped && this.isBackgroundMusicPlaying) { // 检查标志位
                    try {
                        targetSound = this.getRandomSound(id);
                        this.CURRENT_BACKGROUND_MUSIC_NODE = await this.player.play(
                            targetSound,
                            volume,
                            pitch,
                            false,
                            customedOnEnded
                        );
                    } catch (err) {
                        throw err;
                    }
                }
            };

            // 开始播放
            try {
                this.isBackgroundMusicPlaying = true; // 设置标志位
                this.CURRENT_BACKGROUND_MUSIC_NODE = await this.player.play(
                    targetSound,
                    volume,
                    pitch,
                    false,
                    customedOnEnded
                );
                return this.CURRENT_BACKGROUND_MUSIC_NODE;
            } catch (err) {
                this.isBackgroundMusicPlaying = false; // 出错时重置标志位
                throw err;
            }
        }

        stopPlayLoop() {
            if (this.CURRENT_BACKGROUND_MUSIC_NODE) {
                // 设置停止标志
                const node = this.CURRENT_BACKGROUND_MUSIC_NODE;
                node.onended = () => {
                    this.player.defaultEnded(node);
                };
                node.stop();
                this.CURRENT_BACKGROUND_MUSIC_NODE = undefined;
                this.isBackgroundMusicPlaying = false; // 重置标志位
            }
        }

        /**
         * 设置声音
         * 也可以用于添加声音
         * @param id  声音id
         * @param sound  声音对象
         */
        setSound(id: string, sound: Sound) {
            this.soundMap.set(id, sound);
        }

        /**
         * 获取声音
         * @param id
         */
        getSound(id: string): Sound | undefined {
            return this.soundMap.get(id);
        }

        async load(): Promise<void> {
            await INSTANCE.resourceManager.getResource(Core.VANILLA_SOUNDS).then(async response => {
                if (response.ok) {
                    return JSON.parse(await response.text());
                } else {
                    throw new AppError(`请求失败 ${response.status} ${response.statusText}`);
                }
            }).then((soundData) => {
                for (const name of Object.keys(soundData)) {
                    this.soundMap.set(name, soundData[name]);
                }
            }).catch(err => {
                throw new AppError("加载声音资源失败 "+ err.message);
            });
        }
    }
}