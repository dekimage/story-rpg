"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import imgPlaceholder from "@/assets/placeholder.png";
import { TitleDescription } from "../StoryComponents/TitleDescription";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import MobxStore from "../mobx";
import { useEffect, useState } from "react";
import { observer } from "mobx-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
// import { Progress } from "@/components/ui/progress";

const dummyImages = [
  "https://cdn.midjourney.com/a70065b2-9c69-4189-a6fe-ae6ae6f449eb/0_0.png",
  "https://cdn.midjourney.com/201b09a7-2681-4e95-8efd-6b4843d31dc3/0_3.png",
];

const CreateProject = ({ trigger, showDialog, setShowDialog }) => {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { createProject } = MobxStore;

  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      const previewUrl = URL.createObjectURL(e.target.files[0]);
      setImagePreviewUrl(previewUrl);
    }
  };

  useEffect(() => {
    // Clean up
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleSubmit = async () => {
    setUploading(true);

    try {
      await createProject({
        name: projectName,
        description: projectDescription,
        imageFile: image,
      });

      setProjectName("");
      setProjectDescription("");
      setImage(null);
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setUploading(false);
      setShowDialog(false);
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>Start a fun advanture</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Project Name"
            />

            <Input
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Project Description"
            />
            <input type="file" onChange={handleImageChange} />
            {imagePreviewUrl && (
              <img
                src={imagePreviewUrl}
                alt="Preview"
                style={{ width: "100px", height: "100px" }}
              />
            )}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setImagePreviewUrl(null);
              setShowDialog(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setShowDialog(false);
              handleSubmit();
            }}
          >
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const ProjectCard = ({
  project,
  isStarted = false,
  isMyProject = true,
}) => {
  return (
    <Card className="w-[200px] h-[320px] relative flex flex-col items-between justify-between">
      <div className="absolute top-[5px] right-[5px]">
        {project.isPublished ? (
          <Badge className="w-fit bg-green-400">Published</Badge>
        ) : (
          <Badge className="w-fit bg-yellow-400">In Progress</Badge>
        )}
      </div>
      <Image
        src={project.imageUrl || imgPlaceholder}
        alt="project"
        width={200}
        height={200}
        className="h-[200px] w-full object-cover rounded-lg"
      />
      {/* {isStarted && <Progress value={33} />} */}
      <div className="flex justify-center flex-col p-2">
        <div>{project.name}</div>
        <div className="text-xs text-gray-400">{project.description}</div>
        <div className="flex gap-2 pt-6">
          <Link href={`/project/play/${project.id}`} className="w-full">
            <Button className="p-2 h-8 w-full">
              {isStarted ? "Continue" : "Start"}
            </Button>
          </Link>
          {isMyProject && (
            <Link href={`/project/edit/${project.id}`}>
              <Button className="p-2 px-4 h-8" variant="outline">
                Edit
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
};

const StoryRpgPage = observer(() => {
  const { projects } = MobxStore;
  const [showDialog, setShowDialog] = useState(false);

  return (
    <div className="m-4 sm:m-8 flex flex-col">
      <TitleDescription
        title="Projects"
        description="Manage different projects."
      />

      <div className="flex flex-wrap gap-4">
        {projects.map((project, index) => (
          <ProjectCard project={project} key={index} />
        ))}
        <CreateProject
          showDialog={showDialog}
          setShowDialog={setShowDialog}
          trigger={
            <div className="cursor-pointer hover:bg-gray-100 rounded-lg border bg-card text-card-foreground shadow-sm p-4 w-[200px] h-auto flex flex-col justify-center items-center relative text-gray-400">
              <div className="flex items-center gap-1">
                <span className="text-2xl">+</span>Add
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
});

export default StoryRpgPage;
