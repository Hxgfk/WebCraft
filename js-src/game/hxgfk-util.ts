namespace HxgfkUtil {
    export type MixinConstructor<T = {}> = new (...args: any[]) => T;
    export class StaticMixinProcessor {
        /**
         * 合并多个类到目标类
         * @param derivedCtor 目标类
         * @param baseCtors 要混入的类
         * 示例：
         * ```code
         * class Animal {
         *   move() { console.log("Moving") }
         * }
         *
         * class CanEat {
         *   eat() { console.log("Eating") }
         * }
         *
         * class Person {
         *   speak() { console.log("Hello") }
         * }
         *
         * MixinProcessor.apply(Person, Animal, CanEat);
         *
         * const p = new Person();
         * p.speak(); // Hello
         * p.move();   // Moving (混入方法)
         * p.eat();    // Eating (混入方法)
         * ```
         */
        static apply<T extends MixinConstructor, U extends MixinConstructor[]>(
            derivedCtor: T,
            ...baseCtors: U
        ): T & MixinConstructor<InstanceType<U[number]>> {
            baseCtors.forEach((baseCtor) => {
                Object.getOwnPropertyNames(baseCtor.prototype)
                    .filter(name => name !== 'constructor')
                    .forEach((name) => {
                        const descriptor = Object.getOwnPropertyDescriptor(baseCtor.prototype, name);
                        if (descriptor) {
                            Object.defineProperty(derivedCtor.prototype, name, descriptor);
                        }
                    });
            });
            return derivedCtor as any;
        }

        /**
         * 向目标类中添加属性
         * @param Base 目标类
         * @param props 描述要混入的方法的对象 {func: () => ""}
         * 示例：
         * ```code
         * class Person {
         *      age = 1;
         *      name = "Amy";
         * }
         * const targetFunc = {play: () => {
         *      console.log("playing");
         * }};
         * ```
         */
        static merge<TBase extends MixinConstructor>(Base: TBase, props: {[key: string]:object}) {
            let mergeRaw = class extends Base {
            };
            for (const k of Object.keys(props)) {
                Object.defineProperty(mergeRaw, k, props[k]);
            }
            return mergeRaw;
        }
    }

    type Constructor<T = {}> = new (...args: any[]) => T;
    // 工具类型：联合类型转交叉类型
    type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
            k: infer I
        ) => void
        ? I
        : never;

    /**
     * 动态混入工具
     */
    export class DynamicMixinProcessor {
        /**
         * 动态混入多个类的原型方法（运行时）
         * @param target 目标类
         * @param sources 要混入的类（可多个）
         * @returns 修改后的目标类（支持链式调用）
         */
        static apply<T extends Constructor, U extends Constructor[]>(
            target: T,
            ...sources: U
        ): T & Constructor<UnionToIntersection<InstanceType<U[number]>>> {
            sources.forEach((source) => {
                Object.getOwnPropertyNames(source.prototype)
                    .filter((name) => name !== "constructor")
                    .forEach((name) => {
                        const descriptor = Object.getOwnPropertyDescriptor(source.prototype, name)!;
                        Object.defineProperty(target.prototype, name, descriptor);
                    });
            });
            return target as any;
        }

        /**
         * 动态混入方法/属性（运行时）
         * @param target 目标类
         * @param methods 要混入的方法或属性描述符 { methodName: { value: () => {}, ... } }
         * @returns 修改后的目标类（支持链式调用）
         */
        static mergeMethods<T extends Constructor, U extends Record<string, PropertyDescriptor>>(
            target: T,
            methods: U
        ): T & Constructor<{ [K in keyof U]: U[K]["value"] }> {
            for (const key in methods) {
                if (methods.hasOwnProperty(key)) {
                    Object.defineProperty(target.prototype, key, methods[key]);
                }
            }
            return target as any;
        }
    }
}