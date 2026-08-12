# Interactive Date Proposal

A polished, romantic, playful date proposal microsite built as a static website. Perfect for sharing through a single GitHub Pages URL and opening on phones or desktops without installing anything.

## Features

- Mobile-first, responsive interactive proposal
- Smooth intro animation and screen transitions
- Playful NO button behavior with moving button and changing messages
- YES acceptance celebration with confetti and floating hearts
- Date reveal screen with configurable details
- Background music toggle with session-based preference
- Touch-friendly interactions and keyboard shortcuts
- Reduced-motion support and accessible focus states
- GitHub Pages-ready deployment workflow

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- CSS animations and Web APIs
- Static site ready for GitHub Pages

## Local Development

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd interactive-date-proposal
   ```

2. Open `index.html` in your browser, or use a local static server:

   ```bash
   npx http-server .
   ```

3. Visit the local URL shown in the terminal.

## Customization

Open `script.js` and update the `CONFIG` object:

- `recipientName`
- `proposal.title`
- `proposal.subtitle`
- `buttons.yes`
- `buttons.no`
- `noMessages`
- `date.date`
- `date.time`
- `date.location`
- `date.dressCode`
- `music.source`

The content and behavior are separated from the interaction logic.

## Music

- Music is optional and starts only after user interaction.
- Toggle music with the button at the bottom of the page.
- Replace `assets/audio/background.mp3` with your own audio file if desired.
- If audio is missing or blocked, the site continues to work normally.

## GitHub Pages Deployment

1. Push the repository to GitHub on the `main` branch.
2. GitHub Actions deploys automatically on each push.
3. Enable GitHub Pages from the repository settings if needed.
4. The live site will be available at:

   ```
   https://USERNAME.github.io/interactive-date-proposal/
   ```

If you rename the repository, update the URL accordingly.

## Mobile Testing

- Open the URL on your phone.
- Verify the intro screen loads.
- Tap `Continue ❤️`.
- Tap the `NO 😏` button several times.
- Tap `YES 🥰` and reveal the date.
- Use the music toggle button.
- Rotate the device and confirm the screen remains visible.

## Deployment Workflow

The workflow file is located at `.github/workflows/deploy.yml` and uses GitHub Pages official actions to publish the static site when changes are pushed to `main`.

## Notes

- The website is built for a romantic and premium feel without overwhelming shapes or excessive decorations.
- If `?name=Ananya` is added to the URL, the proposal becomes personalized.
