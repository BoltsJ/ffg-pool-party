export declare class RollBuilderFFG extends FormApplication {
  constructor(
    rolldata: RollBuilderFFG["roll"]["data"],
    rollDicePool: RollBuilderFFG["dicePool"],
    rollDescription: string,
    rollSkillName?: string,
    rollItem?: RollBuilderFFG["roll"]["item"],
    rollAdditionalFlavor?: string,
    rollSound?: string
  );

  // My Stuff - Don't rely on this
  shareUsers?: Set<string>;

  override get title(): string;
  override async getData(): object;
  override activateListenser(html: JQuery<HTMLElement>): void;
  _updatePreview(html: JQuery<HTMLElement>): void;
  _initializeInputs(html: JQuery<HTMLElement>): void;
  _activateInputs(html: JQuery<HTMLElement>): void;
  override _updateObject(): void;

  dicePool: DicePoolFFG;
  description: string;
  roll: RollBuilderRoll;
}

interface RollBuilderRoll {
  data: RollBuilderRollData;
  skillName: string;
  item?: foundry.data.ItemData;
  sound?: string;
  flavor?: string;
}
interface RollBuilderRollData {
  data: foundry.data.UserData;
}
