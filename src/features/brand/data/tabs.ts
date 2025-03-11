import { 
  BookOpen, 
  Palette, 
  MessageSquare, 
  FileImage, 
  FileText 
} from 'lucide-react';

export const brandTabs = [
  {
    id: "essentials",
    label: "Brand Essentials",
    icon: BookOpen,
    description: "Core brand values, mission, and vision",
  },
  {
    id: "visual",
    label: "Visual Identity",
    icon: Palette,
    description: "Logo, colors, typography, and imagery",
  },
  {
    id: "voice",
    label: "Voice & Tone",
    icon: MessageSquare,
    description: "Communication style and personality",
  },
  {
    id: "assets",
    label: "Brand Assets",
    icon: FileImage,
    description: "Downloadable brand elements",
  },
  // {
  //   id: 'guidelines',
  //   title: 'Guidelines',
  //   icon: FileText,
  //   description: 'Usage rules and documentation'
  // }
]; 