"use client";
import MobxStore from "@/mobx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Cog,
  CogIcon,
  DollarSign,
  Plus,
  PlusCircle,
  SquareSlashIcon,
  User,
} from "lucide-react";

import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaCarCrash, FaCompressArrowsAlt } from "react-icons/fa";
import { AnalysisCharts, dummyAnalytics } from "../analytics";

import imgPlaceholder from "@/assets/placeholder.png";
import bookIcon from "../../../../assets/bookIcon.png";

const PROJECT_ENTITIES = [
  {
    title: "Pages",
    description: "Create & Edit Pages",
    icon: <ChevronRight size={16} />,
  },

  {
    title: "Stats",
    description: "Manage stats for the project",
    icon: <ChevronRight size={16} />,
  },
  {
    title: "Items",
    description: "Manage items for the project",
    icon: <ChevronRight size={16} />,
  },

  // "Characters",
  // "Quests",
];

const ANALYTICS_ENTITIES = [
  {
    title: "Users",
    icon: <User size={16} />,
    description: "Unique users who have played the game",
    value: 145,
    deepData: dummyAnalytics(),
  },
  {
    title: "Sessions",
    icon: <SquareSlashIcon size={16} />,
    description: "Total number of game sessions",
    value: 400,
    deepData: dummyAnalytics(),
  },
  {
    title: "Walkthroughs",
    icon: <PlusCircle size={16} />,
    description: "Total number of walkthroughs",
    value: 670,
    deepData: dummyAnalytics(),
  },
  {
    title: "Revenue",
    icon: <DollarSign size={16} />,
    description: "Total revenue generated",
    value: "$3,200",
    deepData: dummyAnalytics(),
  },
  {
    title: "Game Losses",
    icon: <FaCarCrash size={16} />,
    description: "Total game losses",
    value: 212,
    deepData: dummyAnalytics(),
  },
  {
    title: "Completed Runs",
    icon: <FaCompressArrowsAlt size={16} />,
    description: "Total completed runs",
    value: 98,
    deepData: dummyAnalytics(),
  },
];

const EditProjectBasics = observer(({ project }) => {
  const [projectName, setProjectName] = useState(project?.name || "");
  const [projectDescription, setProjectDescription] = useState(
    project?.description || ""
  );
  const [isPublished, setIsPublished] = useState(project?.isPublished || false);
  const { createProject, updateProject, deleteProject } = MobxStore;

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(
    project?.imageUrl || ""
  );

  const [isUploading, setIsUploading] = useState(false);
  const [uploadButtonDisabled, setUploadButtonDisabled] = useState(true);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setUploadButtonDisabled(false); // Enable the upload button

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const uploadAvatar = async () => {
    await MobxStore.uploadProjectAvatar(project.id, avatarFile);
    // Reset the avatar file state after upload
    setAvatarFile(null);
  };

  const removeAvatar = async () => {
    await MobxStore.removeProjectAvatar(project.id, project.imgFileName);
    setAvatarPreviewUrl(""); // Reset the preview URL
  };

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
    <div className="flex flex-col gap-4 mb-4 max-w-[400px]">
      <div className="mb-2">
        <div className="mb-4">
          <Image
            src={avatarPreviewUrl || imgPlaceholder}
            alt="Avatar preview"
            width={150}
            height={150}
            className="mb-4"
          />

          {isUploading && (
            <>
              <Input type="file" onChange={handleAvatarChange} className="" />
              <Button
                onClick={() => {
                  uploadAvatar();
                  setIsUploading(false); // Reset uploading state after initiating upload
                  setUploadButtonDisabled(true); // Disable the button again
                }}
                variant="outline"
                disabled={uploadButtonDisabled}
              >
                Upload Image
              </Button>
            </>
          )}

          {!isUploading &&
            (project?.imageUrl ? (
              <Button variant="outline" onClick={removeAvatar} className="">
                Remove Image
              </Button>
            ) : (
              <Button
                onClick={() => setIsUploading(true)}
                variant="outline"
                disabled={isUploading}
              >
                Add Image
              </Button>
            ))}
        </div>
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

      <Button onClick={handleSubmit}>Save Project</Button>

      <div className="flex flex-col gap-4 max-w-[400px] mt-6">
        <Label>Export Options:</Label>
        <Button>Export to PDF</Button>
        <Button>Export to Deck of Cards</Button>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Danger Zone</Label>
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
  );
});

