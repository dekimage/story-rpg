"use client";
import { ChevronLeft } from "lucide-react";

import bookIcon from "../../../../assets/bookIcon.png";
import lockIcon from "../../../../assets/lockIcon.png";
import imgPlaceholder from "@/assets/placeholder.png";

import Image from "next/image";
import MobxStore from "../../../../mobx";
import { observer } from "mobx-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Combobox } from "@/StoryComponents/ComboBox";
import { useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";

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
        <div className="text-md font-semibold">{stat.name}</div>
        <div className="text-4xl">{stat.value}</div>
      </div>
    ))}
  </div>
);

const Item = ({ item }) => (
  <div className="cursor-pointer">
    <Image src={item.img} alt="item" height={100} width={100} />
  </div>
);

const Option = ({
  option,
  unlocked,
  remainingUses,
  usageCount,
  index,
  isEditMode,
  updateProperty,
}) => {
  const {
    handleOptionClick,
    findItem,
    findStat,
    hasItem,
    meetsStatCondition,
    stats,
    items,
  } = MobxStore;
  const [showLock, setShowLock] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [isGiveStats, setIsGiveStats] = useState(option.gain_stat);

  const [isGiveItem, setIsGiveItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");

  const [isOptionHidden, setIsOptionHidden] = useState(false);
  const [requirementOption, setRequirementOption] = useState("");

  const isGainStat = option.isGiveStats || isGiveStats;

  const statsForCombobox = stats.map((stat) => ({
    label: stat.name,
    value: stat.id,
  }));

  const itemsForCombobox = items.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  return (
    <div
      className="flex flex-col border relative"
      onClick={() => {
        if (isEditMode) return;
        !unlocked && setShowLock(!showLock);
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
              className="flex w-full pl-2 text-md w-[44px]"
              value={option.page}
              onChange={(e) => updateProperty("page", e.target.value)}
            />
          )}
        </div>
      </div>

      <div className="flex">
        {option.locked && !unlocked && showLock && (
          <div className="py-2 border-top border-t w-full h-full flex items-center gap-2 ">
            <div className="text-xs ml-1">Requires:</div>
            {option.locked.map((lock, i) => {
              const item = lock.item && findItem(lock.item);
              const statName = lock.stat && findStat(lock.stat[0]).name;
              const itemConditionMet = item && hasItem(lock.item);
              const statConditionMet =
                lock.stat && meetsStatCondition(lock.stat);

              return (
                <div key={i} className="flex items-center gap-2 ">
                  {lock.item && (
                    <>
                      <Image
                        src={item.img}
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
                  )}

                  {lock.stat && (
                    <>
                      <span className="text-xs">
                        {statName}: {lock.stat.slice(1).join(" ")}
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
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isEditMode && (
        <div
          className="text-blue-500 hover:text-blue-200 transition cursor-pointer text-sm p-2"
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
        >
          {isSettingsOpen ? "Hide Settings" : "+ Add Settings"}
        </div>
      )}

      {isSettingsOpen && isEditMode && (
        <div className="flex flex-col gap-2 p-2">
          <SwitchWithHelper
            title="Adjust Player Stats"
            value={isGiveStats}
            callback={() => {
              // updateProperty("gain_stat", {});
              setIsGiveStats(!isGiveStats);
            }}
            helperChildren={"Auto play is..."}
          />
          {isGainStat && (
            <div className="gap-2 p-2 flex">
              <Combobox
                value={option?.gain_stat?.statId}
                setValue={(value) => updateProperty("gain_stat.statId", value)}
                searchLabel={"Search Stats"}
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
                value={option?.gain_stat?.value || 1}
                onChange={(e) =>
                  updateProperty("gain_stat.value", e.target.value)
                }
              />
            </div>
          )}

          <SwitchWithHelper
            title="Give Item"
            value={isGiveItem}
            callback={() => {
              // updateProperty("gain_item", null);
              setIsGiveItem(!isGiveItem);
            }}
            helperChildren={"Auto play is..."}
          />

          {isGiveItem && (
            <div className="gap-2 p-2 flex items-center">
              <div>Obtain Item: </div>
              <Combobox
                value={option?.gain_item}
                setValue={(value) => updateProperty("gain_item", value)}
                searchLabel={"Search Items"}
                options={itemsForCombobox}
              />
            </div>
          )}

          {/* <SwitchWithHelper
            title="Disable Page Link"
            value={option.isPageLinkDisabled}
            callback={() =>
              updateProperty("isPageLinkDisabled", !option.isPageLinkDisabled)
            }
            helperChildren={"Auto play is..."}
          /> */}

          <SwitchWithHelper
            title="Locked / Hidden"
            value={isOptionHidden}
            callback={() => setIsOptionHidden(!isOptionHidden)}
            helperChildren={"Auto play is..."}
          />

          {isOptionHidden && (
            <div className="gap-4 p-2 flex flex-col">
              <Combobox
                label="Option is"
                value={requirementOption}
                setValue={setRequirementOption}
                select
                options={[
                  { label: "Hidden", value: "hidden" },
                  { label: "Locked", value: "locked" },
                ]}
              />

              <Combobox
                label="Requirement"
                value={requirementOption}
                setValue={setRequirementOption}
                select
                options={[
                  { label: "Give Item", value: "give item" },
                  { label: "Have Item", value: "have item" },
                  { label: "Give Stat", value: "give stat" },
                  { label: "Have Stat", value: "have stat" },
                ]}
              />

              <div className="flex flex-col gap-4">
                {(requirementOption == "give item" ||
                  requirementOption == "have item") && (
                  <Combobox
                    value={requirementOption}
                    setValue={setRequirementOption}
                    searchLabel="Search Items"
                    options={[{ label: "Sword" }, { label: "Magic Hat" }]}
                  />
                )}
                {(requirementOption == "give stat" ||
                  requirementOption == "have stat") && (
                  <div className="gap-2 p-2 flex">
                    <Combobox
                      value={requirementOption}
                      setValue={setRequirementOption}
                      searchLabel="Search Stats"
                      options={[{ label: "Agility" }, { label: "Strength" }]}
                    />
                    <Combobox
                      value={requirementOption}
                      setValue={setRequirementOption}
                      select
                      options={[{ label: ">" }, { label: "<" }, { label: "=" }]}
                    />
                    <Input className="w-16" value={5} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Options = ({ options, setOptions, isEditMode, addOption }) => {
  const { isOptionUnlocked } = MobxStore;
  function updateNestedProperty(obj, path, value) {
    if (typeof path === "string") path = path.split(".");
    for (var i = 0; i < path.length - 1; i++) {
      obj = obj[path[i]] = obj[path[i]] || {};
    }
    obj[path[path.length - 1]] = value;
  }
  const updateOptionProperty = (index, propertyPath, value) => {
    const updatedOptions = options.map((option, optionIndex) => {
      if (optionIndex === index) {
        // Clone the option to maintain immutability
        const updatedOption = { ...option };
        // Update the property using the utility function
        updateNestedProperty(updatedOption, propertyPath, value);
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

        const unlocked = !option.locked || isOptionUnlocked(option.locked);
        const hidden = option.hidden && !isOptionUnlocked(option.hidden);

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
            updateProperty={(propertyPath, value) =>
              updateOptionProperty(index, propertyPath, value)
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

const StoryPage = observer(({ onBack }) => {
  const isEditPage = usePathname().includes("edit");
  const { activePage, inventory, stats, items } = MobxStore;

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

  const savePage = async () => {
    await MobxStore.updatePage(activePage.id, {
      page: editPage,
      name: editName,
      description: editDescription,
      options: editOptions,
    });
    setIsEditMode(false);
  };

  const addOption = () => {
    setEditOptions([...editOptions, { label: "", page: 0 }]);
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
            />
          </div>

          <div className="w-1/2 flex justify-center items-center relative">
            {img ? (
              <div>
                <Image src={img} alt="item" height={600} width={600} />

                {isEditMode && (
                  <Button
                    onClick={() => removeImage()}
                    variant="outline"
                    className="absolute top-5 left-5"
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
