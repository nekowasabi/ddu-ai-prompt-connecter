import { BaseSource } from "https://deno.land/x/ddu_vim@v5.0.0/base/source.ts";
import type {
  DduOptions,
  Item,
  SourceOptions,
} from "https://deno.land/x/ddu_vim@v5.0.0/types.ts";
import type { Denops } from "https://deno.land/x/ddu_vim@v5.0.0/deps.ts";
import type { ActionData } from "https://deno.land/x/ddu_kind_file@v0.8.0/file.ts";
import * as fn from "https://deno.land/x/denops_std@v6.5.1/function/mod.ts";
import * as v from "https://deno.land/x/denops_std@v6.5.1/variable/mod.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.18.1/mod.ts";
import { parse } from "jsr:@std/toml";

type Params = {
  command: string;
  selected?: string;
  tag?: string;
};

type Prompt = {
  title?: string;
  tag: string;
  word: string;
};

async function getPrompts(denops: Denops) {
  const promptToml = await v.g.get(denops, "prompt_toml");
  if (!promptToml) {
    throw new Error("No prompts found.");
  }

  const path = ensure(promptToml, is.String);
  const fileContent = await fn.readfile(denops, path);
  ensure(fileContent, is.Array);

  const parsed = parse(fileContent.join("\n"));
  return ensure(
    parsed,
    is.ObjectOf({
      prompts: is.ArrayOf(is.ObjectOf({
        title: is.OptionalOf(is.String),
        tag: is.String,
        word: is.String,
      })),
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

          const filteredPrompts = prompts.filter(
            (prompt: Prompt) =>
              !args.sourceParams.tag || prompt.tag === args.sourceParams.tag,
          );

          const items: Item<ActionData>[] = filteredPrompts.map((
            prompt: Prompt,
          ) => ({
            word: prompt.title || "none title",
            action: {
              text: `prompt.word + "\n" + ${selectedText}`,
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
      command: "GpNew",
    };
  }
}
