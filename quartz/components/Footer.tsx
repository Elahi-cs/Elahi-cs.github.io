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
        <ul>
          {Object.entries(links).map(([text, link]) => (
            <li>
              <a href={link}>{text}</a>
            </li>
          ))}
        </ul>
        <p>
        Want to know more about how this site was created? Check out my article about setting up this place <a href="https://elahi.me/Projects/this-site/How-I-created-this-site">here</a>.
        </p>
        <p>
          Created with <a href="https://quartz.jzhao.xyz/">Quartz v{version}</a> and maintained with <a href="https://obsidian.md/">Obsidian</a>, {year}.
        </p>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
