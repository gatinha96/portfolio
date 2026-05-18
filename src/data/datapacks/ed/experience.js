import { IoLocationSharp } from "react-icons/io5";
import { SiBosch } from "react-icons/si";

export const companies = [
    {
        id: "ccg",
        title: "CCG/ZGDV Institute",
        icon: "ccg.svg",
        department: "CVIG-CG - Computer Vision, Interaction and Graphics - Computer Graphics",
        description: [
            {
                type: "button",
                icon: "ccg.svg",
                label: "Website",
                link: "https://ccg.pt/en"
            },
            {
                type: "button",
                icon: "ccg.svg",
                label: "CVIG",
                link: "https://ccg.pt/en/research-and-innovation/ri-departments/computer-vision-interaction-and-graphics"
            },
            {
                type: "button",
                icon: IoLocationSharp,
                label: "Universidade do Minho, Guimarães",
                link: "https://maps.app.goo.gl/5Pnj7W8nLfpWHGXXA"
            }
        ],
        roles: [
            {
                title: "Software Developer",
                date: {
                    start: "2023-01",
                    end: "2026-07"
                },
                description: [
                    "Project: Texp@ct WP3: PPS13",
                    {
                        type: "button",
                        //icon: "ecp.png",
                        label: "Texp@ct",
                        link: "https://pt.linkedin.com/posts/texpact_texpact-boostedbyciteve-wp3-activity-7459968134037401601-ONk-"
                    }
                ]
            }
        ]
    },
    {
        id: "2Ai",
        title: "2Ai - School of technology, Instituto Politécnico do Cávado e Ave (IPCA)",
        icon: "2ai.png",
        label: "Internship",
        description: [
            {
                type: "button",
                icon: "2ai.png",
                label: "Website",
                link: "https://2ai.ipca.pt/"
            }
        ],
        roles: [
            {
                title: "Software Developer",
                date: {
                    start: "2021-03",
                    end: "2023-02"
                },
                description: [
                    "Virtual Reality Software Developer. This work was funded by the project “NORTE-01-0145-FEDER-000042”, supported by Northern Portugal Regional Operational Program (Norte2020), under the Portugal 2020 Partnership Agreement, through the European Regional Development Fund (FEDER). It was also funded by national funds, through the FCT – Fundação para a Ciência e Tecnologia and FCT/MCTES in the scope of the project UIDB/05549/2020. ",
                    {
                        type: "button",
                        //icon: "2ai.png",
                        label: "Description",
                        link: "https://portalold.ipb.pt/uploads/apoioinvestigacao/fichas_projeto/Ficha_de_Projeto_-_GreenHealth.pdf"
                    },
                    {
                        type: "button",
                        //icon: "ecp.png",
                        label: "Dissertation",
                        link: "https://researchgate.net/publication/366353663_Sensors_Transducers_Development_of_a_Virtual_Reality_Tool_for_Therapy_and_Diagnosis_of_Schizophrenia"
                    }
                ]
            }
        ]
    },
    {
        id: "bosch",
        title: "Bosch, Braga",
        icon: SiBosch,
        description: "Summer internship",
        roles: [
            {
                tags: ["no-calc"],
                title: "Engineering Assistant",
                date: {
                    start: "2016-07",
                    end: "2016-09"
                },
                description: [
                    "First work experience in an industrial environment through a summer internship at Bosch.",
                    {
                        type: "button",
                        icon: SiBosch,
                        label: "Website",
                        link: "https://www.bosch.pt/a-nossa-empresa/bosch-em-portugal/braga/"
                    }
                ]
            }
        ]
    }
]