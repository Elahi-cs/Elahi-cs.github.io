---
tags:
  - portfolio
  - this-site
---
Now that we have a site up as documented in [[Creating a Portfolio Site with Quartz and GitHub Pages - The Process]], we can make it stop being naked.

![[Naked Quartz Site.png]]

[Quartz](https://quartz.jzhao.xyz/) comes with a lot of cool features that are already well documented, so I won't get too much into them. What I will do is explain how to go from those awkward first steps of a naked site to diving into the code to create a component that allows me to finally fulfill my own [[Features and Requirements]].

# 1. Content

This is probably the easiest part of the process. All the content in Quartz lives inside the `content` directory in the form of Markdown files. Quartz will handle the conversion from Markdown to HTML (which is kind of its primary thing).

You just drop whatever you want into the `content`directory, then run:
```shell
npx quartz build
npx quartz sync
```
And voilà, you have content in your site.

Quartz also handles folders and most Obsidian things for you so you really only have to copy and paste files into `content` and run the commands above every time you want to get something published (which is a process that my computer engineer mind is dying to automate, so if that happens it will be explained in [[Automating a blog workflow from Obsidian]]).

This is what Quartz looks like with some more content files in it:
![[Customized Site v1.png]]

You might have noticed two things (and it's ok if you didn't, I'm about to let you know about them):
1. I edited the main page
2. I edited the footer

The first one is quite simple but it has a gotcha: The "main page" in Quartz is a filed called `index.md`. If you edit it in Obsidian you'll notice that you might break the index if you change the title (because Obsidian changes the file name to match the title). You can work around this by writing
```txt
---
title: {your desired title}
---
```
and leaving the filename and Obsidian title as it is. That's how my index page shows "Elahi Concha" in it.

For the second one, it's time to roll up our sleeves and take a peep at some code.

# 2. Component customization
![[Default Footer.png]]
![[Custom Footer.png]]

The default components are nice and all, and I'm all about crediting people where credit is due: [Jacky Zhao and the rest of the Quartz contributors](https://github.com/jackyzha0/quartz/graphs/contributors) are amazing people and this site wouldn't be here without them. However, I want my portfolio site to be a little more personal. So one of the first things I wanted to do was to change the footer, which is prevalent in all pages in the site.

After some searching in both the documentation and the code, I found the component responsible for the footer, very aptly named `Footer`, which is then called in the `quartz.layout.ts` file. This are the code pieces we're interested in:
```tsx title=quartz.layout.ts
---SNIP---
// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/jackyzha0/quartz",
      "Discord Community": "https://discord.gg/cRFFHYye7t",
    },
  }),
}
---SNIP---
```

```tsx {14-26} title={repo}/quartz/components/Footer.tsx
import { QuartzComponentConstructor } from "./types"
import style from "./styles/footer.scss"
import { version } from "../../package.json"

interface Options {
  links: Record<string, string>
}

export default ((opts?: Options) => {
  function Footer() {
    const year = new Date().getFullYear()
    const links = opts?.links ?? []
    return (
      <footer>
        <hr />
        <p>
          Created with <a href="https://quartz.jzhao.xyz/">Quartz v{version}</a>, © {year}
        </p>
        <ul>
          {Object.entries(links).map(([text, link]) => (
            <li>
              <a href={link}>{text}</a>
            </li>
          ))}
        </ul>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
```
You can see how this function returns some HTML for the footer with the text already built in and then enumerates through the links provided when it's called in `quartz.layout.ts`. All we have to do is change the HTML inside the `Footer` function and then the links in the `quartz.layout.ts` call.

This is what these pieces look like for me:
```tsx title={repo}/quartz/components/Footer.tsx
---SNIP---
export default ((opts?: Options) => {
  function Footer() {
    const year = new Date().getFullYear()
    const links = opts?.links ?? []
    return (
      <footer>
        <hr />
        <ul>
          {Object.entries(links).map(([text, link]) => (
            <li>
              <a href={link}>{text}</a>
            </li>
          ))}
        </ul>
        <p>
        Want to know more about how this site was created? Check out my article about setting up this place <a href="https://elahi.me/this-site/Creating-a-Portfolio-Site-with-Quartz-and-GitHub-Pages---The-Process">here</a>.
        </p>
        <p>
          Created with <a href="https://quartz.jzhao.xyz/">Quartz v{version}</a> and maintained with <a href="https://obsidian.md/">Obsidian</a>, {year}.
        </p>
      </footer>
    )
  }
---SNIP---
```
```tsx title=quartz.layout.ts
---SNIP---
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/Elahi-cs",
      LinkedIn: "https://linkedin.com/in/elahi-concha",
    },
  }),
---SNIP---
```

And now my footer looks like this:
![[Custom Footer.png]]

That's much better. However all that took was some digging and some html and link editing. For our next task we'll have to go a bit deeper.

# 3. Creating Quartz components

If you take a look at my [[Features and Requirements]], you can see there's a glaring omission: We don't have sections!

I wanted a header that linked directly to the Home page, to my Projects section, and to my Blog section. Granted, I don't have any of those sections *right now*, but my goal is to have them at some point, and having the header that leads to an empty promise will serve as a great reminder that I should get on it.

Now, Quartz doesn't provide a straightforward way to add stuff to the header, so it's time to take matters into our own hands. 

There's some great documentation on [component creation](https://quartz.jzhao.xyz/advanced/creating-components) in the Quartz site, but I wanted to document my own experience in case anyone else wants some header action (it sounded better in my head, err).

Where should we start? This line of code in the layout file looks like an open invitation:
```tsx {4} title=quartz.layout.ts
---SNIP---
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  footer: Component.Footer({
	links: {
---SNIP---
```
It's like it's taunting us to fill that empty list.

What I want is very similar to what I have in the footer already: Just some spaced words that have some links in them. So we can use `Footer.tsx` as a footprint for the new component.
```tsx title=quartz/components/HeaderTags.tsx
import { QuartzComponentConstructor } from "./types"
import style from "./styles/headerTags.scss"

interface Options {
  links: Record<string, string>
}

export default((opts?: Options) => {
  const links = opts?.links ?? []
  function HeaderTags() {
    return (
      <header>
        <ul>
          {Object.entries(links).map(([text, link]) => (
            <li>
              <a href={link}>{text}</a>
            </li>
          ))}
        </ul>
      </header>
    )
  }

  HeaderTags.css = style
  return HeaderTags
}) satisfies QuartzComponentConstructor
```

As you can see it's pretty similar to what we had in `Footer.tsx`. Now all we're missing is some style:
```scss title=quartz/components/styles/headerTags.scss
header {
  text-align: left;
  margin-bottom: 1rem;
  opacity: 0.7;

  & ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: row;
    gap: 1rem;
    margin-top: -1rem;
  }
}
```

Now all we need is to add some links over in the layout file.
```ts title=quartz.layout.ts
  header: [ Component.HeaderTags({
      links: {
          Home: "/",
          Projects: "#",
          Blog: "#",
      }
  }) 
  ],
```

The `Projects` and `Blog` links redirect nowhere for now, but we'll change that once we have the sections. You can customize your stuff however you see fit. 

And that's pretty much it for customization! I'll add more stuff as I go around.