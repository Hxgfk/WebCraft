import {Core} from "./core";

export namespace Resource {
    import AppError = Core.AppError;

    export enum ResourceType {
        MODEL,
        SHADERS,
        BLOCKSTATES,
        LANG,
        TEXT,
        SOUND,
        PARTICLE,
        TEXTURE
    }

    export enum RegistryKey {
        ITEM,
        BLOCK,
        ENTITY,
        ADVANCEMENT,
        LOOT_TABLE,
        RECIPE,
        STRUCTURE,
        TAG,
        PARTICLE
    }

    export class Registry <T> {
        key: RegistryKey;
        map: Map<string, T>;

        private constructor(key: RegistryKey) {
            this.key = key;
            this.map = new Map<string, T>();
        }

        registry(id: string, value: T): T {
            this.map.set(id, value);
            return value;
        }

        get(id: string): T | undefined {
            return this.map.get(id);
        }
    }

    export class ResourceManager {
        private resourceMap = new Map<string, Map<ResourceType, Map<string, any>>>();
        public readonly hashObjectFile: HashObjectFile;

        constructor() {
            this.hashObjectFile = new HashObjectFile();
        }

        async load(): Promise<void> {
            this.resourceMap.set(Core.BUILTIN_ID, new Map());
            await this.hashObjectFile.loadManifest();
        }

        get(namespace: string, resType: ResourceType, id: string): any | undefined {
            const nsMap = this.resourceMap.get(namespace);
            if (nsMap) {
                const resMap = nsMap.get(resType);
                if (resMap) {
                    return resMap.get(id);
                } else return null;
            } else return null;
        }

        /**
         * 获取资源文件，包含散列文件的处理
         * @param path  路径（不需要assets开头）
         */
        getResource(path: string): Promise<Response> {
            return new Promise(async (resolve, reject) => {
                try {
                    if (this.hashObjectFile.hasFile(path)) {
                        let res = this.hashObjectFile.getFile(path);
                        if (!res) {
                            reject(new AppError("不存在的资源："+path));
                            return;
                        }
                        let path0 = res.hash.slice(0, 2);
                        resolve(fetch(`./assets/objects/${path0}/${res.hash}`));
                    } else {
                        resolve(fetch("./assets/" + path))
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }

        /**
         * 转换ArrayBuffer到Base64字符串
         * @param buffer   数据
         * @param mimeType  文件类型
         */
        static arrayBufferToBase64(buffer: ArrayBuffer, mimeType?: string): string {
            // 将ArrayBuffer转换为二进制字符串
            let binary = '';
            const bytes = new Uint8Array(buffer);
            const len = bytes.byteLength;

            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }

            // 将二进制字符串转换为Base64
            const base64String = btoa(binary);

            if (!mimeType) {
                mimeType = "image/png";
            }

            // 创建Data URL
            return `data:${mimeType};base64,${base64String}`;
        }
    }

    type HashResourceMapType = {[key: string]: HashFile};

    export interface HashFile {
        hash: string,
        size: number
    }

    export class HashObjectFile {
        public FILE_MAP: HashResourceMapType;

        constructor() {
            this.FILE_MAP = {};
        }

        async loadManifest(): Promise<void> {
            this.FILE_MAP = await fetch("./assets/objects.json")
                .then(async resp => {
                    if (resp.ok) {
                        return (await resp.json()).objects;
                    } else {
                        throw new AppError(`加载散列资源文件表失败${resp.statusText} ${resp.status}`);
                    }
                }).catch(err => {
                    throw err;
                });
        }

        hasFile(path: string): boolean {
            return this.FILE_MAP.hasOwnProperty(path);
        }

        getFile(path: string): HashFile | undefined {
            return this.FILE_MAP[path];
        }
    }
}