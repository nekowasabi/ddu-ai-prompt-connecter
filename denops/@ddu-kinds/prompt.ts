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
  info?: string;
};

type Params = {
  command: string;
};

const isDduItemAction = is.ObjectOf({ text: is.String, command: is.String });

export const BookmarkAction: Actions<Params> = {
  execute: async (args: {
    denops: Denops;
    context: Context;
    actionParams: unknown;
    items: DduItem[];
  }) => {
    const { denops, items } = args;
    const action = maybe(items.at(0)?.action, isDduItemAction);
    console.log(`execute ${action?.command} ${action?.text}`);
    denops.cmd(`${action?.command} ${action?.text}`);
    return ActionFlags.None;
  },
};

export class Kind extends BaseKind<Params> {
  override actions = BookmarkAction;
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
      kind: "buffer",
      path: action.path,
    });
  }

  override params(): Params {
    return {
      command: "Gp",
    };
  }
}
