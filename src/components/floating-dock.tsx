import React, { useState ,useEffect} from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconTextCaption,
  IconPhoto,
  IconTextSize,
  IconPhoto as IconPhotoPlaceholder,
} from "@tabler/icons-react"; // Import relevant icons

interface LinkItem {
  title: string;
  href: string; // Ensure href is a string
  icon: React.ReactNode;
  type: string;
  onClick: () => void; // Function to handle click
}

interface FloatingDockDemoProps {
  setSelectedQuestionType: (type: string) => void; // Function prop type
}

export function FloatingDockDemo({ setSelectedQuestionType }: FloatingDockDemoProps) {
  const [selectedType, setSelectedType] = useState<string>("text-text"); // Specify type for selectedType
useEffect(()=>{
 console.log("seleectedtype",selectedType)
  },[selectedType])
  // Function to handle the selection of a question type
  const handleOptionSelect = (type: string) => {
    setSelectedType(type);
    setSelectedQuestionType(type); // Pass the selected type to the parent component
  };

  // Define the list of links with href, icons, titles, and selection handling
  const links: LinkItem[] = [
    {
      title: "Text Question & Text Options",
      href: "#", // Add a valid href or use "#" as a placeholder
      icon: (
        <IconTextCaption className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      type: "text-text",
      onClick: () => handleOptionSelect("text-text"),
    },
    {
      title: "Text Question & Image Options",
      href: "#", // Add a valid href or use "#" as a placeholder
      icon: (
        <IconPhoto className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      type: "text-image",
      onClick: () => handleOptionSelect("text-image"),
    },
    {
      title: "Image + Text Question & Text Options",
      href: "#", // Add a valid href or use "#" as a placeholder
      icon: (
        <IconTextSize className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      type: "image-text",
      onClick: () => handleOptionSelect("image-text"),
    },
    {
      title: "Image + Text Question & Image Options",
      href: "#", // Add a valid href or use "#" as a placeholder
      icon: (
     
        <IconPhotoPlaceholder className=" text-neutral-500 dark:text-neutral-300 h-full w-full"  />
    
      ),
      type: "image-image",
      onClick: () => handleOptionSelect("image-image"),
    },
  ];

  return (
    <div className="flex items-center justify-center h-[8rem] w-full">
      <FloatingDock
        mobileClassName="translate-y-20"
        items={links.map((link) => ({
          ...link,
          isActive: selectedType === link.type, // Highlight active link
        }))}
      />
    </div>
  );
}
