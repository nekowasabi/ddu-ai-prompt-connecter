import {
  ActionFlags,
  Actions,
  BaseKind,
  Context,
  DduItem,
  PreviewContext,
  Previewer,
} from "https://deno.land/x/ddu_vim@v3.10.2/types.ts";

import { Denops } from "https://deno.land/x/ddu_vim@v3.10.2/deps.ts";
import { is, maybe } from "https://deno.land/x/unknownutil@v3.15.0/mod.ts";

export type ActionData = {
  path: string;
  command: string;
  text: string;
};

type Params = {
  command: string;
};

const isDduItemAction = is.ObjectOf({ text: is.String, command: is.String });

export const PromptAction: Actions<Params> = {
  execute: (args: {
    denops: Denops;
    context: Context;
    actionParams: unknown;
    items: DduItem[];
  }) => {
    const { denops, items } = args;
    const action = maybe(items.at(0)?.action, isDduItemAction);
    denops.cmd(`${action?.command} ${action?.text}`);
    return ActionFlags.None;
  },
};

export class Kind extends BaseKind<Params> {
  override actions = PromptAction;
  override getPreviewer(args: {
    denops: Denops;
    item: DduItem;
    actionParams: unknown;
    previewContext: PreviewContext;
  }): Promise<Previewer | undefined> {
    const action = args.item.action as ActionData;
    if (!action) {
      return Promise.resolve(undefined);
    }

    return Promise.resolve({
      kind: "nofile",
      contents: [action.text, "a", "b"],
    });
  }

  override params(): Params {
    return {
      command: "GpNew",
    };
  }
}
