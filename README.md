# Grux API

Grux is aservice that makes it easy to access Discord profile and presence informations through a RESTful API `(grux.audibert.dev/user/:userid)`. Perfect for displaying your Discord profile, badges, status, activities, and server information on your website or application.

## Get Started

1. Join my [Discord server](https://discord.gg/gu7sKjwEz5)

[![Discord Server Card](https://cardzera.audibert.dev/api/1383718526694461532?buttonText=Join%20now%20to%20access%20the%20API&t={timestamp})](https://discord.gg/gu7sKjwEz5)

2. Your presence will be available at `api.audibert.rest/user/:userid`

That's all you need to do!

## API Docs

### Getting a user's full presence data

`GET grux.audibert.dev/user/:userid`

> [!NOTE]
> This endpoint has a 5-minute cache for profile fields (nameplate, badges, clan, connected_accounts) to improve performance and avoid limits.

```js
{
  "data": {
    "profile": {
      "bot": false,
      "device": "desktop",
      "id": "1274150219482660897",
      "creation_date": "2024-08-16T23:38:04.891Z",
      "username": "grwx",
      "display_name": "Audibert",
      "link": "https://discord.com/users/1274150219482660897",
      "avatar": "6c9747063de19030c95daa80c1ca61c7",
      "avatar_image": "https://cdn.discordapp.com/avatars/1274150219482660897/6c9747063de19030c95daa80c1ca61c7.png?size=1024",
      "avatar_decoration_image": null,
      "nameplate_image": "https://cdn.discordapp.com/assets/collectibles/nameplates/nameplates/twilight//static.png",
      "badges": [
        {
          "id": "active_developer",
          "description": "Active Developer",
          "asset": "6bdc42827a38498929a4920da12695d9",
          "badge_image": "https://cdn.discordapp.com/badge-icons/6bdc42827a38498929a4920da12695d9.png"
        },
        {
          "id": "quest_completed",
          "description": "Completed a Quest",
          "asset": "7d9ae358c8c5e118768335dbe68b4fb8",
          "badge_image": "https://cdn.discordapp.com/badge-icons/7d9ae358c8c5e118768335dbe68b4fb8.png"
        },
        {
          "id": "orb_profile_badge",
          "description": "Collected the Orb Profile Badge",
          "asset": "83d8a1eb09a8d64e59233eec5d4d5c2d",
          "badge_image": "https://cdn.discordapp.com/badge-icons/83d8a1eb09a8d64e59233eec5d4d5c2d.png"
        }
      ],
      "clan": {
        "tag": "CODE",
        "identity_guild_id": "1112920281367973900",
        "asset": "b8161e357e4c3de4fb7c649b3523a1ea",
        "clan_image": "https://cdn.discordapp.com/clan-badges/1112920281367973900/b8161e357e4c3de4fb7c649b3523a1ea.png"
      },
      "connected_accounts": [
        {
          "type": "youtube",
          "name": "audibert",
          "link": "https://youtube.com/channel/UCIO1e3zJ-c2oQCWnmY4nqIQ"
        }
      ]
    },
    "status": "online",
    "spotify": null,
    "activity": [
      {
        "type": "Playing",
        "name": "Visual Studio Code",
        "state": "Workspace: audibert",
        "details": "Editing README.md",
        "largeText": "Editing a MARKDOWN file",
        "largeImage": "https://cdn.discordapp.com/app-assets/383226320970055681/1359299128655347824.png",
        "smallText": "Visual Studio Code",
        "smallImage": "https://cdn.discordapp.com/app-assets/383226320970055681/1359299466493956258.png",
        "timestamps": {
          "start": 1750726516133
        }
      }
    ]
  },
  "success": true
}
```

### Getting only activity data (real-time)

If you only need activity and status information without cached profile data, use:

`GET grux.audibert.dev/activity/:userid`

```js
{
  "data": {
    "status": "online",
    "spotify": null,
    "activity": [
      {
        "type": "Playing",
        "name": "Visual Studio Code",
        "state": "Workspace: embeds",
        "details": "Editing welcome.js",
        "largeText": "Editing a JS file",
        "largeImage": "https://cdn.discordapp.com/app-assets/383226320970055681/1359299016025964687.png",
        "smallText": "Visual Studio Code",
        "smallImage": "https://cdn.discordapp.com/app-assets/383226320970055681/1359299466493956258.png",
        "timestamps": {
          "start": 1750721680869
        }
      }
    ]
  },
  "success": true
}
```

## Contribuition

Contributions are welcome! Feel free to open an issue or submit a pull request if you have a way to improve this project.

Make sure your request is meaningful and you have tested the app locally before submitting a pull request.

## Support

_If you're using this repo, feel free to show support and give this repo a ⭐ star! It means a lot, thank you :)_
