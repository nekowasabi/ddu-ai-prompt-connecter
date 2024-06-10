# ai-prompt-connecter

## Description

The `ai-prompt-connecter` is a plugin designed to integrate AI-generated prompts
into your workflow. It leverages the power of Deno and Denops to provide a
seamless experience for managing and executing prompts within your editor. This
plugin allows you to define prompts in a TOML file and execute them using custom
commands, enhancing your productivity and creativity.

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

TODO...

## Usage

1. **Install the plugin**: Follow the installation instructions for your editor
   to add the `ai-prompt-connecter` plugin.
2. **Configure the plugin**: Create a TOML file with your prompts and set the
   `prompt_toml` variable in your editor's configuration to point to this file.
3. **Run a prompt**: Use the command `:DduPrompt` to open the prompt selection
   interface. Select a prompt to execute it.

- Deno (v1.10.0 or later)
- Denops (v3.10.2 or later)
- A TOML file defining your prompts
- A compatible editor (e.g., Neovim)
