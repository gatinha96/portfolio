import { SiMonogame, SiAutodeskmaya, SiUnity, SiNodedotjs, SiAndroid, SiGit, SiJavascript, SiReact, SiDotnet, SiFigma, SiAndroidstudio, SiGooglecardboard, SiWebgl, SiPython, SiArduino, SiBlender, SiOpenai, SiGamedeveloper, SiGithubcopilot, SiLatex, SiOverleaf } from "react-icons/si";
import { TbBoxModel, TbBrandCSharp, TbAugmentedReality2, TbBrandMysql, TbSql, TbBrandAdobePhotoshop, TbDeviceImacPlus } from "react-icons/tb"
import { BsHeadsetVr, BsStack } from "react-icons/bs";
import { DiVisualstudio, DiJava } from "react-icons/di";
import { PiMicrosoftWordLogoFill, PiMicrosoftPowerpointLogoFill, PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { FaServer, FaMobileAlt, FaNetworkWired, FaWindows } from "react-icons/fa";
import { MdHttp, MdViewQuilt } from "react-icons/md";
import { VscVscode } from "react-icons/vsc";

export const categories = [    
    {
        id: "domain",
        title: "Domains"
    },
    {
        id: "language",
        title: "Languages"
    },
    {
        id: "framework",
        title: "Frameworks"
    },
    {
        id: "tool",
        title: "Tools"
    },
    {
        id: "technology",
        title: "Technologies",
    },
    {
        id: "ai",
        title: "AI Tools"
    },
    {
        id: "platform",
        title: "Platforms",
    }
]

export function getSkillCategoryId(skill) {
    return categories.find((category) => skill?.tags?.includes(category.id))?.id || "tool";
}

export function getSkillCategoryTitle(skill) {
    return categories.find((category) => skill?.tags?.includes(category.id))?.title || "Tools";
}

export const skills = [
    {
        id: "android",
        title: "Android",
        icon: SiAndroid,
        tags: ["platform", "personal", "university", "ccg"]
    },
    {
        id: "androidstudio",
        title: "Android Studio",
        icon: SiAndroidstudio,
        tags: ["tool", "personal", "university"]
    },
    {
        id: "ar",
        title: "Augmented Reality",
        icon: TbAugmentedReality2,
        tags: ["platform", "personal", "university", "ccg"]
    },
    {
        id: "arduino",
        title: "Arduino",
        icon: SiArduino,
        tags: ["platform", "university"]
    },
    {
        id: "arfoundation",
        title: "AR Foundation",
        icon: SiUnity,
        tags: ["framework", "personal", "university", "ccg"]
    },
    {
        id: "aspnet",
        title: "ASP.NET",
        icon: SiDotnet,
        tags: ["framework", "ccg"]
    },
    {
        id: "backend",
        title: "Backend",
        icon: FaServer,
        tags: ["featured", "domain", "personal", "university", "ccg"]
    },
    {
        id: "blender",
        title: "Blender",
        icon: SiBlender,
        tags: ["tool", "personal"]
    },
    {
        id: "cardboard",
        title: "Google Cardboard",
        icon: SiGooglecardboard,
        tags: ["platform", "personal", "university"]
    },
    {
        id: "chatgpt",
        title: "ChatGPT",
        icon: SiOpenai,
        tags: ["ai", "personal", "ccg"]
    },
    {
        id: "csharp",
        title: "C#",
        icon: TbBrandCSharp,
        tags: ["featured", "language", "personal", "university", "ccg"]
    },
    {
        id: "excel",
        title: "Microsoft Excel",
        icon: PiMicrosoftExcelLogoFill,
        tags: ["tool", "personal", "middle_school", "high_school", "university", "ccg"]
    },
    {
        id: "figma",
        title: "Figma",
        icon: SiFigma,
        tags: ["tool", "ccg"]
    },
    {
        id: "frontend",
        title: "Frontend",
        icon: MdViewQuilt,
        tags: ["domain", "personal", "university", "ccg"]
    },
    {
        id: "fullstack",
        title: "Full Stack",
        icon: BsStack,
        tags: ["domain", "university", "ccg"]
    },
    {
        id: "gamedev",
        title: "Game Development",
        icon: SiGamedeveloper,
        tags: ["featured", "domain", "personal", "university", "ccg"]
    },
    {
        id: "ghcopilot",
        title: "GitHub Copilot",
        icon: SiGithubcopilot,
        tags: ["ai", "personal"]
    },
    {
        id: "git",
        title: "Git",
        icon: SiGit,
        tags: ["featured","tool", "personal", "university", "ccg"]
    },
    {
        id: "http",
        title: "HTTP / REST",
        icon: MdHttp,
        tags: ["technology", "ccg", "university"]
    },
    {
        id: "java",
        title: "Java",
        icon: DiJava,
        tags: ["language", "personal", "university"]
    },
    {
        id: "js",
        title: "Javascript",
        icon: SiJavascript,
        tags: ["language", "personal", "university"]
    },
    {
        id: "latex",
        title: "LaTeX",
        icon: SiLatex,
        tags: ["language", "personal", "university"]
    },
    {
        id: "mobile",
        title: "Mobile Development",
        icon: FaMobileAlt,
        tags: ["domain", "personal", "university", "ccg"]
    },
    {
        id: "mscopilot",
        title: "Microsoft Copilot",
        icon: "mscopilot.svg",
        tags: ["ai", "personal", "ccg"]
    },
    {
        id: "msword",
        title: "Microsoft Word",
        icon: PiMicrosoftWordLogoFill,
        tags: ["tool", "personal", "middle_school", "high_school", "university", "ccg"]
    },
    {
        id: "mysql",
        title: "MySQL",
        icon: TbBrandMysql,
        tags: ["tool", "university"]
    },
    {
        id: "networking",
        title: "Networking",
        icon: FaNetworkWired,
        tags: ["domain", "personal", "university"]
    },
    {
        id: "nodejs",
        title: "Node.js",
        icon: SiNodedotjs,
        tags: ["framework", "personal"]
    },
    {
        id: "overleaf",
        title: "Overleaf",
        icon: SiOverleaf,
        tags: ["tool", "personal", "university", "ccg"]
    },
    {
        id: "photoshop",
        title: "Adobe Photoshop",
        icon: TbBrandAdobePhotoshop,
        tags: ["tool", "university"]
    },
    {
        id: "powerpnt",
        title: "Microsoft PowerPoint",
        icon: PiMicrosoftPowerpointLogoFill,
        tags: ["tool", "personal", "middle_school", "high_school", "university", "ccg"]
    },
    {
        id: "python",
        title: "Python",
        icon: SiPython,
        tags: ["language", "personal"]
    },
    {
        id: "reactjs",
        title: "React.js",
        icon: SiReact,
        tags: ["framework", "personal"]
    },
    {
        id: "sql",
        title: "SQL",
        icon: TbSql,
        tags: ["language", "university"]
    },
    {
        id: "tcp",
        title: "TCP/IP",
        icon: FaNetworkWired,
        tags: ["technology", "university"]
    },
    {
        id: "udp",
        title: "UDP",
        icon: FaNetworkWired,
        tags: ["technology", "university"]
    },
    {
        id: "unity",
        title: "Unity",
        icon: SiUnity,
        tags: ["featured", "framework", "personal", "university", "ccg"]
    },
    {
        id: "vbasic",
        title: "Visual Basic",
        icon: DiVisualstudio,
        tags: ["language", "university"]
    },
    {
        id: "vr",
        title: "Virtual Reality",
        icon: BsHeadsetVr,
        tags: ["featured", "platform", "personal", "university", "ccg"]
    },
    {
        id: "vscode",
        title: "Visual Studio Code",
        icon: VscVscode,
        tags: ["featured", "tool", "personal", "university", "ccg"]
    },
    {
        id: "vstudio",
        title: "Visual Studio",
        icon: DiVisualstudio,
        tags: ["featured", "tool", "personal", "ccg"]
    },
    {
        id: "vuforia",
        title: "Vuforia",
        icon: TbAugmentedReality2,
        tags: ["technology", "university"]
    },
    {
        id: "webgl",
        title: "WebGL",
        icon: SiWebgl,
        tags: ["technology", "ccg"]
    },
    {
        id: "websocket",
        title: "WebSocket",
        icon: "websocket.svg",
        tags: ["technology", "ccg"]
    },
    {
        id: "windows",
        title: "Windows",
        icon: FaWindows,
        tags: ["featured", "platform", "personal", "university", "ccg"]
    },
    {
        id: "xr",
        title: "Extended Reality",
        icon: BsHeadsetVr,
        tags: ["featured", "domain", "personal", "university", "ccg"]
    },
    {
        id: "xritk",
        title: "XR Interaction Toolkit",
        icon: SiUnity,
        tags: ["framework", "ccg"]
    },
    {
        id: "shaderlab",
        title: "Unity ShaderLab",
        icon: SiUnity,
        tags: ["featured", "language", "university", "ccg"]
    },
    {
        id: "shadergraph",
        title: "Unity ShaderGraph",
        icon: SiUnity,
        tags: ["featured", "language", "university", "ccg"]
    },
    {
        id: "hlsl",
        title: "HLSL compute shader",
        icon: SiUnity,
        tags: ["featured", "language", "ccg"]
    },
    {
        id: "monogame",
        title: "Monogame framework",
        icon: SiMonogame,
        tags: ["featured", "framework", "university"]
    },
    {
        id: "c++",
        title: "C++",
        icon: TbDeviceImacPlus,
        tags: ["featured", "language", "university"]
    },
    {
        id: "modeling",
        title: "modeling",
        icon: TbBoxModel,
        tags: ["domain", "university"]
    },
    {
        id: "maya",
        title: "maya",
        icon: SiAutodeskmaya,
        tags: ["tool", "university"]
    }
]