export const AddPageModal = ({
  projectId,
  pagesLength,
  specificPage,
  trigger,
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [page, setPage] = useState(specificPage || pagesLength + 1);
  const [description, setDescription] = useState("");

  const onSubmit = async () => {
    const pageData = { name, page, description };
    await MobxStore.createPage(projectId, pageData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button className="w-full max-w-[400px]">+ Add Page</Button>
        )}
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
            type="text"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            placeholder="Description"
            className="w-full"
          />

          <Input
            type="number"
            onChange={(e) => setPage(e.target.value)}
            value={page}
            placeholder="Number"
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
        <div className="text-sm">
          Value: <span className="text-md font-bold">{stat.value}</span>
        </div>
        <div className="text-sm mt-1">Effect: {stat.description}</div>
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
  const [value, setValue] = useState(existingStat ? existingStat.value : 0);
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
    const statData = { name, description, value };

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
      <Label>Value</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => setValue(parseInt(e.target.value))}
        placeholder="10"
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

const BuildView = ({ items, stats, pages, setView }) => {
  return (
    <div className="flex flex-col gap-4 mt-6">
      {PROJECT_ENTITIES.map((e, i) => (
        <Card
          key={i}
          onClick={() => setView(e.title.toLowerCase())}
          className="cursor-pointer max-w-[400px]"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">{e.title}</CardTitle>
            {e.icon}
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{e.description}</p>
            <div className="text-2xl font-bold mt-2 flex justify-between">
              <div>
                {e.title == "Items" && items?.length}
                {e.title == "Stats" && stats?.length}
                {e.title == "Pages" && pages?.length}
              </div>
            </div>
            <div className="flex gap-2">
              {e.title == "Items" && (
                <div className="flex gap-2">
                  {items.slice(0, 4).map((i) => (
                    <Image
                      key={i.id}
                      src={i.imageUrl || imgPlaceholder}
                      alt="item"
                      width={25}
                      height={25}
                    />
                  ))}
                  {items.length > 4 && (
                    <div className="text-sm text-muted-foreground mt-2">
                      +{items.length - 4} more
                    </div>
                  )}
                </div>
              )}
              {e.title == "Stats" && (
                <div className="flex gap-2">
                  {stats.slice(0, 4).map((i) => (
                    <Image
                      key={i.id}
                      src={i.imageUrl || imgPlaceholder}
                      alt="item"
                      width={25}
                      height={25}
                    />
                  ))}
                  {stats.length > 4 && (
                    <div className="text-sm text-muted-foreground mt-2">
                      +{stats.length - 4} more
                    </div>
                  )}
                </div>
              )}
              {e.title == "Pages" && (
                <div className="flex gap-2">
                  {pages.slice(0, 4).map((i) => (
                    <Image
                      key={i.id}
                      src={i.img || imgPlaceholder}
                      alt="item"
                      width={25}
                      height={25}
                    />
                  ))}
                  {pages.length > 4 && (
                    <div className="text-sm text-muted-foreground mt-2">
                      +{pages.length - 4} more
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const VanillaOption = ({ page, label, onClick }) => {
  return (
    <div
      className="flex flex-col border relative cursor-pointer w-full"
      onClick={onClick}
    >
      <div className="flex  rounded items-center justify-between h-full">
        <div className="bg-yellow-200 w-6 h-full min-h-[60px]"></div>
        <div className="flex w-full pl-2 text-md">{label}</div>

        <div className="flex gap-1 bg-yellow-200 w-24 justify-center items-center px-2 min-h-[60px] font-bold h-full">
          <Image src={bookIcon} alt="icon" height={20} width={20} />
          <div className="text-black">{page}</div>
        </div>
      </div>
    </div>
  );
};

const EditProject = observer(({ params }) => {
  const {
    projects,
    items,
    stats,
    pages,
    setActivePage,
    findMissingPagesFromOptions,
  } = MobxStore;
  const projectId = params.id;

  const projectFromState = projects?.find((p) => p.id === projectId);

  const [project, setProject] = useState(projectFromState);

  const [selectedAnalysis, setSelectedAnalysis] = useState("users");

  const chartData = ANALYTICS_ENTITIES.find(
    (e) => e.title.toLowerCase() == selectedAnalysis
  ).deepData;

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

  const missingPages = findMissingPagesFromOptions();
  const [viewMissingPages, setViewMissingPages] = useState(false);

  const [view, setView] = useState("project");

  if (!project) {
    return <div>Loading...</div>;
  }

  const sortedPages = pages
    ?.slice()
    .sort((a, b) => parseInt(a.page) - parseInt(b.page));
  const minPage = parseInt(sortedPages[0]?.page);
  const maxPage = parseInt(sortedPages[sortedPages.length - 1]?.page);

  const completePages = [];
  for (let pageNum = minPage; pageNum <= maxPage; pageNum++) {
    const existingPage = sortedPages.find((p) => parseInt(p.page) === pageNum);

    if (existingPage) {
      completePages.push({
        type: "page",
        content: existingPage,
      });
    } else {
      completePages.push({
        type: "placeholder",
        page: pageNum,
      });
    }
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
          <Image
            src={project.imageUrl || imgPlaceholder}
            alt="project"
            width={100}
            height={100}
            className="mb-1 rounded"
          />
          <TitleDescription
            title={project.name}
            description="Manage project details"
          />

          <Tabs defaultValue="build">
            <TabsList>
              <TabsTrigger value="build">Build</TabsTrigger>
              {/* <TabsTrigger value="promote">Promote</TabsTrigger> */}
              <TabsTrigger value="analytics">Analyse</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="build">
              <BuildView
                items={items}
                stats={stats}
                pages={pages}
                setView={setView}
              />
            </TabsContent>
            {/* <TabsContent value="promote"></TabsContent> */}
            <TabsContent value="analytics">
              <div className="mt-6 flex flex-wrap gap-2">
                {ANALYTICS_ENTITIES.map((e, i) => (
                  <Card
                    key={i}
                    className={`w-64 cursor-pointer ${
                      e.title.toLowerCase() == selectedAnalysis
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-card-foreground"
                    }`}
                    onClick={() => setSelectedAnalysis(e.title.toLowerCase())}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {e.title}
                      </CardTitle>
                      {e.icon}
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{e.value}</div>
                      <p className="text-xs text-muted-foreground">
                        +20.1% from last month
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-4">
                <AnalysisCharts data={chartData} />
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <EditProjectBasics project={project} />
            </TabsContent>
          </Tabs>
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
            {missingPages.length > 0 && (
              <Card className="p-2 flex flex-col gap-2 bg-yellow-100 max-w-[400px]">
                <div
                  className="font-bold text-sm text-yellow-700 flex justify-between items-center cursor-pointer"
                  onClick={() => setViewMissingPages(!viewMissingPages)}
                >
                  <div>Some Pages are missing</div>
                  <div className="gap-1 flex">
                    {viewMissingPages ? "Hide" : "View"}
                    {viewMissingPages ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </div>
                {viewMissingPages && (
                  <div className="flex flex-col gap-2">
                    {missingPages?.map((mp, i) => (
                      <Card
                        key={i}
                        className="p-4 w-full flex items-center justify-between"
                      >
                        <VanillaOption
                          page={mp.missingPage}
                          label={mp.foundIn.option}
                          onClick={() => {
                            setView("page-details");
                            setActivePage(mp.foundIn.page);
                          }}
                        />
                        <div className="w-[75px]">
                          <AddPageModal
                            projectId={projectId}
                            pagesLength={mp.missingPage - 1}
                            trigger={
                              <div className="cursor-pointer text-blue-400 flex justify-center items-center">
                                + Add
                              </div>
                            }
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {completePages.map((item, index) => {
              if (item.type === "page") {
                const page = item.content;
                return (
                  <Card
                    key={index}
                    className="p-4 w-[400px] cursor-pointer flex items-center justify-between"
                    onClick={() => {
                      setView("page-details");
                      setActivePage(page.page);
                    }}
                  >
                    <div>
                      <div className="text-lg font-bold">
                        <span className="text-xl">{page.page}.</span>{" "}
                        {page.name}
                      </div>
                      <div className="text-sm">
                        Options: {page.options?.length || 0}
                      </div>
                    </div>
                    <Image
                      src={page.img || imgPlaceholder}
                      alt="page"
                      width={50}
                      height={50}
                      className="ml-2"
                    />
                  </Card>
                );
              } else {
                // For missing pages, render a button to add a new page
                return (
                  <Card key={index} className="p-4 w-[400px] my-2  text-center">
                    <AddPageModal
                      projectId={projectId}
                      specificPage={item.page}
                      trigger={
                        <div className="cursor-pointer text-sm text-blue-400 flex justify-center items-center">
                          + Add Page {item.page}
                        </div>
                      }
                    />
                  </Card>
                );
              }
            })}
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
