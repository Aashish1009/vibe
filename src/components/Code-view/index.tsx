import Prism from "prismjs";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "./code-theme.css"
import { useEffect } from "react";

interface Props{
    code:string;
    language:string;
}
export const CodeView = ({code,language}:Props) => {

    useEffect(() => {
        console.log('CodeView: Code or language changed:', { language, codeLength: code.length });
        Prism.highlightAll();
    },[code, language])

    return (
        <pre className="p-2 bg-transparent border-none rounded-none m-0 text-xs">
            <code className={`language-${language}`}>
                {code}
            </code>
        </pre>
    )
}