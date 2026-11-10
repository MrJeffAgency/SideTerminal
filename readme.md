# Side Terminal

A full terminal in the Acode sidebar, right next to your editor.

**Owner:** MrJeffAgency

## Features
- Full xterm.js terminal: colors, tab completion, vim, nano, htop
- Runs in Acode's Alpine environment
- Extra key row: Esc, Tab, Ctrl toggle, arrows, Home/End, PgUp/PgDn, ^C ^D ^Z
- Symbol row with commas and other characters
- Input bar for typing with your normal keyboard
- Top buttons: Restart, Clear, Fit, Full, Copy, Paste, About
- Prompt shows your current folder; proot warnings are hidden

## Install
Settings, Plugins, Install from zip, choose SideTerminal.zip. Open the sidebar and tap the `>_` icon.

## Commands
Open the command palette and search for:
- `Side Terminal: Open` opens the terminal panel
- `Side Terminal: Restart shell` opens the panel and starts a fresh shell

## Requirements
- Acode with the Alpine terminal installed
- Internet the first time (downloads xterm.js; usually cached afterwards)
- `script` or `python3` in Alpine for a real terminal (`apk add python3`)

## Tips
- Run a bot: `cd /public/telegram_claim && node telegram_claim_bot.cjs`
- Install Node: `apk add nodejs npm`
- If the terminal looks cut off, tap Fit

## Notes
Android shell mode is not included; the terminal runs the Alpine shell only.

## License and owner
Made and owned by MrJeffAgency.
## Source code and license
- Source repository: https://github.com/MrJeffAgency/SideTerminal
- License: Apache License 2.0 (see [LICENSE](LICENSE)).
