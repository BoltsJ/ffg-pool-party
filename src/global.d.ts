import type { RollBuilderFFG } from "./types/rollbuilder";
import type { DiceHelpers } from "./types/diceHelpers";
import type { Message, CreateMessage } from "./modules/socket";

declare global {
  interface LenientGlobalVariableTypes {
    game: never;
    socket: never;
  }

  interface Game {
    ffg: {
      DiceHelpers: typeof DiceHelpers;
      [x: string]: unknown;
    };
  }

  namespace Hooks {
    interface StaticCallbacks {
      closeRollBuilderFFG: Hooks.CloseApplication<RollBuilderFFG>;
      getRollBuilderFFGHeaderButtons: Hooks.GetApplicationHeaderButtons<RollBuilderFFG>;
      renderRollBuilderFFG: Hooks.RenderApplication<RollBuilderFFG>;
    }
  }

  const ffgDicePools: Window["ffgDicePools"];
  const ffgMessageQueue: Window["ffgMessageQueue"];
  const ffgMessageSeq: Window["ffgMessageSeq"];
  interface Window {
    DicePoolFFG: typeof DicePoolFFG;
    ffgDicePools: Map<string, CreateMessage>;
    ffgMessageQueue: {
      message: Message | undefined;
      sending: boolean;
      seq: number;
    };
    ffgMessageSeq: Map<string, number>;
  }

  /**
   * Dice pool utility specializing in the FFG special dice
   */
  class DicePoolFFG {
    constructor(obj?: DicePoolFFGSource | string | undefined);

    // Dice
    proficiency: number;
    ability: number;
    challenge: number;
    difficulty: number;
    boost: number;
    setback: number;
    remsetback: number;
    force: number;

    // Fixed results
    advantage: number;
    success: number;
    threat: number;
    failure: number;
    light: number;
    dark: number;
    triumph: number;
    despair: number;

    source: object;

    /**
     * Upgrade the dice pool, converting any remaining ability dice into proficiency
     * dice or adding an ability die if none remain.
     * @param times - The number of times to perform this operation, defaults to 1
     */
    upgrade(times: number): void;

    /**
     * Upgrade the dice pool's difficulty, converting any remaining difficulty dice
     * into challenge dice or adding an difficulty die if none remain.
     * @param times - The number of times to perform this operation, defaults to 1
     */
    upgradeDifficulty(times): void;

    /**
     * Transform the dice pool into a rollable expression
     * @returns - A dice expression that can be used to roll the dice pool
     */
    renderDiceExpression(): string;

    /**
     * Create a preview of the dice pool using images
     * @param container - where to place the preview. A container will be
     *                    generated if this is undefined
     */
    renderPreview(container?: HTMLElement): HTMLElement;

    renderAdvancedPreview(container: HTMLElement): HTMLElement;

    protected _addIcons(
      container: HTMLElement,
      icon: string,
      height?: number,
      width?: number
    ): void;
    protected _addSourceToolTip(container: HTMLElement): void;

    /**
     * Search the passed container for inputs that contain dice pool information
     * @param container - the container where the inputs are located
     */
    static fromContainer(container: HTMLElement): DicePoolFFG;
  }

  interface DicePoolFFGSource {
    proficiency?: number;
    ability?: number;
    challenge?: number;
    difficulty?: number;
    boost?: number;
    setback?: number;
    remsetback?: number;
    force?: number;
    advantage?: number;
    success?: number;
    threat?: number;
    failure?: number;
    light?: number;
    dark?: number;
    triumph?: number;
    despair?: number;
    source?: unknown;
  }
}
