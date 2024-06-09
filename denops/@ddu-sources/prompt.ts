import {
  BaseSource,
  DduOptions,
  Item,
  SourceOptions,
} from "https://deno.land/x/ddu_vim@v3.10.2/types.ts";
import { Denops } from "https://deno.land/x/ddu_vim@v3.10.2/deps.ts";
import { ActionData } from "https://deno.land/x/ddu_kind_file@v0.7.1/file.ts";
import * as fn from "https://deno.land/x/denops_std@v6.4.0/function/mod.ts";
// import * as n from "https://deno.land/x/denops_std@v6.4.0/function/nvim/mod.ts";
import * as v from "https://deno.land/x/denops_std@v6.4.0/variable/mod.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.17.0/mod.ts";
// import { feedkeys } from "https://deno.land/x/denops_std@v6.4.0/function/mod.ts";
import { parse } from "jsr:@std/toml";

type Params = {
  command: string;
  selected?: string;
};

type Prompt = {
  word: string;
  title?: string;
};

async function getPrompts(denops: Denops) {
  if (!v.g.get(denops, "prompt_toml")) {
    console.log("No prompts found.");
    Deno.exit(1);
  }

  const path = ensure(await v.g.get(denops, "prompt_toml"), is.String);

  const fileContent = await fn.readfile(denops, path);
  ensure(fileContent, is.Array);

  return ensure(
    parse(fileContent.join("\n")),
    is.ObjectOf({
      prompts: is.ArrayOf(
        is.ObjectOf({
          title: is.String,
          word: is.String,
        }),
      ),
    }),
  ).prompts;
}

export class Source extends BaseSource<Params> {
  override kind = "prompt";

  override gather(args: {
    denops: Denops;
    options: DduOptions;
    sourceOptions: SourceOptions;
    sourceParams: Params;
    input: string;
  }): ReadableStream<Item<ActionData>[]> {
    return new ReadableStream<Item<ActionData>[]>({
      async start(controller) {
        try {
          const prompts = await getPrompts(args.denops);

          const selectedText = args.sourceParams.selected ?? "";

          const items: Item<ActionData>[] = prompts.map((prompt: Prompt) => ({
            word: prompt.title || "none title",
            action: {
              path: prompt.word,
              text: prompt.word + "\n" + selectedText,
              command: args.sourceParams.command,
            },
          }));
          controller.enqueue(items);
        } catch (e: unknown) {
          console.error(e);
        }
        controller.close();
      },
    });
  }

  override params(): Params {
    return {
      command: "Gp",
    };
  }
}
