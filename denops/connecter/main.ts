import type { Denops } from "https://deno.land/x/denops_std@v6.5.1/mod.ts";
import * as v from "https://deno.land/x/denops_std@v6.5.1/variable/mod.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.18.1/mod.ts";

/**
 * Main entry point for the ddu-ai-prompt-connecter plugin.
 * Sets up command and dispatcher for managing AI prompts.
 */
export async function main(denops: Denops): Promise<void> {
  denops.dispatcher = {
    /**
     * Opens the prompts configuration file in the editor.
     * Exits if the prompt configuration file path is not set.
     */
    async openPrompts(): Promise<void> {
      if (!v.g.get(denops, "prompt_toml")) {
        console.log("Error: prompt_toml configuration is not set. Please set g:prompt_toml variable.");
        Deno.exit(1);
      }

      const promptTomlPath = ensure(await v.g.get(denops, "prompt_toml"), is.String);
      await denops.cmd(`edit ${promptTomlPath}`);
    },
  };

  // Register the AiOpenPrompts command
  await denops.cmd(`command! -nargs=0 AiOpenPrompts call denops#notify("${denops.name}", "openPrompts", [])`);
}
