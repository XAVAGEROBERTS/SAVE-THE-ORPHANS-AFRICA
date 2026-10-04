export interface Story {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  category: string;
  author: string;
}

export const stories: Story[] = [
  {
    id: "1",
    slug: "from-streets-to-classroom",
    title: "From the Streets to the Classroom: Amina's Journey",
    excerpt:
      "When Amina arrived at our center, she had never attended school. Today, she's one of our top students with dreams of becoming a doctor.",
    content:
      "When Amina arrived at Save the Orphans Africa, she was 8 years old and had never set foot in a classroom. Today, three years later, Amina is one of our top-performing students.",
    image: "/images/stories/story-1.jpg",
    date: "2026-01-15",
    category: "Success Stories",
    author: "Grace Mwangi",
  },
  {
    id: "2",
    slug: "new-classroom-block-opened",
    title: "New Classroom Block Opens at Our Education Center",
    excerpt:
      "Thanks to our generous donors, we've opened a new classroom block that will serve 60 additional children.",
    content:
      "We are thrilled to announce the opening of our new classroom block at the Save the Orphans Africa Education Center.",
    image: "/images/stories/story-2.jpg",
    date: "2026-01-08",
    category: "News",
    author: "James Ochieng",
  },
  {
    id: "3",
    slug: "volunteer-spotlight-sarah",
    title: "Volunteer Spotlight: Sarah's Summer with Us",
    excerpt:
      "Sarah spent three months volunteering with us and shares her experience of love, learning, and transformation.",
    content:
      "Sarah, a university student from the UK, spent three months volunteering at Save the Orphans Africa.",
    image: "/images/stories/story-3.jpg",
    date: "2025-12-20",
    category: "Volunteer Stories",
    author: "Sarah Thompson",
  },
  {
    id: "4",
    slug: "annual-fundraising-gala-success",
    title: "Annual Fundraising Gala Raises Record Amount",
    excerpt:
      "Our annual fundraising gala raised $50,000, exceeding our goal and ensuring our programs continue to thrive.",
    content:
      "Our annual fundraising gala was a tremendous success, raising $50,000 to support our programs.",
    image: "/images/stories/story-4.jpg",
    date: "2025-12-10",
    category: "Fundraising",
    author: "Grace Mwangi",
  },
];