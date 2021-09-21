import type { RollBuilderFFG } from "./rollbuilder";

export declare class DiceHelpers {
  static async displayRollDialog(
    ...args: ConstructorParameters<typeof RollBuilderFFG>
  ): Promise<void>;
}
