import { BaseSource } from "https://deno.land/x/ddu_vim@v5.0.0/base/source.ts";
import type { DduOptions, Item, SourceOptions } from "https://deno.land/x/ddu_vim@v5.0.0/types.ts";
import type { Denops } from "https://deno.land/x/ddu_vim@v5.0.0/deps.ts";
import type { ActionData } from "https://deno.land/x/ddu_kind_file@v0.8.0/file.ts";
import * as fn from "https://deno.land/x/denops_std@v6.5.1/function/mod.ts";
import * as v from "https://deno.land/x/denops_std@v6.5.1/variable/mod.ts";
import { ensure, is } from "https://deno.land/x/unknownutil@v3.18.1/mod.ts";
import { parse } from "jsr:@std/toml";

/**
 * ソースのパラメータ型定義
 * @property {string} command - 実行するコマンド
 * @property {string} [selected] - 選択されたテキスト
 * @property {string} [tag] - フィルタリングに使用するタグ
 */
type Params = {
  command: string;
  selected?: string;
  tag?: string;
};

/**
 * プロンプト設定の型定義
 * @property {string} [title] - プロンプトのタイトル
 * @property {string} tag - プロンプトのタグ
 * @property {string} word - プロンプトの本文
 */
type Prompt = {
  title?: string;
  tag: string;
  word: string;
};

/**
 * TOMLファイルからプロンプト設定を読み込んで解析する
 * @param {Denops} denops - Denopsインスタンス
 * @returns {Promise<Array<{title?: string, tag: string, word: string}>>} パースされたプロンプト設定の配列
 * @throws {Error} prompt_tomlが設定されていない場合
 * @throws {Error} ファイルの読み込みに失敗した場合
 * @throws {Error} TOMLの解析に失敗した場合、または期待される形式でない場合
 */
async function getPrompts(denops: Denops): Promise<Array<{ title?: string; tag: string; word: string }>> {
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
      prompts: is.ArrayOf(
        is.ObjectOf({
          title: is.OptionalOf(is.String),
          tag: is.String,
          word: is.String,
        }),
      ),
    }),
  ).prompts;
}

/**
 * プロンプト選択のためのDduソース
 * @extends {BaseSource<Params>}
 */
export class Source extends BaseSource<Params> {
  override kind = "prompt";

  /**
   * プロンプトを収集してDduのアイテムとして提供する
   * @param {Object} args - 引数オブジェクト
   * @param {Denops} args.denops - Denopsインスタンス
   * @param {DduOptions} args.options - Dduのオプション
   * @param {SourceOptions} args.sourceOptions - ソースのオプション
   * @param {Params} args.sourceParams - ソースのパラメータ
   * @param {string} args.input - 入力文字列
   * @returns {ReadableStream<Item<ActionData>[]>} Dduアイテムのストリーム
   */
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
          const { selected = "", tag, command } = args.sourceParams;

          const filteredPrompts = filterPromptsByTag(prompts, tag);
          const items = createItems(filteredPrompts, selected, command);

          controller.enqueue(items);
        } catch (e: unknown) {
          console.error("Failed to process prompts:", e);
        } finally {
          controller.close();
        }

        /**
         * プロンプトの配列をタグでフィルタリングする
         * @param {Prompt[]} prompts - フィルタリング対象のプロンプト配列
         * @param {string} [tag] - フィルタリングに使用するタグ
         * @returns {Prompt[]} フィルタリングされたプロンプトの配列。タグが指定されていない場合は元の配列を返す
         */
        function filterPromptsByTag(prompts: Prompt[], tag?: string): Prompt[] {
          return tag ? prompts.filter((prompt) => prompt.tag === tag) : prompts;
        }

        /**
         * プロンプトの配列からDduのアイテム配列を生成する
         * @param {Prompt[]} prompts - 変換対象のプロンプト配列
         * @param {string} selectedText - 選択されたテキスト
         * @param {string} command - 実行するコマンド
         * @returns {Item<ActionData>[]} Dduで使用するアイテムの配列
         */
        function createItems(prompts: Prompt[], selectedText: string, command: string): Item<ActionData>[] {
          return prompts.map((prompt) => ({
            word: prompt.title || "none title",
            action: {
              text: `${prompt.word}\n${selectedText}`,
              command,
            },
          }));
        }
      },
    });
  }

  /**
   * デフォルトのソースパラメータを提供する
   * @returns {Params} デフォルトのパラメータ
   */
  override params(): Params {
    return {
      command: "GpNew",
    };
  }
}
