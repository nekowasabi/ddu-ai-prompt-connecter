import { Denops } from "https://deno.land/x/denops_std@v6.4.0/mod.ts";
import * as v from "https://deno.land/x/denops_std@v6.4.0/variable/mod.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.17.0/mod.ts";

export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    async openPrompts(): Promise<void> {
      if (!v.g.get(denops, "prompt_toml")) {
        console.log("No prompts found.");
        Deno.exit(1);
      }

      const path = ensure(await v.g.get(denops, "prompt_toml"), is.String);
      await denops.cmd(`edit ${path}`);
    },
  };

  await denops.cmd(
    `command! -nargs=0 AiOpenPrompts call denops#notify("${denops.name}", "openPrompts", [])`,
  );
}
