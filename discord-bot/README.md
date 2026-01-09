# TanStack Docs Discord bot

## Setup for development

### Install dependencies

```bash
cd discord-bot
pnpm install
```

### Copy the `.env.example` file and rename it to `.env`

Fill out all the necessary info.

## Common pitfalls

### Slash command missing as option

You very likely forgot to deploy the commands. Due to being more heavily rate limited, command deployment is not done on bot startup.
Instead, use `pnpm deploy:commands`.
