"use client";
import { TitleDescription } from "@/reusable-ui/TitleDescription";
import { ProjectCard } from "../page";
import MobxStore from "@/mobx";
import { observer } from "mobx-react";

const PlayPage = observer(() => {
  const { projects } = MobxStore;
  console.log({ projects });
  return (
    <div className="m-4 sm:m-8 flex flex-col gap-6">
      <TitleDescription
        title="Continue Playing"
        description="Finish your started advantures"
      />

      <div className="flex flex-wrap gap-4">
        {projects.map((project, index) => (
          <ProjectCard
            project={project}
            isStarted={true} // fix this
            isMyProject={false}
            key={index}
          />
        ))}
      </div>

      <TitleDescription
        title="Start New Advantures"
        description="Start fresh new advantures"
      />

      <div className="flex flex-wrap gap-4">
        {projects.map((project, index) => (
          <ProjectCard project={project} isMyProject={false} key={index} />
        ))}
      </div>
    </div>
  );
});

export default PlayPage;
