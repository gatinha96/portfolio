import { MdOutlineDeveloperMode } from "react-icons/md";
import { BiWorld } from "react-icons/bi";
import { FaPersonHiking } from "react-icons/fa6";
import { FaGamepad } from "react-icons/fa";

export const hobbies = [
    {
        id: "app_development",
        title: "App development",
        icon: MdOutlineDeveloperMode,
        description: [
            "I like to inivestigate new techniques to achieve cool effects/solutions",
            {
                type: "button",
                label: "Show personal projects",
                link: {
                    type: "projects",
                    filters: ["personal"]
                }
            }
        ]
    },
    {
        id: "hiking",
        title: "Hiking and nature watching",
        icon: FaPersonHiking,
        description: [
            "I like to join colleagues, friends and family on nature hikes.",
        ]
    },
    {
        id: "tree climbing",
        title: "Tree climbing",
        icon: BiWorld,
        description: [
            "I like to do tree climbing activities in adventure parks."
        ]
    },
    {
        id: "gaming",
        title: "Gaming",
        icon: FaGamepad,
        description: [
            "I love gaming, ranging from puzzle games to epic adventures."
        ]
    }
];
