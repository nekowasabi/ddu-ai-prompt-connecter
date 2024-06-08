import { Denops } from "https://deno.land/x/denops_std@v6.4.0/mod.ts";
import * as fn from "https://deno.land/x/denops_std@v6.4.0/function/mod.ts";
// import * as n from "https://deno.land/x/denops_std@v6.4.0/function/nvim/mod.ts";
import * as v from "https://deno.land/x/denops_std@v6.4.0/variable/mod.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.17.0/mod.ts";
// import { feedkeys } from "https://deno.land/x/denops_std@v6.4.0/function/mod.ts";
import { parse, stringify } from "jsr:@std/toml";

export async function main(denops: Denops): Promise<void> {
  type Prompt = {
    word: string;
  };
  type Prompts = Prompt[];
  // enum BufferLayout {
  //   split = "split",
  //   vsplit = "vsplit",
  //   floating = "floating",
  // }
  //
  // /**
  //  * グローバル変数 "aider_buffer_open_type" からバッファの開き方を取得します。
  //  * split: 横分割
  //  * vsplit: 縦分割
  //  * floating: フローティングウィンドウ
  //  */
  // const openBufferType = await v.g.get(denops, "aider_buffer_open_type");
  //
  // /**
  //  * 現在のファイルパスを取得します。
  //  *
  //  * @returns {Promise<string>} 現在のファイルパスを表す文字列を返します。
  //  */
  // async function getCurrentFilePath(): Promise<string> {
  //   return ensure(await fn.expand(denops, "%:p"), is.String);
  // }
  //
  // /**
  //  * 指定されたバッファ番号に対応するバッファ名を取得します。
  //  *
  //  * @param {Denops} denops - Denops インスタンス。
  //  * @param {number} bufnr - バッファ番号
  //  * @returns {Promise<string>} バッファ名
  //  * @throws {Error} バッファ名が文字列でない場合、エラーがスローされます
  //  */
  // async function getBufferName(denops: Denops, bufnr: number): Promise<string> {
  //   const bufname = ensure(
  //     await fn.bufname(denops, bufnr),
  //     is.String,
  //   ) as string;
  //   return bufname;
  // }
  async function getPrompts() {
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
            word: is.String,
          }),
        ),
      }),
    ).prompts;
  }

  denops.dispatcher = {
    async runConnecter(command: unknown): Promise<void> {
      const prompts = await getPrompts();
      // 引数からコメント取得
      // コマンド実行
      denops.call(
        "<Cmd>call ddu#start({'sources': [{'name': 'mr', 'params': {'kind': 'mrw'}}]})",
      );
    },
  };

  await denops.cmd(
    `command! -nargs=? AiConnecterRun call denops#notify("${denops.name}", "runConnecter", [<q-args>])`,
  );
}
