# 👨‍💻 Effortlessly access all your Discord data through a powerful API with just one click.

Audibert is aservice that makes it easy to access Discord presence data and guild information through a RESTful API `(api.audibert.rest/user/:userid)`. Perfect for displaying your Discord profile, badges, status, activities, and server information on your website or application.

## Get Started

1. [Join our Discord server](https://discord.gg/QaHyQz34Gq)
2. Your presence will be available at `api.audibert.rest/user/:userid`

That's all you need to do!

## API Docs

#### Get User Presence

GET `api.audibert.rest/user/:userid`

Example response:

```json
{
  "data": {
    "profile": {
      "bot": "false",
      "id": "1274150219482660897",
      "creation_date": "2024-08-16T23:38:04.891Z",
      "member_since": "Aug 16, 2024",
      "username": "grwx",
      "pronouns": "deded",
      "bio": "dfideliz",
      "link": "https://discord.com/users/1274150219482660897",
      "avatar": "7499eb14961cf682385521f20d6501f3",
      "avatar_image": "https://cdn.discordapp.com/avatars/1274150219482660897/7499eb14961cf682385521f20d6501f3.png",
      "badges": [
        {
          "id": "premium",
          "description": "Subscriber since Nov 16, 2024",
          "icon": "2ba85e8026a8614b640c2837bcdfe21b",
          "icon_image": "https://cdn.discordapp.com/badge-icons/2ba85e8026a8614b640c2837bcdfe21b.png",
          "link": "https://discord.com/settings/premium"
        },
        {
          "id": "guild_booster_lvl2",
          "description": "Server boosting since Nov 18, 2024",
          "icon": "0e4080d1d333bc7ad29ef6528b6f2fb7",
          "icon_image": "https://cdn.discordapp.com/badge-icons/0e4080d1d333bc7ad29ef6528b6f2fb7.png",
          "link": "https://discord.com/settings/premium"
        },
        {
          "id": "quest_completed",
          "description": "Completed a Quest",
          "icon": "7d9ae358c8c5e118768335dbe68b4fb8",
          "icon_image": "https://cdn.discordapp.com/badge-icons/7d9ae358c8c5e118768335dbe68b4fb8.png",
          "link": "https://discord.com/discovery/quests"
        }
      ],
      "connected_accounts": [
        {
          "type": "spotify",
          "name": "audibert",
          "link": "https://open.spotify.com/user/31w2axshoydaipmkuz6xvu337egq"
        }
      ]
    },
    "status": "idle",
    "spotify": {
      "type": "Listening to Spotify",
      "name": "Spotify",
      "song": "SPINNIN (Segway Remix)",
      "artist": "ONEFOUR, Nemzzz, Segway",
      "album": "SPINNIN (Segway Remix)",
      "album_image": "https://i.scdn.co/image/ab67616d0000b273c16a46456c512bf475a211f7",
      "link": "https://open.spotify.com/track/5H7JrQsT47tMwNFiPLSnEi",
      "timestamps": {
        "progress": "2:42",
        "duration": "2:42"
      }
    },
    "activity": [
      {
        "type": "Playing",
        "name": "Visual Studio Code",
        "state": "Workspace: audibert",
        "details": "Editing README.md",
        "largeText": "Editing a MARKDOWN file",
        "largeImage": "https://cdn.discordapp.com/app-assets/383226320970055681/565945077491433494.png",
        "smallText": "Visual Studio Code",
        "smallImage": "https://cdn.discordapp.com/app-assets/383226320970055681/565945770067623946.png",
        "timestamps": {
          "time_lapsed": "35:44"
        }
      }
    ]
  },
  "success": true
}
```

<!-- #### Get User Acitivity

GET `api.rest.audibert/activty/:userid`

Example response:

```json
{
  "data": {
    "status": "idle",
    "spotify": {
      "type": "Listening to Spotify",
      "name": "Spotify",
      "song": "L's",
      "artist": "Nemzzz",
      "album": "DO NOT DISTURB (DELUXE)",
      "album_image": "https://i.scdn.co/image/ab67616d0000b27328b4eaa6b95cb08edc6a979f",
      "link": "https://open.spotify.com/track/4eIkgU9qfmwwPicaCRUI55",
      "timestamps": {
        "progress": "0:35",
        "duration": "1:57"
      }
    },
    "activity": [
      {
        "type": "Playing",
        "name": "Visual Studio Code",
        "state": "Workspace: audibert",
        "details": "Editing README.md",
        "largeText": "Editing a MARKDOWN file",
        "largeImage": "https://cdn.discordapp.com/app-assets/383226320970055681/565945077491433494.png",
        "smallText": "Visual Studio Code",
        "smallImage": "https://cdn.discordapp.com/app-assets/383226320970055681/565945770067623946.png",
        "timestamps": {
          "time_lapsed": "36:06"
        }
      }
    ]
  },
  "success": true
}
``` -->

<!-- #### Get Guilds

GET `api.rest.audibert/guilds`

Example response:

```json
{
  "count": 8,
  "data": [
    {
      "id": "898561725857685524",
      "name": "𝓞𝓷𝓵𝔂𝓑𝓸𝓽𝓼",
      "owner_id": "605750453120139275"
    },
    {
      "id": "1061792195893543047",
      "name": "Bar das Galaxias",
      "owner_id": "478561686673162240"
    },
    {
      "id": "1287828475729678336",
      "name": "Discode",
      "owner_id": "1274150219482660897"
    },
    {
      "id": "1313726337994723441",
      "name": "/nerdolas",
      "owner_id": "303699181900660737"
    },
    {
      "id": "1313921883728515194",
      "name": "audi",
      "owner_id": "1274150219482660897"
    },
    {
      "id": "1316602054759813191",
      "name": "grwx's server",
      "owner_id": "1274150219482660897"
    },
    {
      "id": "1327810016463290509",
      "name": "pedro margarido morreu ontem de noite",
      "owner_id": "1274150219482660897"
    },
    {
      "id": "1330322535618969736",
      "name": "HOLDER",
      "owner_id": "1274150219482660897"
    }
  ],
  "success": true
}
``` -->

#### Get Specific Guild

GET `api.audibert.rest/guild/:guildid`

Example response:

```json
{
  "data": {
    "id": "1313726337994723441",
    "owner_id": "303699181900660737",
    "creation_date": "2024-12-04T04:39:26.833Z",
    "on_since": "Dec 04, 2024",
    "name": "/nerdolas",
    "icon": "https://cdn.discordapp.com/icons/1313726337994723441/9dfb41c9a7f263feb85da4d1186a9c80.png",
    "banner": "https://cdn.discordapp.com/banners/1313726337994723441/0a9a2bbd38d0c785e3116bf96ffa60ae.png",
    "splash": "https://cdn.discordapp.com/splashes/1313726337994723441/f301b8af2fe5f2e3e8986eb2423aad89.png",
    "boost_count": 24,
    "boost_level": 3,
    "community": true,
    "discoverable": false,
    "verified": false,
    "member_count": 333,
    "member_online_count": 109,
    "emoji": "https://cdn3.emoji.gg/emojis/3388-community-server-boosted.png",
    "country": "pt-BR"
  },
  "invite": "https://discord.gg/MBpV2NJF",
  "success": true
}
```

## Quick Links

Audibert provides quick links for easy access to specific Discord resources, such as profiles and activities.

GET `api.audibert.rest/profile/:userid` or GET `api.audibert.rest/activity/:userid`

## Error Codes

When making requests to the Audibert API, you may encounter these error codes. Use these codes to understand and handle errors in your application appropriately.

| Code | Description                               |
| ---- | ----------------------------------------- |
| 404  | Resource not found (route, user or guild) |
| 500  | Internal server error                     |

## Contributing

Contributions are welcome! Feel free to open issues and submit pull requests to help improve Audibert.
