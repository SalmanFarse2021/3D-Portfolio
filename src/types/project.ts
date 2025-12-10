export interface Project {
    id: string;
    title: string;
    description: string;
    technologies: string[];
    image: string;
    link?: string;
    githubLink?: string;
    websiteLink?: string;
    position?: [number, number, number];
}
