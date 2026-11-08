# Launch drafts

Drafts for telling people about Ferrule. Nothing here has been posted. Read each one, change what is not in your voice, and post it yourself. Fill the one placeholder, `[why]`, with your own reason for building it. No reason is made up here.

Every claim in these drafts matches what was actually run for 0.2.0. If something changes before you post, update [the platform status](../../apps/docs/content/platforms.md) first, then the drafts.

What was run, in short:

- iOS: the iOS 26.5 simulator only (iPhone 17 Pro Max). No physical iPhone.
- Android: an API 37 emulator, and one physical Pixel 8a on Android 17.
- Web: Chrome, plus the WebKit and Firefox builds that Playwright ships. Not Safari or Firefox as released.
- No live VoiceOver, TalkBack or browser screen reader run.
- It is 0.x. Expect changes between minor versions.

## Files

| File | For |
| --- | --- |
| [show-hn.md](show-hn.md) | Hacker News |
| [reddit.md](reddit.md) | r/reactnative, and r/expo |
| [thread.md](thread.md) | X and Bluesky |
| [article.md](article.md) | dev.to or Hashnode |
| [chat.md](chat.md) | Discord and Slack communities |
| [lists.md](lists.md) | React Native Directory, awesome lists, newsletters |
| [social-preview.jpg](social-preview.jpg) | The repo's social preview, 1280 by 640 |

## Order

1. **Before anything:** upload the social preview, so every shared repo link gets a picture. On GitHub, open the repo's Settings > General > Social preview > Edit > Upload an image, and pick `docs/launch/social-preview.jpg`. The API cannot set it.
2. **Search Console**, so Google knows the site. At search.google.com/search-console, add a URL-prefix property for `https://leoanimesh.github.io/ferrule/`. Choose the "HTML tag" method and send the tag to whoever maintains the site: it goes in `apps/docs/public/index.html`, then needs a merge. After that, submit `https://leoanimesh.github.io/ferrule/sitemap.xml` under Sitemaps.
3. **React Native Directory**, from [lists.md](lists.md). It lasts, and it needs no audience. Its own CI checks the entry.
4. **Show HN**, on a weekday morning, US Eastern. Stay around for a few hours to answer.
5. **r/reactnative**, a day or two later. Read the subreddit's rules first: they could not be fetched for this draft. Then r/expo, a few days after that, only if its rules allow it.
6. **The X and Bluesky thread**, the same day as Show HN or Reddit, linking to the site.
7. **The article**, within the week. Set its canonical URL to the docs site if you also publish it elsewhere.
8. **Chat communities**, only in channels meant for showing work.
9. **Awesome lists**, later: [lists.md](lists.md) explains why to wait.

Do not ask anyone to upvote, star or comment. Hacker News says so outright, and Reddit treats it as vote manipulation.
