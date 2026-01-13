# TanStack Docs Discord bot

## Setup for development

### Install dependencies

```bash
cd discord-bot
pnpm install
```

### Copy the `.env.example` file and rename it to `.env`

Fill out all the necessary info.

### Create a config file

The bot needs information about which servers to join and about itself.

1. Head into [`config`](./config/) and create a new file. It should follow the pattern `config.{'development' | 'production'}.json`.
2. Add a `$schema` field that points to `"./config.schema.json"` for type safety.

> Development and production lets you manage and test a "dev bot" while leaving the production application up and running.

IMPORTANT: Ids are **always** strings with digits, not numbers.

Example config: `config.development.json`

```json
{
  "$schema": "./config.schema.json",
  "logLevel": "debug",
  "clientId": "123456789012345678",
  "guildId": "123456789012345678"
}
```

You should now be ready to run the bot.

## Adding new TanStack libraries to docs commands

In case you need to add a new library to the list, head over to the [the docs file](./src/commands/docs.ts).

## Continuing work on the bot

Prerequisite: Your production bot should be running in its own environment outside of the repository.
It should be configured to use `config.production.json`.

To develop new features for the bot:

1. Create a second application on the [Discord Developer Portal](https://discord.com/developers/applications).
2. Adjust your `.env` to use the new Discord token.
3. Create and fill out `config.development.json`.
4. You are now free to run and test a "separate bot" from production. Ideally on a private Discord server.

`pnpm test` should give you early feedback before `pnpm deploy:commands` or `pnpm dev` are called.

## Common pitfalls

### The slash command does not show up / The slash command has the wrong options

You very likely forgot to deploy the commands. Due to being more heavily rate limited, command deployment is not done on bot startup.
Instead, use `pnpm deploy:commands`.
