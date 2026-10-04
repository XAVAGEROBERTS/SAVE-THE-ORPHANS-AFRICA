export interface Program {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  icon: string;
  objectives: string[];
  impactStats: { label: string; value: string }[];
  color: string;
}

export const programs: Program[] = [
  {
    id: "education",
    slug: "education",
    title: "Education",
    description:
      "Providing quality education through school fees, supplies, and learning resources.",
    longDescription:
      "Education is the most powerful tool we can use to change the world. Our education program ensures that every child in our care has access to quality schooling.",
    image: "https://placehold.co/800x600/176B45/FFFFFF/png?text=Education",
    icon: "GraduationCap",
    objectives: [
      "Cover school fees for all children in our care",
      "Provide school supplies, books, and uniforms",
      "Offer tutoring and academic support",
      "Fund vocational training for older youth",
    ],
    impactStats: [
      { label: "Children in School", value: "85+" },
      { label: "Graduates Supported", value: "25+" },
    ],
    color: "#176B45",
  },
  {
    id: "healthcare",
    slug: "healthcare",
    title: "Healthcare",
    description:
      "Ensuring every child has access to medical care, nutrition, and mental wellbeing support.",
    longDescription:
      "Good health is the foundation of a happy childhood. Our healthcare program provides comprehensive medical care for every child.",
    image: "https://placehold.co/800x600/E53E3E/FFFFFF/png?text=Healthcare",
    icon: "Heart",
    objectives: [
      "Provide regular medical checkups for all children",
      "Cover medication and treatment costs",
      "Ensure proper nutrition for healthy development",
      "Offer mental health and counseling support",
    ],
    impactStats: [
      { label: "Medical Visits", value: "500+" },
      { label: "Children Covered", value: "150+" },
    ],
    color: "#E53E3E",
  },
  {
    id: "nutrition",
    slug: "nutrition",
    title: "Food & Nutrition",
    description:
      "Providing daily nutritious meals, clean water, and food security programs.",
    longDescription:
      "No child can learn or grow on an empty stomach. Our nutrition program ensures every child receives balanced, nutritious meals every day.",
    image: "https://placehold.co/800x600/F4B942/1F2933/png?text=Nutrition",
    icon: "Utensils",
    objectives: [
      "Provide three nutritious meals daily",
      "Ensure access to clean, safe drinking water",
      "Implement nutrition education programs",
      "Support food security through gardening projects",
    ],
    impactStats: [
      { label: "Meals Provided", value: "1,200+" },
      { label: "Children Fed Daily", value: "150+" },
    ],
    color: "#F4B942",
  },
  {
    id: "child-protection",
    slug: "child-protection",
    title: "Child Protection",
    description:
      "Creating safe environments through safeguarding, counseling, and family support.",
    longDescription:
      "Every child deserves to feel safe and protected. Our child protection program provides safe accommodation and comprehensive safeguarding measures.",
    image: "https://placehold.co/800x600/805AD5/FFFFFF/png?text=Protection",
    icon: "Shield",
    objectives: [
      "Provide safe, secure accommodation",
      "Implement comprehensive child safeguarding policies",
      "Offer trauma-informed counseling services",
      "Support family reunification where appropriate",
    ],
    impactStats: [
      { label: "Children Protected", value: "150+" },
      { label: "Staff Trained", value: "45" },
    ],
    color: "#805AD5",
  },
  {
    id: "skills-development",
    slug: "skills-development",
    title: "Skills Development",
    description:
      "Equipping youth with vocational training, computer skills, and life skills.",
    longDescription:
      "When children age out of our care, they need practical skills to build independent futures. Our skills development program prepares them.",
    image: "https://placehold.co/800x600/3182CE/FFFFFF/png?text=Skills",
    icon: "Wrench",
    objectives: [
      "Provide vocational training in trades",
      "Offer computer literacy courses",
      "Teach entrepreneurship and business skills",
      "Develop essential life skills",
    ],
    impactStats: [
      { label: "Youth Trained", value: "45+" },
      { label: "Job Placements", value: "28" },
    ],
    color: "#3182CE",
  },
];