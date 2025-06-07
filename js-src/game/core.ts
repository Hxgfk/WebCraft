export namespace Core {
    export const VERSION = "1.19.2";
    export const BUILTIN_ID = "minecraft";
    export const VANILLA_SOUNDS = "minecraft/sounds.json";
    export const SCREEN_BACKGROUND_MUSIC: {[key: string]: string} = {
        "screen-title": "music.menu",
        "screen-single": "music.menu"
    };

    export const AppError = class extends Error {
        constructor(message: string) {
            super(message);
            this.name = "AppError";
        }
    };

    export enum Direction {
        UP, DOWN, EAST, WEST
    }

    export class Mth {
        static clamp(max: number, min: number, value: number): number {
            if (value > max) {
                return max;
            } else if (value < min) {
                return min;
            } else return value;
        }
    }

    export class TextFormatting {
        public static readonly BLACK = new TextFormatting("0");
        public static readonly DARK_BLUE = new TextFormatting("1");
        public static readonly DARK_GREEN = new TextFormatting("2");
        public static readonly DARK_AQUA  = new TextFormatting("3");
        public static readonly DARK_RED = new TextFormatting("4");
        public static readonly DARK_PURPLE = new TextFormatting("5");
        public static readonly GOLD = new TextFormatting("6");
        public static readonly GRAY = new TextFormatting("7");
        public static readonly DARK_GRAY = new TextFormatting("8");
        public static readonly BLUE = new TextFormatting("9");
        public static readonly GREEN = new TextFormatting("a");
        public static readonly AQUA = new TextFormatting("b");
        public static readonly RED = new TextFormatting("c");
        public static readonly LIGHT_PURPLE = new TextFormatting("d");
        public static readonly YELLOW = new TextFormatting("e");
        public static readonly WHITE = new TextFormatting("f");
        public static readonly OBFUSCATED = new TextFormatting("k");
        public static readonly BOLD = new TextFormatting("l");
        public static readonly STRIKETHROUGH = new TextFormatting("m");
        public static readonly UNDLERLINE = new TextFormatting("n");
        public static readonly ITALIC = new TextFormatting("o");
        public static readonly RESET = new TextFormatting("r");

        public static readonly CHAR = "\u00a7";

        private readonly code: string;

        private constructor(code: string) {
            this.code = code;
        }

        getCode(): string {
            return this.code;
        }

        toString(): string {
            return TextFormatting.CHAR + this.code;
        }
    }

    export class TextUtil {
        public readonly FormattingRegexp = /\u00a7([0-9a-fk-or])([^\u00a7]*)/gu;

        static format(text: string): string {
            let html = '';
            let styles: string[] = [];

            // @ts-ignore
            text.replace(this.FormattingRegexp, (match: string, code: string, content: string): string => {
                switch (code) {
                    case '0': styles.push('color-0'); break;
                    case '1': styles.push('color-1'); break;
                    case '2': styles.push('color-2'); break;
                    case '3': styles.push('color-3'); break;
                    case '4': styles.push('color-4'); break;
                    case '5': styles.push('color-5'); break;
                    case '6': styles.push('color-6'); break;
                    case '7': styles.push('color-7'); break;
                    case '8': styles.push('color-8'); break;
                    case '9': styles.push('color-9'); break;
                    case 'a': styles.push('color-a'); break;
                    case 'b': styles.push('color-b'); break;
                    case 'c': styles.push('color-c'); break;
                    case 'd': styles.push('color-d'); break;
                    case 'e': styles.push('color-e'); break;
                    case 'f': styles.push('color-f'); break;
                    case 'l': styles.push('bold'); break;
                    case 'o': styles.push('italic'); break;
                    case 'n': styles.push('underlined'); break;
                    case 'm': styles.push('strikethrough'); break;
                    case 'k': styles.push('obfuscated'); break;
                    case 'r': styles = []; break; // 重置样式
                }

                html += `<span class="${styles.join(' ')}">${content}</span>`;
            });

            return html || text;
        }
    }

    export type KeyStatusMapType = {[key: string]: boolean};
    export const PropertyDesc_True: PropertyDescriptor = {
        value: true,
        configurable: true,
        enumerable: true,
        writable: true
    };
    export const PropertyDesc_False: PropertyDescriptor = {
        value: false,
        configurable: true,
        enumerable: true,
        writable: true
    };

    export class UserInput {
        private keyStatusMap: KeyStatusMapType = {};
        private mouseStatusMap: boolean[] = [false, false, false, false, false];
        private mousePos: number[] = [0, 0]; // [X, Y]

        init(): void {
            document.addEventListener("keydown", (event: KeyboardEvent) => {
                Object.defineProperty(this.keyStatusMap, event.key, PropertyDesc_True);
            });
            document.addEventListener("keyup", (event: KeyboardEvent) => {
                Object.defineProperty(this.keyStatusMap, event.key, PropertyDesc_False);
            });
            document.addEventListener("mousedown", (event: MouseEvent) => {
                Object.defineProperty(this.mouseStatusMap, event.button, PropertyDesc_True);
            });
            document.addEventListener("mouseup", (event: MouseEvent) => {
                Object.defineProperty(this.mouseStatusMap, event.button, PropertyDesc_False);
            });
            document.addEventListener("mousemove", (event: MouseEvent) => {
                this.mousePos[0] = event.pageX;
                this.mousePos[1] = event.pageY;
            });
        }

        keyStatus(key: string): boolean {
            return this.keyStatusMap[key];
        }

        mouseStatus(button: number): boolean {
            return this.mouseStatusMap[button];
        }

        getMousePos(): number[] {
            return this.mousePos;
        }

        getMousePosX(): number {
            return this.mousePos[0];
        }

        getMousePosY(): number {
            return this.mousePos[1];
        }
    }
}