"use client";
import MobxStore from "@/mobx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Cog, CogIcon, Plus } from "lucide-react";

import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { TitleDescription } from "@/reusable-ui/TitleDescription";
import { Switch } from "@/components/ui/switch";
import StoryPage from "../../play/[id]/page";

const PROJECT_ENTITIES = [
  "Pages",
  "Items",
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
      <div>
        <div className="flex gap-2">
          <Button onClick={handleSubmit}>
            {project ? "Save Project" : "Create Project"}
          </Button>
          {project && (
            <Button
              variant="destructive"
              onClick={() => handleDelete(project.id)}
            >
              Delete Project
            </Button>
          )}
        </div>
      </div>
      <div className="mb-2">
        <img className="w-40 mb-6" src={project.imageUrl} alt="project" />
        <Label>Project Name</Label>
        <Input
          value={projectName}
          className="w-fit"
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project Name"
        />
      </div>
      <div className="mb-2">
        <Label>Description</Label>
        <Textarea
          value={projectDescription}
          className="text-sm h-fit"
          onChange={(e) => setProjectDescription(e.target.value)}
          placeholder="Project Description"
        />
      </div>
      <div className="mb-4 flex gap-2 items-center">
        <Label>Is Published?</Label>
        <Switch
          checked={isPublished}
          onCheckedChange={() => setIsPublished(!isPublished)}
        />
      </div>
    </div>
  );
};

const AddPageModal = ({ projectId, pagesLength }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [page, setPage] = useState(pagesLength + 1);
  const [description, setDescription] = useState("");

  const onSubmit = async () => {
    const pageData = { name, page, description };
    await MobxStore.createPage(projectId, pageData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full max-w-[400px]">+ Add Page</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Page</DialogTitle>
          <DialogDescription>Manage page details</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            type="text"
            onChange={(e) => setName(e.target.value)}
            value={name}
            placeholder="Name"
            className="w-full"
          />
          <Input
            type="number"
            onChange={(e) => setPage(e.target.value)}
            value={page}
            placeholder="Number"
            className="w-full"
          />
          <Input
            type="text"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            placeholder="Description"
            className="w-full"
          />

          <Button className="w-full" onClick={onSubmit}>
            Create Page
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const EditItemModal = ({ item, projectId, trigger }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>Manage item details</DialogDescription>
        </DialogHeader>

        <ItemForm
          existingItem={item}
          projectId={projectId}
          setShowDialog={setOpen}
        />
      </DialogContent>
    </Dialog>
  );
};

const EditStatModal = ({ stat, projectId, trigger }) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Stat</DialogTitle>
          <DialogDescription>Manage Stat details</DialogDescription>
        </DialogHeader>

        <StatForm
          existingStat={stat}
          projectId={projectId}
          setShowDialog={setOpen}
        />
      </DialogContent>
    </Dialog>
  );
};

const Item = ({ item, projectId }) => {
  return (
    <Card className="p-4 min-h-[100px] w-[200px] flex flex-col gap-2 justify-between">
      <div>
        <Image src={item.imageUrl} alt="item" width={100} height={100} />
        <div className="text-lg font-bold mt-2">{item.name}</div>
        <div className="text-sm">{item.description}</div>
      </div>

      <EditItemModal item={item} projectId={projectId} />
    </Card>
  );
};

const Stat = ({ stat, projectId }) => {
  return (
    <Card className="p-4 min-h-[100px] w-[200px] flex flex-col gap-2 justify-between">
      <div>
        <Image src={stat.imageUrl} alt="item" width={100} height={100} />
        <div className="text-lg font-bold mt-2">{stat.name}</div>
        <div className="text-sm">{stat.description}</div>
      </div>

      <EditStatModal stat={stat} projectId={projectId} />
    </Card>
  );
};

