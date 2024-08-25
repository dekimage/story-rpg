"use client";
import { ChevronDown, ChevronLeft, ChevronUp, Trash2 } from "lucide-react";

import bookIcon from "../../../../assets/bookIcon.png";
import lockIcon from "../../../../assets/lockIcon.png";
import imgPlaceholder from "@/assets/placeholder.png";

import Image from "next/image";
import MobxStore from "../../../../mobx";
import { observer } from "mobx-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Combobox } from "@/StoryComponents/ComboBox";
import { useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { toJS } from "mobx";
import { useRef } from "react";
import { AddPageModal } from "../../edit/[id]/page";
import { Label } from "@/components/ui/label";

const QuestionHelpBox = ({ children }) => {
  return (
    <Dialog>
      <DialogTrigger asChild className="w-2 h-6 ml-1">
        <Button variant="outline">?</Button>
      </DialogTrigger>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
};

const SwitchWithHelper = ({ helperChildren, title, value, callback }) => {
  return (
    <div className="flex items-center justify-between rounded">
      <div>
        <label className="mt-4 text-md font-medium">{title}</label>
        <QuestionHelpBox>{helperChildren}</QuestionHelpBox>
      </div>
      <Switch checked={value} onCheckedChange={() => callback()} />
    </div>
  );
};

const Stats = ({ stats }) => (
  <div className="flex gap-4 border-t p-4">
    {stats.map((stat, index) => (
      <div
        key={index}
        className="min-w-[100px] flex flex-col gap-1 items-center justify-center p-2 border  rounded-lg shadow"
      >
        <Image
          className="rounded"
          src={stat.imageUrl}
          alt="stat"
          height={50}
          width={50}
        />
        <div className="text-md font-semibold">{stat.name}</div>
        <div className="text-4xl">{stat.value}</div>
      </div>
    ))}
  </div>
);

const Item = ({ item }) => (
  <div className="cursor-pointer">
    <Image src={item.imageUrl} alt="item" height={100} width={100} />
  </div>
);

const Option = observer(
  ({
    option,
    unlocked,
    remainingUses,
    usageCount,
    index,
    isEditMode,
    updateProperty,
    onOptionRemove,
  }) => {
    const {
      handleOptionClick,
      findItem,
      findStat,
      hasItem,
      meetsStatCondition,
      stats,
      items,
      checkPageNumberExists,
      pages,
    } = MobxStore;

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isOptionLimited, setIsOptionLimited] = useState(option.uses);

    const statsForCombobox = stats.map((stat) => ({
      label: stat.name,
      value: stat.id,
    }));

    const itemsForCombobox = items.map((item) => ({
      label: item.name,
      value: item.id,
    }));

    const hasAnySettings =
      option.gain_item || option.gain_stat || option.uses || option.blocked;

    const numberOfSettings = [
      option.gain_item,
      option.gain_stat,
      option.uses,
      option.blocked,
    ].filter((setting) => setting).length;

    const pageExists = checkPageNumberExists(parseInt(option.page));
    const params = useParams();
    const projectId = params.id;

    return (
      <div
        className="flex flex-col border relative"
        onClick={() => {
          if (isEditMode) return;

          unlocked && handleOptionClick(option, index);
        }}
      >
        <div
          className={`flex  rounded items-center justify-between  transition duration-300 ease-in-out ${
            !unlocked ? "opacity-99" : "hover:shadow-lg cursor-pointer"
          }`}
        >
          {remainingUses != undefined && (
            <Badge className="absolute top-[-5px] right-[-5px] bg-green-300 px-1 rounded flex justify-center items-center font-bold">
              {remainingUses}/{usageCount + remainingUses}
            </Badge>
          )}

          <div className="bg-yellow-200 w-6 h-full min-h-[60px]"></div>
          {isEditMode ? (
            <Input
              className="flex w-full pl-2 text-md h-full"
              value={option.label}
              onChange={(e) => updateProperty("label", e.target.value)}
            />
          ) : (
            <div className="flex w-full pl-2 text-md">{option.label}</div>
          )}

          <div className="flex gap-1 bg-yellow-200 h-full w-24 justify-center items-center px-2 font-bold">
            <Image
              src={unlocked ? bookIcon : lockIcon}
              alt="icon"
              height={20}
              width={20}
            />
            <div className="text-black">
              {unlocked && !isEditMode && option.page}
            </div>
            {unlocked && isEditMode && (
              <Input
                type="number"
                className="flex w-full pl-2 text-md w-[44px] input-number-hide-arrows"
                value={option.page}
                onChange={(e) => updateProperty("page", e.target.value)}
              />
            )}
          </div>
        </div>

        <div className="flex">
          {option.blocked && !isEditMode && (
            <div className="py-2 border-top border-t w-full h-full flex items-center gap-2 ">
              <div className="text-xs ml-1">Requires:</div>
              {
                <div className="flex items-center gap-2">
                  {option.blocked.requirement.includes("item") &&
                    option.blocked.item && (
                      <>
                        {(() => {
                          const item = findItem(option.blocked.item);

                          const itemConditionMet =
                            item && hasItem(option.blocked.item);
                          return (
                            <>
                              <Image
                                src={item.imageUrl}
                                alt={item.name}
                                height={30}
                                width={30}
                              />
                              {/* Show checkmark if item condition is met */}
                              {itemConditionMet && (
                                <svg
                                  className="h-4 w-4 text-green-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </>
                          );
                        })()}
                      </>
                    )}
                  {
                    // Handling blocked stats
                    option.blocked.requirement.includes("stat") &&
                      option.blocked.stat && (
                        <>
                          {(() => {
                            const stat = findStat(option.blocked.stat.statId);
                            const statName = stat.name;
                            const statConditionMet = meetsStatCondition(
                              option.blocked
                            );
                            return (
                              <>
                                <span className="text-xs">
                                  {statName}: {option.blocked.stat.operation}{" "}
                                  {option.blocked.stat.value}
                                </span>
                                {/* Show checkmark if stat condition is met */}
                                {statConditionMet && (
                                  <svg
                                    className="h-4 w-4 text-green-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </>
                            );
                          })()}
                        </>
                      )
                  }
                </div>
              }
            </div>
          )}
        </div>

        {!pageExists && isEditMode && (
          <div className="flex items-center justify-between p-2">
            <div className="text-yellow-500 text-xs">
              Warning: page {option.page} does not exist
            </div>
            <div className="w-fit">
              <AddPageModal
                projectId={projectId}
                pagesLength={pages.length}
                trigger={
                  <div className="cursor-pointer text-sm text-blue-400 flex justify-center items-center">
                    + Add Page
                  </div>
                }
              />
            </div>
          </div>
        )}

        {isEditMode && (
          <div
            className="flex justify-between text-blue-500 hover:text-blue-200 transition cursor-pointer text-sm p-2"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          >
            <div>
              {isSettingsOpen
                ? "Hide Settings"
                : hasAnySettings
                ? `Edit Settings (${numberOfSettings})`
                : "+ Add Settings"}
            </div>
            <div>
              {isSettingsOpen ? (
                <ChevronUp />
              ) : (
                hasAnySettings && <ChevronDown />
              )}{" "}
            </div>
          </div>
        )}

        {isSettingsOpen && isEditMode && (
          <div className="flex flex-col gap-2 p-2">
            <SwitchWithHelper
              title="Adjust Player Stats"
              value={option.gain_stat}
              callback={() => {
                updateProperty(
                  "gain_stat",
                  option.gain_stat
                    ? false
                    : {
                        statId: statsForCombobox[0].value,
                        value: 1,
                        operation: "+",
                      }
                );
              }}
              helperChildren={"Auto play is..."}
            />
            {option.gain_stat && (
              <div className="gap-2 p-2 flex border-b pb-6">
                <Combobox
                  value={option?.gain_stat?.statId}
                  setValue={(value) =>
                    updateProperty("gain_stat.statId", value)
                  }
                  searchLabel={"Stats"}
                  options={statsForCombobox}
                />
                <Combobox
                  value={option?.gain_stat?.operation}
                  setValue={(value) =>
                    updateProperty("gain_stat.operation", value)
                  }
                  options={[
                    { label: "+", value: "+" },
                    { label: "-", value: "-" },
                  ]}
                  select
                />
                <Input
                  className="w-16"
                  type="number"
                  value={option?.gain_stat?.value}
                  onChange={(e) =>
                    updateProperty("gain_stat.value", parseInt(e.target.value))
                  }
                />
              </div>
            )}

            <SwitchWithHelper
              title="Give Item"
              value={!!option.gain_item}
              callback={() => {
                updateProperty(
                  "gain_item",
                  option.gain_item ? false : itemsForCombobox[0].value
                );
              }}
              helperChildren={"Auto play is..."}
            />

            {option.gain_item && (
              <div className="gap-2 p-2 flex items-center border-b pb-6">
                <div>Obtain Item: </div>
                <Combobox
                  value={option.gain_item || itemsForCombobox[0].value}
                  setValue={(value) => {
                    updateProperty("gain_item", value);
                  }}
                  searchLabel={"Items"}
                  options={itemsForCombobox}
                />
              </div>
            )}

            <SwitchWithHelper
              title="Limit Uses"
              value={isOptionLimited}
              callback={() => {
                updateProperty("uses", isOptionLimited ? false : 1);
                setIsOptionLimited(!isOptionLimited);
              }}
              helperChildren={
                "There is a limit to how many times this option can be used."
              }
            />

            {isOptionLimited && (
              <div className="border-b pb-6">
                <Input
                  type="number"
                  className="w-16"
                  value={option.uses}
                  onChange={(e) => updateProperty("uses", e.target.value)}
                />
              </div>
            )}

            <SwitchWithHelper
              title="Locked / Hidden"
              value={option.blocked}
              callback={() => {
                updateProperty(
                  "blocked",
                  option.blocked
                    ? false
                    : {
                        type: "locked",
                        requirement: "give item",
                        item: itemsForCombobox[0].value,
                      }
                );
              }}
              helperChildren={"Auto play is..."}
            />

            {option.blocked && (
              <div className="gap-4 p-2 flex flex-col">
                <Combobox
                  label="Option is"
                  value={option.blocked?.type}
                  setValue={(value) => {
                    updateProperty("blocked.type", value);
                  }}
                  select
                  options={[
                    { label: "Hidden", value: "hidden" },
                    { label: "Locked", value: "locked" },
                  ]}
                />

                <Combobox
                  label="Requirement"
                  value={option.blocked?.requirement}
                  setValue={(value) =>
                    // updateProperty("blocked.requirement", value)
                    {
                      if (value == "give item" || value == "have item") {
                        updateProperty([
                          { property: "blocked.requirement", value },
                          {
                            property: "blocked.item",
                            value: itemsForCombobox[0].value,
                          },
                          {
                            property: "blocked.stat",
                            value: false,
                          },
                        ]);
                      }
                      if (value == "give stat" || value == "have stat") {
                        updateProperty([
                          { property: "blocked.requirement", value },
                          {
                            property: "blocked.stat",
                            value: {
                              statId: statsForCombobox[0].value,
                              value: 1,
                              ...(value == "have stat" && { operation: ">" }),
                            },
                          },
                          {
                            property: "blocked.item",
                            value: false,
                          },
                        ]);
                      }
                    }
                  }
                  select
                  options={[
                    { label: "Give Item", value: "give item" },
                    { label: "Have Item", value: "have item" },
                    { label: "Give Stat", value: "give stat" },
                    { label: "Have Stat", value: "have stat" },
                  ]}
                />

                <div className="flex flex-col gap-4">
                  {(option.blocked?.requirement == "give item" ||
                    option.blocked?.requirement == "have item") && (
                    <Combobox
                      value={option.blocked?.item || itemsForCombobox[0].value}
                      setValue={(value) =>
                        updateProperty("blocked.item", value)
                      }
                      searchLabel="Items"
                      options={itemsForCombobox}
                    />
                  )}

                  {option.blocked?.requirement == "have stat" && (
                    <div className="gap-2 p-2 flex">
                      <Combobox
                        value={
                          option.blocked?.stat?.statId ||
                          statsForCombobox[0].value
                        }
                        setValue={(value) =>
                          updateProperty("blocked.stat.statId", value)
                        }
                        searchLabel="Stats"
                        options={statsForCombobox}
                      />
                      <Combobox
                        value={option.blocked?.stat?.operation || ">"}
                        setValue={(value) =>
                          updateProperty("blocked.stat.operation", value)
                        }
                        select
                        options={[
                          { label: ">", value: ">" },
                          { label: "<", value: "<" },
                          { label: "=", value: "=" },
                        ]}
                      />
                      <Input
                        className="w-16"
                        type="number"
                        value={option.blocked?.stat?.value}
                        onChange={(e) =>
                          updateProperty("blocked.stat.value", e.target.value)
                        }
                      />
                    </div>
                  )}

                  {option.blocked?.requirement == "give stat" && (
                    <div className="gap-2 p-2 flex">
                      <Combobox
                        value={
                          option.blocked?.stat?.statId ||
                          statsForCombobox[0].value
                        }
                        setValue={(value) =>
                          updateProperty("blocked.stat.statId", value)
                        }
                        searchLabel="Stats"
                        options={statsForCombobox}
                      />

                      <Input
                        className="w-16"
                        value={option.blocked?.stat?.value}
                        onChange={(e) =>
                          updateProperty("blocked.stat.value", e.target.value)
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {isEditMode && (
          <div className="text-xs text-red-400 p-2 flex justify-end">
            <div
              className="flex gap-1 cursor-pointer"
              onClick={() => onOptionRemove(index, option)}
            >
              <Trash2 size={14} /> Delete
            </div>
          </div>
        )}
      </div>
    );
  }
);

const Options = ({
  options,
  setOptions,
  isEditMode,
  addOption,
  onOptionRemove,
}) => {
  const { isOptionUnlocked } = MobxStore;

  function updateNestedProperty(obj, path, value) {
    if (typeof path === "string") path = path.split(".");
    for (var i = 0; i < path.length - 1; i++) {
      obj = obj[path[i]] = obj[path[i]] || {};
    }
    obj[path[path.length - 1]] = value;
  }

  const updateOptionProperties = (index, updatesOrProperty, value) => {
    // Convert single update to array format if the second argument is a string (property path)
    let updates = updatesOrProperty;
    if (typeof updatesOrProperty === "string") {
      updates = [{ property: updatesOrProperty, value: value }];
    }

    const updatedOptions = options.map((option, optionIndex) => {
      if (optionIndex === index) {
        // Clone the option to maintain immutability
        const updatedOption = { ...option };
        // Iterate through each update in the updates array
        updates.forEach((update) => {
          // Update the property using the utility function
          updateNestedProperty(updatedOption, update.property, update.value);
        });
        return updatedOption;
      }
      return option; // Return other options unchanged
    });

    setOptions(updatedOptions); // Update the state with the new options array
  };

  return (
    <div className="flex flex-col gap-8">
      {options?.map((option, index) => {
        const usageCount = MobxStore.getOptionUsage(index);
        const remainingUses = option.uses
          ? option.uses - usageCount
          : undefined;

        const unlocked = !isEditMode
          ? option.blocked?.type != "locked" || isOptionUnlocked(option.blocked)
          : true;
        const hidden = !isEditMode
          ? option.blocked?.type == "hidden" &&
            !isOptionUnlocked(option.blocked)
          : false;

        if (hidden) return null;

        return (
          <Option
            key={index}
            index={index}
            option={option}
            unlocked={unlocked}
            usageCount={usageCount}
            remainingUses={remainingUses}
            isEditMode={isEditMode}
            onOptionRemove={onOptionRemove}
            updateProperty={(propertyPath, value) =>
              updateOptionProperties(index, propertyPath, value)
            }
          />
        );
      })}

      {isEditMode && (
        <div className="flex flex-col gap-2 p-2">
          <Button className="w-fit" onClick={addOption}>
            + Add Option
          </Button>
        </div>
      )}
    </div>
  );
};

const MagicGenerateSettings = observer(({ setIsEditMode, closeDialog }) => {
  const params = useParams();
  const projectId = params.id;
  const [prompt, setPrompt] = useState("");
  const [withImage, setWithImage] = useState(true);
  const [optionsCount, setOptionsCount] = useState(2);
  const { loading, setLoading, magicGeneratePage, activePage } = MobxStore;

  const onGenerate = async () => {
    if (loading) return;
    setLoading(true);
    await magicGeneratePage(
      projectId,
      activePage.id,
      prompt,
      withImage,
      optionsCount
    );
    setWithImage(false);
    setPrompt("");
    setOptionsCount(2);
    setLoading(false);
    closeDialog();
    setIsEditMode(false);
  };
  return (
    <div className="flex flex-col gap-2">
      <Card className="p-4 flex flex-col gap-4">
        <CardTitle>1. Fill Missing Parts</CardTitle>
        <CardDescription>
          Magically generate only missing parts from this room using the context
          automatically.
        </CardDescription>
        <Button className="w-full" onClick={() => onGenerate()}>
          Generate Missing Details 💫
        </Button>
      </Card>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <Card className="p-4 flex flex-col gap-4">
        <CardTitle>2. Generate New Page</CardTitle>
        <CardDescription>
          Magically generate fresh new page using the context automatically.
          Warning, this will delete all existing content on this page.
        </CardDescription>
        <Button className="w-full" onClick={() => onGenerate()}>
          Generate New Page ✨
        </Button>
      </Card>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <Card className="p-4 flex flex-col gap-4">
        <CardTitle>3. Manually Generate Page</CardTitle>
        <CardDescription>
          Craft your own custom prompt and settings to generate a new page.
        </CardDescription>
        <Label>Custom Prompt</Label>
        <Textarea
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          placeholder="Prompt"
          className="w-full"
        />
        <Label>Number of Options</Label>
        <Input
          type="number"
          onChange={(e) => setOptionsCount(e.target.value)}
          value={optionsCount}
          placeholder="2"
          className="w-full"
        />
        <div className="flex justify-between">
          <Label>Generate Image</Label>
          <Switch
            checked={withImage}
            onCheckedChange={() => setWithImage(!withImage)}
          />
        </div>

        <Button className="w-full" onClick={() => onGenerate()}>
          {loading ? "Generating..." : "Generate Custom Page 🔮"}
        </Button>
      </Card>
    </div>
  );
});

const AiGenerateModal = observer(({ setIsEditMode }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline" type="button">
          Generate (AI)
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Magic Page</DialogTitle>
          <DialogDescription>Generate Page with AI</DialogDescription>
        </DialogHeader>
        <MagicGenerateSettings
          setIsEditMode={setIsEditMode}
          closeDialog={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
});

const DeletePageModal = observer(({ deletePage }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline" className="w-fit">
          Delete Page
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Page?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this page?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={deletePage}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

const StoryPage = observer(({ onBack }) => {
  const isEditPage = usePathname().includes("edit");
  const { activePage, inventory, stats, deleteOptionFromPage, pages } =
    MobxStore;

  const [isEditMode, setIsEditMode] = useState(isEditPage);

  const params = useParams();
  const projectId = params.id;

  const { name, description, options, page, img } = activePage;

  const [image, setImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(
    page ? page.img : null
  );

  const [editPage, setEditPage] = useState(page);
  const [editName, setEditName] = useState(name);
  const [editDescription, setEditDescription] = useState(description);
  const [editOptions, setEditOptions] = useState(options || []);

  const prevActivePageRef = useRef({ page, name, description, options });

  useEffect(() => {
    // if (isEditMode) return;

    const {
      page: prevPage,
      name: prevName,
      description: prevDescription,
      options: prevOptions,
    } = prevActivePageRef.current;

    if (page !== prevPage) setEditPage(page);
    if (name !== prevName) setEditName(name);
    if (description !== prevDescription) setEditDescription(description);
    if (JSON.stringify(options) !== JSON.stringify(prevOptions))
      setEditOptions(options || []);

    prevActivePageRef.current = { page, name, description, options };
  }, [page, name, description, options, isEditMode]);

  const savePage = async () => {
    const updatedOptions = editOptions.map((option) => {
      let optionWithoutLocalKey = { ...option };
      delete optionWithoutLocalKey.local;
      return optionWithoutLocalKey;
    });

    await MobxStore.updatePage(activePage.id, {
      page: editPage,
      name: editName,
      description: editDescription,
      // options: editOptions,
      options: updatedOptions,
    });
    setIsEditMode(false);
  };

  const addOption = () => {
    setEditOptions([
      ...editOptions,
      { label: "", page: pages.length + 1, local: true },
    ]);
  };

  const removeOption = (index) => {
    const updatedOptions = editOptions.filter((_, i) => i !== index);
    setEditOptions(updatedOptions);
  };

  const onOptionRemove = (index, option) => {
    if (option.local) {
      removeOption(index);
    } else {
      deleteOptionFromPage(activePage.id, index);
    }
  };

  useEffect(() => {
    if (projectId) {
      MobxStore.fetchStats(projectId);
      MobxStore.fetchItems(projectId);
      MobxStore.fetchPages(projectId);
    }
  }, [projectId]);

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

  const uploadImage = async () => {
    await MobxStore.uploadImageToPage(projectId, activePage.id, image);
  };

  const removeImage = async () => {
    await MobxStore.removeImageFromPage(
      projectId,
      activePage.id,
      activePage.imgFilename
    );
    setImage(null);
    setImagePreviewUrl(null);
  };

  const deletePage = async () => {
    await MobxStore.deletePage();
    onBack();
  };

  if (!activePage) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex gap-2  m-4 mx-8 justify-between">
        <div>
          <Button
            className="w-fit"
            variant="outline"
            onClick={() => {
              isEditPage && onBack && onBack();
              !isEditPage && window.history.back();
            }}
          >
            <ChevronLeft size={20} />
            Back
          </Button>
        </div>

        <div>
          {isEditPage &&
            (isEditMode ? (
              <div className="flex gap-2">
                <DeletePageModal deletePage={deletePage} />
                <AiGenerateModal setIsEditMode={setIsEditMode} />
                <Button
                  className="w-fit"
                  variant="outline"
                  onClick={() => setIsEditMode(!isEditMode)}
                >
                  Cancel
                </Button>
                <Button className="w-fit" onClick={savePage}>
                  Save
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditMode(!isEditMode)}>Edit</Button>
            ))}
        </div>
      </div>

      <Card className="m-8 flex flex-col m-0 mx-8">
        <div className="w-full h-full flex flex-grow">
          <div className="w-1/2 flex gap-4  p-8 flex flex-col">
            <div className="flex gap-2">
              <Image src={bookIcon} alt="book" height={32} width={38} />
              {isEditMode ? (
                <Input
                  type="number"
                  className="text-4xl flex gap-2 w-[100px]"
                  value={editPage}
                  onChange={(e) => setEditPage(e.target.value)}
                />
              ) : (
                <div className="text-4xl">{page}</div>
              )}
            </div>

            {isEditMode ? (
              <Input
                className="text-4xl flex gap-2"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            ) : (
              <div className="text-4xl flex gap-2">{name}</div>
            )}

            {isEditMode ? (
              <Textarea
                className="text-md h-auto"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            ) : (
              <div className="text-md">{description}</div>
            )}

            <Options
              options={editOptions}
              setOptions={setEditOptions}
              isEditMode={isEditMode}
              addOption={addOption}
              onOptionRemove={onOptionRemove}
            />
          </div>

          <div className="w-1/2 flex justify-center items-center">
            {img ? (
              <div className="relative">
                <Image src={img} alt="item" height={600} width={600} />

                {isEditMode && (
                  <Button
                    onClick={() => removeImage()}
                    variant="outline"
                    className="absolute top-5 right-5"
                  >
                    Remove Image
                  </Button>
                )}
              </div>
            ) : (
              <div className="relative">
                {imagePreviewUrl ? (
                  <Image
                    src={imagePreviewUrl}
                    alt="image preview"
                    height={600}
                    width={600}
                  />
                ) : (
                  <Image
                    src={imgPlaceholder}
                    alt="image placeholder"
                    height={600}
                    width={600}
                  />
                )}
                {image && isEditMode && (
                  <Button
                    onClick={uploadImage}
                    variant="outline"
                    className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-fit"
                  >
                    Upload Image
                  </Button>
                )}

                {isEditMode && (
                  <Input
                    type="file"
                    className="cursor-pointer"
                    onChange={handleImageChange}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {!isEditMode && (
          <>
            <Stats stats={stats} />
            <div className="w-full flex items-center border-t gap-2 p-4">
              {inventory.map((item, index) => (
                <Item key={index} item={item} />
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
});

export default StoryPage;
