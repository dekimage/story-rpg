"use client";
import MobxStore from "@/mobx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { observer } from "mobx-react";
import { useEffect, useState } from "react";

const PROJECT_ENTITIES = [
  "Pages",
  "Items",
  "Skills",
  "Stats",
  // "Characters",
  // "Quests",
];

const EditProjectBasics = ({ project }) => {
  const [projectName, setProjectName] = useState(project?.name || "");
  const [projectDescription, setProjectDescription] = useState(
    project?.description || ""
  );
  const [isPublished, setIsPublished] = useState(project?.isPublished || false);
  const { createProject, updateProject, deleteProject } = MobxStore;

  useEffect(() => {
    setProjectName(project?.name || "");
    setProjectDescription(project?.description || "");
    setIsPublished(project?.isPublished || false);
  }, [project]);

  const handleSubmit = async () => {
    const projectData = {
      name: projectName,
      description: projectDescription,
      isPublished,
    };

    if (project) {
      await updateProject(project?.id, projectData);
    } else {
      await createProject(projectData);
    }
  };

  const handleDelete = async (projectId) => {
    await deleteProject(projectId);
  };

  return (
    <div className="flex flex-col gap-4 mb-4">
      <div className="mb-2">
        <img className="w-40 mb-2" src={project.imageUrl} alt="project" />
        <Input
          value={projectName}
          className="text-4xl h-12 w-fit"
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project Name"
        />
      </div>
      <div className="mb-2">
        <Textarea
          value={projectDescription}
          className="text-lg h-12"
          onChange={(e) => setProjectDescription(e.target.value)}
          placeholder="Project Description"
        />
      </div>
      <div className="mb-4">
        <label>
          <input
            type="checkbox"
            checked={isPublished}
            onChange={() => setIsPublished(!isPublished)}
          />
          Is Published?
        </label>
      </div>
      <div>
        <Button onClick={handleSubmit}>
          {project ? "Update Project" : "Create Project"}
        </Button>
        {project && (
          <Button onClick={() => handleDelete(project.id)}>
            Delete Project
          </Button>
        )}
      </div>
    </div>
  );
};

const Item = ({ item }) => {
  return (
    <div className="p-4 h-28 w-64 text-2xl rounded border flex justify-between cursor-pointer shadow-md">
      <div className="flex flex-col gap-2">
        <div>{item.name}</div>
        <div className="text-4xl">{item.value}</div>{" "}
      </div>
    </div>
  );
};

const EditProject = observer(({ params }) => {
  const { projects } = MobxStore;
  const projectId = params.id;

  const projectFromState = projects?.find((p) => p.id === projectId);

  const [project, setProject] = useState(projectFromState);

  useEffect(() => {
    setProject(projectFromState);
  }, [projectFromState]);

  const [view, setView] = useState("items");

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="m-4 sm:mx-8">
      <Button
        className="mb-4 gap-1"
        variant="outline"
        onClick={() => {
          window.history.back();
        }}
      >
        <ChevronLeft /> Back
      </Button>
      <EditProjectBasics project={project} />
      <div className="flex flex-wrap gap-4">
        {PROJECT_ENTITIES.map((e, i) => (
          <div
            className="p-4 h-28 w-64 text-2xl rounded border flex justify-between cursor-pointer shadow-md"
            key={i}
          >
            <div className="flex flex-col gap-2">
              <div>{e}</div>
              <div className="text-4xl">5</div>{" "}
            </div>
            <div className="">
              <ChevronRight />
            </div>
          </div>
        ))}

        {view == "items" && (
          <div>
            {project.items?.map((item, i) => (
              <Item item={item} key={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
export default EditProject;
