import type { RollBuilderFFG } from "../types/rollbuilder";
import { queueMessage } from "./socket/queueMessage";

export class RollSelectorForm extends FormApplication<
  FormApplication.Options,
  RollSelectorForm.Data
> {
  static override get defaultOptions(): FormApplication.Options {
    const opts: FormApplication.Options = {
      ...super.defaultOptions,
      title: "FFGPOOLPARTY.ChooseAPlayer",
      id: "pool-selector",
      template: "modules/ffg-pool-party/templates/roll-selector.hbs",
      width: 500,
    };
    return opts;
  }

  override getData() {
    const data: Partial<RollSelectorForm.Data> = {};
    data.players = [...ffgDicePools.values()].map(m => {
      return {
        id: m.userId,
        name: game.users?.get(m.userId)?.name ?? "UNKNOWN USER",
        pool: new DicePoolFFG(m.pool).renderPreview(),
        description: m.description,
      };
    });
    return data as RollSelectorForm.Data;
  }

  override activateListeners(
    ...[html]: Parameters<FormApplication["activateListeners"]>
  ) {
    super.activateListeners(html);

    html.find(".dice-pool").each(function () {
      const id: string = $(this).data("player");
      const pool = new DicePoolFFG(ffgDicePools.get(id)?.pool);
      pool.renderPreview(this);
    });

    html.find("button.choose-roll").on("click", async ev => {
      const userId: string = $(ev.currentTarget).data("player");
      console.log(userId);
      const m = ffgDicePools.get(userId);
      if (!m) return;
      await game.ffg.DiceHelpers.displayRollDialog(
        m.data,
        new DicePoolFFG(m.pool),
        m.description,
        m.skill,
        m.item,
        m.flavor,
        m.sound
      );
      queueMessage({
        kind: "listen",
        userId: game.userId!,
        target: userId,
      });
      const app = Object.values(ui.windows).find(a =>
        a.hasOwnProperty("dicePool")
      ) as RollBuilderFFG | undefined;
      if (!app) return;
      app.shareUsers = new Set([userId]);
    });
  }

  override async _updateObject() {}
}

export namespace RollSelectorForm {
  export interface Data {
    players: {
      id: string;
      name: string;
      pool: HTMLElement;
      description: string;
    }[];
  }
}

export function openSelectorForm() {
  const form = new RollSelectorForm({});
  form.render(true);
  return form;
}
