import { BiSolidDonateHeart } from "react-icons/bi";
import { FaInstagram, FaBlogger } from "react-icons/fa6";

export const activities = [
    {
        id: "Gamejam",
        title: "Gamejam",
        //icon: "refood.png",
        tags: ["Competition", "University"],
        description: [            
        ],
        roles: [
            {
                date: {
                    start: "2020-09",
                    end: "2023-12"
                },
                description: [
                    "Participated in competitions in which we have 48h to create a game according to a theme."
                ]
            }
        ]
    },
    {
        id: "Chess",
        title: "Chess",
        //icon: "netium.png",
        tags: ["Competition","Middle School"],
        description: [
            "Chess Club Vale S. Cosme",
            {
                type: "button",
                //icon: "netium.png",
                label: "Website",
                link: "https://cidadehoje.sapo.pt/andreia-mendes-vice-campea-nacional-sub-20-e-jose-santos-alcanca-podio-absoluto-sub-16/"
            }
        ],
        roles: [
            {
                title: "Chess",
                date: {
                    start: "2015-01",
                    end: "2020-12"
                },
                description: [
                    "Practiced chess and played in competitions at a national level."
                ]
            }
        ]
    },
    {
        id: "Vale Encantado",
        title: "\"Vale Encantado\"",
        //icon: "netium.png",
        tags: ["Volunteering"],
        description: [
            "Event information",
            {
                type: "button",
                //icon: "netium.png",
                label: "Event Description",
                link: "https://www.all4running.pt/prova/trail-vale-encantado/"
            },
            "",
            {
                type: "button",
                //icon: "netium.png",
                label: "Organizer's Facebook",
                link: "https://www.facebook.com/ArcvsCosme/"
            }
        ],
        roles: [
            {
                title: "\"Vale Encantado\" race event",
                date: {
                    start: "2024-03",
                    end: "2026-03"
                },
                description: [
                    "Volunteered as support for race events, helping with pre event preparations, the registering process, shop stalls and lunch serving, among other things."
                ]
            }
        ]
    }
]