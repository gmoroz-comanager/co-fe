# Posting Module

This module handles the integration with social platforms, currently focused on Telegram.

## Features

- **Bot Setup**: Connect a Telegram Bot using the token from BotFather.
- **Channel Verification**: Verify the bot has admin rights in a channel.
- **Publishing**: Post "polished" ideas to connected Telegram channels.

## Structure

- `api/`: Service for interacting with Strapi backend (Bots, Channels, Publishing).
- `store/`: Vuex module for managing bots and channels state.
- `views/`:
  - `PostingSetup.vue`: Onboarding flow for connecting bots and channels.
- `router/`: Routes for the module.

## Usage

The module exposes a "Post to TG" button in the Idea Detail view.
To set up, navigate to `/posting/setup`.

## Backend Dependencies

Requires `co-strapi` with `grammy` package and `telegram-bot` / `telegram-channel` content types.

