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
import { Clock1, Layers3 } from "lucide-react";
// import { Progress } from "@/components/ui/progress";

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

const dummyData = {
  story: "This is a story",
  tags: ["Advanture", "Escape Room"],
  stats: {
    time: 30,
    pages: 60,
  },
};

export const ProjectDetailsDialog = ({
  project,
  isStarted,
  isMyProject,
  showDialog,
  setShowDialog,
}) => {
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button className="p-2 h-8 w-full">
          {isStarted ? "Continue" : "Start"}
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-hidden bg-[#25262F]">
        <div
          className={`absolute inset-0 bg-cover bg-center scale-125 blur`}
          style={{ backgroundImage: `url(${project.imageUrl})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#7970FF] to-transparent mix-blend-multiply"></div>
        <DialogHeader></DialogHeader>

        {/* <div className="relative overflow-hidden w-72 h-96 bg-[#7970FF]">
          <div
            className={`absolute inset-0  bg-cover bg-center scale-125 blur`}
            style={{ backgroundImage: `url(${project.imageUrl})` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#7970FF] to-transparent mix-blend-multiply"></div>
        </div> */}

        <div className="flex relative z-10">
          <Image
            src={project.imageUrl || imgPlaceholder}
            alt="project"
            width={200}
            height={200}
            className="mr-8 rounded-lg max-h-[200px]"
          />
          <div className="flex flex-col gap-4 bg-background p-4 rounded">
            <div className="text-3xl font-bold">{project.name}</div>

            <div className="flex gap-4">
              <div className="text-[#7970FF] flex gap-1 font-bold">
                <Clock1 /> {dummyData.stats.time} mins
              </div>
              <div className="text-[#BD47F4] flex gap-1 font-bold">
                <Layers3 /> {dummyData.stats.pages} pages
              </div>
            </div>

            <div className="text-xs text-gray-400">
              {dummyData.tags.map((tag, index) => (
                <Badge key={index} className="mr-2">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="text-[#7b7e9e] text-sm font-bold">
              {project.description} 
            </div>

            <Button>Play</Button>
          </div>
        </div>
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
          {/* <Link href={`/project/play/${project.id}`} className="w-full">
            <Button className="p-2 h-8 w-full">
              {isStarted ? "Continue" : "Start"}
            </Button>
          </Link> */}
          <ProjectDetailsDialog project={project} isStarted={isStarted} />
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
