"use client";
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { ModeToggle } from "./ui/themeButton";

const components = [
  {
    title: "Apply This Concept",
    href: "/apply-this-concept",
    description:
      "Implement the key ideas from books into your life with actionable steps.",
  },
  {
    title: "Atomic Habits Builder",
    href: "/atomic-habits-builder",
    description: "Build habits based on the book Atomic Habits by James Clear.",
  },
  {
    title: "Quests Builder",
    href: "/quests-builder",
    description: "Gamify your todo lists with quests & rewards",
  },
  {
    title: "Robo Rally",
    href: "/robo-rally",
    description:
      "Race game, engine builder game that teaches programming principles and logic while having fun.",
  },
];

function NavBar() {
  return (
    <NavigationMenu className="border-b w-full max-w-full py-2 px-4 justify-between">
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary mr-4"
            href="/"
          >
            Home
          </Link>
          <NavigationMenuTrigger>Projects</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>

      <ModeToggle />
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  }
);
ListItem.displayName = "ListItem";

export default NavBar;
