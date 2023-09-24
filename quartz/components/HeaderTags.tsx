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