const StatForm = ({ existingStat, projectId, setShowDialog }) => {
  const { createStatWithImage, updateStatWithImage, deleteStat } = MobxStore;
  const [name, setName] = useState(existingStat ? existingStat.name : "");
  const [description, setDescription] = useState(
    existingStat ? existingStat.description : ""
  );
  const [image, setImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(
    existingStat ? existingStat.imageUrl : null
  );

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const statData = { name, description };

    if (existingStat) {
      await updateStatWithImage(existingStat, projectId, statData, image);
    } else {
      await createStatWithImage(projectId, statData, image);
    }
  };

  const handleDelete = async () => {
    if (existingStat) {
      await deleteStat(existingStat.id, existingStat.imageUrl);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {imagePreviewUrl && (
        <img
          src={imagePreviewUrl}
          alt="Preview"
          style={{ width: "100px", height: "100px" }}
        />
      )}

      <Input
        type="file"
        className="cursor-pointer"
        onChange={handleImageChange}
      />

      <Label>Name</Label>
      <Input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Stat Name"
      />
      <Label>Description</Label>
      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />
      <div className="flex justify-end gap-2">
        {existingStat && (
          <Button variant="destructive" type="button" onClick={handleDelete}>
            Delete
          </Button>
        )}

        <Button
          variant="outline"
          type="button"
          onClick={() => setShowDialog(false)}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          className="content-fit"
          onClick={() => setShowDialog(false)}
        >
          Save
        </Button>
      </div>
    </form>
  );
};

const ItemForm = ({ existingItem, projectId, setShowDialog }) => {
  const { createItemWithImage, updateItemWithImage, deleteItem } = MobxStore;
  const [name, setName] = useState(existingItem ? existingItem.name : "");
  const [description, setDescription] = useState(
    existingItem ? existingItem.description : ""
  );
  const [image, setImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(
    existingItem ? existingItem.imageUrl : null
  );

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const itemData = { name, description };

    if (existingItem) {
      await updateItemWithImage(existingItem, projectId, itemData, image);
    } else {
      await createItemWithImage(projectId, itemData, image);
    }
  };

  const handleDelete = async () => {
    if (existingItem) {
      console.log({ existingItem });
      await deleteItem(existingItem.id, existingItem.imageUrl);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {imagePreviewUrl && (
        <img
          src={imagePreviewUrl}
          alt="Preview"
          style={{ width: "100px", height: "100px" }}
        />
      )}
      <Input
        type="file"
        className="cursor-pointer"
        onChange={handleImageChange}
      />

      <Label>Name</Label>
      <Input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Item Name"
      />
      <Label>Description</Label>
      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />
      <div className="flex justify-end gap-2">
        {existingItem && (
          <Button variant="destructive" type="button" onClick={handleDelete}>
            Delete
          </Button>
        )}

        <Button
          variant="outline"
          type="button"
          onClick={() => setShowDialog(false)}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          className="content-fit"
          onClick={() => setShowDialog(false)}
        >
          Save
        </Button>
      </div>
    </form>
  );
};

const EditProject = observer(({ params }) => {
  const { projects, items, stats, pages, setActivePage } = MobxStore;
  const projectId = params.id;

  const projectFromState = projects?.find((p) => p.id === projectId);

  const [project, setProject] = useState(projectFromState);

  useEffect(() => {
    setProject(projectFromState);
  }, [projectFromState]);

  useEffect(() => {
    if (projectId) {
      MobxStore.fetchItems(projectId);
      MobxStore.fetchStats(projectId);
      MobxStore.fetchPages(projectId);
    }
  }, [projectId]);

  const [view, setView] = useState("project");

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="m-4 sm:mx-8">
      {view == "project" && (
        <div>
          <Button
            className="mb-4 gap-1"
            variant="outline"
            onClick={() => {
              window.history.back();
            }}
          >
            <ChevronLeft /> Back
          </Button>
          <TitleDescription
            title="Project"
            description="Manage project details"
          />
          <EditProjectBasics project={project} />
          <div className="flex flex-wrap gap-4">
            {PROJECT_ENTITIES.map((e, i) => (
              <Card
                className="p-4 h-28 w-64 text-2xl flex justify-between cursor-pointer"
                onClick={() => setView(e.toLowerCase())}
                key={i}
              >
                <div className="flex flex-col gap-2">
                  <div>{e}</div>
                  <div className="text-4xl">
                    {e == "Items" && items?.length}
                    {e == "Stats" && stats?.length}
                    {e == "Pages" && pages?.length}
                  </div>
                </div>
                <div className="">
                  <ChevronRight />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {view == "page-details" && (
        <StoryPage projectId={projectId} onBack={() => setView("pages")} />
      )}

      {view == "pages" && (
        <div>
          <Button
            className="mb-4 gap-1"
            variant="outline"
            onClick={() => {
              setView("project");
            }}
          >
            <ChevronLeft /> Back
          </Button>
          <TitleDescription title="Pages" description="Create & Edit Pages" />
          <div className="flex flex-col gap-2 mb-4">
            {pages
              ?.slice()
              .sort((a, b) => parseInt(a.page) - parseInt(b.page))
              .map((page, i) => (
                <Card
                  key={i}
                  className="p-4 w-[400px] cursor-pointer"
                  onClick={() => {
                    setView("page-details");
                    setActivePage(page.page);
                  }}
                >
                  <div className="text-lg font-bold">
                    <span className="text-xl">{page.page}.</span> {page.name}
                  </div>
                </Card>
              ))}
          </div>
          <AddPageModal projectId={projectId} pagesLength={pages.length} />
        </div>
      )}

      {view == "items" && (
        <div className="flex flex-col gap-4">
          <Button
            className="gap-1 w-fit"
            variant="outline"
            onClick={() => {
              setView("project");
            }}
          >
            <ChevronLeft /> Back
          </Button>

          <TitleDescription
            title="Items"
            description="Manage items for the project"
          />

          <div className="flex flex-wrap gap-4">
            {items?.map((item, i) => (
              <Item item={item} projectId={projectId} key={i} />
            ))}
            <EditItemModal
              item={null}
              projectId={projectId}
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
      )}

      {view == "stats" && (
        <div className="flex flex-col gap-4">
          <Button
            className="gap-1 w-fit"
            variant="outline"
            onClick={() => {
              setView("project");
            }}
          >
            <ChevronLeft /> Back
          </Button>

          <TitleDescription
            title="Stats"
            description="Manage stats for the project"
          />

          <div className="flex flex-wrap gap-4">
            {stats?.map((stat, i) => (
              <Stat stat={stat} projectId={projectId} key={i} />
            ))}
            <EditStatModal
              stat={null}
              projectId={projectId}
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
      )}
    </div>
  );
});
export default EditProject;
