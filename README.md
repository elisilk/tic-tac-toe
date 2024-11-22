# Frontend Mentor - Tic Tac Toe solution

This is a solution to the [Tic Tac Toe challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/tic-tac-toe-game-Re7ZF_E2v). Frontend Mentor challenges help you improve your coding skills by building realistic projects.

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Screenshots](#screenshots)
  - [Links](#links)
- [My process](#my-process)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
  - [Continued development](#continued-development)
  - [Useful resources](#useful-resources)
- [Author](#author)

## Overview

### The challenge

Users should be able to:

- View the optimal layout for the game depending on their device's screen size
- See hover states for all interactive elements on the page
- Play the game either solo vs the computer or multiplayer against another person
- **Bonus 1**: Save the game state in the browser so that it’s preserved if the player refreshes their browser
- **Bonus 2**: Instead of having the computer randomly make their moves, try making it clever so it’s proactive in blocking your moves and trying to win

### Screenshots

|               Mobile designed at 375px:               |               Tablet designed at 768px:               | Desktop designed at 1440px:                            |
| :---------------------------------------------------: | :---------------------------------------------------: | ------------------------------------------------------ |
| ![](./screenshots/screenshot-mobile-metric-empty.png) | ![](./screenshots/screenshot-tablet-metric-empty.png) | ![](./screenshots/screenshot-desktop-metric-empty.png) |
|                  Mobile (completed):                  |                  Tablet (completed):                  | Desktop (completed):                                   |
|    ![](./screenshots/screenshot-mobile-metric.png)    |   ![](./screenshots/screenshot-tablet-imperial.png)   | ![](./screenshots/screenshot-desktop-metric.png)       |

### Links

- Solution URL: [https://github.com/elisilk/tic-tac-toe](https://github.com/elisilk/tic-tac-toe)
- Live Site URL: [https://elisilk.github.io/tic-tac-toe/](https://elisilk.github.io/tic-tac-toe/)

## My process

### Built with

- Semantic HTML5 markup
- CSS custom properties
- Flexbox
- CSS Grid
- Mobile-first workflow
- Fluid typography
- Accessibility

### What I learned

Hmm 🤔 ...

### Continued development

Specific areas that the solution should be improved (known issues):

- **Bonus #1**: Save the game state in the browser so that it’s preserved if the player refreshes their browser
- **Bonus #2**: Improve the CPU's game play algorithm; Instead of having the computer randomly make their moves, try making it clever so it’s proactive in blocking your moves and trying to win
- Figure out why the "O" icons seem to have the edges cut off a bit, and correct
- Should have animations when a mark is placed, especially when the CPU is placing it, so it's more obvious to the user (and not so quick)
- I have an outline on the radio buttons when the button is focused. But when the left radio buttin is in focus, the right side of the outline gets obscured by the right radio button. It would be great to figure out a way to make that outline come to the top. The design has the two buttons right next to each other with no gap, so that presents a challenge. And I like have a big chunky outline as I think it is consistent with the rest of the design. And I also like the outline extended a little beyond the box (instead of as an inset), since I think it is more visible on all the other boxes that way. But maybe the radio buttons should have a special modifier that puts their outline inset a bit since I'm not sure what other way to solve the issue.

More general ideas I want to consider:

Hmm 🤔 ...

### Useful resources

- [Accessibility Developer Guide](https://www.accessibility-developer-guide.com/)
- [MDN Web Docs for CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) - Went here a lot to reference the different CSS properties and the shorthands, and all the great explanations about best practices.
- [MDN Guides](https://developer.mozilla.org/en-US/docs/Learn)
- [The Clamp Calculator](https://royalfig.github.io/fluid-typography-calculator/) - Used for all of fluid typography and fluid spacing calculations.
- [The Modern JavaScript Tutorial](https://javascript.info/)
- [Wes Bos - JavaScript Introduction](https://wesbos.com/javascript/01-the-basics/welcome) and other [courses](https://wesbos.com/courses)

## Author

- Website - [Eli Silk](https://github.com/elisilk)
- Frontend Mentor - [@elisilk](https://www.frontendmentor.io/profile/elisilk)
