export interface ImpactStat {
  id: string;
  value: number;
  suffix: string;
  label: string;
  description: string;
  icon: string;
}

export const impactStats: ImpactStat[] = [
  {
    id: "children",
    value: 150,
    suffix: "+",
    label: "Children Supported",
    description: "Children receiving care, education, and support",
    icon: "Users",
  },
  {
    id: "school",
    value: 85,
    suffix: "+",
    label: "Children in School",
    description: "Children currently enrolled in education",
    icon: "GraduationCap",
  },
  {
    id: "medical",
    value: 500,
    suffix: "+",
    label: "Medical Visits",
    description: "Healthcare visits provided to children",
    icon: "Heart",
  },
  {
    id: "meals",
    value: 1200,
    suffix: "+",
    label: "Meals Provided",
    description: "Nutritious meals served to children",
    icon: "Utensils",
  },
  {
    id: "volunteers",
    value: 35,
    suffix: "+",
    label: "Volunteers",
    description: "Dedicated volunteers supporting our mission",
    icon: "HandHeart",
  },
  {
    id: "projects",
    value: 20,
    suffix: "+",
    label: "Community Projects",
    description: "Projects completed in local communities",
    icon: "Building",
  },
];