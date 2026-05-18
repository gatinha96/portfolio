export const schools = [
    {
        id: "university",
        title: "University of Instituto Politécnico Cávado e Ave (IPCA)",
        icon: "ipca.png",
        label: "University",
        type: "University",
        headline: ["Bachelors & Masters Engineering and Development of Digital Games Course"],
        description: [
            {
                type: "button",
                icon: "ipca.png",
                label: "Website",
                link: "https://ipca.pt/"
            }
        ],
        courses: [
            {
                title: "Engineering and Development of Digital Games (EDJD)",
                degrees: ["Bachelor's degree"],
                date: {
                    start: "2016-09",
                    end: "2019-03"
                },
                // grade: {
                //     value: 15.072,
                //     range: 20
                // },                
                description:                    
                    {
                        type: "button",
                        icon: "ipca.png",
                        label: "Website",
                        link: "https://ipca.pt/curso/desenvolvimento-de-jogos-digitais/"
                    }
                
            },
            {
            title: "Engineering and Development of Digital Games (EDJD)",
                degrees: ["Master's degree"],
                date: {
                    start: "2019-09",
                    end: "2022-03"
                },
                // grade: {
                //     value: 15.072,
                //     range: 20
                // },                
                description: [                    
                    {
                        type: "button",
                        icon: "ipca.png",
                        label: "Website",
                        link: "https://ipca.pt/curso/desenvolvimento-de-jogos-digitais/"
                    },
                    {
                        type: "button",
                        //icon: "ipca.png",
                        label: "Publication",
                        link: "https://researchgate.net/publication/366353663_Sensors_Transducers_Development_of_a_Virtual_Reality_Tool_for_Therapy_and_Diagnosis_of_Schizophrenia"
                    }
                ]
            }
        ]
    },
    {
        id: "high_school",
        title: "Didáxis Vale S. Cosme",
        icon: "didaxis.png",
        label: "High School",
        type: "High School",
        headline: ["Sciences and Technology"],
        description: [
            {
                type: "button",
                icon: "didaxis.png",
                label: "Website",
                link: "https://didaxis.pt/regular/"
            }
        ],
        courses: [
            {
                title: "Sciences and Technology",
                degrees: ["High School & Secondary grade"],
                date: {
                    start: "2007-09",
                    end: "2016-07"
                }//,
                // grade: {
                //     value: 14.75,
                //     range: 20
                // }
            },
            {
                title: "Cambridge diploma",
                degrees: ["Cambridge CAE (Cambridge Advanced English) diploma"],
                date: {
                    start: "2014-09",
                    end: "2015-05"
                }
            }
        ]
    }
]