# ddu-ai-prompt-connecter

## Description

`ddu-ai-prompt-connecter` is a ddu source that allows you to save commonly used
prompts from AI tools and use them in a common interface with various AI chat
plugins.

plug-in allows you to define prompts in a TOML file and execute them using
custom commands.

## Requirements

- [Deno](https://deno.land/)
- [ddu.vim](https://github.com/Shougo/ddu.vim)
- [Denops](https://github.com/vim-denops/denops.vim)
- [neovim](https://neovim.io/)

## Install

To install the `ai-prompt-connecter` plugin using vim-plug, add the following
lines to your `init.vim` or `init.lua`: e

```vim
call plug#begin('~/.vim/plugged')
Plug 'your-username/ai-prompt-connecter'
call plug#end()
```

After adding the lines, run `:PlugInstall` in your editor to install the plugin.

## Settings

### Prompts Configuration

let g:prompt_toml = '/path/to/nvim/prompt.toml'

```toml
[[prompts]]
title = "fix: error handling"
word = """
Must: The description must be translated into Japanese.
Check the following code for proper error handling,
If it is not, please point it out and suggest a fix if possible.
The code is shown below:
Check if the error handling of this code is done properly,
If necessary, please suggest improvements.
"""

[[prompts]]
title = "fix: logic error"
word = """
Must: The description must be translated into Japanese.
Check the following code for logical completeness,
If not, point it out, and if possible, suggest a fix,
If possible, please suggest a fix.
The code is shown below:
Check that the logical integrity of this code has been taken into account,
if necessary, please suggest improvements.
"""
```

### ddu.vim Configuration

The following example shall use
[CopilotC-Nvim/CopilotChat.nvim](https://github.com/CopilotC-Nvim/CopilotChat.nvim).

Other vim plugins that can be executed as commands in the form
`:ExampleAiPluginCommand XXX` can do the same.

```vim
call ddu#custom#patch_global(#{
    \   kindOptions: #{
    \     prompt: #{
    \       defaultAction: 'execute',
    \     },
    \   }
    \ })

call ddu#custom#patch_global(#{
    \   sourceOptions: #{
    \     _: #{
    \       matchers: ['matcher_matchfuzzy'],
    \       ignoreCase: v:true,
    \     },
    \     prompt: #{
    \       matchers: ['matcher_matchfuzzy'],
    \     },
    \   }
    \ })

nnoremap <silent> <Leader>P
  \ <Cmd>call ddu#start({'sources': [{'name': 'prompt', 'params': {'command': 'CopilotChat'}}]})<CR>

vnoremap <silent> <Leader>P
  \ y<Cmd>call ddu#start({'sources': [{'name': 'prompt', 'params': {'command': 'CopilotChat', 'selected': @@}}]})<CR>
```

## Usage

1. **Install the plugin**: Follow the installation instructions for your editor
   to add the `ai-prompt-connecter` plugin.
2. **Configure the plugin**: Create a TOML file with your prompts and set the
   `prompt_toml` variable in your editor's configuration to point to this file.
3. **Run a prompt**: Use the command
   `:call ddu#start({'sources': [{'name': 'prompt', 'params': {'command': 'CopilotChat'}}]})`
   to open the prompt selection interface. Select a prompt to execute it.

### Option command

`:AiOpenPrompts` : Open the prompt file.
